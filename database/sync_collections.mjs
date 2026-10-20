import { MongoClient } from 'mongodb'

const client = new MongoClient('mongodb://localhost:27017')
const dbName = 'review_diadiem'

function collectComments(comments, review, parentCommentId = null, path = [], documents = []) {
  for (const [index, comment] of (comments ?? []).entries()) {
    const currentPath = [...path, index]
    const commentId = String(comment.id ?? comment.commentId ?? `${review.reviewId}:${currentPath.join('.')}`)
    const { traLoi, replies, ...fields } = comment

    documents.push({
      ...fields,
      _id: commentId,
      commentId,
      reviewId: review.reviewId,
      diaDiemId: review.diaDiemId,
      parentCommentId,
      cap: currentPath.length
    })
    collectComments(traLoi ?? replies, review, commentId, currentPath, documents)
  }

  return documents
}

function collectImages(places, reviews) {
  const documents = []

  for (const place of places) {
    for (const [index, url] of (place.hinhAnh ?? []).entries()) {
      documents.push({
        _id: `DIADIEM:${place._id}:${index}`,
        diaDiemId: place._id,
        chuThe: 'DIADIEM',
        thuTu: index,
        url
      })
    }
  }

  for (const review of reviews) {
    for (const [index, url] of (review.hinhAnh ?? []).entries()) {
      documents.push({
        _id: `DANHGIA:${review.reviewId}:${index}`,
        diaDiemId: review.diaDiemId,
        reviewId: review.reviewId,
        chuThe: 'DANHGIA',
        thuTu: index,
        url
      })
    }
  }

  return documents
}

async function syncDocuments(collection, documents) {
  if (documents.length > 0) {
    await collection.bulkWrite(
      documents.map(document => ({
        replaceOne: {
          filter: { _id: document._id },
          replacement: document,
          upsert: true
        }
      })),
      { ordered: true }
    )
  }

  const ids = documents.map(document => document._id)
  const filter = ids.length > 0 ? { _id: { $nin: ids } } : {}
  const result = await collection.deleteMany(filter)
  return result.deletedCount
}

try {
  await client.connect()
  const db = client.db(dbName)
  const places = await db.collection('diadiem').find({}).toArray()
  const reviewDocuments = []
  const commentDocuments = []

  for (const place of places) {
    for (const review of place.reviews ?? []) {
      const reviewId = String(review.reviewId ?? '')
      if (!reviewId) {
        throw new Error(`A review in place ${place._id} has no valid reviewId`)
      }

      const normalizedReview = {
        ...review,
        _id: reviewId,
        reviewId,
        diaDiemId: place._id
      }
      reviewDocuments.push(normalizedReview)
      commentDocuments.push(...collectComments(review.binhLuan ?? [], normalizedReview))
    }
  }

  const imageDocuments = collectImages(places, reviewDocuments)
  const reviews = db.collection('danhgia')
  const comments = db.collection('binhluan')
  const images = db.collection('hinhanh')
  const favorites = db.collection('yeuthich')

  await Promise.all([
    reviews.createIndex({ reviewId: 1 }, { unique: true, name: 'idx_danhgia_reviewId_unique' }),
    reviews.createIndex({ soSao: 1, diaDiemId: 1 }, { name: 'idx_danhgia_rating_place' }),
    reviews.createIndex({ diaDiemId: 1, soSao: 1 }, { name: 'idx_danhgia_place_rating' }),
    reviews.createIndex({ diaDiemId: 1 }, { name: 'idx_danhgia_place' }),
    comments.createIndex({ diaDiemId: 1, reviewId: 1 }, { name: 'idx_binhluan_place_review' }),
    comments.createIndex({ parentCommentId: 1 }, { name: 'idx_binhluan_parent' }),
    images.createIndex({ chuThe: 1, diaDiemId: 1 }, { name: 'idx_hinhanh_place' }),
    images.createIndex({ reviewId: 1 }, { name: 'idx_hinhanh_review' }),
    favorites.createIndex(
      { userId: 1, diaDiemId: 1 },
      { unique: true, name: 'idx_yeuthich_user_place_unique' }
    ),
    favorites.createIndex({ userId: 1, ngayTao: -1 }, { name: 'idx_yeuthich_user_date' }),
    favorites.createIndex({ diaDiemId: 1 }, { name: 'idx_yeuthich_place' })
  ])

  const [staleReviews, staleComments, staleImages] = await Promise.all([
    syncDocuments(reviews, reviewDocuments),
    syncDocuments(comments, commentDocuments),
    syncDocuments(images, imageDocuments)
  ])

  console.log(`[OK] danhgia: ${reviewDocuments.length} documents`)
  console.log(`[OK] binhluan: ${commentDocuments.length} documents`)
  console.log(`[OK] hinhanh: ${imageDocuments.length} documents`)
  console.log(`[OK] yeuthich: ${await favorites.countDocuments()} documents`)
  console.log(`[OK] Removed stale documents: ${staleReviews + staleComments + staleImages}`)
} catch (error) {
  console.error('[ERROR] Collection synchronization failed:', error.message)
  process.exitCode = 1
} finally {
  await client.close()
}

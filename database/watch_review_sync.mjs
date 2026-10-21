import { isDeepStrictEqual } from 'node:util'
import { MongoClient } from 'mongodb'

const client = new MongoClient('mongodb://localhost:27017')
const dbName = 'review_diadiem'

/** Làm phẳng bình luận lồng nhau thành từng document, giống sync_collections.mjs. */
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

/** Gom ảnh của địa điểm và của từng đánh giá, giống sync_collections.mjs. */
function collectImages(place, reviews) {
  const documents = []

  for (const [index, url] of (place.hinhAnh ?? []).entries()) {
    documents.push({
      _id: `DIADIEM:${place._id}:${index}`,
      diaDiemId: place._id,
      chuThe: 'DIADIEM',
      thuTu: index,
      url
    })
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

/** Đồng bộ một collection theo khoá _id: thêm/cập nhật tài liệu mới, xoá tài liệu đã không còn. */
async function syncCollection(collection, documents, scope) {
  const current = await collection.find(scope).toArray()
  const currentById = new Map(current.map(document => [document._id, document]))
  const operations = documents
    .filter(document => !isDeepStrictEqual(currentById.get(document._id), document))
    .map(document => ({
      replaceOne: {
        filter: { _id: document._id },
        replacement: document,
        upsert: true
      }
    }))

  if (operations.length > 0) {
    await collection.bulkWrite(operations, { ordered: true })
  }

  const staleIds = current
    .filter(document => !documents.some(expected => expected._id === document._id))
    .map(document => document._id)
  if (staleIds.length > 0) {
    await collection.deleteMany({ _id: { $in: staleIds } })
  }

  return { upsertedOrUpdated: operations.length, deleted: staleIds.length }
}

async function syncPlace(reviews, comments, images, place) {
  if (place.reviews != null && !Array.isArray(place.reviews)) {
    throw new Error(`Place ${place._id} has an invalid reviews field`)
  }

  const expectedReviews = (place.reviews ?? []).map(review => {
    const reviewId = String(review.reviewId ?? '')
    if (!reviewId) {
      throw new Error(`Place ${place._id} has a review without a valid reviewId`)
    }

    return {
      ...review,
      _id: reviewId,
      reviewId,
      diaDiemId: place._id
    }
  })

  const expectedById = new Map(expectedReviews.map(review => [review._id, review]))
  if (expectedById.size !== expectedReviews.length) {
    throw new Error(`Place ${place._id} contains duplicate reviewId values`)
  }

  const expectedComments = expectedReviews.flatMap(review => collectComments(review.binhLuan ?? [], review))
  const expectedImages = collectImages(place, expectedReviews)

  const reviewResult = await syncCollection(reviews, expectedReviews, { diaDiemId: place._id })
  const commentResult = await syncCollection(comments, expectedComments, { diaDiemId: place._id })
  const imageResult = await syncCollection(images, expectedImages, { diaDiemId: place._id })

  return {
    reviews: reviewResult.upsertedOrUpdated,
    comments: commentResult.upsertedOrUpdated,
    images: imageResult.upsertedOrUpdated,
    deleted: reviewResult.deleted + commentResult.deleted + imageResult.deleted
  }
}

try {
  await client.connect()
  const db = client.db(dbName)
  const places = db.collection('diadiem')
  const reviews = db.collection('danhgia')
  const comments = db.collection('binhluan')
  const images = db.collection('hinhanh')
  const changeStream = places.watch([], { fullDocument: 'updateLookup' })

  let initialCount = 0
  for await (const place of places.find({}, { projection: { _id: 1, reviews: 1, hinhAnh: 1 } })) {
    await syncPlace(reviews, comments, images, place)
    initialCount++
  }
  console.log(`[OK] Synchronized embedded reviews, comments and images for ${initialCount} places`)
  console.log(`[OK] Listening for changes on ${dbName}.diadiem`)

  for await (const change of changeStream) {
    const placeId = change.documentKey?._id
    if (placeId == null) {
      throw new Error(`Change event "${change.operationType}" has no place _id`)
    }

    if (change.operationType === 'delete') {
      const result = await reviews.deleteMany({ diaDiemId: placeId })
      await comments.deleteMany({ diaDiemId: placeId })
      await images.deleteMany({ diaDiemId: placeId })
      console.log(`[OK] Removed ${result.deletedCount} reviews for deleted place ${placeId}`)
      continue
    }

    if (!change.fullDocument) {
      throw new Error(`Change event "${change.operationType}" has no full place document`)
    }

    const result = await syncPlace(reviews, comments, images, change.fullDocument)
    if (result.reviews > 0 || result.comments > 0 || result.images > 0 || result.deleted > 0) {
      console.log(
        `[OK] ${placeId}: reviews=${result.reviews}, comments=${result.comments}, images=${result.images}, removed=${result.deleted}`
      )
    }
  }
} catch (error) {
  console.error('[ERROR] Review synchronization stopped:', error.message)
  process.exitCode = 1
} finally {
  await client.close();
}

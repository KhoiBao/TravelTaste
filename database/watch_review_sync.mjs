import { isDeepStrictEqual } from 'node:util'
import { MongoClient } from 'mongodb'

const client = new MongoClient('mongodb://localhost:27017')
const dbName = 'review_diadiem'

async function syncPlace(reviews, place) {
  if (place.reviews != null && !Array.isArray(place.reviews)) {
    throw new Error(`Place ${place._id} has an invalid reviews field`)
  }

  const expectedReviews = (place.reviews ?? []).map(review => {
    const reviewId = String(review.reviewId ?? '')
    if (!reviewId) {
      throw new Error(`A review in place ${place._id} has no valid reviewId`)
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

  const currentReviews = await reviews.find({ diaDiemId: place._id }).toArray()
  const currentById = new Map(currentReviews.map(review => [review._id, review]))
  const operations = expectedReviews
    .filter(review => !isDeepStrictEqual(currentById.get(review._id), review))
    .map(review => ({
      replaceOne: {
        filter: { _id: review._id },
        replacement: review,
        upsert: true
      }
    }))

  if (operations.length > 0) {
    await reviews.bulkWrite(operations, { ordered: true })
  }

  const staleIds = currentReviews
    .filter(review => !expectedById.has(review._id))
    .map(review => review._id)
  if (staleIds.length > 0) {
    await reviews.deleteMany({ _id: { $in: staleIds } })
  }

  return { upsertedOrUpdated: operations.length, deleted: staleIds.length }
}

try {
  await client.connect()
  const db = client.db(dbName)
  const places = db.collection('diadiem')
  const reviews = db.collection('danhgia')
  const changeStream = places.watch([], { fullDocument: 'updateLookup' })

  let initialCount = 0
  for await (const place of places.find({}, { projection: { _id: 1, reviews: 1 } })) {
    await syncPlace(reviews, place)
    initialCount++
  }
  console.log(`[OK] Synchronized embedded reviews for ${initialCount} places`)
  console.log(`[OK] Listening for changes on ${dbName}.diadiem`)

  for await (const change of changeStream) {
    const placeId = change.documentKey?._id
    if (placeId == null) {
      throw new Error(`Change event "${change.operationType}" has no place _id`)
    }

    if (change.operationType === 'delete') {
      const result = await reviews.deleteMany({ diaDiemId: placeId })
      console.log(`[OK] Removed ${result.deletedCount} reviews for deleted place ${placeId}`)
      continue
    }

    if (!change.fullDocument) {
      throw new Error(`Change event "${change.operationType}" has no full place document`)
    }

    const result = await syncPlace(reviews, change.fullDocument)
    if (result.upsertedOrUpdated > 0 || result.deleted > 0) {
      console.log(
        `[OK] ${placeId}: synchronized ${result.upsertedOrUpdated} reviews, removed ${result.deleted}`
      )
    }
  }
} catch (error) {
  console.error('[ERROR] Review synchronization stopped:', error.message)
  process.exitCode = 1
} finally {
  await client.close()
}

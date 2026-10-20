import { MongoClient } from 'mongodb'

const client = new MongoClient('mongodb://localhost:27017')
const dbName = 'review_diadiem'

async function recalculateRating(db, diaDiemId) {
  const [result] = await db.collection('danhgia').aggregate([
    { $match: { diaDiemId, soSao: { $gte: 1, $lte: 5 } } },
    {
      $group: {
        _id: null,
        ratingAvg: { $avg: '$soSao' },
        reviewCount: { $sum: 1 }
      }
    }
  ]).toArray()

  const ratingAvg = result ? Math.round(result.ratingAvg * 100) / 100 : 0
  const reviewCount = result?.reviewCount ?? 0
  const update = await db.collection('diadiem').updateOne(
    { _id: diaDiemId },
    { $set: { ratingAvg, reviewCount, ngayCapNhat: new Date() } }
  )

  if (update.matchedCount !== 1) {
    throw new Error(`Place ${diaDiemId} referenced by a review was not found`)
  }

  console.log(`[OK] ${diaDiemId}: ratingAvg=${ratingAvg}, reviewCount=${reviewCount}`)
}

function changedPlaceIds(change) {
  const documents = [change.fullDocument, change.fullDocumentBeforeChange].filter(Boolean)
  const ids = new Map()

  for (const document of documents) {
    if (!document.diaDiemId) {
      throw new Error(`Review ${document.reviewId ?? document._id} has no diaDiemId`)
    }
    ids.set(document.diaDiemId.toString(), document.diaDiemId)
  }

  if (ids.size === 0) {
    throw new Error(`Cannot determine the affected place for ${change.operationType} event`)
  }

  return [...ids.values()]
}

async function recalculateAll(db) {
  const places = await db.collection('diadiem').find({}, { projection: { _id: 1 } }).toArray()
  for (const place of places) {
    await recalculateRating(db, place._id)
  }
}

try {
  await client.connect()
  const db = client.db(dbName)
  const hello = await client.db('admin').command({ hello: 1 })
  if (!hello.setName || !hello.isWritablePrimary) {
    throw new Error('MongoDB is not an initialized, writable replica set; run npm run init-replica-set first')
  }

  const reviews = db.collection('danhgia')
  const changeStream = reviews.watch([], {
    fullDocument: 'updateLookup',
    fullDocumentBeforeChange: 'whenAvailable'
  })

  console.log(`[OK] Listening for changes on ${dbName}.danhgia`)
  await recalculateAll(db)

  for await (const change of changeStream) {
    for (const diaDiemId of changedPlaceIds(change)) {
      await recalculateRating(db, diaDiemId)
    }
  }
} catch (error) {
  console.error('[ERROR] Rating change stream stopped:', error.message)
  process.exitCode = 1
} finally {
  await client.close()
}

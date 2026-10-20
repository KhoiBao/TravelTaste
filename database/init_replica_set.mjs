import { MongoClient } from 'mongodb'

const client = new MongoClient('mongodb://localhost:27017', { serverSelectionTimeoutMS: 5000 })
const replicaSetName = 'traveltaste-rs'

try {
  await client.connect()
  const admin = client.db('admin')
  let hello = await admin.command({ hello: 1 })

  if (!hello.setName) {
    await admin.command({
      replSetInitiate: {
        _id: replicaSetName,
        members: [{ _id: 0, host: 'localhost:27017' }]
      }
    })
    console.log(`[OK] Initiated replica set "${replicaSetName}"`)
  } else if (hello.setName !== replicaSetName) {
    throw new Error(`MongoDB belongs to replica set "${hello.setName}", expected "${replicaSetName}"`)
  }

  const deadline = Date.now() + 30000
  while (Date.now() < deadline) {
    hello = await admin.command({ hello: 1 })
    if (hello.isWritablePrimary) break
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  if (!hello.isWritablePrimary) {
    throw new Error(`Replica set "${replicaSetName}" did not become PRIMARY within 30 seconds`)
  }

  const db = client.db('review_diadiem')
  const collections = await db.listCollections({ name: 'danhgia' }, { nameOnly: true }).toArray()
  if (collections.length === 0) {
    await db.createCollection('danhgia')
  }
  await db.command({
    collMod: 'danhgia',
    changeStreamPreAndPostImages: { enabled: true }
  })

  console.log('[OK] MongoDB replica set is PRIMARY')
  console.log('[OK] Pre/post images enabled for review delete/update events')
} catch (error) {
  console.error('[ERROR] Replica set initialization failed:', error.message)
  console.error('Ensure mongod.cfg includes replication.replSetName: traveltaste-rs and restart MongoDB first.')
  process.exitCode = 1
} finally {
  await client.close()
}

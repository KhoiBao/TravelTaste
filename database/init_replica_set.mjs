import { MongoClient } from 'mongodb'

const uri = 'mongodb://localhost:27017'
const replicaSetName = 'traveltaste-rs'

// Server vua khoi dong voi replication.replSetName nhung chua replSetInitiate se
// tra loi "Does not have a valid replica set config", nen driver mac dinh KHONG chon
// node nao (Server selection timed out). Phai ket noi directConnection de lenh
// replSetInitiate chay duoc, sau do moi ket noi binh thuong de dung change stream.
const bootstrap = new MongoClient(`${uri}/?directConnection=true`, { serverSelectionTimeoutMS: 10000 })
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 })

try {
  await bootstrap.connect()
  const bootstrapAdmin = bootstrap.db('admin')
  const bootstrapHello = await bootstrapAdmin.command({ hello: 1 })

  if (!bootstrapHello.setName) {
    await bootstrapAdmin.command({
      replSetInitiate: {
        _id: replicaSetName,
        members: [{ _id: 0, host: 'localhost:27017' }]
      }
    })
    console.log(`[OK] Initiated replica set "${replicaSetName}"`)
  } else if (bootstrapHello.setName !== replicaSetName) {
    throw new Error(`MongoDB belongs to replica set "${bootstrapHello.setName}", expected "${replicaSetName}"`)
  }
  await bootstrap.close()

  await client.connect()
  const admin = client.db('admin')
  let hello = await admin.command({ hello: 1 })

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
  await bootstrap.close().catch(() => {})
  await client.close().catch(() => {})
}

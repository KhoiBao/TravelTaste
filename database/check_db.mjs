// Kiểm tra trạng thái database TravelTaste
// Chạy: node check_db.mjs
import { MongoClient } from 'mongodb'

const URI = 'mongodb://localhost:27017'
const DB_NAME = 'review_diadiem'

const client = new MongoClient(URI)
try {
  await client.connect()
  console.log('[OK] Ket noi MongoDB thanh cong\n')

  const admin = client.db('admin')
  const databases = await admin.admin().listDatabases()
  console.log('=== DANH SACH DATABASE ===')
  databases.databases.forEach(d => console.log(`  - ${d.name}  (${d.sizeOnDisk} bytes)`))

  const db = client.db(DB_NAME)

  const collections = await db.listCollections().toArray()
  console.log(`\n=== COLLECTION TRONG "${DB_NAME}" ===`)
  if (collections.length === 0) {
    console.log('  (khong co collection nao)')
  } else {
    for (const c of collections) {
      const count = await db.collection(c.name).countDocuments()
      const indexes = await db.collection(c.name).indexes()
      console.log(`  - ${c.name}: ${count} documents, ${indexes.length} indexes`)
    }
  }

  for (const name of ['users', 'danhmuc', 'diadiem']) {
    const exists = collections.some(c => c.name === name)
    if (!exists) {
      console.log(`\n[THIEU] Collection "${name}" chua ton tai`)
      continue
    }
    const docs = await db.collection(name).find({}).limit(3).toArray()
    console.log(`\n--- ${name} (mau ${docs.length}/${await db.collection(name).countDocuments()}) ---`)
    docs.forEach(d => console.log('  ' + JSON.stringify(d).slice(0, 300)))
  }
} catch (e) {
  console.error('[LOI]', e.message)
} finally {
  await client.close()
}

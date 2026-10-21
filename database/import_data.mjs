import { readFile } from 'node:fs/promises'
import { BSON, MongoClient } from 'mongodb'

// Paths are relative to this script, independent of the terminal directory.
const collections = ['users', 'danhmuc', 'diadiem', 'danhgia', 'binhluan', 'hinhanh', 'yeuthich']
const uniqueFields = { users: ['username', 'email'], danhmuc: ['slug', 'ten'], diadiem: ['slug'] }
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
let client

try {
  if (args.some(arg => arg !== '--dry-run')) {
    throw new Error('Tham số không hợp lệ. Dùng: node import_data.mjs [--dry-run]')
  }

  // Read and validate every file before making any database changes.
  const datasets = []
  for (const name of collections) {
    const file = `${name}_bo_sung.json`
    const json = await readFile(new URL(`./data/${file}`, import.meta.url), 'utf8')
    const documents = BSON.EJSON.parse(json.replace(/^\uFEFF/, ''))
    if (!Array.isArray(documents)) throw new Error(`${file}: dữ liệu phải là mảng JSON`)
    const ids = new Set()
    for (const document of documents) {
      if (!document || typeof document !== 'object' || document._id == null) {
        throw new Error(`${file}: mỗi document phải có _id`)
      }
      const key = BSON.EJSON.stringify(document._id)
      if (ids.has(key)) throw new Error(`${file}: trùng _id ${key}`)
      ids.add(key)
    }
    datasets.push({ name, documents })
    console.log(`[OK] ${file}: ${documents.length} document`)
  }

  if (dryRun) {
    console.log('Kiểm tra file thành công. Chưa kết nối hoặc ghi vào MongoDB.')
  } else {
    client = new MongoClient('mongodb://localhost:27017', { serverSelectionTimeoutMS: 5000 })
    await client.connect()
    const db = client.db('review_diadiem')

    // Existing seed records can share natural keys but have different IDs.
    // Detect these conflicts before importing any collection; never delete them.
    for (const { name, documents } of datasets) {
      for (const field of uniqueFields[name] ?? []) {
        const incoming = new Map()
        for (const document of documents) {
          if (document[field] == null) continue
          if (incoming.has(document[field])) throw new Error(`${name}: trùng ${field} trong file`)
          incoming.set(document[field], BSON.EJSON.stringify(document._id))
        }
        const existing = await db.collection(name).find(
          { [field]: { $in: [...incoming.keys()] } },
          { projection: { _id: 1, [field]: 1 } }
        ).toArray()
        for (const document of existing) {
          if (incoming.get(document[field]) !== BSON.EJSON.stringify(document._id)) {
            throw new Error(`${name}: ${field}="${document[field]}" đã tồn tại với _id khác. Chưa import; hãy kiểm tra dữ liệu cũ, không đổi ID trong file tùy ý.`)
          }
        }
      }
    }

    for (const { name, documents } of datasets) {
      if (!documents.length) continue
      const result = await db.collection(name).bulkWrite(documents.map(document => ({
        replaceOne: { filter: { _id: document._id }, replacement: document, upsert: true }
      })), { ordered: true })
      console.log(`[${name}] Thêm: ${result.upsertedCount}; khớp _id: ${result.matchedCount}; thay đổi: ${result.modifiedCount}`)
    }
    console.log('Import hoàn tất vào review_diadiem. Các document ngoài bộ file được giữ nguyên.')
  }
} catch (error) {
  console.error('[LỖI]', error.message)
  console.error('Import dừng khi gặp lỗi. Nếu lỗi xảy ra lúc ghi, các document đã ghi trước đó vẫn được giữ; có thể chạy lại sau khi sửa lỗi.')
  process.exitCode = 1
} finally {
  await client?.close()
}

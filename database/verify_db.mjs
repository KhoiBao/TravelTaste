// Kiem tra cau truc du lieu sau khi seed + test text index + 2dsphere
import { MongoClient } from 'mongodb'

const client = new MongoClient('mongodb://localhost:27017')
const db = client.db('review_diadiem')

await client.connect()

// 1. Kiem tra 1 document day du
const dd = await db.collection('diadiem').findOne({ slug: 'pho-thin-lo-duc' })
console.log('=== 1. DOCUMENT "Phở Thìn Lò Đúc" ===')
console.log(JSON.stringify(dd, null, 2).slice(0, 2200))

// 2. Kiem tra review co binh luan 3 cap
console.log('\n=== 2. BINH LUAN LONG NHU 3 CAP ===')
const withComments = await db.collection('diadiem').findOne({ 'reviews.binhLuan.traLoi.traLoi': { $exists: true } })
if (withComments) {
  const r = withComments.reviews.find(x => x.binhLuan?.some(c => c.traLoi?.length))
  console.log('Dia diem:', withComments.ten)
  console.log('Review:', r.tieuDe)
  const c1 = r.binhLuan[0]
  console.log('  Cap 1 - ' + c1.tenUser + ': ' + c1.noiDung)
  c1.traLoi.forEach(c2 => {
    console.log('    Cap 2 - ' + c2.tenUser + ': ' + c2.noiDung)
    c2.traLoi.forEach(c3 => console.log('      Cap 3 - ' + c3.tenUser + ': ' + c3.noiDung))
  })
} else {
  console.log('!! Khong tim thay chuoi 3 cap')
}

// 3. Test TEXT INDEX: tim "pho" (khong dau) va "phở" (co dau)
console.log('\n=== 3. TEXT INDEX ===')
for (const kw of ['pho', 'phở', 'bun', 'hồ']) {
  const r = await db.collection('diadiem')
    .find({ $text: { $search: kw } }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(3).toArray()
  console.log(`  Tim "${kw}" -> ${r.length} ket qua: ${r.map(x => x.ten).join(' | ')}`)
}

// 4. Test 2dsphere
console.log('\n=== 4. GEO INDEX (2dsphere) ===')
const near = await db.collection('diadiem').aggregate([
  { $geoNear: { near: { type: 'Point', coordinates: [105.8342, 21.0285] }, distanceField: 'khoangCach', maxDistance: 5000, spherical: true } }
]).toArray()
near.slice(0, 4).forEach(x =>
  console.log(`  ${x.ten} - ${(x.khoangCach / 1000).toFixed(2)} km`))

// 5. Top 10 bang aggregation
console.log('\n=== 5. TOP 10 (diem noi bat Bayesian) ===')
const top = await db.collection('diadiem').aggregate([
  { $match: { trangThai: 'ACTIVE', reviewCount: { $gte: 3 } } },
  { $set: { diemNoiBat: { $divide: [{ $add: [{ $multiply: ['$ratingAvg', '$reviewCount'] }, 17.5] }, { $add: ['$reviewCount', 5] }] } } },
  { $sort: { diemNoiBat: -1 } }, { $limit: 5 }
]).toArray()
top.forEach((x, i) => console.log(`  ${i + 1}. ${x.ten} - ${x.ratingAvg}★ (${x.reviewCount} reviews) noiBat=${x.diemNoiBat.toFixed(2)}`))

// 6. Danh sách index
console.log('\n=== 6. INDEX ===')
for (const x of await db.collection('diadiem').indexes()) {
  console.log(`  ${x.name}  ${JSON.stringify(x.key)}`)
}

// 7. Kiem tra rating khop reviews
console.log('\n=== 7. TINH DUNG ratingAvg / reviewCount ===')
const all = await db.collection('diadiem').find({}).toArray()
let sai = 0
all.forEach(x => {
  const cnt = x.reviews?.length || 0
  const avg = cnt ? Math.round((x.reviews.reduce((s, r) => s + r.soSao, 0) / cnt) * 100) / 100 : 0
  if (cnt !== x.reviewCount || Math.abs(avg - x.ratingAvg) > 0.001) {
    console.log(`  SAI: ${x.ten} - luu ${x.ratingAvg}/${x.reviewCount} vs tinh ${avg}/${cnt}`)
    sai++
  }
})
console.log(sai === 0 ? '  OK - tat ca dia diem deu khop' : `  ${sai} document lech`)

await client.close()

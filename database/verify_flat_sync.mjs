// Kiểm tra app ghi thẳng sang các collection phẳng (danhgia/binhluan/hinhanh).
// Chạy trên môi trường kiểm thử riêng: backend 18080 + MongoDB 27028.
import assert from 'node:assert/strict'
import { MongoClient } from 'mongodb'

const apiBase = process.env.TEST_API_URL || 'http://127.0.0.1:18080'
const mongoUrl = process.env.TEST_MONGO_URL || 'mongodb://127.0.0.1:27028/traveltaste_integration'

function client() {
  let cookie = ''
  let csrf

  return async function call(method, url, data, expected = 200) {
    if (method !== 'GET' && !csrf) csrf = (await call('GET', '/api/auth/csrf')).data
    const headers = { Cookie: cookie }
    if (csrf && method !== 'GET') headers[csrf.headerName] = csrf.token
    if (data && !(data instanceof FormData)) headers['Content-Type'] = 'application/json'
    const response = await fetch(apiBase + url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    })
    const session = response.headers.getSetCookie().find(cookie => cookie.startsWith('JSESSIONID='))
    if (session) cookie = session.split(';')[0]
    const body = await response.json()
    assert.equal(response.status, expected, `${method} ${url}: ${JSON.stringify(body)}`)
    if (expected === 200) assert.equal(body.success, true, `${method} ${url}: ${body.message}`)
    return body
  }
}

const mongo = new MongoClient(mongoUrl)
await mongo.connect()
const db = mongo.db(mongoUrl.split('/').pop())

const admin = client()
const user = client()
const checks = []

async function waitFor(check, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const value = await check()
    if (value) return value
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  return null
}

try {
  await admin('POST', '/api/auth/login', { usernameOrEmail: process.env.TEST_ADMIN || 'integration_admin', password: process.env.TEST_PASSWORD || 'Integration123' })
  const username = `flat_${Date.now()}`
  await user('POST', '/api/auth/register', { username, hoTen: 'Flat Member', email: `${username}@example.test`, password: 'Integration123' })
  await user('POST', '/api/auth/login', { usernameOrEmail: username, password: 'Integration123' })

  const category = (await admin('POST', '/api/admin/danh-muc', { ten: 'Flat ' + Date.now(), trangThai: 'ACTIVE' })).data
  const placeBody = {
    ten: 'Flat Place ' + Date.now(),
    loai: 'AN_UONG',
    danhMucId: [category.id],
    moTa: 'Dia diem kiem tra dong bo collection phang.',
    diaChi: { duong: 'Duong thu', quan: 'Quan thu', thanhPho: 'Ha Noi' },
    viTri: { coordinates: [105.8342, 21.0285] },
    hinhAnh: ['/uploads/flat-place.png'],
    trangThai: 'ACTIVE'
  }
  const place = (await admin('POST', '/api/admin/dia-diem', placeBody)).data

  // 1. Tao review -> danhgia phai co review do.
  const reviewsUrl = '/api/dia-diem/' + place.id + '/reviews'
  const reviewBody = { soSao: 4, tieuDe: 'Flat review', noiDung: 'Noi dung danh gia cho kiem tra dong bo.', hinhAnh: ['/uploads/flat-review.png'] }
  const review = (await user('POST', reviewsUrl, reviewBody)).data.review

  const flatReview = await waitFor(async () => db.collection('danhgia').findOne({ reviewId: review.reviewId }))
  assert(flatReview, 'danhgia phai chua review vua tao')
  assert.equal(flatReview.soSao, 4)
  assert.equal(flatReview.tieuDe, 'Flat review')
  assert.equal(flatReview.diaDiemId.toString(), place.id)
  assert(Array.isArray(flatReview.binhLuan))
  checks.push('review -> danhgia')

  const flatImage = await waitFor(async () => db.collection('hinhanh').findOne({ _id: `DANHGIA:${review.reviewId}:0` }))
  assert(flatImage, 'hinhanh phai chua anh cua review')
  assert.equal(flatImage.url, '/uploads/flat-review.png')
  const placeImage = db.collection('hinhanh').findOne({ _id: `DIADIEM:${place.id}:0` })
  assert(placeImage, 'hinhanh phai chua anh cua dia diem')
  checks.push('anh -> hinhanh')

  // 2. Binh luan -> binhluan phai co, va danhgia.binhLuan phai cung cap nhat.
  const commentsUrl = reviewsUrl + '/' + review.reviewId + '/comments'
  const comment = (await user('POST', commentsUrl, { noiDung: 'Binh luan kiem tra' })).data.comment

  const flatComment = await waitFor(async () => db.collection('binhluan').findOne({ commentId: comment.commentId }))
  assert(flatComment, 'binhluan phai chua binh luan vua tao')
  assert.equal(flatComment.noiDung, 'Binh luan kiem tra')
  assert.equal(flatComment.reviewId, review.reviewId)
  assert.equal(flatComment.diaDiemId.toString(), place.id)
  assert.equal(flatComment.parentCommentId, null)
  assert.equal(flatComment.cap, 1)
  checks.push('binh luan -> binhluan')

  const syncedReview = await waitFor(async () => {
    const doc = await db.collection('danhgia').findOne({ reviewId: review.reviewId })
    return doc && doc.binhLuan && doc.binhLuan.some(item => item.commentId === comment.commentId) ? doc : null
  })
  assert(syncedReview, 'danhgia.binhLuan phai chua binh luan vua tao')
  checks.push('binh luan -> danhgia.binhLuan')

  // 3. Reply -> binhluan phai co cap 2 va tro ve cha.
  const reply = (await user('POST', commentsUrl + '/' + comment.commentId + '/replies', { noiDung: 'Tra loi kiem tra' })).data.comment
  const flatReply = await waitFor(async () => db.collection('binhluan').findOne({ commentId: reply.commentId }))
  assert(flatReply, 'binhluan phai chua tra loi')
  assert.equal(flatReply.parentCommentId, comment.commentId)
  assert.equal(flatReply.cap, 2)
  checks.push('tra loi -> binhluan cap 2')

  // 4. Like binh luan -> likedBy trong binhluan phai doi.
  await user('PUT', commentsUrl + '/' + comment.commentId + '/like')
  const liked = await waitFor(async () => {
    const doc = await db.collection('binhluan').findOne({ commentId: comment.commentId })
    return doc && doc.likedBy && doc.likedBy.length === 1 ? doc : null
  })
  assert(liked, 'binhluan.likedBy phai ghi nguoi thich')
  checks.push('thich binh luan -> binhluan.likedBy')

  // 5. Xoa binh luan -> binhluan phai mat, danhgia.binhLuan phai cap nhat.
  await user('DELETE', commentsUrl + '/' + comment.commentId)
  const removed = await waitFor(async () => {
    const doc = await db.collection('binhluan').findOne({ commentId: comment.commentId })
    return doc === null ? true : null
  })
  assert(removed, 'binh luan goc phai bi xoa khoi binhluan')
  const replyRemoved = await waitFor(async () => {
    const doc = await db.collection('binhluan').findOne({ commentId: reply.commentId })
    return doc === null ? true : null
  })
  assert(replyRemoved, 'tra loi phai bi xoa theo binh luan goc')
  checks.push('xoa binh luan -> xoa ca reply')

  // 6. Sua review -> danhgia phai doi.
  await user('PUT', reviewsUrl + '/' + review.reviewId, { ...reviewBody, soSao: 2, tieuDe: 'Flat review da sua' })
  const updated = await waitFor(async () => {
    const doc = await db.collection('danhgia').findOne({ reviewId: review.reviewId })
    return doc && doc.soSao === 2 && doc.tieuDe === 'Flat review da sua' ? doc : null
  })
  assert(updated, 'danhgia phai phan anh review da sua')
  checks.push('sua review -> danhgia')

  // 7. Xoa review -> danhgia va binhluan phai mat.
  await user('DELETE', reviewsUrl + '/' + review.reviewId)
  const reviewRemoved = await waitFor(async () => {
    const doc = await db.collection('danhgia').findOne({ reviewId: review.reviewId })
    return doc === null ? true : null
  })
  assert(reviewRemoved, 'review da xoa phai khong con trong danhgia')
  const imagesRemoved = await waitFor(async () => {
    const doc = await db.collection('hinhanh').findOne({ _id: `DANHGIA:${review.reviewId}:0` })
    return doc === null ? true : null
  })
  assert(imagesRemoved, 'anh cua review da xoa phai bi xoa khoi hinhanh')
  checks.push('xoa review -> danhgia + hinhanh')

  // 8. Xoa dia diem -> moi collection phai sach cho dia diem do.
  await admin('DELETE', '/api/admin/dia-diem/' + place.id)
  const placeCleaned = await waitFor(async () => {
    const reviews = await db.collection('danhgia').countDocuments({ diaDiemId: new (await import('mongodb')).ObjectId(place.id) })
    const comments = await db.collection('binhluan').countDocuments({ diaDiemId: new (await import('mongodb')).ObjectId(place.id) })
    const images = await db.collection('hinhanh').countDocuments({ diaDiemId: new (await import('mongodb')).ObjectId(place.id) })
    return reviews + comments + images === 0 ? true : null
  })
  assert(placeCleaned, 'xoa dia diem phai xoa sach danhgia/binhluan/hinhanh')
  checks.push('xoa dia diem -> sach collection phang')

  await admin('DELETE', '/api/admin/danh-muc/' + category.id)
  console.log(JSON.stringify({ status: 'passed', checks: checks.length, flows: checks }, null, 2))
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await mongo.close()
}

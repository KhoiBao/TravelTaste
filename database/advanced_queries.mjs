import { MongoClient } from 'mongodb'

const client = new MongoClient('mongodb://localhost:27017')
const dbName = 'review_diadiem'
const textIndexName = 'idx_diadiem_text'
const textIndexWeights = {
  ten: 10,
  tenKhongDau: 10,
  'danhMuc.ten': 6,
  'diaChi.quan': 4,
  'diaChi.thanhPho': 3,
  moTa: 2
}

const top10Pipeline = [
  { $match: { soSao: { $gte: 1, $lte: 5 } } },
  {
    $group: {
      _id: '$diaDiemId',
      ratingAvg: { $avg: '$soSao' },
      reviewCount: { $sum: 1 }
    }
  },
  {
    $lookup: {
      from: 'diadiem',
      localField: '_id',
      foreignField: '_id',
      as: 'diaDiem'
    }
  },
  { $unwind: '$diaDiem' },
  { $match: { 'diaDiem.trangThai': 'ACTIVE' } },
  { $match: { reviewCount: { $gte: 3 } } },
  {
    $set: {
      diemNoiBat: {
        $divide: [
          { $add: [{ $multiply: ['$ratingAvg', '$reviewCount'] }, 17.5] },
          { $add: ['$reviewCount', 5] }
        ]
      },
      ratingAvg: { $round: ['$ratingAvg', 2] },
      ten: '$diaDiem.ten',
      slug: '$diaDiem.slug',
      loai: '$diaDiem.loai',
      danhMuc: '$diaDiem.danhMuc',
      diaChi: '$diaDiem.diaChi',
      hinhAnh: '$diaDiem.hinhAnh'
    }
  },
  { $sort: { diemNoiBat: -1, ratingAvg: -1, reviewCount: -1, ten: 1 } },
  { $limit: 10 },
  {
    $project: {
      _id: 1,
      ten: 1,
      slug: 1,
      loai: 1,
      danhMuc: 1,
      diaChi: 1,
      hinhAnh: 1,
      ratingAvg: 1,
      reviewCount: 1,
      diemNoiBat: { $round: ['$diemNoiBat', 2] }
    }
  }
]

try {
  await client.connect()
  const db = client.db(dbName)
  const places = db.collection('diadiem')
  const reviews = db.collection('danhgia')
  const indexes = await places.listIndexes().toArray()
  const existingTextIndex = indexes.find(index => index.key?._fts === 'text')

  if (existingTextIndex?.name === textIndexName) {
    const existingWeights = existingTextIndex.weights ?? {}
    const weightsMatch =
      Object.keys(existingWeights).length === Object.keys(textIndexWeights).length &&
      Object.entries(textIndexWeights).every(([field, weight]) => existingWeights[field] === weight)
    if (!weightsMatch || existingTextIndex.default_language !== 'none') {
      await places.dropIndex(textIndexName)
    }
  } else if (existingTextIndex) {
    throw new Error(`Unexpected text index "${existingTextIndex.name}" on diadiem; refusing to replace it`)
  }

  const refreshedIndexes = await places.listIndexes().toArray()
  if (!refreshedIndexes.some(index => index.name === textIndexName)) {
    await places.createIndex(
      {
        ten: 'text',
        tenKhongDau: 'text',
        moTa: 'text',
        'diaChi.quan': 'text',
        'diaChi.thanhPho': 'text',
        'danhMuc.ten': 'text'
      },
      {
        weights: textIndexWeights,
        default_language: 'none',
        name: textIndexName
      }
    )
  }
  console.log(`[OK] Text index "${textIndexName}" is ready`)

  for (const term of ['pho', 'phở']) {
    const results = await places
      .find({ $text: { $search: term } }, { projection: { ten: 1, score: { $meta: 'textScore' } } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(3)
      .toArray()
    console.log(`Search "${term}": ${results.map(place => place.ten).join(' | ') || '(no results)'}`)
  }

  const top10 = await reviews.aggregate(top10Pipeline).toArray()
  console.log('\nTop 10 địa điểm nổi bật (rating tính trực tiếp từ collection danhgia):')
  top10.forEach((place, index) => {
    console.log(
      `${index + 1}. ${place.ten} — ${place.ratingAvg}★ (${place.reviewCount} reviews), điểm ${place.diemNoiBat}`
    )
  })
} catch (error) {
  console.error('[ERROR] Advanced MongoDB queries failed:', error.message)
  process.exitCode = 1
} finally {
  await client.close()
}

// ============================================================
//  TravelTaste - Seed du lieu mau + tao index (khong can mongosh)
//  Chay:  node seed_db.mjs
//  Yeu cau: npm install mongodb bcryptjs  (da chay trong thu muc database/)
// ============================================================
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

const URI = 'mongodb://localhost:27017'
const DB_NAME = 'review_diadiem'

const client = new MongoClient(URI)

try {
  await client.connect()
  console.log('[OK] Da ket noi MongoDB tai ' + URI)

  const db = client.db(DB_NAME)
  const users = db.collection('users')
  const danhmuc = db.collection('danhmuc')
  const diadiem = db.collection('diadiem')

  // ---------- 0. Xoa du lieu cu ----------
  await users.deleteMany({})
  await danhmuc.deleteMany({})
  await diadiem.deleteMany({})
  console.log('[1/7] Da xoa du lieu cu trong users, danhmuc, diadiem')

  // ---------- 1. Tao 7 index cho collection diadiem ----------
  await diadiem.createIndex({ slug: 1 }, { unique: true, name: 'slug_1' })

  await diadiem.createIndex(
    {
      ten: 'text',
      tenKhongDau: 'text',
      moTa: 'text',
      'diaChi.quan': 'text',
      'diaChi.thanhPho': 'text',
      'danhMuc.ten': 'text'
    },
    {
      weights: {
        ten: 10,
        tenKhongDau: 10,
        'danhMuc.ten': 6,
        'diaChi.quan': 4,
        'diaChi.thanhPho': 3,
        moTa: 2
      },
      default_language: 'none',
      name: 'idx_diadiem_text'
    }
  )

  await diadiem.createIndex({ viTri: '2dsphere' }, { name: 'idx_diadiem_vitri' })

  await diadiem.createIndex(
    { loai: 1, 'diaChi.thanhPho': 1, ratingAvg: -1 },
    { name: 'idx_diadiem_loai_thanhpho_rating' }
  )

  await diadiem.createIndex(
    { trangThai: 1, ratingAvg: -1, reviewCount: -1 },
    {
      name: 'idx_diadiem_active_rating',
      partialFilterExpression: { trangThai: 'ACTIVE' }
    }
  )

  await diadiem.createIndex({ 'danhMuc.danhMucId': 1 }, { name: 'idx_diadiem_danhmuc' })

  await diadiem.createIndex({ ngayTao: -1 }, { name: 'idx_diadiem_ngaytao' })

  await users.createIndex({ username: 1 }, { unique: true, name: 'idx_users_username' })
  await users.createIndex({ email: 1 }, { unique: true, name: 'idx_users_email' })
  await danhmuc.createIndex({ slug: 1 }, { unique: true, name: 'idx_danhmuc_slug' })
  await danhmuc.createIndex({ ten: 1 }, { unique: true, name: 'idx_danhmuc_ten' })

  console.log('[2/7] Da tao 7 index cho diadiem (+ index users, danhmuc)')

  // ---------- 2. Hash BCrypt ----------
  const hashAdmin = bcrypt.hashSync('admin123', 10)
  const hashUser = bcrypt.hashSync('123456', 10)
  const now = new Date()

  // ---------- 3. Seed users ----------
  await users.insertMany([
    {
      username: 'admin', hoTen: 'Quản trị viên', email: 'admin@traveltaste.local',
      passwordHash: hashAdmin, avatar: null, role: 'ADMIN', trangThai: 'ACTIVE',
      ngayTao: now, ngayCapNhat: now
    },
    {
      username: 'an123', hoTen: 'Nguyễn Văn An', email: 'an123@traveltaste.local',
      passwordHash: hashUser, avatar: null, role: 'USER', trangThai: 'ACTIVE',
      ngayTao: now, ngayCapNhat: now
    },
    {
      username: 'binh123', hoTen: 'Trần Thị Bình', email: 'binh123@traveltaste.local',
      passwordHash: hashUser, avatar: null, role: 'USER', trangThai: 'ACTIVE',
      ngayTao: now, ngayCapNhat: now
    }
  ])
  console.log('[3/7] Da seed 3 user: admin, an123, binh123')

  // ---------- 4. Seed danh muc ----------
  const dmAnUong = { ten: 'Ăn uống', slug: 'an-uong', moTa: 'Nhà hàng, quán ăn, cà phê, quán nhẹ', icon: 'bi-cup-hot', thuTu: 1, trangThai: 'ACTIVE', ngayTao: now, ngayCapNhat: now }
  const dmDuLich = { ten: 'Du lịch', slug: 'du-lich', moTa: 'Điểm tham quan, du lịch, cảnh quan', icon: 'bi-geo-alt', thuTu: 2, trangThai: 'ACTIVE', ngayTao: now, ngayCapNhat: now }
  const dmLuuTru = { ten: 'Lưu trú', slug: 'luu-tru', moTa: 'Khách sạn, homestay, nhà nghỉ', icon: 'bi-building', thuTu: 3, trangThai: 'ACTIVE', ngayTao: now, ngayCapNhat: now }

  await danhmuc.insertMany([dmAnUong, dmDuLich, dmLuuTru])
  console.log('[4/7] Da seed 3 danh muc')

  // Lay id sau khi insert
  const ids = Object.fromEntries((await danhmuc.find({}).toArray()).map(d => [d.slug, d._id]))
  const userIds = Object.fromEntries((await users.find({}).toArray()).map(u => [u.username, u._id]))

  // ---------- 5. Tao du lieu review / binh luan long nhau ----------
  const { ObjectId } = await import('mongodb')

  const tenUserOf = { an123: 'Nguyễn Văn An', binh123: 'Trần Thị Bình', admin: 'Quản trị viên' }

  const comment = (userName, noiDung, ngay, traLoi = []) => ({
    commentId: new ObjectId(),
    userId: userIds[userName],
    tenUser: tenUserOf[userName],
    avatarUser: null,
    noiDung,
    ngayTao: ngay,
    ngayCapNhat: ngay,
    traLoi
  })

  const d = (y, m, day) => new Date(y, m, day, 10, 0, 0)

  // ---------- 6. Seed dia diem ----------
  const diaDiemList = [
    {
      ten: 'Phở Thìn Lò Đúc',
      slug: 'pho-thin-lo-duc',
      tenKhongDau: 'pho thin lo duc',
      loai: 'AN_UONG',
      danhMuc: [{ danhMucId: ids['an-uong'], ten: 'Ăn uống', slug: 'an-uong' }],
      moTa: 'Phở bò truyền thống nổi tiếng tại phố Lò Đúc, Hà Nội. Nước dùng đậm đắc, thịt bò tươi, mớ phở mịn và dày. Quán mở từ 6h30 sáng.',
      diaChi: { so: '13', duong: 'Lò Đúc', quan: 'Hai Bà Trưng', thanhPho: 'Hà Nội' },
      viTri: { type: 'Point', coordinates: [105.8423, 21.0215] },
      hinhAnh: [
        'https://images.unsplash.com/photo-1569720141087-e6a1f716c63f?w=800',
        'https://images.unsplash.com/photo-1563279609-d7789e82452d?w=800',
        'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800'
      ],
      trangThai: 'ACTIVE',
      ngayTao: d(2025, 10, 1),
      ngayCapNhat: d(2026, 0, 12),
      reviews: []
    },
    {
      ten: 'Bún chả Hương Liên',
      slug: 'bun-cha-huong-lien',
      tenKhongDau: 'bun cha huong lien',
      loai: 'AN_UONG',
      danhMuc: [{ danhMucId: ids['an-uong'], ten: 'Ăn uống', slug: 'an-uong' }],
      moTa: 'Bún chả nổi tiếng ở Hà Nội, từng được Tổng thống Barack Obama dùng thử khi thăm Việt Nam. Chất lượng vẫn giữ nguyên.',
      diaChi: { so: '24', duong: 'Lê Văn Hữu', quan: 'Thanh Xuân', thanhPho: 'Hà Nội' },
      viTri: { type: 'Point', coordinates: [105.8234, 20.9914] },
      hinhAnh: [
        'https://images.unsplash.com/photo-15247656760-e28560e18a14?w=800',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'
      ],
      trangThai: 'ACTIVE',
      ngayTao: d(2025, 10, 5),
      ngayCapNhat: d(2026, 1, 8),
      reviews: []
    },
    {
      ten: 'Cà phê Giảng',
      slug: 'ca-phe-giang',
      tenKhongDau: 'ca phe giang',
      loai: 'AN_UONG',
      danhMuc: [{ danhMucId: ids['an-uong'], ten: 'Ăn uống', slug: 'an-uong' }],
      moTa: 'Quán cà phê gia đình trên phố Nguyễn Hữu Huân nổi tiếng với ly cà phê trứng và vị cà phê phin truyền thống.',
      diaChi: { so: '39', duong: 'Nguyễn Hữu Huân', quan: 'Hoàn Kiếm', thanhPho: 'Hà Nội' },
      viTri: { type: 'Point', coordinates: [105.8519, 21.0301] },
      hinhAnh: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800'],
      trangThai: 'ACTIVE',
      ngayTao: d(2025, 11, 2),
      ngayCapNhat: d(2026, 2, 20),
      reviews: []
    },
    {
      ten: 'Hồ Hoàn Kiếm',
      slug: 'ho-hoan-kiem',
      tenKhongDau: 'ho hoan kiem',
      loai: 'DU_LICH',
      danhMuc: [{ danhMucId: ids['du-lich'], ten: 'Du lịch', slug: 'du-lich' }],
      moTa: 'Hồ nước trong lòng thành Hà Nội, điểm check-in du lịch nổi tiếng với cầu Thê Húc, đền Ngọc Sơn và phố cổ ba bên hồ.',
      diaChi: { so: '', duong: 'Đình Tiên Hoàng', quan: 'Hoàn Kiếm', thanhPho: 'Hà Nội' },
      viTri: { type: 'Point', coordinates: [105.8523, 21.0321] },
      hinhAnh: [
        'https://images.unsplash.com/photo-1517728633855-9e9e4f7c3c4c?w=800',
        'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=800'
      ],
      trangThai: 'ACTIVE',
      ngayTao: d(2025, 9, 10),
      ngayCapNhat: d(2026, 2, 1),
      reviews: []
    },
    {
      ten: 'Phố cổ Hà Nội',
      slug: 'pho-co-ha-noi',
      tenKhongDau: 'pho co ha noi',
      loai: 'DU_LICH',
      danhMuc: [{ danhMucId: ids['du-lich'], ten: 'Du lịch', slug: 'du-lich' }],
      moTa: 'Khu phố cổ 36 phố phường với kiến trúc trăm tuổi, chợ đồng Xuân, nhà hát Lớn và nhiều quán ăn vặt đường phố.',
      diaChi: { so: '', duong: 'Hàng Bạc', quan: 'Hoàn Kiếm', thanhPho: 'Hà Nội' },
      viTri: { type: 'Point', coordinates: [105.8542, 21.0310] },
      hinhAnh: ['https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=800'],
      trangThai: 'ACTIVE',
      ngayTao: d(2025, 9, 15),
      ngayCapNhat: d(2026, 3, 3),
      reviews: []
    },
    {
      ten: 'Bãi biển Mỹ Khê',
      slug: 'bai-bien-my-khe',
      tenKhongDau: 'bai bien my khe',
      loai: 'DU_LICH',
      danhMuc: [{ danhMucId: ids['du-lich'], ten: 'Du lịch', slug: 'du-lich' }],
      moTa: 'Bãi biển được Forbes bình chọn là bãi biển quyến rũ nhất hành tinh, nằm ngay trung tâm Đà Nẵng.',
      diaChi: { so: '250', duong: 'Phạm Hồng Thái', quan: 'Hải Châu', thanhPho: 'Đà Nẵng' },
      viTri: { type: 'Point', coordinates: [108.2245, 16.0605] },
      hinhAnh: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
      trangThai: 'ACTIVE',
      ngayTao: d(2025, 8, 20),
      ngayCapNhat: d(2026, 3, 12),
      reviews: []
    },
    {
      ten: 'Bún mắm Nêm',
      slug: 'bun-mam-nem',
      tenKhongDau: 'bun mam nem',
      loai: 'AN_UONG',
      danhMuc: [{ danhMucId: ids['an-uong'], ten: 'Ăn uống', slug: 'an-uong' }],
      moTa: 'Bún mắm nêm truyền thống Đà Nẵng, nước dùng chua cay đậm đà, ăn kèm thịt chua và rau trộn.',
      diaChi: { so: '5', duong: 'Huỳnh Thuần Khang', quan: 'Hải Châu', thanhPho: 'Đà Nẵng' },
      viTri: { type: 'Point', coordinates: [108.2206, 16.0762] },
      hinhAnh: ['https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800'],
      trangThai: 'ACTIVE',
      ngayTao: d(2025, 8, 25),
      ngayCapNhat: d(2026, 3, 18),
      reviews: []
    },
    {
      ten: 'Chè Mâm',
      slug: 'che-mam',
      tenKhongDau: 'che mam',
      loai: 'AN_UONG',
      danhMuc: [{ danhMucId: ids['an-uong'], ten: 'Ăn uống', slug: 'an-uong' }],
      moTa: 'Quán chè đậm chất Sài Gòn trên đường Nguyễn Trãi, nổi tiếng với chè bánh canh đậm đà và chè đậm den.',
      diaChi: { so: '291', duong: 'Nguyễn Trãi', quan: 'Quận 1', thanhPho: 'TP. Hồ Chí Minh' },
      viTri: { type: 'Point', coordinates: [106.6819, 10.7795] },
      hinhAnh: ['https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800'],
      trangThai: 'ACTIVE',
      ngayTao: d(2025, 7, 15),
      ngayCapNhat: d(2026, 4, 1),
      reviews: []
    },
    {
      ten: 'Dinh Độc Lập',
      slug: 'dinh-doc-lap',
      tenKhongDau: 'dinh doc lap',
      loai: 'DU_LICH',
      danhMuc: [{ danhMucId: ids['du-lich'], ten: 'Du lịch', slug: 'du-lich' }],
      moTa: 'Công trình kiến trúc biểu tượng của Sài Gòn, xung quanh là phố đi bộ Nguyễn Huệ với nhiều quán ăn.',
      diaChi: { so: '', duong: 'Đinh Tiên Hoàng', quan: 'Quận 1', thanhPho: 'TP. Hồ Chí Minh' },
      viTri: { type: 'Point', coordinates: [106.6897, 10.7810] },
      hinhAnh: ['https://images.unsplash.com/photo-1583417319070-4a69db38e482?w=800'],
      trangThai: 'ACTIVE',
      ngayTao: d(2025, 7, 20),
      ngayCapNhat: d(2026, 4, 5),
      reviews: []
    },
    {
      ten: 'Bánh căn Cô Tâm',
      slug: 'banh-can-co-tam',
      tenKhongDau: 'banh can co tam',
      loai: 'AN_UONG',
      danhMuc: [{ danhMucId: ids['an-uong'], ten: 'Ăn uống', slug: 'an-uong' }],
      moTa: 'Bánh căn nướng trên than củi nổi tiếng ở Đà Lạt, vỏ ngoài giòn, nhân trứng bơ béo ngậy.',
      diaChi: { so: '148', duong: 'Phan Đình Phùng', quan: 'Thanh Khê', thanhPho: 'Đà Lạt' },
      viTri: { type: 'Point', coordinates: [108.1946, 11.9400] },
      hinhAnh: ['https://images.unsplash.com/photo-1516100882582-432cabb0ff83?w=800'],
      trangThai: 'ACTIVE',
      ngayTao: d(2025, 6, 10),
      ngayCapNhat: d(2026, 4, 15),
      reviews: []
    },
    {
      ten: 'Hồ Xuân Hương',
      slug: 'ho-xuan-huong',
      tenKhongDau: 'ho xuan huong',
      loai: 'DU_LICH',
      danhMuc: [{ danhMucId: ids['du-lich'], ten: 'Du lịch', slug: 'du-lich' }],
      moTa: 'Hồ nước ngọt nằm giữa lòng thành phố Đà Lạt, điểm đến yêu thích của du khách với đồi thông và cà phê.',
      diaChi: { so: '', duong: 'Trần Hưng Đạo', quan: 'Thanh Khê', thanhPho: 'Đà Lạt' },
      viTri: { type: 'Point', coordinates: [108.1937, 11.9350] },
      hinhAnh: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'],
      trangThai: 'ACTIVE',
      ngayTao: d(2025, 6, 12),
      ngayCapNhat: d(2026, 5, 2),
      reviews: []
    },
    {
      ten: 'Bún cá Nha Trang',
      slug: 'bun-ca-nha-trang',
      tenKhongDau: 'bun ca nha trang',
      loai: 'AN_UONG',
      danhMuc: [{ danhMucId: ids['an-uong'], ten: 'Ăn uống', slug: 'an-uong' }],
      moTa: 'Bún cá tươi sống chấm mắm nêm chua cay, món ăn đặc trưng của vùng biển Nha Trang.',
      diaChi: { so: '12', duong: 'Thủ Thủ', quan: 'Nha Trang', thanhPho: 'Khánh Hòa' },
      viTri: { type: 'Point', coordinates: [109.1936, 12.2216] },
      hinhAnh: ['https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800'],
      trangThai: 'ACTIVE',
      ngayTao: d(2025, 5, 20),
      ngayCapNhat: d(2026, 5, 10),
      reviews: []
    },
    {
      ten: 'VinWonders Nha Trang',
      slug: 'vinwonders-nha-trang',
      tenKhongDau: 'vinwonders nha trang',
      loai: 'DU_LICH',
      danhMuc: [{ danhMucId: ids['du-lich'], ten: 'Du lịch', slug: 'du-lich' }],
      moTa: 'Khu du lịch tổng hợp với công viên nước VinWonders, thủy cung và chuỗi show hoành trang.',
      diaChi: { so: '', duong: 'Đường 2/4', quan: 'Nha Trang', thanhPho: 'Khánh Hòa' },
      viTri: { type: 'Point', coordinates: [109.1976, 12.2205] },
      hinhAnh: ['https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800'],
      trangThai: 'ACTIVE',
      ngayTao: d(2025, 5, 25),
      ngayCapNhat: d(2026, 5, 20),
      reviews: []
    }
  ]

  // Gán review cho tung dia diem
  const rv = (userName, soSao, tieuDe, noiDung, hinhAnh, ngay, binhLuan = []) => ({
    reviewId: new ObjectId(),
    userId: userIds[userName],
    tenUser: tenUserOf[userName],
    avatarUser: null,
    soSao,
    tieuDe,
    noiDung,
    hinhAnh: hinhAnh || [],
    ngayTao: ngay,
    ngayCapNhat: ngay,
    binhLuan
  })

  diaDiemList[0].reviews = [
    rv('an123', 5, 'Phở ngon rất đáng thử',
      'Nước dùng đậm đắc đúng vị Hà Nội, thịt bò tươi và mớ phở mịn. Quán mở từ 6h30 sáng nên đi sớm là tốt nhất, hơn 9h là phải xếp hàng.',
      ['https://images.unsplash.com/photo-1555126634-323283e090fa?w=800', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800'],
      d(2026, 0, 10),
      [
        comment('binh123', 'Nước dùng hơi đặc so với khẩu vị của mình, ai thích nồng sẽ rất hợp.', d(2026, 0, 11),
          [
            comment('an123', 'Cảm ơn bạn đã góp ý, quán sẽ điều chỉnh độ đậm cho phù hợp hơn nhé!', d(2026, 0, 12),
              [
                comment('binh123', 'Mình sẽ thử lại lần sau, cảm ơn quán nhé!', d(2026, 0, 13))
              ]
            )
          ]
        ),
        comment('admin', 'Quán rất nổi tiếng, mình cũng ghé thăm khi đi công tác Hà Nội, rất đáng để thử.', d(2026, 0, 15))
      ]
    ),
    rv('binh123', 4, 'Chất lượng tốt, giá hơi cao',
      'Phở ngon, topping đầy đủ. Tuy nhiên giá cao hơn mặt bằng chung một chút (khoảng 35k-40k/phần).',
      [], d(2026, 0, 15)),
    rv('an123', 5, 'Trải nghiệm đáng nhớ',
      'Từng đến Hà Nội nhiều lần nhưng đây là lần đầu ăn Phở Thìn, không hề thất vọng. Nước dùng ngọt thanh, thịt bò mềm.',
      [], d(2026, 1, 2)),
    rv('binh123', 5, 'Ăn sáng ở đây là một trải nghiệm',
      'Không gian nhỏ gọn, phục vụ nhanh. Phở tái mềm, gầu giòn, ăn cùng bánh quẩy là hoàn hảo.',
      [], d(2026, 1, 20)),
    rv('an123', 4, 'Ngon nhưng hơi đông',
      'Chất lượng ổn, dù phải chờ khá lâu vào giờ đông ca. Nên đi vào tầm 7h-8h sáng.',
      [], d(2026, 2, 8))
  ]

  diaDiemList[1].reviews = [
    rv('binh123', 5, 'Bún chả đặc biệt đúng bản',
      'Mùi nướng thơm phức, chấm chua ngọt vừa khẩu vị. Đông khách từ 11h trưa nên đi sớm.',
      ['https://images.unsplash.com/photo-15247656760-e28560e18a14?w=800'],
      d(2026, 1, 5),
      [comment('an123', 'Đúng là quán nổi tiếng, chất lượng vẫn giữ nguyên so với thời Obama ghé thăm.', d(2026, 1, 6))]
    ),
    rv('an123', 4, 'Ngon nhưng phải xếp hàng',
      'Bún chả ngon, nước chấm đậm vị. Tuy nhiên khách đông, phải chờ 20-30 phút.',
      [], d(2026, 1, 8)),
    rv('binh123', 5, 'Nhất định phải thử',
      'Không nên bỏ lỡ khi đến Hà Nội. Giá hợp lý cho chất lượng.',
      [], d(2026, 2, 14))
  ]

  diaDiemList[2].reviews = [
    rv('an123', 5, 'Cà phê trứng đúng chất',
      'Ly cà phê trứng đậm đà, đá xay mịn. Không gian nhỏ nhắn, view ra phố Nguyễn Hữu Huân rất xinh.',
      [], d(2026, 2, 20),
      [comment('binh123', 'Cà phê phin ở đây cũng rất ngon, đậm đúng kiểu Sài Gòn.', d(2026, 2, 21))]
    ),
    rv('binh123', 4, 'Ổn, hơi chật',
      'Quán nhỏ nên vào giờ đông khó tìm chỗ ngồi. Cà phê ngon, bánh mì ốp la cũng ổn.',
      [], d(2026, 3, 5))
  ]

  diaDiemList[3].reviews = [
    rv('binh123', 5, 'Đẹp vào buổi tối',
      'Ánh đèn vàng soi lên mặt hồ rất lãng mạn. Rất thích đi dạo quanh hồ buổi tối.',
      ['https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=800'],
      d(2026, 2, 1),
      [comment('an123', 'Buổi sáng cũng rất đẹp, ít người hơn nên chụp ảnh thoải mái.', d(2026, 2, 2))]
    ),
    rv('an123', 5, 'Trái tim du lịch Hà Nội',
      'Không thể không ghé hồ Hoàn Kiếm khi đến Hà Nội. Cầu Thê Húc, đền Ngọc Sơn, phố cổ ba bên hồ.',
      [], d(2026, 2, 18)),
    rv('binh123', 4, 'Đông nhưng vẫn đáng',
      'Đông đúng kiểu du lịch nhưng cảnh quan đẹp, chụp ảnh thì vẫn ra hình đẹp.',
      [], d(2026, 3, 10))
  ]

  diaDiemList[4].reviews = [
    rv('an123', 5, 'Sống lại ở phố cổ',
      'Đi dạo từ Chương Dương tới Hàng Bạc, ăn mấy món vặt ven đường. Rất dễ mất thời gian.',
      [], d(2026, 3, 3)),
    rv('binh123', 4, 'Du lịch kinh điển',
      'Kiến trúc trăm tuổi, chợ đồng Xuân, nhà hát lớn. Nên đi vào sáng sớm khi vắng.',
      [], d(2026, 3, 22)),
    rv('an123', 5, 'Nhiều quán ngon bất ngờ',
      'Cứ đi đâu lạc địa sẽ gặp quán ăn được, giá rẻ mà chất lượng tốt.',
      [], d(2026, 4, 2))
  ]

  diaDiemList[5].reviews = [
    rv('binh123', 5, 'Bãi biển đẹp nhất Việt Nam',
      'Cát trắng, nước trong, quán ăn ven biển đầy ắp. Nhất là lúc hoàng hôn.',
      ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
      d(2026, 3, 12),
      [comment('an123', 'Đúng là đẹp, mùa hè đi biển Đà Nẵng là lựa chọn tuyệt vời.', d(2026, 3, 13))]
    ),
    rv('an123', 4, 'Đông khách nhưng cảnh đẹp',
      'Ngày cuối tuần khá đông. Nếu muốn yên thì đi sáng sớm.',
      [], d(2026, 4, 8))
  ]

  diaDiemList[6].reviews = [
    rv('an123', 5, 'Bún mắm chuẩn vị Đà Nẵng',
      'Nước dùng chua cay đúng kiểu, cá tươi. Giá rẻ, phần nhiều.',
      [], d(2026, 3, 18)),
    rv('binh123', 4, 'Ngon, ăn cùng rau trộn',
      'Nước mắm nêm vừa ăn, hơi cay. Rau trộn và thịt chua ăn kèm chuẩn.',
      [], d(2026, 4, 25))
  ]

  diaDiemList[7].reviews = [
    rv('binh123', 5, 'Chè Sài Gòn đúng chuẩn',
      'Chè đậm danh, chè bánh canh đậm đà, ăn ở đây là một trải nghiệm.',
      [], d(2026, 4, 1)),
    rv('an123', 5, 'Món ăn trứ danh',
      'Quán lâu đời, chất lượng ổn định. Nhớ đến thử chè bánh canh thật đặc.',
      [], d(2026, 4, 20))
  ]

  diaDiemList[8].reviews = [
    rv('an123', 5, 'Kiến trúc đẹp, khu vực sôi động',
      'Đinh Độc Lập nổi bật giữa phố, xung quanh là quán ăn nhà hàng đầy ắp.',
      [], d(2026, 4, 5),
      [comment('binh123', 'Buổi tối đi dạo phố Nguyễn Huệ rất thú vị.', d(2026, 4, 6))]
    ),
    rv('binh123', 4, 'Điểm hẹn quen thuộc',
      'Vẫn đẹp, vẫn đông. Sáng sớm chụp ảnh sẽ vắng và đẹp hơn.',
      [], d(2026, 5, 1))
  ]

  diaDiemList[9].reviews = [
    rv('binh123', 5, 'Bánh căn nướng than củi',
      'Vỏ ngoài giòn, nhân trứng bơ béo ngậy, ăn kèm nước tắc. Đúng kiểu Đà Lạt.',
      ['https://images.unsplash.com/photo-1516100882582-432cabb0ff83?w=800'],
      d(2026, 4, 15),
      [comment('an123', 'Phải đến tận nơi mới hiểu vì sao bánh căn lại nổi tiếng thế.', d(2026, 4, 16))]
    ),
    rv('an123', 4, 'Ngon nhưng hơi xếp hàng',
      'Buổi tối khá đông, nhưng đánh giá nhanh. Chờ khoảng 10 phút là ăn được.',
      [], d(2026, 5, 2))
  ]

  diaDiemList[10].reviews = [
    rv('an123', 5, 'Hồ nước ngọt giữa lòng thành phố',
      'Đi dạo quanh hồ buổi tối rất dễ chịu, có đồi thông và nhiều quán cà phê view hồ.',
      [], d(2026, 5, 2),
      [comment('binh123', 'Sáng sớm đi theo hồ rất bình yên, không khuyến khích du khách ồn ào.', d(2026, 5, 3))]
    ),
    rv('binh123', 5, 'Đà Lạt trong vòng mắt',
      'Không khí mát mẻ, cảnh vật đẹp. Rất hợp để đi bộ và chụp ảnh.',
      [], d(2026, 5, 20))
  ]

  diaDiemList[11].reviews = [
    rv('binh123', 5, 'Bún cá tươi sống',
      'Cá tươi, nước dùng chua cay, ăn kèm rau. Phần ăn no mà giá vẫn ổn.',
      [], d(2026, 5, 10),
      [comment('an123', 'Đúng vị biển Nha Trang, nhất định phải thử khi đi du lịch.', d(2026, 5, 11))]
    ),
    rv('an123', 4, 'Ngon, hơi mặn',
      'Nước dùng hơi mặn so với khẩu vị mình nhưng cá tươi và bún dai.',
      [], d(2026, 5, 25))
  ]

  diaDiemList[12].reviews = [
    rv('an123', 5, 'Công viên nước đẹp nhất Việt Nam',
      'Khu du lịch rất quy mô, nhiều trò chơi và biểu diễn. Nên đi cả ngày.',
      [], d(2026, 5, 20),
      [comment('binh123', 'Gia đình tôi đi thích lắm, con tôi chơi cả ngày không chịu về.', d(2026, 5, 21))]
    ),
    rv('binh123', 4, 'Đông, đặt vé sớm',
      'Rất đông vào cuối tuần, nên mua vé online trước để tiết kiệm thời gian xếp hàng.',
      [], d(2026, 6, 1))
  ]

  // ---------- 7. Tinh lai ratingAvg va reviewCount ----------
  for (const dd of diaDiemList) {
    const reviews = dd.reviews || []
    const count = reviews.length
    const avg = count > 0
      ? Math.round((reviews.reduce((s, r) => s + (r.soSao || 0), 0) / count) * 100) / 100
      : 0
    dd.ratingAvg = avg
    dd.reviewCount = count
  }

  await diadiem.insertMany(diaDiemList)
  console.log('[5/7] Da seed ' + diaDiemList.length + ' dia diem kem reviews va binh luan long nhau')
  console.log('[6/7] Da tinh lai ratingAvg va reviewCount cho tat ca dia diem')

  // ---------- 8. Thong ke ----------
  const totalReviews = await diadiem.aggregate([{ $unwind: '$reviews' }, { $count: 'n' }]).toArray()
  const totalComments = await diadiem.aggregate([
    { $unwind: '$reviews' }, { $unwind: '$reviews.binhLuan' }, { $count: 'n' }
  ]).toArray()
  const totalReplies = await diadiem.aggregate([
    { $unwind: '$reviews' }, { $unwind: '$reviews.binhLuan' },
    { $unwind: '$reviews.binhLuan.traLoi' }, { $count: 'n' }
  ]).toArray()

  console.log('[7/7] HOAN TAT')
  console.log('  users            : ' + (await users.countDocuments()))
  console.log('  danhmuc          : ' + (await danhmuc.countDocuments()))
  console.log('  diadiem          : ' + (await diadiem.countDocuments()))
  console.log('  reviews          : ' + (totalReviews[0]?.n || 0))
  console.log('  binhLuan (cap 1) : ' + (totalComments[0]?.n || 0))
  console.log('  traLoi   (cap 2) : ' + (totalReplies[0]?.n || 0))
  console.log('  index diadiem    : ' + (await diadiem.indexes()).length)
  console.log('')
  console.log('  Tai khoan demo: admin/admin123, an123/123456, binh123/123456')
} catch (e) {
  console.error('[LOI]', e)
  process.exitCode = 1
} finally {
  await client.close()
}

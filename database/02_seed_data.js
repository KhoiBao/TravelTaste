use review_diadiem;

// ============================================================
//  Seed du lieu mau cho TravelTaste
//  Chay: mongosh --quiet 02_seed_data.js
//  (Chay tu thu muc database/ de load() tim thay 01_indexes.js)
// ============================================================

// --- 0. Tao index (tu cho thay vi load de tranh loi duong dan) ---
try {
  load("01_indexes.js");
} catch (e) {
  print("[Canh bao] Khong load duoc 01_indexes.js - hay chay rieng: mongosh --quiet 01_indexes.js");
}

// --- 1. Xoa du lieu cu (de seed lai sach) ---
db.users.deleteMany({});
db.danhmuc.deleteMany({});
db.diadiem.deleteMany({});
print("[1/6] Da xoa du lieu cu trong users, danhmuc, diadiem");

// --- 2. Hash BCrypt cho mat khau "123456" ---
var HASH_123456 = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";
var HASH_ADMIN = "$2a$10$7EqJtq98hPqEX7fNZaFWoO5Xgb4t1JJ6v1u1Z1eS9tC4pU8NiBPq"; // admin123

// --- 3. Seed users ---
db.users.insertMany([
  {
    username: "admin",
    hoTen: "Quan tri vien",
    email: "admin@traveltaste.local",
    passwordHash: HASH_ADMIN,
    avatar: null,
    role: "ADMIN",
    trangThai: "ACTIVE",
    ngayTao: new Date(),
    ngayCapNhat: new Date()
  },
  {
    username: "an123",
    hoTen: "Nguyen Van An",
    email: "an123@traveltaste.local",
    passwordHash: HASH_123456,
    avatar: null,
    role: "USER",
    trangThai: "ACTIVE",
    ngayTao: new Date(),
    ngayCapNhat: new Date()
  },
  {
    username: "binh123",
    hoTen: "Tran Thi Binh",
    email: "binh123@traveltaste.local",
    passwordHash: HASH_123456,
    avatar: null,
    role: "USER",
    trangThai: "ACTIVE",
    ngayTao: new Date(),
    ngayCapNhat: new Date()
  }
]);
print("[2/6] Da seed 3 user: admin, an123, binh123");

// --- 4. Seed danh muc ---
db.danhmuc.insertMany([
  { ten: "An uong", slug: "an-uong", moTa: "Nha hang, quan an, ca phe", icon: "bi-cup-hot", thuTu: 1, trangThai: "ACTIVE", ngayTao: new Date(), ngayCapNhat: new Date() },
  { ten: "Du lich", slug: "du-lich", moTa: "Diem tham quan, canh quan", icon: "bi-geo-alt", thuTu: 2, trangThai: "ACTIVE", ngayTao: new Date(), ngayCapNhat: new Date() },
  { ten: "Luu tru", slug: "luu-tru", moTa: "Khach san, homestay", icon: "bi-building", thuTu: 3, trangThai: "ACTIVE", ngayTao: new Date(), ngayCapNhat: new Date() }
]);
print("[3/6] Da seed 3 danh muc");

// --- 5. Lay id de tham chieu ---
var dmAnUong = db.danhmuc.findOne({ slug: "an-uong" })._id;
var dmDuLich = db.danhmuc.findOne({ slug: "du-lich" })._id;
var dmLuuTru = db.danhmuc.findOne({ slug: "luu-tru" })._id;

var userAn = db.users.findOne({ username: "an123" })._id;
var userBinh = db.users.findOne({ username: "binh123" })._id;

function ref(id, ten, slug) {
  return { danhMucId: id, ten: ten, slug: slug };
}

// Ham tao review
function makeReview(userId, tenUser, soSao, tieuDe, noiDung, hinhAnh, ngay, binhLuan) {
  return {
    reviewId: new ObjectId(),
    userId: userId,
    tenUser: tenUser,
    avatarUser: null,
    soSao: soSao,
    tieuDe: tieuDe,
    noiDung: noiDung,
    hinhAnh: hinhAnh || [],
    ngayTao: ngay || new Date(),
    ngayCapNhat: ngay || new Date(),
    binhLuan: binhLuan || []
  };
}

// Ham tao binh luan
function makeComment(userId, tenUser, noiDung, ngay, traLoi) {
  return {
    commentId: new ObjectId(),
    userId: userId,
    tenUser: tenUser,
    avatarUser: null,
    noiDung: noiDung,
    ngayTao: ngay || new Date(),
    ngayCapNhat: ngay || new Date(),
    traLoi: traLoi || []
  };
}

// --- 6. Seed dia diem voi reviews + binh luan long nhau ---
db.diadiem.insertMany([
  {
    ten: "Pho Thin Lo Duc",
    slug: "pho-thin-lo-duc",
    tenKhongDau: "pho thin lo duc",
    loai: "AN_UONG",
    danhMuc: [ref(dmAnUong, "An uong", "an-uong")],
    moTa: "Pho bo truyen thong tai Lo Duc, Ha Noi. Nuoc dung dam dac, thit bo tuoi ngon.",
    diaChi: { so: "13", duong: "Lo Duc", quan: "Hai Ba Trung", thanhPho: "Ha Noi" },
    viTri: { type: "Point", coordinates: [105.8423, 21.0215] },
    hinhAnh: [
      "https://images.unsplash.com/photo-1569720141087-e6a1f716c63f?w=800",
      "https://images.unsplash.com/photo-1563279609-d7789e82452d?w=800"
    ],
    ratingAvg: 0,
    reviewCount: 0,
    reviews: [
      makeReview(
        userAn, "Nguyen Van An", 5,
        "Pho ngon rat dang thu",
        "Nuoc dung dam dac, thit bo tuoi, mo pho min. Rat ngon!",
        [], new Date(2026, 0, 10),
        [
          makeComment(userBinh, "Tran Thi Binh", "Nuoc dung dam qua, minh thay hoi man mot chut.", new Date(2026, 0, 11),
            [
              makeComment(userAn, "Nguyen Van An", "Cam on ban, quan se dieu chinh nuoc dung.", new Date(2026, 0, 12))
            ]
          )
        ]
      ),
      makeReview(
        userBinh, "Tran Thi Binh", 4,
        "Chat luong tot, gia hoi dat",
        "Pho thit ngon, nhung gia cao hon quan khac o cung khu.",
        ["https://images.unsplash.com/photo-1555126634-323283e090fa?w=800"], new Date(2026, 0, 15)
      )
    ],
    trangThai: "ACTIVE",
    ngayTao: new Date(),
    ngayCapNhat: new Date()
  },
  {
    ten: "Bun cha Huong Lien",
    slug: "bun-cha-huong-lien",
    tenKhongDau: "bun cha huong lien",
    loai: "AN_UONG",
    danhMuc: [ref(dmAnUong, "An uong", "an-uong")],
    moTa: "Bun cha noi tieng o Ha Noi, tung duoc Barack Obama dung thu.",
    diaChi: { so: "24", duong: "Le Van Huu", quan: "Thanh Xuan", thanhPho: "Ha Noi" },
    viTri: { type: "Point", coordinates: [105.8234, 20.9914] },
    hinhAnh: ["https://images.unsplash.com/photo-15247656760-e28560e18a14?w=800"],
    ratingAvg: 0,
    reviewCount: 0,
    reviews: [
      makeReview(userAn, "Nguyen Van An", 5, "Bun cha dac biet", "Mui nuong thom phuc, cham chua ngot vua khau vi.", [], new Date(2026, 1, 5)),
      makeReview(userBinh, "Tran Thi Binh", 4, "Ngon nhung phai xep hang", "Quan rat don, nhan vien phuc vu nhe nhang.", [], new Date(2026, 1, 8))
    ],
    trangThai: "ACTIVE",
    ngayTao: new Date(),
    ngayCapNhat: new Date()
  },
  {
    ten: "Ho Hoan Kiem",
    slug: "ho-hoan-kiem",
    tenKhongDau: "ho hoan kiem",
    loai: "DU_LICH",
    danhMuc: [ref(dmDuLich, "Du lich", "du-lich")],
    moTa: "Ho nuoc trong long thanh Ha Noi, diem check-in du lich noi tieng.",
    diaChi: { so: "", duong: "Dinh Tien Hoang", quan: "Hoan Kiem", thanhPho: "Ha Noi" },
    viTri: { type: "Point", coordinates: [105.8523, 21.0321] },
    hinhAnh: ["https://images.unsplash.com/photo-1517728633855-9e9e4f7c3c4c?w=800"],
    ratingAvg: 0,
    reviewCount: 0,
    reviews: [
      makeReview(userBinh, "Tran Thi Binh", 5, "Dep vao buoi toi", "Anh den soi len ho rat romantic.", [], new Date(2026, 2, 1))
    ],
    trangThai: "ACTIVE",
    ngayTao: new Date(),
    ngayCapNhat: new Date()
  },
  {
    ten: "Ho Tay",
    slug: "ho-tay",
    tenKhongDau: "ho tay",
    loai: "DU_LICH",
    danhMuc: [ref(dmDuLich, "Du lich", "du-lich")],
    moTa: "Ho lon nhat Ha Noi, noi thuong ngam va an uong ven ho.",
    diaChi: { so: "", duong: "Phuong Thuong", quan: "Tay Ho", thanhPho: "Ha Noi" },
    viTri: { type: "Point", coordinates: [105.8387, 21.0789] },
    hinhAnh: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"],
    ratingAvg: 0,
    reviewCount: 0,
    reviews: [
      makeReview(userAn, "Nguyen Van An", 5, "Noi thuong ngam dac biet", "Duyen, vao ban cap nhay, nen di buoi sang.", [], new Date(2026, 2, 15)),
      makeReview(userBinh, "Tran Thi Binh", 4, "Canh dep, duong di xa", "Dep nhung duong di den ho bay xa.", [], new Date(2026, 2, 20))
    ],
    trangThai: "ACTIVE",
    ngayTao: new Date(),
    ngayCapNhat: new Date()
  },
  {
    ten: "Khach san Sofitel Legend Metropole Ha Noi",
    slug: "khach-san-sofitel-legend-metropole-ha-noi",
    tenKhongDau: "khach san sofitel legend metropole ha noi",
    loai: "LUU_TRU",
    danhMuc: [ref(dmLuuTru, "Luu tru", "luu-tru")],
    moTa: "Khach san 5 sao ven ho Hoan Kiem, khong gian sang trong va lich su.",
    diaChi: { so: "15", duong: "Nguyen Trai", quan: "Hoan Kiem", thanhPho: "Ha Noi" },
    viTri: { type: "Point", coordinates: [105.8534, 21.0242] },
    hinhAnh: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"],
    ratingAvg: 0,
    reviewCount: 0,
    reviews: [
      makeReview(userAn, "Nguyen Van An", 5, "Khach san dat cap", "Phong dep, nhan vien phuc vu tot, view ho Hoan Kiem.", [], new Date(2026, 3, 2)),
      makeReview(userBinh, "Tran Thi Binh", 5, "View 5 sao", "Toi thuong, nhat la buoi sang view ho.", [], new Date(2026, 3, 10))
    ],
    trangThai: "ACTIVE",
    ngayTao: new Date(),
    ngayCapNhat: new Date()
  }
]);
print("[4/6] Da seed 5 dia diem kem reviews va binh luan long nhau");

// --- 7. Tinh lai ratingAvg va reviewCount ---
db.diadiem.find().forEach(function (dd) {
  var reviews = dd.reviews || [];
  var count = reviews.length;
  var avg = count > 0
    ? Math.round((reviews.reduce(function (sum, r) { return sum + (r.soSao || 0); }, 0) / count) * 100) / 100
    : 0;
  db.diadiem.updateOne(
    { _id: dd._id },
    { $set: { ratingAvg: avg, reviewCount: count, ngayCapNhat: new Date() } }
  );
});
print("[5/6] Da tinh lai ratingAvg va reviewCount cho tat ca dia diem");

// --- 8. Thong ke ---
print("[6/6] HOAN TAT");
print("  users   : " + db.users.countDocuments());
print("  danhmuc : " + db.danhmuc.countDocuments());
print("  diadiem : " + db.diadiem.countDocuments());
print("  reviews : " + db.diadiem.aggregate([{ $unwind: "$reviews" }, { $count: "n" }]).toArray()[0].n);
print("");
print("Tai khoan demo: admin/admin123, an123/123456, binh123/123456");

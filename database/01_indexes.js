use review_diadiem;

// 1. Slug duy nhất
db.diadiem.createIndex({ slug: 1 }, { unique: true, name: "slug_1" });

// 2. Text index: tìm kiếm theo từ khóa (có dấu/không dấu)
db.diadiem.createIndex(
  {
    ten: "text",
    tenKhongDau: "text",
    moTa: "text",
    "diaChi.quan": "text",
    "diaChi.thanhPho": "text",
    "danhMuc.ten": "text"
  },
  {
    weights: {
      ten: 10,
      tenKhongDau: 10,
      "danhMuc.ten": 6,
      "diaChi.quan": 4,
      "diaChi.thanhPho": 3,
      moTa: 2
    },
    default_language: "none",
    name: "idx_diadiem_text"
  }
);

// 3. Vị trí địa lý (2dsphere)
db.diadiem.createIndex({ viTri: "2dsphere" }, { name: "idx_diadiem_vitri" });

// 4. Compound index: loại + thành phố + rating
db.diadiem.createIndex(
  { loai: 1, "diaChi.thanhPho": 1, ratingAvg: -1 },
  { name: "idx_diadiem_loai_thanhpho_rating" }
);

// 5. Partial index: chỉ địa điểm ACTIVE, sắp rating và số review
db.diadiem.createIndex(
  { trangThai: 1, ratingAvg: -1, reviewCount: -1 },
  {
    name: "idx_diadiem_active_rating",
    partialFilterExpression: { trangThai: "ACTIVE" }
  }
);

// 6. Index theo danh mục
db.diadiem.createIndex({ "danhMuc.danhMucId": 1 }, { name: "idx_diadiem_danhmuc" });

// 7. Mới nhất
db.diadiem.createIndex({ ngayTao: -1 }, { name: "idx_diadiem_ngaytao" });

print("Đã tạo 7 index cho collection diadiem");
printjson(db.diadiem.getIndexes());

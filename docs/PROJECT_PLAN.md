# TRAVELTASTE — KẾ HOẠCH CHI TIẾT XÂY DỰNG NỀN TẢNG ĐÁNH GIÁ ĐỊA ĐIỂM

**Mục tiêu:** Xây dựng nền tảng cộng đồng tìm kiếm địa điểm du lịch / ăn uống, viết đánh giá, chấm điểm sao và bình luận nhiều cấp — mô hình lại trang chi tiết quán ăn trên Google Maps.

**Ngăn công nghệ:**
- Backend: Java 21 + Spring Boot 3.x (Spring Web MVC, Spring Data MongoDB, Spring Security, Bean Validation), REST API JSON
- Frontend: React 18 + Vite + Axios + Leaflet (OpenStreetMap, không cần API key)
- CSDL: MongoDB 7+, database `review_diadiem`
- Lưu ảnh: URL (mẫu) + upload thư mục local `uploads/` (demo)

**Nhóm 3 sinh viên:** SV1 (Data Architect & CRUD Lead), SV2 (Advanced Query Specialist), SV3 (Fullstack Integrator & DB Tester)

---

## 1. THIẾT KẾ CSDL MONGODB — LƯU ĐÁNH GIÁ, ẢNH, BÌNH LUẬN (1.5đ)

Đây là phần quan trọng chấm 1.5 điểm (barem): document `diadiem` phải nhúng mảng `reviews[]`, mảng `hinhAnh[]` và mảng bình luận lồng nhau `binhLuan[]` → `traLoi[]`.

### 1.1. Ý tưởng chính (giống Google Maps)

Khi người dùng chọn 1 quán ăn trên Google Maps, trang chi tiết hiển thị **mọi thứ trong 1 lần tải**: thông tin quán, ảnh quán, điểm trung bình, số đánh giá, danh sách đánh giá kèm ảnh + tên người đánh giá, và phản hồi của chủ quán. 

TravelTaste làm tương tự: collection `diadiem` là document lớn chứa tất cả. Đọc trang chi tiết = **1 query** duy nhất, không cần `$join`/`$lookup` nhiều collection.

### 1.2. Collection `diadiem` (document một địa điểm)

```json
{
  "_id": ObjectId("..."),
  "ten": "Phở Thìn Lò Đúc",
  "slug": "pho-thin-lo-duc",
  "tenKhongDau": "pho thin lo duc",
  "loai": "AN_UONG",
  "danhMuc": [
    { "danhMucId": ObjectId("..."), "ten": "Ăn uống", "slug": "an-uong" }
  ],
  "moTa": "Phở bò truyền thống ở Hà Nội...",
  "diaChi": {
    "so": "13",
    "duong": "Lò Đúc",
    "quan": "Hai Bà Trưng",
    "thanhPho": "Hà Nội"
  },
  "viTri": {
    "type": "Point",
    "coordinates": [105.8423, 21.0215]   // [kinhDo, viDo] — lng trước, lat sau
  },
  "hinhAnh": [ "https://.../photo1.jpg", "https://.../photo2.jpg" ],   // 1–8 URL ảnh địa điểm
  "ratingAvg": 4.52,          // chỉ server ghi, tính lại tự động
  "reviewCount": 8,           // chỉ server ghi
  "reviews": [                // MẢNG ĐÁNH GIÁ (nhúng, tối đa 500 phần tử)
    {
      "reviewId": ObjectId("..."),
      "userId": ObjectId("..."),
      "tenUser": "Nguyễn Văn A",
      "avatarUser": "https://.../avatar.jpg",
      "soSao": 5,
      "tieuDe": "Phở ngon rất đáng thử",
      "noiDung": "Nước dùng đậm đắc, thịt bò tươi...",
      "hinhAnh": [ "https://.../review-photo1.jpg" ],   // 0–5 URL ảnh trong review
      "ngayTao": ISODate("2026-01-10"),
      "ngayCapNhat": ISODate("2026-01-10"),
      "binhLuan": [           // MẢNG BÌNH LUẬN lồng trong review (tối đa 200)
        {
          "commentId": ObjectId("..."),
          "userId": ObjectId("..."),
          "tenUser": "Trần Thị B",
          "avatarUser": "https://.../avatar.jpg",
          "noiDung": "Quán này đúng vậy!",
          "ngayTao": ISODate("2026-01-11"),
          "traLoi": [           // TRẢ LỜI (tối đa 2 cấp nữa → tổng tối đa 3 cấp)
            {
              "commentId": ObjectId("..."),
              "userId": ObjectId("..."),
              "tenUser": "Chủ quán",
              "noiDung": "Cảm ơn bạn đã đánh giá!",
              "ngayTao": ISODate("2026-01-12")
            }
          ]
        }
      ]
    }
  ],
  "trangThai": "ACTIVE",
  "ngayTao": ISODate("2026-01-01"),
  "ngayCapNhat": ISODate("2026-01-12")
}
```

### 1.3. Các collection đi kèm

| Collection | Mục đích | Trường quan trọng |
|---|---|---|
| `users` | Tài khoản người dùng/admin | `_id`, `username`, `hoTen`, `email`, `passwordHash` (BCrypt), `avatar`, `role` (ADMIN/USER), `trangThai` |
| `danhmuc` | Danh mục địa điểm | `_id`, `ten`, `slug`, `icon`, `thuTu`, `trangThai` |

### 1.4. Giới hạn kiểm soát document 16MB (báo cáo)

- Tối đa **500 review/địa điểm** (mẫu ~8 review)
- Tối đa **200 bình luận/review**
- Tối đa **3 cấp bình luận** (`binhLuan` → `traLoi` → `traLoi`)
- Nội dung review ≤ 2000 ký tự; bình luận ≤ 1000 ký tự
- Ảnh chỉ lưu **URL**, không lưu binary (tránh phình document)

Ước lượng: 500 review × (~2KB text + 5 URL × 100B) ≈ 1.25MB → an toàn dưới 16MB.

### 1.5. Index của `diadiem` (7 index, chạy qua script `01_indexes.js`)

1. `{ slug: 1 }` unique
2. Text index trên `ten`, `tenKhongDau`, `moTa`, `diaChi.quan`, `diaChi.thanhPho`, `danhMuc.ten` (trọng số: tên cao nhất, `default_language: "none"`)
3. `{ viTri: "2dsphere" }` — tìm gần vị trí
4. Compound `{ loai: 1, diaChi.thanhPho: 1, ratingAvg: -1 }`
5. Partial `{ trangThai: 1, ratingAvg: -1, reviewCount: -1 }` (chỉ ACTIVE)
6. `{ "danhMuc.danhMucId": 1 }`
7. `{ ngayTao: -1 }`

---

## 2. MVP (PHIÊN BẢN TỐI THIỂU) vs FULL FEATURES

### MVP — phải có để demo bảo vệ (đủ 10 điểm barem)

| Nhóm | Chức năng |
|---|---|
| Auth | Đăng ký, đăng nhập, đăng xuất, xem `/api/auth/me` |
| Danh mục | Xem danh mục (public), CRUD danh mục (admin) |
| Địa điểm | Xem danh sách, xem chi tiết (1 query kèm reviews), tạo/sửa/ẩn (admin) |
| Đánh giá | Viết 1 review/địa điểm, chấm 1–5 sao, thêm ảnh, sửa/xóa review của mình |
| Bình luận | Bình luận review, trả lời (tối đa 3 cấp) |
| Rating | `ratingAvg` và `reviewCount` tự cập nhật ngay sau mỗi thao tác review |
| Tìm kiếm | Tìm theo từ khóa (có dấu/không dấu), lọc loại/thành phố/rating |
| Top 10 | Top 10 địa điểm nổi bật (công thức có trọng số) |
| Gần tôi | Tìm theo tọa độ + bán kính (2dsphere) |
| Dummy data | 100 địa điểm, mỗi địa điểm 5–15 review, ảnh, danh mục, 120 user |
| Demo | 11 bước kịch bản demo chạy trơn, không sửa tay trong DB |

### Full (sau MVP, nếu còn thời gian)

- Upload ảnh thật (multipart) + xóa file nếu DB thất bại
- Trang quản trị đầy đủ (dashboard, kiểm duyệt review, khóa user)
- Hồ sơ người dùng (xem review của mình, đổi avatar/mật khẩu)
- Test tải k6 (100 VU) + bằng chứng `explain()` index
- Phân trang review, histogram sao trên chi tiết địa điểm

---

## 3. PHÂN CÔNG 3 THÀNH VIÊN

| Thành viên | Vai trò | Nhiệm vụ chính |
|---|---|---|
| **SV1** | Data Architect & CRUD Lead | Thiết kế schema `diadiem` nhúng reviews đa cấp; viết API CRUD địa điểm và gửi đánh giá/bình luận; thiết kế UI chi tiết địa điểm |
| **SV2** | Advanced Query Specialist | Thiết lập Text Index + compound index + 2dsphere; viết Aggregation Pipeline tính rating trung bình realtime và Top 10; viết script `verify_data.js` |
| **SV3** | Fullstack Integrator & DB Tester | Nạp 100 địa điểm + hàng trăm review mẫu; viết script test tải (k6); thiết kế giao diện mạng xã hội review; điều phối Demo |

---

## 4. DANH SÁCH CHỨC NĂNG VÀ ÁNH XẠ API

### 4.1. F1 — Xác thực (Auth)

| Chức năng | Method | Path | Auth | Body | Response |
|---|---|---|---|---|---|
| Đăng ký | POST | `/api/auth/register` | public | `{username, hoTen, email, password}` | `201 {id, username, hoTen, email, role}` |
| Đăng nhập | POST | `/api/auth/login` | public | `{usernameOrEmail, password}` | `200 {id, username, hoTen, role}` + session cookie |
| Đăng xuất | POST | `/api/auth/logout` | user | — | `204` |
| Xem tôi | GET | `/api/auth/me` | user | — | `200 {id, username, hoTen, avatar, role}` hoặc `401` |

### 4.2. F2 — Quản lý danh mục (Admin)

| Chức năng | Method | Path | Auth | Body | Response |
|---|---|---|---|---|---|
| Xem danh mục | GET | `/api/danh-muc` | public | — | `200 [{id, ten, slug, moTa, icon, thuTu}]` |
| Thêm danh mục | POST | `/api/admin/danh-muc` | ADMIN | `{ten, moTa, icon, thuTu}` | `201` |
| Sửa danh mục | PUT | `/api/admin/danh-muc/{id}` | ADMIN | `{ten, moTa, icon, thuTu, trangThai}` | `200` |
| Xoá/ẩn danh mục | DELETE | `/api/admin/danh-muc/{id}` | ADMIN | — | `204` hoặc `409` nếu đang dùng |

### 4.3. F3 — Quản lý địa điểm

| Chức năng | Method | Path | Auth | Body / query | Response |
|---|---|---|---|---|---|
| Danh sách địa điểm | GET | `/api/dia-diem` | public | `q, loai, thanhPho, danhMuc, minRating, sort, page, size` | `200 PageResponse<DiaDiemSummary>` (không trả reviews) |
| Chi tiết địa điểm | GET | `/api/dia-diem/{slug}` | public | `reviewPage, reviewSize` | `200 DiaDiemDetail` (có full reviews + bình luận) |
| Top 10 nổi bật | GET | `/api/dia-diem/top10` | public | — | `200 [DiaDiemSummary]` |
| Gần tôi | GET | `/api/dia-diem/gan-toi` | public | `lat, lng, banKinhKm, limit` | `200 [{..., khoangCachKm}]` |
| Tạo địa điểm | POST | `/api/admin/dia-diem` | ADMIN | `DiaDiemRequest` | `201` |
| Sửa địa điểm | PUT | `/api/admin/dia-diem/{id}` | ADMIN | `DiaDiemRequest` | `200` |
| Xoá địa điểm | DELETE | `/api/admin/dia-diem/{id}` | ADMIN | — | `204` |

### 4.4. F4 — Viết / sửa / xoá đánh giá

| Chức năng | Method | Path | Auth | Body | Response |
|---|---|---|---|---|---|
| Tạo review | POST | `/api/dia-diem/{placeId}/reviews` | user | `{soSao, tieuDe, noiDung, hinhAnh[]}` | `201 Review` + `ratingAvg`, `reviewCount` mới |
| Sửa review | PUT | `/api/dia-diem/{placeId}/reviews/{reviewId}` | owner/ADMIN | `{soSao, tieuDe, noiDung, hinhAnh[]}` | `200 Review` |
| Xoá review | DELETE | `/api/dia-diem/{placeId}/reviews/{reviewId}` | owner/ADMIN | — | `204` |
| Xem review | GET | `/api/dia-diem/{placeId}/reviews` | public | `page, size, sort` | `200 PageResponse<Review>` |

> Quy tắc quan trọng: `ratingAvg` và `reviewCount` **không bao giờ nhận từ client**. Sau mỗi tạo/sửa/xóa review, gọi `RatingService.recalculate(placeId)`.

### 4.5. F5 — Bình luận và trả lời nhiều cấp

| Chức năng | Method | Path | Auth | Body | Response |
|---|---|---|---|---|---|
| Bình luận review | POST | `/api/dia-diem/{placeId}/reviews/{reviewId}/comments` | user | `{noiDung}` | `201 BinhLuan` |
| Trả lời bình luận | POST | `/api/dia-diem/{placeId}/reviews/{reviewId}/comments/{commentId}/replies` | user | `{noiDung}` | `201 BinhLuan` |
| Sửa bình luận | PUT | `/api/dia-diem/{placeId}/reviews/{reviewId}/comments/{commentId}` | owner/ADMIN | `{noiDung}` | `200 BinhLuan` |
| Xoá bình luận | DELETE | `/api/dia-diem/{placeId}/reviews/{reviewId}/comments/{commentId}` | owner/ADMIN | — | `204` |

> Trả lời của trả lời dùng cùng endpoint replies, `commentId` là id trả lời cha; service tự tìm trong cây. Tối đa 3 cấp.

### 4.6. F6 — Tính rating trung bình realtime (service nội bộ, không phải API endpoint)

`RatingService.recalculate(placeId)` chạy sau mỗi thao tác review, dùng aggregation update pipeline:

```js
db.diadiem.updateOne(
  { _id: ObjectId(placeId) },
  [ {
    $set: {
      reviewCount: { $size: { $ifNull: ["$reviews", []] } },
      ratingAvg: { $round: [ { $ifNull: [ { $avg: "$reviews.soSao" }, 0 ] }, 2 ] },
      ngayCapNhat: "$$NOW"
    }
  } ]
);
```

### 4.7. F7 — Tìm kiếm địa điểm

| Chức năng | Method | Path | Query | Mô tả |
|---|---|---|---|---|
| Tìm kiếm | GET | `/api/dia-diem` | `q, loai, thanhPho, danhMuc, minRating, sort, page, size` | `$text` search + filter + sort + `$facet` phân trang |

- `q` → `$text: { $search: q }` + `$meta: "textScore"`
- Có dấu → khớp `ten`; không dấu → khớp `tenKhongDau`
- `sort`: `relevance` (mặc định), `rating`, `newest`

### 4.8. F8 — Top 10 địa điểm nổi bật

GET `/api/dia-diem/top10` — công thức Bayesian:

```
diemNoiBat = (ratingAvg × reviewCount + 5 × 3.5) / (reviewCount + 5)
```

Chỉ lấy `ACTIVE`, `reviewCount ≥ 3`, sắp `diemNoiBat` desc.

### 4.9. F9 — Tìm theo vị trí ("Gần tôi")

GET `/api/dia-diem/gan-toi?lat=&lng=&banKinhKm=&limit=` — `$geoNear` với `maxDistance` (km→mét), trả thêm `khoangCachKm`.

### 4.10. F10 — Upload ảnh

| Chức năng | Method | Path | Auth | Mô tả |
|---|---|---|---|---|
| Upload ảnh | POST | `/api/upload` | user | Multipart, field `file`, jpeg/png/webp, ≤5MB, lưu `uploads/yyyy/MM/{uuid}.{ext}` |

### 4.11. F11 — Trang quản trị (Admin)

- Dashboard: tổng địa điểm, user, review, top 5
- CRUD danh mục, CRUD địa điểm, danh sách user (khóa/mở khóa)
- Kiểm duyệt: xoá review/bình luận vi phạm

### 4.12. F12 — Trang người dùng

- Xem hồ sơ, số review đã viết, danh sách review của mình
- Sửa tên/avatar, đổi mật khẩu

---

## 5. FORMAT API CHUNG

Thành công:
```json
{ "success": true, "data": { ... }, "message": null }
```

Lỗi:
```json
{ "success": false, "data": null, "message": "...", "errors": { ... } }
```

Mã lỗi: 400 validate, 401 chưa đăng nhập, 403 không quyền, 404 không tìm thấy, 409 trùng/đã review, 413 file quá lớn, 422 vi phạm nghiệp vụ (quá 500 review, quá 3 cấp bình luận), 500 lỗi hệ thống.

Phân trang: `page` (1-based), `size` (mặc định 10, tối đa 50).

---

## 6. ROADMAP THEO TUẦN (4–5 tuần)

| Tuần | SV1 | SV2 | SV3 | Mục tiêu tuần |
|---|---|---|---|---|
| 1 | Khởi tạo Spring Boot Java 21, model `diadiem`/`users`/`danhmuc`, repository cơ bản, config MongoDB | Viết script `01_indexes.js` (7 index), script sinh dummy data 100 địa điểm | Khởi tạo React + Vite, giao diện trang chủ, danh sách địa điểm | Môi trường chạy, kết nối BE-FE-Mongo |
| 2 | API auth (register/login/me), API CRUD địa điểm, API tạo review | Aggregation `recalculate` rating, pipeline Top 10, pipeline tìm kiếm | Trang chi tiết địa điểm (Google Maps style), form review, hiển thị reviews + bình luận | Auth + địa điểm + review hoạt động |
| 3 | API bình luận + trả lời, API upload ảnh, admin CRUD danh mục | Text index + compound index, bằng chứng `explain()`, script verify | Trang tìm kiếm, Top 10, Gần tôi, phân trang | Tất cả API + tìm kiếm hoạt động |
| 4 | Admin kiểm duyệt, khóa user, hồ sơ người dùng | Test tải k6, `mongostat`, verify data sau tải | Hoàn thiện UI responsive, skeleton loading, kiểm duyệt demo | Demo sẵn sàng, dữ liệu mẫu đủ |
| 5 | Chuẩn bị slide/báo cáo, chạy lại kịch bản demo 11 bước | Chụp màn hình bằng chứng index, aggregation | Chạy kèm demo, ghi video | Nộp bài |

---

## 7. KỊCH BẢN DEMO 11 BƯỚC (bảo vệ)

| Bước | Ai | Thao tác | Chứng minh |
|---|---|---|---|
| 0 | Cả nhóm | Import data, chạy index, khởi động app | Môi trường sạch |
| 1 | SV3 | Tìm "pho" và "phở" trên web | Text index + không dấu |
| 2 | SV2 | Compass: `getIndexes()`, `explain()` | Index thật, không COLLSCAN |
| 3 | SV1 | Đăng nhập, gửi review 1 sao kèm ảnh | Ghi review vào mảng nhúng |
| 4 | SV1 | Compass xem `reviews` mới | Document store cập nhật |
| 5 | SV2 | Quan sát điểm TB trên web đổi ngay | Aggregation realtime |
| 6 | SV1 | Trả lời một bình luận | Bình luận nhiều cấp |
| 7 | SV3 | Mở Top 10, "Gần tôi" | Aggregation + 2dsphere |
| 8 | SV3 | Chạy k6 100 VU | Chịu tải, không mất review |
| 9 | SV2 | Chạy `verify_data.js` | 0 document lệch rating |
| 10 | SV1 | Admin tạo/sửa/ẩn địa điểm | CRUD + phân quyền |
| 11 | Cả nhóm | Đối chiếu barem | Đủ điểm từng mục |

---

## 8. RÚU RỜ & GIẢM THIỂM

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Document `diadiem` vượt 16MB | Thấp | Giới hạn 500 review, text ≤2000, ảnh chỉ URL |
| Ghi đồng thời cùng document gây contention | Trung bình | Test tải; chấp nhận quy mô demo; ghi rõ báo cáo |
| Text index tiếng Việt có dấu | Trung bình | Dùng song song `ten` + `tenKhongDau` |
| Dummy data 100 địa điểm tốn thời gian | Trung bình | Sinh script, 20 tên thật/thành phố |
| Load test 100 VU trên máy yếu | Trung bình | Giảm còn 50 VU nếu cần |

---

## 9. CÁC TIÊU CHÍ CHẤM ĐIỂM (BAREM 10 Đ) — KIỂM TRA LẠI

- [ ] **1.0đ — Báo cáo:** phân tích ưu thế MongoDB (document, embedding, atomicity, 16MB, so sánh SQL)
- [ ] **1.5đ — Schema:** sơ đồ + giải thích `diadiem.reviews[].binhLuan[].traLoi[]`, `hinhAnh[]` ← **phần này là trọng tâm tài liệu này**
- [ ] **2.5đ — CRUD:** danh mục, địa điểm, review, bình luận, chấm điểm qua UI
- [ ] **2.5đ — Nâng cao:** text index + compound + 2dsphere; aggregation recalc; Top 10
- [ ] **1.0đ — Dummy data:** 100 địa điểm, mỗi địa điểm 5–15 review, ảnh, danh mục, 120 user
- [ ] **1.5đ — Demo:** 11 bước chạy trơn, không sửa tay trong DB

---

**Lưu ý:** Tài liệu này là thiết kế/kế hoạch. Theo quy trình, nhóm cần **phê duyệt** nội dung này trước khi bắt tay viết mã sản xuất. Nếu nhóm đồng ý, bước kế tiếp là chi tiết task-by-task và khởi tạo mã nguồn.

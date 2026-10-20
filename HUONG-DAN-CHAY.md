# TravelTaste — Hướng dẫn chạy dự án

Nền tảng đánh giá & review địa điểm du lịch / ăn uống.
Backend: Java 21 + Spring Boot 3.x · Frontend: React 18 + Vite · CSDL: MongoDB 7+

---

## Mục lục

1. [Cài đặt công cụ cần thiết](#1-cài-đặt-công-cụ-cần-thiết)
2. [Khởi động MongoDB](#2-khởi-động-mongodb)
3. [Import database](#3-import-database)
4. [Chạy Backend](#4-chạy-backend)
5. [Chạy Frontend](#5-chạy-frontend)
6. [Kiểm tra hệ thống](#6-kiểm-tra-hệ-thống)
7. [Xử lý lỗi thường gặp](#7-xử-lý-lỗi-thường-gặp)

---

## 1. Cài đặt công cụ cần thiết

| Công cụ | Phiên bản | Ghi chú |
|---------|-----------|---------|
| JDK | 21 | `java -version` |
| Maven | 3.8+ | `mvn -version` — **bắt buộc cho backend** |
| Node.js | 18+ | `node -v` và `npm -v` — **bắt buộc cho frontend** |
| MongoDB | 7+ | Server + Compass (GUI) |
| MongoDB Shell | tuỳ chọn | `mongosh` — dùng để chạy script import nhanh |

### 1.1. Cài Maven (Windows)

1. Tải: https://maven.apache.org/download.cgi → **Binary zip archive** (ví dụ `apache-maven-3.9.x-bin.zip`)
2. Giải nén vào `C:\Program Files\Apache\maven`
3. Thêm vào PATH:
   - Nhấn `Win` → gõ **"Edit the system environment variables"**
   - **Environment Variables** → *System variables* → chọn `Path` → **Edit** → **New**
   - Dán: `C:\Program Files\Apache\maven\bin` → OK hết các cửa sổ
4. **Khởi động lại terminal** (bắt buộc)
5. Kiểm tra: `mvn -version`


### 1.2. Cài Node.js

Tải từ https://nodejs.org/ → bản LTS. Kiểm tra: `node -v` và `npm -v`.

---

## 2. Khởi động MongoDB

MongoDB phải chạy ở cổng mặc định `27017` (backend kết nối qua `mongodb://localhost:27017/review_diadiem`).

```powershell
# Kiểm tra service
Get-Service -Name "MongoDB"

# Khởi động
Start-Service -Name "MongoDB"
```

Nếu không cài dưới dạng service, chạy `mongod.exe` thủ công.

---

## 3. Import database

Cần tạo **3 collection** trong database `review_diadiem`: `users`, `danhmuc`, `diadiem`.

### 3.1. Cách A — Dùng MongoDB Compass (khuyên dùng, không cần `mongosh`)

#### 3.1.1. Tạo collection
Mở Compass → kết nối `mongodb://localhost:27017` → chọn/tạo database `review_diadiem` → tạo 3 collection:
`users`, `danhmuc`, `diadiem`.

#### 3.1.2. Insert dữ liệu vào `users`
Chọn collection `users` → **Insert Document** → dán từng document:

```json
{
  "username": "admin",
  "hoTen": "Quản trị viên",
  "email": "admin@traveltaste.local",
  "passwordHash": "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
  "avatar": null,
  "role": "ADMIN",
  "trangThai": "ACTIVE",
  "ngayTao": { "$date": "2026-10-20T00:00:00Z" },
  "ngayCapNhat": { "$date": "2026-10-20T00:00:00Z" }
}
```

```json
{
  "username": "an123",
  "hoTen": "Nguyễn Văn An",
  "email": "an123@traveltaste.local",
  "passwordHash": "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
  "avatar": null,
  "role": "USER",
  "trangThai": "ACTIVE",
  "ngayTao": { "$date": "2026-10-20T00:00:00Z" },
  "ngayCapNhat": { "$date": "2026-10-20T00:00:00Z" }
}
```

```json
{
  "username": "binh123",
  "hoTen": "Trần Thị Bình",
  "email": "binh123@traveltaste.local",
  "passwordHash": "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
  "avatar": null,
  "role": "USER",
  "trangThai": "ACTIVE",
  "ngayTao": { "$date": "2026-10-20T00:00:00Z" },
  "ngayCapNhat": { "$date": "2026-10-20T00:00:00Z" }
}
```

#### 3.1.3. Insert dữ liệu vào `danhmuc`
```json
{ "ten": "Ăn uống", "slug": "an-uong", "moTa": "Nhà hàng, quán ăn, cà phê", "icon": "bi-cup-hot", "thuTu": 1, "trangThai": "ACTIVE", "ngayTao": { "$date": "2026-10-20T00:00:00Z" }, "ngayCapNhat": { "$date": "2026-10-20T00:00:00Z" } }
```
```json
{ "ten": "Du lịch", "slug": "du-lich", "moTa": "Điểm tham quan, cảnh quan", "icon": "bi-geo-alt", "thuTu": 2, "trangThai": "ACTIVE", "ngayTao": { "$date": "2026-10-20T00:00:00Z" }, "ngayCapNhat": { "$date": "2026-10-20T00:00:00Z" } }
```
```json
{ "ten": "Lưu trú", "slug": "luu-tru", "moTa": "Khách sạn, homestay", "icon": "bi-building", "thuTu": 3, "trangThai": "ACTIVE", "ngayTao": { "$date": "2026-10-20T00:00:00Z" }, "ngayCapNhat": { "$date": "2026-10-20T00:00:00Z" } }
```

#### 3.1.4. Insert dữ liệu vào `diadiem`
Lấy `_id` của các document trên (Compass hiển thị ở cột `_id`) để thay vào `<...>`.

```json
{
  "ten": "Phở Thìn Lò Đúc",
  "slug": "pho-thin-lo-duc",
  "tenKhongDau": "pho thin lo duc",
  "loai": "AN_UONG",
  "danhMuc": [ { "danhMucId": "<ID_DANHMUC_AN_UONG>", "ten": "Ăn uống", "slug": "an-uong" } ],
  "moTa": "Phở bò truyền thống tại Lò Đúc, Hà Nội. Nước dùng đậm đắc, thịt bò tươi ngon.",
  "diaChi": { "so": "13", "duong": "Lò Đúc", "quan": "Hai Bà Trưng", "thanhPho": "Hà Nội" },
  "viTri": { "type": "Point", "coordinates": [105.8423, 21.0215] },
  "hinhAnh": ["https://images.unsplash.com/photo-1569720141087-e6a1f716c63f?w=800"],
  "ratingAvg": 4.5,
  "reviewCount": 1,
  "reviews": [
    {
      "reviewId": "review-001",
      "userId": "<ID_USER_AN123>",
      "tenUser": "Nguyễn Văn An",
      "avatarUser": null,
      "soSao": 5,
      "tieuDe": "Phở ngon rất đáng thử",
      "noiDung": "Nước dùng đậm đắc, thịt bò tươi, mớ phở mịn.",
      "hinhAnh": [],
      "ngayTao": { "$date": "2026-01-10T00:00:00Z" },
      "ngayCapNhat": { "$date": "2026-01-10T00:00:00Z" },
      "binhLuan": [
        {
          "commentId": "comment-001",
          "userId": "<ID_USER_BINH123>",
          "tenUser": "Trần Thị Bình",
          "avatarUser": null,
          "noiDung": "Nước dùng đậm đắc quá, mình thấy hơi mặn.",
          "ngayTao": { "$date": "2026-01-11T00:00:00Z" },
          "ngayCapNhat": { "$date": "2026-01-11T00:00:00Z" },
          "traLoi": [
            {
              "commentId": "comment-002",
              "userId": "<ID_USER_AN123>",
              "tenUser": "Nguyễn Văn An",
              "avatarUser": null,
              "noiDung": "Cảm ơn bạn, quán sẽ điều chỉnh nước dùng.",
              "ngayTao": { "$date": "2026-01-12T00:00:00Z" },
              "ngayCapNhat": { "$date": "2026-01-12T00:00:00Z" },
              "traLoi": []
            }
          ]
        }
      ]
    }
  ],
  "trangThai": "ACTIVE",
  "ngayTao": { "$date": "2026-10-20T00:00:00Z" },
  "ngayCapNhat": { "$date": "2026-10-20T00:00:00Z" }
}
```

```json
{
  "ten": "Bún chả Hương Liên",
  "slug": "bun-cha-huong-lien",
  "tenKhongDau": "bun cha huong lien",
  "loai": "AN_UONG",
  "danhMuc": [ { "danhMucId": "<ID_DANHMUC_AN_UONG>", "ten": "Ăn uống", "slug": "an-uong" } ],
  "moTa": "Bún chả nổi tiếng ở Hà Nội, từng được Barack Obama dùng thử.",
  "diaChi": { "so": "24", "duong": "Lê Văn Hữu", "quan": "Thanh Xuân", "thanhPho": "Hà Nội" },
  "viTri": { "type": "Point", "coordinates": [105.8234, 20.9914] },
  "hinhAnh": ["https://images.unsplash.com/photo-15247656760-e28560e18a14?w=800"],
  "ratingAvg": 5.0,
  "reviewCount": 1,
  "reviews": [
    {
      "reviewId": "review-002",
      "userId": "<ID_USER_AN123>",
      "tenUser": "Nguyễn Văn An",
      "avatarUser": null,
      "soSao": 5,
      "tieuDe": "Bún chả đặc biệt",
      "noiDung": "Mùi nướng thơm phức, chấm chua ngọt vừa khẩu vị.",
      "hinhAnh": [],
      "ngayTao": { "$date": "2026-02-05T00:00:00Z" },
      "ngayCapNhat": { "$date": "2026-02-05T00:00:00Z" },
      "binhLuan": []
    }
  ],
  "trangThai": "ACTIVE",
  "ngayTao": { "$date": "2026-10-20T00:00:00Z" },
  "ngayCapNhat": { "$date": "2026-10-20T00:00:00Z" }
}
```

```json
{
  "ten": "Hồ Hoàn Kiếm",
  "slug": "ho-hoan-kiem",
  "tenKhongDau": "ho hoan kiem",
  "loai": "DU_LICH",
  "danhMuc": [ { "danhMucId": "<ID_DANHMUC_DU_LICH>", "ten": "Du lịch", "slug": "du-lich" } ],
  "moTa": "Hồ nước trong lòng thành Hà Nội, điểm check-in du lịch nổi tiếng.",
  "diaChi": { "so": "", "duong": "Đình Tiên Hoàng", "quan": "Hoàn Kiếm", "thanhPho": "Hà Nội" },
  "viTri": { "type": "Point", "coordinates": [105.8523, 21.0321] },
  "hinhAnh": ["https://images.unsplash.com/photo-1517728633855-9e9e4f7c3c4c?w=800"],
  "ratingAvg": 5.0,
  "reviewCount": 1,
  "reviews": [
    {
      "reviewId": "review-003",
      "userId": "<ID_USER_BINH123>",
      "tenUser": "Trần Thị Bình",
      "avatarUser": null,
      "soSao": 5,
      "tieuDe": "Đẹp vào buổi tối",
      "noiDung": "Ánh đèn soi lên hồ rất romantic.",
      "hinhAnh": [],
      "ngayTao": { "$date": "2026-03-01T00:00:00Z" },
      "ngayCapNhat": { "$date": "2026-03-01T00:00:00Z" },
      "binhLuan": []
    }
  ],
  "trangThai": "ACTIVE",
  "ngayTao": { "$date": "2026-10-20T00:00:00Z" },
  "ngayCapNhat": { "$date": "2026-10-20T00:00:00Z" }
}
```

#### 3.1.5. Tạo 7 index cho collection `diadiem`
Chọn collection `diadiem` → tab **Indexes** → **+ Create Index**:

| Tên index | Trường | Tuỳ chọn |
|-----------|--------|----------|
| `slug_1` | `slug` | Unique |
| `idx_diadiem_text` | `ten`, `tenKhongDau`, `moTa`, `diaChi.quan`, `diaChi.thanhPho`, `danhMuc.ten` | Text index · weights: `ten`=10, `tenKhongDau`=10, `danhMuc.ten`=6, `diaChi.quan`=4, `diaChi.thanhPho`=3, `moTa`=2 · `default_language: none` |
| `idx_diadiem_vitri` | `viTri` | 2dsphere |
| `idx_diadiem_loai_thanhpho_rating` | `loai` ↑, `diaChi.thanhPho` ↑, `ratingAvg` ↓ | Compound |
| `idx_diadiem_active_rating` | `trangThai` ↑, `ratingAvg` ↓, `reviewCount` ↓ | Partial (filter `trangThai = "ACTIVE"`) |
| `idx_diadiem_danhmuc` | `danhMuc.danhMucId` ↑ | 1 |
| `idx_diadiem_ngaytao` | `ngayTao` ↓ | -1 |

### 3.2. Cách B — Dùng `mongosh` (nhanh, tự động)

Cài MongoDB Shell: https://www.mongodb.com/try/download/shell → chọn Windows x64 → cài → **khởi động lại terminal**.

```powershell
cd K:\NoSQL projects\TravelTaste\database

# 1. Tạo index
mongosh --quiet .\01_indexes.js

# 2. Seed dữ liệu mẫu
mongosh --quiet .\02_seed_data.js
```

Hoặc nháy đúp `04_import_data.bat` để chạy cả hai.

> Nếu báo `'mongosh' is not recognized` → chưa thêm vào PATH hoặc chưa cài. Dùng **Cách A** hoặc gọi đường dẫn đầy đủ:
> ```powershell
> & "C:\Program Files\MongoDB\Tools\100\bin\mongosh.exe" --quiet .\01_indexes.js
> ```

### 3.3. Tài khoản demo

| Tài khoản | Mật khẩu | Vai trò |
|-----------|----------|---------|
| `admin` | `123456` | ADMIN |
| `an123` | `123456` | USER |
| `binh123` | `123456` | USER |

> `DataSeeder` trong backend cũng tự tạo admin (`admin` / `admin123`) và user `an123`, `binh123` nếu collection `users` chưa có dữ liệu.

---

## 4. Chạy Backend

Mở terminal riêng:

```powershell
cd K:\NoSQL projects\TravelTaste\backend
mvn spring-boot:run
```

Lần đầu sẽ tải dependencies (1–2 phút). Khi thấy log `Started ReviewdiadiemApplication` là chạy được.

**Địa chỉ:** http://localhost:8080

Kiểm tra nhanh: mở trình duyệt → http://localhost:8080/api/danh-muc

> Chạy bằng IntelliJ: mở **folder `backend`** (không phải folder gốc `TravelTaste`), IDE tự nhận `pom.xml`, bấm nút Run.

---

## 5. Chạy Frontend

Mở terminal khác:

```powershell
cd K:\NoSQL projects\TravelTaste\frontend

# Cài dependency (lần đầu tiên, hoặc mỗi khi package.json thay đổi)
npm install

# Chạy dev server
npm run dev
```

**Địa chỉ:** http://localhost:5173

Vite đã cấu hình proxy `/api` và `/uploads` → `http://localhost:8080`, nên frontend và backend giao tiếp được ngay.

### 5.1. Nếu Vite báo lỗi "Failed to resolve import ..."

Thường do `node_modules` chưa khớp `package.json`. Cài lại sạch:

```powershell
cd K:\NoSQL projects\TravelTaste\frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

Các thư viện đang dùng: `react`, `react-dom`, `react-router-dom`, `axios`, `bootstrap`, `bootstrap-icons`, `leaflet`, `react-leaflet`.

---

## 6. Kiểm tra hệ thống

### 6.1. Kiểm tra API backend

Mở trình duyệt hoặc dùng `curl` (PowerShell: `curl.exe`):

| Kiểm tra | Lệnh | Kết quả mong đợi |
|----------|-------|------------------|
| Danh mục | `curl.exe http://localhost:8080/api/danh-muc` | JSON 3 danh mục |
| Danh sách địa điểm | `curl.exe http://localhost:8080/api/dia-diem` | JSON kèm `content`, `totalElements` |
| Chi tiết địa điểm | `curl.exe http://localhost:8080/api/dia-diem/pho-thin-lo-duc` | JSON có `reviews[]`, `ratingAvg` |
| Top 10 | `curl.exe http://localhost:8080/api/dia-diem/top10` | JSON 10 phần tử |
| Đăng nhập | `curl.exe -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d "{\"usernameOrEmail\":\"an123\",\"password\":\"123456\"}"` | `success: true` |

### 6.2. Luồng demo trên trình duyệt

1. Mở http://localhost:5173/dang-nhap → đăng nhập `an123` / `123456`
2. Vào trang chủ → xem **Top 10 nổi bật**
3. Vào **Địa điểm** → tìm "pho" (không dấu) và "phở" (có dấu) → cùng ra kết quả
4. Mở **Phở Thìn Lò Đúc** → xem ảnh, điểm trung bình, review kèm ảnh, bình luận lồng nhau
5. Viết đánh giá mới (chọn sao + nội dung) → trang reload, **điểm trung bình cập nhật ngay**
6. Mở MongoDB Compass → collection `diadiem` → xem review mới nằm trong mảng `reviews[]`
7. Vào **Gần tôi** → cho phép trình duyệt lấy vị trí → xem danh sách theo khoảng cách

---

## 7. Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|------|-------------|----------|
| `'mvn' is not recognized` | Maven chưa cài / chưa có trong PATH | Cài Maven + thêm `C:\...\maven\bin` vào PATH + khởi động lại terminal |
| `'mongosh' is not recognized` | MongoDB Shell chưa cài | Cài shell, hoặc dùng Compass (mục 3.1) |
| `Failed to resolve import "react-router-dom"` / `"bootstrap..."` | Thiếu dependency | `npm install` (xóa `node_modules` rồi cài lại nếu vẫn lỗi) |
| `cannot find symbol` khi build backend | Thiếu import trong Java | Kiểm tra lại log lỗi, báo lại để sửa |
| `Port 8080 was already in use` | Backend đã chạy hoặc port bị chiếm | Đổi `server.port` trong `application.properties` |
| `Port 5173 was already in use` | Vite đã chạy | Tắt tiến trình cũ, hoặc dùng `npm run dev -- --port 5174` |
| CORS error trong console | Truy cập sai origin | Luôn vào qua `localhost:5173` (đã có proxy), không mở file HTML trực tiếp |
| 401 khi gọi API cần đăng nhập | Chưa login hoặc session hết hạn | Đăng nhập lại; axios đã cấu hình `withCredentials: true` |
| Backend báo "không có Spring Boot" | Mở sai thư mục trong IDE | Mở đúng folder `backend` chứa `pom.xml` |
| `Connection refused` tới MongoDB | MongoDB chưa chạy | `Start-Service -Name "MongoDB"` |

---

## Tóm tắt lệnh (copy nhanh)

```powershell
# 1. MongoDB phải chạy
Start-Service -Name "MongoDB"

# 2. Import database (Cách B) hoặc làm tay theo mục 3.1
cd K:\NoSQL projects\TravelTaste\database
mongosh --quiet .\01_indexes.js
mongosh --quiet .\02_seed_data.js

# 3. Terminal 1 — Backend
cd K:\NoSQL projects\TravelTaste\backend
mvn spring-boot:run

# 4. Terminal 2 — Frontend
cd K:\NoSQL projects\TravelTaste\frontend
npm install
npm run dev
```

**Địa chỉ:** Backend http://localhost:8080 · Frontend http://localhost:5173

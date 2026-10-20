# Tích hợp backend và frontend — 20/10/2026

Tài liệu này cập nhật hiện trạng sau báo cáo khảo sát 01–05. Các báo cáo khảo sát trước đó là snapshot trước khi sửa; số endpoint/route, lỗi và liên kết source trong snapshot có thể đã thay đổi.

## Đã thực hiện

- `traveltaste-frontend/src/services/api.ts`: HTTP client cho toàn bộ 32 endpoint cũ, gồm các alias public/admin/search/discover. Có cookie credentials, CSRF token, envelope/error handling và upload multipart. Thêm GET auth/csrf, GET public danh-muc và GET admin dia-diem để phục vụ tích hợp.
- `state/AppContext.tsx` thay DemoContext: khôi phục session qua me, đọc MongoDB thông qua API, ánh xạ field tiếng Việt/nested reviews/comments, thực hiện mutation trên server rồi refresh. Không tạo user/place/review/comment giả khi API lỗi. Loading/error/retry phản ánh request thật.
- Đăng ký thêm username; form địa điểm thêm loại, số nhà/đường/quận/thành phố và tọa độ. Validation độ dài/sao/ảnh theo DTO. Upload PNG/JPEG lên server, không dùng FileReader/data URL thay việc upload.
- Search dùng `/api/search` và phân trang server, có geolocation gọi gan-toi; Top10 lấy ranking từ backend. Thống kê theo ngày/phân bố sao chưa có endpoint riêng nên được tổng hợp trong trình duyệt từ review thật tải qua API, không có số liệu hardcode.
- Quản trị user gọi PATCH khóa/mở khóa. Danh mục/địa điểm/review/comment dùng endpoint tương ứng. Ẩn/hiện địa điểm dùng PUT ACTIVE/HIDDEN; nút Xóa là DELETE vĩnh viễn với xác nhận, không mô tả là xóa mềm. Xóa comment xóa cả nhánh con theo backend.
- Đã bỏ mock auth, fixture data, role picker/sessionStorage giả lập, reset demo, preview routes/pages, trạng thái tải/lỗi giả và các script QA chỉ dành cho mock. Bỏ form sửa hồ sơ/bio vì backend không có update profile; hồ sơ hiện đọc từ me.
- Vite proxy `/api` và `/uploads` tới backend8080. Không thay DB URI đang dùng.

## Các sửa backend cần thiết

- Sửa lỗi compile: model/DTO danh mục, reply placeholder trả void, import User, NearQuery, aggregation generic/projection rating.
- Đưa USER_ID/ROLE session vào Spring Security context, kiểm tra tài khoản ACTIVE mỗi request, bật method security, chặn CRUD địa điểm cho guest/USER. Xoay session ID khi login; logout được controller xử lý duy nhất. Cookie session không lưu token trong web storage.
- CSRF được bật; `/api/auth/csrf` trả token/header để client đính kèm mọi mutation. CORS thêm PATCH. Login sai trả401, các lỗi lookup/ownership/duplicate chính dùng status nghiệp vụ.
- Kích hoạt body/nested validation, sao1–5, danh sách ảnh và status/loai; sửa query tìm tên có/không dấu, category, projection list, phân trang âm, GeoJSON lng/lat và raw ID conversion.
- Category được lookup trước khi embed, đổi tên cập nhật snapshot; không xóa category còn place tham chiếu. Query reference hỗ trợ dữ liệu seed ObjectId và String từ application model.
- Upload kiểm nội dung ảnh, chuyển PNG khi lưu; resource handler theo uploadDir cấu hình.
- Seeder chỉ chạy khi chủ động bật `app.seed.enabled=true`. Mặc định không tự thêm tài khoản/danh mục khi khởi động. Không chạy các script seed phá hủy trên DB hiện tại.

## Kiểm thử

Các script mới:

- `backend/scripts/verify-api.cjs`: HTTP assertions against `127.0.0.1:18080`, cố định cổng để tránh dùng nhầm môi trường bình thường. Cần backend dùng DB kiểm thử riêng. Test đăng ký/login/session/logout, CSRF, 401/403, CRUD và aliases, validation, tìm kiếm/category, geo, rating sau edit, Bayesian top, comment ownership, upload/readback, block user và category reference guard.
- `backend/scripts/IntegrationFixture.java`: chỉ tạo test admin/index ở MongoDB `127.0.0.1:27028/traveltaste_integration`; không truy cập DB ứng dụng. TEST_PASSWORD có thể truyền qua environment. Chương trình không drop database.
- `traveltaste-frontend/scripts/verify-integration.cjs`: Chrome headless + Vite5173 proxy backend18080, thao tác UI thật. Tạo category/place và upload, reload, đăng ký/login USER, review create/edit/comment, reload kiểm chứng persistence; test lỗi HTTP search/retry và guest bị chặn admin. Có ảnh và kiểm overflow ở390/768/1440px.

Đã chạy backend compile, frontend typecheck/build, API suite và browser suite trên MongoDB độc lập trong `.runtime-test/mongo`. Kết quả cuối được ghi ở mục xác minh phía dưới sau khi chạy. `.runtime-test/` được ignore; không đưa log/database/uploads/test credentials vào source hoặc tài liệu. Không sử dụng DB hiện tại ở27017, không commit/push.

## Chạy ứng dụng

```powershell
# Terminal 1, từ thư mục gốc; cần MongoDB của môi trường phát triển đang chạy
cd backend
mvn compile
mvn spring-boot:run

# Terminal 2, từ thư mục gốc
cd traveltaste-frontend
npm ci
npm run dev
```

Frontend `http://127.0.0.1:5173`, backend8080; origin localhost5173 cũng được CORS cho phép. Database vẫn theo `backend/src/main/resources/application.properties`. Cần dùng tài khoản có thật trong DB; đăng ký tạo USER. Không có nút tự chọn ADMIN. Nếu cần khởi tạo demo, chỉ bật seeder trên DB thử nghiệm có chủ đích; không chạy `database/seed_db.mjs` để “kiểm tra kết nối” vì script đó xóa dữ liệu cũ.

Trong phiên này Maven được tìm thấy dưới Maven wrapper cache và JDK21 tại Program Files. Compile offline thành công; plugin spring-boot:run/dependency chưa đủ cache offline nên backend kiểm thử được chạy bằng Java main class và dependency classpath đã có. Khi chạy theo lệnh Maven trên máy khác, cần Maven trong PATH và tải đủ plugin/dependency.

## Giới hạn còn lại

- Chưa có update profile, stats/global/my-review API chuyên biệt; UI không giả vờ lưu hồ sơ. Các thống kê/list cộng đồng được tính/lọc từ dữ liệu thật đã tải.
- Hydration public còn cần list rồi detail cho từng place, giới hạn4 request đồng thời; dữ liệu lớn nên bổ sung API truy vấn chuyên biệt trước khi mở rộng. Chưa load-test.
- Read-modify-save embedded reviews/comments chưa giải quyết đầy đủ concurrent lost update/transaction rollback. Không tuyên bố production-ready hoặc mọi rủi ro khảo sát đã được xử lý.
- Backend hard-delete review/comment/category/place; không có lịch sử xóa/restore cho record đã DELETE. Ẩn/hiện địa điểm khác với DELETE.
- Chưa deploy production/TLS/cookie Secure, chưa chứng nhận bảo mật toàn diện. API aliases được giữ để tương thích; UI dùng một đường canonical cho từng tác vụ.

## Kết quả xác minh cuối

- Backend Maven compile: PASS, 55 source Java, JDK21/Boot3.2.5.
- Frontend npm run build (gồm TypeScript strict): PASS.
- API suite: PASS, 58 HTTP checks, bao phủ các32 endpoint cũ và3 endpoint bổ sung. Có assertions nội dung cho rating, geo và Bayesian ranking.
- Browser suite: PASS, 3 nhóm luồng thực,3 viewport390/768/1440, không pageerror. Dữ liệu tạo qua UI còn sau reload, ảnh upload đọc lại từ server. Search HTTP503 được kiểm retry; lỗi đó được chủ động chèn riêng cho test lỗi, các luồng CRUD/auth dùng backend/MongoDB thật.
- DB kiểm thử: MongoDB8.3 chạy riêng27028, database traveltaste_integration. Không seed/delete/write database ứng dụng27017. Test processes được dừng sau xác minh.

### Chuẩn bị môi trường test riêng (tùy chọn)

Tạo thư mục .runtime-test/mongo và chạy mongod với --dbpath trỏ đúng thư mục này, --port27028, --bind_ip127.0.0.1. Chạy backend với --server.port=18080 --spring.data.mongodb.uri=mongodb://127.0.0.1:27028/traveltaste_integration --app.seed.enabled=false, uploadDir riêng. Không thay file application.properties.

IntegrationFixture.java là bootstrap tối thiểu cho DB này (tạo test admin và geo/unique indexes); biên dịch/chạy với dependency classpath của backend, có thể lấy bằng Maven dependency:build-classpath. TEST_PASSWORD cần giống environment của script verify. Từ root chạy node backend/scripts/verify-api.cjs; từ frontend chạy npm run verify:integration. Không chạy test fixture hoặc test API lên dịch vụ đang dùng dữ liệu thật.

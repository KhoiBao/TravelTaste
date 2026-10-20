# Đối chiếu API với giao diện TravelTaste

Ngày kiểm tra: 20/10/2026. Tài liệu tham chiếu: `C:/Users/LENOVO/Downloads/PROJECT_PLAN.md`. Source kiểm tra: `D:/traveltaste-frontend`.

## Kết luận

**Chưa khớp hoàn toàn và chưa kết nối API thật.** Có màn hình cho phần lớn thao tác CRUD, nhưng frontend hiện dùng mock service / React state. Không có HTTP adapter cho 24 cặp method + endpoint được mô tả cụ thể trong mục 4.1–4.5 và 4.10 của kế hoạch. F7 dùng lại endpoint danh sách; F6 là service nội bộ, không được tính thành endpoint.

Đây là kiểm tra độ tương thích theo tài liệu, không phải xác nhận backend thực tế. Chưa kiểm tra controller Spring Boot, OpenAPI, CORS/cookie/CSRF, response thực tế hoặc database. Không sửa logic ứng dụng, Figma hay backend trong lượt kiểm tra này. Roadmap và các chỉ dẫn triển khai trong tài liệu chỉ được đọc làm ngữ cảnh, không được thực thi.

Các kiểm thử UI PASS trước đây chứng minh giao diện chạy được với mock; **không chứng minh frontend đã tương thích REST API**.

## Các lệch quan trọng

| Mức | Hạng mục | Kế hoạch | Frontend hiện tại | Tác động |
| --- | --- | --- | --- | --- |
| P0 | Kết nối / response / session | HTTP API, envelope `{success,data,message,errors}`, cookie session và `/auth/me` | Chỉ có `services/mock/auth.ts`; `DemoContext` sửa bộ nhớ; kết quả `{ok,message,id}`; vai trò/ID lưu sessionStorage | Chưa thể thay base URL rồi sử dụng API; cần HTTP client, DTO adapter, session bootstrap và xử lý mã lỗi |
| P1 | Top 10 | Bayesian `(ratingAvg*reviewCount+17.5)/(reviewCount+5)`, ACTIVE, ít nhất 3 review | Sắp rating hoặc số review rồi lấy 10; không có điều kiện 3 review | Sai điều kiện và thứ tự xếp hạng so với API |
| P1 | Mỗi user một review/địa điểm | Quy tắc MVP; trùng trả 409 | Tạo mới không kiểm tra cặp user/place; seed có 11 review cùng một user tại từng địa điểm trong Top 3 | UI cho phép thao tác mà API dự kiến từ chối; dữ liệu mock không phản ánh quy tắc |
| P1 | Nội dung review | Tối đa 2000 ký tự | Form cho 5000; mock action không kiểm tra chiều dài | Cho nhập dữ liệu vượt hợp đồng |
| P1 | Nội dung bình luận | Tối đa 1000 ký tự | Form tạo/sửa cho 2000; action sửa kiểm tra 2000, action tạo không kiểm tra độ dài | Cho nhập dữ liệu vượt hợp đồng |
| P1 | Đăng ký và đăng nhập | Register `{username,hoTen,email,password}`; login nhận username hoặc email | Không có trường đăng ký username; mock login chỉ tìm email dù nhãn có username | Thiếu dữ liệu đăng ký và thiếu hành vi đăng nhập username |
| P1 | Địa điểm / danh mục | `loai`, địa chỉ cấu trúc, GeoJSON, nhiều danh mục, nhiều URL ảnh | Một categoryId, một địa chỉ string, một ảnh; không có slug/loai/viTri | Thiếu field nhập liệu và mapping response; mất thông tin nếu gán DTO trực tiếp |
| P1 | Gần tôi | GET `/api/dia-diem/gan-toi` với lat/lng/bán kính và khoảng cách | Không có route, bản đồ, xin vị trí hoặc dữ liệu tọa độ/khoảng cách | Thiếu một tính năng MVP |
| P1 | Upload | Multipart field `file`, server trả URL | FileReader tạo data URL và object `{src,name}` | Không thể gửi thẳng vào `hinhAnh: string[]`; cần upload trước khi lưu |
| P1 | Phân quyền sửa | Owner hoặc ADMIN sửa review/bình luận | Mock và nút sửa chỉ cho chủ sở hữu; admin có xóa/ẩn | ADMIN không sửa nội dung của người khác như hợp đồng cho phép |
| P2 | Số ảnh | Review 0–5; địa điểm 1–8 | Review mặc định tối đa 3; địa điểm tối đa 1 | UI hạn chế hơn kế hoạch, thiếu gallery/multi-upload |
| P2 | Tìm kiếm | q, loai, thanhPho, danhMuc, minRating, sort, page, size; sort relevance/rating/newest | q/category/city/minimum; sort name/rating/reviews; lọc và tải thêm cục bộ 6 mục | Cần ánh xạ query; thiếu loai/newest; không có server paging |
| P2 | Hồ sơ / user | Đổi mật khẩu; khóa/mở khóa user trong Full | Hồ sơ chỉ tên/bio/avatar; user admin chỉ đọc | Chưa đủ Full features; endpoint tương ứng cũng chưa được đặc tả |

Bằng chứng source:

- [Hợp đồng domain và action](D:/traveltaste-frontend/src/types/domain.ts:1)
- [Công thức xếp hạng hiện có](D:/traveltaste-frontend/src/utils/ranking.ts:3)
- [Tạo và sửa review](D:/traveltaste-frontend/src/state/DemoContext.tsx:44)
- [Giới hạn review trong form](D:/traveltaste-frontend/src/pages/user/ReviewFormPage.tsx:24)
- [Tạo và sửa bình luận](D:/traveltaste-frontend/src/state/DemoContext.tsx:58)
- [Form tạo bình luận](D:/traveltaste-frontend/src/pages/user/ReviewDetailPage.tsx:26)
- [Form đăng ký](D:/traveltaste-frontend/src/pages/AuthPage.tsx:22)
- [Mock login chỉ tìm email](D:/traveltaste-frontend/src/services/mock/auth.ts:10)
- [Form địa điểm](D:/traveltaste-frontend/src/pages/admin/PlaceFormPage.tsx:13)
- [FileReader thay cho upload API](D:/traveltaste-frontend/src/components/common/ImageUpload.tsx:16)
- [Query và sắp xếp tìm kiếm](D:/traveltaste-frontend/src/pages/SearchPage.tsx:14)

## Ma trận endpoint → giao diện

Tất cả endpoint bên dưới **chưa được gọi qua HTTP**. Cột hiện trạng đánh giá khả năng biểu diễn/hành vi trên UI, không phải integration PASS.

| Nhóm | Method / endpoint theo kế hoạch | Màn hình tương ứng | Hiện trạng |
| --- | --- | --- | --- |
| F1 | POST `/api/auth/register` | `/register` | Có form mock, thiếu username và mapping hoTen |
| F1 | POST `/api/auth/login` | `/login` | Có form mock, chỉ đăng nhập email |
| F1 | POST `/api/auth/logout` | Nút đăng xuất | Chỉ xóa vai trò/ID mô phỏng, không hủy session server |
| F1 | GET `/api/auth/me` | Header, guards, hồ sơ | Không bootstrap user từ server hoặc xử lý 401 hết phiên |
| F2 | GET `/api/danh-muc` | Danh mục, bộ lọc, form địa điểm | Có UI, thiếu mapping ten/slug/moTa/icon/thuTu |
| F2 | POST `/api/admin/danh-muc` | Popup thêm danh mục | Chỉ nhập tên; thiếu moTa/icon/thuTu |
| F2 | PUT `/api/admin/danh-muc/{id}` | Popup sửa danh mục | Chỉ sửa tên; thiếu các field còn lại và trangThai |
| F2 | DELETE `/api/admin/danh-muc/{id}` | Quản trị danh mục | Có xác nhận và chặn danh mục đang được địa điểm ACTIVE dùng; chưa xử lý HTTP 409 |
| F3/F7 | GET `/api/dia-diem` | Tìm kiếm / danh sách | Có keyword/filter, nhưng thiếu loai và server pagination; query/sort cần mapping |
| F3 | GET `/api/dia-diem/{slug}` | `/places/:id` | Hiện lookup theo ID; thiếu slug riêng và adapter detail/reviews/comment tree |
| F3/F8 | GET `/api/dia-diem/top10` | `/top-10` | Có trang, chưa đúng Bayesian/điều kiện tối thiểu; nên giữ thứ tự API cho chế độ nổi bật |
| F3/F9 | GET `/api/dia-diem/gan-toi` | Chưa có | Thiếu UI và dữ liệu tọa độ/khoảng cách |
| F3 | POST `/api/admin/dia-diem` | Popup tạo địa điểm | Có form, thiếu loai/địa chỉ cấu trúc/viTri/nhiều ảnh/nhiều danh mục |
| F3 | PUT `/api/admin/dia-diem/{id}` | Popup sửa địa điểm | Cùng các thiếu sót của form tạo |
| F3 | DELETE `/api/admin/dia-diem/{id}` | Bảng quản trị | Có xóa mềm mock; hành vi ẩn cần xác nhận từ backend |
| F4 | POST `/api/dia-diem/{placeId}/reviews` | Popup viết review | Có sao/title/content/upload mock; chưa chặn review trùng và sai giới hạn nội dung/ảnh |
| F4 | PUT `/api/dia-diem/{placeId}/reviews/{reviewId}` | Popup sửa review | Có cho owner; thiếu quyền ADMIN và adapter DTO |
| F4 | DELETE `/api/dia-diem/{placeId}/reviews/{reviewId}` | Review của tôi / kiểm duyệt | Có cho owner/ADMIN; API trả 204 nên phải tải lại detail/rating để cập nhật |
| F4 | GET `/api/dia-diem/{placeId}/reviews` | Chi tiết địa điểm | Hiện lấy từ toàn bộ mock state và slice; chưa có PageResponse/page/size/sort |
| F5 | POST `.../comments` | Chi tiết review | Có bình luận gốc; cần placeId/reviewId, noiDung và giới hạn 1000 |
| F5 | POST `.../comments/{commentId}/replies` | Nút trả lời | Có parentId và giới hạn 3 cấp; cần adapter cây và path đúng review/place |
| F5 | PUT `.../comments/{commentId}` | Sửa bình luận | Chỉ owner, giới hạn 2000; thiếu ADMIN và mapping noiDung |
| F5 | DELETE `.../comments/{commentId}` | Xóa/ẩn bình luận | Có owner/ADMIN, giữ con dưới placeholder; cần thống nhất ngữ nghĩa xóa với backend |
| F10 | POST `/api/upload` | Upload ảnh review/địa điểm/avatar | Đúng MIME và giới hạn 5MB; chưa multipart/URL server và mapping lỗi 413 |

`.../comments` trong bảng là `/api/dia-diem/{placeId}/reviews/{reviewId}/comments`.

## DTO cần adapter, không bắt buộc đổi toàn bộ tên biến UI

Tên tiếng Anh trong view-model không tự nó là lỗi. Vấn đề là hiện chưa có adapter giữa view-model và DTO tiếng Việt, đồng thời một số cấu trúc không đủ biểu diễn dữ liệu.

| View-model hiện có | API / document trong kế hoạch | Cách xử lý cần thiết |
| --- | --- | --- |
| User.name / identity | hoTen / usernameOrEmail; username riêng | Map field và thêm username cho đăng ký |
| Place.id | id hoặc _id; API detail dùng slug | Chốt dạng summary/detail; lưu cả id và slug, không dùng lẫn |
| Place.name/description/rating | ten/moTa/ratingAvg | Map; giữ ratingAvg server làm nguồn dữ liệu khi tích hợp |
| categoryId/category | danhMuc[] và loai riêng | Không dùng danh mục thay cho loai; bổ sung nhiều danh mục nếu API hỗ trợ đúng schema |
| address/city string | diaChi {so,duong,quan,thanhPho} | Mở rộng form/model; format chuỗi địa chỉ chỉ ở phần hiển thị |
| Không có vị trí | viTri.coordinates [lng,lat] | Map đúng thứ tự; Leaflet thường dùng [lat,lng] ở UI |
| image / images {src,name}[] | hinhAnh: string[] | Server upload → URL; hỗ trợ gallery và giới hạn từng loại |
| Review.id/stars/title/content/date | reviewId/soSao/tieuDe/noiDung/ngayTao | Map request/response; không gửi ratingAvg/reviewCount lên server |
| Review dùng users.find để lấy tác giả | tenUser/avatarUser trong review nhúng | Dùng snapshot tác giả từ DTO; không phụ thuộc tải toàn bộ collection users |
| Comment phẳng với parentId | binhLuan[].traLoi[].traLoi[] | Adapter flatten/tree; giữ commentId, reviewId và placeId cần cho endpoint |
| Result {ok,message,id} | {success,data,message,errors} | HTTP adapter riêng, hỗ trợ 204 không parse JSON và map errors theo field |

## Những phần đã khớp ở mức UI/mock

- Chọn 1–5 sao, tạo/sửa/xóa review của mình; xóa review của người khác với ADMIN.
- Tạo và trả lời bình luận tối đa ba cấp; không có nút trả lời ở cấp ba.
- Xóa/ẩn bình luận cho owner/ADMIN; bảo toàn hiển thị cây phản hồi trong mock.
- Tìm kiếm không dấu, lọc thành phố, danh mục và ngưỡng rating ở phía client.
- Cập nhật điểm/số lượng review trong phiên sau thay đổi review.
- Chặn xóa danh mục đang được dùng bởi địa điểm ACTIVE trong mock.
- Upload chọn đúng jpeg/png/webp và giới hạn 5MB/file.

Các mục này vẫn cần chạy integration test với backend trước khi đánh dấu API tương thích.

## Kiểm chứng thực tế bằng hàm hiện có

Đã nạp `createDemoData`, `aggregateReviews`, `rankPlaces` qua Vite SSR và chạy kiểm tra thuần cục bộ, không sửa dữ liệu ứng dụng:

1. Top 10 hiện trả **10 mục**, trong đó **7 mục chỉ có 2 review**. Theo điều kiện kế hoạch, dữ liệu hiện tại chỉ có **3 địa điểm đủ điều kiện**. UI cần chấp nhận Top 10 trả ít hơn 10 mục.
2. Ví dụ kiểm thử: A có 5 sao/3 review; B có 4.6 sao/200 review. Code hiện xếp A trước B. Bayesian theo kế hoạch xếp B trước A (B ≈ 4.5732, A = 4.0625).
3. Seed tại Hội An, Hạ Long, Đà Lạt đều có cặp `placeId + demo-reader` xuất hiện **11 review**, trái quy tắc mỗi người một review/địa điểm.
4. Mock có 12 địa điểm, 3 user, 52 review; chưa phải bộ dữ liệu demo 100 địa điểm/120 user của kế hoạch. Đây là lệch quy mô demo, không phải lỗi endpoint.

## Khoảng trống trong chính kế hoạch cần chốt với backend

Không tự coi các mục sau là endpoint backend đã tồn tại:

- Chưa định nghĩa đầy đủ `DiaDiemRequest`, `DiaDiemSummary`, `DiaDiemDetail`, `PageResponse` và cấu trúc response upload. Không nên đoán tên `items/content`, `total/totalPages` hoặc field URL.
- Chưa có method/path/body cụ thể cho dashboard/statistics, danh sách user, khóa/mở khóa, cập nhật hồ sơ và đổi mật khẩu.
- Chưa có endpoint review của tôi, review cộng đồng và danh sách kiểm duyệt toàn cục. GET reviews hiện được đặc tả theo từng placeId; lấy toàn bộ địa điểm để tổng hợp sẽ không thay thế tốt một API phân trang toàn cục.
- Trang `/reviews/:id` chỉ có reviewId; API hiện cần cả placeId. Cần thêm placeId vào route/state bền vững hoặc đặc tả lookup review theo ID để mở link trực tiếp.
- UI có tab DELETED và khôi phục địa điểm; kế hoạch chưa nêu cách lấy danh sách đã ẩn hoặc endpoint khôi phục.
- DELETE bình luận chưa nói rõ xóa cả nhánh hay giữ placeholder; cần thống nhất để tránh mất phản hồi con.
- Kế hoạch nói `ratingAvg/reviewCount` chỉ server ghi. Response sửa/xóa review chưa mô tả trả rating mới; DELETE trả 204 nên phải refetch, không tạo thêm endpoint recalculate vì F6 là service nội bộ.
- Mẫu pipeline tính rating không lọc review DELETED. Nếu backend xóa bằng `$pull` thì phù hợp; nếu xóa mềm thì pipeline phải loại review đã ẩn. Cần chốt ngữ nghĩa này thay vì suy đoán.
- Chưa có cấu hình cookie/CORS/CSRF hoặc base URL cho frontend. Cần xác nhận trước khi nối phiên thật; không mặc định sessionStorage có thể thay cho cookie server.

## Thứ tự sửa đề xuất

1. Chốt DTO/OpenAPI và các endpoint còn thiếu với backend; giữ view-model tách khỏi DTO.
2. Tạo HTTP adapter/envelope/error handling/session cookie; bootstrap `/auth/me` và xử lý 401/403.
3. Sửa quy tắc một review/người/địa điểm, giới hạn nội dung/ảnh và quyền ADMIN.
4. Thêm username, loai, slug, cấu trúc địa chỉ, nhiều ảnh/danh mục và tọa độ theo hợp đồng đã chốt.
5. Nối API danh sách/detail/review/comment/upload; dùng phân trang server, refetch rating sau mutation và xử lý 409/413/422.
6. Nối Top 10 từ server theo Bayesian; thêm Gần tôi/bản đồ.
7. Kiểm thử contract + integration trên backend thật. Không lấy kết quả mock UI PASS làm bằng chứng cho bước này.

# TravelTaste frontend

React + TypeScript + Vite + Tailwind, kết nối API Spring Boot thật bằng session cookie và CSRF.

## Chạy

Từ thư mục này:

```powershell
npm ci
npm run dev
```

Mở http://127.0.0.1:5173. Backend chạy cổng8080 theo cấu hình hiện có; Vite proxy /api và /uploads tới backend. Dùng tài khoản trong MongoDB hoặc đăng ký USER mới. Không có tài khoản/role giả lập hoặc mock fallback. Backend phải hoạt động để tải dữ liệu.

## Đã tích hợp

- Đăng ký, login, logout, khôi phục session; quyền ADMIN/USER do server xác định.
- Danh mục, tìm kiếm/lọc/phân trang server, chi tiết, Top10 và địa điểm gần vị trí hiện tại.
- Review CRUD, rating từ backend, bình luận/reply tối đa3 cấp.
- CRUD quản trị địa điểm/danh mục, ẩn/hiện địa điểm, kiểm duyệt review/comment, khóa/mở khóa user.
- Upload PNG/JPEG ≤5MB lên backend, ảnh địa điểm và review. Không dùng FileReader để giả upload.
- Loading/error/retry thật; popup giữ dirty draft và chỉ navigate sau khi API ghi thành công.

DELETE xóa vĩnh viễn; xóa bình luận xóa cả nhánh con. Ẩn/hiện địa điểm dùng ACTIVE/HIDDEN, độc lập DELETE. Hồ sơ hiện chỉ đọc vì backend chưa có API cập nhật. Thống kê theo ngày tổng hợp từ review thật tải qua API.

## Kiểm tra

```powershell
npm run typecheck
npm run build
npm run verify:integration
```

Bộ browser integration cần backend kiểm thử ở18080 và MongoDB riêng27028, không dùng DB ứng dụng. Script tự khởi động Vite5173 (cần cổng trống) và Chrome headless; TEST_ADMIN/TEST_PASSWORD có thể cung cấp qua environment. Các script QA mock cũ đã bị thay. Báo cáo/screenshot F1–F4/redesign cũ chỉ là lịch sử trước integration.

Chi tiết thay đổi, setup backend và giới hạn: [báo cáo tích hợp](../docs/architecture/06-INTEGRATION-IMPLEMENTATION.md).

## Cập nhật giao diện tài khoản và bình luận

/login và /register là hai trang độc lập, dùng state form riêng và API auth hiện có; không mở popup. Bình luận hiển thị avatar/tên/ngày, nhãn tác giả review, nhắc tên người được trả lời, đường nối nhánh3 cấp, mở/ẩn phản hồi và xem thêm nội dung dài. Reply dùng composer ngay dưới bình luận; gửi/trả lời/xóa gọi API hiện có. Admin được xóa mọi bình luận; người gửi chỉ xóa bình luận của mình. Không còn chức năng hoặc endpoint sửa bình luận.

`npm run verify:auth-comments` kiểm tra9 bố cục390/768/1440px và các HTTP contract bằng fixture intercept trong script, không ghi DB thật. `verify:integration` đã cập nhật selector cho giao diện mới nhưng chưa chạy lại với backend thật trong lần thay đổi giao diện này.

Quyền bình luận: kiểm tra phía server cho cả bình luận gốc và trả lời. `VerifyCommentPermissions.java` kiểm tra8 trường hợp owner/admin, không kết nối DB; kiểm thử UI xác nhận guest không thấy Xóa, USER không thấy Xóa trên bình luận người khác, ADMIN thấy Xóa trên tất cả. PUT sửa bình luận đã bị loại bỏ.

## Lượt thích bình luận

Mỗi bình luận (gồm các cấp trả lời) có nút thích và số lượng. Tài khoản đăng nhập có thể thích/bỏ thích; khách được chuyển sang đăng nhập. Backend dùng PUT/DELETE `/api/dia-diem/{placeId}/reviews/{reviewId}/comments/{commentId}/like`, lưu `likedBy` bằng addToSet/pull với array filters, không tăng trùng khi gửi lại request. DTO trả `likeCount` và `liked`, không trả danh sách tài khoản đã thích. Bình luận cũ không có field vẫn hiển thị0 và được khởi tạo khi tương tác.

Đã kiểm tra API76 HTTP checks trên MongoDB riêng27028 và UI fixture9 bố cục, gồm like/bỏ like, reload, hai tài khoản đồng thời, cấp3 và quyền guest. Không ghi DB ứng dụng trong kiểm thử. Sau khi cập nhật mã, cần khởi động lại backend đang chạy để nạp endpoint mới.

## Giao diện workspace cập nhật21/10/2026

Admin dùng sidebar cho các trang quản trị/hồ sơ/đánh giá cá nhân; trang hồ sơ chỉ có tiêu đề Hồ sơ và tên người đang đăng nhập (fallback username/Hồ sơ). My reviews có bộ lọc áp dụng/đặt lại, sort, ảnh địa điểm, sửa/xóa và trạng thái trống/gợi ý địa điểm từ API. Dashboard tổng hợp counts, xu hướng theo ngày có đánh giá, phân bố sao, top theo số review và hoạt động thật; không có phần trăm tăng trưởng hoặc trạng thái PENDING giả. Hồ sơ chỉ đọc vì backend chưa có API cập nhật.

`npm run verify:dashboard` dùng HTTP fixture độc lập:18 viewport scenarios (390/768/1440), kiểm tra sidebar, tên/fallback, lọc/reset, empty state, tab hoạt động và chart. Không ghi DB ứng dụng.

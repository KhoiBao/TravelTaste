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

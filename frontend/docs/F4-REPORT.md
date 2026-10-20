# F4 — Giao diện quản trị và trạng thái hệ thống

> Báo cáo lịch sử trước đợt gộp popup. Hành vi form địa điểm/danh mục/hồ sơ người dùng hiện tại xem `POPUP-REPORT.md`.

Ngày: 20/10/2026. Trạng thái: đã triển khai và kiểm tra giao diện trong phạm vi người dùng cho phép. Không tích hợp backend hoặc thay schema.

## Mapping màn hình

| Figma | Route | React | Nguồn đối chiếu |
|---|---|---|---|
| 2:229 — Dashboard | `/admin` | `admin/DashboardPage.jsx` | Đã đọc context + screenshot |
| 2:246 — Quản lý địa điểm | `/admin/places` | `admin/AdminPlacesPage.jsx` | Đã đọc context + screenshot |
| 2:392 — Form địa điểm | `/admin/places/new`, `/admin/places/:id/edit` | `admin/PlaceFormPage.jsx` | Đã đọc context + screenshot |
| 2:380 — Danh mục | `/admin/categories` | `admin/AdminCategoriesPage.jsx` | Đã đọc context + screenshot |
| 2:404 — Quản lý review | `/admin/reviews` | `admin/AdminReviewsPage.jsx` | Metadata F0 + template đã đọc, chưa đối chiếu trực tiếp |
| 2:416 — Quản lý bình luận | `/admin/comments` | `admin/AdminCommentsPage.jsx` | Đã đọc context + screenshot |
| 2:432 — Người dùng | `/admin/users` | `admin/AdminUsersPage.jsx` | Metadata F0 + template đã đọc, chưa đối chiếu trực tiếp |
| 2:444 — Thống kê | `/admin/statistics` | `admin/StatisticsPage.jsx` | Đã đọc context + screenshot |
| 2:480 — 403/404/500 | `/status/403`, `/status/404`, `/status/500` và fallback | `SystemPage.jsx` | Đã đọc context + screenshot |

## Ngoại lệ Figma đã được cho phép

Trong khi đọc frame 2:404 và 2:432, Figma MCP trả về thông báo đã hết hạn mức Starter. Đã báo rõ cho người dùng và hỏi có cho dựng hai trang bằng bố cục/component của các frame đã đọc, đồng thời ghi rõ chưa đối chiếu trực tiếp hay không. Người dùng trả lời: **“Có, làm hết theo bộ giao diện hiện tại”.**

Hai trang dùng cùng SimpleLayout, ba panel 110/140/95px, màu/font/radius/padding đã đọc từ những frame khác. Nội dung nhãn lấy từ metadata F0. Không tuyên bố đã nhận context/screenshot của hai frame này hoặc đã xác nhận khớp chúng.

## Chức năng giao diện

- Dashboard giữ ba khối gốc; mở khối để xem số liệu hiện tại và link quản trị. Nhãn “100 địa điểm mẫu” giữ theo Figma, nhưng nội dung mở ghi rõ phiên xem thử thực tế chỉ có 3 địa điểm ban đầu.
- Địa điểm: tìm theo tên, lọc ACTIVE/DELETED, phân trang, tạo/sửa, xem công khai, xóa mềm, khôi phục với xác nhận. Form có tên, mô tả, danh mục, địa chỉ, thành phố và ảnh cục bộ.
- Danh mục: thêm, sửa tên, xóa mềm; đổi tên cập nhật snapshot tên hiển thị trên địa điểm. Kiểm tra ví dụ không xóa danh mục còn địa điểm ACTIVE và không cho tên trùng.
- Review: lọc trạng thái/sao, phân trang, xem tác giả/địa điểm, xóa mềm và tính lại rating.
- Bình luận: chọn review cha, lọc cấp, xem và ẩn nội dung; giữ placeholder/nhánh con khi ẩn.
- Người dùng: lọc USER/ADMIN, xem email, vai trò, ngày tham gia và hồ sơ ở chế độ chỉ đọc. Không tự thêm thao tác khóa tài khoản hoặc đổi vai trò vì metadata chỉ có “Xem hồ sơ”.
- Thống kê: rating trung bình, số review ACTIVE, phân bố sao, xếp hạng địa điểm và lọc khoảng ngày; có empty state khi không có dữ liệu.
- Trạng thái: 403 khi vai trò xem thử không phù hợp, 404 khi route/review/địa điểm không có, trang minh họa 500 và nút thử lại.

Toàn bộ cập nhật là trạng thái frontend dùng chung với F3 và các trang công khai. Dữ liệu hiện tại không phải dữ liệu backend. Các quy tắc minh họa được áp dụng trong `DemoContext`, không phải API contract đã xác minh.

## Assets và component

Dashboard/địa điểm dùng đúng ảnh Hội An từ frame 2:234 / 2:251, cùng file đã tải ở F1. Form cho phép chọn ảnh người dùng cung cấp, không tự lấy ảnh bên ngoài. Không thêm thư viện icon, biểu đồ hoặc UI kit. Biểu đồ phân bố dùng native progress với màu primary từ tokens.

Component mới: `AdminPanels`, các page trong `src/pages/admin/`, `SystemPage`. Dùng lại `WirePanel`, `Field`, `RowCard`, `StatusBadge`, `Pagination`, `ConfirmDialog`, `StatusPanel`, `ReviewRows`, `CommentThread`, `ImageUpload`, `WorkspaceNavigation`, `PreviewGate` và DemoContext.

## Kiểm tra

Kết quả cuối: `npm run build`, `npm run verify`, `npm run verify:f2`, `npm run verify:f3-f4` đều thành công. F3/F4 gồm 72 trường hợp responsive trên 18 đường dẫn và 4 chiều rộng 960/768/390/320px, kèm luồng thao tác thực tế. Hồi quy F2 có thêm 32 trường hợp, không lỗi console/page/tài nguyên ở các bộ kiểm tra.

Các luồng F4 đã kiểm tra:

1. USER bị chặn khỏi quản trị; chuyển ADMIN bằng điều khiển xem thử rõ ràng.
2. Thêm danh mục; đổi “Du lịch” thành tên mới và thấy địa điểm cập nhật theo; chặn xóa danh mục còn địa điểm ACTIVE; xóa được danh mục trống.
3. Form địa điểm yêu cầu ảnh, tạo và sửa địa điểm, cập nhật trang công khai, xóa mềm rồi khôi phục.
4. ADMIN xóa review của người khác, lọc DELETED và thống kê giảm từ 36 xuống 35 review ACTIVE.
5. Lọc khoảng thời gian không có review, empty state, xóa khoảng thời gian để khôi phục thống kê.
6. ADMIN ẩn bình luận của người khác, giữ phản hồi cấp 3; lọc cấp và review không có comment.
7. Lọc người dùng ADMIN, xem hồ sơ chỉ đọc; thử trạng thái Error rồi Retry.
8. Đặt lại dữ liệu có xác nhận, thống kê trở lại 36 review, panel mở vẫn không tràn ngang ở 320px; localStorage không chứa credentials.

Ảnh/JSON: `docs/screenshots/f3-f4/verification.json`, các file có prefix `dashboard`, `admin-*`, `place-*`, `statistics`, `403`, `404`, `500`; ảnh mở rộng `admin-places-expanded.png`, `statistics-expanded.png`, `statistics-small-mobile-expanded.png`.

Đã xem trực tiếp ảnh dashboard desktop, viết review desktop, bình luận mobile, sửa review 320px và các luồng mở rộng quản lý địa điểm/thống kê/bình luận. Không chỉ nghiệm thu bằng việc build thành công.

## Tệp tạo/thay đổi

Tạo mới toàn bộ `src/pages/admin/`, `src/pages/SystemPage.jsx`, `src/components/layout/AdminPanels.jsx`, `PreviewGate.jsx`, `src/state/`, các component dùng chung trong `src/components/common/` và `src/components/reviews/`, `scripts/verify-f3-f4.cjs`, báo cáo này, ảnh/JSON kiểm tra.

Sửa `src/App.jsx`, `src/main.jsx`, `src/components/layout/PublicLayout.jsx`, `Header.jsx`, các trang F2 và `PlaceFilters.jsx` để nhận dữ liệu chung; `package.json`, `README.md`, script F1/F2. Không sửa backend, không có endpoint tự tạo. `dist/` và cache/node_modules là sản phẩm build/cài đặt, được ignore.

## Sai khác và tồn tại

- Hai frame 2:404/2:432 chưa đối chiếu trực tiếp như nêu trên; người dùng đã cho phép tiếp tục bằng template chung.
- Frame chỉ mô tả khối desktop sơ lược. Các bảng/list/form/bộ lọc mở rộng là phần thao tác bổ sung trong các panel hiện hữu, dùng tokens đã đọc; chiều cao tăng khi mở. Không tuyên bố pixel-perfect cho trạng thái chưa có trong Figma.
- Có điều hướng quản trị và thanh vai trò demo sau phần gốc. Không có sidebar tự thiết kế làm thay đổi bố cục Figma.
- Mobile theo phương án đã thống nhất; chưa có frame mobile gốc.
- Xác thực thật, phân quyền server, lưu MongoDB, upload server, API aggregation và kiểm thử tích hợp backend nằm ngoài phạm vi người dùng đã thu hẹp. Không đánh dấu các phần đó hoàn thành.
- Chỉnh sửa dữ liệu mất khi tải lại trang, được ghi rõ trong giao diện. sessionStorage chỉ nhớ vai trò xem thử, không phải thông tin xác thực.
- Chưa commit, push, deploy hoặc sửa Figma.

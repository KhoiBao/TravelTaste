# Gộp các form thành popup

Ngày: 20/10/2026. Trạng thái: đã triển khai theo phương án được người dùng duyệt qua yêu cầu “thực hiện đi”. Không thay đổi phạm vi chỉ frontend.

## Mapping hiện tại

| Chức năng | Đường dẫn | Hiển thị |
|---|---|---|
| Đăng nhập/đăng ký | `/login`, `/register` | Một popup, chuyển tab giữ bản nháp |
| Chỉnh sửa hồ sơ | `/profile/edit` | Popup mở từ trang hồ sơ |
| Viết/sửa review | `/reviews/new`, `/reviews/:id/edit` | Chung form popup lớn |
| Thêm/sửa địa điểm | `/admin/places/new`, `/admin/places/:id/edit` | Chung form popup lớn |
| Thêm/sửa danh mục | `/admin/categories/new`, `/admin/categories/:id/edit` | Popup nhỏ |
| Xem hồ sơ người dùng | `/admin/users/:id` | Popup chỉ đọc |
| Xác nhận xóa/ẩn/khôi phục | Các nút hiện có | Hộp xác nhận; nếu đang trong popup thì thay nội dung của popup đó |

Các trang chủ, tìm kiếm/danh sách, chi tiết địa điểm, danh mục, Top 10, review cộng đồng, chi tiết review/bình luận, hồ sơ, review của tôi, dashboard và các danh sách/thống kê quản trị vẫn là trang riêng. Không gộp thảo luận dài vào popup.

## Cách mở, đóng và điều hướng

- Click link form sẽ giữ trang hiện tại làm nền và cập nhật URL. Dữ liệu/bộ lọc/panel đang mở của trang nền được giữ khi popup đóng.
- Truy cập thẳng link form hoặc tải lại link cũ vẫn mở popup, với trang nền phù hợp: homepage cho tài khoản, hồ sơ cho chỉnh sửa hồ sơ, review chi tiết cho sửa review, danh sách quản trị cho các form quản trị.
- Nút Đóng, Hủy, Escape và click backdrop đều có thể đóng popup. Nền bị khóa cuộn trong khi mở; sau khi đóng trả focus về nút/link mở nếu còn tồn tại.
- Tab/Shift+Tab không đưa focus ra nội dung nền. Header popup luôn có tiêu đề và nút đóng, form có label và CTA rõ ràng.
- Có thay đổi chưa lưu: đóng hoặc dùng Back sẽ chuyển nội dung popup sang xác nhận bỏ thay đổi, có lựa chọn tiếp tục chỉnh sửa. Chỉ có một dialog mở tại một thời điểm, không xếp thêm dialog bên trên form.
- Dùng cơ chế blocker của React Router data router để bảo vệ bản nháp khi điều hướng; reload/đóng tab có bản nháp dùng cảnh báo native của trình duyệt.
- Save thành công trong dữ liệu minh họa sẽ đóng form và cập nhật hồ sơ/danh sách hoặc chuyển đến review vừa lưu. Không cảnh báo bỏ thay đổi sau Save.
- Chuyển tab tài khoản không đóng popup, giữ tên/email/username/mật khẩu đang nhập trong bộ nhớ React. Khi đóng popup, bản nháp bị xóa; mật khẩu cũng được xóa sau submit hợp lệ. Không lưu credentials vào localStorage/sessionStorage hay gửi tới backend.

## Responsive và thiết kế

Desktop dùng panel giữa màn hình: rộng tối đa 560px cho form nhỏ, 820px cho review/địa điểm, cao tối đa viewport trừ 48px và cuộn nội bộ. Dưới 640px, popup form dùng toàn màn hình. Hộp xác nhận xóa độc lập vẫn là dialog gọn.

Giữ palette, Inter, CSS variables và Tailwind tokens hiện có. Không thêm ảnh/icon/thư viện UI. Chỉ thay cách tổ chức màn hình theo yêu cầu bổ sung của người dùng; các popup không phải frame popup đã có trong Figma và không được tuyên bố khớp pixel với thiết kế cũ.

## Kiểm tra

- `npm run verify:popups`: bộ kiểm tra hiện hành.
- 40 trường hợp responsive: 10 URL popup × 960/768/390/320px. Kiểm tra một dialog mở, không tràn ngang, khóa cuộn, hình học giữa màn hình/toàn màn hình và vòng focus bàn phím.
- 20 route trang độc lập được kiểm tra sau thay đổi router: vẫn có nội dung trang và không tự mở dialog.
- Luồng tài khoản giữ bản nháp qua hai tab, Escape/cancel/discard, focus trở lại nút mở, đóng rồi mở lại không còn mật khẩu.
- Chỉnh sửa hồ sơ Save, Back khi chưa lưu, tiếp tục chỉnh sửa và hủy bỏ bản nháp.
- Tạo/sửa review cùng popup, upload ảnh, chuyển về chi tiết và cập nhật điểm sao.
- Thêm/sửa danh mục trong popup, xóa mềm qua hộp xác nhận một lớp; hộp xác nhận giữ focus và khóa cuộn.
- Thêm/sửa địa điểm trong popup, cập nhật danh sách đang mở sau Save.
- Hồ sơ người dùng chỉ đọc, Escape đóng; regression tìm kiếm/lọc/trang chi tiết, thống kê, bình luận ba cấp và kiểm tra vai trò.
- `npm run verify`: bộ component F1 được kiểm tra lại.
- `npm run build`: build production thành công.
- Không có lỗi console/page/tài nguyên trong các luồng kiểm tra đã chạy.

Ảnh thực tế và JSON: `docs/screenshots/popups/all/`. Ảnh có tên `login-desktop.png`, `review-new-mobile.png`, `place-new-desktop.png`, `category-edit-desktop.png`, `user-readonly-open.png`, `confirmation-delete.png` và các biến thể kích thước còn lại. Kết quả máy đọc: `verification.json`.

## Tệp thay đổi

- Mới: `src/components/common/PopupContext.jsx`, `src/routes/popupRoutes.js`, `src/pages/user/ProfileForm.jsx`, `src/pages/admin/CategoryForm.jsx`, `UserPopup.jsx`, `scripts/verify-popups.cjs`, báo cáo này và ảnh kiểm tra.
- Sửa: `src/App.jsx`, `src/main.jsx`, `src/styles/global.css`, `src/state/DemoContext.jsx`, `src/components/common/ConfirmDialog.jsx`.
- Sửa form/trang: `AuthPage.jsx`, `user/ProfilePage.jsx`, `ReviewFormPage.jsx`, `admin/PlaceFormPage.jsx`, `AdminCategoriesPage.jsx`, `AdminUsersPage.jsx`.
- Sửa tooling/tài liệu: `package.json`, `README.md`, `scripts/verify-ui.cjs`; hai script F2/F3-F4 chuyển thành entry point tương thích cho bộ kiểm tra popup.

## Giới hạn giữ nguyên

Dữ liệu vẫn là minh họa trong bộ nhớ và đặt lại khi reload. Vai trò xem thử không phải xác thực backend. Chưa tích hợp API, không sửa schema, không sửa Figma, không commit/push/deploy. Hai frame quản lý review/người dùng vốn chưa lấy được trực tiếp do giới hạn Figma vẫn mang ngoại lệ đã được người dùng cho phép; việc gộp popup không thay đổi giới hạn này.

Các báo cáo F1–F4 và ảnh trước đó là kết quả lịch sử của từng giai đoạn. Báo cáo này mô tả hành vi hiện tại sau thay đổi popup.

# F3 — Giao diện người dùng

> Báo cáo lịch sử trước đợt gộp popup. Hành vi form hồ sơ/review hiện tại xem `POPUP-REPORT.md`.

Ngày: 20/10/2026. Trạng thái: đã triển khai và kiểm tra giao diện; chờ người dùng xem nghiệm thu. Người dùng đã cho phép làm liên tiếp F3 và F4 trong cùng yêu cầu, không dừng ở giữa hai giai đoạn.

## Màn hình và mapping

| Frame Figma | Route | React | Kết quả |
|---|---|---|---|
| 2:304 — Hồ sơ cá nhân | `/profile` | `user/ProfilePage.jsx` | Xem/sửa tên, giới thiệu, ảnh đại diện; link lịch sử review |
| 2:316 — Review của tôi | `/my-reviews` | `user/MyReviewsPage.jsx` | Lọc ngày/sao/trạng thái, phân trang, sửa/xóa mềm review của mình |
| 2:212 — Viết đánh giá | `/reviews/new?place=hoi-an` | `user/ReviewFormPage.jsx` | Chọn địa điểm, 1–5 sao, tiêu đề/nội dung/ảnh, đăng trong phiên xem thử |
| 2:328 — Sửa review | `/reviews/:id/edit` | `user/ReviewFormPage.jsx` | Sửa nội dung/sao/ảnh, kiểm tra quyền sở hữu và ACTIVE |
| 2:340 — Chi tiết và bình luận | `/reviews/:id` | `user/ReviewDetailPage.jsx` | Nội dung, ảnh, bình luận và trả lời tối đa 3 cấp |
| Tái sử dụng 2:316 | `/reviews` | `user/CommunityReviewsPage.jsx` | Danh sách review cộng đồng, lọc theo địa điểm, phân trang; không có frame riêng |

Đã đọc đầy đủ high-fidelity context và screenshot của năm frame F3 trước khi xây. Không gặp chặn Figma ở các frame này.

## Component và thao tác

- `StarInput`: nhóm radio 1–5 sao, có vùng bấm trên cả ngôi sao và focus bằng bàn phím.
- `ImageUpload`: chọn PNG/JPG/WebP cục bộ, tối đa 5 MB/ảnh; 1 ảnh đại diện hoặc tối đa 3 ảnh review; bỏ ảnh, lỗi định dạng và trạng thái đang đọc.
- `ReviewRows`: tên địa điểm, tác giả, sao, ngày và trạng thái; chỉ hiện thao tác đúng vai trò/quyền sở hữu trong dữ liệu demo.
- `CommentThread`: trả lời cấp 1→2→3, không cho tạo cấp 4. Ẩn/xóa cha giữ placeholder và các nhánh con.
- `ConfirmDialog`: dùng native dialog, có Hủy/Xác nhận, phím Escape và focus trong modal.
- `WirePanel`, `StatusPanel`, `Field`, `Pagination`, `WorkspaceNavigation`: dùng lại tokens và bố cục Figma; hỗ trợ trạng thái trống, thông báo cập nhật, minh họa Loading/Error/Empty và thử lại.

Hồ sơ, review và bình luận dùng chung `DemoContext`. Khi thêm/sửa/xóa mềm review, ratingAvg, reviewCount ACTIVE và phân bố sao tính lại; trang công khai và quản trị đọc cùng một dữ liệu. Không chỉ hiển thị toast rồi bỏ qua thay đổi.

## Dữ liệu và vai trò xem thử

Khởi tạo 3 địa điểm từ Figma, 3 tài khoản ví dụ, 36 review giả lập và 3 bình luận từ nội dung frame. Mỗi địa điểm có 8 review 5 sao và 4 review 4 sao, cho điểm hiển thị 4.7/12 như thiết kế. Toàn bộ nội dung review tạo sẵn đều ghi rõ là minh họa, không phải đánh giá thực tế.

Guest xem nội dung công khai; USER xem/sửa hồ sơ, đăng review/comment, sửa/xóa bài hoặc bình luận của mình; ADMIN có giao diện kiểm duyệt ở F4. Gate frontend hiển thị 403 khi vai trò xem thử không phù hợp. Đây không phải bảo mật backend.

Thanh cuối trang có Xem thử USER/ADMIN và chọn vai trò. Chỉ vai trò xem thử được nhớ trong sessionStorage của tab. Dữ liệu hồ sơ/review/comment/upload nằm trong bộ nhớ React, không lưu credentials, không gọi API và được đặt lại khi tải lại trang. Nút Đặt lại dữ liệu có xác nhận.

## Assets

Hero dùng đúng `src/assets/images/hoi-an.png` từ Figma 2:217, đã tải ở F1. Font Inter cục bộ giữ nguyên. Không thêm ảnh avatar hoặc ảnh review giả thay cho asset thiết kế: chỉ hiện ảnh khi người dùng chọn file cục bộ. Không dùng screenshot thiết kế làm asset, không có URL Figma tạm trong source chạy ứng dụng.

## Kiểm tra

`npm run verify:f3-f4` kiểm tra chung F3/F4: 18 đường dẫn × 960/768/390/320px (72 trường hợp), ảnh tải, không tràn ngang, không lỗi console/page/tài nguyên.

Các luồng F3 đã kiểm tra thực tế:

1. Guest bị chặn ở hồ sơ; chuyển sang USER, sửa tên/bio và upload avatar.
2. Tạo review 1 sao kèm ảnh; từ chối file TXT; rating Hội An từ 4.7/12 thành 4.4/13.
3. Sửa review vừa tạo thành 3 sao; rating thành 4.5/13.
4. Trả lời cấp 2, cấp 3; không có thao tác tạo cấp 4.
5. Hủy xóa bình luận, rồi xóa cha: placeholder giữ nguyên các phản hồi.
6. Escape hủy hộp xóa review, sau đó xác nhận xóa; review có trong bộ lọc DELETED và rating về 4.7/12.
7. USER bị chặn khi mở route sửa review của người khác hoặc quản trị.
8. Kiểm tra lại F1 và F2 sau khi nối dữ liệu chung.

Kết quả cuối: `npm run build`, `npm run verify`, `npm run verify:f2`, `npm run verify:f3-f4` đều thành công. Báo cáo máy đọc: `docs/screenshots/f3-f4/verification.json`. Ảnh F3 có prefix `profile`, `my-reviews`, `review-new`, `review-edit`, `review-detail`, `community`; thêm ảnh thao tác `profile-saved.png`, `comment-thread-edited.png`.

## Tệp tạo/thay đổi

Tạo mới toàn bộ `src/pages/user/`, `src/state/demoData.js`, `src/state/DemoContext.jsx`, `src/components/reviews/`, `src/components/common/ConfirmDialog.jsx`, `WorkspaceUI.jsx`, `ImageUpload.jsx`, `src/components/layout/PreviewGate.jsx`, `scripts/verify-f3-f4.cjs`, báo cáo này và ảnh/JSON kiểm tra.

Sửa `src/main.jsx`, `src/App.jsx`, `src/components/layout/PublicLayout.jsx`, `Header.jsx`, các trang Home/Search/PlaceDetail/Categories/TopPlaces, `PlaceFilters.jsx`, `README.md`, `package.json`, các script kiểm tra F1/F2. Các thay đổi này cũng phục vụ F4 và việc đồng bộ dữ liệu giữa các nhóm trang.

## Sai khác và giới hạn

- Frame hồ sơ và danh sách review là các khối nhãn sơ lược. Dùng details/summary để mở nội dung thật trong cùng khối; khi mở, chiều cao tăng để chứa form/list và không cắt thao tác.
- Form viết review giữ hero, độ rộng 850px, trường trắng 48px và bố cục nguồn; ô địa điểm trở thành select, ô thứ ba có mở phần chọn ảnh thay vì để trắng.
- Frame edit có thêm trường tiêu đề, textarea và input ảnh trong các panel để thao tác được; không thể nghiệm thu các trạng thái mở là pixel-perfect vì Figma chưa mô tả chúng.
- Trang thảo luận hiển thị nội dung review trong panel đầu và thao tác comment khi bật CTA. Nhánh bình luận giữ thứ tự/cấp từ thiết kế; khi bật thao tác có thêm thông tin tác giả và nút.
- Có điều hướng tài khoản và thanh xem thử sau phần thiết kế. Mobile dùng phương án responsive đã thống nhất, chưa có frame mobile gốc để đối chiếu.
- API, xác thực thật, lưu file lên server và phân quyền backend nằm ngoài phạm vi chỉ giao diện. Không đánh dấu các phần đó hoàn thành.

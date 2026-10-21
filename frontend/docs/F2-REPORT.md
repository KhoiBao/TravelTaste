# F2 — Giao diện công khai

> Báo cáo lịch sử trước đợt gộp popup. Hành vi đăng nhập/đăng ký hiện tại xem `POPUP-REPORT.md`.

Ngày: 20/10/2026. Trạng thái: hoàn thành triển khai giao diện trong phạm vi dưới đây, chờ nghiệm thu F2. Chưa chuyển F3.

## Điều chỉnh sau phản hồi

Người dùng trước đó đang mở `/`, vốn hiển thị Design System F1. Đã đưa trang chủ vào `/`, chuyển trang Design System sang `/design-system`, giữ `/components` để thử component. Đồng thời đọc lại context và screenshot trực tiếp của từng frame F2, sửa độ rộng header và chiều cao chữ để bám bố cục Figma.

Stack tiếp tục là React + Vite + Tailwind theo lựa chọn của người dùng. Phạm vi chỉ giao diện, không tích hợp backend. Không sửa file Figma, không commit/push/deploy.

## Mapping màn hình

| Figma | Route | React | Kết quả |
|---|---|---|---|
| 2:47 — Trang chủ | `/` | `HomePage` | Hero, search, 3 hàng card, nội dung đúng thứ tự |
| 2:102 — Tìm kiếm | `/search`, `/places` | `SearchPage` | Bố cục frame, tìm theo từ khóa, bộ lọc, sắp xếp |
| 2:157 — Chi tiết địa điểm | `/places/:id` | `PlaceDetailPage` | Nội dung Hội An theo frame, điều hướng thêm Hạ Long/Đà Lạt bằng dữ liệu minh họa |
| 2:280 — Đăng nhập | `/login` | `AuthPage` | Khối form và CTA, required validation, thông báo chưa kết nối API |
| 2:292 — Đăng ký | `/register` | `AuthPage` | Tên/email/password/confirmation, kiểm tra email và mật khẩu khớp |
| 2:356 — Danh mục | `/categories` | `CategoriesPage` | Chọn Du lịch/Ăn uống, bộ lọc mở rộng, điều hướng danh sách |
| 2:368 — Top 10 | `/top-10` | `TopPlacesPage` | Giữ khối frame, mở danh sách 3 địa điểm minh họa và chọn xem chi tiết |

Điều hướng “Đánh giá” đi đến `/#reviews`, là phần “Đánh giá mới nhất” trong frame trang chủ. Frame hiện dùng PlaceCard cho phần này; triển khai giữ nguyên, không tự thay bằng thiết kế ReviewCard. Trang chi tiết review/bình luận và viết/sửa review thuộc F3, chưa thực hiện.

Không tìm thấy frame riêng cho danh sách địa điểm tách biệt tìm kiếm; `/places` dùng lại frame 2:102. Không tự thêm dữ liệu hoặc tạo một giao diện khác để lấp chỗ trống.

## Đối chiếu desktop

Kích thước viewport chuẩn: 960 × 900.

| Thành phần trang chủ | Figma | Chrome đo thực tế |
|---|---|---|
| Header | x28 y24, 589 × 27 | x28 y24, 589 × 27 |
| Hero | x28 y69, 900 × 165 | x28 y69, 900 × 165 |
| Tiêu đề | x28 y252, cao 38 | x28 y252, cao 38 |
| Card đầu tiên | x28 y445, 255 × 220 | x28 y445, 255 × 220 |
| Ảnh card | 255 × 125 | 255 × 125 |

Màu, font Inter 400/700, padding 28/24, gap 18/16/8 và ảnh giữ từ Figma. Chiều rộng glyph/rasterization có chênh lệch nhỏ giữa font web và Figma: tiêu đề chính khoảng 570.31px so với text node Figma 572px. Không tuyên bố trùng từng pixel.

## Tương tác frontend

- Tìm kiếm từ trang chủ sang `/search?q=...`, hỗ trợ tìm không dấu.
- Bộ lọc danh mục, thành phố, điểm sao cập nhật URL; xóa bộ lọc khôi phục danh sách.
- Sắp xếp tên A–Z và điểm cao nhất. Chỉ có 3 mẫu nên thể hiện trang 1/1, không tạo thêm dữ liệu cho phân trang.
- Click card mở đúng địa điểm; ID không tồn tại có thông báo và link về danh sách.
- Header và menu mobile điều hướng các trang, menu đóng sau khi chọn.
- Top 10 cho chọn địa điểm qua nhóm radio trong khối mở rộng trước khi xem chi tiết.
- Form có label, autocomplete và validation; không lưu mật khẩu/token, không báo đăng nhập hay đăng ký thành công khi chưa có API.

## Assets

Không thêm ảnh thay thế. Tái sử dụng 3 file đã tải từ Figma ở F1: `src/assets/images/hoi-an.png` (hero và card Hội An), `ha-long.png`, `da-lat.png` (card tương ứng). Font Inter đóng gói cục bộ qua `@fontsource/inter`. Các nguồn ảnh trong context F2 vẫn là các asset `e9c24.png`, `08441.png`, `14832.png` giống F1; không cần tải lại cùng ảnh.

Không dùng screenshot Figma làm nền, không dùng URL asset tạm lúc chạy. Logo chấm tròn và sao giữ ký tự văn bản từ thiết kế; không tự thay bằng thư viện icon.

## Responsive và khác biệt có chủ đích

- Dưới 640px: 1 cột; 640–899px: 2 cột; từ 900px: 3 cột. Desktop frame giữ tối đa 960px; màn hình lớn hơn căn giữa.
- Không cắt nội dung sau 900px như vùng clip của frame: cho phép cuộn để truy cập cả hàng thứ ba. Ảnh `home-figma-viewport.png` chụp 900px đầu để đối chiếu; ảnh full page thể hiện toàn bộ nội dung.
- Figma chưa có mobile: header đổi sang menu, heading xuống dòng, trường đăng ký chuyển thành một cột. Các điều chỉnh này dùng phương án đã đề xuất ở F0/F1.
- Các heading bộ lọc/sắp xếp và khối Top 10 dùng `details/summary`: đóng ban đầu để giữ vị trí frame, mở ra để dùng thao tác. Frame không cung cấp trạng thái mở nên các control bên trong dùng tokens hiện có.
- Form đăng ký trong Figma mới có nhãn gộp trên khối trắng; đã bổ sung input thực tế trong khối đó. Có thêm link đăng nhập/đăng ký qua lại và ghi chú minh họa cuối trang. Form input login có thể lệch baseline vài px do là input native thay cho text layer.
- Nội dung “API / WebSocket” ở cuối chi tiết được giữ vì có trong frame 6:2; đây là nội dung thiết kế, không phản ánh kết nối API đang hoạt động. Có ghi chú minh họa ngay sau đó.
- Theo dữ liệu Figma, cả ba mẫu là du lịch. Chọn Ăn uống hoặc 5 sao sẽ có empty state; không bịa thêm địa điểm/ảnh.

## Kiểm tra và ảnh

- `npm run build`: thành công.
- `npm run verify:f2`: thành công, 32 trường hợp (8 route × 960/768/390/320px), không tràn ngang, mọi ảnh tải thành công, không lỗi console/page hoặc HTTP tài nguyên.
- Luồng đã kiểm tra: tìm không dấu → chi tiết, bộ lọc/empty/reset, sắp xếp, chọn danh mục và Top 10, required validation, mật khẩu xác nhận, không lưu credentials, menu mobile, fallback địa điểm thiếu.
- `npm run verify`: kiểm tra lại component F1 thành công sau khi thêm F2.
- Kết quả máy đọc: `docs/screenshots/f2/verification.json`.
- 33 ảnh thực tế ở `docs/screenshots/f2/`: mỗi route có ảnh desktop/tablet/mobile/small-mobile và một ảnh trang chủ đúng viewport Figma.
- Đã xem trực tiếp ảnh trang chủ desktop/mobile, tìm kiếm desktop, login desktop, đăng ký mobile và đối chiếu các ảnh desktop với screenshot Figma.

## Tệp đã tạo/thay đổi

Tạo mới:

- `src/components/layout/PublicLayout.jsx`
- `src/components/common/PublicSearch.jsx`
- `src/components/places/PlaceSection.jsx`, `PlaceFilters.jsx`
- `src/pages/HomePage.jsx`, `SearchPage.jsx`, `PlaceDetailPage.jsx`, `AuthPage.jsx`, `CategoriesPage.jsx`, `TopPlacesPage.jsx`
- `scripts/verify-f2.cjs`
- `docs/F2-REPORT.md`, ảnh và JSON trong `docs/screenshots/f2/`

Thay đổi:

- `src/App.jsx`, `src/assets/places.js`
- `src/components/layout/Header.jsx`
- `src/components/common/Button.jsx`, `SearchForm.jsx`
- `src/pages/ComponentPreviewPage.jsx`
- `scripts/verify-ui.cjs` (đường dẫn Design System mới)
- `package.json` (lệnh `verify:f2`), `index.html`, `README.md`
- Ảnh và JSON kiểm tra lại F1 trong `docs/screenshots/`

`dist/` là sản phẩm build, không phải source được chỉnh tay.

## Phần chưa thực hiện

Không có backend theo phạm vi người dùng chọn: chưa có dữ liệu thật, xác thực thật, loading/error HTTP, bảng xếp hạng aggregation hoặc phân bố sao thực. Các trường hợp này không được đánh dấu nghiệm thu tích hợp. F2 là giao diện minh họa đã kiểm tra, chưa phải hệ thống vận hành thật. F3 người dùng/review/bình luận và F4 quản trị chưa triển khai; chờ duyệt F2 trước khi chuyển giai đoạn.

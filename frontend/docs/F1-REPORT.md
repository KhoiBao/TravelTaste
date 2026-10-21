# F1 — Design System

Ngày: 20/10/2026. Trạng thái: đã triển khai F1, chờ người dùng nghiệm thu trước F2.

## Phạm vi và quyết định

- Chỉ giao diện theo yêu cầu bổ sung của người dùng; không tích hợp backend.
- React + Vite + Tailwind CSS theo lựa chọn mới, thay yêu cầu CSS3 thuần ban đầu.
- Dự án mới ở `D:/traveltaste-frontend`; không có source TravelTaste hiện hữu được chỉ định.
- Không commit, push, deploy, sửa Figma, backend hoặc MongoDB.
- F1 xây nền tảng và bản xem thử component. Chưa đánh dấu trang công khai/người dùng/admin hoàn thành.

## Nguồn thiết kế và mapping đã triển khai

File: https://www.figma.com/design/d0TDsoSHxZRPVhgFdjgIIk/TravelTaste---MongoDB-Review-Platform

| Figma node | React / CSS | Mức thực hiện |
|---|---|---|
| 2:2 — TravelTaste Design System | `src/pages/DesignSystemPage.jsx` | Bản xem thử theo frame 720 × 800 |
| 2:8–2:29 — Palette | `src/styles/variables.css`, `global.css` | 8 màu nguyên bản |
| 2:3–2:46 — Typography / spacing | `variables.css`, `DesignSystemPage.jsx` | Inter 400/700, cỡ chữ, gap, padding |
| 2:36 / 2:58 — Button | `components/common/Button.jsx` | Nút và React Router Link |
| 2:38–2:42 — Filter | `components/common/FilterChip.jsx` | Focus, chọn/bỏ chọn, bàn phím |
| 2:48 — Public Header | `components/layout/Header.jsx` | Component nhận dữ liệu điều hướng, có menu mobile |
| 2:52 — Hero | `components/places/HeroImage.jsx` | 900 × 165, object-cover |
| 2:55 — Search | `components/common/SearchForm.jsx` | Label, submit, controlled input |
| 2:62 / 2:66 / 2:70 — PlaceCard | `PlaceCard.jsx`, `PlaceGrid.jsx` | Desktop card 255 × 220, ảnh 255 × 125, gap 16 |
| 2:65 / 2:69 / 2:73 — Rating | `components/common/Rating.jsx` | Cỡ chữ 12, mô tả screen reader |

`ComponentPreviewPage` là trang kiểm tra kỹ thuật lắp ráp các component từ frame 2:47, không có frame Figma độc lập và không được coi là trang chủ F2.

## Tokens

Primary `#137C68`; text `#24332F`; accent `#F5A623`; background `#F6F8F7`; surface `#FFFFFF`; muted `#64748B`; border `#E1E9E5`; pale `#EAF7F1`.

Font Inter; weight 400/700; line-height `normal` theo Figma; cỡ chữ 10/12/13/14/15/16/20/22/26/31/32px theo từng node. Gap 18px cho page, 16px cho hàng component, 8px cho card; page padding 28px ngang, 24px dọc. Radius button 10px, card 12px, page 14px, chip 20px. Không suy đoán error/success colors, shadows hoặc opacity interaction nếu Figma chưa định nghĩa.

## Tài nguyên

| Tệp cục bộ | Nguồn và vị trí |
|---|---|
| `src/assets/images/hoi-an.png` | Figma 2:52 / 2:63, dùng cho HeroImage và card Hội An |
| `src/assets/images/ha-long.png` | Figma 2:67, card Hạ Long |
| `src/assets/images/da-lat.png` | Figma 2:71, card Đà Lạt |
| Inter Latin/Vietnamese 400/700 | `@fontsource/inter`, build thành font cục bộ, giấy phép OFL |

Ảnh được tải nguyên bản từ URL do get_design_context cung cấp, không đổi ảnh hoặc dùng screenshot thiết kế làm nền. Không có SVG icon độc lập được cung cấp cho các component F1; ký tự ●/★ giữ đúng text layer gốc. Dung lượng ảnh xấp xỉ 305/237/179 kB, không biến đổi ảnh nguồn. Không có URL Figma tạm trong source chạy ứng dụng.

## Responsive và sai khác

- Figma chỉ có desktop. Phương án đã thông báo trước khi triển khai: dưới 640px 1 cột, 640–899px 2 cột, từ 900px 3 cột. Đây là quyết định implementation, không ghi nhận là breakpoint gốc Figma.
- Font, màu, khoảng cách desktop được đối chiếu trực tiếp với context và screenshot Figma. Khác biệt rasterization chữ giữa Figma và Chrome có thể còn xuất hiện.
- Trên mobile, palette/nút xuống dòng, header có menu, heading nhỏ hơn; không cắt thao tác chính.
- Hover dùng brightness, focus dùng outline primary, selected dùng ring primary để thao tác bằng chuột/bàn phím. Đây là trạng thái bổ sung vì frame không có đặc tả tương tác.
- Trang component có nhãn dữ liệu minh họa, thông báo khi click và tìm kiếm cục bộ; không giả lập API hoặc tuyên bố hoàn thành nghiệp vụ.
- Nút Khám phá trên Design System mở trang component; điều hướng header trong bản xem thử chỉ thông báo lựa chọn, chưa dẫn đến màn hình chức năng F2/F3.

## Kiểm tra

- `npm run build`: thành công.
- `npm run verify`: thành công; kết quả thực thi và hình trong `docs/screenshots/verification.json`.
- Kiểm tra viewport 960px, 768px, 390px, 320px; số cột 3/2/1/1; không tràn ngang, ảnh tải và có hình học đúng.
- Kiểm tra filter bằng chuột và Space, route preview, menu mobile, tìm kiếm, chọn card, empty state, xóa truy vấn.
- Kiểm tra console/page errors và HTTP lỗi của tài nguyên: không có lỗi.
- Ảnh đối chiếu: `design-system-desktop.png`, `design-system-mobile.png`, `components-desktop.png`, `components-tablet.png`, `components-mobile.png`, `components-small-mobile.png`.

## Tệp đã tạo/thay đổi

Các tệp dự án mới: `.gitignore`, `index.html`, `package.json`, `package-lock.json`, `vite.config.js`, `README.md`; toàn bộ tệp trong `src/`; `scripts/verify-ui.cjs`; báo cáo này; ảnh kiểm tra và JSON trong `docs/screenshots/`. `node_modules/`, `.npm-cache/`, `dist/` là sản phẩm cài đặt/build, được ignore.

## Tồn tại và bước kế tiếp

F2 public pages, F3 user pages, F4 admin pages và F5 kiểm tra toàn bộ chưa triển khai. API không thuộc phạm vi hiện tại. Error/success semantic tokens, trạng thái form chuyên biệt và các asset của màn hình sau phải đọc từ Figma tương ứng trước khi xây. F1 chờ nghiệm thu; không tự động chuyển F2 theo mục 9 tài liệu yêu cầu ban đầu.

ĐỀ TÀI 04: NỀN TẢNG ĐÁNH GIÁ VÀ REVIEW ĐỊA ĐIỂM DU LỊCH / ĂN UỐNG
Hệ quản trị CSDL chính: MongoDB (Document Store)
Số lượng thành viên: 03 sinh viên
Yêu cầu sản phẩm: Nền tảng cộng đồng cho phép tìm kiếm địa điểm, viết bài đánh giá, chấm điểm sao và bình luận nhiều cấp.
1. BAREM ĐÁNH GIÁ CHI TIẾT (THANG ĐIỂM 10.0)
1. Báo cáo & Thiết kế CSDL (2.5đ):
1.0đ: Phân tích ưu thế của MongoDB khi lưu trữ các bài đánh giá có cấu trúc phân cấp, đa phương tiện.
1.5đ: Bản vẽ Schema địa điểm có nhúng mảng đánh giá (reviews), hình ảnh và mảng bình luận phản hồi lồng nhau.
2. Chức năng CRUD Nền tảng (2.5đ): Quản lý danh mục địa điểm, đăng bài đánh giá, gửi bình luận và chấm điểm.
3. Chức năng nâng cao đặc trưng (2.5đ):
Thiết lập Text Index/Compound Index tối ưu hóa tìm kiếm địa điểm theo từ khóa và vị trí.
Xây dựng Aggregation Pipeline tự động tính lại điểm số trung bình (Rating Average) và tổng số review của từng địa điểm ngay khi có tương tác mới.
4. Kiểm thử hiệu năng & Demo trực quan (2.5đ):
1.0đ (Dummy Data): Bộ dữ liệu mẫu đạt chuẩn định mức bên dưới.
1.5đ (Demo sống): Thực hiện trơn tru các bước trong kịch bản demo bảo vệ.
2. QUY ĐỊNH ĐỊNH MỨC BỘ DỮ LIỆU MẪU (DUMMY DATA)
Collection diadiem: Tối thiểu 50–100 Document địa điểm du lịch/ăn uống.
Mảng reviews: Mỗi địa điểm nhúng từ 5–15 đánh giá (gồm số sao từ 1–5 và bình luận chi tiết).
3. PHÂN CÔNG CÔNG VIỆC NHÓM 3 SINH VIÊN
SV1 (Data Architect & CRUD Lead): Thiết kế Schema địa điểm có nhúng reviews đa cấp; viết API CRUD địa điểm và gửi đánh giá/bình luận.
SV2 (Advanced Query Specialist): Thiết lập Text Index; viết Aggregation Pipeline tính điểm rating trung bình thời gian thực và lọc Top 10 địa điểm nổi bật.
SV3 (Fullstack Integrator & DB Tester): Nạp 100 địa điểm kèm hàng trăm reviews mẫu; viết script test tải khi gửi nhiều đánh giá đồng thời; thiết kế giao diện mạng xã hội review và điều phối Demo.
4. KỊCH BẢN DEMO SỐNG BẢO VỆ
SV1 gửi đánh giá 1 sao/5 sao mới trên Web $\rightarrow$ SV3 mở Compass chỉ ra mảng review được cập nhật.
SV2 chứng minh điểm trung bình rating của địa điểm tự động cập nhật ngay trên giao diện thông qua Aggregation.
SV3 demo tính năng tìm kiếm địa điểm bằng Text Index trên Web và đối chiếu trong Compass.
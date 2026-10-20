package com.reviewdiadiem.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "diadiem")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiaDiem {

    @Id
    private String id;

    @Field("ten")
    private String ten;

    @Field("slug")
    private String slug;

    @Field("tenKhongDau")
    private String tenKhongDau;

    @Field("loai")
    private String loai; // AN_UONG | DU_LICH | LUU_TRU

    @Field("danhMuc")
    private List<DanhMucRef> danhMuc;

    @Field("moTa")
    private String moTa;

    @Field("diaChi")
    private DiaChi diaChi;

    @Field("viTri")
    private ViTri viTri;

    @Field("hinhAnh")
    private List<String> hinhAnh; // 1-8 URL

    @Field("ratingAvg")
    private Double ratingAvg;

    @Field("reviewCount")
    private Integer reviewCount;

    @Field("reviews")
    private List<Review> reviews;

    @Field("trangThai")
    private String trangThai; // ACTIVE | HIDDEN

    @Field("ngayTao")
    private LocalDateTime ngayTao;

    @Field("ngayCapNhat")
    private LocalDateTime ngayCapNhat;
}

package com.reviewdiadiem.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "danhmuc")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DanhMuc {

    @Id
    private String id;

    @Field("ten")
    private String ten;

    @Field("slug")
    private String slug;

    @Field("moTa")
    private String moTa;

    @Field("icon")
    private String icon;

    @Field("thuTu")
    private Integer thuTu;

    @Field("trangThai")
    private String trangThai; // ACTIVE | HIDDEN

    @Field("ngayTao")
    private LocalDateTime ngayTao;

    @Field("ngayCapNhat")
    private LocalDateTime ngayCapNhat;
}

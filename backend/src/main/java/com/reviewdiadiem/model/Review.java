package com.reviewdiadiem.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Field("reviewId")
    private String reviewId;

    @Field("userId")
    private String userId;

    @Field("tenUser")
    private String tenUser;

    @Field("avatarUser")
    private String avatarUser;

    @Field("soSao")
    private Integer soSao; // 1-5

    @Field("tieuDe")
    private String tieuDe;

    @Field("noiDung")
    private String noiDung;

    @Field("hinhAnh")
    private List<String> hinhAnh; // 0-5 URL

    @Field("ngayTao")
    private LocalDateTime ngayTao;

    @Field("ngayCapNhat")
    private LocalDateTime ngayCapNhat;

    @Field("binhLuan")
    private List<BinhLuan> binhLuan; // nested comments
}

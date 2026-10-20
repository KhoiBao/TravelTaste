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
public class BinhLuan {

    @Field("commentId")
    private String commentId;

    @Field("userId")
    private String userId;

    @Field("tenUser")
    private String tenUser;

    @Field("avatarUser")
    private String avatarUser;

    @Field("noiDung")
    private String noiDung;

    @Field("ngayTao")
    private LocalDateTime ngayTao;

    @Field("ngayCapNhat")
    private LocalDateTime ngayCapNhat;

    @Field("likedBy")
    private List<String> likedBy;

    @Field("traLoi")
    private List<BinhLuan> traLoi; // max 2 more levels (total depth 3)
}

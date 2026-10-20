package com.reviewdiadiem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {

    private String reviewId;
    private String userId;
    private String tenUser;
    private String avatarUser;
    private Integer soSao;
    private String tieuDe;
    private String noiDung;
    private List<String> hinhAnh;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayCapNhat;
    private List<CommentDto> binhLuan;
}

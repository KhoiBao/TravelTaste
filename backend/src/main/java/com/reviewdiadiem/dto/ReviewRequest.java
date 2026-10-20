package com.reviewdiadiem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ReviewRequest {

    @NotNull(message = "Số sao không được để trống")
    private Integer soSao;

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(min = 3, max = 120)
    private String tieuDe;

    @NotBlank(message = "Nội dung không được để trống")
    @Size(min = 10, max = 2000)
    private String noiDung;

    @Size(max = 5)
    private List<String> hinhAnh;
}

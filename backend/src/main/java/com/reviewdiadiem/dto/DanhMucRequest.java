package com.reviewdiadiem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DanhMucRequest {

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(min = 2, max = 80)
    private String ten;

    @Size(max = 500)
    private String moTa;

    private String icon;

    private Integer thuTu;

    @jakarta.validation.constraints.Pattern(regexp = "ACTIVE|HIDDEN")
    private String trangThai;
}

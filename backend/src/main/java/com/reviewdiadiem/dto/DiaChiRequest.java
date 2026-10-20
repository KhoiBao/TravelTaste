package com.reviewdiadiem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DiaChiRequest {

    @Size(max = 20)
    private String so;

    @NotBlank(message = "Đường không được để trống")
    @Size(max = 150)
    private String duong;

    @NotBlank(message = "Quận/Huyện không được để trống")
    @Size(max = 100)
    private String quan;

    @NotBlank(message = "Thành phố không được để trống")
    @Size(max = 100)
    private String thanhPho;
}

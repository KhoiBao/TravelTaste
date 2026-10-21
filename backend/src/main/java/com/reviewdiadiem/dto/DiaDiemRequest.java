package com.reviewdiadiem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class DiaDiemRequest {

    @NotBlank(message = "Tên địa điểm không được để trống")
    @Size(min = 2, max = 150)
    private String ten;

    @NotNull(message = "Loại không được để trống")
    @jakarta.validation.constraints.Pattern(regexp = "AN_UONG|DU_LICH|LUU_TRU")
    private String loai;

    @NotNull(message = "Danh mục không được để trống")
    @Size(min = 1, max = 3)
    private List<String> danhMucId;

    @NotBlank(message = "Mô tả không được để trống")
    @Size(min = 20, max = 2000)
    private String moTa;

    @jakarta.validation.Valid
    @NotNull
    private DiaChiRequest diaChi;

    @NotNull(message = "Vị trí không được để trống")
    @jakarta.validation.Valid
    private ViTriRequest viTri;

    @NotNull
    @Size(min = 1, max = 8)
    private List<String> hinhAnh;

    @jakarta.validation.constraints.Pattern(regexp = "ACTIVE|HIDDEN")
    private String trangThai;
}

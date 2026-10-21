package com.reviewdiadiem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiaDiemSummary implements LikeAware {

    private String id;
    private String ten;
    private String slug;
    private String loai;
    private List<DanhMucRefDto> danhMuc;
    private DiaChiSummary diaChi;
    private Double ratingAvg;
    private Integer reviewCount;
    private List<String> hinhAnh;
    private String trangThai;
    private int luotThich;
    private boolean daYeuThich;
}

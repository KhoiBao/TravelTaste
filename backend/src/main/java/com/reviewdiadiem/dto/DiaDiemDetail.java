package com.reviewdiadiem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiaDiemDetail {

    private String id;
    private String ten;
    private String slug;
    private String loai;
    private List<DanhMucRefDto> danhMuc;
    private String moTa;
    private DiaChiSummary diaChi;
    private List<Double> viTri;
    private List<String> hinhAnh;
    private Double ratingAvg;
    private Integer reviewCount;
    private List<ReviewDto> reviews;
    private String trangThai;
}

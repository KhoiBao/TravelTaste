package com.reviewdiadiem.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SearchRequest {

    private String q;
    private String loai;
    private String thanhPho;
    private String danhMuc;
    private Double minRating;
    private String sort;

    @NotNull
    @Min(1)
    private Integer page = 1;

    @NotNull
    @Min(1)
    private Integer size = 10;
}

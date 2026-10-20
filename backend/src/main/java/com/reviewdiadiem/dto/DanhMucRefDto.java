package com.reviewdiadiem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DanhMucRefDto {
    private String danhMucId;
    private String ten;
    private String slug;
}

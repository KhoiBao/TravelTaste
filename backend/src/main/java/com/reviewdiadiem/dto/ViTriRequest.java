package com.reviewdiadiem.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ViTriRequest {

    @NotNull(message = "Tọa độ không được để trống")
    @Size(min = 2, max = 2)
    private List<@NotNull Double> coordinates;
}

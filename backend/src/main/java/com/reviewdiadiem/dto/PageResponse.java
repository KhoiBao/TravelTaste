package com.reviewdiadiem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {

    private List<T> content;
    private Integer page;
    private Integer size;
    private Long totalElements;
    private Integer totalPages;

    public static <T> PageResponse<T> of(List<T> content, Integer page, Integer size, Long totalElements) {
        int totalPages = (int) Math.ceil((double) totalElements / Math.max(size, 1));
        return new PageResponse<>(content, page, size, totalElements, totalPages);
    }
}

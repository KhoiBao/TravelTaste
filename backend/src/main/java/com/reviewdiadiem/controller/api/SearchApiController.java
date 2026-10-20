package com.reviewdiadiem.controller.api;

import com.reviewdiadiem.dto.ApiResponse;
import com.reviewdiadiem.dto.DiaDiemSummary;
import com.reviewdiadiem.dto.PageResponse;
import com.reviewdiadiem.dto.SearchRequest;
import com.reviewdiadiem.service.DiaDiemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchApiController {

    private final DiaDiemService diaDiemService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String loai,
            @RequestParam(required = false) String thanhPho,
            @RequestParam(required = false) String danhMuc,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {

        SearchRequest req = new SearchRequest();
        req.setQ(q);
        req.setLoai(loai);
        req.setThanhPho(thanhPho);
        req.setDanhMuc(danhMuc);
        req.setMinRating(minRating);
        req.setSort(sort);
        req.setPage(page);
        req.setSize(size);

        PageResponse<DiaDiemSummary> result = diaDiemService.list(req);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}

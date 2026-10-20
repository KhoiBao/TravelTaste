package com.reviewdiadiem.controller.api;

import com.reviewdiadiem.dto.ApiResponse;
import com.reviewdiadiem.dto.DiaDiemDetail;
import com.reviewdiadiem.dto.DiaDiemRequest;
import com.reviewdiadiem.dto.DiaDiemSummary;
import com.reviewdiadiem.dto.PageResponse;
import com.reviewdiadiem.dto.SearchRequest;
import com.reviewdiadiem.service.DiaDiemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dia-diem")
@RequiredArgsConstructor
@Valid
public class DiaDiemApiController {

    private final DiaDiemService diaDiemService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> list(
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

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<?>> detail(@PathVariable String slug) {
        DiaDiemDetail detail = diaDiemService.detail(slug);
        return ResponseEntity.ok(ApiResponse.ok(detail));
    }

    @GetMapping("/top10")
    public ResponseEntity<ApiResponse<?>> top10() {
        List<DiaDiemSummary> list = diaDiemService.top10();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/gan-toi")
    public ResponseEntity<ApiResponse<?>> ganToi(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "5") Double banKinhKm,
            @RequestParam(defaultValue = "20") Integer limit) {
        List<DiaDiemSummary> list = diaDiemService.near(lat, lng, banKinhKm, limit);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@RequestBody @jakarta.validation.Valid DiaDiemRequest req) {
        DiaDiemSummary summary = diaDiemService.create(req);
        return ResponseEntity.ok(ApiResponse.ok(summary, "Tạo địa điểm thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable String id, @RequestBody @jakarta.validation.Valid DiaDiemRequest req) {
        DiaDiemSummary summary = diaDiemService.update(id, req);
        return ResponseEntity.ok(ApiResponse.ok(summary, "Cập nhật địa điểm thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable String id) {
        diaDiemService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xoá địa điểm thành công"));
    }
}

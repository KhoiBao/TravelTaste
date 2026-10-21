package com.reviewdiadiem.controller.admin;

import com.reviewdiadiem.dto.ApiResponse;
import com.reviewdiadiem.dto.DiaDiemRequest;
import com.reviewdiadiem.dto.DiaDiemSummary;
import com.reviewdiadiem.service.DiaDiemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dia-diem")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DiaDiemAdminController {

    private final DiaDiemService diaDiemService;

    private final com.reviewdiadiem.repository.DiaDiemRepository repository;
    @GetMapping
    public ResponseEntity<ApiResponse<?>> list() { return ResponseEntity.ok(ApiResponse.ok(diaDiemService.adminList())); }

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

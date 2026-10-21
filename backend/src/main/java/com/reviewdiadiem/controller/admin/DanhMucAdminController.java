package com.reviewdiadiem.controller.admin;

import com.reviewdiadiem.dto.ApiResponse;
import com.reviewdiadiem.dto.DanhMucRequest;
import com.reviewdiadiem.service.DanhMucService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/danh-muc")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DanhMucAdminController {

    private final DanhMucService danhMucService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> list() {
        return ResponseEntity.ok(danhMucService.list());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@RequestBody @jakarta.validation.Valid DanhMucRequest req) {
        return ResponseEntity.ok(danhMucService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable String id, @RequestBody @jakarta.validation.Valid DanhMucRequest req) {
        return ResponseEntity.ok(danhMucService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable String id) {
        return ResponseEntity.ok(danhMucService.delete(id));
    }
}

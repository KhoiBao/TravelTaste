package com.reviewdiadiem.controller.api;
import com.reviewdiadiem.dto.ApiResponse;
import com.reviewdiadiem.repository.DanhMucRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequiredArgsConstructor
public class DanhMucApiController {
    private final DanhMucRepository repository;
    @GetMapping("/api/danh-muc")
    public ApiResponse<?> list() { return ApiResponse.ok(repository.findByTrangThai("ACTIVE")); }
}

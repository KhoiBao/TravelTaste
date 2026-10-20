package com.reviewdiadiem.controller.api;

import com.reviewdiadiem.dto.ApiResponse;
import com.reviewdiadiem.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadApiController {

    private final FileStorageService fileStorageService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> upload(@RequestParam MultipartFile file) {
        String url = fileStorageService.store(file);
        Map<String, Object> data = new java.util.HashMap<>();
        data.put("url", url);
        return ResponseEntity.ok(ApiResponse.ok(data, "Upload ảnh thành công"));
    }
}

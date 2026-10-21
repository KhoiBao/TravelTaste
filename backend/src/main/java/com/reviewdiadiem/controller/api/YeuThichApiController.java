package com.reviewdiadiem.controller.api;

import com.reviewdiadiem.dto.ApiResponse;
import com.reviewdiadiem.service.YeuThichService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/yeu-thich")
@RequiredArgsConstructor
public class YeuThichApiController {

    private final YeuThichService yeuThichService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> saved(HttpSession session) {
        String userId = (String) session.getAttribute("USER_ID");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Chưa đăng nhập"));
        }
        return ResponseEntity.ok(yeuThichService.saved(userId));
    }

    @PostMapping("/{placeId}")
    public ResponseEntity<ApiResponse<?>> like(@PathVariable String placeId, HttpSession session) {
        String userId = (String) session.getAttribute("USER_ID");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Chưa đăng nhập"));
        }
        return ResponseEntity.ok(yeuThichService.like(userId, placeId));
    }

    @DeleteMapping("/{placeId}")
    public ResponseEntity<ApiResponse<?>> unlike(@PathVariable String placeId, HttpSession session) {
        String userId = (String) session.getAttribute("USER_ID");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Chưa đăng nhập"));
        }
        return ResponseEntity.ok(yeuThichService.unlike(userId, placeId));
    }
}

package com.reviewdiadiem.controller.api;

import com.reviewdiadiem.dto.ApiResponse;
import com.reviewdiadiem.dto.ReviewRequest;
import com.reviewdiadiem.service.ReviewService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dia-diem/{placeId}/reviews")
@RequiredArgsConstructor
public class ReviewApiController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(
            @PathVariable String placeId,
            @RequestBody ReviewRequest req,
            HttpSession session) {
        String userId = (String) session.getAttribute("USER_ID");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Chưa đăng nhập"));
        }
        return ResponseEntity.ok(reviewService.createReview(placeId, userId, req));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<?>> update(
            @PathVariable String placeId,
            @PathVariable String reviewId,
            @RequestBody ReviewRequest req,
            HttpSession session) {
        String userId = (String) session.getAttribute("USER_ID");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Chưa đăng nhập"));
        }
        return ResponseEntity.ok(reviewService.updateReview(placeId, reviewId, userId, req));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<?>> delete(
            @PathVariable String placeId,
            @PathVariable String reviewId,
            HttpSession session) {
        String userId = (String) session.getAttribute("USER_ID");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Chưa đăng nhập"));
        }
        boolean isAdmin = "ADMIN".equals(session.getAttribute("ROLE"));
        return ResponseEntity.ok(reviewService.deleteReview(placeId, reviewId, userId, isAdmin));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> list(
            @PathVariable String placeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "newest") String sort) {
        return ResponseEntity.ok(reviewService.listReviews(placeId, page, size, sort));
    }
}

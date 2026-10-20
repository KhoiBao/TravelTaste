package com.reviewdiadiem.controller.api;

import com.reviewdiadiem.dto.ApiResponse;
import com.reviewdiadiem.dto.CommentRequest;
import com.reviewdiadiem.service.CommentService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dia-diem/{placeId}/reviews/{reviewId}/comments")
@RequiredArgsConstructor
public class CommentApiController {

    private final CommentService commentService;
    private final com.reviewdiadiem.service.CommentLikeService commentLikeService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> addComment(
            @PathVariable String placeId,
            @PathVariable String reviewId,
            @RequestBody @jakarta.validation.Valid CommentRequest req,
            HttpSession session) {
        String userId = (String) session.getAttribute("USER_ID");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Chưa đăng nhập"));
        }
        return ResponseEntity.ok(commentService.addComment(placeId, reviewId, userId, req, null));
    }

    @PostMapping("/{commentId}/replies")
    public ResponseEntity<ApiResponse<?>> addReply(
            @PathVariable String placeId,
            @PathVariable String reviewId,
            @PathVariable String commentId,
            @RequestBody @jakarta.validation.Valid CommentRequest req,
            HttpSession session) {
        String userId = (String) session.getAttribute("USER_ID");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Chưa đăng nhập"));
        }
        return ResponseEntity.ok(commentService.addComment(placeId, reviewId, userId, req, commentId));
    }

    @PutMapping("/{commentId}/like")
    public ResponseEntity<ApiResponse<?>> like(@PathVariable String placeId, @PathVariable String reviewId,
            @PathVariable String commentId, HttpSession session) {
        return likeResponse(placeId, reviewId, commentId, session, true);
    }

    @DeleteMapping("/{commentId}/like")
    public ResponseEntity<ApiResponse<?>> unlike(@PathVariable String placeId, @PathVariable String reviewId,
            @PathVariable String commentId, HttpSession session) {
        return likeResponse(placeId, reviewId, commentId, session, false);
    }

    private ResponseEntity<ApiResponse<?>> likeResponse(String placeId, String reviewId, String commentId, HttpSession session, boolean liked) {
        String userId = (String) session.getAttribute("USER_ID");
        if (userId == null) return ResponseEntity.status(401).body(ApiResponse.error("Chưa đăng nhập"));
        return ResponseEntity.ok(commentLikeService.setLiked(placeId, reviewId, commentId, userId, liked));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<?>> delete(
            @PathVariable String placeId,
            @PathVariable String reviewId,
            @PathVariable String commentId,
            HttpSession session) {
        String userId = (String) session.getAttribute("USER_ID");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Chưa đăng nhập"));
        }
        boolean isAdmin = com.reviewdiadiem.util.SecurityUtil.isAdmin();
        return ResponseEntity.ok(commentService.deleteComment(placeId, reviewId, commentId, userId, isAdmin));
    }
}

package com.reviewdiadiem.service;

import com.reviewdiadiem.dto.ApiResponse;
import com.reviewdiadiem.dto.CommentDto;
import com.reviewdiadiem.dto.CommentRequest;
import com.reviewdiadiem.model.BinhLuan;
import com.reviewdiadiem.model.DiaDiem;
import com.reviewdiadiem.model.Review;
import com.reviewdiadiem.repository.DiaDiemRepository;
import com.reviewdiadiem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentService {

    private final DiaDiemRepository diaDiemRepository;
    private final UserRepository userRepository;
    private final FlatCollectionService flatCollectionService;

    private static final int MAX_DEPTH = 3;

    @Transactional
    public ApiResponse<?> addComment(String placeId, String reviewId, String currentUserId, CommentRequest req, String parentCommentId) {
        DiaDiem dd = diaDiemRepository.findById(placeId)
                .orElseThrow(() -> new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy địa điểm"));

        List<Review> reviews = dd.getReviews() == null ? List.of() : new ArrayList<>(dd.getReviews());
        Review target = null;
        for (Review r : reviews) {
            if (reviewId.equals(r.getReviewId())) {
                target = r;
                break;
            }
        }
        if (target == null) {
            throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá");
        }

        UserInfo user = getUser(currentUserId);

        BinhLuan comment = new BinhLuan();
        comment.setCommentId(UUID.randomUUID().toString());
        comment.setUserId(currentUserId);
        comment.setTenUser(user.tenUser);
        comment.setAvatarUser(user.avatarUser);
        comment.setNoiDung(req.getNoiDung());
        comment.setNgayTao(LocalDateTime.now());
        comment.setNgayCapNhat(LocalDateTime.now());
        comment.setTraLoi(List.of());
        comment.setLikedBy(new ArrayList<>());

        if (parentCommentId == null) {
            // Bình luận gốc vào review
            List<BinhLuan> comments = target.getBinhLuan() == null ? new ArrayList<>() : new ArrayList<>(target.getBinhLuan());
            comments.add(comment);
            target.setBinhLuan(comments);
        } else {
            // Trả lời bình luận cha, kiểm tra độ sâu
            boolean added = addReplyRecursive(target.getBinhLuan() == null ? List.of() : new ArrayList<>(target.getBinhLuan()),
                    parentCommentId, comment, 1);
            if (!added) {
                throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy bình luận cha hoặc đã vượt quá mức trả lời cho phép");
            }
            // Reply nodes are mutated in place by addReplyRecursive.
        }
        dd.setReviews(reviews);
        dd.setNgayCapNhat(LocalDateTime.now());
        diaDiemRepository.save(dd);
        flatCollectionService.syncReview(dd.getId(), reviewId);

        Map<String, Object> data = new HashMap<>();
        data.put("comment", toDto(comment));
        return ApiResponse.ok(data, "Bình luận đã được gửi");
    }

    @Transactional
    public ApiResponse<?> deleteComment(String placeId, String reviewId, String commentId, String currentUserId, boolean isAdmin) {
        DiaDiem dd = diaDiemRepository.findById(placeId)
                .orElseThrow(() -> new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy địa điểm"));
        List<Review> reviews = dd.getReviews() == null ? List.of() : new ArrayList<>(dd.getReviews());

        boolean found = deleteCommentInTree(reviews, reviewId, commentId, currentUserId, isAdmin);
        if (!found) {
            throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy bình luận hoặc không có quyền");
        }
        dd.setReviews(reviews);
        dd.setNgayCapNhat(LocalDateTime.now());
        diaDiemRepository.save(dd);
        flatCollectionService.syncReview(dd.getId(), reviewId);
        return ApiResponse.ok(null, "Xoá bình luận thành công");
    }

    private boolean addReplyRecursive(List<BinhLuan> list, String parentId, BinhLuan reply, int currentDepth) {
        if (list == null) return false;
        for (BinhLuan b : list) {
            if (parentId.equals(b.getCommentId())) {
                if (currentDepth >= MAX_DEPTH) {
                    return false;
                }
                List<BinhLuan> replies = b.getTraLoi() == null ? new ArrayList<>() : new ArrayList<>(b.getTraLoi());
                replies.add(reply);
                b.setTraLoi(replies);
                return true;
            }
            if (addReplyRecursive(b.getTraLoi(), parentId, reply, currentDepth + 1)) {
                return true;
            }
        }
        return false;
    }

    private boolean deleteCommentInTree(List<Review> reviews, String reviewId, String commentId,
                                        String currentUserId, boolean isAdmin) {
        for (Review r : reviews) {
            if (!reviewId.equals(r.getReviewId())) continue;
            List<BinhLuan> comments = r.getBinhLuan() == null ? List.of() : new ArrayList<>(r.getBinhLuan());
            Iterator<BinhLuan> it = comments.iterator();
            while (it.hasNext()) {
                BinhLuan b = it.next();
                if (commentId.equals(b.getCommentId())) {
                    if (!isAdmin && !currentUserId.equals(b.getUserId())) { throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.FORBIDDEN, "Bạn chỉ được xóa bình luận của chính mình"); }
                    it.remove();
                    r.setBinhLuan(comments);
                    return true;
                }
                if (deleteCommentNode(b.getTraLoi(), commentId, currentUserId, isAdmin)) {
                    r.setBinhLuan(comments);
                    return true;
                }
            }
        }
        return false;
    }

    private boolean deleteCommentNode(List<BinhLuan> list, String commentId, String currentUserId, boolean isAdmin) {
        if (list == null) return false;
        Iterator<BinhLuan> it = list.iterator();
        while (it.hasNext()) {
            BinhLuan b = it.next();
            if (commentId.equals(b.getCommentId())) {
                if (!isAdmin && !currentUserId.equals(b.getUserId())) { throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.FORBIDDEN, "Bạn chỉ được xóa bình luận của chính mình"); }
                it.remove();
                return true;
            }
            if (deleteCommentNode(b.getTraLoi(), commentId, currentUserId, isAdmin)) {
                return true;
            }
        }
        return false;
    }

    private CommentDto toDto(BinhLuan b) {
        CommentDto dto = new CommentDto();
        dto.setLikeCount(b.getLikedBy() == null ? 0 : new java.util.HashSet<>(b.getLikedBy()).size());
        dto.setLiked(b.getLikedBy() != null && b.getLikedBy().contains(com.reviewdiadiem.util.SecurityUtil.getCurrentUsername()));
        dto.setCommentId(b.getCommentId());
        dto.setUserId(b.getUserId());
        dto.setTenUser(b.getTenUser());
        dto.setAvatarUser(b.getAvatarUser());
        dto.setNoiDung(b.getNoiDung());
        dto.setNgayTao(b.getNgayTao());
        dto.setNgayCapNhat(b.getNgayCapNhat());
        dto.setTraLoi(b.getTraLoi() == null ? List.of()
                : b.getTraLoi().stream().map(this::toDto).collect(Collectors.toList()));
        return dto;
    }

    private record UserInfo(String tenUser, String avatarUser) {}

    private UserInfo getUser(String userId) {
        var user = userRepository.findById(userId).orElseThrow(() -> new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
        return new UserInfo(user.getHoTen(), user.getAvatar());
    }
}

package com.reviewdiadiem.service;

import com.reviewdiadiem.dto.ApiResponse;
import com.reviewdiadiem.dto.CommentDto;
import com.reviewdiadiem.dto.ReviewDto;
import com.reviewdiadiem.dto.ReviewRequest;
import com.reviewdiadiem.model.BinhLuan;
import com.reviewdiadiem.model.DiaDiem;
import com.reviewdiadiem.model.Review;
import com.reviewdiadiem.model.User;
import com.reviewdiadiem.repository.DiaDiemRepository;
import com.reviewdiadiem.repository.UserRepository;
import com.reviewdiadiem.util.SlugUtil;
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
public class ReviewService {

    private final DiaDiemRepository diaDiemRepository;
    private final UserRepository userRepository;
    private final RatingService ratingService;

    @Transactional
    public ApiResponse<?> createReview(String placeId, String currentUserId, ReviewRequest req) {
        DiaDiem dd = diaDiemRepository.findById(placeId)
                .orElseThrow(() -> new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy địa điểm"));
        if (!"ACTIVE".equals(dd.getTrangThai())) {
            throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.CONFLICT, "Địa điểm đã ẩn, không nhận đánh giá mới");
        }

        // Kiểm tra user đã review địa điểm này chưa
        if (dd.getReviews() != null) {
            boolean exists = dd.getReviews().stream()
                    .anyMatch(r -> currentUserId.equals(r.getUserId()));
            if (exists) {
                throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.CONFLICT, "Bạn đã đánh giá địa điểm này, vui lòng sửa đánh giá cũ");
            }
        }

        if (dd.getReviews() != null && dd.getReviews().size() >= 500) {
            throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.CONFLICT, "Đã đạt giới hạn 500 đánh giá cho địa điểm này");
        }

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));

        Review review = new Review();
        review.setReviewId(UUID.randomUUID().toString());
        review.setUserId(currentUserId);
        review.setTenUser(user.getHoTen());
        review.setAvatarUser(user.getAvatar());
        review.setSoSao(req.getSoSao());
        review.setTieuDe(req.getTieuDe());
        review.setNoiDung(req.getNoiDung());
        review.setHinhAnh(req.getHinhAnh() == null ? List.of() : req.getHinhAnh());
        review.setNgayTao(LocalDateTime.now());
        review.setNgayCapNhat(LocalDateTime.now());
        review.setBinhLuan(List.of());

        List<Review> reviews = dd.getReviews() == null ? new ArrayList<>() : new ArrayList<>(dd.getReviews());
        reviews.add(review);
        dd.setReviews(reviews);
        dd.setNgayCapNhat(LocalDateTime.now());
        diaDiemRepository.save(dd);

        // Tính lại rating
        ratingService.recalculate(placeId);

        DiaDiem updated = diaDiemRepository.findById(placeId)
                .orElseThrow(() -> new RuntimeException("Không thể tải lại địa điểm"));
        ReviewDto dto = toDto(updated.getReviews().stream()
                .filter(r -> review.getReviewId().equals(r.getReviewId())).findFirst().orElse(review));

        Map<String, Object> data = new HashMap<>();
        data.put("review", dto);
        data.put("ratingAvg", updated.getRatingAvg());
        data.put("reviewCount", updated.getReviewCount());
        return ApiResponse.ok(data, "Đánh giá đã được gửi");
    }

    @Transactional
    public ApiResponse<?> updateReview(String placeId, String reviewId, String currentUserId, ReviewRequest req) {
        DiaDiem dd = diaDiemRepository.findById(placeId)
                .orElseThrow(() -> new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy địa điểm"));

        List<Review> reviews = dd.getReviews() == null ? List.of() : new ArrayList<>(dd.getReviews());
        boolean found = false;
        for (Review r : reviews) {
            if (reviewId.equals(r.getReviewId())) {
                if (!currentUserId.equals(r.getUserId())) {
                    throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.FORBIDDEN, "Không phải chủ sở hữu đánh giá");
                }
                r.setSoSao(req.getSoSao());
                r.setTieuDe(req.getTieuDe());
                r.setNoiDung(req.getNoiDung());
                r.setHinhAnh(req.getHinhAnh() == null ? List.of() : req.getHinhAnh());
                r.setNgayCapNhat(LocalDateTime.now());
                found = true;
                break;
            }
        }
        if (!found) {
            throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá");
        }
        dd.setReviews(reviews);
        dd.setNgayCapNhat(LocalDateTime.now());
        diaDiemRepository.save(dd);

        ratingService.recalculate(placeId);
        return ApiResponse.ok(null, "Cập nhật đánh giá thành công");
    }

    @Transactional
    public ApiResponse<?> deleteReview(String placeId, String reviewId, String currentUserId, boolean isAdmin) {
        DiaDiem dd = diaDiemRepository.findById(placeId)
                .orElseThrow(() -> new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy địa điểm"));

        List<Review> reviews = dd.getReviews() == null ? List.of() : new ArrayList<>(dd.getReviews());
        Iterator<Review> it = reviews.iterator();
        boolean found = false;
        while (it.hasNext()) {
            Review r = it.next();
            if (reviewId.equals(r.getReviewId())) {
                if (!isAdmin && !currentUserId.equals(r.getUserId())) {
                    throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.FORBIDDEN, "Không phải chủ sở hữu đánh giá");
                }
                it.remove();
                found = true;
                break;
            }
        }
        if (!found) {
            throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá");
        }
        dd.setReviews(reviews);
        dd.setNgayCapNhat(LocalDateTime.now());
        diaDiemRepository.save(dd);

        ratingService.recalculate(placeId);
        return ApiResponse.ok(null, "Xoá đánh giá thành công");
    }

    public ApiResponse<?> listReviews(String placeId, int page, int size, String sort) {
        if (page < 0 || size < 1 || size > 100) throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "Phân trang không hợp lệ");
        DiaDiem dd = diaDiemRepository.findById(placeId)
                .orElseThrow(() -> new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy địa điểm"));
        List<Review> reviews = dd.getReviews() == null ? List.of() : dd.getReviews();

        // Sắp xếp
        Comparator<Review> c;
        if ("newest".equals(sort)) {
            c = Comparator.comparing(Review::getNgayTao, Comparator.nullsLast(Comparator.reverseOrder()));
        } else if ("rating".equals(sort)) {
            c = Comparator.comparingInt(Review::getSoSao).reversed();
        } else {
            c = Comparator.comparing(Review::getNgayTao, Comparator.nullsLast(Comparator.reverseOrder()));
        }
        List<Review> sorted = reviews.stream().sorted(c).collect(Collectors.toList());

        int from = Math.min(page * size, sorted.size());
        int to = Math.min(from + size, sorted.size());
        List<ReviewDto> content = sorted.subList(from, to).stream().map(this::toDto).collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("content", content);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", sorted.size());
        data.put("totalPages", (int) Math.ceil((double) sorted.size() / Math.max(size, 1)));
        return ApiResponse.ok(data);
    }

    private ReviewDto toDto(Review r) {
        ReviewDto dto = new ReviewDto();
        dto.setReviewId(r.getReviewId());
        dto.setUserId(r.getUserId());
        dto.setTenUser(r.getTenUser());
        dto.setAvatarUser(r.getAvatarUser());
        dto.setSoSao(r.getSoSao());
        dto.setTieuDe(r.getTieuDe());
        dto.setNoiDung(r.getNoiDung());
        dto.setHinhAnh(r.getHinhAnh() == null ? List.of() : r.getHinhAnh());
        dto.setNgayTao(r.getNgayTao());
        dto.setNgayCapNhat(r.getNgayCapNhat());
        dto.setBinhLuan(r.getBinhLuan() == null ? List.of()
                : r.getBinhLuan().stream().map(this::toCommentDto).collect(Collectors.toList()));
        return dto;
    }

    private CommentDto toCommentDto(BinhLuan b) {
        CommentDto dto = new CommentDto();
        dto.setCommentId(b.getCommentId());
        dto.setUserId(b.getUserId());
        dto.setTenUser(b.getTenUser());
        dto.setAvatarUser(b.getAvatarUser());
        dto.setNoiDung(b.getNoiDung());
        dto.setNgayTao(b.getNgayTao());
        dto.setNgayCapNhat(b.getNgayCapNhat());
        dto.setTraLoi(b.getTraLoi() == null ? List.of()
                : b.getTraLoi().stream().map(this::toCommentDto).collect(Collectors.toList()));
        return dto;
    }
}

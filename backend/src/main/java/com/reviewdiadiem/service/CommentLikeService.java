package com.reviewdiadiem.service;

import com.reviewdiadiem.dto.ApiResponse;
import com.reviewdiadiem.exception.ApiException;
import com.reviewdiadiem.model.BinhLuan;
import com.reviewdiadiem.model.DiaDiem;
import com.reviewdiadiem.repository.DiaDiemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CommentLikeService {
    private final DiaDiemRepository places;
    private final MongoTemplate mongo;
    private final FlatCollectionService flatCollectionService;

    public ApiResponse<?> setLiked(String placeId, String reviewId, String commentId, String userId, boolean liked) {
        if (userId == null || userId.isBlank()) throw new ApiException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
        var path = findPath(load(placeId), reviewId, commentId);
        if (path == null) throw missing();
        String field = "reviews.$[review].binhLuan.$[c0]";
        for (int i = 1; i < path.size(); i++) field += ".traLoi.$[c" + i + "]";
        field += ".likedBy";
        // Existing comments may have no likedBy field (or an explicit null).
        // Initialize conditionally so another request's likes are never reset.
        Update initialize = new Update().set(field, List.of()).filterArray("review.reviewId", reviewId);
        for (int i = 0; i < path.size(); i++) {
            var condition = Criteria.where("c" + i + ".commentId").is(path.get(i));
            if (i == path.size() - 1) condition.and("c" + i + ".likedBy").is(null);
            initialize.filterArray(condition);
        }
        mongo.updateFirst(Query.query(Criteria.where("_id").is(placeId)), initialize, DiaDiem.class);
        Update update = new Update();
        if (liked) update.addToSet(field, userId); else update.pull(field, userId);
        update.filterArray("review.reviewId", reviewId);
        for (int i = 0; i < path.size(); i++) update.filterArray("c" + i + ".commentId", path.get(i));
        mongo.updateFirst(Query.query(Criteria.where("_id").is(placeId)), update, DiaDiem.class);
        flatCollectionService.syncReview(placeId, reviewId);
        var place = load(placeId);
        var nodes = place.getReviews().stream().filter(r -> reviewId.equals(r.getReviewId())).findFirst().orElseThrow(CommentLikeService::missing).getBinhLuan();
        BinhLuan result = null;
        for (String id : path) {
            result = nodes == null ? null : nodes.stream().filter(c -> id.equals(c.getCommentId())).findFirst().orElse(null);
            if (result == null) throw missing();
            nodes = result.getTraLoi();
        }
        var likes = result.getLikedBy() == null ? Set.<String>of() : new HashSet<>(result.getLikedBy());
        return ApiResponse.ok(Map.of("commentId", commentId, "likeCount", likes.size(), "liked", likes.contains(userId)));
    }

    private DiaDiem load(String id) { return places.findById(id).orElseThrow(CommentLikeService::missing); }
    private static ApiException missing() { return new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bình luận"); }
    private List<String> findPath(DiaDiem place, String reviewId, String commentId) {
        if (place.getReviews() == null) return null;
        for (var review : place.getReviews()) if (reviewId.equals(review.getReviewId())) return findPath(review.getBinhLuan(), commentId);
        return null;
    }
    private List<String> findPath(List<BinhLuan> nodes, String id) {
        if (nodes == null) return null;
        for (var node : nodes) {
            if (id.equals(node.getCommentId())) return new ArrayList<>(List.of(id));
            var child = findPath(node.getTraLoi(), id);
            if (child != null) { child.add(0, node.getCommentId()); return child; }
        }
        return null;
    }
}

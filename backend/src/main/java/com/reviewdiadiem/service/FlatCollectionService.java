package com.reviewdiadiem.service;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.ReplaceOptions;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;

/**
 * Ghi thẳng dữ liệu đánh giá/bình luận/ảnh sang các collection phẳng (danhgia, binhluan, hinhanh)
 * để phân tích trực tiếp trong MongoDB Compass.
 *
 * <p>Ứng dụng luôn lưu vào {@code diadiem} (mảng {@code reviews[]} nhúng sẵn bình luận) và đây là
 * nguồn sự thật. Các collection phẳng chỉ là bản sao, được đồng bộ ngay sau mỗi thao tác ghi
 * nên không cần tiến trình watcher nào chạy song song.
 *
 * <p>Giá trị được sao chép thẳng từ document gốc nên kiểu BSON luôn khớp với dữ liệu seed.
 */
@Slf4j
@Service
public class FlatCollectionService {

    private static final ReplaceOptions UPSERT = new ReplaceOptions().upsert(true);
    private static final String DIADIEM = "diadiem";
    private static final String DANHGIA = "danhgia";
    private static final String BINHLUAN = "binhluan";
    private static final String HINHANH = "hinhanh";

    private final MongoTemplate mongo;

    public FlatCollectionService(MongoTemplate mongo) {
        this.mongo = mongo;
    }

    /** Đồng bộ một đánh giá cùng toàn bộ bình luận và ảnh của nó. */
    public boolean syncReview(String placeId, String reviewId) {
        try {
            Document place = loadPlace(placeId);
            if (place == null) {
                log.warn("Khong tim thay dia diem {} de dong bo review {}", placeId, reviewId);
                return false;
            }
            return syncReview(place, reviewId);
        } catch (Exception e) {
            log.error("Dong bo review {} cua dia diem {} sang collection phang that bai: {}", reviewId, placeId, e.getMessage(), e);
            return false;
        }
    }

    private boolean syncReview(Document place, String reviewId) {
        Object diaDiemId = place.get("_id");
        Document review = findReview(place, reviewId);
        if (review == null) {
            removeReview(diaDiemId, reviewId);
            return true;
        }

        Document flat = new Document(review);
        flat.put("_id", reviewId);
        flat.put("reviewId", reviewId);
        flat.put("diaDiemId", diaDiemId);
        replaceIfChanged(mongo.getCollection(DANHGIA), eq("_id", reviewId), flat);

        List<Document> expectedComments = new ArrayList<>();
        collectComments(review.getList("binhLuan", Document.class), reviewId, diaDiemId, null, 1, expectedComments);
        syncComments(expectedComments, diaDiemId, reviewId);

        syncImages(diaDiemId, reviewId, review.getList("hinhAnh", String.class), "DANHGIA");
        return true;
    }

    /** Xoá đánh giá cùng bình luận và ảnh của nó khỏi các collection phẳng. */
    public boolean removeReview(String placeId, String reviewId) {
        try {
            return removeReview(idValue(placeId), reviewId);
        } catch (Exception e) {
            log.error("Xoa review {} khoi collection phang that bai: {}", reviewId, e.getMessage(), e);
            return false;
        }
    }

    private boolean removeReview(Object diaDiemId, String reviewId) {
        mongo.getCollection(DANHGIA).deleteOne(eq("_id", reviewId));
        mongo.getCollection(BINHLUAN).deleteMany(and(eq("diaDiemId", diaDiemId), eq("reviewId", reviewId)));
        mongo.getCollection(HINHANH).deleteMany(and(eq("diaDiemId", diaDiemId), eq("reviewId", reviewId)));
        return true;
    }

    /** Đồng bộ ảnh của địa điểm. */
    public boolean syncPlaceImages(String placeId) {
        try {
            Document place = loadPlace(placeId);
            if (place == null) {
                log.warn("Khong tim thay dia diem {} de dong bo anh", placeId);
                return false;
            }
            syncImages(place.get("_id"), null, place.getList("hinhAnh", String.class), "DIADIEM");
            return true;
        } catch (Exception e) {
            log.error("Dong bo anh cua dia diem {} that bai: {}", placeId, e.getMessage(), e);
            return false;
        }
    }

    /** Xoá toàn bộ dữ liệu phẳng của một địa điểm. */
    public boolean removePlace(String placeId) {
        try {
            Object diaDiemId = idValue(placeId);
            mongo.getCollection(DANHGIA).deleteMany(eq("diaDiemId", diaDiemId));
            mongo.getCollection(BINHLUAN).deleteMany(eq("diaDiemId", diaDiemId));
            mongo.getCollection(HINHANH).deleteMany(eq("diaDiemId", diaDiemId));
            return true;
        } catch (Exception e) {
            log.error("Xoa du lieu phang cua dia diem {} that bai: {}", placeId, e.getMessage(), e);
            return false;
        }
    }

    /** Đồng bộ lại toàn bộ địa điểm, dùng lúc khởi động để vá mọi sai lệch còn sót. */
    public int syncAll() {
        int synced = 0;
        try {
            for (Document place : mongo.getCollection(DIADIEM).find().into(new ArrayList<>())) {
                for (Document review : place.getList("reviews", Document.class)) {
                    String reviewId = review.getString("reviewId");
                    if (reviewId != null && syncReview(place, reviewId)) synced++;
                }
                syncImages(place.get("_id"), null, place.getList("hinhAnh", String.class), "DIADIEM");
            }
        } catch (Exception e) {
            log.error("Dong bo toan bo collection phang that bai: {}", e.getMessage(), e);
        }
        return synced;
    }

    private Document loadPlace(String placeId) {
        return mongo.getCollection(DIADIEM).find(eq("_id", idValue(placeId))).first();
    }

    private Document findReview(Document place, String reviewId) {
        for (Document review : place.getList("reviews", Document.class)) {
            if (reviewId.equals(review.getString("reviewId"))) return review;
        }
        return null;
    }

    /** Làm phẳng bình luận lồng nhau, mỗi bình luận thành một document riêng. */
    private void collectComments(List<Document> comments, String reviewId, Object diaDiemId,
                                 String parentCommentId, int cap, List<Document> out) {
        for (Document comment : comments == null ? List.<Document>of() : comments) {
            String commentId = comment.getString("commentId");
            Document flat = new Document(comment);
            flat.remove("traLoi");
            flat.put("_id", commentId);
            flat.put("commentId", commentId);
            flat.put("reviewId", reviewId);
            flat.put("diaDiemId", diaDiemId);
            flat.put("parentCommentId", parentCommentId);
            flat.put("cap", cap);
            out.add(flat);
            collectComments(comment.getList("traLoi", Document.class), reviewId, diaDiemId, commentId, cap + 1, out);
        }
    }

    private void syncComments(List<Document> expected, Object diaDiemId, String reviewId) {
        MongoCollection<Document> collection = mongo.getCollection(BINHLUAN);
        List<Document> current = collection.find(and(eq("diaDiemId", diaDiemId), eq("reviewId", reviewId)))
                .into(new ArrayList<>());
        Set<String> expectedIds = new HashSet<>();
        for (Document document : expected) {
            expectedIds.add(document.getString("_id"));
            replaceIfChanged(collection, eq("_id", document.getString("_id")), document);
        }
        for (Document document : current) {
            if (!expectedIds.contains(document.getString("_id"))) {
                collection.deleteOne(eq("_id", document.getString("_id")));
            }
        }
    }

    private void syncImages(Object diaDiemId, String reviewId, List<String> urls, String chuThe) {
        MongoCollection<Document> collection = mongo.getCollection(HINHANH);
        String prefix = reviewId == null ? "DIADIEM:" + diaDiemId : "DANHGIA:" + reviewId;
        List<String> images = urls == null ? List.of() : urls;
        Set<String> expectedIds = new HashSet<>();
        for (int index = 0; index < images.size(); index++) {
            Document document = new Document("_id", prefix + ":" + index)
                    .append("diaDiemId", diaDiemId)
                    .append("chuThe", chuThe)
                    .append("thuTu", index)
                    .append("url", images.get(index));
            if (reviewId != null) document.append("reviewId", reviewId);
            expectedIds.add(document.getString("_id"));
            replaceIfChanged(collection, eq("_id", document.getString("_id")), document);
        }
        Bson filter = reviewId == null
                ? and(eq("diaDiemId", diaDiemId), eq("chuThe", "DIADIEM"))
                : and(eq("diaDiemId", diaDiemId), eq("reviewId", reviewId));
        for (Document document : collection.find(filter).into(new ArrayList<>())) {
            // Chỉ gỡ những ảnh đã không còn trong nguồn, giữ lại ảnh vừa ghi.
            if (!expectedIds.contains(document.getString("_id"))) {
                collection.deleteOne(eq("_id", document.getString("_id")));
            }
        }
    }

    /** Chỉ ghi khi nội dung khác đi, để không đụng vào dữ liệu đã đúng. */
    private void replaceIfChanged(MongoCollection<Document> collection, Bson filter, Document document) {
        Document current = collection.find(filter).first();
        if (current != null && current.equals(document)) return;
        collection.replaceOne(filter, document, UPSERT);
    }

    private Object idValue(String id) {
        return ObjectId.isValid(id) ? new ObjectId(id) : id;
    }
}

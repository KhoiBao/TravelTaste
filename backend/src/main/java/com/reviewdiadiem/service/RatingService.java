package com.reviewdiadiem.service;

import com.reviewdiadiem.model.DiaDiem;
import com.reviewdiadiem.repository.DiaDiemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RatingService {

    private final MongoTemplate mongoTemplate;
    private final DiaDiemRepository diaDiemRepository;

    public void recalculate(String placeId) {
        // Tính reviewCount và ratingAvg từ mảng reviews của document
        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("_id").is(placeId)),
                Aggregation.project()
                        .and("reviews").size().as("reviewCount")
                        .and("reviews").avg("soSao").as("ratingAvgRaw")
        );
        AggregationResults<Map<String, Object>> result = mongoTemplate.aggregate(agg, "diadiem", Map.class);
        Map<String, Object> doc = result.getUniqueMappedResult();

        int reviewCount = 0;
        Double ratingAvg = 0.0;
        if (doc != null) {
            Object rc = doc.get("reviewCount");
            reviewCount = rc != null ? Integer.parseInt(String.valueOf(rc)) : 0;
            Object ra = doc.get("ratingAvgRaw");
            ratingAvg = ra != null ? Math.round(Double.parseDouble(String.valueOf(ra)) * 100.0) / 100.0 : 0.0;
        }

        Update update = new Update();
        update.set("reviewCount", reviewCount);
        update.set("ratingAvg", ratingAvg);
        update.set("ngayCapNhat", java.time.LocalDateTime.now());

        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(placeId)),
                update,
                DiaDiem.class
        );
        log.info("Recalculated rating for place {}: ratingAvg={}, reviewCount={}", placeId, ratingAvg, reviewCount);
    }
}

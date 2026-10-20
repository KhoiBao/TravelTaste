package com.reviewdiadiem.repository;

import com.reviewdiadiem.model.DiaDiem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiaDiemRepository extends MongoRepository<DiaDiem, String> {

    Optional<DiaDiem> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<DiaDiem> findByTrangThai(String trangThai);

    List<DiaDiem> findByLoai(String loai);

    List<DiaDiem> findByDiaChiThanhPho(String thanhPho);

    @Query(value = "{'reviews.userId': ?0}", fields = "{'ten': 1, 'slug': 1, 'loai': 1, 'diaChi': 1, 'hinhAnh': 1, 'ratingAvg': 1, 'reviewCount': 1}")
    List<DiaDiem> findByReviewsUserId(String userId);
}

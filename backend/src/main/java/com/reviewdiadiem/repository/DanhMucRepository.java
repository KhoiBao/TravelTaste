package com.reviewdiadiem.repository;

import com.reviewdiadiem.model.DanhMuc;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DanhMucRepository extends MongoRepository<DanhMuc, String> {

    Optional<DanhMuc> findByTen(String ten);

    Optional<DanhMuc> findBySlug(String slug);

    boolean existsByTen(String ten);

    boolean existsBySlug(String slug);

    List<DanhMuc> findByTrangThai(String trangThai);
}

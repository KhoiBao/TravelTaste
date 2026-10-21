package com.reviewdiadiem.repository;

import com.reviewdiadiem.model.YeuThich;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface YeuThichRepository extends MongoRepository<YeuThich, String> {

    List<YeuThich> findByUserId(String userId);

    List<YeuThich> findByDiaDiemIdIn(Collection<String> diaDiemIds);

    boolean existsByUserIdAndDiaDiemId(String userId, String diaDiemId);

    long deleteByUserIdAndDiaDiemId(String userId, String diaDiemId);

    long countByDiaDiemId(String diaDiemId);
}

package com.reviewdiadiem.service;

import com.reviewdiadiem.dto.ApiResponse;
import com.reviewdiadiem.model.YeuThich;
import com.reviewdiadiem.repository.DiaDiemRepository;
import com.reviewdiadiem.repository.YeuThichRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class YeuThichService {

    private final YeuThichRepository yeuThichRepository;
    private final DiaDiemRepository diaDiemRepository;

    public boolean isLiked(String userId, String placeId) {
        return userId != null && yeuThichRepository.existsByUserIdAndDiaDiemId(userId, placeId);
    }

    /** Số lượt thích của từng địa điểm, tra bằng một truy vấn duy nhất. */
    public Map<String, Integer> likeCounts(Collection<String> placeIds) {
        if (placeIds == null || placeIds.isEmpty()) return Map.of();
        return yeuThichRepository.findByDiaDiemIdIn(placeIds).stream()
                .collect(Collectors.groupingBy(YeuThich::getDiaDiemId,
                        Collectors.collectingAndThen(Collectors.counting(), count -> count.intValue())));
    }

    /** Các địa điểm người dùng đã lưu. */
    public Set<String> savedPlaceIds(String userId) {
        if (userId == null) return Set.of();
        return yeuThichRepository.findByUserId(userId).stream()
                .map(YeuThich::getDiaDiemId)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    public ApiResponse<?> saved(String userId) {
        List<String> ids = savedPlaceIds(userId).stream().collect(Collectors.toList());
        Map<String, Object> data = new HashMap<>();
        data.put("diaDiemIds", ids);
        data.put("counts", likeCounts(ids));
        return ApiResponse.ok(data);
    }

    public ApiResponse<?> like(String userId, String placeId) {
        requirePlace(placeId);
        if (!yeuThichRepository.existsByUserIdAndDiaDiemId(userId, placeId)) {
            YeuThich yeuThich = new YeuThich();
            yeuThich.setUserId(userId);
            yeuThich.setDiaDiemId(placeId);
            yeuThich.setNgayTao(LocalDateTime.now());
            try {
                yeuThichRepository.save(yeuThich);
            } catch (DuplicateKeyException e) {
                // Hai lượt thích song song cho cùng một cặp user/địa điểm: giữ lượt đầu tiên.
                log.debug("Place {} already liked by user {}", placeId, userId);
            }
        }
        return ApiResponse.ok(state(userId, placeId));
    }

    public ApiResponse<?> unlike(String userId, String placeId) {
        yeuThichRepository.deleteByUserIdAndDiaDiemId(userId, placeId);
        return ApiResponse.ok(state(userId, placeId));
    }

    private void requirePlace(String placeId) {
        if (!diaDiemRepository.existsById(placeId)) {
            throw new com.reviewdiadiem.exception.ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy địa điểm");
        }
    }

    private Map<String, Object> state(String userId, String placeId) {
        Map<String, Object> data = new HashMap<>();
        data.put("diaDiemId", placeId);
        data.put("daYeuThich", isLiked(userId, placeId));
        data.put("luotThich", (int) yeuThichRepository.countByDiaDiemId(placeId));
        return data;
    }
}

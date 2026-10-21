package com.reviewdiadiem.service;

import com.reviewdiadiem.dto.ApiResponse;
import com.reviewdiadiem.dto.DanhMucRequest;
import com.reviewdiadiem.model.DanhMuc;
import com.reviewdiadiem.repository.DanhMucRepository;
import com.reviewdiadiem.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DanhMucService {

    private final DanhMucRepository danhMucRepository;
    private final org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

    public ApiResponse<?> list() {
        List<DanhMuc> items = danhMucRepository.findAll();
        List<Map<String, Object>> data = items.stream().map(d -> {
            Map<String, Object> m = new java.util.HashMap<>();
            m.put("id", d.getId());
            m.put("ten", d.getTen());
            m.put("slug", d.getSlug());
            m.put("moTa", d.getMoTa());
            m.put("icon", d.getIcon());
            m.put("thuTu", d.getThuTu());
            m.put("trangThai", d.getTrangThai());
            return m;
        }).collect(Collectors.toList());
        return ApiResponse.ok(data);
    }

    public ApiResponse<?> create(DanhMucRequest req) {
        if (danhMucRepository.existsByTen(req.getTen())) {
            return ApiResponse.error("Tên danh mục đã tồn tại", Map.of("ten", "Tên danh mục đã tồn tại"));
        }
        String slug = SlugUtil.toSlug(req.getTen());
        if (danhMucRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        DanhMuc d = new DanhMuc();
        d.setTen(req.getTen());
        d.setSlug(slug);
        d.setMoTa(req.getMoTa());
        d.setIcon(req.getIcon());
        d.setThuTu(req.getThuTu() == null ? 0 : req.getThuTu());
        d.setTrangThai(req.getTrangThai() == null ? "ACTIVE" : req.getTrangThai());
        d.setNgayTao(LocalDateTime.now());
        d.setNgayCapNhat(LocalDateTime.now());
        danhMucRepository.save(d);

        Map<String, Object> data = new java.util.HashMap<>();
        data.put("id", d.getId());
        data.put("ten", d.getTen());
        data.put("slug", d.getSlug());
        return ApiResponse.ok(data, "Tạo danh mục thành công");
    }

    public ApiResponse<?> update(String id, DanhMucRequest req) {
        DanhMuc d = danhMucRepository.findById(id)
                .orElseThrow(() -> new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy danh mục"));
        d.setTen(req.getTen());
        d.setSlug(SlugUtil.toSlug(req.getTen()));
        d.setMoTa(req.getMoTa());
        d.setIcon(req.getIcon());
        d.setThuTu(req.getThuTu() == null ? 0 : req.getThuTu());
        d.setTrangThai(req.getTrangThai() == null ? d.getTrangThai() : req.getTrangThai());
        d.setNgayCapNhat(LocalDateTime.now());
        danhMucRepository.save(d);
        mongoTemplate.updateMulti(org.springframework.data.mongodb.core.query.Query.query(org.springframework.data.mongodb.core.query.Criteria.where("danhMuc.danhMucId").in(com.reviewdiadiem.util.MongoIds.references(id))),
            new org.springframework.data.mongodb.core.query.Update().set("danhMuc.$[category].ten", d.getTen()).set("danhMuc.$[category].slug", d.getSlug()).filterArray("category.danhMucId", new org.bson.Document("$in", com.reviewdiadiem.util.MongoIds.references(id))), com.reviewdiadiem.model.DiaDiem.class);
        return ApiResponse.ok(null, "Cập nhật danh mục thành công");
    }

    public ApiResponse<?> delete(String id) {
        if (!danhMucRepository.existsById(id)) {
            throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy danh mục");
        }
        if (mongoTemplate.exists(org.springframework.data.mongodb.core.query.Query.query(org.springframework.data.mongodb.core.query.Criteria.where("danhMuc.danhMucId").in(com.reviewdiadiem.util.MongoIds.references(id))), com.reviewdiadiem.model.DiaDiem.class))
            throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.CONFLICT, "Danh mục còn địa điểm liên quan");
        danhMucRepository.deleteById(id);
        return ApiResponse.ok(null, "Xoá danh mục thành công");
    }
}

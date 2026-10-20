package com.reviewdiadiem.service;

import com.reviewdiadiem.dto.*;
import com.reviewdiadiem.model.DiaChi;
import com.reviewdiadiem.model.DiaDiem;
import com.reviewdiadiem.model.Review;
import com.reviewdiadiem.model.ViTri;
import com.reviewdiadiem.repository.DiaDiemRepository;
import com.reviewdiadiem.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiaDiemService {

    private final DiaDiemRepository diaDiemRepository;
    private final MongoTemplate mongoTemplate;
    private final com.reviewdiadiem.repository.DanhMucRepository danhMucRepository;

    public PageResponse<DiaDiemSummary> list(SearchRequest req) {
        Criteria criteria = new Criteria();
        criteria.and("trangThai").is("ACTIVE");

        if (StringUtils.hasText(req.getQ())) {
            criteria.orOperator(
                Criteria.where("ten").regex(java.util.regex.Pattern.quote(req.getQ()), "i"),
                Criteria.where("tenKhongDau").regex(java.util.regex.Pattern.quote(SlugUtil.removeAccents(req.getQ())), "i")
            );
        }

        if (StringUtils.hasText(req.getLoai())) {
            criteria.and("loai").is(req.getLoai());
        }
        if (StringUtils.hasText(req.getThanhPho())) {
            criteria.and("diaChi.thanhPho").is(req.getThanhPho());
        }
        if (req.getMinRating() != null) {
            criteria.and("ratingAvg").gte(req.getMinRating());
        }

        if (StringUtils.hasText(req.getDanhMuc())) criteria.and("danhMuc.danhMucId").in(com.reviewdiadiem.util.MongoIds.references(req.getDanhMuc()));
        if (req.getPage() < 1 || req.getSize() < 1) throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "Phân trang không hợp lệ");
        Query query = new Query(criteria);

        // Sort
        if ("rating".equals(req.getSort())) {
            query.with(Sort.by(Sort.Direction.DESC, "ratingAvg").and(Sort.by(Sort.Direction.DESC, "reviewCount")));
        } else if ("newest".equals(req.getSort())) {
            query.with(Sort.by(Sort.Direction.DESC, "ngayTao"));
        } else {
            query.with(Sort.by(Sort.Direction.DESC, "ngayTao"));
        }

        // Count total
        long total = mongoTemplate.count(query, DiaDiem.class);

        // Pagination
        int page = Math.max(req.getPage() - 1, 0);
        int size = Math.min(req.getSize(), 50);
        query.skip(page * size).limit(size);

        query.fields().exclude("reviews");
        List<DiaDiem> items = mongoTemplate.find(query, DiaDiem.class);
        List<DiaDiemSummary> content = items.stream().map(this::toSummaryNoReviews).collect(Collectors.toList());

        return PageResponse.of(content, page + 1, size, total);
    }

    public List<DiaDiemDetail> adminList() {
        return diaDiemRepository.findAll().stream().map(this::toDetail).collect(Collectors.toList());
    }

    public DiaDiemDetail detail(String slug) {
        DiaDiem dd = diaDiemRepository.findBySlug(slug)
                .orElseThrow(() -> new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy địa điểm"));
        if (!"ACTIVE".equals(dd.getTrangThai()) && !com.reviewdiadiem.util.SecurityUtil.isAdmin()) throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy địa điểm");
        return toDetail(dd);
    }

    public DiaDiemSummary create(DiaDiemRequest req) {
        String slug = SlugUtil.toSlug(req.getTen());
        if (diaDiemRepository.existsBySlug(slug)) {
            throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.CONFLICT, "Slug đã tồn tại");
        }

        DiaDiem dd = new DiaDiem();
        dd.setTen(req.getTen());
        dd.setSlug(slug);
        dd.setTenKhongDau(SlugUtil.removeAccents(req.getTen()));
        dd.setLoai(req.getLoai());
        dd.setDanhMuc(req.getDanhMucId().stream().map(id -> {
            var category = danhMucRepository.findById(id).orElseThrow(() -> new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "Danh mục không tồn tại"));
            return new com.reviewdiadiem.model.DanhMucRef(category.getId(), category.getTen(), category.getSlug());
        }).collect(Collectors.toList()));
        dd.setMoTa(req.getMoTa());
        dd.setDiaChi(toDiaChi(req.getDiaChi()));
        dd.setViTri(toViTri(req.getViTri()));
        dd.setHinhAnh(req.getHinhAnh() == null ? List.of() : req.getHinhAnh());
        dd.setRatingAvg(0.0);
        dd.setReviewCount(0);
        dd.setReviews(List.of());
        dd.setTrangThai(req.getTrangThai() == null ? "ACTIVE" : req.getTrangThai());
        dd.setNgayTao(LocalDateTime.now());
        dd.setNgayCapNhat(LocalDateTime.now());
        diaDiemRepository.save(dd);

        return toSummaryNoReviews(dd);
    }

    public DiaDiemSummary update(String id, DiaDiemRequest req) {
        DiaDiem dd = diaDiemRepository.findById(id)
                .orElseThrow(() -> new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy địa điểm"));
        dd.setTen(req.getTen());
        dd.setSlug(SlugUtil.toSlug(req.getTen()));
        dd.setTenKhongDau(SlugUtil.removeAccents(req.getTen()));
        dd.setLoai(req.getLoai());
        dd.setDanhMuc(req.getDanhMucId().stream().map(dmId -> {
            var category = danhMucRepository.findById(dmId).orElseThrow(() -> new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "Danh mục không tồn tại"));
            return new com.reviewdiadiem.model.DanhMucRef(category.getId(), category.getTen(), category.getSlug());
        }).collect(Collectors.toList()));
        dd.setMoTa(req.getMoTa());
        dd.setDiaChi(toDiaChi(req.getDiaChi()));
        dd.setViTri(toViTri(req.getViTri()));
        dd.setHinhAnh(req.getHinhAnh() == null ? List.of() : req.getHinhAnh());
        dd.setTrangThai(req.getTrangThai() == null ? dd.getTrangThai() : req.getTrangThai());
        dd.setNgayCapNhat(LocalDateTime.now());
        diaDiemRepository.save(dd);
        return toSummaryNoReviews(dd);
    }

    public void delete(String id) {
        if (!diaDiemRepository.existsById(id)) {
            throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy địa điểm");
        }
        diaDiemRepository.deleteById(id);
    }

    public List<DiaDiemSummary> top10() {
        // Dùng pipeline tính điểm nổi bật Bayesian
        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("trangThai").is("ACTIVE").and("reviewCount").gte(3)),
                Aggregation.project()
                        .andExpression("(ratingAvg * reviewCount + 5 * 3.5) / (reviewCount + 5)").as("diemNoiBat")
                        .andInclude("ten", "slug", "loai", "danhMuc", "diaChi", "ratingAvg", "reviewCount", "hinhAnh"),
                Aggregation.sort(Sort.by(Sort.Direction.DESC, "diemNoiBat")),
                Aggregation.limit(10)
        );
        AggregationResults<DiaDiemSummary> result = mongoTemplate.aggregate(agg, "diadiem", DiaDiemSummary.class);
        return result.getMappedResults();
    }

    public List<DiaDiemSummary> near(Double lat, Double lng, Double banKinhKm, Integer limit) {
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180 || banKinhKm <= 0 || banKinhKm > 100 || limit < 1 || limit > 50) throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "Vị trí hoặc bán kính không hợp lệ");
        Aggregation agg = Aggregation.newAggregation(
                Aggregation.geoNear(
                        org.springframework.data.mongodb.core.query.NearQuery.near(new org.springframework.data.mongodb.core.geo.GeoJsonPoint(lng, lat))
                                .maxDistance(new org.springframework.data.geo.Distance(banKinhKm, org.springframework.data.geo.Metrics.KILOMETERS))
                                .spherical(true)
                                .query(Query.query(Criteria.where("trangThai").is("ACTIVE"))), "khoangCach"
                ),
                Aggregation.limit(limit),
                Aggregation.project()
                        .andInclude("ten", "slug", "loai", "diaChi", "ratingAvg", "reviewCount", "hinhAnh")
                        .andExpression("khoangCach / 1000").as("khoangCachKm")
        );
        // MongoTemplate không hỗ trợ trực tiếp addField động vào class không có trường đó,
        // nên chúng ta map sang Map rồi chuyển.
        AggregationResults<Map> rawResult = mongoTemplate.aggregate(agg, "diadiem", Map.class);
        List<DiaDiemSummary> summaries = new ArrayList<>();
        for (Map<String, Object> m : rawResult.getMappedResults()) {
            DiaDiemSummary s = new DiaDiemSummary();
            s.setId(String.valueOf(m.get("_id")));
            s.setTen((String) m.get("ten"));
            s.setSlug((String) m.get("slug"));
            s.setLoai((String) m.get("loai"));
            @SuppressWarnings("unchecked")
            Map<String, Object> dc = (Map<String, Object>) m.get("diaChi");
            if (dc != null) {
                DiaChiSummary dcs = new DiaChiSummary();
                dcs.setSo((String) dc.get("so"));
                dcs.setDuong((String) dc.get("duong"));
                dcs.setQuan((String) dc.get("quan"));
                dcs.setThanhPho((String) dc.get("thanhPho"));
                s.setDiaChi(dcs);
            }
            s.setRatingAvg(((Number) m.getOrDefault("ratingAvg", 0)).doubleValue());
            s.setReviewCount(((Number) m.getOrDefault("reviewCount", 0)).intValue());
            s.setHinhAnh((List<String>) m.getOrDefault("hinhAnh", List.of()));
            s.setTrangThai("ACTIVE");
            s.setDanhMuc(List.of());
            summaries.add(s);
        }
        return summaries;
    }

    private DiaChi toDiaChi(DiaChiRequest req) {
        if (req == null) return null;
        DiaChi dc = new DiaChi();
        dc.setSo(req.getSo());
        dc.setDuong(req.getDuong());
        dc.setQuan(req.getQuan());
        dc.setThanhPho(req.getThanhPho());
        return dc;
    }

    private ViTri toViTri(ViTriRequest req) {
        if (req == null) return null;
        ViTri vt = new ViTri();
        vt.setType("Point");
        vt.setCoordinates(req.getCoordinates());
        return vt;
    }

    private DiaDiemSummary toSummaryNoReviews(DiaDiem dd) {
        DiaDiemSummary s = new DiaDiemSummary();
        s.setId(dd.getId());
        s.setTen(dd.getTen());
        s.setSlug(dd.getSlug());
        s.setLoai(dd.getLoai());
        s.setDanhMuc(dd.getDanhMuc() == null ? List.of()
                : dd.getDanhMuc().stream().map(dm -> new DanhMucRefDto(dm.getDanhMucId(), dm.getTen(), dm.getSlug())).collect(Collectors.toList()));
        s.setDiaChi(toDiaChiSummary(dd.getDiaChi()));
        s.setRatingAvg(dd.getRatingAvg());
        s.setReviewCount(dd.getReviewCount());
        s.setHinhAnh(dd.getHinhAnh() == null ? List.of() : dd.getHinhAnh());
        s.setTrangThai(dd.getTrangThai());
        return s;
    }

    private DiaDiemDetail toDetail(DiaDiem dd) {
        DiaDiemDetail d = new DiaDiemDetail();
        d.setId(dd.getId());
        d.setTen(dd.getTen());
        d.setSlug(dd.getSlug());
        d.setLoai(dd.getLoai());
        d.setDanhMuc(dd.getDanhMuc() == null ? List.of()
                : dd.getDanhMuc().stream().map(dm -> {
                    DanhMucRefDto x = new DanhMucRefDto();
                    x.setDanhMucId(dm.getDanhMucId());
                    x.setTen(dm.getTen());
                    x.setSlug(dm.getSlug());
                    return x;
                }).collect(Collectors.toList()));
        d.setMoTa(dd.getMoTa());
        d.setDiaChi(toDiaChiSummary(dd.getDiaChi()));
        d.setViTri(dd.getViTri() == null ? List.of() : dd.getViTri().getCoordinates());
        d.setHinhAnh(dd.getHinhAnh() == null ? List.of() : dd.getHinhAnh());
        d.setRatingAvg(dd.getRatingAvg());
        d.setReviewCount(dd.getReviewCount());
        d.setReviews(dd.getReviews() == null ? List.of()
                : dd.getReviews().stream().map(this::toReviewDto).collect(Collectors.toList()));
        d.setTrangThai(dd.getTrangThai());
        return d;
    }

    private DiaChiSummary toDiaChiSummary(DiaChi dc) {
        if (dc == null) return null;
        DiaChiSummary s = new DiaChiSummary();
        s.setSo(dc.getSo());
        s.setDuong(dc.getDuong());
        s.setQuan(dc.getQuan());
        s.setThanhPho(dc.getThanhPho());
        return s;
    }

    private ReviewDto toReviewDto(Review r) {
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

    private CommentDto toCommentDto(com.reviewdiadiem.model.BinhLuan b) {
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
                : b.getTraLoi().stream().map(this::toCommentDto).collect(Collectors.toList()));
        return dto;
    }
}

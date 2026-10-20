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
    private final RatingService ratingService;

    public PageResponse<DiaDiemSummary> list(SearchRequest req) {
        Criteria criteria = new Criteria();
        criteria.and("trangThai").is("ACTIVE");

        if (StringUtils.hasText(req.getQ())) {
            criteria.andOperator(
                Criteria.where("ten").regex(req.getQ(), "i"),
                Criteria.where("tenKhongDau").regex(req.getQ(), "i")
            ).orOperator(
                Criteria.where("ten").regex(req.getQ(), "i"),
                Criteria.where("tenKhongDau").regex(req.getQ(), "i")
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

        // Projection: không lấy reviews để nhẹ
        Query projectionQuery = query.limit(size).skip(page * size);
        // Note: Spring Data Query doesn't support fields() easily in this chain, we fetch full then map manually

        List<DiaDiem> items = mongoTemplate.find(query, DiaDiem.class);
        List<DiaDiemSummary> content = items.stream().map(this::toSummaryNoReviews).collect(Collectors.toList());

        return PageResponse.of(content, page + 1, size, total);
    }

    public DiaDiemDetail detail(String slug) {
        DiaDiem dd = diaDiemRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa điểm"));
        return toDetail(dd);
    }

    public DiaDiemSummary create(DiaDiemRequest req) {
        String slug = SlugUtil.toSlug(req.getTen());
        if (diaDiemRepository.existsBySlug(slug)) {
            throw new RuntimeException("Slug đã tồn tại");
        }

        DiaDiem dd = new DiaDiem();
        dd.setTen(req.getTen());
        dd.setSlug(slug);
        dd.setTenKhongDau(SlugUtil.removeAccents(req.getTen()));
        dd.setLoai(req.getLoai());
        dd.setDanhMuc(req.getDanhMucId().stream().map(id -> {
            DanhMucRefDto d = new DanhMucRefDto();
            d.setDanhMucId(id);
            d.setTen(null);
            d.setSlug(null);
            return d;
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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa điểm"));
        dd.setTen(req.getTen());
        dd.setSlug(SlugUtil.toSlug(req.getTen()));
        dd.setTenKhongDau(SlugUtil.removeAccents(req.getTen()));
        dd.setLoai(req.getLoai());
        dd.setDanhMuc(req.getDanhMucId().stream().map(dmId -> {
            DanhMucRefDto d = new DanhMucRefDto();
            d.setDanhMucId(dmId);
            d.setTen(null);
            d.setSlug(null);
            return d;
        }).collect(Collectors.toList()));
        dd.setMoTa(req.getMoTa());
        dd.setDiaChi(toDiaChi(req.getDiaChi()));
        dd.setViTri(toViTri(req.getViTri()));
        dd.setHinhAnh(req.getHinhAnh() == null ? List.of() : req.getHinhAnh());
        dd.setTrangThai(req.getTrangThai());
        dd.setNgayCapNhat(LocalDateTime.now());
        diaDiemRepository.save(dd);
        return toSummaryNoReviews(dd);
    }

    public void delete(String id) {
        if (!diaDiemRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy địa điểm");
        }
        diaDiemRepository.deleteById(id);
    }

    public List<DiaDiemSummary> top10() {
        // Dùng pipeline tính điểm nổi bật Bayesian
        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("trangThai").is("ACTIVE").and("reviewCount").gte(3)),
                Aggregation.project()
                        .andExpression("(ratingAvg * reviewCount + 5 * 3.5) / (reviewCount + 5)").as("diemNoiBat")
                        .andInclude("ten", "slug", "loai", "diaChi", "ratingAvg", "reviewCount", "hinhAnh"),
                Aggregation.sort(Sort.by(Sort.Direction.DESC, "diemNoiBat")),
                Aggregation.limit(10)
        );
        AggregationResults<DiaDiemSummary> result = mongoTemplate.aggregate(agg, "diadiem", DiaDiemSummary.class);
        return result.getMappedResults();
    }

    public List<DiaDiemSummary> near(Double lat, Double lng, Double banKinhKm, Integer limit) {
        Aggregation agg = Aggregation.newAggregation(
                Aggregation.geoNear(
                        org.springframework.data.mongodb.core.aggregation.NearQuery.near(lat, lng)
                                .maxDistance(banKinhKm * 1000)
                                .spherical(true)
                                .query(Criteria.where("trangThai").is("ACTIVE"))
                                .distanceField("khoangCach")
                ),
                Aggregation.limit(limit),
                Aggregation.project()
                        .andInclude("ten", "slug", "loai", "diaChi", "ratingAvg", "reviewCount", "hinhAnh")
                        .andExpression("khoangCach / 1000").as("khoangCachKm")
        );
        // MongoTemplate không hỗ trợ trực tiếp addField động vào class không có trường đó,
        // nên chúng ta map sang Map rồi chuyển.
        AggregationResults<Map<String, Object>> rawResult = mongoTemplate.aggregate(agg, "diadiem", Map.class);
        List<DiaDiemSummary> summaries = new ArrayList<>();
        for (Map<String, Object> m : rawResult.getMappedResults()) {
            DiaDiemSummary s = new DiaDiemSummary();
            s.setId((String) m.get("_id"));
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
                : dd.getDanhMuc().stream().map(dm -> {
                    DanhMucRefDto d = new DanhMucRefDto();
                    d.setDanhMucId(dm.getDanhMucId());
                    d.setTen(dm.getTen());
                    d.setSlug(dm.getSlug());
                    return d;
                }).collect(Collectors.toList()));
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

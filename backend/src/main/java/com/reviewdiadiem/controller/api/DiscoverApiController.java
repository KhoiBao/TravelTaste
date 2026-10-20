package com.reviewdiadiem.controller.api;

import com.reviewdiadiem.dto.ApiResponse;
import com.reviewdiadiem.dto.DiaDiemSummary;
import com.reviewdiadiem.service.DiaDiemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discover")
@RequiredArgsConstructor
public class DiscoverApiController {

    private final DiaDiemService diaDiemService;

    @GetMapping("/top10")
    public ResponseEntity<ApiResponse<?>> top10() {
        List<DiaDiemSummary> list = diaDiemService.top10();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/gan-toi")
    public ResponseEntity<ApiResponse<?>> ganToi(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "5") Double banKinhKm,
            @RequestParam(defaultValue = "20") Integer limit) {
        List<DiaDiemSummary> list = diaDiemService.near(lat, lng, banKinhKm, limit);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}

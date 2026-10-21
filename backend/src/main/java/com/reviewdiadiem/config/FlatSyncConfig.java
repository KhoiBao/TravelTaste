package com.reviewdiadiem.config;

import com.reviewdiadiem.service.FlatCollectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Đồng bộ lại các collection phẳng lúc khởi động để vá mọi sai lệch còn sót
 * (ví dụ khi dữ liệu trong {@code diadiem} bị sửa ngoài ứng dụng).
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class FlatSyncConfig {

    private final FlatCollectionService flatCollectionService;

    @Bean
    @ConditionalOnProperty(name = "app.flat-sync.on-startup", havingValue = "true", matchIfMissing = true)
    public CommandLineRunner resyncFlatCollections() {
        return args -> {
            int synced = flatCollectionService.syncAll();
            log.info("Đã đồng bộ {} đánh giá sang collection phẳng (danhgia/binhluan/hinhanh)", synced);
        };
    }
}

package com.reviewdiadiem.config;

import com.reviewdiadiem.model.DanhMuc;
import com.reviewdiadiem.model.User;
import com.reviewdiadiem.repository.DanhMucRepository;
import com.reviewdiadiem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final UserRepository userRepository;
    private final DanhMucRepository danhMucRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seed() {
        return args -> {
            // Seed admin
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setHoTen("Administrator");
                admin.setEmail("admin@traveltaste.local");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                admin.setRole("ADMIN");
                admin.setTrangThai("ACTIVE");
                admin.setNgayTao(LocalDateTime.now());
                userRepository.save(admin);
                log.info("Seeded admin user: admin / admin123");
            }

            // Seed demo users
            String[] users = {"an123", "binh123"};
            for (String u : users) {
                if (userRepository.findByUsername(u).isEmpty()) {
                    User user = new User();
                    user.setUsername(u);
                    user.setHoTen(u);
                    user.setEmail(u + "@traveltaste.local");
                    user.setPasswordHash(passwordEncoder.encode("123456"));
                    user.setRole("USER");
                    user.setTrangThai("ACTIVE");
                    user.setNgayTao(LocalDateTime.now());
                    userRepository.save(user);
                    log.info("Seeded user: {}", u);
                }
            }

            // Seed categories
            if (danhMucRepository.count() == 0) {
                DanhMuc anUong = new DanhMuc();
                anUong.setTen("Ăn uống");
                anUong.setSlug("an-uong");
                anUong.setMoTa("Nhà hàng, quán ăn, cà phê, quán nhẹ");
                anUong.setIcon("bi-cup-hot");
                anUong.setThuTu(1);
                anUong.setTrangThai("ACTIVE");
                anUong.setNgayTao(LocalDateTime.now());
                danhMucRepository.save(anUong);

                DanhMuc duLich = new DanhMuc();
                duLich.setTen("Du lịch");
                duLich.setSlug("du-lich");
                duLich.setMoTa("Điểm tham quan, du lịch, cảnh quan");
                duLich.setIcon("bi-geo-alt");
                duLich.setThuTu(2);
                duLich.setTrangThai("ACTIVE");
                duLich.setNgayTao(LocalDateTime.now());
                danhMucRepository.save(duLich);

                DanhMuc luuTru = new DanhMuc();
                luuTru.setTen("Lưu trú");
                luuTru.setSlug("luu-tru");
                luuTru.setMoTa("Khách sạn, homestay, nhà nghỉ");
                luuTru.setIcon("bi-building");
                luuTru.setThuTu(3);
                luuTru.setTrangThai("ACTIVE");
                luuTru.setNgayTao(LocalDateTime.now());
                danhMucRepository.save(luuTru);

                log.info("Seeded categories");
            }
        };
    }
}

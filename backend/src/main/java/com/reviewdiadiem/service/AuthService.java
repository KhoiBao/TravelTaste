package com.reviewdiadiem.service;

import com.reviewdiadiem.dto.ApiResponse;
import com.reviewdiadiem.dto.LoginRequest;
import com.reviewdiadiem.dto.RegisterRequest;
import com.reviewdiadiem.model.User;
import com.reviewdiadiem.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ApiResponse<?> register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            return ApiResponse.error("Tên đăng nhập đã tồn tại", Map.of("username", "Tên đăng nhập đã tồn tại"));
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            return ApiResponse.error("Email đã tồn tại", Map.of("email", "Email đã tồn tại"));
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setHoTen(req.getHoTen());
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole("USER");
        user.setTrangThai("ACTIVE");
        user.setNgayTao(LocalDateTime.now());
        user.setNgayCapNhat(LocalDateTime.now());
        userRepository.save(user);

        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("username", user.getUsername());
        data.put("hoTen", user.getHoTen());
        data.put("email", user.getEmail());
        data.put("role", user.getRole());
        return ApiResponse.ok(data, "Đăng ký thành công");
    }

    public ApiResponse<?> login(LoginRequest req, HttpSession session) {
        User user = userRepository.findByUsername(req.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(req.getUsernameOrEmail()))
                .orElseThrow(() -> new RuntimeException("Sai tên đăng nhập/email hoặc mật khẩu"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Sai tên đăng nhập/email hoặc mật khẩu");
        }
        if ("BLOCKED".equals(user.getTrangThai())) {
            throw new RuntimeException("Tài khoản đã bị khóa");
        }

        session.setAttribute("USER_ID", user.getId());
        session.setAttribute("USERNAME", user.getUsername());
        session.setAttribute("ROLE", user.getRole());

        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("username", user.getUsername());
        data.put("hoTen", user.getHoTen());
        data.put("role", user.getRole());
        return ApiResponse.ok(data, "Đăng nhập thành công");
    }

    public ApiResponse<?> logout(HttpSession session) {
        session.invalidate();
        return ApiResponse.ok(null, "Đăng xuất thành công");
    }

    public ApiResponse<?> me(HttpSession session) {
        String userId = (String) session.getAttribute("USER_ID");
        if (userId == null) {
            return ApiResponse.error("Chưa đăng nhập");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("username", user.getUsername());
        data.put("hoTen", user.getHoTen());
        data.put("avatar", user.getAvatar());
        data.put("role", user.getRole());
        return ApiResponse.ok(data);
    }
}

package com.reviewdiadiem.controller.admin;

import com.reviewdiadiem.dto.ApiResponse;
import com.reviewdiadiem.model.User;
import com.reviewdiadiem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/nguoi-dung")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserAdminController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> list() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> data = users.stream().map(u -> {
            Map<String, Object> m = new java.util.HashMap<>();
            m.put("id", u.getId());
            m.put("username", u.getUsername());
            m.put("hoTen", u.getHoTen());
            m.put("email", u.getEmail());
            m.put("role", u.getRole());
            m.put("trangThai", u.getTrangThai());
            m.put("ngayTao", u.getNgayTao());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @PatchMapping("/{id}/trang-thai")
    public ResponseEntity<ApiResponse<?>> toggleStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        User u = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        String trangThai = body.get("trangThai");
        if (!"ACTIVE".equals(trangThai) && !"BLOCKED".equals(trangThai)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Trạng thái không hợp lệ"));
        }
        u.setTrangThai(trangThai);
        u.setNgayCapNhat(LocalDateTime.now());
        userRepository.save(u);
        return ResponseEntity.ok(ApiResponse.ok(null, "Cập nhật trạng thái thành công"));
    }
}

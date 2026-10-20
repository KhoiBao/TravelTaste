package com.reviewdiadiem.controller.api;

import com.reviewdiadiem.dto.ApiResponse;
import com.reviewdiadiem.dto.LoginRequest;
import com.reviewdiadiem.dto.RegisterRequest;
import com.reviewdiadiem.service.AuthService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthApiController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> register(@RequestBody @Validated RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@RequestBody @Validated LoginRequest req, HttpSession session) {
        return ResponseEntity.ok(authService.login(req, session));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<?>> logout(HttpSession session) {
        return ResponseEntity.ok(authService.logout(session));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> me(HttpSession session) {
        return ResponseEntity.ok(authService.me(session));
    }
}

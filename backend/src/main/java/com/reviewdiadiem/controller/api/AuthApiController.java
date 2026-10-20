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

    @GetMapping("/csrf")
    public ResponseEntity<ApiResponse<?>> csrf(org.springframework.security.web.csrf.CsrfToken token) {
        return ResponseEntity.ok(ApiResponse.ok(java.util.Map.of("token", token.getToken(), "headerName", token.getHeaderName())));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> register(@RequestBody @Validated RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@RequestBody @Validated LoginRequest req, HttpSession session, jakarta.servlet.http.HttpServletRequest request) {
        var result = authService.login(req, session);
        request.changeSessionId();
        return ResponseEntity.ok(result);
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

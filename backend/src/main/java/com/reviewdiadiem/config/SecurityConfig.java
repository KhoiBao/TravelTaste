package com.reviewdiadiem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.filter.OncePerRequestFilter;
import com.reviewdiadiem.repository.UserRepository;
import com.reviewdiadiem.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final String[] ADMIN = {
            "/api/admin/**"
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, UserRepository users, ObjectMapper mapper) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .addFilterBefore(new OncePerRequestFilter() {
                    @Override protected void doFilterInternal(jakarta.servlet.http.HttpServletRequest request,
                            jakarta.servlet.http.HttpServletResponse response, jakarta.servlet.FilterChain chain)
                            throws jakarta.servlet.ServletException, java.io.IOException {
                        var session = request.getSession(false);
                        if (session != null && session.getAttribute("USER_ID") instanceof String id) {
                            var user = users.findById(id).filter(u -> "ACTIVE".equals(u.getTrangThai()));
                            if (user.isPresent()) {
                                var u = user.get();
                                session.setAttribute("ROLE", u.getRole());
                                var context = SecurityContextHolder.createEmptyContext();
                                context.setAuthentication(new UsernamePasswordAuthenticationToken(u.getId(), null,
                                        List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole()))));
                                SecurityContextHolder.setContext(context);
                                session.setAttribute(org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
                            } else { session.invalidate(); SecurityContextHolder.clearContext(); }
                        }
                        chain.doFilter(request, response);
                    }
                }, AnonymousAuthenticationFilter.class)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/uploads/**", "/error").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/danh-muc", "/api/dia-diem/**", "/api/search", "/api/discover/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/dia-diem").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/dia-diem/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/dia-diem/{id}").hasRole("ADMIN")
                        .requestMatchers(ADMIN).hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .exceptionHandling(e -> e
                    .authenticationEntryPoint((q, r, x) -> {
                        r.setStatus(401); r.setContentType("application/json;charset=UTF-8");
                        mapper.writeValue(r.getWriter(), ApiResponse.error("Chưa đăng nhập"));
                    })
                    .accessDeniedHandler((q, r, x) -> {
                        r.setStatus(403); r.setContentType("application/json;charset=UTF-8");
                        mapper.writeValue(r.getWriter(), ApiResponse.error("Không có quyền hoặc phiên xác thực đã hết hạn"));
                    }));
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}

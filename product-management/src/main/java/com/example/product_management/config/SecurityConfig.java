package com.example.product_management.config;

import com.example.product_management.filter.JwtFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final com.example.product_management.service.UserDetailsServiceImpl userDetailsService;

    @Value("${app.cors.allowed-origins:http://localhost:4200}")
    private String allowedOrigins;

    // Constructor-based Dependency Injection
    public SecurityConfig(JwtFilter jwtFilter, com.example.product_management.service.UserDetailsServiceImpl userDetailsService) {
        this.jwtFilter = jwtFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Kích hoạt và áp dụng cấu hình CORS vào Spring Security Filter Chain
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. Tắt CSRF vì hệ thống sử dụng REST API xác thực không trạng thái (Stateless JWT)
                .csrf(AbstractHttpConfigurer::disable)

                // 3. Xử lý phản hồi lỗi xác thực (401 Unauthorized và 403 Forbidden) chuẩn JSON REST
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setCharacterEncoding("UTF-8");
                            response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Bạn cần đăng nhập để truy cập tài nguyên này.\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setCharacterEncoding("UTF-8");
                            response.getWriter().write("{\"status\":403,\"error\":\"Forbidden\",\"message\":\"Bạn không có quyền thực hiện thao tác này.\"}");
                        })
                )

                // 4. Quản lý Session: STATELESS (không lưu session state trên server)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 5. Phân quyền truy cập các endpoint
                .authorizeHttpRequests(auth -> auth
                        // Cho phép truy cập công khai vào API authentication
                        .requestMatchers("/auth/**", "/api/auth/**").permitAll()

                        // Cho phép xem sản phẩm và danh mục công khai
                        .requestMatchers(HttpMethod.GET, "/api/products/**", "/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/**", "/categories/**").permitAll()

                        // Thao tác chỉnh sửa, thêm, xóa sản phẩm và danh mục yêu cầu quyền ADMIN
                        .requestMatchers(HttpMethod.POST, "/api/products/**", "/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**", "/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**", "/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/categories/**", "/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**", "/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**", "/categories/**").hasRole("ADMIN")

                        // Quản lý người dùng yêu cầu quyền ADMIN
                        .requestMatchers("/users/**", "/api/users/**").hasRole("ADMIN")

                        // Mọi request còn lại đều phải xác thực
                        .anyRequest().authenticated()
                );

        // 6. Cấu hình AuthenticationProvider rõ ràng
        http.authenticationProvider(authenticationProvider());

        // 7. Đăng ký JWT Filter trước UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Cấu hình CORS chuẩn Business:
     * - Chỉ định danh chính xác origin của Frontend (không dùng '*')
     * - Hỗ trợ đầy đủ HTTP Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
     * - Cho phép các Headers: Authorization, Content-Type, X-Requested-With
     * - Bật AllowCredentials(true) để hỗ trợ truyền cookies/tokens
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 1. Origins cụ thể (tách chuỗi nếu cấu hình nhiều origins)
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .toList();
        configuration.setAllowedOrigins(origins);

        // 2. HTTP Methods cho phép
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // 3. HTTP Headers cho phép
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));

        // 4. Headers cho phép client đọc từ response
        configuration.setExposedHeaders(List.of("Authorization"));

        // 5. Bật AllowCredentials để hỗ trợ gửi thông tin xác thực
        configuration.setAllowCredentials(true);

        // 6. Cache CORS preflight request (1 giờ)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public org.springframework.security.authentication.AuthenticationProvider authenticationProvider() {
        org.springframework.security.authentication.dao.DaoAuthenticationProvider authProvider =
                new org.springframework.security.authentication.dao.DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // Bean AuthenticationManager để inject vào AuthService
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    // Bean PasswordEncoder để mã hóa mật khẩu bằng BCrypt
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

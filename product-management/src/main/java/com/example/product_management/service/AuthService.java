package com.example.product_management.service;

import com.example.product_management.dto.AuthRequest;
import com.example.product_management.dto.RegisterRequest;
import com.example.product_management.entity.User;
import com.example.product_management.exception.CustomException;
import com.example.product_management.repository.UserRepository;
import com.example.product_management.util.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil,
                       UserDetailsServiceImpl userDetailsService,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Đăng nhập CHỈ theo Tên đăng nhập (username), không đăng nhập bằng email
     */
    public String login(AuthRequest req) {
        if (req.getUsername() == null || req.getUsername().trim().isEmpty() ||
            req.getPassword() == null || req.getPassword().isEmpty()) {
            throw new CustomException("Vui lòng nhập tên đăng nhập và mật khẩu.");
        }

        String username = req.getUsername().trim();

        // Xác thực qua AuthenticationManager
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, req.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        return jwtUtil.generateToken(userDetails);
    }

    /**
     * Đăng ký tài khoản mới:
     * - Lưu Tên đăng nhập (username)
     * - Lưu Tên tài khoản (fullName)
     * - Lưu Email (email - chỉ lưu DB, không dùng đăng nhập)
     * - Mặc định quyền ROLE_USER
     */
    public void register(RegisterRequest req) {
        if (req.getUsername() == null || req.getUsername().trim().isEmpty()) {
            throw new CustomException("Tên đăng nhập không được để trống.");
        }
        if (req.getPassword() == null || req.getPassword().trim().length() < 6) {
            throw new CustomException("Mật khẩu phải có tối thiểu 6 ký tự.");
        }

        String username = req.getUsername().trim();
        if (userRepository.existsByUsername(username)) {
            throw new CustomException("Tên đăng nhập '" + username + "' đã tồn tại.");
        }

        User user = new User();
        user.setUsername(username);
        
        // Lưu cột tên tài khoản vào database
        String fullName = (req.getFullName() != null && !req.getFullName().trim().isEmpty())
                ? req.getFullName().trim()
                : username;
        user.setFullName(fullName);

        // Lưu email vào DB (chỉ lưu DB, không dùng đăng nhập)
        user.setEmail(req.getEmail() != null ? req.getEmail().trim() : null);

        user.setPassword(passwordEncoder.encode(req.getPassword()));
        // Mặc định người dùng đăng ký có quyền ROLE_USER
        user.setRoles(Set.of("ROLE_USER"));
        user.setEnabled(true);

        userRepository.save(user);
    }
}

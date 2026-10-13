package com.example.product_management.config;

import com.example.product_management.entity.User;
import com.example.product_management.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class AdminAccountInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminAccountInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminAccountInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        final String adminUsername = "vudh22";
        User admin = userRepository.findByUsername(adminUsername).orElse(null);

        if (admin == null) {
            admin = new User();
            admin.setUsername(adminUsername);
            admin.setFullName("Quản trị viên Hệ thống");
            admin.setPassword(passwordEncoder.encode("vudh22"));
            admin.setEmail("vudh22@gmail.com");
            admin.setRoles(Set.of("ROLE_ADMIN", "ROLE_USER"));
            admin.setEnabled(true);
            userRepository.save(admin);
            log.info("Khởi tạo tài khoản quản trị viên '{}' thành công.", adminUsername);
        } else {
            // Đảm bảo mật khẩu và quyền của admin luôn chính xác
            admin.setPassword(passwordEncoder.encode("vudh22"));
            admin.setRoles(Set.of("ROLE_ADMIN", "ROLE_USER"));
            admin.setEnabled(true);
            if (admin.getFullName() == null || admin.getFullName().trim().isEmpty()) {
                admin.setFullName("Quản trị viên Hệ thống");
            }
            userRepository.save(admin);
            log.info("Cập nhật đồng bộ tài khoản quản trị viên '{}' thành công.", adminUsername);
        }
    }
}

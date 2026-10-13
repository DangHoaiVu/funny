package com.example.product_management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên đăng nhập (duy nhất, dùng để đăng nhập hệ thống)
    @Column(unique = true, nullable = false)
    private String username;

    // Tên tài khoản / Họ tên hiển thị người dùng
    @Column(name = "full_name")
    private String fullName;

    // Mật khẩu (đã băm bằng BCrypt)
    @Column(nullable = false)
    private String password;

    // Email liên hệ (chỉ lưu thông tin trong DB, không dùng đăng nhập)
    private String email;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<String> roles = new HashSet<>();

    private boolean enabled = true;
}

package com.example.product_management.service;

import com.example.product_management.dto.UserDto;
import com.example.product_management.entity.User;
import com.example.product_management.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;

    // Constructor DI
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserDto(u.getId(), u.getUsername(), u.getFullName(), u.getEmail(), u.getRoles()))
                .collect(Collectors.toList());
    }

    public UserDto getUser(Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserDto(u.getId(), u.getUsername(), u.getFullName(), u.getEmail(), u.getRoles());
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}

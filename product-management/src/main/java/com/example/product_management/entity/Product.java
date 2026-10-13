package com.example.product_management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Column(nullable = false)
    private String name;

    private String imageUrl;

    @Positive(message = "Giá sản phẩm phải lớn hơn 0")
    @Column(nullable = false)
    private Double price;

    @Min(value = 0, message = "Số lượng không được âm")
    @Column(nullable = false)
    private Integer quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    // 1. Factory method chuẩn Business để tạo mới sản phẩm
    public static Product create(String name, Double price, Integer quantity, Category category) {
        return Product.builder()
                .name(name)
                .price(price)
                .quantity(quantity)
                .category(category)
                .build();
    }

    // 2. Business method cập nhật ảnh
    public void updateImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
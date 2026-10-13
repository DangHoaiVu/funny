package com.example.product_management.dto;

import lombok.Data;

@Data
public class ProductResponse {
    private Long id;
    private String name;
    private String imageUrl;
    private Double price;
    private Integer quantity;
    private String categoryName;
}

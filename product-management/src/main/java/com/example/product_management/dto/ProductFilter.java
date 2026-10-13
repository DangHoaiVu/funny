package com.example.product_management.dto;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductFilter {

    private String name;

    private Long categoryId;

    @Min(value = 0, message = "Giá tối thiểu phải >= 0 VNĐ")
    private Double minPrice;

    @Min(value = 0, message = "Giá tối đa phải >= 0 VNĐ")
    private Double maxPrice;

    @Min(value = 0, message = "Số trang phải >= 0")
    private Integer page = 0;

    @Min(value = 1, message = "Kích thước trang phải >= 1")
    private Integer size = 10;

    private String sort = "price,asc";

    // getters & setters
}


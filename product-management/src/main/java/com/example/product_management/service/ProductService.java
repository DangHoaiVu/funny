package com.example.product_management.service;

import com.example.product_management.dto.ProductRequest;
import com.example.product_management.dto.ProductResponse;
import com.example.product_management.entity.Category;
import com.example.product_management.entity.Product;
import com.example.product_management.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.example.product_management.repository.CategoryRepository;
import com.example.product_management.repository.ProductRepository;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;
    private final ImageService imageService;

    public List<ProductResponse> getAll() {
        return productRepo.findAll().stream().map(this::toResponse).toList();
    }

    public ProductResponse create(ProductRequest req) {
        Category category = categoryRepo.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        Product product = new Product(null, req.getName(), null, req.getPrice(), req.getQuantity(), category);
        productRepo.save(product);
        return toResponse(product);
    }

    public ProductResponse getById(Long id) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return toResponse(product);
    }

    public List<ProductResponse> search(String keyword) {
        return productRepo.findByNameContainingIgnoreCase(keyword)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponse update(Long id, ProductRequest req) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        Category category = categoryRepo.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        product.setName(req.getName());
        product.setPrice(req.getPrice());
        product.setQuantity(req.getQuantity());
        product.setCategory(category);
        productRepo.save(product);
        return toResponse(product);
    }

    public void delete(Long id) {
        if (!productRepo.existsById(id)) throw new ResourceNotFoundException("Product not found");
        productRepo.deleteById(id);
    }

    public List<ProductResponse> search(String name, Double minPrice, Double maxPrice) {
        List<Product> products;
        if (name != null) {
            products = productRepo.findByNameContainingIgnoreCase(name);
        } else if (minPrice != null && maxPrice != null) {
            products = productRepo.findByPriceBetween(minPrice, maxPrice);
        } else {
            products = productRepo.findAll();
        }
        return products.stream().map(this::toResponse).toList();
    }

    public Page<ProductResponse> filterProducts(String name, Long categoryId,
                                                Double minPrice, Double maxPrice,
                                                Pageable pageable) {
        String searchName = (name != null && !name.trim().isEmpty()) ? name.trim() : null;
        Page<Product> productPage = productRepo.filterProducts(
                searchName, categoryId, minPrice, maxPrice, pageable
        );
        return productPage.map(this::toResponse);
    }

    private ProductResponse toResponse(Product product) {
        ProductResponse res = new ProductResponse();
        res.setId(product.getId());
        res.setName(product.getName());
        res.setImageUrl(product.getImageUrl());
        res.setPrice(product.getPrice());
        res.setQuantity(product.getQuantity());
        res.setCategoryName(product.getCategory() != null ? product.getCategory().getName() : "");
        return res;
    }

    public ProductResponse uploadProductImage(Long id, MultipartFile file) throws IOException {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        String imageUrl = imageService.uploadImage(file);
        product.updateImageUrl(imageUrl);
        Product saved = productRepo.save(product);
        return toResponse(saved);
    }
}

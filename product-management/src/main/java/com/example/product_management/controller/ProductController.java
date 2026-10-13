package com.example.product_management.controller;

import com.example.product_management.dto.ProductFilter;
import com.example.product_management.dto.ProductRequest;
import com.example.product_management.dto.ProductResponse;
import com.example.product_management.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(req));
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> uploadProductImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws IOException {
        ProductResponse updatedProduct = productService.uploadProductImage(id, file);
        return ResponseEntity.ok(updatedProduct);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAll() {
        return ResponseEntity.ok(productService.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable Long id, @Valid @RequestBody ProductRequest req) {
        return ResponseEntity.ok(productService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> search(@RequestParam String q) {
        return ResponseEntity.ok(productService.search(q));
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<ProductResponse>> filterProducts(@Valid ProductFilter filterDTO) {
        String sortField = "id";
        Sort.Direction sortDirection = Sort.Direction.ASC;

        if (filterDTO.getSort() != null && !filterDTO.getSort().trim().isEmpty()) {
            String[] parts = filterDTO.getSort().split(",");
            sortField = parts[0].trim();
            if (parts.length > 1 && "desc".equalsIgnoreCase(parts[1].trim())) {
                sortDirection = Sort.Direction.DESC;
            }
        }

        int page = (filterDTO.getPage() != null && filterDTO.getPage() >= 0) ? filterDTO.getPage() : 0;
        int size = (filterDTO.getSize() != null && filterDTO.getSize() >= 1) ? filterDTO.getSize() : 10;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortField));

        Page<ProductResponse> result = productService.filterProducts(
                filterDTO.getName(),
                filterDTO.getCategoryId(),
                filterDTO.getMinPrice(),
                filterDTO.getMaxPrice(),
                pageable
        );
        return ResponseEntity.ok(result);
    }
}

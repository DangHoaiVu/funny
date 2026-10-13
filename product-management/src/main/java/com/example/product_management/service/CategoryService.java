package com.example.product_management.service;

import com.example.product_management.dto.CategoryRequest;
import com.example.product_management.dto.CategoryResponse;
import com.example.product_management.entity.Category;
import com.example.product_management.exception.ResourceNotFoundException;
import com.example.product_management.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepo;

    public CategoryResponse create(CategoryRequest req) {
        Category category = new Category();
        category.setName(req.getName());
        categoryRepo.save(category);

        CategoryResponse res = new CategoryResponse();
        res.setId(category.getId());
        res.setName(category.getName());
        return res;
    }

    public List<CategoryResponse> getAll() {
        return categoryRepo.findAll().stream().map(cat -> {
            CategoryResponse res = new CategoryResponse();
            res.setId(cat.getId());
            res.setName(cat.getName());
            return res;
        }).toList();
    }


    public CategoryResponse getById(Long id) {
        Category category = categoryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        CategoryResponse res = new CategoryResponse();
        res.setId(category.getId());
        res.setName(category.getName());
        return res;
    }

    public CategoryResponse update(Long id, CategoryRequest req) {
        Category category = categoryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        category.setName(req.getName());
        categoryRepo.save(category);

        CategoryResponse res = new CategoryResponse();
        res.setId(category.getId());
        res.setName(category.getName());
        return res;
    }

    public void delete(Long id) {
        if (!categoryRepo.existsById(id)) throw new ResourceNotFoundException("Category not found");
        categoryRepo.deleteById(id);
    }
}


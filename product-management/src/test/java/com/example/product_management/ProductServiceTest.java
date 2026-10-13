package com.example.product_management;

import com.example.product_management.dto.ProductRequest;
import com.example.product_management.dto.ProductResponse;
import com.example.product_management.entity.Category;
import com.example.product_management.entity.Product;
import com.example.product_management.exception.ResourceNotFoundException;
import com.example.product_management.repository.CategoryRepository;
import com.example.product_management.repository.ProductRepository;
import com.example.product_management.service.ProductService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepo;

    @Mock
    private CategoryRepository categoryRepo;

    @InjectMocks
    private ProductService productService;

    @Test
    void testCreateProductSuccess() {
        System.out.println("Bắt đầu test: Tạo sản phẩm thành công");

        Category cat = new Category(1L, "Electronics", new ArrayList<>());
        when(categoryRepo.findById(1L)).thenReturn(Optional.of(cat));

        ProductRequest req = new ProductRequest("Phone", 1000.0, 10, 1L);
        ProductResponse res = productService.create(req);

        assertEquals("Phone", res.getName());
        assertEquals("Electronics", res.getCategoryName());

        System.out.println("Test thành công: Sản phẩm được tạo đúng dữ liệu");
    }

    @Test
    void testCreateProductCategoryNotFound() {
        System.out.println("Bắt đầu test: Tạo sản phẩm khi category không tồn tại");

        when(categoryRepo.findById(99L)).thenReturn(Optional.empty());
        ProductRequest req = new ProductRequest("Laptop", 2000.0, 5, 99L);

        assertThrows(ResourceNotFoundException.class, () -> productService.create(req));

        System.out.println("Test thành công: Ném lỗi ResourceNotFoundException khi category không tồn tại");
    }

    @Test
    void testGetAllProducts() {
        System.out.println("🔹 Bắt đầu test: Lấy danh sách sản phẩm");

        Category cat = new Category(1L, "Electronics", new ArrayList<>());
        Product p1 = new Product(1L, "Phone", null, 1000.0, 10, cat);
        Product p2 = new Product(2L, "Laptop", null, 2000.0, 5, cat);

        when(productRepo.findAll()).thenReturn(List.of(p1, p2));

        List<ProductResponse> result = productService.getAll();

        assertEquals(2, result.size());
        assertEquals("Phone", result.get(0).getName());
        assertEquals("Laptop", result.get(1).getName());

        System.out.println("Test thành công: Lấy danh sách sản phẩm đúng số lượng và dữ liệu");
    }
}

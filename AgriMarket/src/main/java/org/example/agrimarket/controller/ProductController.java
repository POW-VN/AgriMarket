package org.example.agrimarket.controller;

import org.example.agrimarket.dto.ProductRequest;
import org.example.agrimarket.dto.ProductResponse;
import org.example.agrimarket.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/farmer/products")
    public ResponseEntity<?> getFarmerProducts(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Vui lòng đăng nhập.");
        }

        try {
            List<ProductResponse> products = productService.getProductsByFarmerEmail(principal.getName());
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi lấy danh sách sản phẩm: " + e.getMessage());
        }
    }

    @PostMapping("/farmer/products")
    public ResponseEntity<?> createProduct(Principal principal, @RequestBody ProductRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Vui lòng đăng nhập.");
        }

        try {
            ProductResponse response = productService.createProduct(request, principal.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi thêm sản phẩm: " + e.getMessage());
        }
    }

    @DeleteMapping("/farmer/products/{id}")
    public ResponseEntity<?> deleteProduct(Principal principal, @PathVariable Long id) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Vui lòng đăng nhập.");
        }

        try {
            productService.deleteProduct(id, principal.getName());
            return ResponseEntity.ok("Xóa sản phẩm thành công.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi xóa sản phẩm: " + e.getMessage());
        }
    }

    @GetMapping("/products")
    public ResponseEntity<?> getAllApprovedProducts() {
        try {
            List<ProductResponse> products = productService.getAllApprovedProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi lấy danh sách sản phẩm: " + e.getMessage());
        }
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            ProductResponse product = productService.getProductById(id);
            return ResponseEntity.ok(product);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi lấy thông tin sản phẩm: " + e.getMessage());
        }
    }
}

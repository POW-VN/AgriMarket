package org.example.agrimarket.service;

import org.example.agrimarket.dto.ProductRequest;
import org.example.agrimarket.dto.ProductResponse;
import org.example.agrimarket.model.Category;

import java.util.List;

public interface ProductService {
    List<ProductResponse> getProductsByFarmerEmail(String email);
    List<Category> getAllCategories();
    void deleteProduct(Long id, String farmerEmail);
    ProductResponse createProduct(ProductRequest request, String farmerEmail) throws Exception;
    ProductResponse updateProduct(Long id, ProductRequest request, String farmerEmail) throws Exception;
    List<ProductResponse> getAllApprovedProducts();
    List<ProductResponse> getAllProducts();
    ProductResponse getProductById(Long id);
}

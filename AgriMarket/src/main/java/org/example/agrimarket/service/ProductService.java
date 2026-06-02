package org.example.agrimarket.service;

import org.example.agrimarket.dto.ProductResponse;
import org.example.agrimarket.model.Category;

import java.util.List;

public interface ProductService {
    List<ProductResponse> getProductsByFarmerEmail(String email);
    List<Category> getAllCategories();
    void deleteProduct(Long id, String farmerEmail);
}

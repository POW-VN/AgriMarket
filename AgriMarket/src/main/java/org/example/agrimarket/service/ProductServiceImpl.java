package org.example.agrimarket.service;

import org.example.agrimarket.dto.ProductResponse;
import org.example.agrimarket.model.Category;
import org.example.agrimarket.model.Product;
import org.example.agrimarket.model.ProductImage;
import org.example.agrimarket.repository.CategoryRepository;
import org.example.agrimarket.repository.ProductImageRepository;
import org.example.agrimarket.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public List<ProductResponse> getProductsByFarmerEmail(String email) {
        List<Product> products = productRepository.findByFarmerEmailOrderByCreatedAtDesc(email);
        return products.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    private ProductResponse convertToResponse(Product product) {
        // Find thumbnail URL if exists
        Optional<ProductImage> thumbnailImage = productImageRepository
                .findFirstByProductIdAndIsThumbnailTrue(product.getId());
        String thumbnailUrl = thumbnailImage.map(ProductImage::getImgUrl).orElse("");

        return ProductResponse.builder()
                .id(product.getId())
                .farmerId(product.getFarmer() != null ? product.getFarmer().getId() : null)
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .name(product.getName())
                .description(product.getDescription())
                .aiGeneratedDescription(product.getAiGeneratedDescription())
                .price(product.getPrice())
                .aiSuggestedPrice(product.getAiSuggestedPrice())
                .stockQuantity(product.getStockQuantity())
                .unit(product.getUnit())
                .status(product.getStatus())
                .harvestDate(product.getHarvestDate())
                .createdAt(product.getCreatedAt())
                .thumbnailUrl(thumbnailUrl)
                .build();
    }

    @Override
    @Transactional
    public void deleteProduct(Long id, String farmerEmail) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm."));

        if (product.getFarmer() == null || !product.getFarmer().getEmail().equalsIgnoreCase(farmerEmail)) {
            throw new IllegalArgumentException("Bạn không có quyền xóa sản phẩm này.");
        }

        // Delete related images
        List<ProductImage> images = productImageRepository.findByProductId(id);
        if (images != null && !images.isEmpty()) {
            productImageRepository.deleteAll(images);
        }

        // Delete product
        productRepository.delete(product);
    }
}

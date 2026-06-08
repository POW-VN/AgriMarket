package org.example.agrimarket.service;

import org.example.agrimarket.dto.ProductRequest;
import org.example.agrimarket.dto.ProductResponse;
import org.example.agrimarket.model.Category;
import org.example.agrimarket.model.Farmer;
import org.example.agrimarket.model.Product;
import org.example.agrimarket.model.ProductImage;
import org.example.agrimarket.repository.CategoryRepository;
import org.example.agrimarket.repository.FarmerRepository;
import org.example.agrimarket.repository.ProductImageRepository;
import org.example.agrimarket.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
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

    @Autowired
    private FarmerRepository farmerRepository;

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

        // Find all image URLs for this product
        List<ProductImage> productImages = productImageRepository.findByProductId(product.getId());
        List<String> imageUrls = productImages.stream()
                .map(ProductImage::getImgUrl)
                .collect(Collectors.toList());

        String farmerName = "";
        String farmLocation = "";
        String farmDescription = "";
        String farmerAvatarUrl = "";
        if (product.getFarmer() != null) {
            Farmer farmer = product.getFarmer();
            farmerName = farmer.getFarmName() != null && !farmer.getFarmName().isEmpty() 
                    ? farmer.getFarmName() : farmer.getFullName();
            farmLocation = farmer.getFarmAddress() != null && !farmer.getFarmAddress().isEmpty() 
                    ? farmer.getFarmAddress() : "Chưa có địa chỉ";
            farmDescription = farmer.getDescription() != null && !farmer.getDescription().isEmpty() 
                    ? farmer.getDescription() : "Chưa có mô tả nông trại";
            farmerAvatarUrl = farmer.getAvatarUrl();
        }

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
                .expirationDate(product.getExpirationDate())
                .createdAt(product.getCreatedAt())
                .isOrganic(product.getIsOrganic())
                .certificateUrl(product.getCertificateUrl())
                .traceabilityImageUrl(product.getTraceabilityImageUrl())
                .thumbnailUrl(thumbnailUrl)
                .images(imageUrls)
                .farmerName(farmerName)
                .farmLocation(farmLocation)
                .farmDescription(farmDescription)
                .farmerAvatarUrl(farmerAvatarUrl)
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

        // Delete related images physically
        List<ProductImage> images = productImageRepository.findByProductId(id);
        if (images != null && !images.isEmpty()) {
            for (ProductImage img : images) {
                deletePhysicalFile(img.getImgUrl(), "products");
            }
            productImageRepository.deleteAll(images);
        }

        // Delete certificate physically
        if (product.getCertificateUrl() != null && !product.getCertificateUrl().isEmpty()) {
            deletePhysicalFile(product.getCertificateUrl(), "certificates");
        }

        // Delete traceability image physically
        if (product.getTraceabilityImageUrl() != null && !product.getTraceabilityImageUrl().isEmpty()) {
            deletePhysicalFile(product.getTraceabilityImageUrl(), "traceability");
        }

        // Delete product
        productRepository.delete(product);
    }

    private void deletePhysicalFile(String fileUrl, String subFolder) {
        if (fileUrl == null) return;
        String normalizedUrl = fileUrl.replace("\\", "/");
        if (normalizedUrl.contains("/uploads/" + subFolder + "/")) {
            try {
                String fileName = normalizedUrl.substring(normalizedUrl.lastIndexOf("/") + 1);
                java.io.File fileInParent = new java.io.File("uploads" + java.io.File.separator + subFolder + java.io.File.separator + fileName);
                java.io.File fileInSub = new java.io.File("AgriMarket" + java.io.File.separator + "uploads" + java.io.File.separator + subFolder + java.io.File.separator + fileName);

                boolean deleted = false;
                if (fileInParent.exists()) {
                    deleted = fileInParent.delete();
                    System.out.println(">>> ProductServiceImpl: Deleted physical file in parent: " + fileInParent.getAbsolutePath() + " (success: " + deleted + ")");
                } else if (fileInSub.exists()) {
                    deleted = fileInSub.delete();
                    System.out.println(">>> ProductServiceImpl: Deleted physical file in subfolder: " + fileInSub.getAbsolutePath() + " (success: " + deleted + ")");
                } else {
                    System.out.println(">>> ProductServiceImpl: File not found at parent: " + fileInParent.getAbsolutePath() + " or subfolder: " + fileInSub.getAbsolutePath());
                }
            } catch (Exception e) {
                System.err.println(">>> ProductServiceImpl: Failed to delete physical file: " + fileUrl + ", error: " + e.getMessage());
            }
        }
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request, String farmerEmail) throws Exception {
        Farmer farmer = farmerRepository.findByEmail(farmerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nông dân với email: " + farmerEmail));

        Category category = null;
        if (request.getCategoryName() != null && !request.getCategoryName().isEmpty()) {
            category = categoryRepository.findByName(request.getCategoryName())
                    .orElseGet(() -> {
                        Category newCat = new Category();
                        newCat.setName(request.getCategoryName());
                        newCat.setDescription("Danh mục nông sản " + request.getCategoryName());
                        return categoryRepository.save(newCat);
                    });
        }

        Product product = new Product();
        product.setFarmer(farmer);
        product.setCategory(category);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0);
        product.setUnit(request.getUnit());
        product.setStatus(request.getStatus() != null ? request.getStatus() : "pending");
        product.setHarvestDate(request.getHarvestDate());
        product.setExpirationDate(request.getExpirationDate());
        product.setIsOrganic(request.getIsOrganic() != null ? request.getIsOrganic() : false);

        // Handle certificate file Base64 if organic is enabled
        if (Boolean.TRUE.equals(request.getIsOrganic()) && request.getCertificateFileBase64() != null && !request.getCertificateFileBase64().isEmpty()) {
            String certUrl = saveBase64File(request.getCertificateFileBase64(), "certificates");
            product.setCertificateUrl(certUrl);
        }

        // Handle traceability image Base64 if uploaded
        if (request.getTraceabilityImageBase64() != null && !request.getTraceabilityImageBase64().isEmpty()) {
            String traceabilityUrl = saveBase64File(request.getTraceabilityImageBase64(), "traceability");
            product.setTraceabilityImageUrl(traceabilityUrl);
        }

        product = productRepository.save(product);

        // Save product images
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (int i = 0; i < request.getImages().size(); i++) {
                String base64Image = request.getImages().get(i);
                if (base64Image != null && !base64Image.isEmpty()) {
                    String imgUrl = saveBase64File(base64Image, "products");
                    ProductImage pImage = new ProductImage();
                    pImage.setProduct(product);
                    pImage.setImgUrl(imgUrl);
                    pImage.setIsThumbnail(i == 0); // first image is the thumbnail
                    productImageRepository.save(pImage);
                }
            }
        }

        return convertToResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request, String farmerEmail) throws Exception {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm."));

        if (product.getFarmer() == null || !product.getFarmer().getEmail().equalsIgnoreCase(farmerEmail)) {
            throw new IllegalArgumentException("Bạn không có quyền chỉnh sửa sản phẩm này.");
        }

        // Basic fields
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0);
        product.setUnit(request.getUnit());
        product.setHarvestDate(request.getHarvestDate());
        product.setExpirationDate(request.getExpirationDate());
        product.setIsOrganic(request.getIsOrganic() != null ? request.getIsOrganic() : false);
        product.setStatus("pending"); // Reset status to pending for admin approval

        // Category
        Category category = null;
        if (request.getCategoryName() != null && !request.getCategoryName().isEmpty()) {
            category = categoryRepository.findByName(request.getCategoryName())
                    .orElseGet(() -> {
                        Category newCat = new Category();
                        newCat.setName(request.getCategoryName());
                        newCat.setDescription("Danh mục nông sản " + request.getCategoryName());
                        return categoryRepository.save(newCat);
                    });
        }
        product.setCategory(category);

        // Certificate file
        if (Boolean.TRUE.equals(product.getIsOrganic())) {
            if (request.getCertificateFileBase64() != null && !request.getCertificateFileBase64().isEmpty()) {
                if (request.getCertificateFileBase64().startsWith("data:")) {
                    if (product.getCertificateUrl() != null) {
                        deletePhysicalFile(product.getCertificateUrl(), "certificates");
                    }
                    String certUrl = saveBase64File(request.getCertificateFileBase64(), "certificates");
                    product.setCertificateUrl(certUrl);
                }
            }
        } else {
            if (product.getCertificateUrl() != null) {
                deletePhysicalFile(product.getCertificateUrl(), "certificates");
                product.setCertificateUrl(null);
            }
        }

        // Traceability image
        if (request.getTraceabilityImageBase64() != null && !request.getTraceabilityImageBase64().isEmpty()) {
            if (request.getTraceabilityImageBase64().startsWith("data:")) {
                if (product.getTraceabilityImageUrl() != null) {
                    deletePhysicalFile(product.getTraceabilityImageUrl(), "traceability");
                }
                String traceabilityUrl = saveBase64File(request.getTraceabilityImageBase64(), "traceability");
                product.setTraceabilityImageUrl(traceabilityUrl);
            }
        } else {
            if (request.getTraceabilityImageBase64() == null && product.getTraceabilityImageUrl() != null) {
                deletePhysicalFile(product.getTraceabilityImageUrl(), "traceability");
                product.setTraceabilityImageUrl(null);
            }
        }

        product = productRepository.save(product);

        // Images handling
        if (request.getImages() != null) {
            List<ProductImage> dbImages = productImageRepository.findByProductId(id);
            List<String> requestImages = request.getImages();

            // Find images to delete
            for (ProductImage dbImg : dbImages) {
                boolean keep = false;
                for (String reqImg : requestImages) {
                    if (reqImg != null && reqImg.equalsIgnoreCase(dbImg.getImgUrl())) {
                        keep = true;
                        break;
                    }
                }
                if (!keep) {
                    deletePhysicalFile(dbImg.getImgUrl(), "products");
                    productImageRepository.delete(dbImg);
                }
            }

            productImageRepository.flush(); // Ensure deletes are synchronized

            for (int i = 0; i < requestImages.size(); i++) {
                String imgStr = requestImages.get(i);
                if (imgStr != null && !imgStr.isEmpty()) {
                    if (imgStr.startsWith("data:")) {
                        String imgUrl = saveBase64File(imgStr, "products");
                        ProductImage pImage = new ProductImage();
                        pImage.setProduct(product);
                        pImage.setImgUrl(imgUrl);
                        pImage.setIsThumbnail(i == 0);
                        productImageRepository.save(pImage);
                    } else {
                        final String url = imgStr;
                        Optional<ProductImage> existingOpt = productImageRepository.findByProductId(id).stream()
                                .filter(pImg -> pImg.getImgUrl().equalsIgnoreCase(url))
                                .findFirst();
                        if (existingOpt.isPresent()) {
                            ProductImage pImage = existingOpt.get();
                            pImage.setIsThumbnail(i == 0);
                            productImageRepository.save(pImage);
                        }
                    }
                }
            }
        }

        return convertToResponse(product);
    }

    private String saveBase64File(String base64Str, String subFolder) throws IOException {
        if (base64Str == null || base64Str.isEmpty()) {
            return null;
        }

        String header = "";
        String data = base64Str;
        if (base64Str.contains(",")) {
            String[] parts = base64Str.split(",");
            header = parts[0];
            data = parts[1];
        } else {
            // Check if it's raw base64 or has header without comma (unlikely)
            data = base64Str;
        }

        String extension = ".jpg"; // default
        if (header.contains("image/png")) {
            extension = ".png";
        } else if (header.contains("image/gif")) {
            extension = ".gif";
        } else if (header.contains("image/webp")) {
            extension = ".webp";
        } else if (header.contains("application/pdf")) {
            extension = ".pdf";
        }

        byte[] decodedBytes = java.util.Base64.getDecoder().decode(data.trim());

        String uploadDir = "uploads" + File.separator + subFolder;
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String fileName = UUID.randomUUID().toString() + extension;
        File file = new File(dir.getAbsolutePath() + File.separator + fileName);

        try (java.io.FileOutputStream fos = new java.io.FileOutputStream(file)) {
            fos.write(decodedBytes);
        }

        try {
            return ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/")
                    .path(subFolder + "/")
                    .path(fileName)
                    .toUriString();
        } catch (Exception e) {
            return "/uploads/" + subFolder + "/" + fileName;
        }
    }

    @Override
    public List<ProductResponse> getAllApprovedProducts() {
        List<Product> products = productRepository.findByStatusOrderByCreatedAtDesc("approved");
        return products.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm với ID: " + id));
        return convertToResponse(product);
    }
}

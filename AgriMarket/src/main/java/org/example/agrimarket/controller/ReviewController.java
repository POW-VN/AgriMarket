package org.example.agrimarket.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.agrimarket.model.*;
import org.example.agrimarket.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.File;
import java.io.IOException;
import java.security.Principal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import org.example.agrimarket.service.SupabaseStorageService;

@RestController
@RequestMapping("/api")
public class ReviewController {

    @Autowired
    private SupabaseStorageService supabaseStorageService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private ProductReviewRepository productReviewRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public static class ReviewSubmitRequest {
        private String orderCode;
        private Long productId;
        private Integer rating;
        private String comment;
        private Boolean anonymous;
        private List<String> images;
        private Map<String, Integer> specificRatings;
        private List<String> selectedTags;

        // Getters & Setters
        public String getOrderCode() { return orderCode; }
        public void setOrderCode(String orderCode) { this.orderCode = orderCode; }
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
        public Boolean getAnonymous() { return anonymous; }
        public void setAnonymous(Boolean anonymous) { this.anonymous = anonymous; }
        public List<String> getImages() { return images; }
        public void setImages(List<String> images) { this.images = images; }
        public Map<String, Integer> getSpecificRatings() { return specificRatings; }
        public void setSpecificRatings(Map<String, Integer> specificRatings) { this.specificRatings = specificRatings; }
        public List<String> getSelectedTags() { return selectedTags; }
        public void setSelectedTags(List<String> selectedTags) { this.selectedTags = selectedTags; }
    }

    @PostMapping("/reviews/product")
    public ResponseEntity<?> submitReview(Principal principal, @RequestBody ReviewSubmitRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Vui lòng đăng nhập.");
        }

        try {
            Customer customer = customerRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin khách hàng."));

            Order order = orderRepository.findByOrderCode(request.getOrderCode())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng: " + request.getOrderCode()));

            if (!order.getCustomer().getId().equals(customer.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Bạn không có quyền đánh giá đơn hàng này.");
            }

            if (!"delivered".equalsIgnoreCase(order.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Chỉ có thể đánh giá các đơn hàng đã được giao hàng thành công.");
            }

            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm."));

            boolean itemExists = order.getItems().stream()
                    .anyMatch(item -> item.getProductId().equals(request.getProductId()));
            if (!itemExists) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Sản phẩm không thuộc đơn hàng này.");
            }

            Optional<ProductReview> existingReview = productReviewRepository.findByOrderIdAndProductIdAndCustomerId(
                    order.getId(), product.getId(), customer.getId());

            // Process image attachments: preserve existing URLs, upload new ones
            List<String> savedImageUrls = new ArrayList<>();
            if (request.getImages() != null && !request.getImages().isEmpty()) {
                for (String img : request.getImages()) {
                    if (img != null && !img.isEmpty()) {
                        if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("/")) {
                            savedImageUrls.add(img);
                        } else {
                            try {
                                String url = saveBase64File(img, "reviews");
                                savedImageUrls.add(url);
                            } catch (Exception e) {
                                // ignore failed image decode
                            }
                        }
                    }
                }
            }

            // Build rich JSON comment
            Map<String, Object> commentData = new HashMap<>();
            commentData.put("text", request.getComment() != null ? request.getComment() : "");
            commentData.put("tags", request.getSelectedTags() != null ? request.getSelectedTags() : Collections.emptyList());
            commentData.put("images", savedImageUrls);
            commentData.put("specificRatings", request.getSpecificRatings() != null ? request.getSpecificRatings() : Collections.emptyMap());
            commentData.put("anonymous", request.getAnonymous() != null ? request.getAnonymous() : false);

            String commentString = objectMapper.writeValueAsString(commentData);

            // Save/Update ProductReview
            ProductReview review = existingReview.orElse(new ProductReview());
            review.setOrder(order);
            review.setProduct(product);
            review.setCustomer(customer);
            review.setRating(request.getRating());
            review.setComment(commentString);

            // Populate new structured fields
            review.setQualityRating(request.getSpecificRatings() != null ? request.getSpecificRatings().getOrDefault("quality", 0) : 0);
            review.setFreshnessRating(request.getSpecificRatings() != null ? request.getSpecificRatings().getOrDefault("freshness", 0) : 0);
            review.setPackagingRating(request.getSpecificRatings() != null ? request.getSpecificRatings().getOrDefault("packaging", 0) : 0);
            review.setDeliveryRating(request.getSpecificRatings() != null ? request.getSpecificRatings().getOrDefault("delivery", 0) : 0);
            review.setAnonymous(request.getAnonymous() != null ? request.getAnonymous() : false);
            review.setImages(savedImageUrls);
            review.setTags(request.getSelectedTags() != null ? request.getSelectedTags() : Collections.emptyList());

            if (existingReview.isPresent()) {
                review.setCreatedAt(LocalDateTime.now());
            }
            productReviewRepository.save(review);

            // Recalculate average rating for farmer
            Farmer farmer = product.getFarmer();
            if (farmer != null) {
                Double farmerAvg = productReviewRepository.getAverageRatingByFarmerId(farmer.getId());
                if (farmerAvg != null) {
                    farmer.setRatingAverage(Math.round(farmerAvg * 10.0) / 10.0);
                    farmerRepository.save(farmer);
                }
            }

            return ResponseEntity.ok(existingReview.isPresent() ? "Cập nhật đánh giá thành công!" : "Gửi đánh giá thành công!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi gửi đánh giá: " + e.getMessage());
        }
    }

    @GetMapping("/reviews/detail")
    public ResponseEntity<?> getReviewDetail(Principal principal,
                                            @RequestParam String orderCode,
                                            @RequestParam Long productId) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Vui lòng đăng nhập.");
        }

        try {
            Customer customer = customerRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin khách hàng."));

            Order order = orderRepository.findByOrderCode(orderCode)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng: " + orderCode));

            if (!order.getCustomer().getId().equals(customer.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Bạn không có quyền xem thông tin đánh giá của đơn hàng này.");
            }

            Optional<ProductReview> existingReview = productReviewRepository.findByOrderIdAndProductIdAndCustomerId(
                    order.getId(), productId, customer.getId());

            if (existingReview.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            ProductReview review = existingReview.get();
            Map<String, Object> map = new HashMap<>();
            map.put("id", review.getId());
            map.put("rating", review.getRating());

            String rawComment = review.getComment();
            String text = rawComment;
            List<String> images = review.getImages() != null ? review.getImages() : Collections.emptyList();
            List<String> tags = review.getTags() != null ? review.getTags() : Collections.emptyList();
            Map<String, Integer> specificRatings = new HashMap<>();
            if (review.getQualityRating() != null) {
                specificRatings.put("quality", review.getQualityRating());
                specificRatings.put("freshness", review.getFreshnessRating());
                specificRatings.put("packaging", review.getPackagingRating());
                specificRatings.put("delivery", review.getDeliveryRating());
            }
            boolean anonymous = review.getAnonymous() != null ? review.getAnonymous() : false;

            if (rawComment != null && rawComment.startsWith("{")) {
                try {
                    Map<String, Object> parsed = objectMapper.readValue(rawComment, new TypeReference<Map<String, Object>>() {});
                    text = (String) parsed.getOrDefault("text", "");
                    if (images.isEmpty()) {
                        images = (List<String>) parsed.getOrDefault("images", Collections.emptyList());
                    }
                    if (tags.isEmpty()) {
                        tags = (List<String>) parsed.getOrDefault("tags", Collections.emptyList());
                    }
                    if (specificRatings.isEmpty() || !specificRatings.containsKey("quality") || specificRatings.get("quality") == 0) {
                        specificRatings = (Map<String, Integer>) parsed.getOrDefault("specificRatings", Collections.emptyMap());
                    }
                    if (review.getAnonymous() == null) {
                        anonymous = (Boolean) parsed.getOrDefault("anonymous", false);
                    }
                } catch (Exception e) {
                    // fallback
                }
            }

            map.put("comment", text);
            map.put("images", images);
            map.put("tags", tags);
            map.put("specificRatings", specificRatings);
            map.put("anonymous", anonymous);

            return ResponseEntity.ok(map);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi lấy chi tiết đánh giá: " + e.getMessage());
        }
    }

    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<?> getProductReviews(@PathVariable Long productId) {
        try {
            List<ProductReview> reviews = productReviewRepository.findByProductIdOrderByCreatedAtDesc(productId);

            List<Map<String, Object>> response = reviews.stream().map(review -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", review.getId());

                String rawComment = review.getComment();
                String text = rawComment;
                List<String> images = review.getImages() != null ? review.getImages() : Collections.emptyList();
                List<String> tags = review.getTags() != null ? review.getTags() : Collections.emptyList();
                Map<String, Integer> specificRatings = new HashMap<>();
                if (review.getQualityRating() != null) {
                    specificRatings.put("quality", review.getQualityRating());
                    specificRatings.put("freshness", review.getFreshnessRating());
                    specificRatings.put("packaging", review.getPackagingRating());
                    specificRatings.put("delivery", review.getDeliveryRating());
                }
                boolean anonymous = review.getAnonymous() != null ? review.getAnonymous() : false;

                if (rawComment != null && rawComment.startsWith("{")) {
                    try {
                        Map<String, Object> parsed = objectMapper.readValue(rawComment, new TypeReference<Map<String, Object>>() {});
                        text = (String) parsed.getOrDefault("text", "");
                        if (images.isEmpty()) {
                            images = (List<String>) parsed.getOrDefault("images", Collections.emptyList());
                        }
                        if (tags.isEmpty()) {
                            tags = (List<String>) parsed.getOrDefault("tags", Collections.emptyList());
                        }
                        if (specificRatings.isEmpty() || !specificRatings.containsKey("quality") || specificRatings.get("quality") == 0) {
                            specificRatings = (Map<String, Integer>) parsed.getOrDefault("specificRatings", Collections.emptyMap());
                        }
                        if (review.getAnonymous() == null) {
                            anonymous = (Boolean) parsed.getOrDefault("anonymous", false);
                        }
                    } catch (Exception e) {
                        // fallback to raw
                    }
                }

                String author = "Khách hàng ẩn danh";
                String avatarText = "U";
                if (!anonymous && review.getCustomer() != null) {
                    author = review.getCustomer().getFullName();
                    if (author != null && !author.isEmpty()) {
                        String[] parts = author.split("\\s+");
                        if (parts.length > 1) {
                            avatarText = (parts[parts.length - 2].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
                        } else {
                            avatarText = author.substring(0, Math.min(2, author.length())).toUpperCase();
                        }
                    }
                }

                String dateStr = review.getCreatedAt() != null
                        ? review.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                        : "";

                map.put("author", author);
                map.put("avatarText", avatarText);
                map.put("rating", review.getRating());
                map.put("date", dateStr);
                map.put("title", text.length() > 30 ? text.substring(0, 27) + "..." : text);
                map.put("comment", text);
                map.put("images", images);
                map.put("tags", tags);
                map.put("specificRatings", specificRatings);
                map.put("helpful", 0);
                map.put("notHelpful", 0);

                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi khi lấy danh sách đánh giá: " + e.getMessage());
        }
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
        }

        String extension = ".jpg"; // default
        String contentType = "image/jpeg";
        if (header.contains("image/png")) {
            extension = ".png";
            contentType = "image/png";
        } else if (header.contains("image/gif")) {
            extension = ".gif";
            contentType = "image/gif";
        } else if (header.contains("image/webp")) {
            extension = ".webp";
            contentType = "image/webp";
        }

        byte[] decodedBytes = java.util.Base64.getDecoder().decode(data.trim());

        return supabaseStorageService.uploadFileBytes(decodedBytes, "file" + extension, contentType, subFolder);
    }
}

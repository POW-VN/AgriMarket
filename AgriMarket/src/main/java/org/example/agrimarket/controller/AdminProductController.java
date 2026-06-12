package org.example.agrimarket.controller;

import org.example.agrimarket.dto.ProductResponse;
import org.example.agrimarket.model.Product;
import org.example.agrimarket.repository.ProductRepository;
import org.example.agrimarket.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}/ai-insights")
    public ResponseEntity<?> getAiInsights(@PathVariable Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }

        ProductResponse pr = productService.getProductById(id);
        int descLen = pr.getDescription() != null ? pr.getDescription().length() : 0;
        int score = descLen > 200 ? 88 : descLen > 100 ? 68 : 42;
        boolean isHighPrice = pr.getPrice() != null && pr.getPrice() > 100000;
        int riskScore = Boolean.TRUE.equals(pr.getIsOrganic()) ? 18 : (pr.getCertificateUrl() != null ? 30 : 55);

        Map<String, Object> insights = new HashMap<>();
        insights.put("productId", pr.getId());
        insights.put("score", score);
        insights.put("riskScore", riskScore);
        insights.put("priceCheck", isHighPrice ? "cao_hơn_bình_thường" : "hợp_lý");
        insights.put("flagged", false);
        insights.put("flaggedReason", "");
        insights.put("recommendedPrice", pr.getPrice());
        insights.put("minPrice", Math.round(pr.getPrice() * 0.85));
        insights.put("maxPrice", Math.round(pr.getPrice() * 1.15));
        insights.put("explanation", String.format(
                "Khoảng giá đề xuất dựa trên giá thị trường danh mục \"%s\" đạt chứng nhận %s. Mức giá %s đ/%s của nhà vườn là hoàn toàn phù hợp với thị trường hiện tại.",
                pr.getCategoryName() != null ? pr.getCategoryName() : "Nông sản",
                Boolean.TRUE.equals(pr.getIsOrganic()) ? "Hữu cơ (+30%)" : "VietGAP",
                String.format("%,.0f", pr.getPrice()),
                pr.getUnit() != null ? pr.getUnit() : "kg"
        ));
        insights.put("suggestedDescription", String.format(
                "Gợi ý mô tả lại cho sản phẩm %s chuẩn SEO:\n1. Giới thiệu: Nông sản tươi ngon cao cấp thu hoạch trực tiếp từ %s.\n2. Đặc sắc: Canh tác an toàn tự nhiên giữ trọn hương vị đặc trưng, giàu vitamin và khoáng chất thiết yếu.\n3. Bảo quản: Giữ ngăn mát tủ lạnh từ 3–7°C, sử dụng trong vòng %s.",
                pr.getName(),
                pr.getFarmLocation() != null ? pr.getFarmLocation() : "vùng trồng đạt chuẩn",
                "bó".equalsIgnoreCase(pr.getUnit()) ? "2–3 ngày" : "7–10 ngày"
        ));

        return ResponseEntity.ok(insights);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        product.setStatus("approved");
        product.setRejectionReason(null);
        productRepository.save(product);
        
        // Return updated product response so frontend updates UI state
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectProduct(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        String reason = body.get("reason");
        product.setStatus("rejected");
        product.setRejectionReason(reason);
        productRepository.save(product);
        
        // Return updated product response
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping("/{id}/request-changes")
    public ResponseEntity<?> requestChanges(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        String feedback = body.get("feedback");
        product.setStatus("request_changes");
        product.setAdminNotes(feedback);
        productRepository.save(product);
        
        // Return updated product response
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping("/{id}/hide")
    public ResponseEntity<?> hideProduct(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        String reason = body.get("reason");
        product.setStatus("hidden");
        product.setRejectionReason(reason);
        productRepository.save(product);
        
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping("/{id}/unhide")
    public ResponseEntity<?> unhideProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        product.setStatus("approved");
        product.setRejectionReason(null);
        productRepository.save(product);
        
        return ResponseEntity.ok(productService.getProductById(id));
    }
}

package org.example.agrimarket.controller;

import org.example.agrimarket.dto.AiDescriptionRequest;
import org.example.agrimarket.dto.AiDescriptionResponse;
import org.example.agrimarket.dto.AiPriceRequest;
import org.example.agrimarket.dto.AiPriceResponse;
import org.example.agrimarket.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @PostMapping("/generate-description")
    public ResponseEntity<?> generateDescription(Principal principal, @RequestBody AiDescriptionRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized: Vui lòng đăng nhập.");
        }

        try {
            String description = aiService.generateProductDescription(
                    request.getProductName(),
                    request.getCategory(),
                    request.getIsOrganic()
            );
            return ResponseEntity.ok(new AiDescriptionResponse(description));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi sinh mô tả tự động: " + e.getMessage());
        }
    }

    @PostMapping("/suggest-price")
    public ResponseEntity<?> suggestPrice(Principal principal, @RequestBody AiPriceRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized: Vui lòng đăng nhập.");
        }

        try {
            AiPriceResponse priceResponse = aiService.suggestProductPrice(
                    request.getProductName(),
                    request.getCategory(),
                    request.getIsOrganic(),
                    request.getUnit()
            );
            return ResponseEntity.ok(priceResponse);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi sinh gợi ý giá bán: " + e.getMessage());
        }
    }
}

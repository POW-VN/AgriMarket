package org.example.agrimarket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private Long farmerId;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String description;
    private String aiGeneratedDescription;
    private Double price;
    private Double aiSuggestedPrice;
    private Integer stockQuantity;
    private String unit;
    private String status;
    private LocalDate harvestDate;
    private LocalDateTime createdAt;
    private Boolean isOrganic;
    private String certificateUrl;
    private String thumbnailUrl;
}

package org.example.agrimarket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long id; // maps to product id
    private String name;
    private Double price;
    private String unit;
    private String imageUrl;
    private Integer quantity;
    private Boolean checked;
    private Integer stockQuantity;
}

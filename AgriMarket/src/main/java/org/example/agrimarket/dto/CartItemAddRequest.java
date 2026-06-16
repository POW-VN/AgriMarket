package org.example.agrimarket.dto;

import lombok.Data;

@Data
public class CartItemAddRequest {
    private Long productId;
    private Integer quantity;
}

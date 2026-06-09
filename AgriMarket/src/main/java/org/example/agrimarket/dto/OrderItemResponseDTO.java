package org.example.agrimarket.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItemResponseDTO {
    private String name;
    private String farmer;
    private Double price;
    private Integer qty;
    private String img;
}

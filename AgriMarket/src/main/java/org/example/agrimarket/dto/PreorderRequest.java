package org.example.agrimarket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreorderRequest {
    private List<PreorderItemRequest> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PreorderItemRequest {
        private Long productId;
        private Integer quantity;
        private String expectedHarvestDate; // YYYY-MM-DD
    }
}

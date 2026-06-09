package org.example.agrimarket.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private String id; // maps to orderCode
    private String status;
    private String statusLabel;
    private String date;
    private String time;
    private Double subtotal;
    private Double shippingFee;
    private Double serviceFee;
    private Double discount;
    private Double amount;
    private String recipient;
    private String address;
    private String phone;
    private String trackingNumber;
    private String cancelReason;
    private String customerAvatarUrl;
    private String shippingNote;
    private ProviderInfo provider;
    private List<OrderItemResponseDTO> items;
    private List<String> thumbnails;
    private Integer itemCount;
    private Integer hasMoreItems;
    private String paymentMethod;
    private String paymentStatus;

    @Data
    @Builder
    public static class ProviderInfo {
        private String name;
        private String location;
        private Integer estYear;
        private String avatarText;
        private String avatarBg;
        private String avatarUrl;
    }
}

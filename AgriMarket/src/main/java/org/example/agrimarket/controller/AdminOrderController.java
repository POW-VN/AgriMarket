package org.example.agrimarket.controller;

import org.example.agrimarket.dto.OrderCreateRequest;
import org.example.agrimarket.dto.OrderItemRequest;
import org.example.agrimarket.dto.OrderResponse;
import org.example.agrimarket.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> payload) {
        try {
            String customerEmail = (String) payload.get("customerEmail");
            if (customerEmail == null || customerEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email khách hàng không được để trống.");
            }

            OrderCreateRequest request = new OrderCreateRequest();
            request.setRecipient((String) payload.get("recipient"));
            request.setPhone((String) payload.get("phone"));
            request.setAddress((String) payload.get("address"));
            request.setShippingNote((String) payload.get("shippingNote"));
            request.setPaymentMethod((String) payload.get("paymentMethod"));

            // Parse numbers safely
            request.setSubtotal(payload.get("subtotal") != null ? ((Number) payload.get("subtotal")).doubleValue() : 0.0);
            request.setShippingFee(payload.get("shippingFee") != null ? ((Number) payload.get("shippingFee")).doubleValue() : 0.0);
            request.setServiceFee(payload.get("serviceFee") != null ? ((Number) payload.get("serviceFee")).doubleValue() : 0.0);
            request.setDiscount(payload.get("discount") != null ? ((Number) payload.get("discount")).doubleValue() : 0.0);
            request.setAmount(payload.get("amount") != null ? ((Number) payload.get("amount")).doubleValue() : 0.0);

            List<Map<String, Object>> itemsList = (List<Map<String, Object>>) payload.get("items");
            List<OrderItemRequest> itemRequests = new ArrayList<>();
            if (itemsList != null) {
                for (Map<String, Object> itemMap : itemsList) {
                    OrderItemRequest itemReq = new OrderItemRequest();
                    itemReq.setProductId(itemMap.get("productId") != null ? ((Number) itemMap.get("productId")).longValue() : null);
                    itemReq.setQuantity(itemMap.get("quantity") != null ? ((Number) itemMap.get("quantity")).intValue() : 0);
                    itemRequests.add(itemReq);
                }
            }
            request.setItems(itemRequests);

            OrderResponse response = orderService.createOrder(customerEmail, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Đã xảy ra lỗi khi tạo đơn hàng: " + e.getMessage());
        }
    }

    @PutMapping("/{orderCode}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String orderCode,
            @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            String paymentStatus = body.get("paymentStatus");
            OrderResponse response = orderService.updateOrderStatusByAdmin(orderCode, status, paymentStatus);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi cập nhật trạng thái đơn hàng: " + e.getMessage());
        }
    }
}

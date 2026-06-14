package org.example.agrimarket.controller;

import org.example.agrimarket.dto.OrderCreateRequest;
import org.example.agrimarket.dto.OrderResponse;
import org.example.agrimarket.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(Principal principal, @RequestBody OrderCreateRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        try {
            OrderResponse order = orderService.createOrder(principal.getName(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getCustomerOrders(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        try {
            List<OrderResponse> orders = orderService.getCustomerOrders(principal.getName());
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<?> getOrderDetails(Principal principal, @PathVariable String orderCode) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        try {
            OrderResponse order = orderService.getOrderDetails(principal.getName(), orderCode);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/{orderCode}/cancel")
    public ResponseEntity<?> cancelOrder(Principal principal, @PathVariable String orderCode, @RequestBody(required = false) Map<String, String> body) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        String reason = "";
        if (body != null && body.containsKey("reason")) {
            reason = body.get("reason");
        }
        try {
            OrderResponse order = orderService.cancelOrder(principal.getName(), orderCode, reason);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/{orderCode}/confirm-payment")
    public ResponseEntity<?> confirmPayment(Principal principal, @PathVariable String orderCode, @RequestBody(required = false) Map<String, String> body) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        String paymentMethod = "";
        if (body != null && body.containsKey("paymentMethod")) {
            paymentMethod = body.get("paymentMethod");
        }
        try {
            OrderResponse order = orderService.confirmPayment(principal.getName(), orderCode, paymentMethod);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/farmer")
    public ResponseEntity<?> getFarmerOrders(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        try {
            List<OrderResponse> orders = orderService.getFarmerOrders(principal.getName());
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/farmer/{orderCode}/status")
    public ResponseEntity<?> updateFarmerOrderStatus(Principal principal, @PathVariable String orderCode, @RequestBody Map<String, String> body) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        String status = body.get("status");
        String reason = body.get("reason");
        try {
            OrderResponse order = orderService.updateFarmerOrderStatus(principal.getName(), orderCode, status, reason);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/shipper/requests")
    public ResponseEntity<?> getShipperRequests(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        try {
            return ResponseEntity.ok(orderService.getShipperRequests(principal.getName()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/shipper/accepted")
    public ResponseEntity<?> getShipperAccepted(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        try {
            return ResponseEntity.ok(orderService.getShipperAccepted(principal.getName()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/shipper/{orderCode}/accept")
    public ResponseEntity<?> acceptShipperRequest(Principal principal, @PathVariable String orderCode,
                                                   @RequestBody(required = false) Map<String, String> body) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        try {
            return ResponseEntity.ok(orderService.acceptShipperRequest(principal.getName(), orderCode, body));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/shipper/{orderCode}/reject")
    public ResponseEntity<?> rejectShipperRequest(Principal principal, @PathVariable String orderCode, @RequestBody(required = false) Map<String, String> body) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        String reason = body != null ? body.get("reason") : "";
        try {
            return ResponseEntity.ok(orderService.rejectShipperRequest(principal.getName(), orderCode, reason));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/shipper/{orderCode}/status")
    public ResponseEntity<?> updateShipperOrderStatus(Principal principal, @PathVariable String orderCode, @RequestBody Map<String, String> body) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        String status = body.get("status");
        String notes = body.get("notes");
        String podPhoto = body.get("podPhoto");
        try {
            return ResponseEntity.ok(orderService.updateShipperOrderStatus(principal.getName(), orderCode, status, notes, podPhoto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}

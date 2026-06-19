package org.example.agrimarket.service;

import jakarta.servlet.http.HttpServletRequest;
import org.example.agrimarket.config.VNPayConfig;
import org.example.agrimarket.model.*;
import org.example.agrimarket.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class PaymentService {

    @Autowired
    private VNPayConfig vnPayConfig;

    @Autowired
    private OrderGroupRepository orderGroupRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public String createVNPayPaymentUrl(HttpServletRequest request, String orderCode, String email) {
        double amount = 0;

        // Try to find in OrderGroup first
        Optional<OrderGroup> groupOpt = orderGroupRepository.findByGroupCode(orderCode);
        if (groupOpt.isPresent()) {
            OrderGroup group = groupOpt.get();
            if (!group.getCustomer().getEmail().equalsIgnoreCase(email)) {
                throw new RuntimeException("Bạn không có quyền thao tác trên đơn hàng này.");
            }
            if ("paid".equalsIgnoreCase(group.getPaymentStatus())) {
                throw new RuntimeException("Đơn hàng này đã được thanh toán trước đó.");
            }
            amount = group.getGrandTotal();
        } else {
            // Fallback to individual Order
            Order order = orderRepository.findByOrderCode(orderCode)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng hoặc nhóm đơn hàng: " + orderCode));
            if (!order.getCustomer().getEmail().equalsIgnoreCase(email)) {
                throw new RuntimeException("Bạn không có quyền thao tác trên đơn hàng này.");
            }
            if ("paid".equalsIgnoreCase(order.getPaymentStatus())) {
                throw new RuntimeException("Đơn hàng này đã được thanh toán trước đó.");
            }
            amount = order.getAmount();
        }

        long amountInCents = Math.round(amount * 100);

        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnPayConfig.getVnpTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(amountInCents));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", orderCode);
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang " + orderCode);
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getVnpReturnUrl());

        // Normalize localhost/IPv6 loopback IP to avoid signature errors
        String ipAddress = VNPayConfig.getIpAddress(request);
        if (ipAddress == null || ipAddress.equals("0:0:0:0:0:0:0:1") || ipAddress.equals("localhost")) {
            ipAddress = "127.0.0.1";
        }
        vnpParams.put("vnp_IpAddr", ipAddress);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreateDate = formatter.format(cld.getTime());
        vnpParams.put("vnp_CreateDate", vnpCreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnpExpireDate = formatter.format(cld.getTime());
        vnpParams.put("vnp_ExpireDate", vnpExpireDate);

        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (String fieldName : fieldNames) {
            String fieldValue = vnpParams.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                // Build hash data
                if (hashData.length() > 0) {
                    hashData.append('&');
                }
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(encode(fieldValue));

                // Build query
                if (query.length() > 0) {
                    query.append('&');
                }
                query.append(encode(fieldName));
                query.append('=');
                query.append(encode(fieldValue));
            }
        }

        String queryUrl = query.toString();
        String vnpSecureHash = VNPayConfig.hmacSHA512(vnPayConfig.getVnpHashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;
        return vnPayConfig.getVnpPayUrl() + "?" + queryUrl;
    }

    @Transactional
    public Map<String, Object> processVNPayCallback(Map<String, String> queryParams) {
        Map<String, Object> result = new HashMap<>();

        String vnpSecureHash = queryParams.get("vnp_SecureHash");
        if (vnpSecureHash == null) {
            result.put("success", false);
            result.put("message", "Chữ ký bảo mật không tồn tại.");
            return result;
        }

        Map<String, String> fields = new HashMap<>();
        for (Map.Entry<String, String> entry : queryParams.entrySet()) {
            String key = entry.getKey();
            String val = entry.getValue();
            if (key != null && val != null && !key.equals("vnp_SecureHash") && !key.equals("vnp_SecureHashType")) {
                fields.put(key, val);
            }
        }

        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();

        for (String fieldName : fieldNames) {
            String fieldValue = fields.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                if (sb.length() > 0) {
                    sb.append('&');
                }
                sb.append(fieldName);
                sb.append('=');
                sb.append(encode(fieldValue));
            }
        }

        String calculatedSign = VNPayConfig.hmacSHA512(vnPayConfig.getVnpHashSecret(), sb.toString());
        if (!calculatedSign.equalsIgnoreCase(vnpSecureHash)) {
            result.put("success", false);
            result.put("message", "Chữ ký bảo mật không hợp lệ (Signature mismatch).");
            return result;
        }

        String vnpResponseCode = queryParams.get("vnp_ResponseCode");
        String vnpTxnRef = queryParams.get("vnp_TxnRef");
        String vnpAmount = queryParams.get("vnp_Amount");
        String vnpTransactionNo = queryParams.get("vnp_TransactionNo");

        if ("00".equals(vnpResponseCode)) {
            try {
                updatePaymentStatusToPaid(vnpTxnRef, "VNPAY");
                result.put("success", true);
                result.put("orderCode", vnpTxnRef);
                result.put("amount", Double.parseDouble(vnpAmount) / 100.0);
                result.put("transactionNo", vnpTransactionNo);
                result.put("message", "Thanh toán thành công qua VNPay.");
            } catch (Exception e) {
                result.put("success", false);
                result.put("message", "Lỗi khi cập nhật đơn hàng: " + e.getMessage());
            }
        } else {
            try {
                restoreCartAndCleanUpFailedPayment(vnpTxnRef);
                result.put("success", false);
                result.put("message", "Giao dịch không thành công hoặc bị hủy. Đơn hàng đã được trả lại vào giỏ hàng.");
            } catch (Exception e) {
                result.put("success", false);
                result.put("message", "Giao dịch không thành công hoặc bị hủy. Tuy nhiên, có lỗi khi hoàn lại giỏ hàng: " + e.getMessage());
            }
        }

        return result;
    }

    private void updatePaymentStatusToPaid(String orderCode, String paymentMethod) {
        Optional<OrderGroup> groupOpt = orderGroupRepository.findByGroupCode(orderCode);
        if (groupOpt.isPresent()) {
            OrderGroup group = groupOpt.get();
            group.setPaymentStatus("paid");
            if (paymentMethod != null && !paymentMethod.isEmpty()) {
                group.setPaymentMethod(paymentMethod);
            }

            if (group.getSubOrders() != null) {
                for (Order subOrder : group.getSubOrders()) {
                    subOrder.setStatus("pending");
                    subOrder.setPaymentStatus("paid");
                    orderRepository.save(subOrder);
                }
            }
            orderGroupRepository.save(group);
            return;
        }

        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng hoặc nhóm đơn hàng: " + orderCode));

        order.setStatus("pending");
        order.setPaymentStatus("paid");
        if (paymentMethod != null && !paymentMethod.isEmpty() && order.getOrderGroup() != null) {
            order.getOrderGroup().setPaymentMethod(paymentMethod);
            order.getOrderGroup().setPaymentStatus("paid");
            orderGroupRepository.save(order.getOrderGroup());
        }
        orderRepository.save(order);
    }

    private String encode(String value) {
        try {
            return URLEncoder.encode(value, StandardCharsets.UTF_8.toString());
        } catch (UnsupportedEncodingException e) {
            return "";
        }
    }

    @Transactional
    public void restoreCartAndCleanUpFailedPayment(String orderCode) {
        Optional<OrderGroup> groupOpt = orderGroupRepository.findByGroupCode(orderCode);
        if (groupOpt.isPresent()) {
            OrderGroup group = groupOpt.get();
            String email = group.getCustomer().getEmail();

            Cart cart = cartRepository.findByEmail(email).orElseGet(() -> {
                Cart newCart = new Cart();
                newCart.setEmail(email);
                return cartRepository.save(newCart);
            });

            if (group.getSubOrders() != null) {
                for (Order subOrder : group.getSubOrders()) {
                    restoreOrderItemsToCartAndStock(subOrder, cart);
                }
            }
            cartRepository.save(cart);
            orderGroupRepository.delete(group);
        } else {
            Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCode);
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                String email = order.getCustomer().getEmail();

                Cart cart = cartRepository.findByEmail(email).orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setEmail(email);
                    return cartRepository.save(newCart);
                });

                restoreOrderItemsToCartAndStock(order, cart);
                cartRepository.save(cart);

                orderRepository.delete(order);
            }
        }
    }

    private void restoreOrderItemsToCartAndStock(Order order, Cart cart) {
        if (order.getItems() != null) {
            for (OrderItem orderItem : order.getItems()) {
                // 1. Restore stock
                Optional<Product> productOpt = productRepository.findById(orderItem.getProductId());
                if (productOpt.isPresent()) {
                    Product product = productOpt.get();
                    product.setStockQuantity(product.getStockQuantity() + orderItem.getQuantity());
                    productRepository.save(product);
                }

                // 2. Add back to cart
                Optional<CartItem> existingCartItemOpt = cart.getItems().stream()
                        .filter(ci -> ci.getProductId().equals(orderItem.getProductId()))
                        .findFirst();

                if (existingCartItemOpt.isPresent()) {
                    CartItem existingCartItem = existingCartItemOpt.get();
                    existingCartItem.setQuantity(existingCartItem.getQuantity() + orderItem.getQuantity());
                    cartItemRepository.save(existingCartItem);
                } else {
                    CartItem newCartItem = new CartItem();
                    newCartItem.setCart(cart);
                    newCartItem.setProductId(orderItem.getProductId());
                    newCartItem.setQuantity(orderItem.getQuantity());
                    newCartItem.setChecked(true);
                    cart.getItems().add(newCartItem);
                    cartItemRepository.save(newCartItem);
                }
            }
        }
    }
}

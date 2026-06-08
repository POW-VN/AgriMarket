package org.example.agrimarket.service;

import org.example.agrimarket.dto.OrderCreateRequest;
import org.example.agrimarket.dto.OrderItemRequest;
import org.example.agrimarket.dto.OrderItemResponseDTO;
import org.example.agrimarket.dto.OrderResponse;
import org.example.agrimarket.model.*;
import org.example.agrimarket.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Transactional
    public OrderResponse createOrder(String email, OrderCreateRequest request) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin khách hàng."));

        // Generate unique order code
        String orderCode;
        Random random = new Random();
        do {
            orderCode = "FH-2026-" + (1000 + random.nextInt(9000));
        } while (orderRepository.findByOrderCode(orderCode).isPresent());

        Order order = new Order();
        order.setOrderCode(orderCode);
        order.setCustomer(customer);
        order.setRecipient(request.getRecipient());
        order.setPhone(request.getPhone());
        order.setAddress(request.getAddress());
        order.setShippingNote(request.getShippingNote());
        
        String method = request.getPaymentMethod();
        order.setPaymentMethod(method);
        
        // Default statuses
        order.setStatus("pending");
        order.setPaymentStatus("unpaid");

        order.setSubtotal(request.getSubtotal());
        order.setShippingFee(request.getShippingFee());
        order.setServiceFee(request.getServiceFee());
        order.setDiscount(request.getDiscount());
        order.setAmount(request.getAmount());

        // Generate tracking number
        order.setTrackingNumber("FH-TRACK-" + (100000 + random.nextInt(900000)));

        List<OrderItem> orderItems = new ArrayList<>();
        Set<Long> orderedProductIds = new HashSet<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm có ID: " + itemReq.getProductId()));

            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Sản phẩm " + product.getName() + " không đủ số lượng tồn kho.");
            }

            // Decrement stock
            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);

            // Get product image
            String imageUrl = "";
            List<ProductImage> images = productImageRepository.findByProductId(product.getId());
            if (images != null && !images.isEmpty()) {
                imageUrl = images.stream()
                        .filter(img -> img.getIsThumbnail() != null && img.getIsThumbnail())
                        .map(ProductImage::getImgUrl)
                        .findFirst()
                        .orElse(images.get(0).getImgUrl());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(product.getId());
            orderItem.setProductName(product.getName());
            orderItem.setProductPrice(product.getPrice());
            orderItem.setProductUnit(product.getUnit());
            orderItem.setImageUrl(imageUrl);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setFarmer(product.getFarmer());

            orderItems.add(orderItem);
            orderedProductIds.add(product.getId());
        }

        order.setItems(orderItems);
        Order savedOrder = orderRepository.save(order);

        // Remove from cart
        Optional<Cart> cartOpt = cartRepository.findByEmail(email);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            List<CartItem> itemsToRemove = cart.getItems().stream()
                    .filter(item -> orderedProductIds.contains(item.getProductId()))
                    .collect(Collectors.toList());

            if (!itemsToRemove.isEmpty()) {
                cartItemRepository.deleteAll(itemsToRemove);
                cart.getItems().removeAll(itemsToRemove);
                cartRepository.save(cart);
            }
        }

        return mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getCustomerOrders(String email) {
        List<Order> orders = orderRepository.findByCustomerEmailOrderByCreatedAtDesc(email);
        return orders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderDetails(String email, String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));

        // Verify customer owns the order
        if (!order.getCustomer().getEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("Bạn không có quyền xem đơn hàng này.");
        }

        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(String email, String orderCode, String reason) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));

        // Verify customer ownership
        if (!order.getCustomer().getEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này.");
        }

        if (!"pending".equalsIgnoreCase(order.getStatus()) && !"confirmed".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Đơn hàng đã được xử lý, không thể hủy.");
        }

        order.setStatus("cancelled");
        order.setCancelReason(reason != null && !reason.isBlank() ? reason : "Người dùng tự hủy");

        // Restore stock
        for (OrderItem item : order.getItems()) {
            Optional<Product> productOpt = productRepository.findById(item.getProductId());
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }

        Order updatedOrder = orderRepository.save(order);
        return mapToResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse confirmPayment(String email, String orderCode, String paymentMethod) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));

        // Verify customer ownership
        if (!order.getCustomer().getEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("Bạn không có quyền thao tác trên đơn hàng này.");
        }

        order.setStatus("confirmed");
        order.setPaymentStatus("paid");
        if (paymentMethod != null && !paymentMethod.isBlank()) {
            order.setPaymentMethod(paymentMethod);
        }

        Order updatedOrder = orderRepository.save(order);
        return mapToResponse(updatedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getFarmerOrders(String farmerEmail) {
        List<Order> orders = orderRepository.findByFarmerEmail(farmerEmail);
        return orders.stream()
                .map(order -> mapToFarmerResponse(order, farmerEmail))
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateFarmerOrderStatus(String farmerEmail, String orderCode, String newStatus, String reason) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));

        // Verify at least one item belongs to this farmer
        boolean belongsToFarmer = order.getItems().stream()
                .anyMatch(item -> item.getFarmer() != null && item.getFarmer().getEmail().equalsIgnoreCase(farmerEmail));
        if (!belongsToFarmer) {
            throw new RuntimeException("Bạn không có quyền cập nhật trạng thái đơn hàng này.");
        }

        String statusLower = newStatus.toLowerCase();
        if (!Arrays.asList("confirmed", "preparing", "shipping", "delivered", "rejected", "cancelled").contains(statusLower)) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + newStatus);
        }

        order.setStatus(statusLower);

        // If status is rejected or cancelled, and it wasn't already, restore stock for the farmer's items (or all items in the order, depending on the system design - restoring all is simpler since it's a single order)
        if ("rejected".equals(statusLower) || "cancelled".equals(statusLower)) {
            order.setCancelReason(reason != null && !reason.isBlank() ? reason : "Nhà vườn từ chối");
            for (OrderItem item : order.getItems()) {
                Optional<Product> productOpt = productRepository.findById(item.getProductId());
                if (productOpt.isPresent()) {
                    Product product = productOpt.get();
                    product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                    productRepository.save(product);
                }
            }
        }

        Order updatedOrder = orderRepository.save(order);
        return mapToFarmerResponse(updatedOrder, farmerEmail);
    }

    private OrderResponse mapToFarmerResponse(Order order, String farmerEmail) {
        OrderResponse base = mapToResponse(order);
        
        // Filter items only sold by this farmer
        List<OrderItemResponseDTO> filteredItems = order.getItems().stream()
                .filter(item -> item.getFarmer() != null && item.getFarmer().getEmail().equalsIgnoreCase(farmerEmail))
                .map(item -> OrderItemResponseDTO.builder()
                        .name(item.getProductName())
                        .farmer(item.getFarmer() != null ? item.getFarmer().getFullName() : "Nhà vườn địa phương")
                        .price(item.getProductPrice())
                        .qty(item.getQuantity())
                        .img(item.getImageUrl())
                        .build()
                ).collect(Collectors.toList());
        
        base.setItems(filteredItems);

        // Re-calculate subtotal & total amount specific to the farmer
        double subtotal = filteredItems.stream()
                .mapToDouble(item -> item.getPrice() * item.getQty())
                .sum();
        base.setSubtotal(subtotal);
        base.setAmount(subtotal); // Farmer gets their specific item total
        base.setItemCount(filteredItems.stream().mapToInt(OrderItemResponseDTO::getQty).sum());

        // Thumbnails
        List<String> thumbnails = filteredItems.stream()
                .map(OrderItemResponseDTO::getImg)
                .filter(img -> img != null && !img.isBlank())
                .limit(3)
                .collect(Collectors.toList());
        base.setThumbnails(thumbnails);
        base.setHasMoreItems(Math.max(0, filteredItems.size() - 3));

        return base;
    }

    private OrderResponse mapToResponse(Order order) {
        // Date time formatting
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd 'thg' MM, yyyy", new Locale("vi", "VN"));
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a", new Locale("vi", "VN"));

        String dateStr = order.getCreatedAt().format(dateFormatter);
        String timeStr = order.getCreatedAt().format(timeFormatter).replace("AM", "SA").replace("PM", "CH");

        // Status mapping
        String statusLabel = order.getStatus();
        switch (order.getStatus().toLowerCase()) {
            case "pending":
                statusLabel = "Chờ xử lý";
                break;
            case "confirmed":
                statusLabel = "Đã xác nhận";
                break;
            case "preparing":
                statusLabel = "Đang chuẩn bị";
                break;
            case "shipping":
                statusLabel = "Đang vận chuyển";
                break;
            case "delivered":
                statusLabel = "Đã giao";
                break;
            case "cancelled":
                statusLabel = "Đã hủy";
                break;
            case "rejected":
                statusLabel = "Đã từ chối";
                break;
        }

        // Provider mapping from first item
        OrderResponse.ProviderInfo providerInfo = null;
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            Farmer farmer = order.getItems().get(0).getFarmer();
            if (farmer != null) {
                String name = farmer.getFarmName() != null && !farmer.getFarmName().isBlank()
                        ? farmer.getFarmName() : farmer.getFullName();
                String location = farmer.getFarmAddress() != null && !farmer.getFarmAddress().isBlank()
                        ? farmer.getFarmAddress() : "Tiền Giang";
                int estYear = farmer.getCreatedAt() != null ? farmer.getCreatedAt().getYear() : 2018;
                String avatarText = name.substring(0, Math.min(name.length(), 2)).toUpperCase();
                
                // Color choices based on name length
                String[] colors = {"#1b5e20", "#0d47a1", "#e65100", "#004d40", "#3e2723", "#33691e"};
                String avatarBg = colors[Math.abs(name.hashCode()) % colors.length];

                providerInfo = OrderResponse.ProviderInfo.builder()
                        .name(name)
                        .location(location)
                        .estYear(estYear)
                        .avatarText(avatarText)
                        .avatarBg(avatarBg)
                        .build();
            }
        }

        // Map items
        List<OrderItemResponseDTO> itemsMapped = new ArrayList<>();
        if (order.getItems() != null) {
            itemsMapped = order.getItems().stream().map(item -> OrderItemResponseDTO.builder()
                    .name(item.getProductName())
                    .farmer(item.getFarmer() != null ? item.getFarmer().getFullName() : "Nhà vườn địa phương")
                    .price(item.getProductPrice())
                    .qty(item.getQuantity())
                    .img(item.getImageUrl())
                    .build()
            ).collect(Collectors.toList());
        }

        // Thumbnails
        List<String> thumbnails = itemsMapped.stream()
                .map(OrderItemResponseDTO::getImg)
                .filter(img -> img != null && !img.isBlank())
                .limit(3)
                .collect(Collectors.toList());

        int itemCount = order.getItems() != null ? order.getItems().stream().mapToInt(OrderItem::getQuantity).sum() : 0;
        int hasMoreItems = order.getItems() != null ? Math.max(0, order.getItems().size() - 3) : 0;

        return OrderResponse.builder()
                .id(order.getOrderCode())
                .status(order.getStatus())
                .statusLabel(statusLabel)
                .date(dateStr)
                .time(timeStr)
                .subtotal(order.getSubtotal())
                .shippingFee(order.getShippingFee())
                .serviceFee(order.getServiceFee())
                .discount(order.getDiscount())
                .amount(order.getAmount())
                .recipient(order.getRecipient())
                .address(order.getAddress())
                .phone(order.getPhone())
                .trackingNumber(order.getTrackingNumber())
                .cancelReason(order.getCancelReason())
                .customerAvatarUrl(order.getCustomer() != null ? order.getCustomer().getAvatarUrl() : null)
                .shippingNote(order.getShippingNote())
                .provider(providerInfo)
                .items(itemsMapped)
                .thumbnails(thumbnails)
                .itemCount(itemCount)
                .hasMoreItems(hasMoreItems)
                .build();
    }
}

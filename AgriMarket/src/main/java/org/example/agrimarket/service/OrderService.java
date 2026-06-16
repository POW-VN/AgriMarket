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
    private OrderGroupRepository orderGroupRepository;

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

    @Autowired
    private PartnerRepository partnerRepository;

    @Autowired
    private ProductReviewRepository productReviewRepository;

    @Transactional
    public OrderResponse createOrder(String email, OrderCreateRequest request) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin khách hàng."));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Đơn hàng phải có ít nhất một sản phẩm.");
        }

        // Generate group code
        String groupCode;
        Random random = new Random();
        do {
            groupCode = "OG-2026-" + (1000 + random.nextInt(9000));
        } while (orderGroupRepository.findByGroupCode(groupCode).isPresent());

        // Create OrderGroup
        OrderGroup orderGroup = new OrderGroup();
        orderGroup.setGroupCode(groupCode);
        orderGroup.setCustomer(customer);
        orderGroup.setTotalSubtotal(request.getSubtotal());
        orderGroup.setTotalShippingFee(request.getShippingFee());
        orderGroup.setTotalServiceFee(request.getServiceFee());
        orderGroup.setTotalDiscount(request.getDiscount());
        orderGroup.setGrandTotal(request.getAmount());
        orderGroup.setRecipientName(request.getRecipient());
        orderGroup.setRecipientPhone(request.getPhone());
        orderGroup.setDeliveryAddress(request.getAddress());
        orderGroup.setPaymentMethod(request.getPaymentMethod());
        orderGroup.setPaymentStatus("unpaid");

        orderGroup = orderGroupRepository.save(orderGroup);

        // Group items by Farmer
        Map<Farmer, List<OrderItemDraft>> farmerItemsMap = new HashMap<>();
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

            Farmer farmer = product.getFarmer();
            if (farmer == null) {
                throw new RuntimeException("Sản phẩm " + product.getName() + " không có thông tin nhà vườn.");
            }

            OrderItemDraft draft = new OrderItemDraft(product, itemReq.getQuantity(), imageUrl);
            farmerItemsMap.computeIfAbsent(farmer, k -> new ArrayList<>()).add(draft);
            orderedProductIds.add(product.getId());
        }

        // Proportional distribution totals
        double totalSubtotal = request.getSubtotal();
        double totalShippingFee = request.getShippingFee();
        double totalServiceFee = request.getServiceFee();
        double totalDiscount = request.getDiscount();

        List<Order> savedSubOrders = new ArrayList<>();
        int farmerIndex = 0;
        int numFarmers = farmerItemsMap.size();

        double allocatedShippingSum = 0;
        double allocatedServiceSum = 0;
        double allocatedDiscountSum = 0;

        for (Map.Entry<Farmer, List<OrderItemDraft>> entry : farmerItemsMap.entrySet()) {
            Farmer farmer = entry.getKey();
            List<OrderItemDraft> drafts = entry.getValue();

            double farmerSubtotal = 0;
            for (OrderItemDraft d : drafts) {
                farmerSubtotal += d.product.getPrice() * d.quantity;
            }

            double ratio = totalSubtotal > 0 ? (farmerSubtotal / totalSubtotal) : (1.0 / numFarmers);

            double shippingFee;
            double serviceFee;
            double discount;

            farmerIndex++;
            if (farmerIndex == numFarmers) {
                // Last farmer gets the remainder
                shippingFee = totalShippingFee - allocatedShippingSum;
                serviceFee = totalServiceFee - allocatedServiceSum;
                discount = totalDiscount - allocatedDiscountSum;
            } else {
                shippingFee = Math.round((ratio * totalShippingFee) * 100.0) / 100.0;
                serviceFee = Math.round((ratio * totalServiceFee) * 100.0) / 100.0;
                discount = Math.round((ratio * totalDiscount) * 100.0) / 100.0;

                allocatedShippingSum += shippingFee;
                allocatedServiceSum += serviceFee;
                allocatedDiscountSum += discount;
            }

            double amount = farmerSubtotal + shippingFee + serviceFee - discount;

            // Generate child order code
            String orderCode;
            do {
                orderCode = "FH-2026-" + (1000 + random.nextInt(9000));
            } while (orderRepository.findByOrderCode(orderCode).isPresent());

            Order order = new Order();
            order.setOrderCode(orderCode);
            order.setOrderGroup(orderGroup);
            order.setFarmer(farmer);
            order.setCustomer(customer);
            order.setShippingNote(request.getShippingNote());
            order.setPaymentStatus("unpaid");
            order.setStatus("pending");
            order.setSubtotal(farmerSubtotal);
            order.setShippingFee(shippingFee);
            order.setServiceFee(serviceFee);
            order.setDiscount(discount);
            order.setAmount(amount);
            order.setTrackingNumber("FH-TRACK-" + (100000 + random.nextInt(900000)));

            List<OrderItem> orderItems = new ArrayList<>();
            for (OrderItemDraft d : drafts) {
                OrderItem item = new OrderItem();
                item.setOrder(order);
                item.setProductId(d.product.getId());
                item.setProductName(d.product.getName());
                item.setProductPrice(d.product.getPrice());
                item.setProductUnit(d.product.getUnit());
                item.setImageUrl(d.imageUrl);
                item.setQuantity(d.quantity);
                item.setFarmer(farmer);
                orderItems.add(item);
            }

            order.setItems(orderItems);
            Order savedOrder = orderRepository.save(order);
            savedSubOrders.add(savedOrder);
        }

        orderGroup.getSubOrders().clear();
        orderGroup.getSubOrders().addAll(savedSubOrders);

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

        return mapGroupToResponse(orderGroup);
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

        // Verify customer owns the order OR partner is assigned
        boolean isCustomer = order.getCustomer().getEmail().equalsIgnoreCase(email);
        boolean isPartner = order.getPartner() != null && order.getPartner().getEmail().equalsIgnoreCase(email);
        if (!isCustomer && !isPartner) {
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

        if (!"pending".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Đơn hàng đã được xử lý (hoặc đang chuẩn bị), không thể hủy.");
        }

        order.setStatus("cancelled");
        order.setCancelReason(reason != null && !reason.isBlank() ? reason : "Người dùng tự hủy");
        order.setCancelBy("customer");
        order.setCancelledAt(LocalDateTime.now());

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
        // Check if it is a group payment confirmation
        Optional<OrderGroup> groupOpt = orderGroupRepository.findByGroupCode(orderCode);
        if (groupOpt.isPresent()) {
            OrderGroup group = groupOpt.get();
            if (!group.getCustomer().getEmail().equalsIgnoreCase(email)) {
                throw new RuntimeException("Bạn không có quyền thao tác trên đơn hàng này.");
            }

            group.setPaymentStatus("paid");
            if (paymentMethod != null && !paymentMethod.isBlank()) {
                group.setPaymentMethod(paymentMethod);
            }

            if (group.getSubOrders() != null) {
                for (Order order : group.getSubOrders()) {
                    order.setStatus("pending");
                    order.setPaymentStatus("paid");
                    orderRepository.save(order);
                }
            }

            OrderGroup savedGroup = orderGroupRepository.save(group);
            return mapGroupToResponse(savedGroup);
        }

        // Otherwise fallback to individual order confirmation
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng hoặc nhóm đơn hàng."));

        // Verify customer ownership
        if (!order.getCustomer().getEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("Bạn không có quyền thao tác trên đơn hàng này.");
        }

        order.setStatus("pending");
        order.setPaymentStatus("paid");
        if (paymentMethod != null && !paymentMethod.isBlank() && order.getOrderGroup() != null) {
            order.getOrderGroup().setPaymentMethod(paymentMethod);
            orderGroupRepository.save(order.getOrderGroup());
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
    public OrderResponse updateFarmerOrderStatus(String farmerEmail, String orderCode, String newStatus,
            String reason) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));

        // Verify this order belongs to the farmer
        if (order.getFarmer() == null || !order.getFarmer().getEmail().equalsIgnoreCase(farmerEmail)) {
            throw new RuntimeException("Bạn không có quyền cập nhật trạng thái đơn hàng này.");
        }

        String currentStatus = order.getStatus().toLowerCase();
        if (!"pending".equals(currentStatus) && !"preparing".equals(currentStatus)) {
            throw new RuntimeException("Đơn hàng đã ở trạng thái '" + order.getStatus() + "', nhà vườn không thể thao tác nữa.");
        }

        String statusLower = newStatus.toLowerCase();
        if ("pending".equals(currentStatus)) {
            if (!"preparing".equals(statusLower) && !"rejected".equals(statusLower)) {
                throw new RuntimeException("Chờ xác nhận: Nhà vườn chỉ có thể xác nhận đơn (Đang chuẩn bị) hoặc từ chối đơn.");
            }
        } else if ("preparing".equals(currentStatus)) {
            if (!"confirmed".equals(statusLower) && !"rejected".equals(statusLower)) {
                throw new RuntimeException("Đang chuẩn bị: Nhà vườn chỉ có thể hoàn thành chuẩn bị (Chờ lấy hàng) hoặc từ chối đơn.");
            }
        }

        order.setStatus(statusLower);

        // If status is rejected or cancelled, and it wasn't already, restore stock for
        // the farmer's items (or all items in the order, depending on the system design
        // - restoring all is simpler since it's a single order)
        if ("rejected".equals(statusLower) || "cancelled".equals(statusLower)) {
            order.setCancelReason(reason != null && !reason.isBlank() ? reason : "Nhà vườn từ chối");
            order.setCancelBy("farmer");
            order.setCancelledAt(LocalDateTime.now());
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
                .map(item -> {
                    boolean isReviewed = productReviewRepository.findByOrderIdAndProductIdAndCustomerId(
                            order.getId(), item.getProductId(), order.getCustomer().getId()).isPresent();
                    return OrderItemResponseDTO.builder()
                            .productId(item.getProductId())
                            .farmerId(item.getFarmer() != null ? item.getFarmer().getId() : null)
                            .name(item.getProductName())
                            .farmer(item.getFarmer() != null ? item.getFarmer().getFullName() : "Nhà vườn địa phương")
                            .price(item.getProductPrice())
                            .qty(item.getQuantity())
                            .img(item.getImageUrl())
                            .isReviewed(isReviewed)
                            .build();
                })
                .collect(Collectors.toList());

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
                statusLabel = "Chờ xác nhận";
                break;
            case "preparing":
                statusLabel = "Đang chuẩn bị";
                break;
            case "confirmed":
                statusLabel = "Chờ lấy hàng";
                break;
            case "shipping":
                statusLabel = "Chờ giao hàng";
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

        // Provider mapping from farmer directly or first item as fallback
        OrderResponse.ProviderInfo providerInfo = null;
        Farmer farmer = order.getFarmer();
        if (farmer == null && order.getItems() != null && !order.getItems().isEmpty()) {
            farmer = order.getItems().get(0).getFarmer();
        }
        if (farmer != null) {
                String name = farmer.getFarmName() != null && !farmer.getFarmName().isBlank()
                        ? farmer.getFarmName()
                        : farmer.getFullName();
                String location = farmer.getFarmAddress() != null && !farmer.getFarmAddress().isBlank()
                        ? farmer.getFarmAddress()
                        : "Tiền Giang";
                int estYear = farmer.getCreatedAt() != null ? farmer.getCreatedAt().getYear() : 2018;
                String avatarText = name.substring(0, Math.min(name.length(), 2)).toUpperCase();

                // Color choices based on name length
                String[] colors = { "#1b5e20", "#0d47a1", "#e65100", "#004d40", "#3e2723", "#33691e" };
                String avatarBg = colors[Math.abs(name.hashCode()) % colors.length];

                providerInfo = OrderResponse.ProviderInfo.builder()
                        .name(name)
                        .location(location)
                        .phone(farmer.getPhone())
                        .estYear(estYear)
                        .avatarText(avatarText)
                        .avatarBg(avatarBg)
                        .avatarUrl(farmer.getAvatarUrl())
                        .build();
        }

        // Map items
        List<OrderItemResponseDTO> itemsMapped = new ArrayList<>();
        if (order.getItems() != null) {
            itemsMapped = order.getItems().stream().map(item -> {
                boolean isReviewed = productReviewRepository.findByOrderIdAndProductIdAndCustomerId(
                        order.getId(), item.getProductId(), order.getCustomer().getId()).isPresent();
                return OrderItemResponseDTO.builder()
                        .productId(item.getProductId())
                        .farmerId(item.getFarmer() != null ? item.getFarmer().getId() : null)
                        .name(item.getProductName())
                        .farmer(item.getFarmer() != null ? item.getFarmer().getFullName() : "Nhà vườn địa phương")
                        .price(item.getProductPrice())
                        .qty(item.getQuantity())
                        .img(item.getImageUrl())
                        .isReviewed(isReviewed)
                        .build();
            }).collect(Collectors.toList());
        }

        // Thumbnails
        List<String> thumbnails = itemsMapped.stream()
                .map(OrderItemResponseDTO::getImg)
                .filter(img -> img != null && !img.isBlank())
                .limit(3)
                .collect(Collectors.toList());

        int itemCount = order.getItems() != null ? order.getItems().stream().mapToInt(OrderItem::getQuantity).sum() : 0;
        int hasMoreItems = order.getItems() != null ? Math.max(0, order.getItems().size() - 3) : 0;

        // Build driverInfo if driver has been assigned
        OrderResponse.DriverInfo driverInfo = null;
        if (order.getDriverName() != null && !order.getDriverName().isBlank()) {
            driverInfo = OrderResponse.DriverInfo.builder()
                    .driverName(order.getDriverName())
                    .driverCode(order.getDriverCode())
                    .driverPhone(order.getDriverPhone())
                    .vehicleType(order.getVehicleType())
                    .licensePlate(order.getLicensePlate())
                    .build();
        }

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
                .recipient(order.getOrderGroup() != null ? order.getOrderGroup().getRecipientName() : "")
                .address(order.getOrderGroup() != null ? order.getOrderGroup().getDeliveryAddress() : "")
                .phone(order.getOrderGroup() != null ? order.getOrderGroup().getRecipientPhone() : "")
                .trackingNumber(order.getTrackingNumber())
                .cancelReason(order.getCancelReason())
                .cancelBy(order.getCancelBy())
                .cancelledAt(order.getCancelledAt())
                .customerAvatarUrl(order.getCustomer() != null ? order.getCustomer().getAvatarUrl() : null)
                .shippingNote(order.getShippingNote())
                .provider(providerInfo)
                .partner(order.getPartner() != null ? OrderResponse.PartnerInfo.builder()
                        .id(order.getPartner().getId())
                        .fullName(order.getPartner().getFullName())
                        .email(order.getPartner().getEmail())
                        .phone(order.getPartner().getPhone())
                        .avatarUrl(order.getPartner().getAvatarUrl())
                        .build() : null)
                .shipperNotes(order.getShipperNotes())
                .podPhoto(order.getPodPhoto())
                .detailedStatus(order.getDetailedStatus())
                .driverInfo(driverInfo)
                .items(itemsMapped)
                .thumbnails(thumbnails)
                .itemCount(itemCount)
                .hasMoreItems(hasMoreItems)
                .paymentMethod(order.getOrderGroup() != null ? order.getOrderGroup().getPaymentMethod() : "")
                .paymentStatus(order.getPaymentStatus())
                .build();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        orders.sort((o1, o2) -> {
            if (o1.getCreatedAt() == null && o2.getCreatedAt() == null)
                return 0;
            if (o1.getCreatedAt() == null)
                return 1;
            if (o2.getCreatedAt() == null)
                return -1;
            return o2.getCreatedAt().compareTo(o1.getCreatedAt());
        });
        return orders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrderStatusByAdmin(String orderCode, String newStatus, String paymentStatus,
            String reason) {
        throw new RuntimeException("Quản trị viên không có quyền can thiệp vào các đơn hàng.");
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getShipperRequests(String email) {
        List<Order> orders = orderRepository.findAvailableShipperRequests();
        return orders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getShipperAccepted(String email) {
        List<Order> orders = orderRepository.findByPartnerEmailOrderByCreatedAtDesc(email);
        return orders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse acceptShipperRequest(String email, String orderCode, Map<String, String> driverInfo) {
        Partner partner = partnerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đối tác vận chuyển."));

        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));

        if (order.getPartner() != null) {
            throw new RuntimeException("Đơn hàng này đã được một tài xế khác chấp nhận.");
        }

        order.setPartner(partner);
        order.setStatus("shipping");
        order.setDetailedStatus("assigned");

        // Save driver assignment info
        if (driverInfo != null) {
            if (driverInfo.get("driverName") != null) order.setDriverName(driverInfo.get("driverName"));
            if (driverInfo.get("driverCode") != null) order.setDriverCode(driverInfo.get("driverCode"));
            if (driverInfo.get("driverPhone") != null) order.setDriverPhone(driverInfo.get("driverPhone"));
            if (driverInfo.get("vehicleType") != null) order.setVehicleType(driverInfo.get("vehicleType"));
            if (driverInfo.get("licensePlate") != null) order.setLicensePlate(driverInfo.get("licensePlate"));
        }

        Order updatedOrder = orderRepository.save(order);
        return mapToResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse rejectShipperRequest(String email, String orderCode, String reason) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));
        order.setStatus("rejected");
        order.setCancelReason(reason != null && !reason.isBlank() ? reason : "Đối tác vận chuyển từ chối");
        order.setCancelBy("partner");
        order.setCancelledAt(LocalDateTime.now());
        Order updatedOrder = orderRepository.save(order);
        return mapToResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse updateShipperOrderStatus(String email, String orderCode, String newDetailedStatus,
            String notes, String podPhoto) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng."));

        if (order.getPartner() == null || !order.getPartner().getEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("Bạn không có quyền cập nhật trạng thái đơn hàng này.");
        }

        order.setDetailedStatus(newDetailedStatus);
        order.setShipperNotes(notes);
        if (podPhoto != null && !podPhoto.isBlank()) {
            order.setPodPhoto(podPhoto);
        }

        if ("delivered".equalsIgnoreCase(newDetailedStatus)) {
            order.setStatus("delivered");
            order.setPaymentStatus("paid");
        } else {
            order.setStatus("shipping");
        }

        Order updatedOrder = orderRepository.save(order);
        return mapToResponse(updatedOrder);
    }

    private OrderResponse mapGroupToResponse(OrderGroup group) {
        // Date time formatting
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd 'thg' MM, yyyy", new Locale("vi", "VN"));
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a", new Locale("vi", "VN"));

        String dateStr = group.getCreatedAt().format(dateFormatter);
        String timeStr = group.getCreatedAt().format(timeFormatter).replace("AM", "SA").replace("PM", "CH");

        String statusLabel = "Chờ xác nhận";

        // Provider mapping from first sub-order
        OrderResponse.ProviderInfo providerInfo = null;
        if (group.getSubOrders() != null && !group.getSubOrders().isEmpty()) {
            Farmer farmer = group.getSubOrders().get(0).getFarmer();
            if (farmer != null) {
                String name = farmer.getFarmName() != null && !farmer.getFarmName().isBlank()
                        ? farmer.getFarmName()
                        : farmer.getFullName();
                String location = farmer.getFarmAddress() != null && !farmer.getFarmAddress().isBlank()
                        ? farmer.getFarmAddress()
                        : "Tiền Giang";
                int estYear = farmer.getCreatedAt() != null ? farmer.getCreatedAt().getYear() : 2018;
                String avatarText = name.substring(0, Math.min(name.length(), 2)).toUpperCase();

                String[] colors = { "#1b5e20", "#0d47a1", "#e65100", "#004d40", "#3e2723", "#33691e" };
                String avatarBg = colors[Math.abs(name.hashCode()) % colors.length];

                providerInfo = OrderResponse.ProviderInfo.builder()
                        .name(name)
                        .location(location)
                        .phone(farmer.getPhone())
                        .estYear(estYear)
                        .avatarText(avatarText)
                        .avatarBg(avatarBg)
                        .avatarUrl(farmer.getAvatarUrl())
                        .build();
            }
        }

        // Map items from all sub-orders
        List<OrderItemResponseDTO> itemsMapped = new ArrayList<>();
        if (group.getSubOrders() != null) {
            for (Order subOrder : group.getSubOrders()) {
                if (subOrder.getItems() != null) {
                    for (OrderItem item : subOrder.getItems()) {
                        boolean isReviewed = productReviewRepository.findByOrderIdAndProductIdAndCustomerId(
                                subOrder.getId(), item.getProductId(), group.getCustomer().getId()).isPresent();
                        itemsMapped.add(OrderItemResponseDTO.builder()
                                .productId(item.getProductId())
                                .farmerId(item.getFarmer() != null ? item.getFarmer().getId() : null)
                                .name(item.getProductName())
                                .farmer(item.getFarmer() != null ? item.getFarmer().getFullName() : "Nhà vườn địa phương")
                                .price(item.getProductPrice())
                                .qty(item.getQuantity())
                                .img(item.getImageUrl())
                                .isReviewed(isReviewed)
                                .build());
                    }
                }
            }
        }

        List<String> thumbnails = itemsMapped.stream()
                .map(OrderItemResponseDTO::getImg)
                .filter(img -> img != null && !img.isBlank())
                .limit(3)
                .collect(Collectors.toList());

        int itemCount = itemsMapped.stream().mapToInt(OrderItemResponseDTO::getQty).sum();
        int hasMoreItems = Math.max(0, itemsMapped.size() - 3);

        String trackingNumber = "";
        if (group.getSubOrders() != null && !group.getSubOrders().isEmpty()) {
            trackingNumber = group.getSubOrders().get(0).getTrackingNumber();
        }

        return OrderResponse.builder()
                .id(group.getGroupCode())
                .status("pending")
                .statusLabel(statusLabel)
                .date(dateStr)
                .time(timeStr)
                .subtotal(group.getTotalSubtotal())
                .shippingFee(group.getTotalShippingFee())
                .serviceFee(group.getTotalServiceFee())
                .discount(group.getTotalDiscount())
                .amount(group.getGrandTotal())
                .recipient(group.getRecipientName())
                .address(group.getDeliveryAddress())
                .phone(group.getRecipientPhone())
                .trackingNumber(trackingNumber)
                .paymentMethod(group.getPaymentMethod())
                .paymentStatus(group.getPaymentStatus())
                .provider(providerInfo)
                .items(itemsMapped)
                .thumbnails(thumbnails)
                .itemCount(itemCount)
                .hasMoreItems(hasMoreItems)
                .build();
    }

    private static class OrderItemDraft {
        final Product product;
        final int quantity;
        final String imageUrl;

        OrderItemDraft(Product product, int quantity, String imageUrl) {
            this.product = product;
            this.quantity = quantity;
            this.imageUrl = imageUrl;
        }
    }
}

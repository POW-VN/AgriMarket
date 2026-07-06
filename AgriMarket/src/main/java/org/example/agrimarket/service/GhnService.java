package org.example.agrimarket.service;

import org.example.agrimarket.model.Order;
import org.example.agrimarket.model.OrderItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GhnService {

    @Value("${ghn.api.token:}")
    private String ghnToken;

    @Value("${ghn.api.shopid:}")
    private String ghnShopId;

    @Value("${ghn.api.url:https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create}")
    private String ghnUrl;

    @Value("${ghn.simulation.enabled:true}")
    private boolean simulationEnabled;

    private final RestTemplate restTemplate = new RestTemplate();

    public void createShipment(Order order) {
        if (simulationEnabled) {
            applySimulation(order, "Chạy chế độ giả lập GiaoHangNhanh.");
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Token", ghnToken);
            headers.set("ShopId", ghnShopId);

            Map<String, Object> body = new HashMap<>();
            body.put("payment_type_id", 2); // Buyer pays shipping (COD)
            body.put("note", order.getShippingNote() != null ? order.getShippingNote() : "Giao hàng nông sản");
            body.put("required_note", "CHOXEMHANGKHONGTHU");
            String fromAddr = order.getFarmer().getFarmAddress();
            if (fromAddr == null || fromAddr.isBlank()) {
                fromAddr = "Tiền Giang, Việt Nam";
            }
            String[] fromComponents = parseAddressComponents(fromAddr, "Phường 1", "Thành Phố Mỹ Tho", "Tiền Giang");

            body.put("from_name", order.getFarmer().getFarmName() != null ? order.getFarmer().getFarmName() : order.getFarmer().getFullName());
            String farmPhone = order.getFarmer().getPhone();
            if (farmPhone == null || farmPhone.isBlank()) {
                farmPhone = "0946189176";
            }
            body.put("from_phone", farmPhone);
            body.put("from_address", fromAddr);
            body.put("from_ward_name", fromComponents[0]);
            body.put("from_district_name", fromComponents[1]);
            body.put("from_province_name", fromComponents[2]);

            String toAddr = (order.getOrderGroup() != null) ? order.getOrderGroup().getDeliveryAddress() : "Hồ Chí Minh, Việt Nam";
            String[] toComponents = parseAddressComponents(toAddr, "Phường 1", "Quận 1", "Hồ Chí Minh");

            body.put("to_name", order.getOrderGroup() != null ? order.getOrderGroup().getRecipientName() : "Khách hàng");
            body.put("to_phone", order.getOrderGroup() != null ? order.getOrderGroup().getRecipientPhone() : "0946189176");
            body.put("to_address", toAddr);
            body.put("to_ward_name", toComponents[0]);
            body.put("to_district_name", toComponents[1]);
            body.put("to_province_name", toComponents[2]);

            body.put("weight", 1000); // 1kg default
            body.put("length", 15);
            body.put("width", 15);
            body.put("height", 15);
            body.put("service_type_id", 2); // E-commerce delivery

            List<Map<String, Object>> items = new ArrayList<>();
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("name", item.getProductName());
                    itemMap.put("code", String.valueOf(item.getProductId()));
                    itemMap.put("quantity", item.getQuantity());
                    items.add(itemMap);
                }
            } else {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("name", "Nông sản sạch");
                itemMap.put("code", "NS01");
                itemMap.put("quantity", 1);
                items.add(itemMap);
            }
            body.put("items", items);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(ghnUrl, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map responseBody = response.getBody();
                if (responseBody.containsKey("data")) {
                    Map data = (Map) responseBody.get("data");
                    if (data != null && data.containsKey("order_code")) {
                        String orderCode = (String) data.get("order_code");
                        order.setTrackingNumber(orderCode);
                        order.setDetailedStatus("assigned");
                        order.setStatus("shipping");
                        order.setDriverName("Nguyễn Văn Hùng (GiaoHangNhanh)");
                        order.setDriverPhone("0946189176");
                        order.setVehicleType("Xe máy");
                        order.setLicensePlate("29-G1 567.89");
                        order.setShipperNotes("GHN Sandbox: Tạo đơn thành công. Đã gán tài xế đến lấy hàng.");
                        return;
                    }
                }
            }
            // Fallback if structure is unexpected
            applySimulation(order, "GHN API trả về phản hồi không mong muốn. Tự động chuyển sang chế độ giả lập.");
        } catch (Exception e) {
            System.err.println("Lỗi khi kết nối API GHN Sandbox: " + e.getMessage());
            applySimulation(order, "Lỗi kết nối GHN API. Hệ thống tự động kích hoạt bộ giả lập.");
        }
    }

    private void applySimulation(Order order, String reason) {
        String trackingNum = "GHN" + (100000000 + new Random().nextInt(900000000));
        order.setTrackingNumber(trackingNum);
        order.setDetailedStatus("assigned");
        order.setStatus("shipping");
        order.setDriverName("Nguyễn Văn Hùng (GiaoHangNhanh)");
        order.setDriverPhone("0946189176");
        order.setVehicleType("Xe máy");
        order.setLicensePlate("29-G1 567.89");
        order.setShipperNotes("GHN Sandbox (Giả lập): " + reason + " Đã điều phối tài xế.");
    }

    private String[] parseAddressComponents(String fullAddress, String defaultWard, String defaultDistrict, String defaultProvince) {
        if (fullAddress == null || fullAddress.isBlank()) {
            return new String[]{defaultWard, defaultDistrict, defaultProvince};
        }
        String[] parts = fullAddress.split(",");
        if (parts.length >= 3) {
            String province = parts[parts.length - 1].trim();
            String district = parts[parts.length - 2].trim();
            String ward = parts[parts.length - 3].trim();
            return new String[]{ward, district, province};
        }
        return new String[]{defaultWard, defaultDistrict, defaultProvince};
    }
}

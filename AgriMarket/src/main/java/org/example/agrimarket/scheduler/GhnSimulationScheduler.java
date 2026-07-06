package org.example.agrimarket.scheduler;

import org.example.agrimarket.model.Order;
import org.example.agrimarket.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class GhnSimulationScheduler {

    @Autowired
    private OrderRepository orderRepository;

    @Scheduled(fixedRate = 20000) // Runs every 20 seconds
    public void simulateShippingProgress() {
        try {
            List<Order> shippingOrders = orderRepository.findAll().stream()
                    .filter(order -> "shipping".equalsIgnoreCase(order.getStatus()))
                    .collect(Collectors.toList());

            for (Order order : shippingOrders) {
                String currentDetail = order.getDetailedStatus();
                if (currentDetail == null || "assigned".equalsIgnoreCase(currentDetail)) {
                    order.setDetailedStatus("picked_up");
                    order.setShipperNotes("GiaoHangNhanh: Nhân viên GHN đã đến lấy hàng từ nhà vườn thành công.");
                    orderRepository.save(order);
                    System.out.println("GHN Simulator: Order " + order.getOrderCode() + " transitioned to picked_up.");
                } else if ("picked_up".equalsIgnoreCase(currentDetail)) {
                    order.setDetailedStatus("in_transit");
                    order.setShipperNotes("GiaoHangNhanh: Đơn hàng đang được trung chuyển giữa các kho GHN.");
                    orderRepository.save(order);
                    System.out.println("GHN Simulator: Order " + order.getOrderCode() + " transitioned to in_transit.");
                } else if ("in_transit".equalsIgnoreCase(currentDetail)) {
                    order.setDetailedStatus("delivered");
                    order.setStatus("delivered");
                    order.setPaymentStatus("paid");
                    order.setShipperNotes("GiaoHangNhanh: Giao hàng thành công. Người mua đã nhận hàng và hoàn tất thanh toán COD.");
                    order.setPodPhoto("https://images.unsplash.com/photo-1551829142-d9b812de399c?w=400"); // Mock POD photo
                    orderRepository.save(order);
                    System.out.println("GHN Simulator: Order " + order.getOrderCode() + " transitioned to delivered (completed).");
                }
            }
        } catch (Exception e) {
            System.err.println("Lỗi trong GHN Simulation Scheduler: " + e.getMessage());
        }
    }
}

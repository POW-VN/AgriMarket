package org.example.agrimarket.repository;

import org.example.agrimarket.model.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = {"items", "customer", "farmer", "orderGroup"})
    List<Order> findByCustomerEmailOrderByCreatedAtDesc(String email);

    @EntityGraph(attributePaths = {"items", "customer", "farmer", "orderGroup"})
    Optional<Order> findByOrderCode(String orderCode);

    @EntityGraph(attributePaths = {"items", "customer", "farmer", "orderGroup"})
    @Query("SELECT o FROM Order o WHERE o.farmer.email = :farmerEmail ORDER BY o.createdAt DESC")
    List<Order> findByFarmerEmail(@Param("farmerEmail") String farmerEmail);

    @Override
    @EntityGraph(attributePaths = {"items", "customer", "farmer", "orderGroup"})
    List<Order> findAll();

    @EntityGraph(attributePaths = {"items", "customer", "farmer", "orderGroup"})
    List<Order> findByStatusIgnoreCase(String status);

    long countByCustomerIdAndStatus(Long customerId, String status);

    /**
     * Tìm các đơn hàng ở trạng thái 'awaiting_payment' được tạo trước thời điểm cutoff.
     * Dùng để dọn dẹp các đơn VNPay bị bỏ rơi (customer không hoàn thành thanh toán).
     */
    @EntityGraph(attributePaths = {"items", "customer", "farmer", "orderGroup"})
    @Query("SELECT o FROM Order o WHERE LOWER(o.status) = 'awaiting_payment' AND o.createdAt < :cutoff")
    List<Order> findAbandonedAwaitingPaymentOrders(@Param("cutoff") LocalDateTime cutoff);
}

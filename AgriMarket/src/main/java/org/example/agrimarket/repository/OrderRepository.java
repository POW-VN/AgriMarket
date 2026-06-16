package org.example.agrimarket.repository;

import org.example.agrimarket.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerEmailOrderByCreatedAtDesc(String email);
    Optional<Order> findByOrderCode(String orderCode);

    @Query("SELECT o FROM Order o WHERE o.farmer.email = :farmerEmail ORDER BY o.createdAt DESC")
    List<Order> findByFarmerEmail(@Param("farmerEmail") String farmerEmail);

    @Query("SELECT o FROM Order o WHERE o.partner IS NULL AND o.status = 'confirmed' ORDER BY o.createdAt DESC")
    List<Order> findAvailableShipperRequests();

    @Query("SELECT o FROM Order o WHERE o.partner.email = :email ORDER BY o.createdAt DESC")
    List<Order> findByPartnerEmailOrderByCreatedAtDesc(@Param("email") String email);
}


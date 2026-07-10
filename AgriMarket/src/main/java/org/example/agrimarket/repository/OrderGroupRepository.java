package org.example.agrimarket.repository;

import org.example.agrimarket.model.OrderGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderGroupRepository extends JpaRepository<OrderGroup, Long> {
    List<OrderGroup> findByCustomerEmailOrderByCreatedAtDesc(String email);
    Optional<OrderGroup> findByGroupCode(String groupCode);
    
    long countByCustomerIdAndAppliedPromoCode(Long customerId, String appliedPromoCode);

    @org.springframework.data.jpa.repository.Query("SELECT og.appliedPromoCode FROM OrderGroup og WHERE og.customer.id = :customerId")
    List<String> findAppliedPromoCodesByCustomerId(@org.springframework.data.repository.query.Param("customerId") Long customerId);
}

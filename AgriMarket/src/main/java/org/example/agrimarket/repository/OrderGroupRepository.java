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
}

package org.example.agrimarket.repository;

import org.example.agrimarket.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    List<Product> findByFarmerEmailOrderByCreatedAtDesc(String email);
}

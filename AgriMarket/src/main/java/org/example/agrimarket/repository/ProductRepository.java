package org.example.agrimarket.repository;

import org.example.agrimarket.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    List<Product> findByFarmerEmailOrderByCreatedAtDesc(String email);
    List<Product> findByStatusOrderByCreatedAtDesc(String status);

    @Query("SELECT p FROM Product p WHERE p.status = 'approved' AND p.farmer.verificationStatus = 'verified' AND p.farmer.status = 'active' ORDER BY p.createdAt DESC")
    List<Product> findApprovedProductsFromVerifiedFarmers();
}

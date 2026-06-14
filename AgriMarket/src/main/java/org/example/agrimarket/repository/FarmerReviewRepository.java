package org.example.agrimarket.repository;

import org.example.agrimarket.model.FarmerReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FarmerReviewRepository extends JpaRepository<FarmerReview, Long> {
    Optional<FarmerReview> findByFarmerIdAndCustomerIdAndOrderId(Long farmerId, Long customerId, Long orderId);

    @Query("SELECT AVG(fr.rating) FROM FarmerReview fr WHERE fr.farmer.id = :farmerId")
    Double getAverageRatingByFarmerId(@Param("farmerId") Long farmerId);
}

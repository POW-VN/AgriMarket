package org.example.agrimarket.repository;

import org.example.agrimarket.model.SupportRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportRequestRepository extends JpaRepository<SupportRequest, Long> {
    List<SupportRequest> findBySenderIdOrderByCreatedAtDesc(Long senderId);
    List<SupportRequest> findBySenderIdAndStatusOrderByCreatedAtDesc(Long senderId, String status);
    List<SupportRequest> findAllByOrderByCreatedAtDesc();
    List<SupportRequest> findByStatusOrderByCreatedAtDesc(String status);
}

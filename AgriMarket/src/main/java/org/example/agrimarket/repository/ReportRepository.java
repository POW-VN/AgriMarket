package org.example.agrimarket.repository;

import org.example.agrimarket.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByReporterIdOrderByCreatedAtDesc(Long reporterId);
    List<Report> findByReporterIdAndStatusOrderByCreatedAtDesc(Long reporterId, String status);
    List<Report> findAllByOrderByCreatedAtDesc();
    List<Report> findByStatusOrderByCreatedAtDesc(String status);
    List<Report> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(String targetType, Long targetId);
}

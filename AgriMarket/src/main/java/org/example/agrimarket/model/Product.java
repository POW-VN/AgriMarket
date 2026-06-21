package org.example.agrimarket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "product")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, columnDefinition = "nvarchar(255)")
    private String name;

    @Column(columnDefinition = "nvarchar(max)")
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(columnDefinition = "nvarchar(255)")
    private String unit;

    private String status; // draft, pending, approved, rejected, hidden, sold_out

    @Column(name = "harvest_date")
    private LocalDate harvestDate;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Column(name = "is_organic")
    private Boolean isOrganic = false;


    @Column(name = "traceability_image_url", length = 1000)
    private String traceabilityImageUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "rejection_reason", columnDefinition = "nvarchar(max)")
    private String rejectionReason;

    @Column(name = "admin_notes", columnDefinition = "nvarchar(max)")
    private String adminNotes;

    @Column(name = "perishability")
    private String perishability;

    @Column(name = "limit_distance")
    private Double limitDistance;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "draft";
        }
    }
}

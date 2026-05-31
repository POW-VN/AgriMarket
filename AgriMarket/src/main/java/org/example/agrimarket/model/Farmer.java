package org.example.agrimarket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "farmer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Farmer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Transient
    private String role = "farmer";

    @Column(name = "full_name")
    private String fullName;
    
    private String email;
    private String phone;
    private String password;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    @Column(name = "farm_name")
    private String farmName;
    
    @Column(name = "farm_address")
    private String farmAddress;
    
    private String description;
    
    @Column(name = "verification_status")
    private String verificationStatus; // pending, verified, rejected
    
    @Column(name = "rating_average")
    private Double ratingAverage;
    
    @Column(name = "total_products")
    private Integer totalProducts;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    private String status; // active, banned, pending
}


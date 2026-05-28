package org.example.agrimarket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "farmers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Farmer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String email;
    private String phone;
    private String password;
    private String avatarUrl;
    private String farmName;
    private String farmAddress;
    private String description;
    private String verificationStatus; // pending, verified, rejected
    private Double ratingAverage;
    private Integer totalProducts;
    private LocalDateTime createdAt;
    private String status; // active, banned, pending
}


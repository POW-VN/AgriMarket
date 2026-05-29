package org.example.agrimarket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Customer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name")
    private String fullName;
    
    @Column(name = "email", unique = true, nullable = false)
    private String email;
    
    @Column(name = "phone", unique = true)
    private String phone;
    
    private String password;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    private String status; // active, banned, pending
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Quan hệ 1-nhiều với CustomerAddress
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<CustomerAddress> addresses;
}

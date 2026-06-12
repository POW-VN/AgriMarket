package org.example.agrimarket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "partner")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Partner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Transient
    private String role = "partner";

    @Column(name = "full_name", columnDefinition = "nvarchar(255)")
    private String fullName;
    
    private String email;
    private String phone;
    private String password;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    private String status; // active, suspended, pending
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

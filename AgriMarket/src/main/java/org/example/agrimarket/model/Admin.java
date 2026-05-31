package org.example.agrimarket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Admin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Transient
    private String role = "admin";

    @Column(name = "full_name")
    private String fullName;
    
    private String email;
    private String password;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    @Column(name = "create_at")
    private LocalDateTime createdAt;
}

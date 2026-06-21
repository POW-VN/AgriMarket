package org.example.agrimarket.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "customer_address")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAddress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receiver_name", columnDefinition = "nvarchar(255)")
    private String receiverName;
    
    private String phone;
    
    @Column(columnDefinition = "nvarchar(1000)")
    private String address;
    
    @Column(name = "is_default")
    private Boolean isDefault;

    private Double latitude;
    private Double longitude;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    @JsonIgnore
    private Customer customer;
}

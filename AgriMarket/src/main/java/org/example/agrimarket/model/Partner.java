package org.example.agrimarket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "partner")
@PrimaryKeyJoinColumn(name = "id")
@DiscriminatorValue("SHIPPER")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Partner extends User {

    @Transient
    private String role = "partner";
}

package org.example.agrimarket.repository;

import org.example.agrimarket.model.Partner;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PartnerRepository extends JpaRepository<Partner, Long> {
    Optional<Partner> findByEmail(String email);
    Optional<Partner> findByPhone(String phone);
}

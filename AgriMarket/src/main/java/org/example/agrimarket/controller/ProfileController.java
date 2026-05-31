package org.example.agrimarket.controller;

import org.example.agrimarket.model.Admin;
import org.example.agrimarket.model.Customer;
import org.example.agrimarket.model.Farmer;
import org.example.agrimarket.repository.AdminRepository;
import org.example.agrimarket.repository.CustomerRepository;
import org.example.agrimarket.repository.FarmerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private AdminRepository adminRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = principal.getName();

        Optional<Customer> customer = customerRepository.findByEmail(email);
        if (customer.isPresent()) {
            Customer c = customer.get();
            c.setRole("customer");
            return ResponseEntity.ok(c);
        }

        Optional<Farmer> farmer = farmerRepository.findByEmail(email);
        if (farmer.isPresent()) {
            Farmer f = farmer.get();
            f.setRole("farmer");
            return ResponseEntity.ok(f);
        }

        Optional<Admin> admin = adminRepository.findByEmail(email);
        if (admin.isPresent()) {
            Admin a = admin.get();
            a.setRole("admin");
            return ResponseEntity.ok(a);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }
}

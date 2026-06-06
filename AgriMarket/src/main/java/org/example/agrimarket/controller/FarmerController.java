package org.example.agrimarket.controller;

import org.example.agrimarket.dto.FarmerRegistrationRequest;
import org.example.agrimarket.model.Farmer;
import org.example.agrimarket.service.FarmerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/farmers")
public class FarmerController {

    @Autowired
    private FarmerService farmerService;

    @PostMapping("/register")
    public ResponseEntity<?> registerAsFarmer(Principal principal, @RequestBody FarmerRegistrationRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Vui lòng đăng nhập.");
        }

        try {
            return ResponseEntity.ok(farmerService.registerAsFarmer(principal.getName(), request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Farmer> updateProfile(@PathVariable Long id, @RequestBody Farmer farmer) {
        return ResponseEntity.ok(farmerService.updateProfile(id, farmer));
    }
}

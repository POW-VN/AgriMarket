package org.example.agrimarket.controller;

import org.example.agrimarket.model.Farmer;
import org.example.agrimarket.service.FarmerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmers")
public class FarmerController {

    @Autowired
    private FarmerService farmerService;

    @PutMapping("/{id}")
    public ResponseEntity<Farmer> updateProfile(@PathVariable Long id, @RequestBody Farmer farmer) {
        return ResponseEntity.ok(farmerService.updateProfile(id, farmer));
    }
}

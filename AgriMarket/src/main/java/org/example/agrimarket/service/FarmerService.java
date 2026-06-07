package org.example.agrimarket.service;

import org.example.agrimarket.dto.AuthResponse;
import org.example.agrimarket.dto.FarmerRegistrationRequest;
import org.example.agrimarket.model.Customer;
import org.example.agrimarket.model.Farmer;
import org.example.agrimarket.repository.CustomerRepository;
import org.example.agrimarket.repository.FarmerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class FarmerService {

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Transactional
    public AuthResponse registerAsFarmer(String email, FarmerRegistrationRequest request) {
        if (farmerRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Tài khoản nhà vườn đã tồn tại với email này.");
        }

        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản khách hàng tương ứng."));

        Farmer farmer = new Farmer();
        farmer.setFullName(customer.getFullName());
        farmer.setEmail(customer.getEmail());
        farmer.setPhone(customer.getPhone());
        farmer.setPassword(customer.getPassword());
        farmer.setPasswordSet(customer.getPasswordSet());
        farmer.setAvatarUrl(customer.getAvatarUrl());
        farmer.setFarmName(request.getFarmName());
        farmer.setFarmAddress(request.getFarmAddress());
        farmer.setDescription(request.getDescription());
        farmer.setIdentityCard(request.getIdentityCard());
        farmer.setBusinessRegistrationUrl(request.getBusinessRegistrationUrl());
        farmer.setVietgapUrl(request.getVietgapUrl());
        farmer.setGlobalgapUrl(request.getGlobalgapUrl());
        farmer.setOrganicUrl(request.getOrganicUrl());
        farmer.setVerificationStatus("pending");
        farmer.setStatus("active");
        farmer.setCreatedAt(LocalDateTime.now());
        farmer.setRatingAverage(0.0);
        farmer.setTotalProducts(0);
        farmer.setRole("farmer");

        Farmer savedFarmer = farmerRepository.save(farmer);

        String token = jwtUtil.generateToken(email, "farmer");

        AuthResponse authResponse = new AuthResponse();
        authResponse.setToken(token);
        authResponse.setUser(savedFarmer);

        return authResponse;
    }

    public Optional<Farmer> findById(Long id) {
        Optional<Farmer> farmer = farmerRepository.findById(id);
        farmer.ifPresent(f -> f.setRole("farmer"));
        return farmer;
    }

    public Farmer updateProfile(Long id, Farmer updatedFarmer) {
        Farmer existing = farmerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        System.out.println("DEBUG UPDATE_PROFILE (Farmer): password before save: " + existing.getPassword());

        if (updatedFarmer.getFullName() != null) {
            existing.setFullName(updatedFarmer.getFullName());
        }
        if (updatedFarmer.getPhone() != null) {
            existing.setPhone(updatedFarmer.getPhone());
        }
        if (updatedFarmer.getAvatarUrl() != null) {
            String newAvatar = updatedFarmer.getAvatarUrl();
            String oldAvatar = existing.getAvatarUrl();
            if (!newAvatar.equals(oldAvatar)) {
                deletePhysicalAvatarFile(oldAvatar);
                existing.setAvatarUrl(newAvatar.isEmpty() ? null : newAvatar);
            }
        }
        if (updatedFarmer.getFarmName() != null) {
            existing.setFarmName(updatedFarmer.getFarmName());
        }
        if (updatedFarmer.getFarmAddress() != null) {
            existing.setFarmAddress(updatedFarmer.getFarmAddress());
        }
        if (updatedFarmer.getDescription() != null) {
            existing.setDescription(updatedFarmer.getDescription());
        }

        existing.setRole("farmer");
        Farmer saved = farmerRepository.save(existing);
        System.out.println("DEBUG UPDATE_PROFILE (Farmer): password after save: " + saved.getPassword());
        return saved;
    }

    private void deletePhysicalAvatarFile(String avatarUrl) {
        if (avatarUrl != null && avatarUrl.contains("/uploads/avatars/")) {
            try {
                String fileName = avatarUrl.substring(avatarUrl.lastIndexOf("/") + 1);
                java.io.File fileToDelete = new java.io.File("uploads" + java.io.File.separator + "avatars" + java.io.File.separator + fileName);
                if (fileToDelete.exists()) {
                    fileToDelete.delete();
                }
            } catch (Exception e) {
                System.err.println("Failed to delete old avatar file: " + e.getMessage());
            }
        }
    }
}

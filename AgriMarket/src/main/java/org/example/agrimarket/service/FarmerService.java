package org.example.agrimarket.service;

import org.example.agrimarket.model.Farmer;
import org.example.agrimarket.repository.FarmerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class FarmerService {

    @Autowired
    private FarmerRepository farmerRepository;

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

package org.example.agrimarket.service;

import org.example.agrimarket.dto.AuthResponse;
import org.example.agrimarket.dto.FarmerRegistrationRequest;
import org.example.agrimarket.dto.UpdateFarmerProfileRequest;
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
        farmer.setStatus("pending");
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

    @Transactional
    public Farmer updateProfile(Long id, UpdateFarmerProfileRequest request) {
        Farmer existing = farmerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        System.out.println("DEBUG UPDATE_PROFILE (Farmer): updating farmer id=" + id);

        if (request.getFullName() != null) {
            existing.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            existing.setPhone(request.getPhone());
        }
        if (request.getAvatarUrl() != null) {
            String newAvatar = request.getAvatarUrl();
            String oldAvatar = existing.getAvatarUrl();
            if (!newAvatar.equals(oldAvatar)) {
                deletePhysicalAvatarFile(oldAvatar);
                existing.setAvatarUrl(newAvatar.isEmpty() ? null : newAvatar);
            }
        }
        if (request.getFarmName() != null) {
            existing.setFarmName(request.getFarmName());
        }
        if (request.getFarmAddress() != null) {
            existing.setFarmAddress(request.getFarmAddress());
        }
        if (request.getDescription() != null) {
            existing.setDescription(request.getDescription());
        }
        if (request.getIdentityCard() != null) {
            existing.setIdentityCard(request.getIdentityCard());
        }

        // Business Registration URL: field was present in request (even if null = clear it)
        if (request.isBusinessRegistrationUrlPresent()) {
            String newBizUrl = request.getBusinessRegistrationUrl();
            String oldBizUrl = existing.getBusinessRegistrationUrl();
            if (oldBizUrl != null && !oldBizUrl.equals(newBizUrl)) {
                deletePhysicalDocumentFile(oldBizUrl);
                System.out.println("DEBUG: Deleted old businessRegistrationUrl file: " + oldBizUrl);
            }
            existing.setBusinessRegistrationUrl(newBizUrl);
            System.out.println("DEBUG: Set businessRegistrationUrl to: " + newBizUrl);
        }

        // VietGAP URL: field was present in request (null = unchecked, clear it)
        if (request.isVietgapUrlPresent()) {
            String newVietgap = request.getVietgapUrl();
            String oldVietgap = existing.getVietgapUrl();
            if (oldVietgap != null && !oldVietgap.equals(newVietgap)) {
                deletePhysicalDocumentFile(oldVietgap);
                System.out.println("DEBUG: Deleted old vietgapUrl file: " + oldVietgap);
            }
            existing.setVietgapUrl(newVietgap);
            System.out.println("DEBUG: Set vietgapUrl to: " + newVietgap);
        }

        // GlobalGAP URL: field was present in request (null = unchecked, clear it)
        if (request.isGlobalgapUrlPresent()) {
            String newGlobalgap = request.getGlobalgapUrl();
            String oldGlobalgap = existing.getGlobalgapUrl();
            if (oldGlobalgap != null && !oldGlobalgap.equals(newGlobalgap)) {
                deletePhysicalDocumentFile(oldGlobalgap);
                System.out.println("DEBUG: Deleted old globalgapUrl file: " + oldGlobalgap);
            }
            existing.setGlobalgapUrl(newGlobalgap);
            System.out.println("DEBUG: Set globalgapUrl to: " + newGlobalgap);
        }

        // Organic URL: field was present in request (null = unchecked, clear it)
        if (request.isOrganicUrlPresent()) {
            String newOrganic = request.getOrganicUrl();
            String oldOrganic = existing.getOrganicUrl();
            if (oldOrganic != null && !oldOrganic.equals(newOrganic)) {
                deletePhysicalDocumentFile(oldOrganic);
                System.out.println("DEBUG: Deleted old organicUrl file: " + oldOrganic);
            }
            existing.setOrganicUrl(newOrganic);
            System.out.println("DEBUG: Set organicUrl to: " + newOrganic);
        }

        existing.setRole("farmer");
        Farmer saved = farmerRepository.save(existing);
        System.out.println("DEBUG UPDATE_PROFILE (Farmer): profile updated successfully for id=" + id);
        return saved;
    }

    private void deletePhysicalAvatarFile(String avatarUrl) {
        if (avatarUrl != null && avatarUrl.contains("/uploads/avatars/")) {
            try {
                String fileName = avatarUrl.substring(avatarUrl.lastIndexOf("/") + 1);
                java.io.File fileToDelete = new java.io.File("uploads" + java.io.File.separator + "avatars" + java.io.File.separator + fileName);
                if (fileToDelete.exists()) {
                    boolean deleted = fileToDelete.delete();
                    System.out.println(">>> FarmerService: Deleted avatar file: " + fileToDelete.getAbsolutePath() + " (success: " + deleted + ")");
                }
            } catch (Exception e) {
                System.err.println("Failed to delete old avatar file: " + e.getMessage());
            }
        }
    }

    private void deletePhysicalDocumentFile(String fileUrl) {
        if (fileUrl == null) return;
        String normalizedUrl = fileUrl.replace("\\", "/");
        if (normalizedUrl.contains("/uploads/documents/")) {
            try {
                String fileName = normalizedUrl.substring(normalizedUrl.lastIndexOf("/") + 1);
                java.io.File fileInParent = new java.io.File("uploads" + java.io.File.separator + "documents" + java.io.File.separator + fileName);
                java.io.File fileInSub = new java.io.File("AgriMarket" + java.io.File.separator + "uploads" + java.io.File.separator + "documents" + java.io.File.separator + fileName);

                boolean deleted = false;
                if (fileInParent.exists()) {
                    deleted = fileInParent.delete();
                    System.out.println(">>> FarmerService: Deleted document file: " + fileInParent.getAbsolutePath() + " (success: " + deleted + ")");
                } else if (fileInSub.exists()) {
                    deleted = fileInSub.delete();
                    System.out.println(">>> FarmerService: Deleted document file: " + fileInSub.getAbsolutePath() + " (success: " + deleted + ")");
                } else {
                    System.out.println(">>> FarmerService: Document file not found on disk: " + fileUrl);
                }
            } catch (Exception e) {
                System.err.println(">>> FarmerService: Failed to delete document file: " + fileUrl + ", error: " + e.getMessage());
            }
        }
    }
}

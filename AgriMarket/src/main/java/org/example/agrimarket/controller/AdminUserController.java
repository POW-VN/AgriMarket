package org.example.agrimarket.controller;

import org.example.agrimarket.model.Admin;
import org.example.agrimarket.model.Customer;
import org.example.agrimarket.model.Farmer;
import org.example.agrimarket.model.CustomerAddress;
import org.example.agrimarket.model.Partner;
import org.example.agrimarket.model.Product;
import org.example.agrimarket.model.ProductImage;
import org.example.agrimarket.repository.AdminRepository;
import org.example.agrimarket.repository.CustomerRepository;
import org.example.agrimarket.repository.FarmerRepository;
import org.example.agrimarket.repository.PartnerRepository;
import org.example.agrimarket.repository.ProductRepository;
import org.example.agrimarket.repository.ProductImageRepository;
import org.example.agrimarket.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private PartnerRepository partnerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OrderService orderService;

    @GetMapping("/orders/customer/{email}")
    public ResponseEntity<?> getCustomerOrdersForAdmin(@PathVariable String email) {
        try {
            return ResponseEntity.ok(orderService.getCustomerOrders(email));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/orders/farmer/{email}")
    public ResponseEntity<?> getFarmerOrdersForAdmin(@PathVariable String email) {
        try {
            return ResponseEntity.ok(orderService.getFarmerOrders(email));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> userList = new ArrayList<>();

        // Fetch admins
        for (Admin a : adminRepository.findAll()) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("fullName", a.getFullName());
            map.put("email", a.getEmail());
            map.put("phone", "");
            map.put("role", "admin");
            map.put("status", "active");
            map.put("avatarUrl", a.getAvatarUrl());
            map.put("createdAt", a.getCreatedAt());
            map.put("address", "");
            userList.add(map);
        }

        // Fetch customers
        for (Customer c : customerRepository.findAll()) {
            if (farmerRepository.findByEmail(c.getEmail()).isPresent()) {
                continue; // Skip customer record, display as farmer with role="farmer"
            }
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("fullName", c.getFullName());
            map.put("email", c.getEmail());
            map.put("phone", c.getPhone());
            map.put("role", "customer");
            map.put("status", c.getStatus() != null ? c.getStatus() : "active");
            map.put("avatarUrl", c.getAvatarUrl());
            map.put("createdAt", c.getCreatedAt());

            String address = "";
            if (c.getAddresses() != null && !c.getAddresses().isEmpty()) {
                address = c.getAddresses().stream()
                        .filter(addr -> addr.getIsDefault() != null && addr.getIsDefault())
                        .map(CustomerAddress::getAddress)
                        .findFirst()
                        .orElse(c.getAddresses().get(0).getAddress());
            }
            map.put("address", address);

            userList.add(map);
        }

        // Fetch farmers
        for (Farmer f : farmerRepository.findAll()) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", f.getId());
            map.put("fullName", f.getFullName());
            map.put("email", f.getEmail());
            map.put("phone", f.getPhone());
            map.put("role", "farmer");
            map.put("status", f.getStatus() != null ? f.getStatus() : "active");
            map.put("avatarUrl", f.getAvatarUrl());
            map.put("createdAt", f.getCreatedAt());
            map.put("farmName", f.getFarmName());
            map.put("farmAddress", f.getFarmAddress());
            map.put("description", f.getDescription());
            map.put("address", f.getFarmAddress() != null ? f.getFarmAddress() : "");
            
            // farm-profile fields matching farm/farm-profile page
            map.put("identityCard", f.getIdentityCard());
            map.put("businessRegistrationUrl", f.getBusinessRegistrationUrl());
            map.put("vietgapUrl", f.getVietgapUrl());
            map.put("globalgapUrl", f.getGlobalgapUrl());
            map.put("organicUrl", f.getOrganicUrl());

            userList.add(map);
        }

        // Fetch partners
        for (Partner p : partnerRepository.findAll()) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("fullName", p.getFullName());
            map.put("email", p.getEmail());
            map.put("phone", p.getPhone());
            map.put("role", "partner");
            map.put("status", p.getStatus() != null ? p.getStatus() : "active");
            map.put("avatarUrl", p.getAvatarUrl());
            map.put("createdAt", p.getCreatedAt());
            map.put("address", "");
            userList.add(map);
        }

        return ResponseEntity.ok(userList);
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> payload) {
        String role = (String) payload.get("role");
        if (role == null) {
            return ResponseEntity.badRequest().body("Role is required");
        }
        role = role.toLowerCase();

        String fullName = (String) payload.get("fullName");
        String email = (String) payload.get("email");
        if (email != null) {
            email = email.trim().toLowerCase();
        }
        String phone = (String) payload.get("phone");
        String password = (String) payload.get("password");
        String avatarUrl = (String) payload.get("avatarUrl");
        String status = (String) payload.getOrDefault("status", "active");

        if (email != null) {
            if (adminRepository.findByEmail(email).isPresent() ||
                customerRepository.findByEmail(email).isPresent() ||
                farmerRepository.findByEmail(email).isPresent() ||
                partnerRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest().body("Email đã tồn tại trong hệ thống");
            }
        }

        String encodedPassword = passwordEncoder.encode(password != null ? password : "Password123");

        if ("admin".equals(role)) {
            Admin admin = new Admin();
            admin.setFullName(fullName);
            admin.setEmail(email);
            admin.setPassword(encodedPassword);
            admin.setAvatarUrl(avatarUrl);
            admin.setCreatedAt(LocalDateTime.now());
            return ResponseEntity.ok(adminRepository.save(admin));
        } else if ("customer".equals(role)) {
            Customer customer = new Customer();
            customer.setFullName(fullName);
            customer.setEmail(email);
            customer.setPhone(phone);
            customer.setPassword(encodedPassword);
            customer.setAvatarUrl(avatarUrl);
            customer.setStatus(status);
            customer.setCreatedAt(LocalDateTime.now());
            customer.setPasswordSet(true);
            return ResponseEntity.ok(customerRepository.save(customer));
        } else if ("farmer".equals(role)) {
            Farmer farmer = new Farmer();
            farmer.setFullName(fullName);
            farmer.setEmail(email);
            farmer.setPhone(phone);
            farmer.setPassword(encodedPassword);
            farmer.setAvatarUrl(avatarUrl);
            farmer.setStatus(status);
            farmer.setVerificationStatus("verified");
            farmer.setCreatedAt(LocalDateTime.now());
            farmer.setPasswordSet(true);

            String farmName = (String) payload.get("farmName");
            String farmAddress = (String) payload.get("farmAddress");
            String description = (String) payload.get("description");
            farmer.setFarmName(farmName != null ? farmName : "Nông trại của " + fullName);
            farmer.setFarmAddress(farmAddress != null ? farmAddress : "");
            farmer.setDescription(description != null ? description : "");
            farmer.setRatingAverage(0.0);
            farmer.setTotalProducts(0);

            farmer.setIdentityCard((String) payload.get("identityCard"));
            farmer.setBusinessRegistrationUrl((String) payload.get("businessRegistrationUrl"));
            farmer.setVietgapUrl((String) payload.get("vietgapUrl"));
            farmer.setGlobalgapUrl((String) payload.get("globalgapUrl"));
            farmer.setOrganicUrl((String) payload.get("organicUrl"));

            return ResponseEntity.ok(farmerRepository.save(farmer));
        } else if ("partner".equals(role)) {
            Partner partner = new Partner();
            partner.setFullName(fullName);
            partner.setEmail(email);
            partner.setPhone(phone);
            partner.setPassword(encodedPassword);
            partner.setAvatarUrl(avatarUrl);
            partner.setStatus(status);
            partner.setCreatedAt(LocalDateTime.now());
            return ResponseEntity.ok(partnerRepository.save(partner));
        } else {
            return ResponseEntity.badRequest().body("Invalid role: " + role);
        }
    }

    @PutMapping("/{role}/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String role, @PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().body("Status is required");
        }
        
        String lowerRole = role.toLowerCase();
        if ("admin".equals(lowerRole)) {
            return ResponseEntity.badRequest().body("Cannot change admin status");
        } else if ("customer".equals(lowerRole)) {
            Customer c = customerRepository.findById(id).orElse(null);
            if (c == null) return ResponseEntity.notFound().build();
            c.setStatus(newStatus);
            customerRepository.save(c);
            
            // Sync status to Farmer with same email (lock/unlock)
            farmerRepository.findByEmail(c.getEmail()).ifPresent(f -> {
                f.setStatus(newStatus);
                farmerRepository.save(f);
            });
            return ResponseEntity.ok().build();
        } else if ("farmer".equals(lowerRole)) {
            Farmer f = farmerRepository.findById(id).orElse(null);
            if (f == null) return ResponseEntity.notFound().build();
            f.setStatus(newStatus);
            farmerRepository.save(f);
            
            // Sync status to Customer with same email (lock/unlock)
            customerRepository.findByEmail(f.getEmail()).ifPresent(c -> {
                c.setStatus(newStatus);
                customerRepository.save(c);
            });
            return ResponseEntity.ok().build();
        } else if ("partner".equals(lowerRole)) {
            Partner p = partnerRepository.findById(id).orElse(null);
            if (p == null) return ResponseEntity.notFound().build();
            p.setStatus(newStatus);
            partnerRepository.save(p);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().body("Invalid role: " + role);
        }
    }

    @DeleteMapping("/{role}/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String role, @PathVariable Long id) {
        String lowerRole = role.toLowerCase();
        if ("admin".equals(lowerRole)) {
            adminRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } else if ("customer".equals(lowerRole)) {
            Customer customer = customerRepository.findById(id).orElse(null);
            if (customer != null) {
                deletePhysicalAvatarFile(customer.getAvatarUrl());
                customerRepository.delete(customer);
            }
            return ResponseEntity.ok().build();
        } else if ("farmer".equals(lowerRole)) {
            Farmer farmer = farmerRepository.findById(id).orElse(null);
            if (farmer != null) {
                // 1. Delete all products and their physical images/files
                List<Product> products = productRepository.findByFarmerIdOrderByCreatedAtDesc(farmer.getId());
                if (products != null) {
                    for (Product product : products) {
                        List<ProductImage> images = productImageRepository.findByProductId(product.getId());
                        if (images != null) {
                            for (ProductImage img : images) {
                                deletePhysicalFile(img.getImgUrl(), "products");
                            }
                            productImageRepository.deleteAll(images);
                        }
                        deletePhysicalFile(product.getCertificateUrl(), "certificates");
                        deletePhysicalFile(product.getTraceabilityImageUrl(), "traceability");
                        productRepository.delete(product);
                    }
                }

                // 2. Delete farmer document files physically
                deletePhysicalFile(farmer.getBusinessRegistrationUrl(), "documents");
                deletePhysicalFile(farmer.getVietgapUrl(), "documents");
                deletePhysicalFile(farmer.getGlobalgapUrl(), "documents");
                deletePhysicalFile(farmer.getOrganicUrl(), "documents");

                // 3. Delete avatar physically
                deletePhysicalAvatarFile(farmer.getAvatarUrl());

                farmerRepository.delete(farmer);
            }
            return ResponseEntity.ok().build();
        } else if ("partner".equals(lowerRole)) {
            Partner partner = partnerRepository.findById(id).orElse(null);
            if (partner != null) {
                deletePhysicalAvatarFile(partner.getAvatarUrl());
                partnerRepository.delete(partner);
            }
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().body("Invalid role: " + role);
        }
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
                System.err.println("Failed to delete avatar file: " + e.getMessage());
            }
        }
    }

    private void deletePhysicalFile(String fileUrl, String subFolder) {
        if (fileUrl == null) return;
        String normalizedUrl = fileUrl.replace("\\", "/");
        if (normalizedUrl.contains("/uploads/" + subFolder + "/")) {
            try {
                String fileName = normalizedUrl.substring(normalizedUrl.lastIndexOf("/") + 1);
                java.io.File fileInParent = new java.io.File("uploads" + java.io.File.separator + subFolder + java.io.File.separator + fileName);
                java.io.File fileInSub = new java.io.File("AgriMarket" + java.io.File.separator + "uploads" + java.io.File.separator + subFolder + java.io.File.separator + fileName);

                boolean deleted = false;
                if (fileInParent.exists()) {
                    deleted = fileInParent.delete();
                    System.out.println(">>> AdminUserController: Deleted physical file in parent: " + fileInParent.getAbsolutePath() + " (success: " + deleted + ")");
                } else if (fileInSub.exists()) {
                    deleted = fileInSub.delete();
                    System.out.println(">>> AdminUserController: Deleted physical file in subfolder: " + fileInSub.getAbsolutePath() + " (success: " + deleted + ")");
                }
            } catch (Exception e) {
                System.err.println(">>> AdminUserController: Failed to delete physical file: " + fileUrl + ", error: " + e.getMessage());
            }
        }
    }
}

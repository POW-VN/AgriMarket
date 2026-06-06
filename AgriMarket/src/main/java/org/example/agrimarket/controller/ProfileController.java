package org.example.agrimarket.controller;

import org.example.agrimarket.dto.ChangePasswordRequest;
import org.example.agrimarket.model.Admin;
import org.example.agrimarket.model.Customer;
import org.example.agrimarket.model.Farmer;
import org.example.agrimarket.model.Product;
import org.example.agrimarket.model.ProductImage;
import org.example.agrimarket.repository.AdminRepository;
import org.example.agrimarket.repository.CustomerRepository;
import org.example.agrimarket.repository.FarmerRepository;
import org.example.agrimarket.repository.ProductRepository;
import org.example.agrimarket.repository.ProductImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
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

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = principal.getName();

        org.springframework.security.core.Authentication auth = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        
        boolean isFarmer = auth != null && auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_FARMER"));
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        // 1. Try Farmer (if registered as farmer, they are a farmer)
        Optional<Farmer> farmer = farmerRepository.findByEmail(email);
        if (farmer.isPresent()) {
            Farmer f = farmer.get();
            f.setRole("farmer");
            return ResponseEntity.ok(f);
        }

        // 2. Try Admin
        if (isAdmin) {
            Optional<Admin> admin = adminRepository.findByEmail(email);
            if (admin.isPresent()) {
                Admin a = admin.get();
                a.setRole("admin");
                return ResponseEntity.ok(a);
            }
        }

        // 3. Try Customer
        Optional<Customer> customer = customerRepository.findByEmail(email);
        if (customer.isPresent()) {
            Customer c = customer.get();
            c.setRole("customer");
            return ResponseEntity.ok(c);
        }


        Optional<Admin> admin = adminRepository.findByEmail(email);
        if (admin.isPresent()) {
            Admin a = admin.get();
            a.setRole("admin");
            return ResponseEntity.ok(a);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(Principal principal, @RequestBody ChangePasswordRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = principal.getName();

        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        Optional<Farmer> farmerOpt = farmerRepository.findByEmail(email);
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);

        boolean passwordChecked = false;
        String encodedNewPassword = passwordEncoder.encode(request.getNewPassword());

        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            boolean requiresCurrentPassword = customer.getPasswordSet() == null || customer.getPasswordSet();
            if (requiresCurrentPassword) {
                if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), customer.getPassword())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu hiện tại không chính xác.");
                }
            }
            customer.setPassword(encodedNewPassword);
            customer.setPasswordSet(true);
            customerRepository.save(customer);
            passwordChecked = true;
        }

        if (farmerOpt.isPresent()) {
            Farmer farmer = farmerOpt.get();
            if (!passwordChecked) {
                boolean requiresCurrentPassword = farmer.getPasswordSet() == null || farmer.getPasswordSet();
                if (requiresCurrentPassword) {
                    if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), farmer.getPassword())) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu hiện tại không chính xác.");
                    }
                }
                passwordChecked = true;
            }
            farmer.setPassword(encodedNewPassword);
            farmer.setPasswordSet(true);
            farmerRepository.save(farmer);
        }

        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu hiện tại không chính xác.");
            }
            admin.setPassword(encodedNewPassword);
            adminRepository.save(admin);
            passwordChecked = true;
        }

        if (passwordChecked) {
            return ResponseEntity.ok("Đổi mật khẩu thành công.");
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<?> deleteAccount(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = principal.getName();

        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        Optional<Farmer> farmerOpt = farmerRepository.findByEmail(email);
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);

        boolean deleted = false;

        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            deletePhysicalAvatarFile(customer.getAvatarUrl());
            customerRepository.delete(customer);
            deleted = true;
        }

        if (farmerOpt.isPresent()) {
            Farmer farmer = farmerOpt.get();
            
            // 1. Delete all products and their physical images/files
            List<Product> products = productRepository.findByFarmerIdOrderByCreatedAtDesc(farmer.getId());
            if (products != null) {
                for (Product product : products) {
                    // Delete product images physically
                    List<ProductImage> images = productImageRepository.findByProductId(product.getId());
                    if (images != null) {
                        for (ProductImage img : images) {
                            deletePhysicalFile(img.getImgUrl(), "products");
                        }
                        productImageRepository.deleteAll(images);
                    }
                    // Delete product certificate physically
                    deletePhysicalFile(product.getCertificateUrl(), "certificates");
                    // Delete product traceability image physically
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
            deleted = true;
        }

        if (adminOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Không thể xóa tài khoản Admin.");
        }

        if (deleted) {
            return ResponseEntity.ok("Xóa tài khoản thành công.");
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
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
                    System.out.println(">>> ProfileController: Deleted physical file in parent: " + fileInParent.getAbsolutePath() + " (success: " + deleted + ")");
                } else if (fileInSub.exists()) {
                    deleted = fileInSub.delete();
                    System.out.println(">>> ProfileController: Deleted physical file in subfolder: " + fileInSub.getAbsolutePath() + " (success: " + deleted + ")");
                }
            } catch (Exception e) {
                System.err.println(">>> ProfileController: Failed to delete physical file: " + fileUrl + ", error: " + e.getMessage());
            }
        }
    }
}

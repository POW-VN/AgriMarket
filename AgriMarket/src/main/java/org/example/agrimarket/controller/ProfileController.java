package org.example.agrimarket.controller;

import org.example.agrimarket.dto.ChangePasswordRequest;
import org.example.agrimarket.model.Admin;
import org.example.agrimarket.model.Customer;
import org.example.agrimarket.model.Farmer;
import org.example.agrimarket.repository.AdminRepository;
import org.example.agrimarket.repository.CustomerRepository;
import org.example.agrimarket.repository.FarmerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @Autowired
    private PasswordEncoder passwordEncoder;

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

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(Principal principal, @RequestBody ChangePasswordRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = principal.getName();

        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            boolean requiresCurrentPassword = customer.getPasswordSet() == null || customer.getPasswordSet();
            if (requiresCurrentPassword) {
                if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), customer.getPassword())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu hiện tại không chính xác.");
                }
            }
            customer.setPassword(passwordEncoder.encode(request.getNewPassword()));
            customer.setPasswordSet(true);
            customerRepository.save(customer);
            return ResponseEntity.ok("Đổi mật khẩu thành công.");
        }

        Optional<Farmer> farmerOpt = farmerRepository.findByEmail(email);
        if (farmerOpt.isPresent()) {
            Farmer farmer = farmerOpt.get();
            boolean requiresCurrentPassword = farmer.getPasswordSet() == null || farmer.getPasswordSet();
            if (requiresCurrentPassword) {
                if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), farmer.getPassword())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu hiện tại không chính xác.");
                }
            }
            farmer.setPassword(passwordEncoder.encode(request.getNewPassword()));
            farmer.setPasswordSet(true);
            farmerRepository.save(farmer);
            return ResponseEntity.ok("Đổi mật khẩu thành công.");
        }

        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu hiện tại không chính xác.");
            }
            admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
            adminRepository.save(admin);
            return ResponseEntity.ok("Đổi mật khẩu thành công.");
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }
}

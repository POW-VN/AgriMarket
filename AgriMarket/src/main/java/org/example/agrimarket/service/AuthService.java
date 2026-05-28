package org.example.agrimarket.service;

import org.example.agrimarket.dto.AuthResponse;
import org.example.agrimarket.dto.RegisterRequest;
import org.example.agrimarket.model.Admin;
import org.example.agrimarket.model.Customer;
import org.example.agrimarket.model.Farmer;
import org.example.agrimarket.repository.AdminRepository;
import org.example.agrimarket.repository.CustomerRepository;
import org.example.agrimarket.repository.FarmerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthResponse login(String email, String password, String role) {

        if (role == null || role.isBlank()) {
            throw new RuntimeException("Role is required");
        }

        role = role.toLowerCase();

        Object user;

        switch (role) {

            case "customer":
                user = customerRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Customer not found"));
                break;

            case "farmer":
                user = farmerRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Farmer not found"));
                break;

            case "admin":
                user = adminRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Admin not found"));
                break;

            default:
                throw new RuntimeException("Invalid role");
        }

        String hashedPassword;

        switch (role) {
            case "admin":
                hashedPassword = ((Admin) user).getPassword();
                break;

            case "farmer":
                hashedPassword = ((Farmer) user).getPassword();
                break;

            default:
                hashedPassword = ((Customer) user).getPassword();
                break;
        }

        if (!passwordEncoder.matches(password, hashedPassword)) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(email, role);

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUser(user);

        return response;
    }

    public Object register(RegisterRequest request) {

        if (request.getRole() == null || request.getRole().isBlank()) {
            throw new RuntimeException("Role is required");
        }

        String role = request.getRole().toLowerCase();

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        switch (role) {

            case "customer":

                Customer customer = new Customer();

                customer.setFullName(request.getFullName());
                customer.setEmail(request.getEmail());
                customer.setPhone(request.getPhoneNumber());
                customer.setPassword(hashedPassword);
                customer.setStatus("pending");
                customer.setCreatedAt(LocalDateTime.now());

                return customerRepository.save(customer);

            case "farmer":

                Farmer farmer = new Farmer();

                farmer.setFullName(request.getFullName());
                farmer.setEmail(request.getEmail());
                farmer.setPhone(request.getPhoneNumber());
                farmer.setPassword(hashedPassword);
                farmer.setVerificationStatus("pending");
                farmer.setStatus("pending");
                farmer.setCreatedAt(LocalDateTime.now());

                return farmerRepository.save(farmer);

            case "admin":

                Admin admin = new Admin();

                admin.setFullName(request.getFullName());
                admin.setEmail(request.getEmail());
                admin.setPassword(hashedPassword);
                admin.setCreatedAt(LocalDateTime.now());

                return adminRepository.save(admin);

            default:
                throw new RuntimeException("Invalid role");
        }
    }

    public AuthResponse googleLogin(String googleAccessToken, String role) {
        if (role == null || role.isBlank()) {
            throw new RuntimeException("Role is required");
        }
        role = role.toLowerCase();

        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.set("Authorization", "Bearer " + googleAccessToken);
        org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>("parameters", headers);

        org.springframework.http.ResponseEntity<java.util.Map> responseEntity;
        try {
            responseEntity = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    java.util.Map.class
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify Google token: " + e.getMessage());
        }

        java.util.Map<String, Object> userInfo = responseEntity.getBody();
        if (userInfo == null || !userInfo.containsKey("email")) {
            throw new RuntimeException("Invalid token response or email not found");
        }

        String email = (String) userInfo.get("email");
        String name = (String) userInfo.get("name");
        String picture = (String) userInfo.get("picture");

        Object user;
        if ("customer".equals(role)) {
            Customer customer = customerRepository.findByEmail(email).orElse(null);
            if (customer == null) {
                customer = new Customer();
                customer.setFullName(name != null ? name : "Google User");
                customer.setEmail(email);
                customer.setAvatarUrl(picture);
                customer.setStatus("active");
                customer.setCreatedAt(LocalDateTime.now());
                customer = customerRepository.save(customer);
            }
            user = customer;
        } else if ("farmer".equals(role)) {
            Farmer farmer = farmerRepository.findByEmail(email).orElse(null);
            if (farmer == null) {
                farmer = new Farmer();
                farmer.setFullName(name != null ? name : "Google User");
                farmer.setEmail(email);
                farmer.setAvatarUrl(picture);
                farmer.setVerificationStatus("pending");
                farmer.setStatus("active");
                farmer.setCreatedAt(LocalDateTime.now());
                farmer = farmerRepository.save(farmer);
            }
            user = farmer;
        } else {
            throw new RuntimeException("Invalid role");
        }

        String token = jwtUtil.generateToken(email, role);

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUser(user);

        return response;
    }
}
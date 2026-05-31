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
                farmer.setFarmName("Nông trại của " + (request.getFullName() != null ? request.getFullName() : "Nông Dân"));
                farmer.setFarmAddress("Chưa cập nhật");

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

        // Check if the user already exists in the database
        Customer customer = customerRepository.findByEmail(email).orElse(null);
        Farmer farmer = farmerRepository.findByEmail(email).orElse(null);

        Object user = null;
        String resolvedRole = null;

        if (customer != null) {
            user = customer;
            resolvedRole = "customer";
        } else if (farmer != null) {
            user = farmer;
            resolvedRole = "farmer";
        }

        if (user != null) {
            // User exists, login immediately and return successful auth response
            String token = jwtUtil.generateToken(email, resolvedRole);
            AuthResponse response = new AuthResponse();
            response.setToken(token);
            response.setUser(user);
            response.setNewUser(false);
            return response;
        }

        // User does not exist. Do they have a selected role from RoleCard?
        if (role == null || role.isBlank() || (!"customer".equalsIgnoreCase(role) && !"farmer".equalsIgnoreCase(role))) {
            // No role selected yet, return response indicating we need role selection
            AuthResponse response = new AuthResponse();
            response.setNewUser(true);
            return response;
        }

        // Role is provided. Register the user and generate login details.
        String lowercaseRole = role.toLowerCase();
        if ("customer".equals(lowercaseRole)) {
            customer = new Customer();
            customer.setFullName(name != null ? name : "Google User");
            customer.setEmail(email);
            customer.setAvatarUrl(picture);
            customer.setStatus("active");
            customer.setCreatedAt(LocalDateTime.now());
            // Auto-generate remaining attributes:
            customer.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            customer.setPhone(generateUniquePhoneForCustomer());
            customer = customerRepository.save(customer);
            user = customer;
            resolvedRole = "customer";
        } else if ("farmer".equals(lowercaseRole)) {
            farmer = new Farmer();
            farmer.setFullName(name != null ? name : "Google User");
            farmer.setEmail(email);
            farmer.setAvatarUrl(picture);
            farmer.setVerificationStatus("pending");
            farmer.setStatus("active");
            farmer.setCreatedAt(LocalDateTime.now());
            // Auto-generate remaining attributes:
            farmer.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            farmer.setPhone(generateUniquePhoneForFarmer());
            farmer.setFarmName("Nông trại của " + (name != null ? name : "Google Farmer"));
            farmer.setFarmAddress("Chưa cập nhật");
            farmer.setDescription("Mô tả nông trại chưa được cập nhật.");
            farmer.setRatingAverage(0.0);
            farmer.setTotalProducts(0);
            farmer = farmerRepository.save(farmer);
            user = farmer;
            resolvedRole = "farmer";
        }

        String token = jwtUtil.generateToken(email, resolvedRole);
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUser(user);
        response.setNewUser(false);
        return response;
    }

    private String generateUniquePhoneForCustomer() {
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 100; i++) {
            String phone = "0" + (300000000L + random.nextLong(700000000L));
            if (!customerRepository.existsByPhone(phone)) {
                return phone;
            }
        }
        throw new RuntimeException("Failed to generate unique phone number");
    }

    private String generateUniquePhoneForFarmer() {
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 100; i++) {
            String phone = "0" + (300000000L + random.nextLong(700000000L));
            if (!farmerRepository.existsByPhone(phone)) {
                return phone;
            }
        }
        throw new RuntimeException("Failed to generate unique phone number");
    }
}
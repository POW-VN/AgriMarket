package org.example.agrimarket.service;

import org.example.agrimarket.model.Customer;
import org.example.agrimarket.model.CustomerAddress;
import org.example.agrimarket.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;

    public Customer register(Customer customer) {
        customer.setPassword(new BCryptPasswordEncoder().encode(customer.getPassword()));
        customer.setCreatedAt(LocalDateTime.now());
        customer.setStatus("pending"); // mặc định chờ duyệt
        return customerRepository.save(customer);
    }

    public Optional<Customer> login(String email, String password) {
        Optional<Customer> customer = customerRepository.findByEmail(email);
        if (customer.isPresent() && new BCryptPasswordEncoder().matches(password, customer.get().getPassword())) {
            return customer;
        }
        return Optional.empty();
    }

    public Optional<Customer> findById(Long id) {
        Optional<Customer> customer = customerRepository.findById(id);
        customer.ifPresent(c -> c.setRole("customer"));
        return customer;
    }

    public Customer updateProfile(Long id, Customer updatedCustomer) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (updatedCustomer.getFullName() != null) {
            existing.setFullName(updatedCustomer.getFullName());
        }
        if (updatedCustomer.getPhone() != null) {
            String trimmedPhone = updatedCustomer.getPhone().trim();
            existing.setPhone(trimmedPhone.isEmpty() ? null : trimmedPhone);
        }
        if (updatedCustomer.getAvatarUrl() != null) {
            String newAvatar = updatedCustomer.getAvatarUrl();
            String oldAvatar = existing.getAvatarUrl();
            if (!newAvatar.equals(oldAvatar)) {
                deletePhysicalAvatarFile(oldAvatar);
                existing.setAvatarUrl(newAvatar.isEmpty() ? null : newAvatar);
            }
        }

        // Handle addresses
        if (updatedCustomer.getAddresses() != null) {
            if (existing.getAddresses() == null) {
                existing.setAddresses(new java.util.ArrayList<>());
            }
            if (updatedCustomer.getAddresses().isEmpty()) {
                existing.getAddresses().clear();
            } else {
                CustomerAddress newAddrInput = updatedCustomer.getAddresses().get(0);
                if (!existing.getAddresses().isEmpty()) {
                    CustomerAddress existingAddr = existing.getAddresses().get(0);
                    existingAddr.setAddress(newAddrInput.getAddress());
                    existingAddr.setReceiverName(newAddrInput.getReceiverName() != null ? newAddrInput.getReceiverName() : existing.getFullName());
                    existingAddr.setPhone(newAddrInput.getPhone() != null ? newAddrInput.getPhone() : existing.getPhone());
                    existingAddr.setIsDefault(true);
                } else {
                    CustomerAddress newAddr = new CustomerAddress();
                    newAddr.setAddress(newAddrInput.getAddress());
                    newAddr.setReceiverName(newAddrInput.getReceiverName() != null ? newAddrInput.getReceiverName() : existing.getFullName());
                    newAddr.setPhone(newAddrInput.getPhone() != null ? newAddrInput.getPhone() : existing.getPhone());
                    newAddr.setIsDefault(true);
                    newAddr.setCustomer(existing);
                    existing.getAddresses().add(newAddr);
                }
            }
        }

        existing.setRole("customer");
        return customerRepository.save(existing);
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

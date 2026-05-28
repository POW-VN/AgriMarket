package org.example.agrimarket.service;

import org.example.agrimarket.model.Customer;
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
}

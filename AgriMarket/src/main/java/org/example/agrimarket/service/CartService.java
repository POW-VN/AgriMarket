package org.example.agrimarket.service;

import org.example.agrimarket.dto.CartItemAddRequest;
import org.example.agrimarket.dto.CartItemResponse;
import org.example.agrimarket.model.Cart;
import org.example.agrimarket.model.CartItem;
import org.example.agrimarket.model.Product;
import org.example.agrimarket.model.ProductImage;
import org.example.agrimarket.repository.CartItemRepository;
import org.example.agrimarket.repository.CartRepository;
import org.example.agrimarket.repository.ProductImageRepository;
import org.example.agrimarket.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    private Cart getOrCreateCart(String email) {
        return cartRepository.findByEmail(email).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setEmail(email);
            return cartRepository.save(cart);
        });
    }

    @Transactional(readOnly = true)
    public List<CartItemResponse> getCart(String email) {
        Cart cart = getOrCreateCart(email);
        return cart.getItems().stream()
                .map(this::mapToResponse)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
    }

    private Optional<CartItemResponse> mapToResponse(CartItem item) {
        Optional<Product> productOpt = productRepository.findById(item.getProductId());
        if (productOpt.isEmpty()) {
            return Optional.empty();
        }
        Product product = productOpt.get();

        // Get thumbnail image
        String imageUrl = "";
        List<ProductImage> images = productImageRepository.findByProductId(product.getId());
        if (images != null && !images.isEmpty()) {
            imageUrl = images.stream()
                    .filter(img -> img.getIsThumbnail() != null && img.getIsThumbnail())
                    .map(ProductImage::getImgUrl)
                    .findFirst()
                    .orElse(images.get(0).getImgUrl());
        }

        CartItemResponse response = CartItemResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .unit(product.getUnit())
                .imageUrl(imageUrl)
                .quantity(item.getQuantity())
                .checked(item.getChecked() != null ? item.getChecked() : true)
                .stockQuantity(product.getStockQuantity())
                .build();

        return Optional.of(response);
    }

    @Transactional
    public List<CartItemResponse> addToCart(String email, Long productId, int quantity) {
        Cart cart = getOrCreateCart(email);

        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProductId(productId);
            newItem.setQuantity(quantity);
            newItem.setChecked(true);
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        cartRepository.save(cart);
        return getCart(email);
    }

    @Transactional
    public List<CartItemResponse> updateCartItem(String email, Long productId, Integer quantity, Boolean checked) {
        Cart cart = getOrCreateCart(email);

        Optional<CartItem> itemOpt = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst();

        if (itemOpt.isPresent()) {
            CartItem item = itemOpt.get();
            if (quantity != null) {
                item.setQuantity(quantity);
            }
            if (checked != null) {
                item.setChecked(checked);
            }
            cartItemRepository.save(item);
        }

        return getCart(email);
    }

    @Transactional
    public List<CartItemResponse> removeFromCart(String email, Long productId) {
        Cart cart = getOrCreateCart(email);

        Optional<CartItem> itemOpt = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst();

        if (itemOpt.isPresent()) {
            CartItem item = itemOpt.get();
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
            cartRepository.save(cart);
        }

        return getCart(email);
    }

    @Transactional
    public List<CartItemResponse> clearCart(String email) {
        Cart cart = getOrCreateCart(email);
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cartRepository.save(cart);
        return new ArrayList<>();
    }

    @Transactional
    public List<CartItemResponse> syncCart(String email, List<CartItemAddRequest> guestItems) {
        Cart cart = getOrCreateCart(email);

        for (CartItemAddRequest guestItem : guestItems) {
            Optional<CartItem> existingItemOpt = cart.getItems().stream()
                    .filter(item -> item.getProductId().equals(guestItem.getProductId()))
                    .findFirst();

            if (existingItemOpt.isPresent()) {
                CartItem existingItem = existingItemOpt.get();
                existingItem.setQuantity(existingItem.getQuantity() + guestItem.getQuantity());
                cartItemRepository.save(existingItem);
            } else {
                CartItem newItem = new CartItem();
                newItem.setCart(cart);
                newItem.setProductId(guestItem.getProductId());
                newItem.setQuantity(guestItem.getQuantity());
                newItem.setChecked(true);
                cart.getItems().add(newItem);
                cartItemRepository.save(newItem);
            }
        }

        cartRepository.save(cart);
        return getCart(email);
    }
}

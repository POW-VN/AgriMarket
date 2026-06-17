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
                .farmerId(product.getFarmer() != null ? product.getFarmer().getId() : null)
                .farmerName(product.getFarmer() != null ? product.getFarmer().getFarmName() : null)
                .build();

        return Optional.of(response);
    }

    @Transactional
    public List<CartItemResponse> addToCart(String email, Long productId, int quantity) {
        Cart cart = getOrCreateCart(email);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm."));

        if (product.getStockQuantity() == 0) {
            throw new IllegalArgumentException("Sản phẩm đã hết hàng.");
        }

        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newQty = existingItem.getQuantity() + quantity;
            if (newQty > product.getStockQuantity()) {
                throw new IllegalArgumentException("Không thể thêm số lượng vượt quá tồn kho hiện có (" + product.getStockQuantity() + ").");
            }
            existingItem.setQuantity(newQty);
            cartItemRepository.save(existingItem);
        } else {
            if (quantity > product.getStockQuantity()) {
                throw new IllegalArgumentException("Không thể thêm số lượng vượt quá tồn kho hiện có (" + product.getStockQuantity() + ").");
            }
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
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm."));

        Optional<CartItem> itemOpt = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst();

        if (itemOpt.isPresent()) {
            CartItem item = itemOpt.get();
            if (quantity != null) {
                if (quantity > product.getStockQuantity()) {
                    throw new IllegalArgumentException("Không thể cập nhật số lượng vượt quá tồn kho hiện có (" + product.getStockQuantity() + ").");
                }
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
            Product product = productRepository.findById(guestItem.getProductId()).orElse(null);
            if (product == null) continue;

            Optional<CartItem> existingItemOpt = cart.getItems().stream()
                    .filter(item -> item.getProductId().equals(guestItem.getProductId()))
                    .findFirst();

            if (existingItemOpt.isPresent()) {
                CartItem existingItem = existingItemOpt.get();
                int newQty = existingItem.getQuantity() + guestItem.getQuantity();
                if (newQty > product.getStockQuantity()) {
                    newQty = product.getStockQuantity();
                }
                existingItem.setQuantity(newQty);
                cartItemRepository.save(existingItem);
            } else {
                int qty = guestItem.getQuantity();
                if (qty > product.getStockQuantity()) {
                    qty = product.getStockQuantity();
                }
                CartItem newItem = new CartItem();
                newItem.setCart(cart);
                newItem.setProductId(guestItem.getProductId());
                newItem.setQuantity(qty);
                newItem.setChecked(true);
                cart.getItems().add(newItem);
                cartItemRepository.save(newItem);
            }
        }

        cartRepository.save(cart);
        return getCart(email);
    }
}

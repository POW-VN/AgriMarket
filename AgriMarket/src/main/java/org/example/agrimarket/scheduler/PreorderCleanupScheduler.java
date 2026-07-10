package org.example.agrimarket.scheduler;

import org.example.agrimarket.model.Preorder;
import org.example.agrimarket.model.PreorderItem;
import org.example.agrimarket.model.Product;
import org.example.agrimarket.repository.PreorderItemRepository;
import org.example.agrimarket.repository.PreorderRepository;
import org.example.agrimarket.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import org.example.agrimarket.service.OrderService;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Component
public class PreorderCleanupScheduler {

    private static final Logger logger = LoggerFactory.getLogger(PreorderCleanupScheduler.class);

    @Autowired
    private PreorderRepository preorderRepository;

    @Autowired
    private PreorderItemRepository preorderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderService orderService;

    /**
     * Runs every 1 minute to delete preorders with "pending_payment" status
     * that are older than 10 minutes (abandoned checkout).
     */
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void cleanupAbandonedPreorders() {
        LocalDateTime expirationTime = LocalDateTime.now().minusMinutes(10);
        List<Preorder> allPreorders = preorderRepository.findAll();
        
        for (Preorder preorder : allPreorders) {
            if ("pending_payment".equalsIgnoreCase(preorder.getStatus())) {
                LocalDateTime createdAt = preorder.getCreatedAt();
                if (createdAt == null || createdAt.isBefore(expirationTime)) {
                    logger.info("Cleaning up abandoned preorder ID: {} created at: {}", preorder.getId(), createdAt);
                    
                    List<PreorderItem> items = preorderItemRepository.findByPreorderId(preorder.getId());
                    if (!items.isEmpty()) {
                        preorderItemRepository.deleteAll(items);
                    }
                    preorderRepository.delete(preorder);
                }
            }
        }
    }

    /**
     * Runs every 1 minute to automatically convert preorder products whose harvest date
     * has reached or passed today into normal products.
     */
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void convertHarvestedPreorders() {
        LocalDate today = LocalDate.now();
        List<Product> products = productRepository.findAll();
        
        for (Product product : products) {
            if (product.getIsPreorder() != null && product.getIsPreorder()) {
                if (product.getHarvestDate() != null && !product.getHarvestDate().isAfter(today)) {
                    logger.info("Auto-converting harvested preorder product ID: {} ({}) to normal product. Stock remains: {}", 
                            product.getId(), product.getName(), product.getStockQuantity());
                    product.setIsPreorder(false);
                    productRepository.save(product);

                    // Chuyển đổi cọc đặt trước thành đơn hàng thường và tạo vận chuyển
                    List<PreorderItem> items = preorderItemRepository.findByProductId(product.getId());
                    java.util.Set<Long> processedPreorderIds = new java.util.HashSet<>();
                    for (PreorderItem item : items) {
                        Preorder preorder = item.getPreorder();
                        if (preorder != null && preorder.getCustomer() != null) {
                            if (!"cancelled".equalsIgnoreCase(preorder.getStatus()) && !"completed".equalsIgnoreCase(preorder.getStatus())) {
                                Long preorderId = preorder.getId();
                                if (!processedPreorderIds.contains(preorderId)) {
                                    processedPreorderIds.add(preorderId);
                                    
                                    preorder.setStatus("completed");
                                    preorderRepository.save(preorder);

                                    orderService.convertPreorderToNormalOrder(preorder);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

package org.example.agrimarket.scheduler;

import org.example.agrimarket.model.Preorder;
import org.example.agrimarket.model.PreorderItem;
import org.example.agrimarket.repository.PreorderItemRepository;
import org.example.agrimarket.repository.PreorderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class PreorderCleanupScheduler {

    private static final Logger logger = LoggerFactory.getLogger(PreorderCleanupScheduler.class);

    @Autowired
    private PreorderRepository preorderRepository;

    @Autowired
    private PreorderItemRepository preorderItemRepository;

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
}

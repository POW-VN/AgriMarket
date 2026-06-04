package org.example.agrimarket.controller;

import org.example.agrimarket.model.Customer;
import org.example.agrimarket.model.Farmer;
import org.example.agrimarket.model.Notification;
import org.example.agrimarket.repository.CustomerRepository;
import org.example.agrimarket.repository.FarmerRepository;
import org.example.agrimarket.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @GetMapping
    public ResponseEntity<?> getNotifications(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = principal.getName();
        String receiverType = "";
        Long receiverId = null;

        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isPresent()) {
            receiverType = "customer";
            receiverId = customerOpt.get().getId();
        } else {
            Optional<Farmer> farmerOpt = farmerRepository.findByEmail(email);
            if (farmerOpt.isPresent()) {
                receiverType = "farmer";
                receiverId = farmerOpt.get().getId();
            }
        }

        if (receiverId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found");
        }

        List<Notification> notifications = notificationRepository.findByReceiverTypeAndReceiverIdOrderByCreatedAtDesc(receiverType, receiverId);

        // Seed mock notifications if empty
        if (notifications.isEmpty()) {
            seedMockNotifications(receiverType, receiverId);
            notifications = notificationRepository.findByReceiverTypeAndReceiverIdOrderByCreatedAtDesc(receiverType, receiverId);
        }

        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        Optional<Notification> notifOpt = notificationRepository.findById(id);
        if (notifOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Notification not found");
        }

        Notification notification = notifOpt.get();
        // Toggle read status or just mark as read
        notification.setIsRead(!notification.getIsRead());
        notificationRepository.save(notification);

        return ResponseEntity.ok(notification);
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = principal.getName();
        String receiverType = "";
        Long receiverId = null;

        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isPresent()) {
            receiverType = "customer";
            receiverId = customerOpt.get().getId();
        } else {
            Optional<Farmer> farmerOpt = farmerRepository.findByEmail(email);
            if (farmerOpt.isPresent()) {
                receiverType = "farmer";
                receiverId = farmerOpt.get().getId();
            }
        }

        if (receiverId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found");
        }

        List<Notification> unreadNotifs = notificationRepository.findByReceiverTypeAndReceiverIdOrderByCreatedAtDesc(receiverType, receiverId);
        for (Notification notif : unreadNotifs) {
            if (!notif.getIsRead()) {
                notif.setIsRead(true);
                notificationRepository.save(notif);
            }
        }

        return ResponseEntity.ok("All marked as read");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        if (!notificationRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Notification not found");
        }

        notificationRepository.deleteById(id);
        return ResponseEntity.ok("Notification deleted");
    }

    private void seedMockNotifications(String receiverType, Long receiverId) {
        if ("farmer".equals(receiverType)) {
            notificationRepository.save(Notification.builder()
                    .receiverType(receiverType)
                    .receiverId(receiverId)
                    .title("Đơn hàng mới #1082 📦")
                    .content("Bạn nhận được đơn hàng mới chứa 10kg Cam sành hữu cơ từ khách hàng Nguyễn Văn A. Hãy chuẩn bị hàng và giao đi nhé!")
                    .isRead(false)
                    .createdAt(LocalDateTime.now().minusMinutes(5))
                    .build());

            notificationRepository.save(Notification.builder()
                    .receiverType(receiverType)
                    .receiverId(receiverId)
                    .title("AI gợi ý giá tối ưu ✨")
                    .content("AI đã phân tích giá thị trường cho 'Táo hữu cơ'. Xem ngay đề xuất giá bán của AI tại trang quản lý sản phẩm để tăng doanh thu.")
                    .isRead(false)
                    .createdAt(LocalDateTime.now().minusHours(2))
                    .build());

            notificationRepository.save(Notification.builder()
                    .receiverType(receiverType)
                    .receiverId(receiverId)
                    .title("Chúc mừng nông trại của bạn! 🎉")
                    .content("Chứng nhận nguồn gốc hữu cơ cho nông trại 'Green Garden' đã được quản trị viên duyệt thành công. Sản phẩm của bạn sẽ có nhãn Organic.")
                    .isRead(true)
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .build());

            notificationRepository.save(Notification.builder()
                    .receiverType(receiverType)
                    .receiverId(receiverId)
                    .title("Hệ thống chào mừng 🚜")
                    .content("Chào mừng bạn gia nhập AgriMarket. Hãy thêm sản phẩm nông sản đầu tiên để tiếp cận hàng ngàn khách hàng tiềm năng!")
                    .isRead(true)
                    .createdAt(LocalDateTime.now().minusDays(3))
                    .build());
        } else {
            notificationRepository.save(Notification.builder()
                    .receiverType(receiverType)
                    .receiverId(receiverId)
                    .title("Đơn hàng đang giao 🚚")
                    .content("Đơn hàng #1082 (5kg Cam sành hữu cơ) của bạn đã được đơn vị vận chuyển lấy hàng và đang trên đường giao đến bạn.")
                    .isRead(false)
                    .createdAt(LocalDateTime.now().minusMinutes(12))
                    .build());

            notificationRepository.save(Notification.builder()
                    .receiverType(receiverType)
                    .receiverId(receiverId)
                    .title("Voucher tặng bạn! 🎁")
                    .content("AgriMarket tặng bạn Voucher giảm giá 10% (tối đa 50,000đ) cho tất cả các sản phẩm rau củ hữu cơ. Sử dụng ngay trước khi hết hạn!")
                    .isRead(false)
                    .createdAt(LocalDateTime.now().minusHours(4))
                    .build());

            notificationRepository.save(Notification.builder()
                    .receiverType(receiverType)
                    .receiverId(receiverId)
                    .title("Gợi ý thông minh từ AI ✨")
                    .content("AI nhận thấy bạn thích các sản phẩm hữu cơ tươi sạch. Chúng tôi gợi ý một số nông trại dâu tây đang có giá tốt gần bạn!")
                    .isRead(true)
                    .createdAt(LocalDateTime.now().minusDays(2))
                    .build());

            notificationRepository.save(Notification.builder()
                    .receiverType(receiverType)
                    .receiverId(receiverId)
                    .title("Chào mừng đến với AgriMarket! 🚜")
                    .content("Cảm ơn bạn đã lựa chọn mua sắm nông sản sạch trực tiếp từ các chủ nông trại địa phương. Chúc bạn có trải nghiệm mua sắm tuyệt vời.")
                    .isRead(true)
                    .createdAt(LocalDateTime.now().minusDays(5))
                    .build());
        }
    }
}

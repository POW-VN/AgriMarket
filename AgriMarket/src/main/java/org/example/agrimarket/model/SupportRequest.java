package org.example.agrimarket.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "support_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String title;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(length = 50)
    private String status = "pending"; // pending, assigned, processing, resolved, rejected

    @Column(columnDefinition = "NVARCHAR(100)")
    private String category; // Theo dõi Giao hàng, Thanh toán & Hóa đơn, Tài khoản & Bảo mật, Hỗ trợ Kỹ thuật, Báo cáo Vi phạm, Khác

    @Column(name = "order_code", length = 100)
    private String orderCode;

    @Column(length = 20)
    private String priority = "medium"; // low, medium, high

    @Column(name = "attachment_url", length = 1000)
    private String attachmentUrl;

    @Column(name = "admin_notes", columnDefinition = "NVARCHAR(MAX)")
    private String adminNotes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "pending";
        }
        if (priority == null) {
            priority = "medium";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

// src/pages/Profile/Notifications.jsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import useNotifications from "../../hooks/useNotifications";
import "./Notifications.css";

const fallbackProfile = {
    fullName: "Người dùng",
    email: "",
    phone: "",
    avatarUrl: "",
    role: "customer",
};

const getStoredProfile = () => {
    try {
        /*
          TODO BACKEND:
          Nếu dự án của bạn đang lưu user bằng key khác trong localStorage
          thì sửa lại ở đây.
    
          Ví dụ:
          localStorage.getItem("currentUser")
          localStorage.getItem("authUser")
        */
        const savedProfile =
            localStorage.getItem("farmconnect_user") ||
            localStorage.getItem("profile") ||
            localStorage.getItem("user");

        if (!savedProfile) {
            return fallbackProfile;
        }

        const parsedProfile = JSON.parse(savedProfile);

        return {
            ...fallbackProfile,
            ...parsedProfile,
            role:
                parsedProfile?.role?.name ||
                parsedProfile?.role ||
                parsedProfile?.userType ||
                fallbackProfile.role,
        };
    } catch (error) {
        console.error("Không thể đọc thông tin người dùng:", error);
        return fallbackProfile;
    }
};

const getNotificationType = (notification) => {
    /*
      TODO BACKEND:
      Nếu backend có cột type, ví dụ:
      type: "ORDER"
      type: "PAYMENT"
      type: "SYSTEM"
      type: "FARMER"
  
      thì nên dùng trực tiếp notification.type thay vì tự đoán theo title/content.
  
      Ví dụ:
      return notification.type?.toLowerCase();
    */

    const text = `${notification.title} ${notification.content}`.toLowerCase();

    if (
        text.includes("đơn hàng") ||
        text.includes("giao") ||
        text.includes("ord")
    ) {
        return "order";
    }

    if (text.includes("thanh toán") || text.includes("payment")) {
        return "payment";
    }

    if (
        text.includes("nhà vườn") ||
        text.includes("nông dân") ||
        text.includes("sản phẩm") ||
        text.includes("duyệt") ||
        text.includes("xác minh")
    ) {
        return "farmer";
    }

    return "system";
};

const getTypeInfo = (type) => {
    switch (type) {
        case "order":
            return {
                icon: "📦",
                label: "Đơn hàng",
                className: "type-order",
            };

        case "payment":
            return {
                icon: "💳",
                label: "Thanh toán",
                className: "type-payment",
            };

        case "farmer":
            return {
                icon: "🚜",
                label: "Nhà vườn",
                className: "type-farmer",
            };

        default:
            return {
                icon: "🔔",
                label: "Hệ thống",
                className: "type-system",
            };
    }
};

const formatTime = (dateString) => {
    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const now = new Date();
    const diffMs = now - date;

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
        return "Vừa xong";
    }

    if (diffMinutes < 60) {
        return `${diffMinutes} phút trước`;
    }

    if (diffHours < 24) {
        return `${diffHours} giờ trước`;
    }

    if (diffDays === 1) {
        return "Hôm qua";
    }

    return `${diffDays} ngày trước`;
};

const Notifications = () => {
    const navigate = useNavigate();
    const profile = getStoredProfile();

    const {
        notifications,
        unreadCount,
        loadingNotifications,
        markAsRead,
        markAllAsRead,
        loadNotifications,
    } = useNotifications();

    const [activeTab, setActiveTab] = useState("all");

    const filteredNotifications = useMemo(() => {
        if (activeTab === "all") {
            return notifications;
        }

        if (activeTab === "unread") {
            return notifications.filter((item) => !item.isRead);
        }

        return notifications.filter(
            (item) => getNotificationType(item) === activeTab
        );
    }, [notifications, activeTab]);

    const countByType = (type) => {
        return notifications.filter((item) => getNotificationType(item) === type)
            .length;
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
    };

    const handleViewDetail = async (notification) => {
        const type = getNotificationType(notification);

        if (!notification.isRead) {
            await markAsRead(notification.id);
        }

        /*
          TODO BACKEND:
          Sau này nếu backend trả thêm targetUrl hoặc referenceId,
          bạn nên điều hướng theo dữ liệu backend thay vì tự đoán.
    
          Ví dụ:
          notification.targetUrl = "/profile/orders/12"
          navigate(notification.targetUrl)
        */

        if (type === "order" || type === "payment") {
            navigate("/profile/orders");
            return;
        }

        if (type === "farmer") {
            navigate("/farmer/dashboard");
            return;
        }
    };

    return (
        <div className="notifications-page">
            <ProfileSidebar profile={profile} />

            <main className="notifications-main">
                <section className="notifications-header">
                    <div>
                        <p className="notifications-eyebrow">Trung tâm thông báo</p>
                        <h1>Thông báo của bạn</h1>
                        <p>
                            Theo dõi đơn hàng, thanh toán, trạng thái nhà vườn và các cập
                            nhật mới từ hệ thống AgriMarket.
                        </p>
                    </div>

                    <div className="notifications-header-actions">
                        <button
                            className="reload-button"
                            onClick={loadNotifications}
                            disabled={loadingNotifications}
                        >
                            ↻ Tải lại
                        </button>

                        <button
                            className="mark-all-button"
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                        >
                            ✓ Đánh dấu tất cả đã đọc
                        </button>
                    </div>
                </section>

                <section className="notification-summary-grid">
                    <div className="notification-summary-card">
                        <span className="summary-icon">🔔</span>
                        <div>
                            <p>Tất cả</p>
                            <strong>{notifications.length}</strong>
                        </div>
                    </div>

                    <div className="notification-summary-card unread">
                        <span className="summary-icon">●</span>
                        <div>
                            <p>Chưa đọc</p>
                            <strong>{unreadCount}</strong>
                        </div>
                    </div>

                    <div className="notification-summary-card">
                        <span className="summary-icon">📦</span>
                        <div>
                            <p>Đơn hàng</p>
                            <strong>{countByType("order")}</strong>
                        </div>
                    </div>

                    <div className="notification-summary-card">
                        <span className="summary-icon">🚜</span>
                        <div>
                            <p>Nhà vườn</p>
                            <strong>{countByType("farmer")}</strong>
                        </div>
                    </div>
                </section>

                <section className="notifications-panel">
                    <div className="notifications-tabs">
                        <button
                            className={activeTab === "all" ? "active" : ""}
                            onClick={() => setActiveTab("all")}
                        >
                            Tất cả
                            <span>{notifications.length}</span>
                        </button>

                        <button
                            className={activeTab === "unread" ? "active" : ""}
                            onClick={() => setActiveTab("unread")}
                        >
                            Chưa đọc
                            <span>{unreadCount}</span>
                        </button>

                        <button
                            className={activeTab === "order" ? "active" : ""}
                            onClick={() => setActiveTab("order")}
                        >
                            Đơn hàng
                            <span>{countByType("order")}</span>
                        </button>

                        <button
                            className={activeTab === "payment" ? "active" : ""}
                            onClick={() => setActiveTab("payment")}
                        >
                            Thanh toán
                            <span>{countByType("payment")}</span>
                        </button>

                        <button
                            className={activeTab === "farmer" ? "active" : ""}
                            onClick={() => setActiveTab("farmer")}
                        >
                            Nhà vườn
                            <span>{countByType("farmer")}</span>
                        </button>
                    </div>

                    <div className="notifications-list">
                        {loadingNotifications ? (
                            <div className="notification-loading">
                                <div className="loading-spinner"></div>
                                <p>Đang tải thông báo...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="empty-notification">
                                <div className="empty-icon">🔕</div>
                                <h3>Chưa có thông báo</h3>
                                <p>
                                    Khi Admin tạo thông báo hoặc hệ thống phát sinh cập nhật mới,
                                    thông báo sẽ hiển thị tại đây.
                                </p>
                            </div>
                        ) : (
                            filteredNotifications.map((notification) => {
                                const type = getNotificationType(notification);
                                const typeInfo = getTypeInfo(type);

                                return (
                                    <article
                                        key={notification.id}
                                        className={`notification-card ${!notification.isRead ? "unread" : ""
                                            }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className={`notification-icon ${typeInfo.className}`}>
                                            {typeInfo.icon}
                                        </div>

                                        <div className="notification-body">
                                            <div className="notification-title-row">
                                                <h3>{notification.title}</h3>

                                                <div className="notification-meta">
                                                    <span>{formatTime(notification.createdAt)}</span>

                                                    {!notification.isRead && (
                                                        <span className="unread-dot"></span>
                                                    )}
                                                </div>
                                            </div>

                                            <p>{notification.content}</p>

                                            <div className="notification-footer">
                                                <span
                                                    className={`notification-type ${typeInfo.className}`}
                                                >
                                                    {typeInfo.label}
                                                </span>

                                                {(type === "order" ||
                                                    type === "payment" ||
                                                    type === "farmer") && (
                                                        <button
                                                            className="notification-detail-button"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                handleViewDetail(notification);
                                                            }}
                                                        >
                                                            Xem chi tiết →
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Notifications;
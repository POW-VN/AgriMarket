// src/pages/Admin/Notifications/AdminNotifications.jsx

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import adminNotificationService from "../../../services/adminNotificationService";
import authService from "../../../services/authService";
import "../AdminStyles.css";
import "./AdminNotifications.css";

const notificationTypes = [
    {
        value: "system",
        label: "Thông báo hệ thống",
        icon: "🔔",
    },
    {
        value: "order",
        label: "Thông báo đơn hàng",
        icon: "📦",
    },
    {
        value: "payment",
        label: "Thông báo thanh toán",
        icon: "💳",
    },
    {
        value: "farmer",
        label: "Thông báo nhà vườn",
        icon: "🚜",
    },
    {
        value: "promotion",
        label: "Thông báo khuyến mãi",
        icon: "🎁",
    },
];

const audienceOptions = [
    {
        value: "all",
        label: "Tất cả người dùng",
        description: "Customer, Farmer và các tài khoản hợp lệ trong hệ thống",
    },
    {
        value: "customer",
        label: "Chỉ khách hàng",
        description: "Các tài khoản mua nông sản",
    },
    {
        value: "farmer",
        label: "Chỉ nhà vườn",
        description: "Các tài khoản đã đăng ký làm nông dân / nhà vườn",
    },
    {
        value: "partner",
        label: "Đơn vị vận chuyển",
        description: "Các tài khoản shipper hoặc transport partner",
    },
    {
        value: "single",
        label: "Gửi riêng 1 user",
        description: "Gửi thông báo tới một người dùng cụ thể",
    },
];

const channelOptions = [
    {
        value: "in_app",
        label: "Thông báo trong hệ thống",
    },
    {
        value: "email",
        label: "Email",
    },
    {
        value: "push",
        label: "Push notification",
    },
];

const initialForm = {
    title: "",
    content: "",
    notificationType: "system",
    targetAudience: "all",
    channels: ["in_app"],
    sendMode: "now",
    scheduledAt: "",
    targetUserId: "",
    targetUserType: "",
};

const getAudienceLabel = (value) => {
    return audienceOptions.find((item) => item.value === value)?.label || value;
};

const getTypeInfo = (value) => {
    return (
        notificationTypes.find((item) => item.value === value) ||
        notificationTypes[0]
    );
};

const formatDateTime = (dateString) => {
    if (!dateString) {
        return "-";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const AdminNotifications = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [form, setForm] = useState(initialForm);
    const [users, setUsers] = useState([]);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const handleToggleUser = (user) => {
        setSelectedUsers((prev) => {
            const exists = prev.some((u) => u.id === user.id && u.type === user.type);
            if (exists) {
                return prev.filter((u) => !(u.id === user.id && u.type === user.type));
            } else {
                return [...prev, user];
            }
        });
    };

    const filteredUsers = useMemo(() => {
        if (!userSearchQuery.trim()) {
            return users;
        }
        const q = userSearchQuery.toLowerCase();
        return users.filter(u => 
            String(u.id).includes(q) ||
            u.fullName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.extraInfo && u.extraInfo.toLowerCase().includes(q)) ||
            u.type.toLowerCase().includes(q)
        );
    }, [users, userSearchQuery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showUserDropdown && !event.target.closest(".single-user-selector-container")) {
                setShowUserDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showUserDropdown]);
    const [stats, setStats] = useState({
        totalSent: 0,
        scheduled: 0,
        failed: 0,
        openRate: 0,
    });
    const [recentBroadcasts, setRecentBroadcasts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingPage, setLoadingPage] = useState(true);
    const [message, setMessage] = useState(null);

    const getFullImageUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
            return url;
        }
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
        const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
        return `${API_BASE_URL}/${cleanUrl}`;
    };

    const filteredBroadcasts = useMemo(() => {
        if (!searchQuery.trim()) {
            return recentBroadcasts;
        }
        const query = searchQuery.toLowerCase();
        return recentBroadcasts.filter(
            (item) =>
                item.title.toLowerCase().includes(query) ||
                item.content.toLowerCase().includes(query)
        );
    }, [recentBroadcasts, searchQuery]);

    const selectedTypeInfo = useMemo(() => {
        return getTypeInfo(form.notificationType);
    }, [form.notificationType]);

    const isFormValid = useMemo(() => {
        if (!form.title.trim()) {
            return false;
        }

        if (!form.content.trim()) {
            return false;
        }

        if (form.channels.length === 0) {
            return false;
        }

        if (form.sendMode === "schedule" && !form.scheduledAt) {
            return false;
        }

        if (form.targetAudience === "single" && selectedUsers.length === 0) {
            return false;
        }

        return true;
    }, [form, selectedUsers]);

    useEffect(() => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        loadAdminNotificationData();
    }, []);

    const loadAdminNotificationData = async () => {
        setLoadingPage(true);

        const [statsData, broadcastsData, usersData] = await Promise.all([
            adminNotificationService.getNotificationStats(),
            adminNotificationService.getRecentBroadcasts(),
            adminNotificationService.getSimplifiedUsers(),
        ]);

        setStats(statsData);
        setRecentBroadcasts(broadcastsData);
        setUsers(usersData || []);
        setLoadingPage(false);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleChannelChange = (channelValue) => {
        setForm((prev) => {
            const isChecked = prev.channels.includes(channelValue);

            return {
                ...prev,
                channels: isChecked
                    ? prev.channels.filter((item) => item !== channelValue)
                    : [...prev.channels, channelValue],
            };
        });
    };

    const handleSubmit = async (sendMode) => {
        if (!isFormValid) {
            setMessage({
                type: "error",
                text: "Vui lòng nhập đầy đủ tiêu đề, nội dung và chọn ít nhất một kênh gửi.",
            });
            return;
        }

        setLoading(true);
        setMessage(null);

        const payload = {
            title: form.title.trim(),
            content: form.content.trim(),
            notificationType: form.notificationType,
            targetAudience: form.targetAudience,
            channels: form.channels,
            sendMode,
            scheduledAt: sendMode === "schedule" ? form.scheduledAt : null,
            targetUsers: form.targetAudience === "single" 
                ? selectedUsers.map(u => `${u.type}:${u.id}`).join(",") 
                : null
        };

        const result = await adminNotificationService.createNotification(payload);

        setLoading(false);

        if (!result.success) {
            setMessage({
                type: "error",
                text: result.message,
            });
            return;
        }

        setMessage({
            type: "success",
            text:
                sendMode === "draft"
                    ? "Đã lưu bản nháp thông báo."
                    : sendMode === "schedule"
                        ? "Đã lên lịch gửi thông báo."
                        : "Đã gửi thông báo thành công.",
        });

        setForm(initialForm);
        setSelectedUsers([]);
        setUserSearchQuery("");

        /*
          TODO BACKEND:
          Khi backend đã lưu thông báo, gọi lại API để cập nhật thống kê và bảng gần đây.
        */
        loadAdminNotificationData();
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-logo-section">
                    <Link to="/" className="admin-logo-link">
                        <h1>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="7" cy="18" r="2"></circle>
                                <circle cx="18" cy="18" r="2"></circle>
                                <path d="M7 16h11v-2H9v-3h7V9H9V6H7v10z"></path>
                                <path d="M16 9h3l2 3v4"></path>
                            </svg>
                            AgriAdmin
                        </h1>
                    </Link>
                </div>

                <nav className="admin-nav-menu">
                    <button className="admin-nav-item" onClick={() => alert("Chức năng Bảng điều khiển đang phát triển.")}>
                        <span className="admin-nav-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                        </span>
                        Bảng điều khiển
                    </button>
                    <button className="admin-nav-item" onClick={() => navigate("/admin/users")}>
                        <span className="admin-nav-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </span>
                        Quản lý tài khoản
                    </button>

                    <button className="admin-nav-item" onClick={() => alert("Chức năng quản lý nông dân đang phát triển.")}>
                        <span className="admin-nav-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><path d="M2 22 22 2"></path><path d="M8.5 20c.2-.5.5-1 1-1.4l5.2-5.2c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0L6.7 15.8c-.4.4-.9.7-1.4 1"></path><path d="M16 18c.2-.5.5-1 1-1.4l3.7-3.7c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0l-3.7 3.7c-.4.4-.9.7-1.4 1"></path><path d="M14 11.5c.2-.5.5-1 1-1.4l3.7-3.7c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0l-3.7 3.7c-.4.4-.9.7-1.4 1"></path><path d="M5.5 14.5c.5-.2 1-.5 1.4-1l5.2-5.2c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0l-5.2 5.2c-.4.4-.7.9-1 1.4"></path><path d="M11.5 6c.5-.2 1-.5 1.4-1l3.7-3.7c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0L10.3 3.3c-.4.4-.7.9-1 1.4"></path></svg>
                        </span>
                        Nông dân
                    </button>
                    <button className="admin-nav-item" onClick={() => navigate("/admin/products")}>
                        <span className="admin-nav-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                        </span>
                        Duyệt sản phẩm
                    </button>
                    <button className="admin-nav-item" onClick={() => alert("Chức năng quản lý danh mục đang phát triển.")}>
                        <span className="admin-nav-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        </span>
                        Danh mục
                    </button>
                    <button className="admin-nav-item" onClick={() => navigate("/admin/orders")}>
                        <span className="admin-nav-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        </span>
                        Đơn hàng
                    </button>
                    <button className="admin-nav-item" onClick={() => alert("Chức năng giao dịch đang phát triển.")}>
                        <span className="admin-nav-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                        </span>
                        Giao dịch
                    </button>
                    <button className="admin-nav-item" onClick={() => navigate("/admin/complaints")}>
                        <span className="admin-nav-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </span>
                        Hỗ trợ
                    </button>
                    <button className="admin-nav-item" onClick={() => alert("Tính năng quản lý khiếu nại đang phát triển.")}>
                        <span className="admin-nav-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                        </span>
                        Khiếu nại
                    </button>
                    <button className="admin-nav-item" onClick={() => alert("Chức năng báo cáo đang phát triển.")}>
                        <span className="admin-nav-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                        </span>
                        Báo cáo
                    </button>
                    <button className="admin-nav-item" onClick={() => alert("Chức năng AI Monitoring đang phát triển.")}>
                        <span className="admin-nav-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>
                        </span>
                        Giám sát AI
                    </button>
                    <button className="admin-nav-item active" onClick={() => navigate("/admin/notifications")}>
                        <span className="admin-nav-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        </span>
                        Thông báo
                    </button>
                    <button className="admin-nav-item" onClick={() => alert("Chức năng thống kê hệ thống đang phát triển.")}>
                        <span className="admin-nav-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        </span>
                        Thống kê hệ thống
                    </button>
                    <button className="admin-nav-item" onClick={() => alert("Chức năng cài đặt đang phát triển.")}>
                        <span className="admin-nav-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        </span>
                        Cài đặt
                    </button>
                </nav>

                <div className="admin-sidebar-footer">
                    <img
                        src={getFullImageUrl(currentUser?.avatarUrl) || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"}
                        alt="Avatar admin"
                        className="admin-footer-avatar"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150";
                        }}
                    />
                    <div className="admin-footer-info">
                        <p className="admin-footer-name">{currentUser?.fullName || "Quản trị viên"}</p>
                        <p className="admin-footer-email">{currentUser?.email || "admin@agriadmin.com"}</p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="admin-main-container">
                {/* Header */}
                <header className="admin-header">
                    <div className="admin-search-wrapper">
                        <span className="admin-search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm thông báo..."
                            className="admin-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="admin-header-actions">
                        <button className="admin-notification-btn" aria-label="Notifications" onClick={() => alert("Không có thông báo mới.")}>
                            <span>🔔</span>
                            <span className="admin-notification-dot"></span>
                        </button>
                        <div className="admin-profile-pill" style={{ display: "flex", alignItems: "center", gap: "8px", borderLeft: "1px solid var(--admin-border)", paddingLeft: "12px" }}>
                            <span className="admin-avatar" style={{ width: "32px", height: "32px", backgroundColor: "var(--admin-primary)", color: "#fff", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : "A"}
                            </span>
                            <span style={{ fontSize: "14px", fontWeight: "600" }}>Admin Panel</span>
                        </div>
                    </div>
                </header>

                {/* Page Body */}
                <main className="admin-page-body">
                    <section className="admin-notifications-header">
                        <div>
                            <p className="admin-eyebrow">AgriMarket Admin</p>
                            <h1>Quản lý thông báo hệ thống</h1>
                            <p>
                                Tạo và gửi thông báo đến khách hàng, nhà vườn hoặc toàn bộ người
                                dùng trong hệ thống.
                            </p>
                        </div>

                        <button
                            className="admin-refresh-button"
                            onClick={loadAdminNotificationData}
                            disabled={loadingPage}
                        >
                            ↻ Tải lại
                        </button>
                    </section>

                    <section className="admin-notification-stats">
                        <div className="admin-stat-card">
                            <span className="stat-icon green">➤</span>
                            <div>
                                <p>Tổng đã gửi</p>
                                <strong>{stats.totalSent}</strong>
                            </div>
                        </div>

                        <div className="admin-stat-card">
                            <span className="stat-icon blue">◷</span>
                            <div>
                                <p>Đã lên lịch</p>
                                <strong>{stats.scheduled}</strong>
                            </div>
                        </div>

                        <div className="admin-stat-card">
                            <span className="stat-icon red">!</span>
                            <div>
                                <p>Gửi thất bại</p>
                                <strong>{stats.failed}</strong>
                            </div>
                        </div>

                        <div className="admin-stat-card">
                            <span className="stat-icon gray">◉</span>
                            <div>
                                <p>Tỷ lệ đã đọc</p>
                                <strong>{stats.openRate}%</strong>
                            </div>
                        </div>
                    </section>

                    <section className="admin-notification-content-grid">
                        <div className="create-notification-card">
                            <div className="card-title-row">
                                <div>
                                    <h2>✍ Tạo thông báo</h2>
                                    <p>Nhập nội dung và chọn nhóm người nhận phù hợp.</p>
                                </div>
                            </div>

                            {message && (
                                <div className={`admin-form-message ${message.type}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="notification-form-grid">
                                <div className="form-group">
                                    <label>Tiêu đề thông báo *</label>
                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: Bảo trì hệ thống"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Loại thông báo *</label>
                                    <select
                                        name="notificationType"
                                        value={form.notificationType}
                                        onChange={handleChange}
                                    >
                                        {notificationTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.icon} {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Nội dung thông báo *</label>
                                <textarea
                                    name="content"
                                    value={form.content}
                                    onChange={handleChange}
                                    placeholder="Nhập nội dung thông báo sẽ gửi đến người dùng..."
                                    rows={7}
                                />
                            </div>

                            <div className="target-channel-grid">
                                <div className="form-section">
                                    <h3>Nhóm người nhận</h3>

                                    <div className="option-list">
                                        {audienceOptions.map((audience) => (
                                            <label key={audience.value} className="radio-option">
                                                <input
                                                    type="radio"
                                                    name="targetAudience"
                                                    value={audience.value}
                                                    checked={form.targetAudience === audience.value}
                                                    onChange={handleChange}
                                                />

                                                <span>
                                                    <strong>{audience.label}</strong>
                                                    <small>{audience.description}</small>
                                                </span>
                                            </label>
                                        ))}
                                    </div>

                                    {form.targetAudience === "single" && (
                                        <div className="single-user-selector-container" style={{ marginTop: "16px", position: "relative" }}>
                                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "var(--admin-text-dark, #333)" }}>
                                                Chọn một hoặc nhiều người nhận cụ thể *
                                            </label>
                                            <div 
                                                className="searchable-dropdown-trigger"
                                                onClick={() => setShowUserDropdown(!showUserDropdown)}
                                                style={{
                                                    padding: "10px 14px",
                                                    border: "1px solid var(--admin-border, #e0e0e0)",
                                                    borderRadius: "8px",
                                                    backgroundColor: "#fff",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    minHeight: "42px",
                                                    flexWrap: "wrap",
                                                    gap: "6px"
                                                }}
                                            >
                                                {selectedUsers.length > 0 ? (
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", width: "90%" }}>
                                                        {selectedUsers.map(u => (
                                                            <span 
                                                                key={`${u.type}-${u.id}`} 
                                                                style={{
                                                                    padding: "4px 8px",
                                                                    borderRadius: "6px",
                                                                    backgroundColor: u.type === "farmer" ? "#eef9f1" : u.type === "customer" ? "#e8f4fd" : "#f1f1f1",
                                                                    color: u.type === "farmer" ? "#2e7d32" : u.type === "customer" ? "#1565c0" : "#616161",
                                                                    fontSize: "12px",
                                                                    fontWeight: "600",
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    gap: "4px"
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleToggleUser(u);
                                                                }}
                                                            >
                                                                {u.fullName}
                                                                <span style={{ cursor: "pointer", marginLeft: "4px", color: "#888", fontWeight: "bold" }}>×</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: "#888", fontSize: "14px" }}>
                                                        Chọn người dùng từ danh sách...
                                                    </span>
                                                )}
                                                <span style={{ fontSize: "12px", color: "#888" }}>▼</span>
                                            </div>

                                            {showUserDropdown && (
                                                <div 
                                                    className="searchable-dropdown-menu"
                                                    style={{
                                                        position: "absolute",
                                                        top: "100%",
                                                        left: 0,
                                                        right: 0,
                                                        backgroundColor: "#fff",
                                                        border: "1px solid var(--admin-border, #e0e0e0)",
                                                        borderRadius: "8px",
                                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                        zIndex: 99,
                                                        marginTop: "4px",
                                                        maxHeight: "300px",
                                                        display: "flex",
                                                        flexDirection: "column"
                                                    }}
                                                >
                                                    <input
                                                        type="text"
                                                        placeholder="Nhập tên, email hoặc ID để tìm kiếm..."
                                                        value={userSearchQuery}
                                                        onChange={(e) => setUserSearchQuery(e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{
                                                            padding: "10px 12px",
                                                            border: "none",
                                                            borderBottom: "1px solid #eee",
                                                            outline: "none",
                                                            fontSize: "14px",
                                                            width: "100%",
                                                            boxSizing: "border-box",
                                                            borderRadius: "8px 8px 0 0"
                                                        }}
                                                        autoFocus
                                                    />
                                                    <div style={{ overflowY: "auto", flex: 1, maxHeight: "240px" }}>
                                                        {filteredUsers.length === 0 ? (
                                                            <div style={{ padding: "12px", textAlign: "center", color: "#888", fontSize: "14px" }}>
                                                                Không tìm thấy người dùng nào
                                                            </div>
                                                        ) : (
                                                            filteredUsers.map((u) => {
                                                                const isChecked = selectedUsers.some(su => su.id === u.id && su.type === u.type);
                                                                return (
                                                                    <div
                                                                        key={`${u.type}-${u.id}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleToggleUser(u);
                                                                        }}
                                                                        style={{
                                                                            padding: "10px 12px",
                                                                            cursor: "pointer",
                                                                            fontSize: "13.5px",
                                                                            borderBottom: "1px solid #fafafa",
                                                                            transition: "background-color 0.15s",
                                                                            textAlign: "left",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: "10px"
                                                                        }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                                                    >
                                                                        <input 
                                                                            type="checkbox"
                                                                            checked={isChecked}
                                                                            readOnly
                                                                            style={{ cursor: "pointer" }}
                                                                        />
                                                                        <div style={{ flex: 1 }}>
                                                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                                                                                <strong>{u.fullName}</strong>
                                                                                <span style={{ 
                                                                                    fontSize: "11px", 
                                                                                    padding: "2px 6px", 
                                                                                    borderRadius: "4px", 
                                                                                    backgroundColor: u.type === "farmer" ? "#eef9f1" : u.type === "customer" ? "#e8f4fd" : "#f1f1f1",
                                                                                    color: u.type === "farmer" ? "#2e7d32" : u.type === "customer" ? "#1565c0" : "#616161",
                                                                                    fontWeight: "600"
                                                                                }}>
                                                                                    {u.type === "farmer" ? "NHÀ VƯỜN" : u.type === "customer" ? "KHÁCH HÀNG" : "VẬN CHUYỂN"}
                                                                                </span>
                                                                            </div>
                                                                            <div style={{ color: "#666", fontSize: "12px" }}>
                                                                                Email: {u.email} | ID: {u.id}
                                                                                {u.type === "farmer" && u.extraInfo && ` | Tên farm: ${u.extraInfo}`}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="form-section">
                                    <h3>Kênh gửi</h3>

                                    <div className="option-list">
                                        {channelOptions.map((channel) => (
                                            <label key={channel.value} className="checkbox-option">
                                                <input
                                                    type="checkbox"
                                                    checked={form.channels.includes(channel.value)}
                                                    onChange={() => handleChannelChange(channel.value)}
                                                />

                                                <span>{channel.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="schedule-box">
                                <div>
                                    <h3>Thời gian gửi</h3>
                                    <p>Chọn gửi ngay, lưu nháp hoặc lên lịch gửi sau.</p>
                                </div>

                                <div className="send-mode-buttons">
                                    <button
                                        type="button"
                                        className={form.sendMode === "now" ? "active" : ""}
                                        onClick={() =>
                                            setForm((prev) => ({ ...prev, sendMode: "now" }))
                                        }
                                    >
                                        Gửi ngay
                                    </button>

                                    <button
                                        type="button"
                                        className={form.sendMode === "schedule" ? "active" : ""}
                                        onClick={() =>
                                            setForm((prev) => ({ ...prev, sendMode: "schedule" }))
                                        }
                                    >
                                        Lên lịch
                                    </button>
                                </div>
                            </div>

                            {form.sendMode === "schedule" && (
                                <div className="form-group">
                                    <label>Thời gian gửi *</label>
                                    <input
                                        type="datetime-local"
                                        name="scheduledAt"
                                        value={form.scheduledAt}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}

                            <div className="form-actions">
                                <button
                                    className="secondary-button"
                                    type="button"
                                    disabled={loading}
                                    onClick={() => handleSubmit("draft")}
                                >
                                    Lưu nháp
                                </button>

                                <button
                                    className="outline-button"
                                    type="button"
                                    disabled={loading || form.sendMode !== "schedule"}
                                    onClick={() => handleSubmit("schedule")}
                                >
                                    Lên lịch gửi
                                </button>

                                <button
                                    className="primary-button"
                                    type="button"
                                    disabled={loading || !isFormValid}
                                    onClick={() => handleSubmit("now")}
                                >
                                    {loading ? "Đang xử lý..." : "➤ Gửi thông báo"}
                                </button>
                            </div>
                        </div>

                        <aside className="notification-preview-card">
                            <p className="preview-label">Xem trước</p>

                            <div className="phone-preview">
                                <div className="phone-status">
                                    <span>9:41</span>
                                    <span>● ● ●</span>
                                </div>

                                <div className="phone-header">AgriMarket</div>

                                <div className="phone-notification">
                                    <div className="phone-icon">{selectedTypeInfo.icon}</div>

                                    <div>
                                        <h4>{form.title || "Tiêu đề thông báo"}</h4>
                                        <p>
                                            {form.content ||
                                                "Nội dung thông báo sẽ được hiển thị tại đây..."}
                                        </p>
                                        <span>{getAudienceLabel(form.targetAudience)}</span>
                                    </div>
                                </div>

                                <div className="phone-placeholder"></div>
                                <div className="phone-placeholder small"></div>
                            </div>

                            <div className="preview-info">
                                <div>
                                    <span>Loại</span>
                                    <strong>{selectedTypeInfo.label}</strong>
                                </div>

                                <div>
                                    <span>Người nhận</span>
                                    <strong>{getAudienceLabel(form.targetAudience)}</strong>
                                </div>

                                <div>
                                    <span>Kênh gửi</span>
                                    <strong>{form.channels.length}</strong>
                                </div>
                            </div>
                        </aside>
                    </section>

                    <section className="recent-broadcasts-card">
                        <div className="recent-header">
                            <div>
                                <h2>Thông báo gần đây</h2>
                                <p>Danh sách các thông báo Admin đã tạo trong hệ thống.</p>
                            </div>
                        </div>

                        <div className="recent-table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Tiêu đề</th>
                                        <th>Nhóm nhận</th>
                                        <th>Thời gian gửi</th>
                                        <th>Trạng thái</th>
                                        <th>Tỷ lệ đọc</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loadingPage ? (
                                        <tr>
                                            <td colSpan="5" className="empty-table">
                                                Đang tải dữ liệu...
                                            </td>
                                        </tr>
                                    ) : filteredBroadcasts.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="empty-table">
                                                {searchQuery ? "Không tìm thấy thông báo phù hợp." : "Chưa có thông báo nào. Khi backend hoàn thành và Admin tạo thông báo, dữ liệu sẽ hiển thị tại đây."}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredBroadcasts.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <strong>{item.title}</strong>
                                                    <small>{getTypeInfo(item.notificationType).label}</small>
                                                </td>

                                                <td>{getAudienceLabel(item.targetAudience)}</td>

                                                <td>{formatDateTime(item.sentAt)}</td>

                                                <td>
                                                    <span className={`status-badge ${item.status}`}>
                                                        {item.status === "sent"
                                                            ? "Đã gửi"
                                                            : item.status === "scheduled"
                                                                ? "Đã lên lịch"
                                                                : item.status === "failed"
                                                                    ? "Thất bại"
                                                                    : "Bản nháp"}
                                                    </span>
                                                </td>

                                                <td>
                                                    {item.openRate === null || item.openRate === undefined
                                                        ? "-"
                                                        : `${item.openRate}%`}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default AdminNotifications;
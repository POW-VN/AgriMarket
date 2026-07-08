import React from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../../services/authService";

const AdminSidebar = ({ activeItem, showToast, onProductsClick, onComplaintsClick }) => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const getFullImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
    return `${API_BASE_URL}/${cleanUrl}`;
  };

  const handleShowToast = (msg) => {
    if (showToast) {
      showToast(msg);
    } else {
      alert(msg);
    }
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo-section">
        <Link to="/admin/users" className="admin-logo-link">
          <div className="admin-logo-link-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="18" r="2"></circle><circle cx="18" cy="18" r="2"></circle>
              <path d="M7 16h11v-2H9v-3h7V9H9V6H7v10z"></path><path d="M16 9h3l2 3v4"></path>
            </svg>
          </div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "var(--admin-primary)", whiteSpace: "nowrap" }}>AgriAdmin</h1>
        </Link>
      </div>

      <nav className="admin-nav-menu">
        <button className={`admin-nav-item ${activeItem === "dashboard" ? "active" : ""}`} onClick={() => handleShowToast("Chức năng Bảng điều khiển đang phát triển.")}>
          <span className="admin-nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg></span>
          <span className="nav-label">Bảng điều khiển</span>
        </button>

        <button className={`admin-nav-item ${activeItem === "users" ? "active" : ""}`} onClick={() => navigate("/admin/users")}>
          <span className="admin-nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></span>
          <span className="nav-label">Quản lý tài khoản</span>
        </button>

        <button className={`admin-nav-item ${activeItem === "farmer" ? "active" : ""}`} onClick={() => handleShowToast("Chức năng quản lý nông dân đang phát triển.")}>
          <span className="admin-nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><path d="M2 22 22 2"></path><path d="M8.5 20c.2-.5.5-1 1-1.4l5.2-5.2c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0L6.7 15.8c-.4.4-.9.7-1.4 1"></path><path d="M16 18c.2-.5.5-1 1-1.4l3.7-3.7c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0l-3.7 3.7c-.4.4-.9.7-1.4 1"></path><path d="M14 11.5c.2-.5.5-1 1-1.4l3.7-3.7c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0l-3.7 3.7c-.4.4-.9.7-1.4 1"></path><path d="M5.5 14.5c.5-.2 1-.5 1.4-1l5.2-5.2c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0l-5.2 5.2c-.4.4-.7.9-1 1.4"></path><path d="M11.5 6c.5-.2 1-.5 1.4-1l3.7-3.7c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0L10.3 3.3c-.4.4-.7.9-1 1.4"></path></svg></span>
          <span className="nav-label">Nông dân</span>
        </button>

        <button className={`admin-nav-item ${activeItem === "products" ? "active" : ""}`} onClick={() => { if (onProductsClick) { onProductsClick(); } navigate("/admin/products"); }}>
          <span className="admin-nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg></span>
          <span className="nav-label">Duyệt sản phẩm</span>
        </button>

        <button className={`admin-nav-item ${activeItem === "categories" ? "active" : ""}`} onClick={() => handleShowToast("Chức năng quản lý danh mục đang phát triển.")}>
          <span className="admin-nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg></span>
          <span className="nav-label">Danh mục</span>
        </button>

        <button className={`admin-nav-item ${activeItem === "orders" ? "active" : ""}`} onClick={() => navigate("/admin/orders")}>
          <span className="admin-nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg></span>
          <span className="nav-label">Đơn hàng</span>
        </button>

        <button className={`admin-nav-item ${activeItem === "transactions" ? "active" : ""}`} onClick={() => handleShowToast("Chức năng giao dịch đang phát triển.")}>
          <span className="admin-nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg></span>
          <span className="nav-label">Giao dịch</span>
        </button>

        <button className={`admin-nav-item ${activeItem === "complaints" ? "active" : ""}`} onClick={() => { if (onComplaintsClick) { onComplaintsClick(); } navigate("/admin/complaints"); }}>
          <span className="admin-nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></span>
          <span className="nav-label">Hỗ trợ</span>
        </button>

        <button className={`admin-nav-item ${activeItem === "reports" ? "active" : ""}`} onClick={() => navigate("/admin/reports")}>
          <span className="admin-nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg></span>
          <span className="nav-label">Báo cáo</span>
        </button>

        <button className={`admin-nav-item ${activeItem === "livestreams" ? "active" : ""}`} onClick={() => navigate("/admin/livestreams")}>
          <span className="admin-nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><path d="m22 8-6 4 6 4V8Z"></path><rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect></svg></span>
          <span className="nav-label">Quản lý Livestream</span>
        </button>

        <button className={`admin-nav-item ${activeItem === "ai" ? "active" : ""}`} onClick={() => handleShowToast("Chức năng AI Monitoring đang phát triển.")}>
          <span className="admin-nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg></span>
          <span className="nav-label">Giám sát AI</span>
        </button>

        <button className={`admin-nav-item ${activeItem === "notifications" ? "active" : ""}`} onClick={() => navigate("/admin/notifications")}>
          <span className="admin-nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></span>
          <span className="nav-label">Thông báo</span>
        </button>

        <button className={`admin-nav-item ${activeItem === "stats" ? "active" : ""}`} onClick={() => handleShowToast("Chức năng thống kê hệ thống đang phát triển.")}>
          <span className="admin-nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></span>
          <span className="nav-label">Thống kê hệ thống</span>
        </button>

        <button className={`admin-nav-item ${activeItem === "settings" ? "active" : ""}`} onClick={() => handleShowToast("Chức năng cài đặt đang phát triển.")}>
          <span className="admin-nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></span>
          <span className="nav-label">Cài đặt</span>
        </button>

        <button className="admin-nav-item logout-item" onClick={handleLogout}>
          <span className="admin-nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg></span>
          <span className="nav-label">Đăng xuất</span>
        </button>
      </nav>

      {/* Sidebar Footer */}
      <div className="admin-sidebar-footer">
        <div className="admin-footer-avatar-wrap">
          <img
            src={getFullImageUrl(currentUser?.avatarUrl) || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"}
            alt="Avatar admin"
            className="admin-footer-avatar"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150";
            }}
          />
        </div>
        <div className="admin-footer-info">
          <p className="admin-footer-name">{currentUser?.fullName || "Quản trị viên"}</p>
          <p className="admin-footer-email">{currentUser?.email || "admin@agriadmin.com"}</p>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;

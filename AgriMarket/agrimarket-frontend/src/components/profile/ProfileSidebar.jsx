// src/components/profile/ProfileSidebar.jsx

import { useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  User, 
  Tractor, 
  Bell, 
  Lock, 
  ShoppingBag, 
  Heart, 
  LifeBuoy, 
  LogOut 
} from "lucide-react";
import profileService from "../../services/profileService";
import ProfileAvatar from "./ProfileAvatar";
import useNotifications from "../../hooks/useNotifications";
import "../../pages/Profile/Profile.css";

const ProfileSidebar = ({ profile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const handleLogout = () => {
    profileService.logout();
    navigate("/login");
  };

  const userRole = profile?.role?.toLowerCase();
  const isFarmer = userRole === "farmer";


  return (
    <aside className="profile-sidebar">
      <div className="profile-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <span className="sidebar-icon-col">
          <Tractor className="logo-tractor" size={24} />
        </span>
        <span className="logo-text">AgriMarket</span>
      </div>

      <div className="profile-sidebar-user">
        <span className="sidebar-icon-col">
          <ProfileAvatar
            src={profile?.avatarUrl}
            name={profile?.fullName}
            email={profile?.email}
            size="small"
          />
        </span>

        <span className="nav-label" style={{ display: "flex", flexDirection: "column" }}>
          <p className="sidebar-welcome">Xin chào,</p>
          <p className="sidebar-name">
            {profile?.fullName || "Người dùng"}
          </p>
        </span>
      </div>

      <nav className="profile-sidebar-menu">
        <button
          className="sidebar-menu-item"
          onClick={() => navigate("/home")}
        >
          <span className="sidebar-icon-col"><Home size={18} /></span>
          <span className="nav-label">Trang chủ</span>
        </button>

        <button
          className={`sidebar-menu-item ${location.pathname === "/profile" ? "active" : ""
            }`}
          onClick={() => navigate("/profile")}
        >
          <span className="sidebar-icon-col"><User size={18} /></span>
          <span className="nav-label">Hồ sơ</span>
        </button>

        {isFarmer && (
          <button
            className={`sidebar-menu-item ${location.pathname.startsWith("/farmer") ? "active" : ""
              }`}
            onClick={() => navigate("/farmer/dashboard")}
          >
            <span className="sidebar-icon-col"><Tractor size={18} /></span>
            <span className="nav-label">Kênh nhà vườn</span>
          </button>
        )}

        <button
          className={`sidebar-menu-item sidebar-menu-item-with-badge ${location.pathname === "/profile/notifications" ? "active" : ""
            }`}
          onClick={() => navigate("/profile/notifications")}
        >
          <span className="sidebar-icon-col"><Bell size={18} /></span>
          <span className="nav-label sidebar-menu-label">Thông báo</span>

          {unreadCount > 0 && (
            <span className="sidebar-notification-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>


        <button
          className={`sidebar-menu-item ${location.pathname === "/security" ? "active" : ""
            }`}
          onClick={() => navigate("/security")}
        >
          <span className="sidebar-icon-col"><Lock size={18} /></span>
          <span className="nav-label">Bảo mật</span>
        </button>

        <button
          className={`sidebar-menu-item ${location.pathname === "/profile/orders" ? "active" : ""}`}
          onClick={() => navigate("/profile/orders")}
        >
          <span className="sidebar-icon-col"><ShoppingBag size={18} /></span>
          <span className="nav-label">Đơn hàng của tôi</span>
        </button>

        <button
          className={`sidebar-menu-item ${location.pathname === "/profile/wishlist" ? "active" : ""}`}
          onClick={() => navigate("/profile/wishlist")}
        >
          <span className="sidebar-icon-col"><Heart size={18} /></span>
          <span className="nav-label">Mục yêu thích</span>
        </button>

        <button
          className={`sidebar-menu-item ${location.pathname.startsWith("/support") ? "active" : ""}`}
          onClick={() => navigate("/support")}
        >
          <span className="sidebar-icon-col"><LifeBuoy size={18} /></span>
          <span className="nav-label">Hỗ trợ & Yêu cầu</span>
        </button>
      </nav>

      <button className="profile-logout-button" onClick={handleLogout}>
        <span className="sidebar-icon-col"><LogOut size={18} /></span>
        <span className="nav-label">Đăng xuất</span>
      </button>
    </aside>
  );
};

export default ProfileSidebar;
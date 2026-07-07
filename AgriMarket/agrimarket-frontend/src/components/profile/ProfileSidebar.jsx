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
        <Tractor className="logo-tractor" size={24} />
        <span className="logo-text">AgriMarket</span>
      </div>

      <div className="profile-sidebar-user">
        <ProfileAvatar
          src={profile?.avatarUrl}
          name={profile?.fullName}
          email={profile?.email}
          size="small"
        />

        <div>
          <p className="sidebar-welcome">Xin chào,</p>
          <p className="sidebar-name">
            {profile?.fullName || "Người dùng"}
          </p>
        </div>
      </div>

      <nav className="profile-sidebar-menu">
        <button
          className="sidebar-menu-item"
          onClick={() => navigate("/home")}
        >
          <Home size={18} />
          Trang chủ
        </button>

        <button
          className={`sidebar-menu-item ${location.pathname === "/profile" ? "active" : ""
            }`}
          onClick={() => navigate("/profile")}
        >
          <User size={18} />
          Hồ sơ
        </button>

        {isFarmer && (
          <button
            className={`sidebar-menu-item ${location.pathname.startsWith("/farmer") ? "active" : ""
              }`}
            onClick={() => navigate("/farmer/dashboard")}
          >
            <Tractor size={18} />
            Kênh nhà vườn
          </button>
        )}

        <button
          className={`sidebar-menu-item sidebar-menu-item-with-badge ${location.pathname === "/profile/notifications" ? "active" : ""
            }`}
          onClick={() => navigate("/profile/notifications")}
        >
          <Bell size={18} />
          <span className="sidebar-menu-label">Thông báo</span>

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
          <Lock size={18} />
          Bảo mật
        </button>

        <button
          className={`sidebar-menu-item ${location.pathname === "/profile/orders" ? "active" : ""}`}
          onClick={() => navigate("/profile/orders")}
        >
          <ShoppingBag size={18} />
          Đơn hàng của tôi
        </button>

        <button
          className={`sidebar-menu-item ${location.pathname === "/profile/wishlist" ? "active" : ""}`}
          onClick={() => navigate("/profile/wishlist")}
        >
          <Heart size={18} />
          Mục yêu thích
        </button>

        <button
          className={`sidebar-menu-item ${location.pathname.startsWith("/support") ? "active" : ""}`}
          onClick={() => navigate("/support")}
        >
          <LifeBuoy size={18} />
          Hỗ trợ & Yêu cầu
        </button>
      </nav>

      <button className="profile-logout-button" onClick={handleLogout}>
        <LogOut size={18} />
        Đăng xuất
      </button>
    </aside>
  );
};

export default ProfileSidebar;
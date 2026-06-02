// src/components/profile/ProfileSidebar.jsx

import { useLocation, useNavigate } from "react-router-dom";
import profileService from "../../services/profileService";
import ProfileAvatar from "./ProfileAvatar";
import { ROLE_LABELS } from "../../constants/profileConstants";

const ProfileSidebar = ({ profile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    profileService.logout();
    navigate("/login");
  };

  const userRole = profile?.role?.toLowerCase();
  const isFarmer = userRole === "farmer";


  return (
    <aside className="profile-sidebar">
      <div className="profile-brand">AgriMarket</div>

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
          <p className="sidebar-role">
            {ROLE_LABELS[profile?.role] || "Tài khoản"}
          </p>
        </div>
      </div>

      <nav className="profile-sidebar-menu">
        <button
          className="sidebar-menu-item"
          onClick={() => navigate("/home")}
        >
          <span>🏠</span>
          Trang chủ
        </button>

        <button
          className={`sidebar-menu-item ${location.pathname === "/profile" ? "active" : ""
            }`}
          onClick={() => navigate("/profile")}
        >
          <span>👤</span>
          Hồ sơ
        </button>

        {isFarmer && (
          <button
            className={`sidebar-menu-item ${location.pathname === "/products" ? "active" : ""}`}
            onClick={() => navigate("/products")}
          >
            <span>📦</span>
            Sản phẩm
          </button>
        )}

        <button
          className={`sidebar-menu-item ${location.pathname === "/security" ? "active" : ""
            }`}
          onClick={() => navigate("/security")}
        >
          <span>🔒</span>
          Bảo mật
        </button>

        <button className="sidebar-menu-item">
          <span>🔔</span>
          Thông báo
        </button>

        <button className="sidebar-menu-item">
          <span>🕘</span>
          Lịch sử giao dịch
        </button>
      </nav>

      <button className="profile-logout-button" onClick={handleLogout}>
        <span>↪</span>
        Đăng xuất
      </button>
    </aside>
  );
};

export default ProfileSidebar;
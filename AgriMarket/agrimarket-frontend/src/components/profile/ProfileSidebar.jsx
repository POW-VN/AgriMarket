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

  return (
    <aside className="profile-sidebar">
      <div className="profile-brand">FarmConnect</div>

      <div className="profile-sidebar-user">
        <ProfileAvatar
          src={profile?.avatarUrl}
          name={profile?.fullName}
          email={profile?.email}
          size="small"
        />

        <div>
          <p className="sidebar-welcome">Xin chào</p>
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

        <button className="sidebar-menu-item">
          <span>🔒</span>
          Bảo mật
        </button>

        <button className="sidebar-menu-item">
          <span>🔔</span>
          Thông báo
        </button>

        <button className="sidebar-menu-item">
          <span>🕘</span>
          Lịch sử
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
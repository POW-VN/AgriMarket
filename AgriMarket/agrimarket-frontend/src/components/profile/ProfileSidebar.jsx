// src/components/profile/ProfileSidebar.jsx

import { useLocation, useNavigate } from "react-router-dom";
import profileService from "../../services/profileService";
import ProfileAvatar from "./ProfileAvatar";
import "../../pages/Profile/Profile.css";

const ProfileSidebar = ({ profile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    profileService.logout();
    navigate("/login");
  };

  const userRole = profile?.role?.toLowerCase();
  const isFarmer = userRole === "farmer";
  const isShipper = userRole === "partner" || userRole === "shipper";


  return (
    <aside className="profile-sidebar">
      <div className="profile-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="logo-tractor"
        >
          <circle cx="7" cy="18" r="2"></circle>
          <circle cx="18" cy="18" r="2"></circle>
          <path d="M7 16h11v-2H9v-3h7V9H9V6H7v10z"></path>
          <path d="M16 9h3l2 3v4"></path>
        </svg>
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
            className={`sidebar-menu-item ${
              location.pathname.startsWith("/farmer") ? "active" : ""
            }`}
            onClick={() => navigate("/farmer/dashboard")}
          >
            <span>🚜</span>
            Kênh nhà vườn
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

        <button
          className={`sidebar-menu-item ${location.pathname === "/profile/orders" ? "active" : ""}`}
          onClick={() => navigate("/profile/orders")}
        >
          <span>🕘</span>
          Đơn hàng của tôi
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
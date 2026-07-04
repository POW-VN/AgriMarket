import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import profileService from "../../../services/profileService";
import authService from "../../../services/authService";
import "./FarmerDashboard.css";

const TABS = [
  { id: "overview",     label: "Tổng quan",          icon: "📊", path: "/farmer/dashboard" },
  { id: "products",     label: "Quản lý sản phẩm",    icon: "📦", path: "/farmer/products" },
  { id: "orders",       label: "Đơn hàng của tôi",   icon: "🚜", path: "/farmer/orders" },
  { id: "farm-profile", label: "Thông tin trang trại", icon: "🏡", path: "/farmer/farm-profile" },
  { id: "chat",         label: "Tin nhắn khách hàng", icon: "💬", path: "/farmer/chat" },
  { id: "livestream",   label: "Quản lý Livestream", icon: "📺", path: "/farmer/livestream" },
];

export const FarmerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Active user details
  const [currentUser, setCurrentUser] = useState(null);
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [farmName, setFarmName] = useState("");

  // Check Auth & Fetch Profile
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role?.toLowerCase() !== "farmer") {
      navigate("/farmer/register");
      return;
    }
    setCurrentUser(user);

    const loadProfile = async () => {
      try {
        const profileData = await profileService.getCurrentProfile();
        if (profileData) {
          setFarmerProfile(profileData);
          setFarmName(profileData.farmName || "");
          setAvatarUrl(profileData.avatarUrl || "");
        }
      } catch (err) {
        console.error("Lỗi khi tải hồ sơ nhà vườn:", err);
      }
    };
    loadProfile();
  }, [navigate]);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith("/farmer/products")) return "products";
    if (path.startsWith("/farmer/orders")) return "orders";
    if (path.startsWith("/farmer/farm-profile")) return "farm-profile";
    if (path.startsWith("/farmer/chat")) return "chat";
    if (path.startsWith("/farmer/livestream")) return "livestream";
    return "overview";
  };

  const currentTab = getActiveTab();

  const handleTabChange = (path) => {
    navigate(path);
  };

  const isOrderDetailPath = location.pathname.startsWith("/farmer/orders/orderdetail");

  return (
    <div className="farmer-dashboard-root">
      {/* SIDEBAR */}
      <aside className="fd-sidebar">
        <div className="fd-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <svg className="logo-tractor" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="7" cy="18" r="2" />
            <circle cx="18" cy="18" r="2" />
            <path d="M7 16h11v-2H9v-3h7V9H9V6H7v10z" />
            <path d="M16 9h3l2 3v4" />
          </svg>
          <span className="brand-text">AgriMarket</span>
        </div>

        <div className="fd-user-meta">
          <div className="fd-user-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Farm avatar" />
            ) : (
              <div className="avatar-fallback">{farmName ? farmName.charAt(0).toUpperCase() : "🚜"}</div>
            )}
          </div>
          <div className="fd-user-text">
            <p className="greeting">Xin chào,</p>
            <p className="farm-title">{farmName || currentUser?.fullName || "Nhà vườn"}</p>
            <span className="badge-role">Đối tác nông dân</span>
          </div>
        </div>

        <nav className="fd-nav-menu">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`fd-nav-item ${currentTab === tab.id ? "active" : ""}`}
              onClick={() => handleTabChange(tab.path)}
            >
              <span className="icon">{tab.icon}</span>
              <span className="label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="fd-sidebar-footer">
          <button className="fd-btn-logout" onClick={() => { authService.logout(); navigate("/login"); }}>
            <span>↪</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="fd-main-viewport">
        {!isOrderDetailPath && (
          <header className="fd-topbar-header">
            <div className="topbar-left">
              <h1 className="viewport-title">
                {TABS.find(t => t.id === currentTab)?.label}
              </h1>
              <p className="viewport-subtitle">
                {currentTab === "overview" && "Chỉ số hoạt động nông trại và doanh số bán hàng."}
                {currentTab === "products" && "Đăng bán sản phẩm, theo dõi phê duyệt và điều chỉnh giá."}
                {currentTab === "orders" && "Nhận đơn hàng mới từ người tiêu dùng và cập nhật giao vận."}
                {currentTab === "farm-profile" && "Hoàn thiện hồ sơ trang trại giúp tăng độ tin cậy."}
                {currentTab === "chat" && "Xem và trả lời các tin nhắn tư vấn từ người tiêu dùng."}
                {currentTab === "livestream" && "Thiết lập, chuẩn bị thiết bị phát sóng và tương tác trực tiếp với khách hàng."}
              </p>
            </div>

            <div className="topbar-right">
              <div className="user-profile-badge" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
                <span>Hồ sơ cá nhân</span>
                <span className="arrow">→</span>
              </div>
            </div>
          </header>
        )}

        <div className={isOrderDetailPath ? "" : "fd-viewport-content"}>
          <Outlet context={{ farmerProfile, currentUser }} />
        </div>
      </main>
    </div>
  );
};

export default FarmerLayout;

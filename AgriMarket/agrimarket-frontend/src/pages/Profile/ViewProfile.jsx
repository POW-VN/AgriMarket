// src/pages/Profile/ViewProfile.jsx

import { useNavigate } from "react-router-dom";
import useProfile from "../../hooks/useProfile";
import ProfileLayout from "../../components/profile/ProfileLayout";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileOverviewCard from "../../components/profile/ProfileOverviewCard";
import CustomerInfoCard from "../../components/profile/CustomerInfoCard";
import FarmerInfoCard from "../../components/profile/FarmerInfoCard";
import AdminInfoCard from "../../components/profile/AdminInfoCard";
import ProfileActionCards from "../../components/profile/ProfileActionCards";
import ProfileFooter from "../../components/profile/ProfileFooter";
import { USER_ROLES } from "../../constants/profileConstants";
import "./Profile.css";

const ViewProfile = () => {
  const navigate = useNavigate();

  const {
    profile,
    isProfileLoading,
    profileError,
  } = useProfile();

  if (isProfileLoading) {
    return (
      <div className="profile-center-state">
        Đang tải thông tin hồ sơ...
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="profile-center-state">
        {profileError}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-center-state">
        <h2>Bạn chưa đăng nhập</h2>
        <p>Vui lòng đăng nhập để xem thông tin hồ sơ.</p>

        <button
          className="profile-primary-button"
          onClick={() => navigate("/login")}
        >
          Đi tới đăng nhập
        </button>
      </div>
    );
  }

  return (
    <ProfileLayout profile={profile}>
      <section className="profile-content">
        <ProfileHeader
          title="Tổng quan hồ sơ"
          subtitle="Quản lý thông tin cá nhân và tài khoản của bạn."
        />

        {profile.passwordSet === false && (
          <div className="password-alert-banner" style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fef3c7",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.05)"
          }}>
            <div style={{
              fontSize: "24px",
              color: "#d97706"
            }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: "0 0 4px 0", color: "#92400e", fontWeight: "700", fontSize: "15px" }}>
                Tài khoản chưa có mật khẩu đăng nhập trực tiếp
              </h4>
              <p style={{ margin: 0, color: "#b45309", fontSize: "13.5px", lineHeight: "1.5" }}>
                Bạn đang đăng nhập bằng tài khoản liên kết Google. Vui lòng{" "}
                <span 
                  onClick={() => navigate("/security")} 
                  style={{ textDecoration: "underline", cursor: "pointer", fontWeight: "600", color: "#b45309" }}
                >
                  thiết lập mật khẩu mới
                </span>{" "}
                để nâng cao bảo mật và có thể đăng nhập bằng email.
              </p>
            </div>
            <button 
              onClick={() => navigate("/security")} 
              style={{
                backgroundColor: "#d97706",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#b45309"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#d97706"}
            >
              Thiết lập ngay
            </button>
          </div>
        )}

        <ProfileOverviewCard
          profile={profile}
          onEdit={() => navigate("/profile/edit")}
        />

        {profile.role === USER_ROLES.CUSTOMER && (
          <CustomerInfoCard profile={profile} />
        )}

        {profile.role === USER_ROLES.FARMER && (
          <FarmerInfoCard profile={profile} />
        )}

        {profile.role === USER_ROLES.ADMIN && (
          <AdminInfoCard profile={profile} />
        )}

        <ProfileActionCards />
      </section>

      <ProfileFooter />
    </ProfileLayout>
  );
};

export default ViewProfile;
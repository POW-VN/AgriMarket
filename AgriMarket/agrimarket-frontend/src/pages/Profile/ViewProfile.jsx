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
        Đang tải hồ sơ...
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
        <p>Vui lòng đăng nhập để xem hồ sơ.</p>

        <button
          className="profile-primary-button"
          onClick={() => navigate("/login")}
        >
          Đi đến đăng nhập
        </button>
      </div>
    );
  }

  return (
    <ProfileLayout profile={profile}>
      <section className="profile-content">
        <ProfileHeader
          title="Tổng quan hồ sơ"
          subtitle="Quản lý thông tin cá nhân và thông tin tài khoản của bạn."
        />

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
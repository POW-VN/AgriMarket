// src/components/profile/ProfileActionCards.jsx

const ProfileActionCards = () => {
  return (
    <div className="profile-action-grid">
      <button className="profile-action-card">
        <span className="profile-action-icon">🔐</span>

        <div>
          <strong>Mật khẩu & bảo mật</strong>
          <p>Cập nhật mật khẩu, bảo mật tài khoản</p>
        </div>

        <span>›</span>
      </button>

      <button className="profile-action-card">
        <span className="profile-action-icon">🔔</span>

        <div>
          <strong>Thông báo</strong>
          <p>Quản lý thông báo từ hệ thống</p>
        </div>

        <span>›</span>
      </button>
    </div>
  );
};

export default ProfileActionCards;
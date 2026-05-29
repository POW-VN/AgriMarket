// src/components/profile/AdminInfoCard.jsx

const AdminInfoCard = ({ profile }) => {
  return (
    <section className="profile-card profile-detail-card">
      <div className="profile-card-title-row">
        <h3>Thông tin quản trị viên</h3>
        <span className="profile-badge light">Admin</span>
      </div>

      <div className="profile-detail-list">
        <div>
          <p>Họ và tên</p>
          <strong>{profile?.fullName || "Chưa cập nhật"}</strong>
        </div>

        <div>
          <p>Email</p>
          <strong>{profile?.email || "Chưa cập nhật"}</strong>
        </div>

        <div>
          <p>Ngày tạo tài khoản</p>
          <strong>{profile?.createdAt || "Chưa cập nhật"}</strong>
        </div>
      </div>

      <p className="admin-note">
        Tài khoản quản trị viên chỉ được xem hồ sơ, không có chức năng chỉnh sửa tại trang này.
      </p>
    </section>
  );
};

export default AdminInfoCard;
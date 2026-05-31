// src/components/profile/ProfileOverviewCard.jsx

import ProfileAvatar from "./ProfileAvatar";
import { ROLE_LABELS } from "../../constants/profileConstants";

const ProfileOverviewCard = ({ profile, onEdit }) => {
  return (
    <section className="profile-card profile-overview-card">
      <div className="profile-overview-left">
        <ProfileAvatar
          src={profile?.avatarUrl}
          name={profile?.fullName}
          email={profile?.email}
          size="large"
        />

        <div className="profile-overview-info">
          <div className="profile-name-line">
            <h2>{profile?.fullName || "Tên chưa cập nhật"}</h2>

            <div className="profile-badge-row">
              <span className="profile-badge dark">
                {ROLE_LABELS[profile?.role] || "Tài khoản"}
              </span>
            </div>
          </div>

          <div className="profile-contact-grid">
            <div className="profile-contact-item">
              <span>✉</span>
              <div>
                <p>Email</p>
                <strong>{profile?.email || "Chưa cập nhật"}</strong>
              </div>
            </div>

            <div className="profile-contact-item">
              <span>☎</span>
              <div>
                <p>Số điện thoại</p>
                <strong>{profile?.phone || "Chưa cập nhật"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {profile?.role !== "admin" && (
        <button className="profile-primary-button" onClick={onEdit}>
          ✎ Chỉnh sửa hồ sơ
        </button>
      )}
    </section>
  );
};

export default ProfileOverviewCard;
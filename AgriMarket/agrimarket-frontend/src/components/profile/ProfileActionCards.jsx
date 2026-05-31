// src/components/profile/ProfileActionCards.jsx

import { useNavigate } from "react-router-dom";

const ProfileActionCards = () => {
    const navigate = useNavigate();

    return (
        <div className="profile-action-grid">
            <button
                className="profile-action-card"
                onClick={() => navigate('/security')}
            >
                <span className="profile-action-icon">🔐</span>

                <div>
                    <strong>Mật khẩu & Bảo mật</strong>
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
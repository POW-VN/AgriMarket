import { useNavigate } from "react-router-dom";
import profileService from "../../services/profileService";

const ProfileActionCards = () => {
    const navigate = useNavigate();

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            "Bạn có chắc chắn muốn xoá tài khoản không?\nHành động này không thể hoàn tác và tất cả dữ liệu liên quan sẽ bị xoá."
        );
        if (!confirmed) return;

        try {
            await profileService.deleteAccount();
            alert("Xoá tài khoản thành công!");
            navigate("/");
            window.location.reload();
        } catch (error) {
            console.error("Xoá tài khoản thất bại:", error);
            alert(
                error?.response?.data ||
                error?.message ||
                "Đã xảy ra lỗi khi xoá tài khoản. Vui lòng thử lại sau."
            );
        }
    };

    return (
        <div className="profile-actions-container" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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

            <button 
                className="profile-action-card delete-account-card"
                onClick={handleDeleteAccount}
            >
                <span className="profile-action-icon">🗑️</span>

                <div>
                    <strong>Xoá tài khoản</strong>
                    <p>Xoá vĩnh viễn tài khoản và toàn bộ dữ liệu của bạn</p>
                </div>

                <span>›</span>
            </button>
        </div>
    );
};

export default ProfileActionCards;
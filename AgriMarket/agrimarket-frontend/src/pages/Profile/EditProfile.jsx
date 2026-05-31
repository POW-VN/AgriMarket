// src/pages/Profile/EditProfile.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useProfile from "../../hooks/useProfile";
import ProfileLayout from "../../components/profile/ProfileLayout";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileAvatar from "../../components/profile/ProfileAvatar";
import ProfileFooter from "../../components/profile/ProfileFooter";
import { USER_ROLES } from "../../constants/profileConstants";
import { buildProfileUpdatePayload } from "../../utils/profileMapper";
import apiClient from "../../services/apiClient";
import "./Profile.css";

const EditProfile = () => {
  const navigate = useNavigate();

  const {
    profile,
    isProfileLoading,
    updateProfile,
  } = useProfile();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    avatarUrl: "",
    farmName: "",
    farmAddress: "",
    description: "",
    address: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    if (!profile) return;

    if (profile.role === USER_ROLES.ADMIN) {
      navigate("/profile");
      return;
    }

    setFormData({
      fullName: profile.fullName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      avatarUrl: profile.avatarUrl || "",
      farmName: profile.farmName || "",
      farmAddress: profile.farmAddress || "",
      description: profile.description || "",
      address: profile.addresses?.[0]?.address || "",
    });
  }, [profile, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Instant local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        avatarUrl: reader.result,
      }));
    };
    reader.readAsDataURL(file);

    // Upload to live backend
    try {
      const uploadData = new FormData();
      uploadData.append("avatar", file);
      
      const response = await apiClient.post("/api/upload/avatar", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.avatarUrl) {
        setFormData((prev) => ({
          ...prev,
          avatarUrl: response.data.avatarUrl,
        }));
      }
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên server:", error);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({
      ...prev,
      avatarUrl: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!profile) return;

    setIsSaving(true);
    setFormMessage("");

    try {
      const payload = buildProfileUpdatePayload(profile.role, formData);

      await updateProfile(payload);

      setFormMessage("Cập nhật hồ sơ thành công.");

      setTimeout(() => {
        navigate("/profile");
      }, 700);
    } catch (error) {
      console.error("Submit profile error:", error);
      setFormMessage("Cập nhật hồ sơ thất bại. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="profile-center-state">
        Đang tải thông tin...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-center-state">
        Bạn chưa đăng nhập.
      </div>
    );
  }

  if (profile.role === USER_ROLES.ADMIN) {
    return null;
  }

  return (
    <ProfileLayout profile={profile}>
      <section className="profile-content">
        <ProfileHeader
          title="Chỉnh sửa hồ sơ"
          subtitle="Cập nhật thông tin cá nhân và thông tin tài khoản."
        />

        <form className="profile-card edit-profile-card" onSubmit={handleSubmit}>
          <div className="edit-avatar-section">
            <div className="edit-avatar-box">
              <ProfileAvatar
                src={formData.avatarUrl}
                name={formData.fullName}
                email={formData.email}
                size="large"
              />

              <span className="edit-avatar-dot">✎</span>
            </div>

            <div>
              <h3>Ảnh đại diện</h3>
              <p>
                Nên sử dụng ảnh rõ mặt, kích thước tối thiểu 400x400px.
              </p>

              <div className="edit-avatar-actions">
                <label className="profile-secondary-button file-upload-button">
                  Tải ảnh mới
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>

                <button
                  type="button"
                  className="profile-danger-text-button"
                  onClick={handleRemoveAvatar}
                >
                  Xóa ảnh
                </button>
              </div>
            </div>
          </div>

          <div className="edit-form-grid">
            <div className="form-group full-width">
              <label>Họ và tên</label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                value={formData.email}
                disabled
              />

              <small>
                Email dùng để đăng nhập nên không chỉnh sửa trực tiếp tại đây.
              </small>

              {/* TODO BACKEND:
                  Nếu sau này muốn đổi email,
                  cần tạo API xác minh email bằng OTP trước khi cập nhật.
              */}
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
              />
            </div>

            {profile.role === USER_ROLES.CUSTOMER && (
              <div className="form-group full-width">
                <label>Địa chỉ mặc định</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ nhận hàng"
                  rows="4"
                />
              </div>
            )}

            {profile.role === USER_ROLES.FARMER && (
              <>
                <div className="form-group full-width">
                  <label>Tên nông trại / doanh nghiệp</label>
                  <input
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleChange}
                    placeholder="Nhập tên nông trại"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Địa chỉ nông trại</label>
                  <textarea
                    name="farmAddress"
                    value={formData.farmAddress}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ nông trại"
                    rows="3"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Mô tả nông trại</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mô tả ngắn về nông trại, sản phẩm hoặc quy trình canh tác"
                    rows="4"
                  />
                </div>
              </>
            )}
          </div>

          {formMessage && (
            <p className="profile-form-message">
              {formMessage}
            </p>
          )}

          <div className="edit-form-actions">
            <button
              type="button"
              className="profile-secondary-button"
              onClick={() => navigate("/profile")}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="profile-primary-button"
              disabled={isSaving}
            >
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </section>

      <ProfileFooter />
    </ProfileLayout>
  );
};

export default EditProfile;
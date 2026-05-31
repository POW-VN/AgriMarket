import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useProfile from "../../hooks/useProfile";

import ProfileLayout from "../../components/profile/ProfileLayout";
import ProfileHeader from "../../components/profile/ProfileHeader";

import PasswordInput from "../../components/common/PasswordInput/PasswordInput";
import ChangePasswordSuccess from "../ChangePasswordSuccess/ChangePasswordSuccess";

import "./ChangePassword.css";

const PASSWORD_RULES = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (pwd) => pwd.length >= 8,
  },
  {
    id: "upper",
    label: "At least one uppercase letter",
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    id: "number",
    label: "At least one number",
    test: (pwd) => /[0-9]/.test(pwd),
  },
  {
    id: "special",
    label: "At least one special character",
    test: (pwd) => /[^A-Za-z0-9]/.test(pwd),
  },
];

const ChangePassword = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [currentError, setCurrentError] = useState("");
  const [newError, setNewError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validateForm = () => {
    let valid = true;

    setCurrentError("");
    setNewError("");
    setConfirmError("");

    if (!currentPassword.trim()) {
      setCurrentError("Current password is required");
      valid = false;
    }

    if (!newPassword.trim()) {
      setNewError("New password is required");
      valid = false;
    }

    if (newPassword && newPassword.length < 8) {
      setNewError("Password must be at least 8 characters");
      valid = false;
    }

    if (!confirmPassword.trim()) {
      setConfirmError("Please confirm your password");
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmError("Passwords do not match");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // TODO: Call API change password here

    setShowSuccessModal(true);
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  return (
      <>
        <ProfileLayout profile={profile}>
          <section className="profile-content">
            <ProfileHeader
                title="Mật khẩu & bảo mật"
                subtitle="Cập nhật mật khẩu để bảo vệ tài khoản của bạn."
            />

            <div className="profile-card security-card">
              <form onSubmit={handleSubmit}>
                <div className="security-form-group">
                  <label>Mật khẩu hiện tại</label>

                  <PasswordInput
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        setCurrentError("");
                      }}
                      error={currentError}
                  />
                </div>

                <div className="security-form-group">
                  <label>Mật khẩu mới</label>

                  <PasswordInput
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setNewError("");
                      }}
                      error={newError}
                  />
                </div>

                <div className="security-rules">
                  <h4>Password requirements</h4>

                  {PASSWORD_RULES.map((rule) => (
                      <div key={rule.id}>
                        {rule.test(newPassword) ? "✅" : "⭕"} {rule.label}
                      </div>
                  ))}
                </div>

                <div className="security-form-group">
                  <label>Xác nhận mật khẩu mới</label>

                  <PasswordInput
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setConfirmError("");
                      }}
                      error={confirmError}
                  />
                </div>

                <div className="security-actions">
                  <button
                      type="button"
                      className="profile-secondary-button"
                      onClick={handleCancel}
                  >
                    Hủy
                  </button>

                  <button
                      type="submit"
                      className="profile-primary-button"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </section>
        </ProfileLayout>

        <ChangePasswordSuccess
            isOpen={showSuccessModal}
            onClose={() => {
              setShowSuccessModal(false);
              navigate("/profile");
            }}
        />
      </>
  );
};

export default ChangePassword;
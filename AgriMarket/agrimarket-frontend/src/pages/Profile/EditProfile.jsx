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
import * as addressService from "../../services/addressService";
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

  // Address States
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [addrProvince, setAddrProvince] = useState({ code: "", name: "" });
  const [addrDistrict, setAddrDistrict] = useState({ code: "", name: "" });
  const [addrWard, setAddrWard] = useState({ code: "", name: "" });
  const [addrStreet, setAddrStreet] = useState("");

  // Load provinces on mount
  useEffect(() => {
    const initProvinces = async () => {
      const provs = await addressService.getProvinces();
      setProvinces(provs);
    };
    initProvinces();
  }, []);

  // Parse and initialize address when profile or provinces load
  useEffect(() => {
    if (!profile || provinces.length === 0) return;

    const rawAddress = profile.role === USER_ROLES.FARMER 
      ? (profile.farmAddress || "") 
      : (profile.addresses?.[0]?.address || "");

    const initializeAddress = async () => {
      const parsed = addressService.parseAddress(rawAddress);
      
      if (!parsed.province) {
        setAddrStreet(rawAddress);
        setAddrProvince({ code: "", name: "" });
        setAddrDistrict({ code: "", name: "" });
        setAddrWard({ code: "", name: "" });
        setDistricts([]);
        setWards([]);
        return;
      }

      setAddrStreet(parsed.street || "");

      // Find province
      const normProv = addressService.normalizeName(parsed.province);
      const provinceMatch = provinces.find(
        (p) => addressService.normalizeName(p.name) === normProv
      );

      if (provinceMatch) {
        const provCode = provinceMatch.code;
        setAddrProvince({ code: provCode, name: provinceMatch.name });

        // Load districts
        const dists = await addressService.getDistricts(provCode);
        setDistricts(dists);

        // Find district
        const normDist = addressService.normalizeName(parsed.district);
        const districtMatch = dists.find(
          (d) => addressService.normalizeName(d.name) === normDist
        );

        if (districtMatch) {
          const distCode = districtMatch.code;
          setAddrDistrict({ code: distCode, name: districtMatch.name });

          // Load wards
          const wds = await addressService.getWards(distCode);
          setWards(wds);

          // Find ward
          const normWard = addressService.normalizeName(parsed.ward);
          const wardMatch = wds.find(
            (w) => addressService.normalizeName(w.name) === normWard
          );

          if (wardMatch) {
            setAddrWard({ code: wardMatch.code, name: wardMatch.name });
          } else {
            setAddrWard({ code: "", name: "" });
          }
        } else {
          setAddrDistrict({ code: "", name: "" });
          setAddrWard({ code: "", name: "" });
          setWards([]);
        }
      } else {
        setAddrStreet(rawAddress);
        setAddrProvince({ code: "", name: "" });
        setAddrDistrict({ code: "", name: "" });
        setAddrWard({ code: "", name: "" });
        setDistricts([]);
        setWards([]);
      }
    };

    initializeAddress();
  }, [profile, provinces]);

  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value;
    const provinceObj = provinces.find((p) => p.code === parseInt(provinceCode));
    if (provinceObj) {
      setAddrProvince({ code: provinceCode, name: provinceObj.name });
      setAddrDistrict({ code: "", name: "" });
      setAddrWard({ code: "", name: "" });
      setWards([]);
      const dists = await addressService.getDistricts(provinceCode);
      setDistricts(dists);
    } else {
      setAddrProvince({ code: "", name: "" });
      setAddrDistrict({ code: "", name: "" });
      setAddrWard({ code: "", name: "" });
      setDistricts([]);
      setWards([]);
    }
  };

  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    const districtObj = districts.find((d) => d.code === parseInt(districtCode));
    if (districtObj) {
      setAddrDistrict({ code: districtCode, name: districtObj.name });
      setAddrWard({ code: "", name: "" });
      const wds = await addressService.getWards(districtCode);
      setWards(wds);
    } else {
      setAddrDistrict({ code: "", name: "" });
      setAddrWard({ code: "", name: "" });
      setWards([]);
    }
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const wardObj = wards.find((w) => w.code === parseInt(wardCode));
    if (wardObj) {
      setAddrWard({ code: wardCode, name: wardObj.name });
    } else {
      setAddrWard({ code: "", name: "" });
    }
  };

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
      console.error("Error uploading avatar image:", error);
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

    if (addrProvince.code || addrDistrict.code || addrWard.code || addrStreet.trim()) {
      if (!addrProvince.name || !addrDistrict.name || !addrWard.name || !addrStreet.trim()) {
        setFormMessage("Vui lòng nhập đầy đủ địa chỉ 4 cấp (Tỉnh/Thành phố, Quận/Huyện, Phường/Xã, Số nhà/Tên đường).");
        return;
      }
    }

    setIsSaving(true);
    setFormMessage("");

    const formattedAddress = addressService.formatAddress({
      street: addrStreet.trim(),
      ward: addrWard.name,
      district: addrDistrict.name,
      province: addrProvince.name,
    });

    const updatedFormData = {
      ...formData,
      address: profile.role === USER_ROLES.CUSTOMER ? formattedAddress : formData.address,
      farmAddress: profile.role === USER_ROLES.FARMER ? formattedAddress : formData.farmAddress,
    };

    try {
      const payload = buildProfileUpdatePayload(profile.role, updatedFormData);

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
        Đang tải thông tin chi tiết...
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
          subtitle="Cập nhật thông tin cá nhân và chi tiết tài khoản của bạn."
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
                Vui lòng sử dụng ảnh chân dung rõ nét, kích thước tối thiểu 400x400px.
              </p>

              <div className="edit-avatar-actions">
                <label className="profile-secondary-button file-upload-button">
                  Tải lên ảnh mới
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
                Email này dùng để đăng nhập và không thể chỉnh sửa tại đây.
              </small>
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
              <>
                <div className="form-group">
                  <label>Tỉnh / Thành phố</label>
                  <select
                    value={addrProvince.code}
                    onChange={handleProvinceChange}
                  >
                    <option value="">Chọn Tỉnh / Thành phố</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quận / Huyện</label>
                  <select
                    value={addrDistrict.code}
                    onChange={handleDistrictChange}
                    disabled={!addrProvince.code}
                  >
                    <option value="">Chọn Quận / Huyện</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Phường / Xã</label>
                  <select
                    value={addrWard.code}
                    onChange={handleWardChange}
                    disabled={!addrDistrict.code}
                  >
                    <option value="">Chọn Phường / Xã</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Số nhà / Tên đường</label>
                  <input
                    type="text"
                    placeholder="Số nhà, ngõ, tên đường..."
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                  />
                </div>
              </>
            )}

            {profile.role === USER_ROLES.FARMER && (
              <>
                <div className="form-group full-width">
                  <label>Tên trang trại / Doanh nghiệp</label>
                  <input
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleChange}
                    placeholder="Nhập tên trang trại"
                  />
                </div>

                <div className="form-group">
                  <label>Tỉnh / Thành phố</label>
                  <select
                    value={addrProvince.code}
                    onChange={handleProvinceChange}
                  >
                    <option value="">Chọn Tỉnh / Thành phố</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quận / Huyện</label>
                  <select
                    value={addrDistrict.code}
                    onChange={handleDistrictChange}
                    disabled={!addrProvince.code}
                  >
                    <option value="">Chọn Quận / Huyện</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Phường / Xã</label>
                  <select
                    value={addrWard.code}
                    onChange={handleWardChange}
                    disabled={!addrDistrict.code}
                  >
                    <option value="">Chọn Phường / Xã</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Số nhà / Tên đường</label>
                  <input
                    type="text"
                    placeholder="Số nhà, ngõ, tên đường..."
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Mô tả trang trại</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mô tả ngắn gọn về trang trại, nông sản hoặc phương pháp canh tác của bạn"
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
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import profileService from "../../../services/profileService";
import authService from "../../../services/authService";
import apiClient from "../../../services/apiClient";
import * as addressService from "../../../services/addressService";
import "./FarmDetails.css";

export const FarmDetails = () => {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    const [farmName, setFarmName] = useState("");
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState({ code: "", name: "" });
    const [selectedDistrict, setSelectedDistrict] = useState({ code: "", name: "" });
    const [selectedWard, setSelectedWard] = useState({ code: "", name: "" });
    const [street, setStreet] = useState("");
    const [description, setDescription] = useState("");
    const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || "");
    const [photoLoading, setPhotoLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProvinces = async () => {
            const data = await addressService.getProvinces();
            setProvinces(data);
        };
        fetchProvinces();
    }, []);

    const handleProvinceChange = async (e) => {
        const provinceCode = e.target.value;
        const provinceObj = provinces.find(p => p.code === parseInt(provinceCode));
        if (provinceObj) {
            setSelectedProvince({ code: provinceCode, name: provinceObj.name });
            setSelectedDistrict({ code: "", name: "" });
            setSelectedWard({ code: "", name: "" });
            setWards([]);
            const districtData = await addressService.getDistricts(provinceCode);
            setDistricts(districtData);
        } else {
            setSelectedProvince({ code: "", name: "" });
            setSelectedDistrict({ code: "", name: "" });
            setSelectedWard({ code: "", name: "" });
            setDistricts([]);
            setWards([]);
        }
    };

    const handleDistrictChange = async (e) => {
        const districtCode = e.target.value;
        const districtObj = districts.find(d => d.code === parseInt(districtCode));
        if (districtObj) {
            setSelectedDistrict({ code: districtCode, name: districtObj.name });
            setSelectedWard({ code: "", name: "" });
            const wardData = await addressService.getWards(districtCode);
            setWards(wardData);
        } else {
            setSelectedDistrict({ code: "", name: "" });
            setSelectedWard({ code: "", name: "" });
            setWards([]);
        }
    };

    const handleWardChange = (e) => {
        const wardCode = e.target.value;
        const wardObj = wards.find(w => w.code === parseInt(wardCode));
        if (wardObj) {
            setSelectedWard({ code: wardCode, name: wardObj.name });
        } else {
            setSelectedWard({ code: "", name: "" });
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPhotoLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("avatar", file);

            const response = await apiClient.post("/api/upload/avatar", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data && response.data.avatarUrl) {
                setAvatarUrl(response.data.avatarUrl);
                
                // Cập nhật local storage ngay lập tức
                if (currentUser) {
                    const updatedUser = { ...currentUser, avatarUrl: response.data.avatarUrl };
                    localStorage.setItem("farmconnect_user", JSON.stringify(updatedUser));
                }
            }
        } catch (err) {
            console.error("Failed to upload image:", err);
            setError("Tải ảnh lên thất bại. Vui lòng thử lại.");
        } finally {
            setPhotoLoading(false);
        }
    };

    const handleContinue = async () => {
        if (!farmName.trim()) {
            setError("Vui lòng điền tên trang trại.");
            return;
        }

        const currentLocalUser = authService.getCurrentUser();
        if (!currentLocalUser) {
            setError("Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.");
            return;
        }

        if (!selectedProvince.name || !selectedDistrict.name || !selectedWard.name || !street.trim()) {
            setError("Vui lòng điền đầy đủ địa chỉ trang trại (Tỉnh/Thành phố, Quận/Huyện, Phường/Xã, Số nhà/Tên đường).");
            return;
        }

        setLoading(true);
        setError("");

        const farmAddress = addressService.formatAddress({
            street: street.trim(),
            ward: selectedWard.name,
            district: selectedDistrict.name,
            province: selectedProvince.name
        });

        try {
            await profileService.updateProfile({
                farmName: farmName.trim(),
                farmAddress,
                description: description.trim(),
                avatarUrl: avatarUrl
            });
            navigate("/");
        } catch (err) {
            setError(err.message || "Không thể lưu thông tin trang trại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="farm-details-page">
            <header className="onboarding-header">
                <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="logo-tractor"
                    >
                      <circle cx="7" cy="18" r="2"></circle>
                      <circle cx="18" cy="18" r="2"></circle>
                      <path d="M7 16h11v-2H9v-3h7V9H9V6H7v10z"></path>
                      <path d="M16 9h3l2 3v4"></path>
                    </svg>
                    <span>AgriMarket</span>
                </div>
                <div className="help-circle">?</div>
            </header>

            <main className="farm-details-container">
                {/* LEFT COLUMN - HERO IMAGE */}
                <div className="farm-hero-side">
                    <div className="hero-card">
                        <div className="hero-image-placeholder">
                            <div className="hero-overlay-text">
                                <h2>Đồng hành cùng chúng tôi</h2>
                                <p>Tham gia cộng đồng các nhà sản xuất tâm huyết và kết nối trực tiếp với thị trường thành thị.</p>
                            </div>
                        </div>
                        <div className="trust-card">
                            <div className="trust-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#012d1d" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <div className="trust-content">
                                <h4>Sự tin tưởng là cốt lõi</h4>
                                <p>Mỗi hồ sơ đều trải qua quá trình xác minh để đảm bảo chất lượng dịch vụ tốt nhất cho khách hàng.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - FORM CONTENT */}
                <div className="farm-form-side">
                    <div className="form-wrapper">
                        <h1>Thông tin Trang trại</h1>
                        <p className="subtitle">Chia sẻ thêm về trang trại của bạn. Thông tin này sẽ được hiển thị công khai tới khách hàng.</p>

                        <div className="input-group">
                            <label>Tên Trang trại</label>
                            <input 
                                type="text" 
                                placeholder="Ví dụ: Trang trại Xanh" 
                                value={farmName}
                                onChange={(e) => setFarmName(e.target.value)}
                            />
                        </div>
 
                        <div className="input-row">
                            <div className="input-group">
                                <label>Tỉnh / Thành phố</label>
                                <select 
                                    value={selectedProvince.code}
                                    onChange={handleProvinceChange}
                                >
                                    <option value="">Chọn Tỉnh / Thành phố</option>
                                    {provinces.map((p) => (
                                        <option key={p.code} value={p.code}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Quận / Huyện</label>
                                <select 
                                    value={selectedDistrict.code}
                                    onChange={handleDistrictChange}
                                    disabled={!selectedProvince.code}
                                >
                                    <option value="">Chọn Quận / Huyện</option>
                                    {districts.map((d) => (
                                        <option key={d.code} value={d.code}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="input-row">
                            <div className="input-group">
                                <label>Phường / Xã</label>
                                <select 
                                    value={selectedWard.code}
                                    onChange={handleWardChange}
                                    disabled={!selectedDistrict.code}
                                >
                                    <option value="">Chọn Phường / Xã</option>
                                    {wards.map((w) => (
                                        <option key={w.code} value={w.code}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Số nhà / Tên đường</label>
                                <input 
                                    type="text" 
                                    placeholder="Số 123, đường..." 
                                    value={street}
                                    onChange={(e) => setStreet(e.target.value)}
                                />
                            </div>
                        </div>
 
                        <div className="input-group">
                            <label>Mô tả Trang trại</label>
                            <textarea 
                                placeholder="Chia sẻ câu chuyện, phương pháp canh tác và giá trị của bạn..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>
 
                        <div className="upload-box" onClick={() => document.getElementById("farm-photo-input").click()}>
                            <input 
                                type="file" 
                                id="farm-photo-input" 
                                accept="image/*" 
                                style={{ display: "none" }} 
                                onChange={handlePhotoChange}
                            />
                            {photoLoading ? (
                                <div className="upload-loading">Đang tải ảnh lên...</div>
                            ) : avatarUrl ? (
                                <>
                                    <div className="upload-preview-container">
                                        <img src={avatarUrl} alt="Farm Preview" className="upload-preview-img" />
                                    </div>
                                    <div className="upload-text">
                                        <strong>Thay đổi Ảnh Trang trại</strong>
                                        <p>Click để tải lên ảnh khác</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="upload-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="#317a55" strokeWidth="2">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                    </div>
                                    <div className="upload-text">
                                        <strong>Tải lên Ảnh Trang trại</strong>
                                        <p>Ảnh chất lượng cao giúp tăng lượt xem lên tới 40%</p>
                                    </div>
                                </>
                            )}
                        </div>

                        {error && (
                            <div className="error-message" style={{ color: '#d32f2f', backgroundColor: '#ffebee', padding: '10px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffcdd2', fontSize: '14px' }}>
                                {error}
                            </div>
                        )}
 
                        <button 
                            className="btn-continue-farm" 
                            onClick={handleContinue}
                            disabled={loading}
                        >
                            {loading ? "Đang lưu..." : "Tiếp tục"} <span>→</span>
                        </button>
                        <button 
                            className="btn-skip" 
                            onClick={() => navigate("/home")}
                            disabled={loading}
                        >
                            Bỏ qua lúc này
                        </button>
                    </div>
                </div>
            </main>

            <footer className="onboarding-footer">
                <div className="footer-left">AgriMarket</div>
                <div className="footer-right">
                    <span>Chính sách bảo mật</span>
                    <span>Điều khoản dịch vụ</span>
                    <span>Trung tâm trợ giúp</span>
                    <span>Liên hệ</span>
                    <span className="copyright">© 2026 AgriMarket. Tất cả các quyền được bảo lưu.</span>
                </div>
            </footer>
        </div>
    );
};
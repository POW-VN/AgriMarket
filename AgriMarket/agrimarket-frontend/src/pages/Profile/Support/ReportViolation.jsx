import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Store, User } from "lucide-react";
import Header from "../../../components/common/Header/Header";
import authService from "../../../services/authService";
import "./ReportViolation.css";

export default function ReportViolation() {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();

    const [formData, setFormData] = useState({
        targetType: "",
        targetId: "",
        reason: "",
        description: "",
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    const violationReasons = [
        "Sản phẩm không đúng mô tả",
        "Sản phẩm giả mạo hoặc gian lận",
        "Người bán có hành vi không phù hợp",
        "Nội dung vi phạm chính sách",
        "Đơn hàng có dấu hiệu bất thường",
        "Lừa đảo hoặc giao dịch đáng ngờ",
        "Khác",
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.targetType) {
            newErrors.targetType = "Vui lòng chọn đối tượng cần báo cáo.";
        }

        if (!formData.targetId.trim()) {
            newErrors.targetId = "Vui lòng nhập ID đối tượng cần báo cáo.";
        }

        if (!formData.reason) {
            newErrors.reason = "Vui lòng chọn lý do báo cáo.";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Vui lòng nhập nội dung mô tả vi phạm.";
        } else if (formData.description.trim().length < 20) {
            newErrors.description = "Nội dung mô tả nên có ít nhất 20 ký tự.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitReport = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            navigate("/login");
            return;
        }

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        setMessage("");

        const payload = {
            // Khi làm backend, reporterId nên lấy từ token/JWT ở backend,
            // không nên tin hoàn toàn ID gửi từ frontend.
            reporterId: currentUser.id,

            // Khớp với cột target_type trong bảng report.
            targetType: formData.targetType,

            // Khớp với cột target_id trong bảng report.
            targetId: Number(formData.targetId),

            // Khớp với cột reason trong bảng report.
            reason: formData.reason,

            // Khớp với cột description trong bảng report.
            description: formData.description,

            // Khi làm backend, status có thể để backend tự set mặc định là "pending".
            status: "pending",
        };

        try {
            /*
              TODO BACKEND:
              Sau khi bạn làm API backend, tạo file service riêng, ví dụ:
              src/services/reportService.js
      
              Sau đó gọi:
              await reportService.createReport(payload);
      
              API gợi ý:
              POST /api/reports
      
              Body gửi lên:
              {
                targetType: "product" | "farmer" | "customer",
                targetId: number,
                reason: string,
                description: string
              }
      
              Backend nên tự lấy reporter_id từ user đang đăng nhập.
            */

            setMessage("Giao diện đã sẵn sàng. Sau khi có backend, báo cáo sẽ được gửi lên hệ thống.");

            setFormData({
                targetType: "",
                targetId: "",
                reason: "",
                description: "",
            });
        } catch (error) {
            console.error("Lỗi khi gửi báo cáo vi phạm:", error);
            setMessage("Không thể gửi báo cáo. Vui lòng thử lại sau.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="report-violation-page">
            <Header activeTab="support" />

            <main className="report-violation-wrapper">
                <button className="report-back-btn" onClick={() => navigate("/support")}>
                    ← Quay lại Trung tâm hỗ trợ
                </button>

                <section className="report-hero">
                    <div>
                        <span className="report-label">Báo cáo vi phạm</span>
                        <h1>Gửi báo cáo đến AgriMarket</h1>
                        <p>
                            Hãy cung cấp thông tin rõ ràng để đội ngũ quản trị viên có thể kiểm tra,
                            xử lý các sản phẩm, người bán, người mua hoặc đơn hàng có dấu hiệu vi phạm.
                        </p>
                    </div>

                    <div className="report-hero-card">
                        <div className="trust-icon">🛡️</div>
                        <h3>Cam kết bảo vệ cộng đồng</h3>
                        <p>
                            Mọi báo cáo sẽ được xem xét cẩn thận nhằm giữ cho thị trường nông sản
                            luôn minh bạch, an toàn và đáng tin cậy.
                        </p>
                    </div>
                </section>

                <section className="report-content-layout">
                    <form className="report-form-card" onSubmit={handleSubmitReport}>
                        <div className="form-header">
                            <h2>Thông tin báo cáo</h2>
                            <p>Vui lòng điền đầy đủ các thông tin bên dưới.</p>
                        </div>

                        <div className="form-group">
                            <label>1. Bạn muốn báo cáo đối tượng nào?</label>

                            <div className="target-type-grid">
                                <label className={`target-option ${formData.targetType === "product" ? "selected" : ""}`}>
                                    <input
                                        type="radio"
                                        name="targetType"
                                        value="product"
                                        checked={formData.targetType === "product"}
                                        onChange={handleChange}
                                    />
                                    <span className="target-icon"><Package size={32} strokeWidth={1.5} /></span>
                                    <strong>Sản phẩm</strong>
                                    <small>Báo cáo sản phẩm sai mô tả, giả mạo hoặc không phù hợp.</small>
                                </label>

                                <label className={`target-option ${formData.targetType === "farmer" ? "selected" : ""}`}>
                                    <input
                                        type="radio"
                                        name="targetType"
                                        value="farmer"
                                        checked={formData.targetType === "farmer"}
                                        onChange={handleChange}
                                    />
                                    <span className="target-icon"><Store size={32} strokeWidth={1.5} /></span>
                                    <strong>Nông trại / Người bán</strong>
                                    <small>Báo cáo hành vi gian lận hoặc vi phạm chính sách.</small>
                                </label>

                                <label className={`target-option ${formData.targetType === "customer" ? "selected" : ""}`}>
                                    <input
                                        type="radio"
                                        name="targetType"
                                        value="customer"
                                        checked={formData.targetType === "customer"}
                                        onChange={handleChange}
                                    />
                                    <span className="target-icon"><User size={32} strokeWidth={1.5} /></span>
                                    <strong>Khách hàng</strong>
                                    <small>Báo cáo người mua có hành vi không phù hợp.</small>
                                </label>
                            </div>

                            {errors.targetType && <span className="error-text">{errors.targetType}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="targetId">2. ID đối tượng cần báo cáo</label>
                            <input
                                id="targetId"
                                type="number"
                                name="targetId"
                                min="1"
                                value={formData.targetId}
                                onChange={handleChange}
                                placeholder="Ví dụ: ID sản phẩm, ID nông trại hoặc ID khách hàng"
                            />
                            {errors.targetId && <span className="error-text">{errors.targetId}</span>}

                            <p className="form-hint">
                                {/* TODO BACKEND:
                    Sau này có thể truyền sẵn targetType và targetId qua URL.
                    Ví dụ: /support/report?targetType=product&targetId=15
                    Khi đó frontend có thể tự điền sẵn thông tin này.
                */}
                                Bạn có thể lấy ID từ trang chi tiết sản phẩm, hồ sơ nông trại hoặc chi tiết đơn hàng.
                            </p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="reason">3. Lý do báo cáo</label>
                            <select
                                id="reason"
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                            >
                                <option value="">Chọn lý do báo cáo...</option>
                                {violationReasons.map((reason) => (
                                    <option key={reason} value={reason}>
                                        {reason}
                                    </option>
                                ))}
                            </select>
                            {errors.reason && <span className="error-text">{errors.reason}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">4. Mô tả chi tiết</label>
                            <textarea
                                id="description"
                                name="description"
                                rows="7"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Hãy mô tả rõ vấn đề bạn gặp phải. Ví dụ: sản phẩm không đúng mô tả, người bán không phản hồi, có dấu hiệu gian lận..."
                            />
                            {errors.description && <span className="error-text">{errors.description}</span>}
                        </div>

                        <div className="report-note-box">
                            <strong>Lưu ý:</strong>
                            <p>
                                Vui lòng báo cáo trung thực. Những báo cáo sai sự thật hoặc cố tình gây ảnh hưởng
                                đến người dùng khác có thể bị hệ thống xử lý theo chính sách của AgriMarket.
                            </p>
                        </div>

                        {message && <div className="report-message">{message}</div>}

                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => navigate("/support")}
                            >
                                Hủy
                            </button>

                            <button
                                type="submit"
                                className="submit-report-btn"
                                disabled={submitting}
                            >
                                {submitting ? "Đang gửi..." : "Gửi báo cáo"}
                            </button>
                        </div>
                    </form>

                    <aside className="report-side-panel">
                        <div className="side-card">
                            <h3>Quy trình xử lý</h3>

                            <div className="process-step">
                                <span>1</span>
                                <div>
                                    <strong>Tiếp nhận báo cáo</strong>
                                    <p>Hệ thống ghi nhận thông tin báo cáo từ người dùng.</p>
                                </div>
                            </div>

                            <div className="process-step">
                                <span>2</span>
                                <div>
                                    <strong>Quản trị viên kiểm tra</strong>
                                    <p>Admin xem xét đối tượng bị báo cáo và nội dung liên quan.</p>
                                </div>
                            </div>

                            <div className="process-step">
                                <span>3</span>
                                <div>
                                    <strong>Cập nhật trạng thái</strong>
                                    <p>Báo cáo được chuyển sang trạng thái đã xử lý, từ chối hoặc cần kiểm tra thêm.</p>
                                </div>
                            </div>
                        </div>

                        <div className="side-card warning-card">
                            <h3>Thông tin được bảo mật</h3>
                            <p>
                                Danh tính người gửi báo cáo sẽ được bảo vệ. Chỉ quản trị viên có quyền
                                mới được xem và xử lý nội dung báo cáo.
                            </p>
                        </div>
                    </aside>
                </section>
            </main>
        </div>
    );
}
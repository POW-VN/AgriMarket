import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import AdminSidebar from "../../components/common/Sidebar/AdminSidebar";
import reportService from "../../services/reportService";
import apiClient from "../../services/apiClient";
import {
    LayoutDashboard,
    Users,
    Sprout,
    CheckSquare,
    Folder,
    ShoppingCart,
    CreditCard,
    MessageSquare,
    BarChart3,
    Globe,
    Bell,
    Activity,
    Settings,
    Truck,
    Search,
    RefreshCw,
    Hourglass,
    CheckCircle2,
    XCircle,
    User,
    Target,
    Hash,
    Calendar,
    EyeOff,
    Lock,
    Clock,
    X,
    Check,
    Video
} from "lucide-react";
import "./AdminStyles.css";
import "./ViolationReports.css";

export default function ViolationReports() {
    const navigate = useNavigate();
    const getFullImageUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
            return url;
        }
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
        const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
        return `${API_BASE_URL}/${cleanUrl}`;
    };

    const [currentUser, setCurrentUser] = useState(null);
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterTargetType, setFilterTargetType] = useState("all");
    const [resolutionNote, setResolutionNote] = useState("");
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);

        // Chỉ cho tài khoản admin truy cập trang này.
        // TODO BACKEND:
        // Sau này nên kiểm tra quyền admin bằng JWT/token ở backend.
        // Frontend chỉ kiểm tra để điều hướng giao diện, không đủ bảo mật tuyệt đối.
        if (!user || user.role !== "admin") {
            navigate("/login");
            return;
        }

        fetchReports();
    }, [navigate]);

    const fetchReports = async () => {
        setLoading(true);

        try {
            const data = await reportService.getAllReports();
            setReports(data);
            setSelectedReport(data[0] || null);
        } catch (error) {
            console.error("Lỗi khi tải danh sách báo cáo vi phạm:", error);
            showToast("Không thể tải danh sách báo cáo vi phạm.");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(""), 3500);
    };

    const getTargetTypeLabel = (type) => {
        switch (type) {
            case "product":
                return "Sản phẩm";
            case "farmer":
                return "Nông dân";
            case "customer":
                return "Khách hàng";
            default:
                return "Không rõ";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "pending":
                return "Đang chờ";
            case "reviewing":
                return "Đang xem xét";
            case "resolved":
                return "Đã xử lý";
            case "rejected":
                return "Đã từ chối";
            default:
                return "Không rõ";
        }
    };

    const getSeverityLabel = (severity) => {
        switch (severity) {
            case "critical":
                return "Nghiêm trọng";
            case "high":
                return "Cao";
            case "medium":
                return "Trung bình";
            case "low":
                return "Thấp";
            default:
                return "Chưa xác định";
        }
    };

    const filteredReports = useMemo(() => {
        return reports.filter((report) => {
            const keyword = searchQuery.toLowerCase();

            const matchesSearch =
                String(report.id || "").toLowerCase().includes(keyword) ||
                String(report.reason || "").toLowerCase().includes(keyword) ||
                String(report.description || "").toLowerCase().includes(keyword) ||
                String(report.targetName || "").toLowerCase().includes(keyword) ||
                String(report.reporterName || "").toLowerCase().includes(keyword);

            const matchesStatus =
                filterStatus === "all" || report.status === filterStatus;

            const matchesTargetType =
                filterTargetType === "all" || report.targetType === filterTargetType;

            return matchesSearch && matchesStatus && matchesTargetType;
        });
    }, [reports, searchQuery, filterStatus, filterTargetType]);

    const reportStats = useMemo(() => {
        return {
            pending: reports.filter((item) => item.status === "pending").length,
            reviewing: reports.filter((item) => item.status === "reviewing").length,
            resolved: reports.filter((item) => item.status === "resolved").length,
            rejected: reports.filter((item) => item.status === "rejected").length,
        };
    }, [reports]);

    const handleUpdateReportStatus = async (status) => {
        if (!selectedReport) {
            showToast("Vui lòng chọn một báo cáo để xử lý.");
            return;
        }

        // Cannot change status once resolved or rejected
        if (selectedReport.status === "resolved" || selectedReport.status === "rejected") {
            showToast("❌ Báo cáo này đã kết thúc xử lý và không thể thay đổi trạng thái.");
            return;
        }

        try {
            const updated = await reportService.updateReportStatus(
                selectedReport.id,
                status,
                resolutionNote
            );

            // Cập nhật local state
            setReports((prev) =>
                prev.map((r) => (r.id === updated.id ? updated : r))
            );
            setSelectedReport(updated);
            setResolutionNote("");
            showToast(`✅ Đã cập nhật trạng thái thành "${getStatusLabel(status)}" thành công.`);
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái báo cáo:", error);
            const errMsg = error?.response?.data || error?.message || "Không thể cập nhật trạng thái báo cáo.";
            showToast(`❌ ${errMsg}`);
        }
    };

    const handleLockTargetAccount = async () => {
        if (!selectedReport) {
            showToast("Vui lòng chọn một báo cáo trước.");
            return;
        }

        const { targetType, targetId } = selectedReport;
        if (targetType !== "farmer" && targetType !== "customer") {
            showToast("❌ Chỉ khoá tài khoản nông dân hoặc khách hàng.");
            return;
        }

        try {
            await apiClient.put(`/api/admin/users/${targetType}/${targetId}/status`, { status: "banned" });
            showToast(`✅ Đã khoá tài khoản ${targetType === "farmer" ? "nông dân" : "khách hàng"} (ID: ${targetId}) thành công.`);
        } catch (error) {
            console.error("Lỗi khi khóa tài khoản:", error);
            const errMsg = error?.response?.data || error?.message || "Không thể khóa tài khoản liên quan.";
            showToast(`❌ ${errMsg}`);
        }
    };

    const handleHideProduct = async () => {
        if (!selectedReport) {
            showToast("Vui lòng chọn một báo cáo trước.");
            return;
        }

        if (selectedReport.targetType !== "product") {
            showToast("❌ Chỉ ẩn sản phẩm khi báo cáo là loại Sản phẩm.");
            return;
        }

        try {
            await apiClient.post(`/api/admin/products/${selectedReport.targetId}/hide`, {
                reason: resolutionNote || `Ẩn do báo cáo vi phạm RP-${selectedReport.id}`,
            });
            showToast(`✅ Đã ẩn sản phẩm (ID: ${selectedReport.targetId}) thành công.`);
        } catch (error) {
            console.error("Lỗi khi ẩn sản phẩm:", error);
            const errMsg = error?.response?.data || error?.message || "Không thể ẩn sản phẩm liên quan.";
            showToast(`❌ ${errMsg}`);
        }
    };

    const formatDateTime = (value) => {
        if (!value) return "Chưa rõ";
        return new Date(value).toLocaleString("vi-VN");
    };

    const handleLogout = () => {
        authService.logout();
        navigate("/login");
    };

    return (
        <div className="admin-layout">
            <AdminSidebar activeItem="reports" showToast={showToast} />

            <div className="admin-main-container">
                <header className="admin-header">
                    <div className="admin-search-wrapper">
                        <span className="admin-search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm báo cáo..."
                            className="admin-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="admin-header-actions">
                        <button
                            className="admin-notification-btn"
                            onClick={() => showToast("Không có thông báo mới.")}
                            aria-label="Thông báo"
                        >
                            <span>🔔</span>
                            <span className="admin-notification-dot"></span>
                        </button>
                    </div>
                </header>

                <main className="admin-page-body violation-page-body">
                    <div className="violation-title-row">
                        <div>
                            <h2>Quản lý báo cáo vi phạm</h2>
                            <p>
                                Theo dõi, kiểm tra và xử lý các báo cáo vi phạm từ người dùng
                                nhằm giữ cho hệ thống AgriMarket minh bạch và an toàn.
                            </p>
                        </div>

                        <div className="violation-title-actions">
                            <button className="btn-admin-outline" onClick={fetchReports}>
                                Làm mới
                            </button>
                        </div>
                    </div>

                    <section className="violation-stats-grid">
                        <div className="violation-stat-card pending">
                            <div className="stat-icon"><Hourglass size={28} /></div>
                            <strong>{reportStats.pending}</strong>
                            <span>Đang chờ xử lý</span>
                        </div>

                        <div className="violation-stat-card resolved">
                            <div className="stat-icon"><CheckCircle2 size={28} /></div>
                            <strong>{reportStats.resolved}</strong>
                            <span>Đã xử lý</span>
                        </div>

                        <div className="violation-stat-card rejected">
                            <div className="stat-icon"><XCircle size={28} /></div>
                            <strong>{reportStats.rejected}</strong>
                            <span>Đã từ chối</span>
                        </div>
                    </section>

                    <section className="violation-filter-bar">
                        <div className="filter-search-wrapper violation-search-inline">
                            <span className="filter-search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Tìm theo mã báo cáo, lý do, người gửi hoặc đối tượng..."
                                className="filter-search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="filter-selects">
                            <div className="filter-select-wrapper">
                                <label>Đối tượng</label>
                                <select
                                    className="filter-select"
                                    value={filterTargetType}
                                    onChange={(e) => setFilterTargetType(e.target.value)}
                                >
                                    <option value="all">Tất cả đối tượng</option>
                                    <option value="product">Sản phẩm</option>
                                    <option value="farmer">Nông dân</option>
                                    <option value="customer">Khách hàng</option>
                                </select>
                            </div>

                            <div className="filter-select-wrapper">
                                <label>Trạng thái</label>
                                <select
                                    className="filter-select"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">Tất cả trạng thái</option>
                                    <option value="pending">Đang chờ</option>
                                    <option value="reviewing">Đang xem xét</option>
                                    <option value="resolved">Đã xử lý</option>
                                    <option value="rejected">Đã từ chối</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="violation-content-grid">
                        <div className="violation-list-card">
                            <div className="violation-card-header">
                                <div>
                                    <h3>Danh sách báo cáo</h3>
                                    <p>{filteredReports.length} báo cáo phù hợp</p>
                                </div>
                            </div>

                            <div className="violation-table-wrapper">
                                <table className="violation-table">
                                    <thead>
                                        <tr>
                                            <th>Mã báo cáo</th>
                                            <th>Đối tượng bị báo cáo</th>
                                            <th>Loại</th>
                                            <th>Mức độ</th>
                                            <th>Trạng thái</th>
                                            <th>Ngày gửi</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="empty-table-cell">
                                                    Đang tải danh sách báo cáo...
                                                </td>
                                            </tr>
                                        ) : filteredReports.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="empty-table-cell">
                                                    Chưa có báo cáo vi phạm nào để hiển thị.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredReports.map((report) => (
                                                <tr
                                                    key={report.id}
                                                    className={selectedReport?.id === report.id ? "selected" : ""}
                                                    onClick={() => setSelectedReport(report)}
                                                >
                                                    <td>RP-{report.id}</td>
                                                    <td>
                                                        <strong>{report.targetName || `ID: ${report.targetId}`}</strong>
                                                        <span>{report.reason}</span>
                                                    </td>
                                                    <td>{getTargetTypeLabel(report.targetType)}</td>
                                                    <td>
                                                        <span className={`severity-badge ${report.severity || "unknown"}`}>
                                                            {getSeverityLabel(report.severity)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`report-status-badge ${report.status}`}>
                                                            {getStatusLabel(report.status)}
                                                        </span>
                                                    </td>
                                                    <td>{formatDateTime(report.createdAt)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <aside className="violation-detail-panel">
                            {selectedReport ? (
                                <>
                                    <div className="detail-panel-header">
                                        <div>
                                            <span className="detail-report-code">RP-{selectedReport.id}</span>
                                            <h3>Chi tiết báo cáo</h3>
                                        </div>
                                        <span className={`report-status-badge ${selectedReport.status}`}>
                                            {getStatusLabel(selectedReport.status)}
                                        </span>
                                    </div>

                                    <div className="detail-section">
                                        <h4>Thông tin báo cáo</h4>

                                        <div className="detail-info-list">
                                            <div>
                                                <span>Người báo cáo</span>
                                                <strong>{selectedReport.reporterName || `User ID: ${selectedReport.reporterId}`}</strong>
                                            </div>

                                            <div>
                                                <span>Đối tượng</span>
                                                <strong>{getTargetTypeLabel(selectedReport.targetType)}</strong>
                                            </div>

                                            <div>
                                                <span>ID đối tượng</span>
                                                <strong>{selectedReport.targetId}</strong>
                                            </div>

                                            <div>
                                                <span>Ngày gửi</span>
                                                <strong>{formatDateTime(selectedReport.createdAt)}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h4>Lý do vi phạm</h4>
                                        <p className="detail-reason">{selectedReport.reason}</p>
                                    </div>

                                    <div className="detail-section">
                                        <h4>Mô tả từ người dùng</h4>
                                        <p className="detail-description">
                                            {selectedReport.description || "Người dùng chưa cung cấp mô tả chi tiết."}
                                        </p>
                                    </div>

                                    <div className="ai-insight-box">
                                        <div className="ai-insight-header">
                                            <strong>Gợi ý kiểm tra</strong>
                                            <span>Admin Review</span>
                                        </div>
                                        <p>
                                            Kiểm tra nội dung báo cáo, lịch sử giao dịch, sản phẩm liên quan
                                            và hành vi của tài khoản trước khi đưa ra quyết định xử lý.
                                        </p>

                                        {/* TODO BACKEND:
                        Nếu sau này dùng bảng ai_content_moderation,
                        có thể hiển thị kết quả kiểm duyệt AI tại đây:
                        - isSafe
                        - flaggedReason
                        - checkedAt
                    */}
                                    </div>

                                    <div className="detail-section">
                                        <h4>Ghi chú xử lý</h4>
                                        <textarea
                                            className="resolution-note-input"
                                            value={resolutionNote}
                                            onChange={(e) => setResolutionNote(e.target.value)}
                                            placeholder="Nhập ghi chú trước khi xử lý báo cáo..."
                                        />
                                    </div>

                                    <div className="violation-action-area">
                                        {/* Lock button: only for farmer/customer reports */}
                                        {(selectedReport.targetType === "farmer" ||
                                            selectedReport.targetType === "customer") && (
                                                <button
                                                    className="btn-remove-product"
                                                    onClick={handleLockTargetAccount}
                                                    disabled={selectedReport.status === "resolved" || selectedReport.status === "rejected"}
                                                    title={selectedReport.status === "resolved" || selectedReport.status === "rejected" ? "Báo cáo đã kết thúc" : "Khóa tài khoản liên quan"}
                                                >
                                                    Khóa tài khoản liên quan
                                                </button>
                                            )}

                                        {/* Hide button: only for product reports */}
                                        {selectedReport.targetType === "product" && (
                                            <button
                                                className="btn-remove-product"
                                                onClick={handleHideProduct}
                                                disabled={selectedReport.status === "resolved" || selectedReport.status === "rejected"}
                                                title={selectedReport.status === "resolved" || selectedReport.status === "rejected" ? "Báo cáo đã kết thúc" : "Ẩn sản phẩm"}
                                            >
                                                Ẩn sản phẩm
                                            </button>
                                        )}

                                        <div className="action-two-columns">
                                            <button
                                                className="btn-warning-action"
                                                onClick={() => handleUpdateReportStatus("reviewing")}
                                                disabled={selectedReport.status === "resolved" || selectedReport.status === "rejected" || selectedReport.status === "reviewing"}
                                                title={selectedReport.status === "reviewing" ? "Đã đánh dấu đang xém xét" : undefined}
                                            >
                                                Đánh dấu đang xử lý
                                            </button>

                                            <button
                                                className="btn-dismiss-action"
                                                onClick={() => handleUpdateReportStatus("rejected")}
                                                disabled={selectedReport.status === "resolved" || selectedReport.status === "rejected"}
                                            >
                                                Từ chối báo cáo
                                            </button>
                                        </div>

                                        <button
                                            className="btn-resolve-action"
                                            onClick={() => handleUpdateReportStatus("resolved")}
                                            disabled={selectedReport.status === "resolved" || selectedReport.status === "rejected"}
                                        >
                                            Hoàn tất xử lý
                                        </button>

                                        {(selectedReport.status === "resolved" || selectedReport.status === "rejected") && (
                                            <p className="report-closed-notice">
                                                🔒 Báo cáo này đã được kết thúc và không thể thay đổi.
                                            </p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="empty-detail-panel">
                                    <div className="empty-detail-icon">📋</div>
                                    <h3>Chưa chọn báo cáo</h3>
                                    <p>
                                        Chọn một báo cáo trong danh sách bên trái để xem chi tiết
                                        và thực hiện thao tác xử lý.
                                    </p>
                                </div>
                            )}
                        </aside>
                    </section>
                </main>
            </div>

            {toastMessage && (
                <div className="admin-toast-container">
                    <div className="admin-toast">
                        <div className="toast-message-content">
                            <span>✅</span> {toastMessage}
                        </div>
                        <button className="toast-close-btn" onClick={() => setToastMessage("")}>
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
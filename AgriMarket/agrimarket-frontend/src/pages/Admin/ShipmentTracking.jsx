import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import "./ShipmentTracking.css";

export const ShipmentTracking = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  // Shipment states: "intransit" (Đang vận chuyển) | "delivered" (Đã giao hàng) | "incident" (Gặp sự cố)
  const [shipmentStatus, setShipmentStatus] = useState("intransit");

  // Incident reports log in local state
  const [incidents, setIncidents] = useState([]);
  
  // Modals visibility
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [selectedIncidentType, setSelectedIncidentType] = useState("");

  // Toast notifications
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Load user
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Show Toast
  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Handle Update Status
  const handleUpdateStatus = (status) => {
    setShipmentStatus(status);
    setShowStatusModal(false);
    if (status === "delivered") {
      showToast("Lô hàng đã được cập nhật sang trạng thái: ĐÃ GIAO HÀNG thành công!", "success");
    } else if (status === "intransit") {
      showToast("Lô hàng đã được chuyển về trạng thái: ĐANG VẬN CHUYỂN.", "success");
    }
  };

  // Handle Report an Issue
  const handleReportIncident = (e) => {
    e.preventDefault();
    if (!selectedIncidentType) return;
    
    setShipmentStatus("incident");
    const newIncident = {
      type: selectedIncidentType,
      time: new Date().toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }),
      date: "Hôm nay"
    };
    setIncidents([newIncident, ...incidents]);
    setShowIncidentModal(false);
    showToast(`Đã báo cáo sự cố: "${selectedIncidentType}" đến hệ thống và cập nhật trạng thái lô hàng!`, "warning");
  };

  // Status mapping to label and style class
  const getStatusDetails = () => {
    switch (shipmentStatus) {
      case "delivered":
        return { label: "Đã Giao Hàng", class: "status-delivered" };
      case "incident":
        return { label: "Gặp Sự Cố", class: "status-incident" };
      case "intransit":
      default:
        return { label: "Đang Vận Chuyển", class: "status-intransit" };
    }
  };

  const statusInfo = getStatusDetails();

  return (
    <div className="agri-steward-root">

      {/* 1. SIDEBAR */}
      <aside className="as-sidebar">
        <div className="as-brand">
          <div className="as-logo-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22V8M5 12H19" />
              <circle cx="12" cy="5" r="3" />
              <path d="M12 8l-4 4 4 4 4-4-4-4z" />
            </svg>
          </div>
          <div className="as-brand-text">
            <h2>Admin Panel</h2>
            <span>Trung tâm Quản lý</span>
          </div>
        </div>

        <nav className="as-nav-menu">
          <button className="as-nav-item" onClick={() => showToast("Bảng điều khiển tổng quan đang được phát triển.", "info")}>
            <span className="as-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="as-icon-svg">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            </span>
            <span className="as-label">Bảng điều khiển</span>
          </button>
          
          <button className="as-nav-item" onClick={() => navigate("/admin/shipment-requests")}>
            <span className="as-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="as-icon-svg">
                <path d="M12 2a10 10 0 0 1 7.54 16.59c-.24.25-.6.37-.92.29a9 9 0 0 0-13.24 0c-.32.08-.68-.04-.92-.29A10 10 0 0 1 12 2Z" />
                <path d="m12 14 3-3" />
                <circle cx="12" cy="14" r="1" />
              </svg>
            </span>
            <span className="as-label">Yêu cầu</span>
          </button>
          
          <button className="as-nav-item" onClick={() => showToast("Chức năng quản lý khiếu nại đang được phát triển.", "info")}>
            <span className="as-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="as-icon-svg">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <span className="as-label">Khiếu nại</span>
          </button>
          
          <button className="as-nav-item" onClick={() => showToast("Danh sách đơn hàng vận chuyển đang được phát triển.", "info")}>
            <span className="as-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="as-icon-svg">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </span>
            <span className="as-label">Đơn hàng</span>
          </button>
          
          <button className="as-nav-item active">
            <span className="as-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="as-icon-svg">
                <path d="M14 18H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11v11" />
                <path d="M19 18h2a1 1 0 0 0 1-1v-5.5L18.5 9H17v9" />
                <circle cx="7" cy="18" r="2" />
                <circle cx="17" cy="18" r="2" />
              </svg>
            </span>
            <span className="as-label">Theo dõi</span>
          </button>
          
          <button className="as-nav-item" onClick={() => showToast("Hộp thư thông báo trống.", "info")}>
            <span className="as-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="as-icon-svg">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </span>
            <span className="as-label">Thông báo</span>
          </button>
          
          <button className="as-nav-item" onClick={() => showToast("Đang mở cài đặt hệ thống...", "info")}>
            <span className="as-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="as-icon-svg">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
            <span className="as-label">Cài đặt</span>
          </button>
        </nav>

        <div className="as-sidebar-footer">
          <button className="as-btn-support" onClick={() => showToast("Đang tạo phiếu hỗ trợ kỹ thuật...", "success")}>
            <span className="plus-icon">+</span> Gửi yêu cầu hỗ trợ mới
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="as-main-container">
        
        {/* TOP BAR / HEADER */}
        <header className="ast-header">
          <div className="ast-header-left">
            <div className="ast-breadcrumbs">
              <span>Đơn hàng</span>
              <span className="separator">&gt;</span>
              <span>Theo dõi</span>
              <span className="separator">&gt;</span>
              <span className="current">SD-65</span>
            </div>
            
            <div className="ast-title-row">
              <h1>Lô hàng #AG-99824</h1>
              <span className={`ast-status-badge ${statusInfo.class}`}>{statusInfo.label}</span>
            </div>
          </div>
          
          <div className="ast-header-right">
            <button className="btn-print-manifest" onClick={() => window.print()}>
              <span className="icon">🖨️</span> In bảng kê hàng
            </button>
            <button className="btn-update-status" onClick={() => setShowStatusModal(true)}>
              <span className="icon">🔄</span> Cập nhật Trạng thái
            </button>
          </div>
        </header>

        {/* LAYOUT BODY GRID */}
        <main className="ast-content-body">
          
          <div className="ast-grid-layout">
            
            {/* LEFT SIDE COLUMN */}
            <div className="ast-left-column">
              
              {/* Map banner area */}
              <div className="ast-map-card">
                <div className="ast-map-wrapper">
                  <svg width="100%" height="100%" viewBox="0 0 600 240" preserveAspectRatio="none" className="visual-map-svg">
                    {/* Background Field Grass Texture mockup grid */}
                    <rect width="600" height="240" fill="#E8F5E9" />
                    
                    {/* Rural Roads grid overlay */}
                    <path d="M 0 50 Q 300 20 600 150" stroke="#FFFFFF" strokeWidth="8" fill="none" opacity="0.4" />
                    <path d="M 100 0 Q 350 120 450 240" stroke="#FFFFFF" strokeWidth="6" fill="none" opacity="0.4" />
                    <path d="M 0 180 Q 200 140 600 220" stroke="#FFFFFF" strokeWidth="5" fill="none" opacity="0.4" />
                    
                    {/* Route line */}
                    <path d="M 120 180 Q 280 80 480 50" fill="none" stroke="#2E7D32" strokeWidth="5" strokeLinecap="round" strokeDasharray="8,5" />
                    
                    {/* Start dot (Pickup Origin - House icon representation) */}
                    <circle cx="120" cy="180" r="16" fill="#FFFFFF" stroke="#1B5E20" strokeWidth="2" />
                    <text x="112" y="186" fontSize="16" fill="#1B5E20">🏡</text>
                    
                    {/* End dot (Destination - Store icon representation) */}
                    <circle cx="480" cy="50" r="16" fill="#FFFFFF" stroke="#E53935" strokeWidth="2" />
                    <text x="472" y="56" fontSize="16" fill="#E53935">🏬</text>
                    
                    {/* Animated Delivery Truck moving on path */}
                    <g transform={shipmentStatus === "delivered" ? "translate(460, 32)" : shipmentStatus === "incident" ? "translate(220, 102)" : "translate(300, 72)"}>
                      <rect x="0" y="0" width="26" height="14" rx="2" fill="#1B5E20" />
                      <rect x="20" y="2" width="8" height="10" rx="1" fill="#81C784" />
                      <circle cx="6" cy="15" r="3" fill="#333" />
                      <circle cx="20" cy="15" r="3" fill="#333" />
                      {shipmentStatus === "incident" && (
                        <text x="6" y="-4" fontSize="14" fill="#D32F2F" fontWeight="bold">⚠️</text>
                      )}
                    </g>
                  </svg>
                  
                  {/* Floating ETA banner */}
                  <div className="ast-eta-floating-banner">
                    <span className="icon">⏰</span>
                    <div className="eta-text">
                      <span className="label">Thời gian dự kiến đến</span>
                      <span className="value">14:30 PST</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid 2 Columns for History and Manifest */}
              <div className="ast-history-manifest-grid">
                
                {/* Tracking History Timeline */}
                <div className="ast-timeline-card">
                  <h3 className="card-title">📈 Lịch sử hành trình</h3>
                  
                  <div className="ast-timeline-list">
                    {/* If Incident has been reported, show at the top */}
                    {incidents.map((inc, index) => (
                      <div className="ast-timeline-item incident" key={index}>
                        <div className="node danger-node">
                          <span className="icon">⚠️</span>
                        </div>
                        <div className="info">
                          <h4 className="title text-danger">Báo cáo Sự cố: {inc.type}</h4>
                          <span className="meta">{inc.date}, lúc {inc.time}</span>
                        </div>
                      </div>
                    ))}

                    <div className={`ast-timeline-item ${shipmentStatus === "delivered" ? "completed" : ""}`}>
                      <div className={`node ${shipmentStatus === "delivered" ? "completed-node" : "active-node"}`}>
                        <span className="icon">{shipmentStatus === "delivered" ? "✅" : "🚚"}</span>
                      </div>
                      <div className="info">
                        <h4 className="title">
                          {shipmentStatus === "delivered" ? "Lô hàng đã giao nhận thành công" : "Đang di chuyển đến điểm giao"}
                        </h4>
                        <span className="meta">12 tháng 10, lúc 11:30 AM • Trục Quốc lộ QL1A</span>
                      </div>
                    </div>

                    <div className="ast-timeline-item completed">
                      <div className="node completed-node">
                        <span className="icon">✓</span>
                      </div>
                      <div className="info">
                        <h4 className="title">Đã rời trung tâm phân loại</h4>
                        <span className="meta">12 tháng 10, lúc 10:15 AM • Trạm trung chuyển Khu vực A</span>
                      </div>
                    </div>

                    <div className="ast-timeline-item completed">
                      <div className="node completed-node">
                        <span className="icon">✓</span>
                      </div>
                      <div className="info">
                        <h4 className="title">Đã lấy hàng thành công tại nhà vườn</h4>
                        <span className="meta">12 tháng 10, lúc 08:00 AM • Trang trại Sunrise</span>
                      </div>
                    </div>

                    <div className={`ast-timeline-item pending ${shipmentStatus === "delivered" ? "hide-pending" : ""}`}>
                      <div className="node pending-node">
                        <span className="icon">🏁</span>
                      </div>
                      <div className="info">
                        <h4 className="title">Dự kiến giao hàng tại điểm nhận</h4>
                        <span className="meta">Hôm nay, khoảng lúc 2:30 PM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manifest block */}
                <div className="ast-manifest-card">
                  <div className="manifest-header-row">
                    <h3 className="card-title">📋 Bảng kê hàng hóa</h3>
                    <span className="priority-tag-high">Độ ưu tiên cao</span>
                  </div>

                  <div className="manifest-items-list">
                    
                    <div className="manifest-item">
                      <img src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=120" alt="Cà chua" className="item-thumb" />
                      <div className="item-details">
                        <h4>Cà chua hữu cơ Heirloom</h4>
                        <span className="qty">S.Lượng: 25 lbs • Hộp số 1 / 3</span>
                      </div>
                      <span className="badge-warning-item">Dễ vỡ</span>
                    </div>

                    <div className="manifest-item">
                      <img src="https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=120" alt="Cà rốt" className="item-thumb" />
                      <div className="item-details">
                        <h4>Cà rốt hữu cơ tươi</h4>
                        <span className="qty">S.Lượng: 50 lbs • Hộp số 2 / 3</span>
                      </div>
                    </div>

                    <div className="manifest-item">
                      <div className="item-thumb fallback-thumb">🧀</div>
                      <div className="item-details">
                        <h4>Bánh phô mai thủ công</h4>
                        <span className="qty">S.Lượng: 2 cái • K.soát nhiệt độ</span>
                      </div>
                      <span className="badge-cold-item">Bảo quản lạnh</span>
                    </div>

                  </div>
                </div>

              </div>

              {/* Bottom Proof of delivery box */}
              <div className="ast-proof-card">
                {shipmentStatus === "delivered" ? (
                  <div className="proof-delivered-state">
                    <div className="proof-delivered-header">
                      <span className="verified-badge">✓ Đã xác thực bàn giao</span>
                      <h3>Minh chứng giao hàng (POD)</h3>
                    </div>
                    <div className="proof-delivered-grid">
                      <div className="proof-photo-box">
                        <span className="label">Ảnh chụp thực tế bàn giao:</span>
                        <div className="delivered-photo-mock">
                          <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=300" alt="Bàn giao thực tế" />
                          <span className="photo-time-tag">Bàn giao lúc 14:28 - Kho B</span>
                        </div>
                      </div>
                      <div className="proof-signature-box">
                        <span className="label">Chữ ký xác nhận người nhận:</span>
                        <div className="signature-mock-panel">
                          <div className="sig-graphic">Nguyễn Văn A</div>
                          <span className="sig-details">Đã ký nhận: Nguyễn Văn A (Quản lý nhận hàng)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="proof-pending-state">
                    <div className="icon-document">📄</div>
                    <h3>Chưa có Minh chứng giao hàng</h3>
                    <p>Chữ ký và ảnh chụp bàn giao thực tế tại kho sẽ xuất hiện tại đây sau khi tài xế hoàn tất quy trình giao nhận.</p>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT SIDE COLUMN */}
            <div className="ast-right-column">
              
              {/* Assigned Driver Box */}
              <div className="ast-right-card driver-card">
                <h3 className="section-title">TÀI XẾ PHỤ TRÁCH</h3>
                
                <div className="driver-profile-row">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" alt="Marcus Johnson" className="driver-avatar" />
                  <div className="driver-meta">
                    <h4>Marcus Johnson</h4>
                    <span className="driver-rating">Mã: TX-4092 • 4.9 ★</span>
                  </div>
                </div>
                
                <div className="vehicle-info-box">
                  <span className="truck-symbol">🚚</span>
                  <div className="vehicle-meta">
                    <span className="type">Xe van bảo ôn Sprinter</span>
                    <span className="plate font-semibold">Biển kiểm soát: 29C-123.45</span>
                  </div>
                </div>
                
                <div className="driver-action-buttons">
                  <button className="btn-driver-call" onClick={() => showToast("Đang kết nối cuộc gọi đến tài xế Marcus Johnson...", "success")}>
                    📞 Gọi điện
                  </button>
                  <button className="btn-driver-msg" onClick={() => showToast("Đang mở hộp thoại nhắn tin với tài xế...", "success")}>
                    💬 Nhắn tin
                  </button>
                </div>
              </div>

              {/* Pickup origin */}
              <div className="ast-right-card">
                <h3 className="section-title">ĐIỂM LẤY HÀNG</h3>
                <div className="location-info-row">
                  <div className="circle-icon green">🚜</div>
                  <div className="location-address">
                    <h4>Trang trại Sunrise Valley</h4>
                    <p>Đường Thu Hoạch 1042, Thung lũng Willamette, Lâm Đồng</p>
                    <button className="btn-contact-manager" onClick={() => showToast("Đang chuyển hướng liên hệ chủ trang trại...", "info")}>
                      Liên hệ Quản lý trang trại
                    </button>
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div className="ast-right-card">
                <h3 className="section-title">ĐIỂM GIAO HÀNG</h3>
                <div className="location-info-row">
                  <div className="circle-icon gray">🏬</div>
                  <div className="location-address">
                    <h4>Cửa hàng Thực phẩm Urban Roots</h4>
                    <p>Số 445 Đường Ngọc Trai, Quận 1, TP. Hồ Chí Minh</p>
                    <span className="phone-text">📞 +1 (555) 019-2837</span>
                  </div>
                </div>
              </div>

              {/* Report Issue button */}
              <button className="btn-report-issue" onClick={() => setShowIncidentModal(true)}>
                ⚠️ Báo cáo Sự cố
              </button>

            </div>

          </div>
        </main>
      </div>

      {/* MODAL 1: UPDATE STATUS */}
      {showStatusModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-box">
            <h3 className="modal-title">Cập nhật Trạng thái Lô hàng</h3>
            <p className="modal-message">Vui lòng chọn trạng thái vận chuyển mới cho lô hàng này:</p>
            
            <div className="status-options-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '12px 0' }}>
              <button className="btn-status-opt" onClick={() => handleUpdateStatus("intransit")}>
                🚚 Đang Vận Chuyển (In Transit)
              </button>
              <button className="btn-status-opt success" onClick={() => handleUpdateStatus("delivered")}>
                ✅ Đã Giao Hàng (Delivered)
              </button>
            </div>
            
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowStatusModal(false)}>
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REPORT INCIDENT */}
      {showIncidentModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-box">
            <h3 className="modal-title">⚠️ Báo cáo Sự cố Giao hàng</h3>
            <p className="modal-message">Vui lòng chọn loại sự cố xảy ra đối với hành trình lô hàng này:</p>
            
            <form onSubmit={handleReportIncident} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <select 
                className="form-control" 
                value={selectedIncidentType} 
                onChange={(e) => setSelectedIncidentType(e.target.value)}
                required
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E0' }}
              >
                <option value="">-- Chọn sự cố gặp phải --</option>
                <option value="Hỏng xe giữa đường">Hỏng xe giữa đường</option>
                <option value="Tắc nghẽn giao thông nghiêm trọng">Tắc nghẽn giao thông nghiêm trọng</option>
                <option value="Nhiệt độ thùng hàng vượt ngưỡng bảo quản">Nhiệt độ thùng hàng vượt ngưỡng bảo quản</option>
                <option value="Thời tiết xấu cản trở di chuyển">Thời tiết xấu cản trở di chuyển</option>
              </select>
              
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowIncidentModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-confirm btn-danger">
                  Báo cáo Sự cố
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className={`custom-toast ${toastType}`}>
          <span className="custom-toast-icon">
            {toastType === "success" && "✅"}
            {toastType === "warning" && "⚠️"}
            {toastType === "info" && "ℹ️"}
          </span>
          <span className="custom-toast-message">{toastMessage}</span>
          <button className="custom-toast-close" onClick={() => setToastMessage("")}>✕</button>
        </div>
      )}

    </div>
  );
};

export default ShipmentTracking;

// src/pages/Shipper/UpdateShipmentStatus.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../services/authService";
import orderService from "../../services/orderService";
import "./UpdateShipmentStatus.css";
import "./ShipmentRequests.css";

const UpdateShipmentStatus = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get("orderCode");
  const [currentUser, setCurrentUser] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [currentStatus, setCurrentStatus] = useState("intransit"); // assigned, pickup, intransit, delivered, incident
  const [timestamp, setTimestamp] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);

  // UI States
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);

    if (orderCode) {
      const fetchOrderDetails = async () => {
        try {
          const data = await orderService.getOrderById(orderCode);
          setOrder(data);
          if (data.detailedStatus) {
            setCurrentStatus(data.detailedStatus === "out_for_delivery" ? "intransit" : data.detailedStatus);
          } else if (data.status) {
            if (data.status === "delivered") setCurrentStatus("delivered");
            else if (data.status === "shipping") setCurrentStatus("intransit");
            else setCurrentStatus("assigned");
          }
          if (data.shipperNotes) setNotes(data.shipperNotes);
          if (data.podPhoto) setUploadedImage(data.podPhoto);
        } catch (error) {
          console.error("Lỗi khi tải chi tiết đơn hàng:", error);
          showToast("Không thể tải chi tiết đơn hàng.");
        } finally {
          setLoading(false);
        }
      };
      fetchOrderDetails();
    } else {
      setLoading(false);
    }

    // Initialize current timestamp in format MM/DD/YYYY, hh:mm AM/PM
    const formatDateTime = (date) => {
      const pad = (num) => String(num).padStart(2, '0');
      const mm = pad(date.getMonth() + 1);
      const dd = pad(date.getDate());
      const yyyy = date.getFullYear();
      let hours = date.getHours();
      const minutes = pad(date.getMinutes());
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // hour 0 should be 12
      const formattedHours = pad(hours);
      return `${mm}/${dd}/${yyyy}, ${formattedHours}:${minutes} ${ampm}`;
    };

    setTimestamp(formatDateTime(new Date()));
  }, [orderCode]);

  // Show Toast
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Image Upload Sim
  const handleDropzoneClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        showToast("Đã tải lên ảnh bằng chứng giao hàng thành công!");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedImage = (e) => {
    e.stopPropagation();
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    showToast("Đã gỡ bỏ ảnh bằng chứng giao hàng.");
  };

  // Handle new status selection
  const handleStatusChange = (newVal) => {
    setCurrentStatus(newVal);

    // Get original status
    let originalStatus = "assigned";
    if (order) {
      if (order.detailedStatus) {
        originalStatus = order.detailedStatus === "out_for_delivery" ? "intransit" : order.detailedStatus;
      } else if (order.status) {
        if (order.status === "delivered") originalStatus = "delivered";
        else if (order.status === "shipping") originalStatus = "intransit";
        else originalStatus = "assigned";
      }
    }

    if (newVal === originalStatus) {
      // Restore original notes and uploaded image
      setNotes(order?.shipperNotes || "");
      setUploadedImage(order?.podPhoto || null);
    } else {
      // Clear fields for the new status
      setNotes("");
      setUploadedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Save Status
  const handleSaveStatus = async (e) => {
    if (e) e.preventDefault();

    // Get original status
    let originalStatus = "assigned";
    if (order) {
      if (order.detailedStatus) {
        originalStatus = order.detailedStatus === "out_for_delivery" ? "intransit" : order.detailedStatus;
      } else if (order.status) {
        if (order.status === "delivered") originalStatus = "delivered";
        else if (order.status === "shipping") originalStatus = "intransit";
        else originalStatus = "assigned";
      }
    }

    const statusesOrder = ["assigned", "pickup", "intransit", "delivered"];
    const currentIndex = statusesOrder.indexOf(originalStatus);
    const targetIndex = statusesOrder.indexOf(currentStatus);

    // Only validate forward sequence if not setting/exiting "incident" status
    if (originalStatus !== "incident" && currentStatus !== "incident") {
      if (currentIndex !== -1 && targetIndex !== -1 && targetIndex <= currentIndex) {
        showToast("Lỗi: Không thể cập nhật lại trạng thái đã hoàn thành.");
        return;
      }
    }

    showToast("Đang lưu cập nhật trạng thái đơn hàng...");
    
    try {
      await orderService.updateShipperOrderStatus(orderCode, currentStatus, notes, uploadedImage);
      showToast("Cập nhật trạng thái thành công! Đang chuyển hướng...");
      setTimeout(() => {
        navigate("/shipper/requests");
      }, 1000);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      showToast("Lỗi khi cập nhật trạng thái: " + (error.response?.data || error.message));
    }
  };

  // Check Timeline Node Statuses
  const getNodeClass = (nodeStatus) => {
    const statusesOrder = ["assigned", "pickup", "intransit", "delivered"];
    let statusToUse = currentStatus;
    if (statusToUse === "incident" && order) {
      if (order.detailedStatus) {
        statusToUse = order.detailedStatus;
      } else if (order.status) {
        if (order.status === "delivered") statusToUse = "delivered";
        else if (order.status === "shipping") statusToUse = "intransit";
        else statusToUse = "assigned";
      }
    }
    if (statusToUse === "out_for_delivery") {
      statusToUse = "intransit";
    }

    const currentIndex = statusesOrder.indexOf(statusToUse);
    const targetIndex = statusesOrder.indexOf(nodeStatus);

    if (currentIndex === -1) return "";

    if (targetIndex <= currentIndex) {
      return "completed";
    } else if (targetIndex === currentIndex + 1) {
      return "active";
    }
    return "";
  };

  const getStatusLabelText = (statusVal) => {
    switch (statusVal) {
      case "assigned": return "Đã điều phối";
      case "pickup": return "Đã lấy hàng";
      case "intransit": return "Đang vận chuyển";
      case "delivered": return "Đã giao";
      default: return "Đang vận chuyển";
    }
  };

  if (loading) {
    return (
      <div className="agri-steward-root" style={{ justifyContent: "center", alignItems: "center", display: "flex", height: "100vh" }}>
        <h3 style={{ color: "#2E7D32" }}>Đang tải thông tin đơn hàng...</h3>
      </div>
    );
  }

  return (
    <div className="agri-steward-root">
      
      {/* 1. SIDEBAR */}
      <aside className="as-sidebar">
        <div className="as-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <div className="as-logo-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 18H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11v11" />
              <path d="M19 18h2a1 1 0 0 0 1-1v-5.5L18.5 9H17v9" />
              <circle cx="7" cy="18" r="2" />
              <circle cx="17" cy="18" r="2" />
            </svg>
          </div>
          <div className="as-brand-text">
            <h2>Partner Hub</h2>
            <span>Verified Shipping Node</span>
          </div>
        </div>

        <nav className="as-nav-menu">
          <button className="as-nav-item" onClick={() => navigate("/shipper/requests")}>
            <span className="as-icon">📊</span>
            <span className="as-label">Bảng điều khiển</span>
          </button>
          
          <button className="as-nav-item active" onClick={() => navigate("/shipper/requests")}>
            <span className="as-icon">📦</span>
            <span className="as-label">Đơn vận chuyển</span>
          </button>

          <button className="as-nav-item" onClick={() => navigate("/profile/orders")}>
            <span className="as-icon">🕒</span>
            <span className="as-label">Lịch sử</span>
          </button>

          <button className="as-nav-item" onClick={() => showToast("Đang kết nối tổng đài điều phối hỗ trợ...", "info")}>
            <span className="as-icon">📞</span>
            <span className="as-label">Liên hệ</span>
          </button>
        </nav>

        <div className="as-sidebar-footer">
          <button className="as-btn-support" onClick={() => showToast("Đang tạo phiếu hỗ trợ kỹ thuật...", "success")}>
            <span className="plus-icon">+</span> Gửi hỗ trợ mới
          </button>
        </div>
      </aside>

      {/* 2. MAIN DISPLAY AREA */}
      <div className="as-main-container">
        
        {/* HEADER BAR */}
        <header className="ast-header">
          <div className="ast-header-left">
            <div className="ast-breadcrumbs">
              <span>Đơn hàng</span>
              <span className="separator">&gt;</span>
              <span>Theo dõi</span>
              <span className="separator">&gt;</span>
              <span className="current">Cập nhật</span>
            </div>
            
            <div className="ast-title-row">
              <h1>Cập nhật Trạng thái Lô hàng</h1>
            </div>
          </div>
          
          <div className="ast-header-right">
            <button className="btn-print-manifest" onClick={() => window.open("tel:0123456789")}>
              📞 Liên hệ
            </button>
            <button className="btn-update-status" onClick={handleSaveStatus}>
              💾 Lưu Trạng thái
            </button>
          </div>
        </header>

        {/* CONTENT BODY */}
        <main className="ast-content-body">
          
          {/* Grid Panel Layout */}
          <div className="update-status-grid">
            
            {/* Left Main Card Column */}
            <div className="grid-main-col">
              
              {/* Active Shipment Details Header */}
              <div className="logistics-card shipment-info-card">
                <div className="shipment-tags">
                  <span className="shipment-tag-gray">{order?.trackingNumber || "Chưa có mã vận đơn"}</span>
                  <span className="shipment-tag-green">{order?.id || ""}</span>
                  <span className={`status-floating-badge ${currentStatus === "incident" ? "incident" : ""}`}>
                    {currentStatus === "delivered" ? "Đã giao" :
                     currentStatus === "intransit" || currentStatus === "out_for_delivery" ? "Đang vận chuyển" :
                     currentStatus === "pickup" ? "Đã lấy hàng" :
                     currentStatus === "assigned" ? "Đã điều phối" : "Gặp sự cố"}
                  </span>
                </div>
                <h2 className="shipment-title">{order?.items?.[0]?.name || "Nông sản Hữu cơ"}</h2>
                
                <div className="shipment-details-row">
                  <div className="detail-item">
                    <span className="detail-icon">👤</span>
                    <div>
                      <span className="detail-label">Khách hàng</span>
                      <p className="detail-value">{order?.recipient || ""}</p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <div>
                      <span className="detail-label">Địa chỉ giao hàng</span>
                      <p className="detail-value">
                        {order?.address || ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Timeline Block */}
              <div className="logistics-card">
                <h4 className="timeline-section-title">Tiến trình giao hàng</h4>
                
                <div className="horizontal-timeline">
                  {/* Timeline Bar Line background */}
                  <div className="timeline-line"></div>
                  
                  {/* Node 1: Assigned */}
                  <div className={`timeline-node-item ${getNodeClass("assigned")}`}>
                    <div className="timeline-node-circle">✓</div>
                    <span className="timeline-node-label">Đã điều phối</span>
                    <span className="timeline-node-time">08:00 AM</span>
                  </div>

                  {/* Node 2: Pickup */}
                  <div className={`timeline-node-item ${getNodeClass("pickup")}`}>
                    <div className="timeline-node-circle">🏡</div>
                    <span className="timeline-node-label">Lấy hàng</span>
                    <span className="timeline-node-time">09:15 AM</span>
                  </div>

                  {/* Node 3: In Transit */}
                  <div className={`timeline-node-item ${getNodeClass("intransit")}`}>
                    <div className="timeline-node-circle">🚚</div>
                    <span className="timeline-node-label">Vận chuyển</span>
                    <span className="timeline-node-time">10:30 AM</span>
                  </div>

                  {/* Node 4: Delivered */}
                  <div className={`timeline-node-item ${getNodeClass("delivered")}`}>
                    <div className="timeline-node-circle">🏁</div>
                    <span className="timeline-node-label">Đã giao</span>
                    <span className="timeline-node-time">
                      {getNodeClass("delivered") === "active" ? "Trạng thái hiện tại" : "Chờ giao"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Input Updates */}
              <div className="logistics-card">
                <h4 className="form-section-title">Cập nhật Trạng thái</h4>
                
                <form onSubmit={handleSaveStatus}>
                  <div className="form-row-2col">
                    <div className="form-group-item">
                      <label htmlFor="new-status-select">Trạng thái mới</label>
                      <select 
                        id="new-status-select"
                        className="logistics-select"
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(e.target.value)}
                      >
                        <option value="assigned">Đã điều phối</option>
                        <option value="pickup">Lấy hàng / Đã lấy hàng</option>
                        <option value="intransit">Đang vận chuyển</option>
                        <option value="delivered">Đã giao hàng</option>
                        <option value="incident">Gặp sự cố / Bị trễ</option>
                      </select>
                    </div>

                    <div className="form-group-item">
                      <label htmlFor="timestamp-input">Thời gian</label>
                      <input 
                        id="timestamp-input"
                        type="text" 
                        className="logistics-input"
                        value={timestamp}
                        onChange={(e) => setTimestamp(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group-item" style={{ marginBottom: '20px' }}>
                    <label htmlFor="driver-notes">Ghi chú của Tài xế (Không bắt buộc)</label>
                    <textarea 
                      id="driver-notes"
                      className="logistics-textarea"
                      placeholder="Thêm bất kỳ ghi chú liên quan nào về việc giao hàng tại đây..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div className="form-group-item">
                    <label>Minh chứng giao nhận (POD)</label>
                    <div className="upload-dropzone" onClick={handleDropzoneClick}>
                      <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        style={{ display: "none" }}
                      />
                      {uploadedImage ? (
                        <div className="uploaded-preview-container">
                          <img src={uploadedImage} alt="POD Preview" className="uploaded-preview-img" />
                          <button type="button" className="btn-remove-preview" onClick={removeUploadedImage}>✕</button>
                        </div>
                      ) : (
                        <>
                          <div className="upload-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                              <circle cx="12" cy="13" r="4" />
                            </svg>
                          </div>
                          <p className="upload-text">Nhấn để tải lên ảnh hoặc chụp hình thực tế</p>
                          <p className="upload-subtext">Đặt hàng tại cửa, chữ ký khách hàng, v.v.</p>
                        </>
                      )}
                    </div>
                  </div>
                </form>
              </div>

            </div>

            {/* Right Side Column Cards */}
            <div className="grid-side-col">
              
              {/* Mini Map Card */}
              <div className="logistics-card" style={{ padding: '16px' }}>
                <h4 className="side-card-title">
                  Bản đồ Đường đi
                  <span style={{ fontSize: '16px', cursor: 'pointer' }} onClick={() => showToast("Đang xác định lại vị trí GPS...")}>🎯</span>
                </h4>
                
                <div className="side-map-wrapper">
                  <svg width="100%" height="240" viewBox="0 0 300 240" style={{ backgroundColor: '#E4F2E7', display: 'block' }}>
                    {/* Grid tracks mock representing road network */}
                    <path d="M 0 60 C 100 40, 200 120, 300 80" stroke="#FFFFFF" strokeWidth="6" fill="none" opacity="0.6" />
                    <path d="M 50 0 C 120 100, 150 160, 250 240" stroke="#FFFFFF" strokeWidth="5" fill="none" opacity="0.6" />
                    <path d="M 0 180 C 150 140, 220 200, 300 160" stroke="#FFFFFF" strokeWidth="6" fill="none" opacity="0.6" />
                    
                    {/* Actual delivery path */}
                    <path d="M 60 190 Q 150 120 220 70" stroke="var(--logistics-primary)" strokeWidth="4" strokeLinecap="round" strokeDasharray="6,4" fill="none" />
                    
                    {/* Starting pin */}
                    <circle cx="60" cy="190" r="10" fill="#ffffff" stroke="var(--logistics-primary)" strokeWidth="2" />
                    <circle cx="60" cy="190" r="4" fill="var(--logistics-primary)" />
                    
                    {/* Destination PIN */}
                    <circle cx="220" cy="70" r="12" fill="#FEF2F2" stroke="#EF4444" strokeWidth="2" />
                    <text x="214" y="75" fontSize="13" fill="#EF4444">📍</text>
                    
                    {/* Animated current position indicator (Truck or Dot) */}
                    <g transform={currentStatus === "delivered" ? "translate(212, 60)" : "translate(130, 126)"} style={{ transition: 'transform 0.8s ease-in-out' }}>
                      <circle cx="8" cy="8" r="8" fill="#10B981" />
                      <circle cx="8" cy="8" r="12" fill="#10B981" opacity="0.3" className="pulse-dot" />
                    </g>
                  </svg>
                </div>
                
                <p className="side-map-eta">Dự kiến: 12 phút (5.2 km)</p>
              </div>

              {/* Quick Actions Card */}
              <div className="logistics-card">
                <h4 className="side-card-title">Thao tác nhanh</h4>
                
                <div className="quick-actions-list">
                  <button 
                    type="button" 
                    className="btn-quick-action"
                    onClick={() => showToast("Đã gửi tin nhắn thông báo thời gian đến (ETA) cho khách hàng!")}
                  >
                    <span>💬 Thông báo thời gian đến (ETA)</span>
                    <span className="action-btn-subtitle">Gửi tin nhắn thông báo tự động</span>
                  </button>

                  <button 
                    type="button" 
                    className="btn-quick-action"
                    onClick={() => showToast("Đang kết nối liên hệ tổng đài điều phối hỗ trợ...")}
                  >
                    <span>🚑 Liên hệ Điều phối viên</span>
                    <span className="action-btn-subtitle">Báo cáo sự cố khẩn cấp hoặc xe cộ</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </main>

        {/* 3. FOOTER */}
        <footer className="logistics-footer">
          <span>© 2024 Chương trình Quản lý AgriLogistics. Bảo lưu mọi quyền.</span>
          <div className="footer-links">
            <a href="/privacy" className="footer-link" onClick={(e) => { e.preventDefault(); navigate("/privacy"); }}>Chính sách Bảo mật</a>
            <a href="/terms" className="footer-link" onClick={(e) => { e.preventDefault(); navigate("/terms"); }}>Điều khoản Dịch vụ</a>
            <a href="/terms" className="footer-link" onClick={(e) => { e.preventDefault(); navigate("/terms"); }}>Thỏa thuận Vận chuyển</a>
          </div>
        </footer>

      </div>

      {/* TOAST MESSAGE CONTAINER */}
      {toastMessage && (
        <div className="logistics-toast">
          <span>🔔</span> {toastMessage}
        </div>
      )}

    </div>
  );
};

export default UpdateShipmentStatus;

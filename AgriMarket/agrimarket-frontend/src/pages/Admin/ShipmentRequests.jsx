import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import "./ShipmentRequests.css";

// Sample mock requests data in Vietnamese
const INITIAL_REQUESTS = [
  {
    id: "REQ-8924",
    orderId: "ORD-22910",
    status: "new",
    priority: "urgent",
    priorityLabel: "Khẩn cấp",
    timeAgo: "10 phút trước",
    distance: "15 dặm (24 km)",
    pickup: {
      location: "Trang trại Thung lũng Xanh, Phân khu 4",
      contact: "Sarah Jenkins (+1 555-0192)",
      time: "14:00 - 15:00 Hôm nay"
    },
    delivery: {
      location: "FreshMart Hub, Trung tâm Thành phố",
      contact: "Cổng nhận hàng D (Liên hệ điều phối)",
      time: "17:00 Hôm nay"
    },
    cargoSummary: [
      { name: "Táo Fuji Hữu cơ", quantity: "1 Pallet", weight: "400kg" },
      { name: "Táo Gala Đỏ", quantity: "1 Pallet", weight: "400kg" }
    ],
    tempControl: "Yêu cầu xe bảo ôn kiểm soát nhiệt độ (4°C - 6°C). Vận chuyển nhẹ tay.",
    itemSummaryText: "2 Pallet (Táo Hữu cơ)"
  },
  {
    id: "REQ-8923",
    orderId: "ORD-22908",
    status: "new",
    priority: "normal",
    priorityLabel: "Thường",
    timeAgo: "45 phút trước",
    distance: "8 dặm (13 km)",
    pickup: {
      location: "Nông trại Sunny Side, Đà Lạt",
      contact: "Trần Văn Nam (+84 901-234-567)",
      time: "15:30 - 16:30 Hôm nay"
    },
    delivery: {
      location: "Chợ đầu mối Nông sản Thành phố",
      contact: "Quầy B3 - Ban quản lý chợ",
      time: "19:00 Hôm nay"
    },
    cargoSummary: [
      { name: "Rau Cải Xanh VietGAP", quantity: "3 Thùng", weight: "150kg" },
      { name: "Súp Lơ Trắng", quantity: "2 Thùng", weight: "100kg" }
    ],
    tempControl: "Hàng tươi sống, tránh để trực tiếp dưới ánh nắng mặt trời và xếp chồng quá cao.",
    itemSummaryText: "5 Thùng (Rau củ Hỗn hợp)"
  },
  {
    id: "REQ-8922",
    orderId: "ORD-22895",
    status: "new",
    priority: "urgent",
    priorityLabel: "Khẩn cấp",
    timeAgo: "1 giờ trước",
    distance: "25 dặm (40 km)",
    pickup: {
      location: "Hợp tác xã Nông nghiệp Đà Lạt Xanh",
      contact: "Nguyễn Thị Lan (+84 912-345-678)",
      time: "09:00 - 10:00 Ngày mai"
    },
    delivery: {
      location: "Kho mát Siêu thị Co.opmart Quận 1",
      contact: "Bộ phận Tiếp nhận Kho lạnh",
      time: "13:00 Ngày mai"
    },
    cargoSummary: [
      { name: "Dâu Tây Giống Mỹ", quantity: "4 Pallet", weight: "1,200kg" }
    ],
    tempControl: "Tránh rung lắc mạnh, yêu cầu duy trì nhiệt độ ổn định (8°C - 12°C) suốt hành trình.",
    itemSummaryText: "4 Pallet (Dâu tây Tươi)"
  },
  {
    id: "REQ-8921",
    orderId: "ORD-22890",
    status: "new",
    priority: "normal",
    priorityLabel: "Thường",
    timeAgo: "2 giờ trước",
    distance: "18 dặm (29 km)",
    pickup: {
      location: "Vườn Cam Sành Hòa Bình",
      contact: "Lê Hoàng Bình (+84 988-777-666)",
      time: "08:00 - 09:30 Hôm nay"
    },
    delivery: {
      location: "Tổng kho Bách Hóa Xanh, Bình Dương",
      contact: "Trưởng ca nhận hàng - A. Hùng",
      time: "12:00 Hôm nay"
    },
    cargoSummary: [
      { name: "Cam Sành Loại 1", quantity: "10 Thùng", weight: "500kg" }
    ],
    tempControl: "Thông khí tốt, không xếp chồng quá 5 lớp hộp carton.",
    itemSummaryText: "10 Thùng (Cam Sành)"
  }
];

export const ShipmentRequests = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  
  // Dashboard requests state
  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem("agri_shipment_requests");
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  // Selected request for details view
  const [selectedId, setSelectedId] = useState("");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "urgent" | "sameday"

  // Counts for KPI Cards
  const [newCount, setNewCount] = useState(24);
  const [acceptedCount, setAcceptedCount] = useState(18);
  const [urgentCount, setUrgentCount] = useState(3);

  // Success / error toast notification state
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    actionType: "", // "accept" | "reject"
    requestId: ""
  });

  // Sync to localstorage
  useEffect(() => {
    localStorage.setItem("agri_shipment_requests", JSON.stringify(requests));
  }, [requests]);

  // Load user
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    // Set first visible request as default selected
    const activeReqs = requests.filter(r => r.status === "new");
    if (activeReqs.length > 0) {
      setSelectedId(activeReqs[0].id);
    }
  }, []);

  // Update KPI counts dynamically based on active requests
  useEffect(() => {
    const newReqs = requests.filter(r => r.status === "new");
    setNewCount(newReqs.length + 20); // base count offset + current active items
    
    const urgents = newReqs.filter(r => r.priority === "urgent");
    setUrgentCount(urgents.length);
  }, [requests]);

  // Show dynamic notification toast
  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Handle Accept/Reject action confirmation
  const triggerAction = (actionType, id) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;

    if (actionType === "accept") {
      setConfirmModal({
        isOpen: true,
        title: "Xác nhận Nhận Vận Chuyển",
        message: `Bạn có chắc chắn muốn CHẤP NHẬN yêu cầu vận chuyển ${id} này?`,
        actionType: "accept",
        requestId: id
      });
    } else if (actionType === "reject") {
      setConfirmModal({
        isOpen: true,
        title: "Từ Chối Yêu Cầu Vận Chuyển",
        message: `Bạn có chắc chắn muốn TỪ CHỐI yêu cầu vận chuyển ${id} này? Hành động này không thể hoàn tác.`,
        actionType: "reject",
        requestId: id
      });
    }
  };

  // Confirm Action execution
  const executeConfirmedAction = () => {
    const { actionType, requestId } = confirmModal;
    setConfirmModal({ isOpen: false, title: "", message: "", actionType: "", requestId: "" });

    if (actionType === "accept") {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "accepted" } : r));
      setAcceptedCount(prev => prev + 1);
      showToast(`Đã chấp nhận yêu cầu vận chuyển ${requestId} thành công!`, "success");
      
      // Auto-select next request
      const remaining = requests.filter(r => r.id !== requestId && r.status === "new");
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id);
      } else {
        setSelectedId("");
      }
    } else if (actionType === "reject") {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "rejected" } : r));
      showToast(`Đã từ chối yêu cầu vận chuyển ${requestId}.`, "warning");
      
      // Auto-select next request
      const remaining = requests.filter(r => r.id !== requestId && r.status === "new");
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id);
      } else {
        setSelectedId("");
      }
    }
  };

  // Reset demo requests data
  const handleResetDemo = () => {
    setRequests(INITIAL_REQUESTS);
    setAcceptedCount(18);
    if (INITIAL_REQUESTS.length > 0) {
      setSelectedId(INITIAL_REQUESTS[0].id);
    }
    showToast("Đã khôi phục dữ liệu yêu cầu vận chuyển mẫu!", "success");
  };

  // Filter and search logic
  const filteredRequests = requests.filter(r => {
    // Only show new/pending requests in the processing list
    if (r.status !== "new") return false;

    // Search query matches ID, pickup location, or delivery location
    const matchQuery = 
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.pickup.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.delivery.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.orderId.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter type
    if (activeFilter === "urgent") {
      return matchQuery && r.priority === "urgent";
    }
    if (activeFilter === "sameday") {
      // items mentioning "Hôm nay" are considered same-day delivery
      return matchQuery && (r.delivery.time.includes("Hôm nay") || r.pickup.time.includes("Hôm nay"));
    }

    return matchQuery;
  });

  const selectedRequest = requests.find(r => r.id === selectedId);

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
            <h2>AgriSteward</h2>
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
          
          <button className="as-nav-item active">
            <span className="as-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="as-icon-svg">
                <path d="M12 2a10 10 0 0 1 7.54 16.59c-.24.25-.6.37-.92.29a9 9 0 0 0-13.24 0c-.32.08-.68-.04-.92-.29A10 10 0 0 1 12 2Z" />
                <path d="m12 14 3-3" />
                <circle cx="12" cy="14" r="1" />
              </svg>
            </span>
            <span className="as-label">Yêu cầu</span>
            <span className="as-badge-count">{filteredRequests.length}</span>
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
          
          <button className="as-nav-item" onClick={() => navigate("/admin/shipment-tracking")}>
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
          
          <button className="as-btn-reset-demo" onClick={handleResetDemo}>
            🔄 Khôi phục dữ liệu mẫu
          </button>
        </div>
      </aside>

      {/* MAIN LAYOUT */}
      <div className="as-main-container">
        
        {/* 2. HEADER */}
        <header className="as-header">
          <div className="as-header-left">
            <h1>Yêu cầu Vận chuyển</h1>
          </div>
          
          <div className="as-header-right">
            <div className="as-actions-icons">
              <button className="as-circle-btn" title="Tìm kiếm nhanh" onClick={() => showToast("Nhập từ khóa tại ô tìm kiếm bên dưới.", "info")}>
                <span className="icon">🔍</span>
              </button>
              <button className="as-circle-btn" title="Thông báo hệ thống" onClick={() => showToast("Không có thông báo điều phối mới.", "success")}>
                <span className="icon">🔔</span>
                <span className="dot"></span>
              </button>
              <button className="as-circle-btn" title="Trợ giúp / Hướng dẫn">
                <span className="icon">❓</span>
              </button>
            </div>
            
            <div className="as-user-badge" onClick={() => navigate("/admin/users")} title="Chuyển đến quản trị hệ thống" style={{ cursor: "pointer" }}>
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="Avatar Admin" className="as-avatar" />
              <div className="as-user-info">
                <span className="name">{currentUser?.fullName || "Nguyễn Điều Phối"}</span>
                <span className="role">Quản trị viên Cao cấp</span>
              </div>
              <span className="arrow-right">→</span>
            </div>
          </div>
        </header>

        {/* 3. CONTENT AREA */}
        <main className="as-content-body">
          
          {/* KPI Cards Row */}
          <div className="as-kpi-row">
            <div className="as-kpi-card">
              <span className="title">YÊU CẦU MỚI</span>
              <div className="value-row">
                <span className="number">{newCount}</span>
                <span className="badge success">+5 so với hôm qua</span>
              </div>
            </div>

            <div className="as-kpi-card">
              <span className="title">ĐÃ CHẤP NHẬN (HÔM NAY)</span>
              <div className="value-row">
                <span className="number">{acceptedCount}</span>
                <span className="trend-arrow">↗</span>
              </div>
            </div>

            <div className="as-kpi-card highlight-danger">
              <span className="title">CẦN LƯU Ý</span>
              <div className="value-row">
                <span className="number text-danger">{urgentCount}</span>
                <span className="badge danger">Ưu tiên Khẩn cấp</span>
              </div>
            </div>
          </div>

          {/* Filter Bar Row */}
          <div className="as-filters-bar">
            <div className="as-search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Tìm kiếm theo mã yêu cầu, khách hàng hoặc vị trí..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // Reset selection if current selected is filtered out
                  const filtered = requests.filter(r => r.status === "new" && r.id.toLowerCase().includes(e.target.value.toLowerCase()));
                  if (filtered.length > 0 && !filtered.some(f => f.id === selectedId)) {
                    setSelectedId(filtered[0].id);
                  }
                }}
              />
            </div>

            <div className="as-filter-chips">
              <button 
                className={`filter-chip ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                Tất cả yêu cầu
              </button>
              <button 
                className={`filter-chip ${activeFilter === "urgent" ? "active" : ""}`}
                onClick={() => setActiveFilter("urgent")}
              >
                Khẩn cấp
              </button>
              <button 
                className={`filter-chip ${activeFilter === "sameday" ? "active" : ""}`}
                onClick={() => setActiveFilter("sameday")}
              >
                Giao trong ngày
              </button>
              <button className="filter-options-btn" onClick={() => showToast("Bộ lọc nâng cao sẽ khả dụng khi kết nối CSDL thực tế.", "info")}>
                <span className="icon">⚙️</span> Bộ lọc
              </button>
            </div>
          </div>

          {/* Grid Layout: Left Column (Cards list) & Right Column (Details) */}
          <div className="as-dashboard-grid">
            
            {/* LEFT COLUMN: LIST CARDS */}
            <div className="as-list-column">
              {filteredRequests.length === 0 ? (
                <div className="empty-state-card">
                  <span className="empty-icon">🍃</span>
                  <h3>Không tìm thấy yêu cầu nào</h3>
                  <p>Tất cả yêu cầu vận chuyển mới đã được điều phối hoặc không khớp với bộ lọc hiện tại.</p>
                  <button className="btn-secondary" onClick={handleResetDemo}>Nạp lại dữ liệu mẫu</button>
                </div>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = req.id === selectedId;
                  return (
                    <div 
                      key={req.id} 
                      className={`as-request-card ${isSelected ? "selected" : ""} ${req.priority === "urgent" ? "border-urgent" : ""}`}
                      onClick={() => setSelectedId(req.id)}
                    >
                      <div className="card-header">
                        <div className="id-tag">
                          <span className="req-id">{req.id}</span>
                          <span className={`priority-badge ${req.priority}`}>
                            {req.priorityLabel}
                          </span>
                        </div>
                        <span className="timestamp">{req.timeAgo}</span>
                      </div>

                      <div className="card-locations">
                        <div className="loc-item">
                          <span className="loc-dot pickup-dot"></span>
                          <div className="loc-info">
                            <span className="loc-label">Lấy hàng</span>
                            <span className="loc-value">{req.pickup.location}</span>
                          </div>
                        </div>

                        <div className="loc-item">
                          <span className="loc-dot delivery-dot"></span>
                          <div className="loc-info">
                            <span className="loc-label">Giao hàng</span>
                            <span className="loc-value">{req.delivery.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="card-footer">
                        <div className="cargo-type">
                          <span className="cargo-icon">📦</span>
                          <span className="cargo-text">{req.itemSummaryText}</span>
                        </div>
                        <span className="distance-badge">{req.distance}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* RIGHT COLUMN: DETAIL VIEW */}
            <div className="as-details-column">
              {selectedRequest ? (
                <div className="as-details-card">
                  
                  {/* Detail Header */}
                  <div className="details-header-block">
                    <div className="title-left">
                      <h2>Chi tiết Yêu cầu</h2>
                      <p className="order-refs">ID: {selectedRequest.id} • Đơn hàng liên kết: {selectedRequest.orderId}</p>
                    </div>
                    <span className={`priority-badge large ${selectedRequest.priority}`}>
                      {selectedRequest.priorityLabel}
                    </span>
                  </div>

                  {/* Visual SVG Map Route Mockup */}
                  <div className="details-map-container">
                    <div className="map-svg-wrapper">
                      <svg width="100%" height="100%" viewBox="0 0 400 160" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1B5E20" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#4CAF50" stopOpacity="0.8" />
                          </linearGradient>
                        </defs>
                        {/* Grid Lines mockup */}
                        <line x1="20" y1="20" x2="380" y2="20" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="4,4" />
                        <line x1="20" y1="60" x2="380" y2="60" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="4,4" />
                        <line x1="20" y1="100" x2="380" y2="100" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="4,4" />
                        <line x1="20" y1="140" x2="380" y2="140" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="4,4" />
                        
                        {/* Curved route line */}
                        <path d="M 60 100 Q 150 40 220 120 T 340 60" fill="none" stroke="url(#routeGrad)" strokeWidth="4" strokeLinecap="round" strokeDasharray="6,4" />
                        
                        {/* Start pin */}
                        <circle cx="60" cy="100" r="10" fill="#1B5E20" opacity="0.2" />
                        <circle cx="60" cy="100" r="5" fill="#1B5E20" />
                        <text x="50" y="85" fill="#1B5E20" fontWeight="bold" fontSize="10">ĐIỂM LẤY KHỞI ĐẦU</text>

                        {/* End pin */}
                        <circle cx="340" cy="60" r="10" fill="#E53935" opacity="0.2" />
                        <circle cx="340" cy="60" r="5" fill="#E53935" />
                        <text x="310" y="45" fill="#E53935" fontWeight="bold" fontSize="10">ĐIỂM GIAO CUỐI</text>
                        
                        {/* Intermediate truck tracker */}
                        <g transform="translate(170, 75)">
                          <rect x="0" y="0" width="22" height="12" rx="2" fill="#2E7D32" />
                          <rect x="18" y="2" width="6" height="8" rx="1" fill="#43A047" />
                          <circle cx="5" cy="13" r="2.5" fill="#333" />
                          <circle cx="17" cy="13" r="2.5" fill="#333" />
                        </g>
                      </svg>
                      
                      <button className="btn-view-route" onClick={() => showToast("Đang kết nối API bản đồ dẫn đường nâng cao...", "success")}>
                        🗺️ Xem Toàn bộ Tuyến đường
                      </button>
                    </div>
                  </div>

                  {/* Information Timeline */}
                  <div className="details-timeline">
                    <div className="timeline-segment">
                      <div className="timeline-node green-node">
                        <span className="node-icon">📍</span>
                      </div>
                      <div className="timeline-info-panel">
                        <span className="block-label">THÔNG TIN LẤY HÀNG</span>
                        <h4 className="location-title">{selectedRequest.pickup.location}</h4>
                        <div className="meta-text-row">
                          <p><strong>Người liên hệ:</strong> {selectedRequest.pickup.contact}</p>
                          <p><strong>Thời gian dự kiến lấy:</strong> {selectedRequest.pickup.time}</p>
                        </div>
                      </div>
                    </div>

                    <div className="timeline-segment">
                      <div className="timeline-node red-node">
                        <span className="node-icon">🏁</span>
                      </div>
                      <div className="timeline-info-panel">
                        <span className="block-label">ĐIỂM ĐẾN GIAO HÀNG</span>
                        <h4 className="location-title">{selectedRequest.delivery.location}</h4>
                        <div className="meta-text-row">
                          <p><strong>Liên hệ nhận hàng:</strong> {selectedRequest.delivery.contact}</p>
                          <p><strong>Hạn chót giao hàng:</strong> {selectedRequest.delivery.time}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cargo Summary Table */}
                  <div className="details-cargo-summary">
                    <h3 className="section-title">Tóm tắt Hàng hóa</h3>
                    <div className="cargo-table-wrapper">
                      <table className="cargo-table">
                        <thead>
                          <tr>
                            <th>Tên mặt hàng / Nông sản</th>
                            <th>Quy cách đóng gói</th>
                            <th>Khối lượng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRequest.cargoSummary.map((cargo, index) => (
                            <tr key={index}>
                              <td className="item-name font-semibold">{cargo.name}</td>
                              <td>{cargo.quantity}</td>
                              <td className="weight-cell">{cargo.weight}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Special Instruction Temp Alert banner */}
                  <div className="details-instruction-alert">
                    <span className="alert-icon">ℹ️</span>
                    <p className="alert-text">{selectedRequest.tempControl}</p>
                  </div>

                  {/* Accept / Reject actions */}
                  <div className="details-action-buttons">
                    <button className="btn-reject" onClick={() => triggerAction("reject", selectedRequest.id)}>
                      Từ chối Yêu cầu
                    </button>
                    <button className="btn-accept" onClick={() => triggerAction("accept", selectedRequest.id)}>
                      ✓ Chấp nhận Vận chuyển
                    </button>
                  </div>

                </div>
              ) : (
                <div className="details-empty-state">
                  <div className="content">
                    <span className="icon">🚚</span>
                    <h3>Chọn một yêu cầu vận chuyển</h3>
                    <p>Nhấp vào thẻ yêu cầu ở cột bên trái để xem thông tin chi tiết, lộ trình giao hàng và xác nhận điều phối vận chuyển.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-box">
            <h3 className="modal-title">{confirmModal.title}</h3>
            <p className="modal-message">{confirmModal.message}</p>
            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setConfirmModal({ isOpen: false, title: "", message: "", actionType: "", requestId: "" })}
              >
                Hủy bỏ
              </button>
              <button 
                className={`btn-confirm ${confirmModal.actionType === "reject" ? "btn-danger" : "btn-success"}`}
                onClick={executeConfirmedAction}
              >
                Xác nhận
              </button>
            </div>
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

export default ShipmentRequests;

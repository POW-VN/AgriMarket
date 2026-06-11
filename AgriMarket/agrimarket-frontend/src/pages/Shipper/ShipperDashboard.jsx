import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import orderService from "../../services/orderService";
import useProfile from "../../hooks/useProfile";
import ProfileLayout from "../../components/profile/ProfileLayout";
import "./ShipperDashboard.css";

// Fallback mock orders database specifically formatted for shippers
const MOCK_SHIPMENT_REQUESTS = [
  {
    id: "REQ-8924",
    orderCode: "FH-2026-1012",
    priority: "Urgent",
    priorityLabel: "Khẩn cấp",
    timeAgo: "10 phút trước",
    pickupName: "Green Valley Farms, Sector 4",
    pickupAddress: "Green Valley Farms, Sector 4, Lâm Đồng",
    deliveryName: "FreshMart Hub, Downtown",
    deliveryAddress: "FreshMart Hub, Quận 1, TP. Hồ Chí Minh",
    cargoType: "2 Pallets (Táo hữu cơ)",
    distance: "15 miles",
    deadline: "15:00 Hôm nay",
    cargoSummary: [
      { name: "Táo hữu cơ giòn", qty: "1 Pallet (400kg)" },
      { name: "Xoài cát Hòa Lộc", qty: "1 Pallet (400kg)" }
    ],
    temperatureRequired: "Yêu cầu xe lạnh (4°C - 6°C). Vui lòng bốc xếp cẩn thận.",
    contact: "Lê Hoàng Nam (+84 918 765 432)",
    status: "pending_accept"
  },
  {
    id: "REQ-8923",
    orderCode: "FH-2026-1013",
    priority: "Normal",
    priorityLabel: "Thường",
    timeAgo: "45 phút trước",
    pickupName: "Sunny Side Orchards",
    pickupAddress: "Sunny Side Orchards, Đơn Dương, Lâm Đồng",
    deliveryName: "City Wholesale Market",
    deliveryAddress: "Chợ đầu mối Bình Điền, Quận 8, TP. Hồ Chí Minh",
    cargoType: "5 Crates (Rau hỗn hợp)",
    distance: "8 miles",
    deadline: "17:00 Hôm nay",
    cargoSummary: [
      { name: "Cà rốt baby giòn ngọt", qty: "3 Crate (150kg)" },
      { name: "Rau cải thìa Eco", qty: "2 Crate (100kg)" }
    ],
    temperatureRequired: "Nhiệt độ thường. Tránh ánh nắng trực tiếp.",
    contact: "Nguyễn Thị Lan (+84 901 234 567)",
    status: "pending_accept"
  },
  {
    id: "REQ-8922",
    orderCode: "FH-2026-1011",
    priority: "Urgent",
    priorityLabel: "Khẩn cấp",
    timeAgo: "1 giờ trước",
    pickupName: "Sông Hồng Farm",
    pickupAddress: "Sông Hồng Farm, Gia Lâm, Hà Nội",
    deliveryName: "BigC Thăng Long",
    deliveryAddress: "222 Trần Duy Hưng, Cầu Giấy, Hà Nội",
    cargoType: "10 Pallets (Gạo tám thơm)",
    distance: "12 miles",
    deadline: "16:00 Hôm nay",
    cargoSummary: [
      { name: "Gạo tám xoan đặc sản", qty: "10 Pallet (4000kg)" }
    ],
    temperatureRequired: "Yêu cầu khô ráo, thoáng mát. Chống ẩm ướt.",
    contact: "Trần Minh Quân (+84 977 111 222)",
    status: "pending_accept"
  }
];

export const ShipperDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState("requests"); // requests, active
  const [orders, setOrders] = useState([]);
  const [requestsList, setRequestsList] = useState(MOCK_SHIPMENT_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState(MOCK_SHIPMENT_REQUESTS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, urgent, sameday
  
  // Active Shipment details state
  const [activeShipment, setActiveShipment] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // Signature pad states
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [mockPhoto, setMockPhoto] = useState(null);
  const [isPODSubmitting, setIsPODSubmitting] = useState(false);

  // Load orders and active shipments
  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem("agrimarket_orders");
      let currentOrders = [];
      if (stored) {
        currentOrders = JSON.parse(stored);
      } else {
        // Fallback or default order initialization
        currentOrders = [
          {
            id: "FH-2026-1012",
            status: "confirmed",
            statusLabel: "Chờ lấy hàng",
            date: "11 thg 06, 2026",
            time: "08:20 SA",
            amount: 1200000,
            recipient: "Nguyễn Thị Trúc",
            address: "99 Lê Văn Sỹ, Quận Phú Nhuận, TP. Hồ Chí Minh",
            phone: "0988 555 666",
            trackingNumber: "AG-99824",
            provider: {
              name: "Green Valley Farms, Sector 4",
              location: "Đơn Dương, Lâm Đồng",
              estYear: 2012,
              avatarText: "GV"
            },
            items: [
              { name: "Táo hữu cơ giòn", farmer: "Green Valley Farms", price: 69000, qty: 10, img: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200" },
              { name: "Xoài cát Hòa Lộc ngon", farmer: "Green Valley Farms", price: 45000, qty: 10, img: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=200" }
            ]
          },
          {
            id: "FH-2026-1013",
            status: "preparing",
            statusLabel: "Đang chuẩn bị",
            date: "11 thg 06, 2026",
            time: "10:15 SA",
            amount: 640000,
            recipient: "Trần Minh Quân",
            address: "88 Cách Mạng Tháng Tám, Quận 10, TP. Hồ Chí Minh",
            phone: "0977 111 222",
            trackingNumber: "AG-99823",
            provider: {
              name: "Sunny Side Orchards",
              location: "Đơn Dương, Lâm Đồng",
              estYear: 2017,
              avatarText: "SS"
            },
            items: [
              { name: "Rau xà lách thủy canh Eco", farmer: "Sunny Side Orchards", price: 30000, qty: 10, img: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=200" },
              { name: "Cà rốt baby giòn ngọt", farmer: "Sunny Side Orchards", price: 30000, qty: 10, img: "https://images.unsplash.com/photo-1598170845058-32b996a67886?w=200" }
            ]
          }
        ];
        localStorage.setItem("agrimarket_orders", JSON.stringify(currentOrders));
      }
      setOrders(currentOrders);

      // Check if there is an order assigned or being shipped
      const shippingOrder = currentOrders.find(o => o.status === "shipping" || o.status === "preparing" || o.status === "confirmed" && o.driverId);
      if (shippingOrder) {
        setActiveShipment(shippingOrder);
      } else {
        // Fallback: pick the first one as active demo
        setActiveShipment(currentOrders[0]);
      }
    };
    loadData();
  }, [activeTab]);

  // Handle Request Selection
  const handleRequestClick = (req) => {
    setSelectedRequest(req);
  };

  // Accept a shipping request job
  const handleAcceptRequest = (req) => {
    // Modify status of matched order in orders list
    const updatedOrders = orders.map(o => {
      if (o.id === req.orderCode) {
        return {
          ...o,
          status: "confirmed", // Chờ lấy hàng
          statusLabel: "Chờ lấy hàng",
          driverId: "D-4092",
          driverName: "Marcus Johnson",
          driverPhone: "+84 909 333 444",
          driverPlate: "XYZ-789",
          trackingNumber: req.id.replace("REQ", "AG"),
          assignedAt: new Date().toISOString()
        };
      }
      return o;
    });

    localStorage.setItem("agrimarket_orders", JSON.stringify(updatedOrders));
    setOrders(updatedOrders);

    // Update requests list to show accepted
    setRequestsList(prev => prev.filter(r => r.id !== req.id));

    // Show Toast Success
    showToast(`Đã chấp nhận đơn hàng ${req.id} thành công!`);
    
    // Switch to active deliveries tab
    const acceptedOrder = updatedOrders.find(o => o.id === req.orderCode);
    setActiveShipment(acceptedOrder);
    setActiveTab("active");
  };

  // Reject shipment request job
  const handleRejectRequest = (reqId) => {
    setRequestsList(prev => prev.filter(r => r.id !== reqId));
    if (selectedRequest && selectedRequest.id === reqId) {
      const remaining = requestsList.filter(r => r.id !== reqId);
      setSelectedRequest(remaining[0] || null);
    }
    showToast("Đã từ chối yêu cầu vận chuyển.");
  };

  // Update shipment status transition
  const handleUpdateStatus = (newStatus) => {
    if (!activeShipment) return;

    let statusLabel = "";
    if (newStatus === "confirmed") statusLabel = "Chờ lấy hàng";
    else if (newStatus === "preparing") statusLabel = "Đang chuẩn bị";
    else if (newStatus === "shipping") statusLabel = "Đang giao hàng";
    else if (newStatus === "delivered") statusLabel = "Đã giao";

    const updatedOrders = orders.map(o => {
      if (o.id === activeShipment.id) {
        const history = o.statusHistory || [];
        history.push({
          status: newStatus,
          label: statusLabel,
          time: new Date().toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) + " - " + new Date().toLocaleDateString("vi-VN")
        });

        return {
          ...o,
          status: newStatus,
          statusLabel,
          statusHistory: history
        };
      }
      return o;
    });

    localStorage.setItem("agrimarket_orders", JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    
    const updatedShipment = updatedOrders.find(o => o.id === activeShipment.id);
    setActiveShipment(updatedShipment);
    setShowStatusModal(false);
    showToast(`Đã chuyển trạng thái sang: ${statusLabel}`);
  };

  // Drawing pad drawing triggers
  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Support touch and mouse
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#012d1d";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const coords = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const coords = getCanvasCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setSignatureSaved(true);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureSaved(false);
  };

  // Handle mock photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMockPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      // Setup a nice high fidelity default image as mock delivery dropoff
      setMockPhoto("https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400");
    }
  };

  // Complete shipment with proof of delivery (POD)
  const handleSubmitPOD = () => {
    if (!signatureSaved) {
      alert("Vui lòng ký xác nhận nhận hàng!");
      return;
    }

    setIsPODSubmitting(true);
    
    // Extract signature as dataURL
    const canvas = canvasRef.current;
    const signatureDataUrl = canvas ? canvas.toDataURL() : "";

    setTimeout(() => {
      const updatedOrders = orders.map(o => {
        if (o.id === activeShipment.id) {
          const history = o.statusHistory || [];
          history.push({
            status: "delivered",
            label: "Đã giao hàng thành công",
            time: new Date().toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) + " - " + new Date().toLocaleDateString("vi-VN")
          });

          return {
            ...o,
            status: "delivered",
            statusLabel: "Đã giao",
            statusHistory: history,
            podSignature: signatureDataUrl,
            podPhoto: mockPhoto || "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400",
            deliveredAt: new Date().toISOString()
          };
        }
        return o;
      });

      localStorage.setItem("agrimarket_orders", JSON.stringify(updatedOrders));
      setOrders(updatedOrders);

      const updatedShipment = updatedOrders.find(o => o.id === activeShipment.id);
      setActiveShipment(updatedShipment);
      setIsPODSubmitting(false);
      showToast("Đã hoàn thành giao hàng & lưu bằng chứng thành công!");
    }, 1200);
  };

  // Toast triggers
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Filtering requests list based on search/type
  const filteredRequests = requestsList.filter(req => {
    const matchesSearch = req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.pickupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.deliveryName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === "urgent") {
      return matchesSearch && req.priority === "Urgent";
    }
    if (filterType === "sameday") {
      return matchesSearch && req.deadline.includes("Hôm nay");
    }
    return matchesSearch;
  });

  return (
    <ProfileLayout profile={profile || { role: "partner", fullName: "Marcus Johnson (Shipper)" }}>
      <div className="shipper-dashboard-container">
        
        {/* Navigation Tab Bar */}
        <div className="shipper-header-tabs">
          <div className="shipper-title-group">
            <h1 className="shipper-main-title">Kênh Vận Chuyển</h1>
            <p className="shipper-sub-title">Cổng thông tin dành cho Tài xế đối tác AgriSteward</p>
          </div>
          <div className="shipper-tabs-switch">
            <button 
              className={`shipper-tab-btn ${activeTab === "requests" ? "active" : ""}`}
              onClick={() => setActiveTab("requests")}
            >
              Yêu cầu giao hàng ({requestsList.length})
            </button>
            <button 
              className={`shipper-tab-btn ${activeTab === "active" ? "active" : ""}`}
              onClick={() => setActiveTab("active")}
            >
              Chuyến đi đang chạy
            </button>
          </div>
        </div>

        {/* ── TAB 1: SHIPMENT REQUESTS ── */}
        {activeTab === "requests" && (
          <div className="shipper-requests-layout">
            
            {/* Left requests list */}
            <div className="shipper-req-list-panel">
              {/* Statistic cards */}
              <div className="shipper-stat-cards">
                <div className="shipper-stat-card">
                  <span className="stat-label">Yêu Cầu Mới</span>
                  <div className="stat-value-row">
                    <span className="stat-val">24</span>
                    <span className="stat-trend">+5</span>
                  </div>
                </div>
                <div className="shipper-stat-card">
                  <span className="stat-label">Đã Nhận (Hôm nay)</span>
                  <div className="stat-value-row">
                    <span className="stat-val">18</span>
                    <span className="stat-trend green">↗</span>
                  </div>
                </div>
                <div className="shipper-stat-card urgent">
                  <span className="stat-label">Cần Chú Ý</span>
                  <div className="stat-value-row">
                    <span className="stat-val">3</span>
                    <span className="stat-trend-tag">Gấp</span>
                  </div>
                </div>
              </div>

              {/* Search and Quick Filters */}
              <div className="shipper-filter-toolbar">
                <div className="shipper-search-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Tìm theo ID, Điểm lấy, Điểm giao..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="shipper-quick-filters">
                  <button className={`filter-tag ${filterType === "all" ? "active" : ""}`} onClick={() => setFilterType("all")}>Tất cả</button>
                  <button className={`filter-tag ${filterType === "urgent" ? "active" : ""}`} onClick={() => setFilterType("urgent")}>Khẩn cấp</button>
                  <button className={`filter-tag ${filterType === "sameday" ? "active" : ""}`} onClick={() => setFilterType("sameday")}>Trong ngày</button>
                </div>
              </div>

              {/* List Cards */}
              <div className="shipper-job-cards-list">
                {filteredRequests.length === 0 ? (
                  <div className="shipper-empty-state">
                    <div className="empty-icon">📦</div>
                    <h4>Không tìm thấy yêu cầu giao hàng nào</h4>
                    <p>Hãy điều chỉnh bộ lọc hoặc đợi yêu cầu mới xuất hiện.</p>
                  </div>
                ) : (
                  filteredRequests.map(req => (
                    <div 
                      key={req.id} 
                      className={`shipper-job-card ${selectedRequest?.id === req.id ? "selected" : ""} ${req.priority === "Urgent" ? "urgent-border" : ""}`}
                      onClick={() => handleRequestClick(req)}
                    >
                      <div className="job-card-header">
                        <span className="job-code">{req.id}</span>
                        <span className={`priority-badge ${req.priority.toLowerCase()}`}>{req.priorityLabel}</span>
                        <span className="job-time-ago">{req.timeAgo}</span>
                      </div>
                      <div className="job-card-route">
                        <div className="route-point pickup">
                          <span className="point-icon">●</span>
                          <div className="point-info">
                            <span className="point-lbl">Lấy hàng:</span>
                            <span className="point-name">{req.pickupName}</span>
                          </div>
                        </div>
                        <div className="route-connector"></div>
                        <div className="route-point delivery">
                          <span className="point-icon">■</span>
                          <div className="point-info">
                            <span className="point-lbl">Giao hàng:</span>
                            <span className="point-name">{req.deliveryName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="job-card-footer">
                        <span className="job-cargo-type">📦 {req.cargoType}</span>
                        <span className="job-distance">📍 {req.distance}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right request detail panel */}
            <div className="shipper-req-details-panel">
              {selectedRequest ? (
                <div className="shipper-detail-card">
                  <div className="detail-header">
                    <div>
                      <h2 className="detail-title">Yêu cầu chi tiết</h2>
                      <p className="detail-subtitle">ID Yêu cầu: {selectedRequest.id} &nbsp;•&nbsp; Mã Đơn: {selectedRequest.orderCode}</p>
                    </div>
                    <span className={`priority-pill ${selectedRequest.priority.toLowerCase()}`}>{selectedRequest.priorityLabel}</span>
                  </div>


                  {/* Details Body */}
                  <div className="detail-info-sections">
                    <div className="info-block-row">
                      <div className="detail-info-item">
                        <span className="info-label">Điểm Lấy Hàng (Pickup)</span>
                        <p className="info-value bold">{selectedRequest.pickupName}</p>
                        <p className="info-sub-value">{selectedRequest.pickupAddress}</p>
                        <p className="info-contact">Liên hệ: {selectedRequest.contact}</p>
                      </div>
                    </div>
                    
                    <div className="info-block-row">
                      <div className="detail-info-item">
                        <span className="info-label">Điểm Giao Hàng (Destination)</span>
                        <p className="info-value bold">{selectedRequest.deliveryName}</p>
                        <p className="info-sub-value">{selectedRequest.deliveryAddress}</p>
                        <p className="info-sub-value">Thời hạn giao: <strong style={{color: '#d97706'}}>{selectedRequest.deadline}</strong></p>
                      </div>
                    </div>

                    <div className="info-block-row split">
                      <div className="detail-info-item">
                        <span className="info-label">Tóm tắt hàng hóa</span>
                        <div className="cargo-summary-list">
                          {selectedRequest.cargoSummary.map((c, i) => (
                            <div key={i} className="cargo-item">
                              <span>🍎 {c.name}</span>
                              <strong className="cargo-qty">{c.qty}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="detail-info-item">
                        <span className="info-label">Yêu cầu phương tiện</span>
                        <div className="temp-alert-box">
                          <span className="temp-alert-icon">❄️</span>
                          <span className="temp-alert-text">{selectedRequest.temperatureRequired}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="detail-actions">
                    <button className="btn-reject-job" onClick={() => handleRejectRequest(selectedRequest.id)}>Từ Chối</button>
                    <button className="btn-accept-job" onClick={() => handleAcceptRequest(selectedRequest)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" style={{ marginRight: '6px' }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Chấp Nhận Vận Chuyển
                    </button>
                  </div>
                </div>
              ) : (
                <div className="shipper-detail-placeholder">
                  <div className="ph-icon">📋</div>
                  <h3>Chọn một yêu cầu</h3>
                  <p>Nhấp vào bất kỳ yêu cầu giao hàng nào ở danh sách bên trái để xem thông tin chi tiết.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: ACTIVE DELIVERIES ── */}
        {activeTab === "active" && (
          <div className="active-shipment-layout">
            {activeShipment ? (
              <div className="active-tracking-content">
                
                {/* Status top bar */}
                <div className="active-status-bar-card">
                  <div className="status-bar-left">
                    <span className="shipment-id">Mã vận đơn: #{activeShipment.trackingNumber || "AG-99824"}</span>
                    <span className={`status-pill status-${activeShipment.status}`}>
                      {activeShipment.statusLabel || "Đang xử lý"}
                    </span>
                  </div>
                  <div className="status-bar-right">
                    <button className="btn-action-outline">In Bảng Kê Hàng Hóa</button>
                    {activeShipment.status !== "delivered" && (
                      <button className="btn-action-solid" onClick={() => setShowStatusModal(true)}>Cập Nhật Trạng Thái</button>
                    )}
                  </div>
                </div>

                <div className="active-grid-columns">
                  
                  {/* Left tracker main column */}
                  <div className="active-main-col">
                    


                    {/* Proof of Delivery (POD) Section */}
                    <div className="active-pod-card">
                      <h3 className="pod-card-title">Xác thực bằng chứng giao hàng (Proof of Delivery)</h3>
                      {activeShipment.status === "delivered" ? (
                        <div className="pod-completed-view">
                          <div className="pod-success-badge">✅ Đã hoàn thành xác thực POD</div>
                          <div className="pod-saved-images">
                            <div className="pod-saved-img-box">
                              <span className="img-title">Chữ ký người nhận</span>
                              <div className="signature-display-box">
                                {activeShipment.podSignature ? (
                                  <img src={activeShipment.podSignature} alt="Chữ ký người nhận" />
                                ) : (
                                  <div className="mock-signature-placeholder"><i>Đã ký tay trực tiếp</i></div>
                                )}
                              </div>
                            </div>
                            <div className="pod-saved-img-box">
                              <span className="img-title">Ảnh chụp drop-off</span>
                              <img className="pod-photo-display" src={activeShipment.podPhoto || "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400"} alt="Ảnh chụp giao hàng" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="pod-interactive-form">
                          <p className="pod-desc">Vui lòng lấy chữ ký số của người nhận hàng và chụp ảnh xác thực vị trí hạ hàng để hoàn tất đơn hàng.</p>
                          
                          <div className="pod-inputs-row">
                            {/* Signature Canvas */}
                            <div className="signature-pad-container">
                              <span className="input-title">Ký xác nhận tại đây:</span>
                              <div className="canvas-wrapper">
                                <canvas 
                                  ref={canvasRef}
                                  width={300}
                                  height={150}
                                  onMouseDown={startDrawing}
                                  onMouseMove={draw}
                                  onMouseUp={stopDrawing}
                                  onMouseLeave={stopDrawing}
                                  onTouchStart={startDrawing}
                                  onTouchMove={draw}
                                  onTouchEnd={stopDrawing}
                                />
                              </div>
                              <div className="canvas-actions">
                                <button className="btn-clear-canvas" onClick={clearSignature}>Xóa chữ ký</button>
                                {signatureSaved && <span className="sig-saved-lbl">✓ Đã ghi nhận chữ ký</span>}
                              </div>
                            </div>

                            {/* Drop-off Photo */}
                            <div className="photo-upload-container">
                              <span className="input-title">Ảnh chụp hạ hàng (Drop-off Photo):</span>
                              <div className="photo-preview-box">
                                {mockPhoto ? (
                                  <img src={mockPhoto} alt="Bằng chứng giao hàng" className="preview-image" />
                                ) : (
                                  <div className="upload-placeholder">
                                    <span className="upload-icon">📷</span>
                                    <span>Chưa chọn hình ảnh</span>
                                  </div>
                                )}
                              </div>
                              <div className="file-input-wrapper">
                                <input 
                                  type="file" 
                                  id="pod-photo-file" 
                                  accept="image/*" 
                                  onChange={handlePhotoUpload}
                                  style={{ display: 'none' }}
                                />
                                <label htmlFor="pod-photo-file" className="btn-upload-file">
                                  Chọn ảnh giao hàng
                                </label>
                                {!mockPhoto && (
                                  <button className="btn-mock-photo" onClick={() => setMockPhoto("https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400")}>
                                    Dùng ảnh mẫu
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <button 
                            className="btn-complete-shipment" 
                            disabled={!signatureSaved || isPODSubmitting}
                            onClick={handleSubmitPOD}
                          >
                            {isPODSubmitting ? "Đang xử lý hoàn tất..." : "Xác nhận & Hoàn thành đơn hàng"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side information column */}
                  <div className="active-side-col">
                    
                    {/* Routing history timeline */}
                    <div className="active-tracker-card tracking-history-box">
                      <h3 className="card-sec-title">Lịch trình vận chuyển</h3>
                      <div className="active-timeline">
                        <div className={`timeline-node ${activeShipment.status !== "pending" ? "completed" : "active"}`}>
                          <div className="node-circle">✓</div>
                          <div className="node-info">
                            <span className="node-title bold">Nhận đơn giao</span>
                            <span className="node-time">{activeShipment.assignedAt ? new Date(activeShipment.assignedAt).toLocaleTimeString("vi-VN") : "08:30 SA"}</span>
                          </div>
                        </div>
                        
                        <div className={`timeline-node ${activeShipment.status === "shipping" || activeShipment.status === "delivered" ? "completed" : activeShipment.status === "confirmed" ? "active" : ""}`}>
                          <div className="node-circle">📦</div>
                          <div className="node-info">
                            <span className="node-title bold">Đã lấy hàng tại Farm</span>
                            <span className="node-desc">Nhà vườn: {activeShipment.provider?.name}</span>
                            <span className="node-time">09:15 SA</span>
                          </div>
                        </div>

                        <div className={`timeline-node ${activeShipment.status === "shipping" ? "active" : activeShipment.status === "delivered" ? "completed" : ""}`}>
                          <div className="node-circle">🚚</div>
                          <div className="node-info">
                            <span className="node-title bold">Đang vận chuyển</span>
                            <span className="node-desc">Đang trên đường đến quận Phú Nhuận</span>
                            <span className="node-time">{activeShipment.status === "shipping" || activeShipment.status === "delivered" ? "10:30 SA" : "Chờ lấy hàng"}</span>
                          </div>
                        </div>

                        <div className={`timeline-node ${activeShipment.status === "delivered" ? "completed" : ""}`}>
                          <div className="node-circle">🏠</div>
                          <div className="node-info">
                            <span className="node-title bold">Đã giao hàng thành công</span>
                            <span className="node-desc">Địa chỉ cửa hàng: {activeShipment.address}</span>
                            <span className="node-time">{activeShipment.status === "delivered" ? "11:45 SA" : "Dự kiến 14:30"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cargo manifest card */}
                    <div className="active-tracker-card manifest-box">
                      <h3 className="card-sec-title">Danh mục hàng hóa (Manifest)</h3>
                      <div className="manifest-items-list">
                        {activeShipment.items && activeShipment.items.map((item, index) => (
                          <div key={index} className="manifest-item-row">
                            <img src={item.img} alt={item.name} className="manifest-item-img" />
                            <div className="manifest-item-info">
                              <span className="item-name bold">{item.name}</span>
                              <span className="item-farmer">Farm: {item.farmer}</span>
                              <span className="item-qty">Số lượng: {item.qty} đơn vị</span>
                            </div>
                            <span className="item-badge cold">Lạnh</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Store destination contact details */}
                    <div className="active-tracker-card destination-box">
                      <h3 className="card-sec-title">Địa điểm giao nhận</h3>
                      <div className="dest-contact-row">
                        <span className="dest-lbl">Người nhận:</span>
                        <strong className="dest-val">{activeShipment.recipient}</strong>
                      </div>
                      <div className="dest-contact-row">
                        <span className="dest-lbl">Số điện thoại:</span>
                        <strong className="dest-val">{activeShipment.phone}</strong>
                      </div>
                      <div className="dest-contact-row">
                        <span className="dest-lbl">Địa chỉ:</span>
                        <p className="dest-val-desc">{activeShipment.address}</p>
                      </div>
                      <div className="dest-actions-row">
                        <a href={`tel:${activeShipment.phone}`} className="dest-btn call">📞 Gọi điện</a>
                        <a href={`sms:${activeShipment.phone}`} className="dest-btn message">💬 Nhắn tin</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="shipper-empty-state active-tab">
                <div className="empty-icon">🚚</div>
                <h4>Bạn chưa có chuyến giao hàng nào đang hoạt động</h4>
                <p>Hãy chuyển sang tab <strong>Yêu cầu giao hàng</strong> để tìm kiếm và chấp nhận đơn hàng.</p>
              </div>
            )}
          </div>
        )}

        {/* Status Transition Modal */}
        {showStatusModal && (
          <div className="shipper-modal-overlay">
            <div className="shipper-modal-box">
              <h3 className="modal-title">Cập nhật trạng thái giao hàng</h3>
              <p className="modal-desc">Chọn trạng thái thực tế của chuyến giao hàng #{activeShipment.trackingNumber}:</p>
              
              <div className="status-options-list">
                <button 
                  className={`status-opt-btn confirmed ${activeShipment.status === "confirmed" ? "active" : ""}`}
                  onClick={() => handleUpdateStatus("confirmed")}
                >
                  📍 Chờ lấy hàng tại Farm
                </button>
                <button 
                  className={`status-opt-btn preparing ${activeShipment.status === "preparing" ? "active" : ""}`}
                  onClick={() => handleUpdateStatus("preparing")}
                >
                  📦 Đang đóng gói / Bốc xếp lên xe
                </button>
                <button 
                  className={`status-opt-btn shipping ${activeShipment.status === "shipping" ? "active" : ""}`}
                  onClick={() => handleUpdateStatus("shipping")}
                >
                  🚚 Đang vận chuyển (In Transit)
                </button>
              </div>

              <div className="modal-footer">
                <button className="btn-close-modal" onClick={() => setShowStatusModal(false)}>Hủy bỏ</button>
              </div>
            </div>
          </div>
        )}

        {/* Global Toast Message */}
        {toastMessage && (
          <div className="shipper-toast">
            <span className="toast-icon">✓</span>
            <span className="toast-text">{toastMessage}</span>
          </div>
        )}

      </div>
    </ProfileLayout>
  );
};

export default ShipperDashboard;

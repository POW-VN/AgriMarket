import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import "./CustomerOrderDetail.css";

// Import local images from Home assets
import bunchedCarrots from "../Home/assets/bunched_carrots.png";
import heirloomTomatoes from "../Home/assets/heirloom_tomatoes.png";
import honeycrispApples from "../Home/assets/honeycrisp_apples.png";

// Mock orders list to load detailed item information
const ORDERS_DB = {
  "FH-2024-8892": {
    id: "FH-2024-8892",
    status: "delivered",
    statusLabel: "Đã giao",
    date: "12 thg 10, 2024",
    time: "10:24 SA",
    subtotal: 3505500,
    shippingFee: 57000,
    serviceFee: 31250,
    discount: 31250,
    amount: 3562500,
    recipient: "Nguyễn Thị Lan",
    address: "123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
    phone: "0901 234 567",
    trackingNumber: "FH-TRACK-889212",
    cardEnding: "4492",
    provider: {
      name: "Nông trại hữu cơ Thung lũng Xanh",
      location: "Đơn Dương, Lâm Đồng",
      estYear: 2012,
      avatarText: "TX",
      avatarBg: "#1b5e20",
    },
    items: [
      { name: "Cà rốt hữu cơ Thung lũng Xanh", farmer: "Nông trại Thung lũng Xanh", price: 112500, qty: 10, img: bunchedCarrots },
      { name: "Cà chua Heirloom hữu cơ", farmer: "Nông trại Thung lũng Xanh", price: 49900, qty: 15, img: heirloomTomatoes },
      { name: "Táo giòn ngọt Honeycrisp", farmer: "Nông trại Thung lũng Xanh", price: 69000, qty: 8, img: honeycrispApples },
      { name: "Rau cải thìa Eco", farmer: "Nông trại Thung lũng Xanh", price: 45000, qty: 10, img: bunchedCarrots },
      { name: "Dâu tây sạch loại A", farmer: "Nông trại Thung lũng Xanh", price: 150000, qty: 3, img: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200" },
      { name: "Mật ong nguyên chất", farmer: "Nông trại Thung lũng Xanh", price: 180000, qty: 1, img: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200" }
    ]
  },
  "FH-2024-9104": {
    id: "FH-2024-9104",
    status: "shipping",
    statusLabel: "Đang vận chuyển",
    date: "14 thg 10, 2024",
    time: "03:15 CH",
    subtotal: 2100000,
    shippingFee: 50000,
    serviceFee: 25000,
    discount: 25000,
    amount: 2150000,
    recipient: "Lê Hoàng Nam",
    address: "456 Trần Hưng Đạo, Phường Nguyễn Cư Trinh, Quận 1, TP. Hồ Chí Minh",
    phone: "0918 765 432",
    trackingNumber: "FH-TRACK-910488",
    cardEnding: "8102",
    provider: {
      name: "Nhà máy bơ sữa thủ công Hillside",
      location: "Ba Vì, Hà Nội",
      estYear: 2015,
      avatarText: "HS",
      avatarBg: "#0d47a1",
    },
    items: [
      { name: "Sữa tươi hữu cơ nguyên chất", farmer: "Hillside Dairy", price: 85000, qty: 10, img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200" },
      { name: "Bơ béo thủ công Hillside", farmer: "Hillside Dairy", price: 250000, qty: 5, img: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200" }
    ]
  },
  "FH-2024-7721": {
    id: "FH-2024-7721",
    status: "cancelled",
    statusLabel: "Đã hủy",
    date: "05 thg 10, 2024",
    time: "09:12 SA",
    subtotal: 1052000,
    shippingFee: 75500,
    serviceFee: 15000,
    discount: 15000,
    amount: 1127500,
    recipient: "Phạm Minh Thư",
    address: "789 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh",
    phone: "0934 987 654",
    trackingNumber: "FH-TRACK-772154",
    cardEnding: "9904",
    provider: {
      name: "Hợp tác xã Vườn Nắng",
      location: "Cái Bè, Tiền Giang",
      estYear: 2018,
      avatarText: "VN",
      avatarBg: "#e65100",
    },
    items: [
      { name: "Táo giòn ngọt Honeycrisp", farmer: "Vườn Nắng", price: 69000, qty: 10, img: honeycrispApples },
      { name: "Cà chua Heirloom đỏ mọng", farmer: "Vườn Nắng", price: 49900, qty: 5, img: heirloomTomatoes },
      { name: "Cà rốt giống Nhật", farmer: "Vườn Nắng", price: 112500, qty: 1, img: bunchedCarrots }
    ]
  },
  "FH-2026-1011": {
    id: "FH-2026-1011",
    status: "pending",
    statusLabel: "Chờ xử lý",
    date: "06 thg 06, 2026",
    time: "16:30 CH",
    subtotal: 215000,
    shippingFee: 35000,
    serviceFee: 10000,
    discount: 10000,
    amount: 250000,
    recipient: "Hoàng Văn Bình",
    address: "12 Nguyễn Thị Minh Khai, Quận 3, TP. Hồ Chí Minh",
    phone: "0909 333 444",
    trackingNumber: "FH-TRACK-101101",
    cardEnding: "2201",
    provider: {
      name: "Nông trại hữu cơ Sông Hồng",
      location: "Gia Lâm, Hà Nội",
      estYear: 2020,
      avatarText: "SH",
      avatarBg: "#004d40",
    },
    items: [
      { name: "Gạo tám xoan đặc sản", farmer: "Sông Hồng Farm", price: 215000, qty: 1, img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200" }
    ]
  },
  "FH-2026-1012": {
    id: "FH-2026-1012",
    status: "confirmed",
    statusLabel: "Đã xác nhận",
    date: "05 thg 06, 2026",
    time: "08:20 SA",
    subtotal: 1150000,
    shippingFee: 50000,
    serviceFee: 20000,
    discount: 20000,
    amount: 1200000,
    recipient: "Nguyễn Thị Trúc",
    address: "99 Lê Văn Sỹ, Quận Phú Nhuận, TP. Hồ Chí Minh",
    phone: "0988 555 666",
    trackingNumber: "FH-TRACK-101202",
    cardEnding: "1554",
    provider: {
      name: "Vườn Cây Trái Miền Tây",
      location: "Chợ Lách, Bến Tre",
      estYear: 2010,
      avatarText: "MT",
      avatarBg: "#3e2723",
    },
    items: [
      { name: "Giống xoài cát Hòa Lộc ngon", farmer: "Vườn Miền Tây", price: 45000, qty: 10, img: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=200" },
      { name: "Táo hữu cơ giòn", farmer: "Vườn Miền Tây", price: 69000, qty: 10, img: honeycrispApples }
    ]
  },
  "FH-2026-1013": {
    id: "FH-2026-1013",
    status: "preparing",
    statusLabel: "Đang chuẩn bị",
    date: "04 thg 06, 2026",
    time: "14:15 CH",
    subtotal: 600000,
    shippingFee: 40000,
    serviceFee: 15000,
    discount: 15000,
    amount: 640000,
    recipient: "Trần Minh Quân",
    address: "88 Cách Mạng Tháng Tám, Quận 10, TP. Hồ Chí Minh",
    phone: "0977 111 222",
    trackingNumber: "FH-TRACK-101303",
    cardEnding: "4771",
    provider: {
      name: "Đà Lạt Eco Farm",
      location: "Lạc Dương, Lâm Đồng",
      estYear: 2017,
      avatarText: "DL",
      avatarBg: "#33691e",
    },
    items: [
      { name: "Rau xà lách thủy canh Eco", farmer: "Đà Lạt Eco", price: 30000, qty: 10, img: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200" },
      { name: "Cà rốt baby giòn ngọt", farmer: "Đà Lạt Eco", price: 30000, qty: 10, img: bunchedCarrots }
    ]
  }
};

export const CustomerOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [order, setOrder] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedReason, setSelectedReason] = useState("Thay đổi ý định mua hàng");
  const [customReason, setCustomReason] = useState("");

  useEffect(() => {
    // Check login
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Get order from DB
    const fetchedOrder = ORDERS_DB[id];
    if (fetchedOrder) {
      setOrder(fetchedOrder);
    }
  }, [id]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate("/");
  };

  const handleCancelOrder = () => {
    const finalReason = selectedReason === "Lý do khác" ? customReason.trim() : selectedReason;
    if (selectedReason === "Lý do khác" && !customReason.trim()) {
      alert("Vui lòng nhập lý do hủy đơn hàng của bạn.");
      return;
    }

    setOrder(prev => ({
      ...prev,
      status: "cancelled",
      statusLabel: "Đã hủy",
      cancelReason: finalReason || "Không có lý do cụ thể"
    }));
    setShowCancelModal(false);
    setToastMessage("Hủy đơn hàng thành công!");
    setTimeout(() => setToastMessage(""), 3000);
  };

  if (!order) {
    return (
      <div className="order-detail-loading">
        <h3>Đang tải thông tin chi tiết đơn hàng...</h3>
        <p>Nếu quá lâu, hãy quay lại <Link to="/profile/orders">lịch sử đơn hàng</Link>.</p>
      </div>
    );
  }

  const formatVND = (value) => {
    return value.toLocaleString("vi-VN") + " ₫";
  };

  // Timeline points definition
  const TIMELINE_STEPS = [
    { key: "placed", label: "Đã đặt hàng", icon: "✓" },
    { key: "confirmed", label: "Đã xác nhận", icon: "✓" },
    { key: "preparing", label: "Đang chuẩn bị", icon: "✓" },
    { key: "shipping", label: "Đang giao", icon: "🚚" },
    { key: "delivered", label: "Đã giao", icon: "🏠" }
  ];

  // Get active step index based on order status
  const getActiveStepIndex = (status) => {
    if (status === "pending") return 0;
    if (status === "confirmed") return 1;
    if (status === "preparing") return 2;
    if (status === "shipping") return 3;
    if (status === "delivered") return 4;
    return -1; // For cancelled or other
  };

  const activeIndex = getActiveStepIndex(order.status);

  return (
    <div className="orderdetail-page">
      {/* Custom Toast Alert */}
      {toastMessage && (
        <div className="toast-notification">
          <span className="toast-icon">✅</span>
          <span className="toast-text">{toastMessage}</span>
        </div>
      )}

      {/* ── HEADER ── */}
      <header className="home-header">
        <div className="header-container">
          <div className="header-logo" onClick={() => navigate("/")}>
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
            <span className="logo-text">AgriMarket</span>
          </div>

          <nav className="header-nav">
            <Link to="/" className="nav-link">Trang chủ</Link>
            <Link to="/products" className="nav-link">Cửa hàng</Link>
            <Link to="/farms" className="nav-link">Nông trại</Link>
            <Link to="/about" className="nav-link">Giới thiệu</Link>
          </nav>

          <div className="header-actions">
            {/* Search Icon */}
            <button className="icon-btn" aria-label="Tìm kiếm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            {/* Cart Icon */}
            {(!user || user.role !== "farmer") && (
              <button className="icon-btn" aria-label="Giỏ hàng">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span className="cart-badge">0</span>
              </button>
            )}

            {/* Profile Dropdown */}
            {user ? (
              <div className="auth-profile-container" style={{ position: "relative" }}>
                <div 
                  className="profile-indicator" 
                  onClick={() => setShowProfileDropdown(v => !v)}
                  title="Tùy chọn tài khoản"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="avatar-img" />
                  ) : (
                    <div className="avatar-fallback">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="profile-name">{user.fullName}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12" style={{ marginLeft: "4px" }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>

                {showProfileDropdown && (
                  <div className="header-dropdown-menu">
                    <button onClick={() => { navigate("/profile"); setShowProfileDropdown(false); }}>Hồ sơ của tôi</button>
                    <button onClick={() => { navigate("/profile/orders"); setShowProfileDropdown(false); }}>Lịch sử đơn hàng</button>
                    <button onClick={() => { navigate("/security"); setShowProfileDropdown(false); }}>Bảo mật</button>
                    <hr />
                    <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
                  </div>
                )}
              </div>
            ) : (
              <button className="btn-auth btn-login" onClick={() => navigate("/login")}>
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── BREADCRUMBS & TOP BAR ── */}
      <div className="order-detail-container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="breadcrumb-separator">›</span>
          <Link to="/profile/orders">Đơn hàng của tôi</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Chi tiết đơn hàng</span>
        </nav>

        <div className="detail-header-row">
          <div className="header-left-col">
            <h1 className="detail-page-title">Chi tiết đơn hàng</h1>
            <div className="order-meta-info">
              <span className="order-id-txt">ĐƠN HÀNG #{order.id}</span>
              <span className="bullet-sep">•</span>
              <span className="order-time-txt">Đặt ngày {order.date} lúc {order.time}</span>
              <span className="bullet-sep">•</span>
              <span className={`status-badge status-${order.status}`}>
                {order.statusLabel}
              </span>
            </div>
          </div>
          <div className="header-right-col">
            <button className="btn-outline btn-invoice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ marginRight: "6px" }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Tải hóa đơn
            </button>
            {order.status === "delivered" && (
              <button className="btn-solid">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ marginRight: "6px" }}>
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.73-.73" />
                </svg>
                Mua lại
              </button>
            )}
          </div>
        </div>

        {/* ── TIMELINE TRACKER ── */}
        {order.status !== "cancelled" ? (
          <div className="tracker-card">
            <div className="timeline-container">
              {TIMELINE_STEPS.map((step, idx) => {
                const isCompleted = idx <= activeIndex;
                const isCurrent = idx === activeIndex;

                return (
                  <div 
                    key={step.key} 
                    className={`timeline-step ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}
                  >
                    <div className="step-circle-wrapper">
                      <div className="step-circle">
                        {isCompleted && step.key !== "shipping" && step.key !== "delivered" ? "✓" : step.icon}
                      </div>
                      {idx < TIMELINE_STEPS.length - 1 && (
                        <div className={`step-line-connector ${idx < activeIndex ? "active" : ""}`} />
                      )}
                    </div>
                    <div className="step-labels">
                      <span className="step-name">{step.label}</span>
                      {isCompleted && (
                        <span className="step-date">
                          {idx === 0 && order.date}
                          {idx === 1 && order.date}
                          {idx === 2 && "Đã xong"}
                          {idx === 3 && "Đang đi"}
                          {idx === 4 && "Đã nhận"}
                        </span>
                      )}
                      {!isCompleted && idx === 4 && (
                        <span className="step-date estimated">Dự kiến 2 ngày</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="tracker-card cancelled-tracker">
            <div className="cancelled-banner">
              <div className="cancelled-icon">⚠️</div>
              <div className="cancelled-text">
                <h3>Đơn hàng đã bị hủy</h3>
                <p>Đơn hàng này không còn được xử lý. Bạn có thể liên hệ bộ phận hỗ trợ khách hàng nếu có thắc mắc.</p>
                {order.cancelReason && (
                  <p className="cancel-reason-line">
                    <strong>Lý do hủy:</strong> "{order.cancelReason}"
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── MAIN GRID (2 COLUMNS) ── */}
        <div className="detail-layout-grid">
          {/* LEFT COLUMN */}
          <div className="main-content-column">
            {/* Order Items Card */}
            <div className="items-card">
              <h2 className="card-section-title">Sản phẩm đã mua ({order.items.length})</h2>
              <div className="items-list-wrap">
                {order.items.map((item, index) => (
                  <div className="order-item-row" key={index}>
                    <div className="item-details-left">
                      <div className="item-thumb-box">
                        <img src={item.img} alt={item.name} />
                      </div>
                      <div className="item-name-block">
                        <span className="item-title-name">{item.name}</span>
                        <span className="item-farmer-name">Nhà vườn: {item.farmer}</span>
                      </div>
                    </div>
                    <div className="item-qty-center">
                      <span className="item-price-each">{formatVND(item.price)}</span>
                      <span className="item-qty-lbl">x {item.qty}</span>
                    </div>
                    <div className="item-total-right">
                      <span className="item-row-total">{formatVND(item.price * item.qty)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Provider/Farmer Card */}
            <div className="farmer-profile-card">
              <div className="farmer-avatar-circle" style={{ background: order.provider.avatarBg }}>
                {order.provider.avatarText}
              </div>
              <div className="farmer-profile-info">
                <div className="farmer-title-row">
                  <h3 className="farmer-name-txt">{order.provider.name}</h3>
                  <span className="verified-badge" title="Đã xác minh">✓</span>
                </div>
                <p className="farmer-location">
                  Địa điểm: {order.provider.location} • Thành lập: {order.provider.estYear}
                </p>
                <div className="farmer-badges">
                  <span className="badge-pill">Chứng nhận hữu cơ</span>
                  <span className="badge-pill">Không thuốc trừ sâu</span>
                  <span className="badge-pill">Thu hoạch sạch</span>
                </div>
              </div>
              <div className="farmer-action-btn-wrap">
                <button className="btn-outline">Nhắn tin cho nhà vườn</button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="sidebar-column">
            {/* Delivery Details Card */}
            <div className="sidebar-card">
              <h2 className="sidebar-card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ marginRight: "6px", verticalAlign: "middle" }}>
                  <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                Thông tin nhận hàng
              </h2>
              
              <div className="shipping-address-block">
                <span className="sidebar-section-subtitle">ĐỊA CHỈ NHẬN HÀNG</span>
                <p className="recipient-name">{order.recipient}</p>
                <p className="recipient-address">{order.address}</p>
              </div>

              <div className="shipping-phone-block">
                <span className="sidebar-section-subtitle">SỐ ĐIỆN THOẠI LIÊN HỆ</span>
                <p className="recipient-phone">{order.phone}</p>
              </div>

              <div className="shipping-tracking-block">
                <span className="sidebar-section-subtitle">MÃ VẬN ĐƠN</span>
                <div className="tracking-number-box">
                  <span className="track-number">{order.trackingNumber}</span>
                </div>
              </div>
            </div>

            {/* Payment Summary Card */}
            <div className="sidebar-card">
              <h2 className="sidebar-card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ marginRight: "6px", verticalAlign: "middle" }}>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                Tóm tắt thanh toán
              </h2>

              <div className="payment-breakdown">
                <div className="payment-row">
                  <span>Tạm tính ({order.items.length} mặt hàng)</span>
                  <span>{formatVND(order.subtotal)}</span>
                </div>
                <div className="payment-row">
                  <span>Phí vận chuyển</span>
                  <span>{formatVND(order.shippingFee)}</span>
                </div>
                <div className="payment-row">
                  <span>Phí dịch vụ</span>
                  <span>{formatVND(order.serviceFee)}</span>
                </div>
                <div className="payment-row discount-row">
                  <span>Khuyến mãi</span>
                  <span>-{formatVND(order.discount)}</span>
                </div>
                <hr className="payment-divider" />
                <div className="payment-row total-row">
                  <span>Tổng thanh toán</span>
                  <span className="total-value">{formatVND(order.amount)}</span>
                </div>
              </div>

              <div className="payment-method-box">
                <div className="card-icon-svg">💳</div>
                <div className="card-details">
                  <span className="card-name-txt">Thẻ tín dụng Visa **** {order.cardEnding}</span>
                  <span className="card-status-txt">Thanh toán thành công</span>
                </div>
              </div>
            </div>

            {/* Cancel Order Action */}
            {order.status !== "delivered" && order.status !== "shipping" && order.status !== "cancelled" && (
              <button 
                className="btn-cancel-order-sidebar"
                onClick={() => setShowCancelModal(true)}
              >
                Hủy đơn hàng
              </button>
            )}

            <div className="need-help-link-wrap">
              <span>Bạn cần trợ giúp? </span>
              <Link to="/help" className="help-link">Liên hệ hỗ trợ AgriMarket</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── CANCEL ORDER MODAL ── */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">Xác nhận hủy đơn hàng</h3>
            <p className="modal-message" style={{ marginBottom: "16px" }}>
              Vui lòng chọn lý do hủy đơn hàng #{order.id}:
            </p>

            <div className="cancel-reasons-list">
              {[
                "Thay đổi ý định mua hàng",
                "Tìm thấy nơi khác có giá tốt hơn",
                "Đặt nhầm sản phẩm / số lượng",
                "Thời gian giao hàng dự kiến quá lâu",
                "Lý do khác"
              ].map((r) => (
                <label key={r} className="reason-label-item">
                  <input
                    type="radio"
                    name="cancelReason"
                    value={r}
                    checked={selectedReason === r}
                    onChange={(e) => setSelectedReason(e.target.value)}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            {selectedReason === "Lý do khác" && (
              <textarea
                className="custom-reason-textarea"
                placeholder="Nhập lý do chi tiết của bạn tại đây..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
              />
            )}

            <div className="modal-actions" style={{ marginTop: "24px" }}>
              <button className="modal-btn-cancel" onClick={() => setShowCancelModal(false)}>
                Không, quay lại
              </button>
              <button className="modal-btn-confirm" onClick={handleCancelOrder}>
                Xác nhận hủy đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-left">
            <div className="footer-logo">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
              <span className="logo-text">AgriMarket</span>
            </div>
            <p className="footer-copy-text">
              Kết nối các gia đình địa phương với các nông trại xanh, sạch, phát triển bền vững bằng sự minh bạch kỹ thuật số.
            </p>
            <p className="footer-copy">© 2026 AgriMarket. Kết nối Nông nghiệp số.</p>
          </div>
          <div className="footer-right">
            <Link to="/help" className="footer-link">Trung tâm trợ giúp</Link>
            <Link to="/privacy" className="footer-link">Chính sách bảo mật</Link>
            <Link to="/terms" className="footer-link">Điều khoản dịch vụ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerOrderDetail;

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./OrderDetail.css";

// ── Nav items ──────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: "home",     label: "Trang chủ",          path: "/" },
  { icon: "profile",  label: "Hồ sơ",              path: "/profile" },
  { icon: "product",  label: "Sản phẩm",           path: "/farmer/products" },
  { icon: "security", label: "Bảo mật",            path: "/security" },
  { icon: "bell",     label: "Thông báo",           path: "/farmer/notifications" },
  { icon: "history",  label: "Lịch sử đơn hàng",  path: "/farmer/orders", active: true },
];

// ── Mock order data ────────────────────────────────────────
const MOCK_ORDER = {
  id: "#DH-8472-X",
  rawId: "DH-8472-X",
  status: "awaiting",
  placedAt: "24/10/2023 lúc 08:30 SA",
  items: [
    {
      id: 1,
      name: "Cà chua Heirloom hữu cơ",
      farm: "Trang trại: Green Valley Organics",
      unitPrice: 300000,
      qty: "2 kg",
      total: 600000,
      image: null,
    },
    {
      id: 2,
      name: "Cải xoăn xanh (Bó)",
      farm: "Trang trại: Sunny Side Greens",
      unitPrice: 96000,
      qty: "3 bó",
      total: 288000,
      image: null,
    },
  ],
  history: [
    {
      id: 1,
      icon: "pending",
      title: "Chờ xác nhận từ người bán",
      desc: "Đang chờ xác nhận để bắt đầu xử lý đơn hàng.",
      time: "24/10/2023, 08:35 SA",
      done: false,
    },
    {
      id: 2,
      icon: "check",
      title: "Thanh toán đã được xác nhận",
      desc: "Thẻ thanh toán của khách hàng đã được xác nhận thành công với số tiền 888.000 ₫.",
      time: "24/10/2023, 08:31 SA",
      done: true,
    },
    {
      id: 3,
      icon: "check",
      title: "Đơn hàng đã được đặt",
      desc: "Đơn hàng được đặt bởi Nguyễn Thị Lan.",
      time: "24/10/2023, 08:30 SA",
      done: true,
    },
  ],
  customer: {
    name: "Nguyễn Thị Lan",
    since: "2022",
    email: "lan.nguyen@example.com",
    phone: "(+84) 912 345 678",
    note: "\"Vui lòng đảm bảo cà chua còn chắc. Nếu không có người ở nhà, hãy để bên cửa hông. Cảm ơn!\"",
  },
  delivery: {
    address: ["142 Đường Bạch Đằng", "Căn hộ 4B", "Quận 1, TP.HCM"],
    method: "Giao hàng tận nơi (Trong ngày)",
  },
  payment: {
    subtotal: 888000,
    deliveryFee: 35000,
    tax: 0,
    total: 923000,
    authorized: true,
  },
};

const formatVND = (amount) => amount.toLocaleString("vi-VN") + " ₫";

// ── Rejection reason presets ──────────────────────────────
const REJECT_REASONS = [
  "Sản phẩm đã hết hàng",
  "Không thể giao đến khu vực này",
  "Đơn hàng vượt quá khả năng cung ứng",
  "Sản phẩm tạm ngưng kinh doanh",
  "Thông tin giao hàng không hợp lệ",
  "Lý do khác",
];

// ── SVG Icons ─────────────────────────────────────────────
const NavIcon = ({ type }) => {
  const props = { viewBox: "0 0 24 24", fill: "none", strokeWidth: "2", width: "18", height: "18" };
  if (type === "home")     return <svg {...props} stroke="#f97316"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
  if (type === "profile")  return <svg {...props} stroke="#8b5cf6"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if (type === "product")  return <svg {...props} stroke="#16a34a"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
  if (type === "security") return <svg {...props} stroke="#f59e0b"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
  if (type === "bell")     return <svg {...props} stroke="#eab308"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
  if (type === "history")  return <svg {...props} stroke="#64748b"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 109.03-7.93"/><polyline points="3 4 3 11 10 11"/></svg>;
  return null;
};

// ── Main component ─────────────────────────────────────────
export const OrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const order = MOCK_ORDER;

  const [currentUser] = useState(() => {
    const userStr = localStorage.getItem("farmconnect_user");
    try { return userStr ? JSON.parse(userStr) : null; } catch { return null; }
  });

  const getRoleLabel = (role) => {
    const roles = { farmer: "Nông dân", customer: "Khách hàng", admin: "Quản trị viên" };
    return roles[role] || "Nông dân";
  };

  const [actionDone, setActionDone]           = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal]   = useState(false);
  const [rejectReason, setRejectReason]         = useState("");
  const [rejectNote, setRejectNote]             = useState("");

  const handleConfirm = () => {
    setActionDone("confirmed");
    setShowConfirmModal(false);
  };

  const handleReject = () => {
    setActionDone("rejected");
    setShowRejectModal(false);
  };

  return (
    <>
      {/* ── PAGE ── */}
      <div className="od-page">

        {/* ── SIDEBAR ── */}
        <aside className="od-sidebar">
          <div className="od-sidebar-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" className="od-logo-tractor">
              <circle cx="7" cy="18" r="2"/>
              <circle cx="18" cy="18" r="2"/>
              <path d="M7 16h11v-2H9v-3h7V9H9V6H7v10z"/>
              <path d="M16 9h3l2 3v4"/>
            </svg>
            <span className="od-logo-text">AgriMarket</span>
          </div>

          <div className="od-sidebar-user">
            <div className="od-user-avatar">
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="Avatar" className="od-user-avatar-img" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              )}
            </div>
            <div className="od-user-info">
              <span className="od-user-greeting">Xin chào,</span>
              <span className="od-user-name">{currentUser?.fullName || "Khách"}</span>
              <span className="od-user-role">{getRoleLabel(currentUser?.role)}</span>
            </div>
          </div>

          <nav className="od-sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                className={`od-nav-item ${item.active ? "od-nav-active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className="od-nav-icon"><NavIcon type={item.icon} /></span>
                <span className="od-nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ── MAIN ── */}
        <div className="od-main">

          {/* Top bar */}
          <header className="od-topbar">
            <div className="od-topbar-left">
              <div className="od-breadcrumb">
                <button className="od-breadcrumb-link" onClick={() => navigate("/farmer/orders")}>
                  Đơn hàng
                </button>
                <span className="od-breadcrumb-sep">›</span>
                <span className="od-breadcrumb-current">{order.id}</span>
              </div>
              <div className="od-topbar-heading">
                <h1 className="od-title">Đơn hàng {order.id}</h1>
                <span className="od-badge-awaiting">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Chờ xác nhận
                </span>
              </div>
              <p className="od-placed-at">Đặt lúc {order.placedAt}</p>
            </div>

            <div className="od-topbar-actions">
              {actionDone === "rejected" ? (
                <span className="od-action-done od-action-rejected">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="13" height="13">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Đã từ chối
                </span>
              ) : (
                <button
                  className="od-btn-reject"
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionDone === "confirmed"}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Từ chối
                </button>
              )}
              {actionDone === "confirmed" ? (
                <span className="od-action-done od-action-confirmed">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="13" height="13">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Đã xác nhận
                </span>
              ) : (
                <button
                  className="od-btn-confirm"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={actionDone === "rejected"}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Xác nhận đơn
                </button>
              )}
            </div>
          </header>

          {/* ── Content grid ── */}
          <div className="od-content">

            {/* LEFT */}
            <div className="od-left">

              {/* Order Items */}
              <section className="od-card">
                <div className="od-card-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1b4332" strokeWidth="2" width="18" height="18">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.97-1.67L23 6H6"/>
                  </svg>
                  <h2 className="od-card-title">Danh Sách Sản Phẩm</h2>
                </div>
                <div className="od-items-list">
                  {order.items.map((item) => (
                    <div key={item.id} className="od-item-row">
                      <div className="od-item-thumb">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="od-item-img" />
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" width="22" height="22">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        )}
                      </div>
                      <div className="od-item-info">
                        <span className="od-item-name">{item.name}</span>
                        <span className="od-item-farm">{item.farm}</span>
                      </div>
                      <div className="od-item-price">
                        <span className="od-item-unit-price">{formatVND(item.unitPrice)} x {item.qty}</span>
                        <span className="od-item-total">{formatVND(item.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Order History */}
              <section className="od-card">
                <div className="od-card-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1b4332" strokeWidth="2" width="18" height="18">
                    <polyline points="12 8 12 12 14 14"/>
                    <path d="M3.05 11a9 9 0 109.03-7.93"/>
                    <polyline points="3 4 3 11 10 11"/>
                  </svg>
                  <h2 className="od-card-title">Lịch Sử Đơn Hàng</h2>
                </div>
                <div className="od-timeline">
                  {order.history.map((event) => (
                    <div key={event.id} className="od-timeline-item">
                      <div className={`od-timeline-dot ${event.done ? "od-dot-done" : "od-dot-pending"}`}>
                        {event.done ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="10" height="10">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <div className="od-dot-inner" />
                        )}
                      </div>
                      <div className="od-timeline-body">
                        <div className="od-timeline-row">
                          <span className="od-timeline-title">{event.title}</span>
                          <span className="od-timeline-time">{event.time}</span>
                        </div>
                        <p className="od-timeline-desc">{event.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* RIGHT */}
            <div className="od-right">

              {/* Customer */}
              <section className="od-card">
                <div className="od-card-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1b4332" strokeWidth="2" width="18" height="18">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <h2 className="od-card-title">Khách Hàng</h2>
                </div>
                <div className="od-customer">
                  <div className="od-customer-avatar-wrap">
                    <div className="od-customer-avatar">NL</div>
                    <div>
                      <p className="od-customer-name">{order.customer.name}</p>
                      <p className="od-customer-since">Khách từ năm {order.customer.since}</p>
                    </div>
                  </div>
                  <div className="od-customer-contacts">
                    <div className="od-contact-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" width="14" height="14">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <span className="od-contact-text">{order.customer.email}</span>
                    </div>
                    <div className="od-contact-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" width="14" height="14">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.01 2.2 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                      </svg>
                      <span className="od-contact-text">{order.customer.phone}</span>
                    </div>
                  </div>
                  <div className="od-note-box">
                    <p className="od-note-label">GHI CHÚ KHÁCH HÀNG</p>
                    <p className="od-note-text">{order.customer.note}</p>
                  </div>
                </div>
              </section>

              {/* Delivery */}
              <section className="od-card">
                <div className="od-card-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1b4332" strokeWidth="2" width="18" height="18">
                    <rect x="1" y="3" width="15" height="13"/>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  <h2 className="od-card-title">Chi Tiết Giao Hàng</h2>
                </div>
                <div className="od-delivery">
                  <p className="od-delivery-label">Địa chỉ nhà</p>
                  {order.delivery.address.map((line, i) => (
                    <p key={i} className="od-delivery-line">{line}</p>
                  ))}
                  <div className="od-delivery-method">
                    <span className="od-delivery-method-label">Phương thức giao</span>
                    <span className="od-delivery-method-value">{order.delivery.method}</span>
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section className="od-card">
                <div className="od-card-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1b4332" strokeWidth="2" width="18" height="18">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                  <h2 className="od-card-title">Tóm Tắt Thanh Toán</h2>
                </div>
                <div className="od-payment">
                  <div className="od-payment-row">
                    <span className="od-payment-label">Tạm tính ({order.items.length} sản phẩm)</span>
                    <span className="od-payment-value">{formatVND(order.payment.subtotal)}</span>
                  </div>
                  <div className="od-payment-row">
                    <span className="od-payment-label">Phí giao hàng</span>
                    <span className="od-payment-value">{formatVND(order.payment.deliveryFee)}</span>
                  </div>
                  <div className="od-payment-row">
                    <span className="od-payment-label">Thuế</span>
                    <span className="od-payment-value">{formatVND(order.payment.tax)}</span>
                  </div>
                  <div className="od-payment-divider" />
                  <div className="od-payment-row od-payment-total">
                    <span className="od-payment-total-label">Tổng cộng</span>
                    <span className="od-payment-total-value">{formatVND(order.payment.total)}</span>
                  </div>
                  {order.payment.authorized && (
                    <div className="od-payment-authorized">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" width="14" height="14">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Thanh toán đã được xác nhận
                    </div>
                  )}
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>

      {/* ── CONFIRM MODAL ── */}
      {showConfirmModal && (
        <div className="od-modal-overlay">
          <div className="od-modal od-modal-confirm">
            <div className="od-modal-icon-wrap od-icon-confirm">
              <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" width="28" height="28">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 className="od-modal-title">Xác nhận đơn hàng?</h3>
            <p className="od-modal-desc">
              Bạn sắp xác nhận đơn hàng <strong>{order.id}</strong> của khách hàng
              <strong> {order.customer.name}</strong>. Hành động này sẽ thông báo cho khách
              hàng đơn đã được chấp nhận và bắt đầu xử lý.
            </p>
            <div className="od-modal-summary">
              <div className="od-modal-summary-row">
                <span>Tổng giá trị</span>
                <span className="od-modal-summary-val">{formatVND(order.payment.total)}</span>
              </div>
              <div className="od-modal-summary-row">
                <span>Số sản phẩm</span>
                <span className="od-modal-summary-val">{order.items.length} sản phẩm</span>
              </div>
              <div className="od-modal-summary-row">
                <span>Giao hàng</span>
                <span className="od-modal-summary-val">{order.delivery.method}</span>
              </div>
            </div>
            <div className="od-modal-actions">
              <button className="od-modal-btn-cancel" onClick={() => setShowConfirmModal(false)}>
                Quay lại
              </button>
              <button className="od-modal-btn-confirm" onClick={handleConfirm}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Xác nhận đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECT MODAL ── */}
      {showRejectModal && (
        <div className="od-modal-overlay">
          <div className="od-modal od-modal-reject">
            <div className="od-modal-header-row">
              <div className="od-modal-icon-wrap od-icon-reject">
                <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" width="26" height="26">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div>
                <h3 className="od-modal-title">Từ chối đơn hàng</h3>
                <p className="od-modal-subtitle">Đơn hàng {order.id} • {order.customer.name}</p>
              </div>
              <button className="od-modal-close" onClick={() => setShowRejectModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="od-modal-section">
              <p className="od-modal-section-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" width="14" height="14">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Chọn lý do từ chối
              </p>
              <div className="od-reason-chips">
                {REJECT_REASONS.map((r) => (
                  <button
                    key={r}
                    className={`od-reason-chip ${rejectReason === r ? "od-reason-chip-active" : ""}`}
                    onClick={() => setRejectReason(r)}
                  >
                    {rejectReason === r && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="11" height="11">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="od-modal-section">
              <p className="od-modal-section-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" width="14" height="14">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                Thông điệp gửi khách hàng <span className="od-optional">(tùy chọn)</span>
              </p>
              <textarea
                className="od-reject-textarea"
                placeholder={`Ví dụ: "Xin lỗi, sản phẩm hiện đã hết hàng. Chúng tôi sẽ thông báo lại khi có hàng mới. Cảm ơn bạn đã ủng hộ!"`}
                rows={3}
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
              />
              <p className="od-reject-hint">
                📧 Tin nhắn này sẽ được gửi đến email của khách hàng ({order.customer.email})
              </p>
            </div>

            <div className="od-modal-actions">
              <button className="od-modal-btn-cancel" onClick={() => setShowRejectModal(false)}>
                Hủy bỏ
              </button>
              <button
                className="od-modal-btn-reject"
                onClick={handleReject}
                disabled={!rejectReason}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetail;

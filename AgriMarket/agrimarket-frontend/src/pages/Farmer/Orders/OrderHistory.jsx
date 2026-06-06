import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderHistory.css";

// ── Nav items (shared sidebar) ──────────────────────────────
const NAV_ITEMS = [
  { icon: "home",     label: "Trang chủ",          path: "/" },
  { icon: "profile",  label: "Hồ sơ",              path: "/profile" },
  { icon: "product",  label: "Sản phẩm",           path: "/farmer/products" },
  { icon: "security", label: "Bảo mật",            path: "/security" },
  { icon: "bell",     label: "Thông báo",           path: "/farmer/notifications" },
  { icon: "history",  label: "Lịch sử đơn hàng",  path: "/farmer/orders", active: true },
];

// ── Mock data ──────────────────────────────────────────────
const MOCK_ORDERS = [
  {
    id: "#DH-7830",
    date: "24/10/2023",
    customer: { name: "Hoàng Văn Bình", email: "binh.hv@example.com", initials: "HB", color: "#f97316" },
    amount: 3240000,
    items: "2 sản phẩm (Rau cải hữu cơ)",
    status: "awaiting",
    rating: null,
  },
  {
    id: "#DH-7829",
    date: "24/10/2023",
    customer: { name: "Nguyễn Thị Lan", email: "lan.nguyen@example.com", initials: "NL", color: "#4ade80" },
    amount: 5880000,
    items: "3 sản phẩm (Hộp rau hữu cơ)",
    status: "delivered",
    rating: 4,
  },
  {
    id: "#DH-7828",
    date: "23/10/2023",
    customer: { name: "Trần Minh Hoàng", email: "hoang.tran@example.com", initials: "TH", color: "#7c3aed" },
    amount: 21420000,
    items: "Rau củ số lượng lớn",
    status: "in_transit",
    rating: null,
  },
  {
    id: "#DH-7827",
    date: "21/10/2023",
    customer: { name: "Phạm Thị Mai", email: "Thanh toán khách vãng lai", initials: "PM", color: "#d1d5db" },
    amount: 1080000,
    items: "1 sản phẩm (Mật ong rừng)",
    status: "cancelled",
    rating: null,
  },
  {
    id: "#DH-7826",
    date: "20/10/2023",
    customer: { name: "Lê Quang Dũng", email: "dung.le@example.com", initials: "LD", color: "#1b4332" },
    amount: 2880000,
    items: "Giỏ rau theo mùa",
    status: "delivered",
    rating: 3,
  },
  {
    id: "#DH-7825",
    date: "19/10/2023",
    customer: { name: "Vũ Thị Thu", email: "thu.vu@example.com", initials: "VT", color: "#06b6d4" },
    amount: 780000,
    items: "1 sản phẩm (Trứng gà ta)",
    status: "awaiting",
    rating: null,
  },
];

const STATUS_CONFIG = {
  awaiting:   { label: "Chờ xác nhận", cls: "oh-st-awaiting" },
  delivered:  { label: "Đã giao",      cls: "oh-st-delivered" },
  in_transit: { label: "Đang vận chuyển", cls: "oh-st-transit" },
  cancelled:  { label: "Đã hủy",       cls: "oh-st-cancelled" },
  pending:    { label: "Chờ xử lý",    cls: "oh-st-pending" },
};

// ── Filter options ────────────────────────────────────────
const STATUS_FILTER_OPTIONS = [
  { value: "all",        label: "Tất cả đơn hàng",    dot: null },
  { value: "awaiting",   label: "Chờ xác nhận",       dot: "#f59e0b" },
  { value: "in_transit", label: "Đang vận chuyển",    dot: "#0369a1" },
  { value: "delivered",  label: "Đã giao",             dot: "#16a34a" },
  { value: "cancelled",  label: "Đã hủy",             dot: "#dc2626" },
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

const StarRating = ({ rating }) => {
  if (rating === null) return <span className="oh-rating-pending">Chờ đánh giá</span>;
  return (
    <div className="oh-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} viewBox="0 0 24 24" width="14" height="14"
          fill={s <= rating ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
};

const formatVND = (amount) =>
  amount.toLocaleString("vi-VN") + " ₫";

// ── Main component ─────────────────────────────────────────
export const OrderHistory = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const ITEMS_PER_PAGE = 10;

  const awaitingCount = MOCK_ORDERS.filter(o => o.status === "awaiting").length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [currentUser] = useState(() => {
    const userStr = localStorage.getItem("farmconnect_user");
    try { return userStr ? JSON.parse(userStr) : null; } catch { return null; }
  });

  const getRoleLabel = (role) => {
    const roles = { farmer: "Nông dân", customer: "Khách hàng", admin: "Quản trị viên" };
    return roles[role] || "Nông dân";
  };

  // Stats
  const completedCount = MOCK_ORDERS.filter(o => o.status === "delivered").length;
  const cancelledCount = MOCK_ORDERS.filter(o => o.status === "cancelled").length;
  const avgValue = Math.round(
    MOCK_ORDERS.filter(o => o.status === "delivered")
      .reduce((s, o) => s + o.amount, 0) /
    Math.max(MOCK_ORDERS.filter(o => o.status === "delivered").length, 1)
  );
  const ratings = MOCK_ORDERS.filter(o => o.rating !== null).map(o => o.rating);
  const avgRating = ratings.length
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : "N/A";

  const filtered = MOCK_ORDERS.filter(o => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = statusFilter === "all" ? true : o.status === statusFilter;
    return matchSearch && matchFilter;
  });

  const activeOption = STATUS_FILTER_OPTIONS.find(opt => opt.value === statusFilter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="oh-page">
      {/* ── SIDEBAR ── */}
      <aside className="oh-sidebar">
        <div className="oh-sidebar-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round" className="oh-logo-tractor">
            <circle cx="7" cy="18" r="2"/>
            <circle cx="18" cy="18" r="2"/>
            <path d="M7 16h11v-2H9v-3h7V9H9V6H7v10z"/>
            <path d="M16 9h3l2 3v4"/>
          </svg>
          <span className="oh-logo-text">AgriMarket</span>
        </div>

        <div className="oh-sidebar-user">
          <div className="oh-user-avatar">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Avatar" className="oh-user-avatar-img" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            )}
          </div>
          <div className="oh-user-info">
            <span className="oh-user-greeting">Xin chào,</span>
            <span className="oh-user-name">{currentUser?.fullName || "Khách"}</span>
            <span className="oh-user-role">{getRoleLabel(currentUser?.role)}</span>
          </div>
        </div>

        <nav className="oh-sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={`oh-nav-item ${item.active ? "oh-nav-active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="oh-nav-icon"><NavIcon type={item.icon} /></span>
              <span className="oh-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <div className="oh-main">
        {/* Top bar */}
        <header className="oh-topbar">
          <div className="oh-topbar-left">
            <h1 className="oh-title">Lịch Sử Đơn Hàng</h1>
            <p className="oh-subtitle">Xem lại các giao dịch và chỉ số hiệu suất kinh doanh.</p>
          </div>
          <div className="oh-topbar-actions">
            <button className="oh-btn-export">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Xuất CSV
            </button>
            {/* Status filter dropdown */}
            <div className="oh-status-dropdown" ref={dropdownRef}>
              <button
                className={`oh-btn-filter-dropdown ${statusFilter !== "all" ? "oh-btn-filter-active" : ""}`}
                onClick={() => setDropdownOpen(v => !v)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <line x1="4" y1="6" x2="20" y2="6"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                  <line x1="11" y1="18" x2="13" y2="18"/>
                </svg>
                {activeOption?.dot && (
                  <span className="oh-filter-dot" style={{ background: activeOption.dot }} />
                )}
                {activeOption?.label}
                {statusFilter === "awaiting" && awaitingCount > 0 && (
                  <span className="oh-pending-badge">{awaitingCount}</span>
                )}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"
                  className={`oh-chevron ${dropdownOpen ? "oh-chevron-up" : ""}`}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {dropdownOpen && (
                <div className="oh-dropdown-menu">
                  {STATUS_FILTER_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`oh-dropdown-item ${statusFilter === opt.value ? "oh-dropdown-item-active" : ""}`}
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setCurrentPage(1);
                        setDropdownOpen(false);
                      }}
                    >
                      {opt.dot
                        ? <span className="oh-filter-dot" style={{ background: opt.dot }} />
                        : <span className="oh-filter-dot-empty" />
                      }
                      {opt.label}
                      <span className="oh-dropdown-count">
                        {opt.value === "all"
                          ? MOCK_ORDERS.length
                          : MOCK_ORDERS.filter(o => o.status === opt.value).length
                        }
                      </span>
                      {statusFilter === opt.value && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" width="13" height="13" style={{ marginLeft: "auto" }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Stats cards */}
        <div className="oh-stats-grid">
          <div className="oh-stat-card">
            <div className="oh-stat-bg-icon oh-stat-bg-check">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="oh-stat-label">ĐƠN HOÀN THÀNH</p>
            <p className="oh-stat-value">{MOCK_ORDERS.filter(o => o.status === "delivered").length.toLocaleString("vi-VN")}</p>
            <p className="oh-stat-change oh-change-up">↗ +12% tháng này</p>
          </div>

          <div className="oh-stat-card">
            <div className="oh-stat-bg-icon oh-stat-bg-cancel">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <p className="oh-stat-label">ĐÃ HỦY</p>
            <p className="oh-stat-value">{cancelledCount}</p>
            <p className="oh-stat-change oh-change-neutral">→ Bình thường</p>
          </div>

          <div className="oh-stat-card oh-stat-card-highlight">
            <p className="oh-stat-label oh-stat-label-light">GIÁ TRỊ ĐƠN TRUNG BÌNH</p>
            <p className="oh-stat-value oh-stat-value-large">{formatVND(avgValue)}</p>
            <p className="oh-stat-change oh-change-up-light">↗ +5% so với năm ngoái</p>
          </div>

          <div className="oh-stat-card">
            <div className="oh-stat-bg-icon oh-stat-bg-star">
              <svg viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5" width="26" height="26">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <p className="oh-stat-label">ĐÁNH GIÁ</p>
            <p className="oh-stat-value">{avgRating} <span className="oh-stat-unit">/ 5</span></p>
            <div className="oh-stars" style={{ marginTop: "4px" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} viewBox="0 0 24 24" width="13" height="13"
                  fill={s <= Math.round(parseFloat(avgRating)) ? "#f59e0b" : "none"}
                  stroke="#f59e0b" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              ))}
            </div>
            <p className="oh-stat-sublabel">{ratings.length} đánh giá</p>
          </div>
        </div>

        {/* Table section */}
        <div className="oh-table-section">
          <div className="oh-table-header">
            <h2 className="oh-table-title">Giao Dịch Gần Đây</h2>
            <div className="oh-table-actions">
              <div className="oh-search-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" className="oh-search-icon">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="oh-search-input"
                  placeholder="Lọc đơn hàng..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <button className="oh-filter-btn" title="Lọc">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <line x1="4" y1="6" x2="20" y2="6"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                  <line x1="11" y1="18" x2="13" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="oh-table-wrap">
            <table className="oh-table">
              <thead>
                <tr>
                  <th>MÃ ĐH &amp; NGÀY</th>
                  <th>KHÁCH HÀNG</th>
                  <th>SỐ TIỀN &amp; SẢN PHẨM</th>
                  <th>TRẠNG THÁI</th>
                  <th>ĐÁNH GIÁ</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={6} className="oh-empty">Không tìm thấy đơn hàng nào.</td></tr>
                ) : (
                  paginated.map((order) => {
                    const st = STATUS_CONFIG[order.status];
                    return (
                      <tr key={order.id} className="oh-row">
                        <td>
                          <span className="oh-order-id">{order.id}</span>
                          <span className="oh-order-date">{order.date}</span>
                        </td>
                        <td>
                          <div className="oh-customer-cell">
                            <div className="oh-customer-avatar" style={{ background: order.customer.color }}>
                              {order.customer.initials}
                            </div>
                            <div>
                              <span className="oh-customer-name">{order.customer.name}</span>
                              <span className="oh-customer-email">{order.customer.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="oh-amount">{formatVND(order.amount)}</span>
                          <span className="oh-items">{order.items}</span>
                        </td>
                        <td>
                          <span className={`oh-status-badge ${st.cls}`}>{st.label}</span>
                        </td>
                        <td>
                          <StarRating rating={order.rating} />
                        </td>
                        <td>
                          <button
                            className="oh-view-btn"
                            onClick={() => navigate(`/farmer/orders/${order.id.replace("#", "")}`)}
                          >
                            Xem
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination footer */}
            <div className="oh-pagination-footer">
              <p className="oh-pagination-summary">
                Hiển thị 1 đến {Math.min(paginated.length, filtered.length)} trong {MOCK_ORDERS.length.toLocaleString("vi-VN")} đơn hàng
              </p>
              <div className="oh-pagination-controls">
                <button
                  className="oh-page-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    className={`oh-page-num ${currentPage === p ? "oh-page-active" : ""}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <span className="oh-page-ellipsis">...</span>
                <button
                  className="oh-page-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Tiếp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;

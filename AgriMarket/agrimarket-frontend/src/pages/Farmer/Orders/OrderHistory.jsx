import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import orderService from "../../../services/orderService";
import "./OrderHistory.css";

const ORDER_STATUS_CONFIG = {
  pending:    { label: "Chờ xử lý",      cls: "oh-st-pending",    color: "#f59e0b" },
  confirmed:  { label: "Đã xác nhận",    cls: "oh-st-confirmed",  color: "#3b82f6" },
  preparing:  { label: "Đang chuẩn bị",   cls: "oh-st-preparing",  color: "#8b5cf6" },
  shipping:   { label: "Đang vận chuyển", cls: "oh-st-shipping",   color: "#06b6d4" },
  delivered:  { label: "Đã giao",         cls: "oh-st-delivered",  color: "#10b981" },
  cancelled:  { label: "Đã hủy",         cls: "oh-st-cancelled",  color: "#ef4444" },
  rejected:   { label: "Đã từ chối",     cls: "oh-st-rejected",   color: "#7f1d1d" },
};

const STATUS_FILTER_OPTIONS = [
  { value: "all",        label: "Tất cả đơn hàng",    dot: null },
  { value: "pending",    label: "Chờ xử lý",          dot: "#f59e0b" },
  { value: "confirmed",  label: "Đã xác nhận",        dot: "#3b82f6" },
  { value: "preparing",  label: "Đang chuẩn bị",      dot: "#8b5cf6" },
  { value: "shipping",   label: "Đang vận chuyển",    dot: "#06b6d4" },
  { value: "delivered",  label: "Đã giao",            dot: "#10b981" },
  { value: "cancelled",  label: "Đã hủy",            dot: "#ef4444" },
  { value: "rejected",   label: "Đã từ chối",        dot: "#7f1d1d" },
];

const StarRating = ({ rating }) => {
  if (rating === null || rating === undefined) return <span className="oh-rating-pending">Chờ đánh giá</span>;
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

const getInitials = (name) => {
  if (!name) return "KH";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getAvatarColor = (name) => {
  const colors = ["#f97316", "#4ade80", "#7c3aed", "#1b4332", "#06b6d4", "#eab308", "#ec4899"];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const OrderHistory = () => {
  const navigate = useNavigate();
  const { farmerProfile } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderCurrentPage, setOrderCurrentPage] = useState(1);
  const [orderDropdownOpen, setOrderDropdownOpen] = useState(false);
  const orderDropdownRef = useRef(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const ORDERS_PER_PAGE = 8;

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (orderDropdownRef.current && !orderDropdownRef.current.contains(e.target)) {
        setOrderDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getFarmerOrders();
      setOrders(data);
    } catch (err) {
      console.error("Lỗi khi tải đơn hàng:", err);
      showToast("Không thể tải danh sách đơn hàng.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      showToast("Không có đơn hàng nào để xuất.", "warning");
      return;
    }
    const headers = ["Mã đơn hàng", "Ngày đặt", "Khách hàng", "Số điện thoại", "Số lượng sản phẩm", "Tổng số tiền (VND)", "Trạng thái"];
    const rows = orders.map(o => [
      o.id,
      (o.date || "") + " " + (o.time || ""),
      o.recipient || "",
      o.phone || "",
      o.itemCount || 0,
      o.amount || 0,
      ORDER_STATUS_CONFIG[o.status]?.label || o.status
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `danh_sach_don_hang_${farmerProfile?.farmName || "farm"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Đã xuất danh sách đơn hàng ra file CSV thành công!", "success");
  };

  // Stats calculation
  const safeOrders = orders || [];
  const awaitingCount = safeOrders.filter(o => o && o.status === "pending").length;
  const completedCount = safeOrders.filter(o => o && o.status === "delivered").length;
  const cancelledCount = safeOrders.filter(o => o && (o.status === "cancelled" || o.status === "rejected")).length;

  const deliveredOrders = safeOrders.filter(o => o && o.status === "delivered");
  const avgValue = deliveredOrders.length > 0
    ? Math.round(deliveredOrders.reduce((sum, o) => sum + (o.amount || 0), 0) / deliveredOrders.length)
    : 0;

  const ratedOrders = safeOrders.filter(o => o && o.rating !== undefined && o.rating !== null);
  const avgRating = ratedOrders.length > 0
    ? (ratedOrders.reduce((sum, o) => sum + o.rating, 0) / ratedOrders.length).toFixed(1)
    : (farmerProfile?.ratingAverage || 4.8);
  const ratingsCount = ratedOrders.length > 0 ? ratedOrders.length : 0;

  // Filtering & Pagination
  const filteredOrders = useMemo(() => {
    return safeOrders.filter((o) => {
      if (!o) return false;
      const orderIdStr = o.id ? String(o.id) : "";
      const recipientStr = o.recipient ? String(o.recipient) : "";
      const matchSearch = orderIdStr.toLowerCase().includes(orderSearch.toLowerCase()) || recipientStr.toLowerCase().includes(orderSearch.toLowerCase());
      const matchFilter = orderStatusFilter === "all" ? true : o.status === orderStatusFilter;
      return matchSearch && matchFilter;
    });
  }, [safeOrders, orderSearch, orderStatusFilter]);

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice((orderCurrentPage - 1) * ORDERS_PER_PAGE, orderCurrentPage * ORDERS_PER_PAGE);
  }, [filteredOrders, orderCurrentPage]);

  useEffect(() => {
    setOrderCurrentPage(1);
  }, [orderSearch, orderStatusFilter]);

  const activeOption = STATUS_FILTER_OPTIONS.find(opt => opt.value === orderStatusFilter) || STATUS_FILTER_OPTIONS[0];

  return (
    <div className="fd-orders-tab" style={{ padding: "20px 24px" }}>
      {/* Dynamic Header */}
      <header className="fd-topbar-header" style={{ margin: "0 0 24px 0", padding: 0, border: "none" }}>
        <div className="topbar-left">
          <h1 className="viewport-title">Đơn hàng của tôi</h1>
          <p className="viewport-subtitle">Nhận đơn hàng mới từ người tiêu dùng và cập nhật giao vận.</p>
        </div>
        <div className="topbar-right">
          <div className="user-profile-badge" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
            <span>Hồ sơ cá nhân</span>
            <span className="arrow">→</span>
          </div>
        </div>
      </header>

      {/* Overview stats cards */}
      <div className="oh-stats-grid">
        <div className="oh-stat-card">
          <div className="oh-stat-label">Đơn hoàn thành</div>
          <div className="oh-stat-num">{loading ? "..." : completedCount}</div>
        </div>
        <div className="oh-stat-card">
          <div className="oh-stat-label">Chờ xác nhận</div>
          <div className="oh-stat-num oh-num-orange">{loading ? "..." : awaitingCount}</div>
        </div>
        <div className="oh-stat-card">
          <div className="oh-stat-label">Giá trị trung bình</div>
          <div className="oh-stat-num">{loading ? "..." : avgValue.toLocaleString("vi-VN")} đ</div>
        </div>
        <div className="oh-stat-card">
          <div className="oh-stat-label">Đánh giá trung bình</div>
          <div className="oh-stat-num oh-num-rating">
            {loading ? "..." : avgRating} <span className="star">★</span>
            <span className="count">({ratingsCount})</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="oh-toolbar">
        <div className="oh-search-box">
          <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Tìm mã đơn hàng hoặc tên khách hàng..."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
          />
        </div>

        <div className="oh-toolbar-right">
          {/* Custom Status Dropdown */}
          <div className="oh-dropdown-wrap" ref={orderDropdownRef}>
            <button className="oh-dropdown-btn" onClick={() => setOrderDropdownOpen(!orderDropdownOpen)}>
              {activeOption.dot && (
                <span className="dot" style={{ backgroundColor: activeOption.dot }} />
              )}
              {activeOption.label}
              <span className="arrow">▼</span>
            </button>

            {orderDropdownOpen && (
              <div className="oh-dropdown-menu">
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`oh-dropdown-item ${orderStatusFilter === opt.value ? "active" : ""}`}
                    onClick={() => {
                      setOrderStatusFilter(opt.value);
                      setOrderDropdownOpen(false);
                    }}
                  >
                    {opt.dot && (
                      <span className="item-dot" style={{ backgroundColor: opt.dot }} />
                    )}
                    {opt.label}
                    {opt.value !== "all" && (
                      <span className="count-badge">
                        ({opt.value === "all" ? safeOrders.length : safeOrders.filter(o => o.status === opt.value).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="oh-btn-csv" onClick={handleExportCSV}>
            📥 Xuất CSV
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="oh-table-wrap">
        <table className="oh-table">
          <thead>
            <tr>
              <th>MÃ ĐƠN HÀNG</th>
              <th>NGÀY ĐẶT</th>
              <th>KHÁCH HÀNG</th>
              <th>TỔNG TIỀN</th>
              <th>ĐÁNH GIÁ</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="oh-empty">Đang tải đơn hàng...</td></tr>
            ) : paginatedOrders.length === 0 ? (
              <tr><td colSpan="7" className="oh-empty">Không tìm thấy đơn hàng phù hợp.</td></tr>
            ) : (
              paginatedOrders.map((o) => {
                const conf = ORDER_STATUS_CONFIG[o.status] || { label: o.status, cls: "" };
                const initials = getInitials(o.recipient);
                const avColor = getAvatarColor(o.recipient);
                return (
                  <tr key={o.id} className="oh-row">
                    <td>
                      <span className="oh-id" onClick={() => navigate(`/farmer/orders/orderdetail/${o.id.replace("#", "")}`)} style={{ cursor: "pointer", color: "#10b981", fontWeight: "600" }}>
                        {o.id}
                      </span>
                    </td>
                    <td className="oh-date">{o.date}</td>
                    <td>
                      <div className="oh-customer-cell">
                        <div className="oh-cust-avatar" style={{ backgroundColor: o.customerAvatarUrl ? "transparent" : avColor }}>
                          {o.customerAvatarUrl ? (
                            <img src={o.customerAvatarUrl} alt={o.recipient} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                          ) : (
                            initials
                          )}
                        </div>
                        <div>
                          <div className="name">{o.recipient}</div>
                          <div className="phone">{o.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="oh-amount">{(o.amount || 0).toLocaleString("vi-VN")} đ</td>
                    <td><StarRating rating={o.rating} /></td>
                    <td>
                      <span className={`oh-status-badge ${conf.cls}`}>{conf.label}</span>
                    </td>
                    <td>
                      <button className="oh-btn-view" onClick={() => navigate(`/farmer/orders/orderdetail/${o.id.replace("#", "")}`)}>
                        Xem
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filteredOrders.length > ORDERS_PER_PAGE && (
        <div className="fd-pagination">
          <span className="summary">
            Hiển thị {((orderCurrentPage - 1) * ORDERS_PER_PAGE) + 1} - {Math.min(orderCurrentPage * ORDERS_PER_PAGE, filteredOrders.length)} trong tổng số {filteredOrders.length} giao dịch
          </span>
          <div className="controls">
            <button
              onClick={() => setOrderCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={orderCurrentPage === 1}
            >
              ‹
            </button>
            <span className="info">Trang {orderCurrentPage} / {totalOrderPages}</span>
            <button
              onClick={() => setOrderCurrentPage(prev => Math.min(totalOrderPages, prev + 1))}
              disabled={orderCurrentPage === totalOrderPages}
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* Custom Toast Notification */}
      {toast.show && (
        <div className={`custom-toast ${toast.type}`}>
          <span className="custom-toast-icon">
            {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "⚠️"}
          </span>
          <span className="custom-toast-message">{toast.message}</span>
          <button className="custom-toast-close" onClick={() => setToast({ show: false })}>×</button>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import orderService from "../../services/orderService";
import useProfile from "../../hooks/useProfile";
import ProfileLayout from "../../components/profile/ProfileLayout";
import "./MyOrders.css";
import "../Profile/Profile.css";

// Import local images from Home assets
import bunchedCarrots from "../Home/assets/bunched_carrots.png";
import heirloomTomatoes from "../Home/assets/heirloom_tomatoes.png";
import honeycrispApples from "../Home/assets/honeycrisp_apples.png";

// Mock orders data mimicking the screenshot and adding high fidelity interactive data
const INITIAL_ORDERS = [
  {
    id: "FH-2024-8892",
    status: "delivered", // delivered, shipping, cancelled, pending, confirmed, preparing
    statusLabel: "Đã giao",
    date: "12 thg 10, 2024",
    time: "10:24 SA",
    amount: 3562500, // 142.50 USD in VND
    itemCount: 6,
    provider: {
      name: "Nông trại hữu cơ Thung lũng Xanh",
      avatarText: "TX",
      avatarBg: "#1b5e20",
    },
    thumbnails: [bunchedCarrots, heirloomTomatoes, honeycrispApples],
    hasMoreItems: 3,
  },
  {
    id: "FH-2024-9104",
    status: "shipping",
    statusLabel: "Chờ giao hàng",
    date: "14 thg 10, 2024",
    time: "03:15 CH",
    amount: 2150000, // 86.00 USD in VND
    itemCount: 2,
    provider: {
      name: "Nhà máy bơ sữa thủ công Hillside",
      avatarText: "HS",
      avatarBg: "#0d47a1",
    },
    thumbnails: [
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200",
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200"
    ],
    hasMoreItems: 0,
  },
  {
    id: "FH-2024-7721",
    status: "cancelled",
    statusLabel: "Đã hủy",
    date: "05 thg 10, 2024",
    time: "09:12 SA",
    amount: 1127500, // 45.10 USD in VND
    itemCount: 3,
    provider: {
      name: "Hợp tác xã Vườn Nắng",
      avatarText: "VN",
      avatarBg: "#e65100",
    },
    thumbnails: [honeycrispApples],
    hasMoreItems: 0,
  },
  {
    id: "FH-2026-1011",
    status: "pending",
    statusLabel: "Chờ xác nhận",
    date: "06 thg 06, 2026",
    time: "16:30 CH",
    amount: 250000,
    itemCount: 1,
    provider: {
      name: "Nông trại hữu cơ Sông Hồng",
      avatarText: "SH",
      avatarBg: "#004d40",
    },
    thumbnails: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200"],
    hasMoreItems: 0,
  },
  {
    id: "FH-2026-1012",
    status: "confirmed",
    statusLabel: "Chờ lấy hàng",
    date: "05 thg 06, 2026",
    time: "08:20 SA",
    amount: 1200000,
    itemCount: 4,
    provider: {
      name: "Vườn Cây Trái Miền Tây",
      avatarText: "MT",
      avatarBg: "#3e2723",
    },
    thumbnails: [
      "https://images.unsplash.com/photo-1553279768-865429fa0078?w=200",
      honeycrispApples
    ],
    hasMoreItems: 2,
  },
  {
    id: "FH-2026-1013",
    status: "preparing",
    statusLabel: "Đang chuẩn bị",
    date: "04 thg 06, 2026",
    time: "14:15 CH",
    amount: 640000,
    itemCount: 3,
    provider: {
      name: "Đà Lạt Eco Farm",
      avatarText: "DL",
      avatarBg: "#33691e",
    },
    thumbnails: [
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200",
      bunchedCarrots
    ],
    hasMoreItems: 1,
  },
  {
    id: "FH-2026-1014",
    status: "delivered",
    statusLabel: "Đã giao",
    date: "28 thg 05, 2026",
    time: "11:30 SA",
    amount: 980000,
    itemCount: 5,
    provider: {
      name: "Nông trại hữu cơ Thung lũng Xanh",
      avatarText: "TX",
      avatarBg: "#1b5e20",
    },
    thumbnails: [bunchedCarrots, heirloomTomatoes],
    hasMoreItems: 3,
  },
  {
    id: "FH-2026-1015",
    status: "cancelled",
    statusLabel: "Đã hủy",
    date: "20 thg 05, 2026",
    time: "10:00 SA",
    amount: 350000,
    itemCount: 2,
    provider: {
      name: "Nhà máy bơ sữa thủ công Hillside",
      avatarText: "HS",
      avatarBg: "#0d47a1",
    },
    thumbnails: ["https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200"],
    hasMoreItems: 1,
  }
];

const TABS = [
  { value: "all", label: "Tất cả đơn" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "preparing", label: "Đang chuẩn bị" },
  { value: "confirmed", label: "Chờ lấy hàng" },
  { value: "shipping", label: "Chờ giao hàng" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
  { value: "preorder", label: "Đặt trước (Preorder)" }
];

export const MyOrders = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [preorders, setPreorders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedReason, setSelectedReason] = useState("Thay đổi ý định mua hàng");
  const [customReason, setCustomReason] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const itemsPerPage = 3;

  useEffect(() => {
    const loadPreorders = () => {
      const stored = localStorage.getItem("agrimarket_preorders");
      setPreorders(stored ? JSON.parse(stored) : []);
    };
    loadPreorders();
    window.addEventListener("preordersUpdated", loadPreorders);
    return () => {
      window.removeEventListener("preordersUpdated", loadPreorders);
    };
  }, []);

  const handleCancelPreorder = (preorderId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy yêu cầu đặt trước này? Khoản cọc sẽ được hoàn lại theo chính sách của AgriMarket.")) {
      const stored = localStorage.getItem("agrimarket_preorders");
      const list = stored ? JSON.parse(stored) : [];
      const updated = list.map(po => {
        if (po.id === preorderId) {
          return { ...po, status: "cancelled", statusLabel: "Đã hủy cọc" };
        }
        return po;
      });
      localStorage.setItem("agrimarket_preorders", JSON.stringify(updated));
      setPreorders(updated);
      setToastMessage("Đã hủy yêu cầu đặt trước thành công!");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  useEffect(() => {
    // Check login state
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    const loadOrders = async () => {
      if (currentUser) {
        try {
          const fetched = await orderService.getCustomerOrders();
          setOrders(fetched);
        } catch (err) {
          console.error("Lỗi khi load đơn hàng từ API:", err);
          const stored = localStorage.getItem("agrimarket_orders");
          setOrders(stored ? JSON.parse(stored) : INITIAL_ORDERS);
        }
      } else {
        const stored = localStorage.getItem("agrimarket_orders");
        setOrders(stored ? JSON.parse(stored) : INITIAL_ORDERS);
      }
    };

    loadOrders();
  }, []);

  // Sync orders with localStorage only when not logged in
  useEffect(() => {
    if (!user) {
      localStorage.setItem("agrimarket_orders", JSON.stringify(orders));
    }
  }, [orders, user]);



  const handleCancelClick = (orderId) => {
    setSelectedOrderId(orderId);
    setSelectedReason("Thay đổi ý định mua hàng");
    setCustomReason("");
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    const finalReason = selectedReason === "Lý do khác" ? customReason.trim() : selectedReason;
    if (selectedReason === "Lý do khác" && !customReason.trim()) {
      alert("Vui lòng nhập lý do hủy đơn hàng của bạn.");
      return;
    }

    if (user) {
      try {
        const updated = await orderService.cancelOrder(selectedOrderId, finalReason);
        setOrders(prevOrders =>
          prevOrders.map(o => o.id === selectedOrderId ? updated : o)
        );
        setShowCancelModal(false);
        setToastMessage("Hủy đơn hàng thành công!");
        setTimeout(() => setToastMessage(""), 3000);
      } catch (err) {
        console.error("Lỗi khi hủy đơn hàng:", err);
        alert(err.response?.data || "Hủy đơn hàng thất bại. Vui lòng thử lại.");
      }
    } else {
      setOrders(prevOrders =>
        prevOrders.map(o =>
          o.id === selectedOrderId
            ? { ...o, status: "cancelled", statusLabel: "Đã hủy", cancelReason: finalReason || "Không có lý do cụ thể" }
            : o
        )
      );
      setShowCancelModal(false);
      setToastMessage("Hủy đơn hàng thành công!");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  // Filter logic
  const filteredOrders = activeTab === "preorder"
    ? preorders.filter(po => {
        const matchesSearch =
          po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          po.provider.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      })
    : orders.filter(order => {
        const matchesTab = activeTab === "all" || order.status === activeTab;
        const matchesSearch =
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.provider.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
      });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const formatVND = (value) => {
    return value.toLocaleString("vi-VN") + " ₫";
  };

  // Status icon selector
  const renderStatusIcon = (status) => {
    if (status === "delivered") {
      return (
        <div className="order-icon-box status-delivered-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
            <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
      );
    }
    if (status === "shipping" || status === "preparing" || status === "confirmed") {
      return (
        <div className="order-icon-box status-shipping-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
            <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
      );
    }
    if (status === "cancelled") {
      return (
        <div className="order-icon-box status-cancelled-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
      );
    }
    // Default / Pending
    return (
      <div className="order-icon-box status-pending-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
    );
  };

  return (
    <ProfileLayout profile={profile}>
      <div className="myorders-sidebar-content">

        <div className="myorders-title-bar">
          <h1 className="page-title" style={{ fontSize: "32px", fontWeight: "800", color: "#00412f", letterSpacing: "-0.5px", margin: 0 }}>Đơn hàng của tôi</h1>

          {/* Search box */}
          <div className="search-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" className="search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm theo mã đơn hoặc tên nhà vườn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ── FILTER TABS ── */}
        <div className="tabs-container">
          {TABS.map(tab => (
            <button
              key={tab.value}
              className={`tab-btn ${activeTab === tab.value ? "active" : ""}`}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── ORDERS LIST ── */}
        <div className="orders-list">
          {paginatedOrders.length === 0 ? (
            <div className="empty-orders-state">
              <div className="empty-icon">📦</div>
              <h3>Không tìm thấy đơn hàng nào</h3>
              <p>Thử thay đổi từ khóa tìm kiếm hoặc lọc theo trạng thái khác.</p>
            </div>
          ) : (
            paginatedOrders.map(order => (
              <div className="order-card" key={order.id} style={activeTab === "preorder" ? { borderLeft: "4px solid #1b5e20" } : {}}>
                {/* Card Top Info */}
                <div className="order-card-header">
                  <div className="order-header-left">
                    {activeTab === "preorder" ? (
                      <div className="order-icon-box status-preorder-icon" style={{ backgroundColor: "#e8f5e9", color: "#1b5e20", display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", marginRight: "12px", fontSize: "18px" }}>
                        🌱
                      </div>
                    ) : (
                      renderStatusIcon(order.status)
                    )}
                    <div className="order-title-info">
                      <div className="order-id-row">
                        <span className="order-id-label">{activeTab === "preorder" ? "MÃ ĐẶT TRƯỚC" : "MÃ ĐƠN HÀNG"} #{order.id}</span>
                        <span className={`status-badge status-${order.status}`} style={activeTab === "preorder" && order.status === "paid" ? { backgroundColor: "#e8f5e9", color: "#1b5e20" } : {}}>
                          {order.statusLabel}
                        </span>
                      </div>
                      <div className="order-date-row">
                        <span>Đặt ngày {order.date} • {order.time}</span>
                      </div>
                      {activeTab === "preorder" && (
                        <div className="preorder-harvest-date-badge" style={{ marginTop: "4px", fontSize: "12px", color: "#1b5e20", fontWeight: "600" }}>
                          🌾 Thu hoạch dự kiến: {order.expectedHarvestDate}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="order-header-right">
                    <span className="order-amount">{formatVND(order.amount)}</span>
                    <span className="order-items-count">
                      {activeTab === "preorder" ? `Đã đặt cọc 20%: ${formatVND(order.depositPaid)}` : `${order.itemCount} sản phẩm`}
                    </span>
                  </div>
                </div>

                {/* Card Provider Info */}
                <div className="order-card-provider">
                  <div className="provider-info-left">
                    <div className="provider-avatar" style={{ background: order.provider.avatarUrl ? "transparent" : order.provider.avatarBg, overflow: "hidden" }}>
                      {order.provider.avatarUrl ? (
                        <img src={order.provider.avatarUrl} alt={order.provider.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        order.provider.avatarText
                      )}
                    </div>
                    <div className="provider-details">
                      <span className="provider-label">{activeTab === "preorder" ? "HỘ GIA ĐÌNH SẢN XUẤT" : "NHÀ CUNG CẤP"}</span>
                      <span className="provider-name">{order.provider.name}</span>
                    </div>
                  </div>
                  <div className="provider-info-right">
                    <div className="product-thumbnails">
                      {order.thumbnails.map((thumb, idx) => (
                        <div className="thumbnail-wrapper" key={idx}>
                          <img src={thumb} alt="Sản phẩm" />
                        </div>
                      ))}
                      {order.hasMoreItems > 0 && (
                        <div className="thumbnail-more">
                          +{order.hasMoreItems}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="order-card-footer">
                  {activeTab === "preorder" ? (
                    <>
                      <button className="btn-outline">Liên hệ nhà vườn</button>
                      {order.status === "paid" && (
                        <button className="btn-danger-outline" onClick={() => handleCancelPreorder(order.id)}>
                          Hủy đặt trước
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {order.status === "delivered" && (
                        <>
                          <button className="btn-outline">Liên hệ nhà vườn</button>
                          <button className="btn-outline" onClick={() => navigate(`/profile/orders/${order.id}`)}>Xem chi tiết</button>
                          <button className="btn-review-main"
                            onClick={() => navigate(`/profile/orders/${order.id}`, { state: { openReviewSection: true } })}>
                            Đánh giá sản phẩm
                          </button>
                          <button className="btn-solid btn-buy-again">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15" style={{ marginRight: "6px" }}>
                              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.73-.73" />
                            </svg>
                            Mua lại
                          </button>
                        </>
                      )}
                      {order.status === "shipping" && (
                        <>
                          <button className="btn-outline" onClick={() => navigate(`/profile/orders/${order.id}`)}>Xem chi tiết</button>
                        </>
                      )}
                      {order.status === "cancelled" && (
                        <>
                          <button className="btn-outline">Trung tâm hỗ trợ</button>
                          <button className="btn-gray" onClick={() => navigate(`/profile/orders/${order.id}`)}>Chi tiết</button>
                        </>
                      )}
                      {order.status !== "delivered" && order.status !== "shipping" && order.status !== "cancelled" && (
                        <>
                          <button className="btn-outline">Liên hệ nhà vườn</button>
                          <button className="btn-outline" onClick={() => navigate(`/profile/orders/${order.id}`)}>Xem chi tiết</button>
                          {order.status === "pending" && (
                            <button
                              className="btn-danger-outline"
                              onClick={() => handleCancelClick(order.id)}
                            >
                              Hủy đơn hàng
                            </button>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="pagination-wrap">
            <button
              className="page-nav-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              aria-label="Trang trước"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-num-btn ${currentPage === page ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="page-nav-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              aria-label="Trang sau"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* Custom Toast Alert */}
      {toastMessage && (
        <div className="toast-notification">
          <span className="toast-icon">✅</span>
          <span className="toast-text">{toastMessage}</span>
        </div>
      )}

      {/* ── CANCEL ORDER MODAL ── */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">Xác nhận hủy đơn hàng</h3>
            <p className="modal-message" style={{ marginBottom: "16px" }}>
              Vui lòng chọn lý do hủy đơn hàng #{selectedOrderId}:
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
              <button className="modal-btn-confirm" onClick={handleCancelConfirm}>
                Xác nhận hủy đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </ProfileLayout>
  );
};

export default MyOrders;

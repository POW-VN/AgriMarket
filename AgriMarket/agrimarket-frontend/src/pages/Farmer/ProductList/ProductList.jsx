import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFarmerProducts, deleteFarmerProduct } from "../../../services/productService";
import Footer from "../../../components/common/Footer/Footer";
import "./ProductList.css";

// ── Nav items (shared sidebar) ──────────────────────────────
const NAV_ITEMS = [
  { icon: "home",     label: "Trang chủ",          path: "/" },
  { icon: "profile",  label: "Hồ sơ",              path: "/profile" },
  { icon: "product",  label: "Sản phẩm",           path: "/farmer/products", active: true },
  { icon: "security", label: "Bảo mật",            path: "/security" },
  { icon: "bell",     label: "Thông báo",           path: "/farmer/notifications" },
  { icon: "history",  label: "Lịch sử giao dịch",  path: "/farmer/orders" },
];

// Mock data removed in favor of real API calls

const STATUS_CONFIG = {
  approved:     { label: "Đã duyệt",   cls: "st-approved" },
  pending:      { label: "Chờ duyệt",  cls: "st-pending" },
  draft:        { label: "Bản nháp",   cls: "st-draft" },
  out_of_stock: { label: "Hết hàng",   cls: "st-out" },
  hidden:       { label: "Đã ẩn",      cls: "st-hidden" },
  rejected:     { label: "Bị từ chối", cls: "st-rejected" },
};

const TABS = [
  { key: "all",          label: "Tất cả sản phẩm" },
  { key: "approved",     label: "Đã duyệt" },
  { key: "pending",      label: "Chờ duyệt" },
  { key: "draft",        label: "Bản nháp" },
  { key: "out_of_stock", label: "Hết hàng" },
  { key: "hidden",       label: "Đã ẩn" },
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
export const ProductList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: "", message: "", onConfirm: null });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  useEffect(() => {
    const successMsg = sessionStorage.getItem("product_success_message");
    if (successMsg) {
      showToast(successMsg, "success");
      sessionStorage.removeItem("product_success_message");
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getFarmerProducts();
      setProducts(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  const [currentUser, setCurrentUser] = useState(() => {
    const userStr = localStorage.getItem("farmconnect_user");
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  });

  const getRoleLabel = (role) => {
    const roles = {
      farmer: "Nông dân",
      customer: "Khách hàng",
      admin: "Quản trị viên"
    };
    return roles[role] || "Nông dân";
  };

  const filtered = products.filter((p) => {
    const matchTab = activeTab === "all" || p.status === activeTab;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.id.toString().toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedProducts = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const tabCount = (key) => key === "all"
    ? products.length
    : products.filter(p => p.status === key).length;

  const handleDelete = (id) => {
    const prod = products.find(p => p.id === id);
    const prodName = prod ? prod.name : "này";
    setConfirmModal({
      show: true,
      title: "Xác nhận xóa",
      message: `Bạn có chắc muốn xoá sản phẩm "${prodName}" không? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          await deleteFarmerProduct(id);
          setProducts(prev => prev.filter(p => p.id !== id));
          showToast("Xóa sản phẩm thành công!", "success");
        } catch (err) {
          console.error("Lỗi khi xóa sản phẩm:", err);
          showToast("Xóa sản phẩm thất bại: " + (err.response?.data || err.message), "error");
        }
      }
    });
  };

  const formatPrice = (price, unit) =>
    `${price.toLocaleString("vi-VN")} đ / ${unit}`;

  return (
    <div className="pl-page">
      {/* ── SIDEBAR ── */}
      <aside className="pl-sidebar">
        <div className="pl-sidebar-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
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
          <span className="pl-logo-text">AgriMarket</span>
        </div>

        <div className="pl-sidebar-user">
          <div className="pl-user-avatar">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Avatar" className="pl-user-avatar-img" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            )}
          </div>
          <div className="pl-user-info">
            <span className="pl-user-greeting">Xin chào,</span>
            <span className="pl-user-name">{currentUser?.fullName || "Khách"}</span>
            <span className="pl-user-role">{getRoleLabel(currentUser?.role)}</span>
          </div>
        </div>

        <nav className="pl-sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={`pl-nav-item ${item.active ? "pl-nav-active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="pl-nav-icon"><NavIcon type={item.icon} /></span>
              <span className="pl-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <div className="pl-main">
        {/* Top bar */}
        <header className="pl-topbar">
          <div className="pl-topbar-left">
            <h1 className="pl-title">Quản lý sản phẩm</h1>
            <p className="pl-subtitle">Quản lý danh sách sản phẩm, tồn kho, giá bán và trạng thái hiển thị.</p>
          </div>
          <div className="pl-search-wrap">
            <svg className="pl-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="pl-search-input"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {/* Filter tabs */}
        <div className="pl-tabs">
          {TABS.map((tab) => {
            const count = tabCount(tab.key);
            return (
              <button
                key={tab.key}
                className={`pl-tab ${activeTab === tab.key ? "pl-tab-active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                {count > 0 && <span className="pl-tab-count">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Product table */}
        <div className="pl-table-wrap">
          <table className="pl-table">
            <thead>
              <tr>
                <th>SẢN PHẨM</th>
                <th>DANH MỤC</th>
                <th>TỒN KHO</th>
                <th>GIÁ BÁN</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="pl-empty">Đang tải danh sách sản phẩm...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="pl-empty">Không có sản phẩm nào.</td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const st = STATUS_CONFIG[p.status];
                  return (
                    <tr key={p.id} className="pl-row">
                      <td>
                        <div className="pl-product-cell">
                          <div className="pl-product-thumb">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px" }} />
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" width="18" height="18">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                              </svg>
                            )}
                          </div>
                          <div>
                            <span className="pl-product-name">{p.name}</span>
                            <span className="pl-product-id">Mã SP: {p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="pl-td-muted">{p.category}</td>
                      <td className={`pl-td-stock ${p.stock === 0 ? "pl-stock-zero" : ""}`}>
                        {p.stock} {p.unit}
                      </td>
                      <td className="pl-td-muted">{formatPrice(p.price, p.unit)}</td>
                      <td>
                        <span className={`pl-status-badge ${st.cls}`}>{st.label}</span>
                      </td>
                      <td>
                        <div className="pl-actions">
                          <button className="pl-action-btn pl-action-edit" title="Chỉnh sửa"
                            onClick={() => navigate(`/farmer/products/add`)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button className="pl-action-btn pl-action-copy" title="Nhân bản">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                            </svg>
                          </button>
                          <button className="pl-action-btn pl-action-delete" title="Xoá"
                            onClick={() => handleDelete(p.id)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          {!loading && filtered.length > 0 && (
            <div className="pl-pagination-footer">
              <p className="pl-pagination-summary">
                Hiển thị {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} trong tổng số {filtered.length} sản phẩm
              </p>
              <div className="pl-pagination-controls">
                <button
                  className="pl-page-btn"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>
                <span className="pl-page-info">Trang {currentPage} / {totalPages}</span>
                <button
                  className="pl-page-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Floating add button */}
        <button className="pl-fab" onClick={() => navigate("/farmer/products/add")}>
          + Thêm sản phẩm mới
        </button>
        <Footer />
      </div>

      {/* Custom Confirm Modal */}
      {confirmModal.show && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="custom-modal-header">
              <span className="custom-modal-icon">⚠️</span>
              <h3>{confirmModal.title}</h3>
            </div>
            <p className="custom-modal-message">{confirmModal.message}</p>
            <div className="custom-modal-actions">
              <button className="custom-btn-cancel" onClick={() => setConfirmModal({ show: false })}>
                Hủy bỏ
              </button>
              <button className="custom-btn-confirm" onClick={() => { confirmModal.onConfirm(); setConfirmModal({ show: false }); }}>
                Xác nhận
              </button>
            </div>
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

export default ProductList;

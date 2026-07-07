import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, AlertTriangle, XCircle, CheckCircle2, Trash2, Pencil, Ban } from "lucide-react";
import * as productService from "../../../services/productService";
import "./ProductList.css";

const PRODUCT_STATUS_CONFIG = {
  approved:     { label: "Đã duyệt",   cls: "st-approved" },
  pending:      { label: "Chờ duyệt",  cls: "st-pending" },
  draft:        { label: "Bản nháp",   cls: "st-draft" },
  out_of_stock: { label: "Hết hàng",   cls: "st-out" },
  hidden:       { label: "Đã ẩn",      cls: "st-hidden" },
  rejected:     { label: "Bị từ chối", cls: "st-rejected" },
  request_changes: { label: "Cần sửa đổi", cls: "st-changes" },
};

export const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [productActiveTab, setProductActiveTab] = useState("all");
  const [productCurrentPage, setProductCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 8;

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: "", message: "", onConfirm: null });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
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
    setLoading(true);
    try {
      const data = await productService.getFarmerProducts();
      setProducts(data);
    } catch (err) {
      console.error("Lỗi khi tải sản phẩm:", err);
      showToast("Không thể tải danh sách sản phẩm.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProductDelete = (id) => {
    const prod = products.find(p => p.id === id);
    const name = prod ? prod.name : "này";
    setConfirmModal({
      show: true,
      title: "Xác nhận xóa sản phẩm",
      message: `Bạn có chắc chắn muốn xóa sản phẩm "${name}" không? Hành động này sẽ gỡ sản phẩm vĩnh viễn khỏi hệ thống.`,
      onConfirm: async () => {
        try {
          await productService.deleteFarmerProduct(id);
          setProducts(prev => prev.filter(p => p.id !== id));
          showToast("Xóa sản phẩm thành công!", "success");
        } catch (err) {
          console.error(err);
          showToast("Xóa sản phẩm thất bại: " + (err.response?.data || err.message), "error");
        }
      }
    });
  };

  const getEffectiveStatus = (p) => {
    if (p.status === "sold_out" || p.status === "out_of_stock") {
      return "out_of_stock";
    }
    if (p.status === "approved" && Number(p.stock) === 0) {
      return "out_of_stock";
    }
    return p.status;
  };

  // Filter & Page products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.id.toString().includes(productSearch);
      const matchTab = productActiveTab === "all" || getEffectiveStatus(p) === productActiveTab;
      return matchSearch && matchTab;
    });
  }, [products, productSearch, productActiveTab]);

  const totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice((productCurrentPage - 1) * PRODUCTS_PER_PAGE, productCurrentPage * PRODUCTS_PER_PAGE);
  }, [filteredProducts, productCurrentPage]);

  useEffect(() => {
    setProductCurrentPage(1);
  }, [productSearch, productActiveTab]);

  return (
    <div className="fd-products-tab" style={{ padding: "0 4px" }}>
      {/* Filter Toolbar */}
      <div className="fd-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm hoặc ID..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={() => navigate("/farmer/products/add")}>
          + Thêm sản phẩm mới
        </button>
      </div>

      {/* Filter Status Pills */}
      <div className="fd-tabs-filter">
        {["all", "approved", "pending", "request_changes", "rejected", "draft", "out_of_stock", "hidden"].map(statusKey => {
          const count = statusKey === "all" ? products.length : products.filter(p => getEffectiveStatus(p) === statusKey).length;
          const label = statusKey === "all" ? "Tất cả" : PRODUCT_STATUS_CONFIG[statusKey]?.label;
          return (
            <button
              key={statusKey}
              className={`filter-pill ${productActiveTab === statusKey ? "active" : ""}`}
              onClick={() => setProductActiveTab(statusKey)}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="fd-table-wrapper">
        <table className="fd-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Đơn giá</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="loading-state">Đang tải sản phẩm...</td></tr>
            ) : paginatedProducts.length === 0 ? (
              <tr><td colSpan="7" className="empty-state">Không có sản phẩm nào.</td></tr>
            ) : (
              paginatedProducts.map(p => {
                const conf = PRODUCT_STATUS_CONFIG[getEffectiveStatus(p)] || { label: p.status, cls: "" };
                return (
                  <tr key={p.id} className="row-hover">
                    <td>
                      <div className="table-thumb">
                        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <span style={{ display: "inline-flex", alignItems: "center", color: "#81c784" }}><Sprout size={24} /></span>}
                      </div>
                    </td>
                    <td>
                      <strong>{p.name}</strong>
                      <span className="p-id">ID: {p.id}</span>
                      {p.status === "request_changes" && p.adminNotes && (
                        <div className="admin-feedback-note" style={{ color: "#c2410c", fontSize: "12px", marginTop: "6px", display: "flex", alignItems: "flex-start", gap: "6px", backgroundColor: "#fff7ed", padding: "6px 10px", borderRadius: "6px", border: "1px solid #ffedd5" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1" }}><AlertTriangle size={14} color="#c2410c" /></span>
                          <div>
                            <strong style={{ display: "block", fontSize: "11px", color: "#9a3412", marginBottom: "2px" }}>Yêu cầu sửa đổi:</strong>
                            <span style={{ fontWeight: "400", lineHeight: "1.4" }}>{p.adminNotes}</span>
                          </div>
                        </div>
                      )}
                      {p.status === "rejected" && p.rejectionReason && (
                        <div className="admin-feedback-note" style={{ color: "#991b1b", fontSize: "12px", marginTop: "6px", display: "flex", alignItems: "flex-start", gap: "6px", backgroundColor: "#fef2f2", padding: "6px 10px", borderRadius: "6px", border: "1px solid #fee2e2" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1" }}><XCircle size={14} color="#991b1b" /></span>
                          <div>
                            <strong style={{ display: "block", fontSize: "11px", color: "#991b1b", marginBottom: "2px" }}>Lý do từ chối:</strong>
                            <span style={{ fontWeight: "400", lineHeight: "1.4" }}>{p.rejectionReason}</span>
                          </div>
                        </div>
                      )}
                      {p.status === "hidden" && p.rejectionReason && (
                        <div className="admin-feedback-note" style={{ color: "#c2410c", fontSize: "12px", marginTop: "6px", display: "flex", alignItems: "flex-start", gap: "6px", backgroundColor: "#fff7ed", padding: "6px 10px", borderRadius: "6px", border: "1px solid #ffedd5" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1" }}><Ban size={14} color="#9a3412" /></span>
                          <div>
                            <strong style={{ display: "block", fontSize: "11px", color: "#9a3412", marginBottom: "2px" }}>Lý do ẩn:</strong>
                            <span style={{ fontWeight: "400", lineHeight: "1.4" }}>{p.rejectionReason}</span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td>{p.category}</td>
                    <td>{p.price.toLocaleString("vi-VN")} đ / {p.unit}</td>
                    <td>
                      <span className={`stock-level ${p.stock <= 5 ? "warning" : ""}`}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${conf.cls}`}>{conf.label}</span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-icon edit" title="Sửa" onClick={() => navigate(`/farmer/products/edit/${p.id}`)}>
                          <Pencil size={15} />
                        </button>
                        <button className="btn-icon delete" title="Xóa" onClick={() => handleProductDelete(p.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paging */}
      {!loading && filteredProducts.length > PRODUCTS_PER_PAGE && (
        <div className="fd-pagination">
          <span className="summary">
            Hiển thị {((productCurrentPage - 1) * PRODUCTS_PER_PAGE) + 1} - {Math.min(productCurrentPage * PRODUCTS_PER_PAGE, filteredProducts.length)} trong tổng số {filteredProducts.length} sản phẩm
          </span>
          <div className="controls">
            <button
              onClick={() => setProductCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={productCurrentPage === 1}
            >
              ‹
            </button>
            <span className="info">Trang {productCurrentPage} / {totalProductPages}</span>
            <button
              onClick={() => setProductCurrentPage(prev => Math.min(totalProductPages, prev + 1))}
              disabled={productCurrentPage === totalProductPages}
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {confirmModal.show && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="custom-modal-header">
              <span className="custom-modal-icon" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}><AlertTriangle size={24} /></span>
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
            {toast.type === "success" ? <CheckCircle2 size={18} /> : toast.type === "error" ? <XCircle size={18} /> : <AlertTriangle size={18} />}
          </span>
          <span className="custom-toast-message">{toast.message}</span>
          <button className="custom-toast-close" onClick={() => setToast({ show: false })}>×</button>
        </div>
      )}
    </div>
  );
};

export default ProductList;

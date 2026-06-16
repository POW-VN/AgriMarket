// src/pages/Product/ProductPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductPage.css";
import { getFarmerProducts, deleteFarmerProduct } from "../../services/productService";
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import useProfile from "../../hooks/useProfile";
import Footer from "../../components/common/Footer/Footer";

export default function ProductPage() {
    const navigate = useNavigate();
    // Lấy profile trực tiếp từ hook
    const { profile, isProfileLoading } = useProfile();
    const isFarmer = profile?.role?.toLowerCase() === "farmer";

    // State quản lý danh sách sản phẩm
    const [products, setProducts] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);

    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [confirmModal, setConfirmModal] = useState({ show: false, title: "", message: "", onConfirm: null });

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "success" });
        }, 3000);
    };

    // Load products khi profile load xong và là farmer
    useEffect(() => {
        const successMsg = sessionStorage.getItem("product_success_message");
        if (successMsg) {
            showToast(successMsg, "success");
            sessionStorage.removeItem("product_success_message");
        }

        const loadProducts = async () => {
            setLoading(true);
            try {
                const data = await getFarmerProducts();
                setProducts(data);
            } catch (error) {
                console.error("Lỗi load products:", error);
            } finally {
                setLoading(false);
            }
        };

        if (isFarmer) loadProducts();
    }, [isFarmer]);

    // Filter products theo keyword và trạng thái
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const searchText = `${product.name} ${product.category} ${product.description || ""}`.toLowerCase();
            const matchesKeyword = searchText.includes(keyword.toLowerCase());

            const matchesFilter =
                activeFilter === "ALL" ||
                product.status === activeFilter;

            return matchesKeyword && matchesFilter;
        });
    }, [products, keyword, activeFilter]);

    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [keyword, activeFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const handleDelete = (productId) => {
        const prod = products.find(p => p.id === productId);
        const prodName = prod ? prod.name : "này";
        setConfirmModal({
            show: true,
            title: "Xác nhận xóa",
            message: `Bạn có chắc chắn muốn xóa sản phẩm "${prodName}" không? Hành động này không thể hoàn tác.`,
            onConfirm: async () => {
                try {
                    await deleteFarmerProduct(productId);
                    setProducts((prevProducts) => prevProducts.filter((p) => p.id !== productId));
                    showToast("Xóa sản phẩm thành công!", "success");
                } catch (error) {
                    console.error("Lỗi khi xóa sản phẩm:", error);
                    showToast(
                        error.response?.data ||
                        error.message ||
                        "Không thể xóa sản phẩm. Vui lòng thử lại sau.",
                        "error"
                    );
                }
            }
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price) + " đ";
    };

    // Render status sản phẩm
    const renderStatus = (status, stock) => {
        switch (status) {
            case "approved":
                return <span className="product-status approved">Đã duyệt</span>;
            case "pending":
                return <span className="product-status pending">Chờ duyệt</span>;
            case "draft":
                return <span className="product-status draft">Bản nháp</span>;
            case "rejected":
                return <span className="product-status rejected">Bị từ chối</span>;
            case "hidden":
                return <span className="product-status hidden">Đã ẩn</span>;
            case "sold_out":
                return <span className="product-status sold-out">Hết hàng</span>;
            default:
                return <span className="product-status draft">Không xác định</span>;
        }
    };

    // Hiển thị loading profile
    if (isProfileLoading) {
        return (
            <div className="product-loading">
                <div className="loading-spinner"></div>
                <span>Đang tải hồ sơ...</span>
            </div>
        );
    }

    // Không phải farmer → show thông báo không có quyền
    if (!isFarmer) {
        return (
            <div className="product-layout">
                <ProfileSidebar profile={profile} />
                <main className="product-main">
                    <div className="product-permission-box">
                        <h2>Không có quyền truy cập</h2>
                        <p>Chức năng quản lý sản phẩm chỉ dành cho tài khoản nông dân.</p>
                    </div>
                </main>
            </div>
        );
    }

    // Giao diện chính cho farmer
    return (
        <div className="product-layout">
            <ProfileSidebar profile={profile} />

            <main className="product-main">
                <section className="product-header">
                    <div>
                        <h1>Quản lý sản phẩm</h1>
                        <p>Quản lý danh sách sản phẩm, tồn kho, giá bán và trạng thái hiển thị.</p>
                    </div>

                    <div className="product-search-box">
                        <span>🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                </section>

                <section className="product-filter-bar">
                    <button className={activeFilter === "ALL" ? "active" : ""} onClick={() => setActiveFilter("ALL")}>
                        Tất cả sản phẩm ({products.length})
                    </button>
                    <button className={activeFilter === "approved" ? "active" : ""} onClick={() => setActiveFilter("approved")}>
                        Đã duyệt
                    </button>
                    <button className={activeFilter === "pending" ? "active" : ""} onClick={() => setActiveFilter("pending")}>
                        Chờ duyệt
                    </button>
                    <button className={activeFilter === "draft" ? "active" : ""} onClick={() => setActiveFilter("draft")}>
                        Bản nháp
                    </button>
                    <button className={activeFilter === "sold_out" ? "active" : ""} onClick={() => setActiveFilter("sold_out")}>
                        Hết hàng
                    </button>
                    <button className={activeFilter === "hidden" ? "active" : ""} onClick={() => setActiveFilter("hidden")}>
                        Đã ẩn
                    </button>
                </section>

                <section className="product-card">
                    {loading ? (
                        <div className="product-empty">Đang tải danh sách sản phẩm...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="product-empty">Không tìm thấy sản phẩm phù hợp.</div>
                    ) : (
                        <>
                            <div className="product-table-wrapper">
                                <table className="product-table">
                                    <thead>
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th>Danh mục</th>
                                            <th>Tồn kho</th>
                                            <th>Giá bán</th>
                                            <th>Trạng thái</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedProducts.map((product) => (
                                            <tr key={product.id}>
                                                <td>
                                                    <div className="product-info">
                                                        <div className="product-image">
                                                            {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span>🖼️</span>}
                                                        </div>
                                                        <div>
                                                            <h3>{product.name}</h3>
                                                            <p>Mã SP: SP-{product.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{product.category}</td>
                                                <td>
                                                    <span className={Number(product.stock) <= 0 ? "stock-danger" : ""}>
                                                        {product.stock} {product.unit}
                                                    </span>
                                                </td>
                                                <td>{formatPrice(product.price)} / {product.unit}</td>
                                                <td>{renderStatus(product.status, product.stock)}</td>
                                                <td>
                                                    <div className="product-actions">
                                                        <button title="Chỉnh sửa sản phẩm">✏️</button>
                                                        <button title="Sao chép sản phẩm">📋</button>
                                                        <button title="Xóa sản phẩm" onClick={() => handleDelete(product.id)}>🗑️</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="product-footer">
                                <p>Hiển thị {filteredProducts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} trong tổng số {filteredProducts.length} sản phẩm</p>
                                <div className="product-pagination" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        style={{ cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
                                    >‹</button>
                                    <span style={{ fontSize: "14px", fontWeight: "600" }}>Trang {currentPage} / {totalPages}</span>
                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        style={{ cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}
                                    >›</button>
                                </div>
                            </div>
                        </>
                    )}
                </section>

                <button className="add-product-floating" onClick={() => navigate("/farmer/products/add")}>＋ Thêm sản phẩm mới</button>
                <Footer />
            </main>

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
}
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header/Header";
import Footer from "../../components/common/Footer/Footer";
import { getAllApprovedProducts } from "../../services/productService";
import "./PreorderList.css";

// Sync categories with homepage
const MAIN_CATEGORIES = [
  "Cây lương thực",
  "Rau củ quả",
  "Trái cây",
  "Cây công nghiệp",
  "Chăn nuôi",
  "Giống cây trồng",
  "Nông sản chế biến",
  "Khác"
];

const VIETNAM_PROVINCES = [
  "Toàn quốc",
  "Bắc Giang",
  "Tiền Giang",
  "Lâm Đồng",
  "Bình Thuận",
  "Bến Tre",
  "Khánh Hòa",
  "Điện Biên",
  "Hưng Yên",
  "Đà Lạt"
];

const PREORDER_PRODUCTS_MOCK = [
  {
    id: "preorder-litchi",
    name: "Vải Thiều Lục Ngạn",
    category: "Trái cây",
    farmerName: "Hợp tác xã Lục Ngạn",
    farmLocation: "Bắc Giang",
    price: 45000,
    unit: "kg",
    imageUrl: "https://images.unsplash.com/photo-1587334206506-6b7c9a204390?w=600",
    progressPercent: 65,
    remainingQty: 350,
    totalQty: 1000,
    harvestDate: "15/06/2026",
    isPreorder: true,
    status: "open" // "open", "upcoming", "closed"
  },
  {
    id: "preorder-durian",
    name: "Sầu Riêng Ri6",
    category: "Trái cây",
    farmerName: "Chín Hóa (Bến Tre)",
    farmLocation: "Bến Tre",
    price: 120000,
    unit: "kg",
    imageUrl: "https://images.unsplash.com/photo-1595304675549-30113c2db7fe?w=600",
    progressPercent: 0,
    remainingQty: 2000,
    totalQty: 2000,
    harvestDate: "20/06/2026",
    openTime: "08:00 - 10/05",
    isPreorder: true,
    status: "upcoming"
  },
  {
    id: "preorder-avocado",
    name: "Bơ Sáp 034",
    category: "Trái cây",
    farmerName: "Bảo Lâm Organic",
    farmLocation: "Lâm Đồng",
    price: 65000,
    unit: "kg",
    imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600",
    progressPercent: 100,
    remainingQty: 0,
    totalQty: 500,
    harvestDate: "05/07/2026",
    isPreorder: true,
    status: "closed"
  },
  {
    id: "preorder-dragonfruit",
    name: "Thanh Long Ruột Đỏ",
    category: "Trái cây",
    farmerName: "Farm Bình Thuận",
    farmLocation: "Bình Thuận",
    price: 32000,
    unit: "kg",
    imageUrl: "https://images.unsplash.com/photo-1527324688151-0e627063f2b1?w=600",
    progressPercent: 20,
    remainingQty: 800,
    totalQty: 1000,
    harvestDate: "20/06/2026",
    isPreorder: true,
    status: "open"
  },
  {
    id: "preorder-pomelo",
    name: "Bưởi Da Xanh Bến Tre",
    category: "Trái cây",
    farmerName: "Vườn Bưởi Da Xanh",
    farmLocation: "Bến Tre",
    price: 65000,
    unit: "kg",
    imageUrl: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600",
    progressPercent: 50,
    remainingQty: 50,
    totalQty: 100,
    harvestDate: "20/10/2026",
    isPreorder: true,
    status: "open"
  },
  {
    id: "mock-2",
    name: "Cà rốt gia truyền hữu cơ",
    category: "Rau củ quả",
    farmerName: "Nông trại Green Valley",
    farmLocation: "Lâm Đồng",
    price: 112500,
    unit: "bó",
    imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600",
    progressPercent: 40,
    remainingQty: 45,
    totalQty: 75,
    harvestDate: "31/08/2026",
    isPreorder: true,
    status: "open"
  }
];

export default function PreorderList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedProvince, setSelectedProvince] = useState("Toàn quốc");
  const [selectedMonths, setSelectedMonths] = useState([]); // Array of selected months
  const [sortBy, setSortBy] = useState("newest"); // "newest", "progress", "deadline"

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  const triggerToast = (message, type = "success") => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    const fetchPreorders = async () => {
      setLoading(true);
      try {
        const approved = await getAllApprovedProducts();
        // Keep approved preorder products
        const dbPreorders = approved.filter((p) => p.isPreorder === true);

        // Normalize DB preorders to match mockup schema
        const normalizedDb = dbPreorders.map((p) => {
          const total = p.stock > 0 ? p.stock + 100 : 100;
          const remaining = p.stock || 0;
          const pct = Math.round(((total - remaining) / total) * 100);

          return {
            id: p.id,
            name: p.name,
            category: p.category,
            farmerName: p.farmerName || "Nông trại địa phương",
            farmLocation: p.farmLocation?.split(",")[0] || "Lâm Đồng",
            price: p.price,
            unit: p.unit || "kg",
            imageUrl: p.imageUrl,
            progressPercent: pct,
            remainingQty: remaining,
            totalQty: total,
            harvestDate: p.harvestDate ? new Date(p.harvestDate).toLocaleDateString("vi-VN") : "Đang cập nhật",
            isPreorder: true,
            status: remaining === 0 ? "closed" : "open"
          };
        });

        // Combine DB preorders and Mock ones (avoiding duplicates)
        const combined = [...normalizedDb];
        PREORDER_PRODUCTS_MOCK.forEach((mock) => {
          if (!combined.some((p) => String(p.id) === String(mock.id))) {
            combined.push(mock);
          }
        });

        setProducts(combined);
      } catch (err) {
        console.error("Lỗi khi load danh sách đặt trước:", err);
        setProducts(PREORDER_PRODUCTS_MOCK);
      } finally {
        setLoading(false);
      }
    };

    fetchPreorders();
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== "ALL") {
          if (selectedCategory === "Khác") {
            return !MAIN_CATEGORIES.slice(0, 7).includes(p.category);
          }
          return p.category === selectedCategory;
        }
        return true;
      })
      .filter((p) => {
        // Location filter
        if (selectedProvince !== "Toàn quốc") {
          return p.farmLocation.toLowerCase().includes(selectedProvince.toLowerCase());
        }
        return true;
      })
      .filter((p) => {
        // Month filter (multi-select)
        if (selectedMonths.length > 0) {
          if (!p.harvestDate) return false;
          // Parse harvest date (format DD/MM/YYYY or YYYY-MM-DD)
          const parts = p.harvestDate.split("/");
          let m = null;
          if (parts.length === 3) {
            m = parseInt(parts[1], 10);
          } else {
            const dateObj = new Date(p.harvestDate);
            if (!isNaN(dateObj.getTime())) {
              m = dateObj.getMonth() + 1;
            }
          }
          return m !== null && selectedMonths.includes(m);
        }
        return true;
      })
      .sort((a, b) => {
        // Sort logic
        if (sortBy === "newest") {
          return String(b.id).localeCompare(String(a.id));
        }
        if (sortBy === "progress") {
          return b.progressPercent - a.progressPercent;
        }
        if (sortBy === "deadline") {
          return String(a.harvestDate).localeCompare(String(b.harvestDate));
        }
        return 0;
      });
  }, [products, selectedCategory, selectedProvince, selectedMonths, sortBy]);

  const handleNotifyMe = (productName, e) => {
    e.preventDefault();
    e.stopPropagation();
    triggerToast(`Đăng ký thành công! Bạn sẽ nhận được thông báo qua email khi sản phẩm "${productName}" mở bán.`, "success");
  };

  return (
    <div className="preorder-list-page">
      <Header activeTab="preorder" />

      {/* Hero Banner Section */}
      <section className="preorder-hero">
        <div className="preorder-hero-banner">
          <div className="preorder-hero-overlay"></div>
          <div className="preorder-hero-content">
            <h1 className="preorder-hero-title">Đặt Trước Nông Sản Mùa Vụ</h1>
            <p className="preorder-hero-subtitle">
              Nhận giá ưu đãi nhất trực tiếp từ nhà vườn. Đảm bảo nguồn cung tươi sạch, đúng vụ cho gia đình và doanh nghiệp.
            </p>
            <div className="preorder-hero-buttons">
              <a href="#preorder-section" className="hero-btn-primary">Xem các loại đang mở</a>
              <a href="#filter-bar" className="hero-btn-secondary">Lọc sản phẩm</a>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Selection Section */}
      <section id="filter-bar" className="preorder-filter-section">
        <div className="preorder-filter-container">
          <div className="filter-dropdown-group">
            <div className="filter-item">
              <label>Loại sản phẩm</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">Tất cả sản phẩm</option>
                {MAIN_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Tỉnh / Thành phố</label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="filter-select"
              >
                {VIETNAM_PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-months-group">
            <label className="months-label">Tháng thu hoạch</label>
            <div className="months-pills">
              <button
                className={`month-pill-btn ${selectedMonths.length === 0 ? "active" : ""}`}
                onClick={() => setSelectedMonths([])}
              >
                Tất cả
              </button>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
                const isSelected = selectedMonths.includes(m);
                return (
                  <button
                    key={m}
                    className={`month-pill-btn ${isSelected ? "active" : ""}`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedMonths(selectedMonths.filter((x) => x !== m));
                      } else {
                        setSelectedMonths([...selectedMonths, m]);
                      }
                    }}
                  >
                    Tháng {m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Preorder Products Grid Section */}
      <section id="preorder-section" className="preorder-products-section">
        <div className="preorder-products-header">
          <h2 className="preorder-section-title-text">Sản phẩm Đang Nhận Đặt Trước</h2>
          <div className="preorder-sort-container">
            <span className="sort-icon">⇅</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Sắp xếp: Mới nhất</option>
              <option value="progress">Sắp xếp: Đã đặt nhiều nhất</option>
              <option value="deadline">Sắp xếp: Hạn thu hoạch gần nhất</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="preorder-loading-box">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách đặt trước...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="preorder-empty-box">
            <p>Không tìm thấy nông sản đặt trước nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <div className="preorder-grid">
            {filteredProducts.map((p) => {
              const isClosed = p.status === "closed";
              const isUpcoming = p.status === "upcoming";
              const isOpen = p.status === "open";

              return (
                <div
                  key={p.id}
                  className={`preorder-item-card ${isClosed ? "closed-card" : ""}`}
                  onClick={() => {
                    if (!isClosed) {
                      navigate(`/products/${p.id}`);
                    }
                  }}
                >
                  {/* Image and Badges */}
                  <div className="card-image-container">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className={`preorder-card-img ${isClosed ? "greyscale-img" : ""}`}
                    />
                    {isClosed && (
                      <div className="card-sold-out-overlay">
                        <span className="sold-out-text-badge">Hết suất đặt</span>
                      </div>
                    )}

                    {/* Preorder Status Badge */}
                    {isOpen && (
                      <span className="preorder-status-badge status-open">Đang nhận đặt</span>
                    )}
                    {isUpcoming && (
                      <span className="preorder-status-badge status-upcoming">Sắp mở bán</span>
                    )}
                    {isClosed && (
                      <span className="preorder-status-badge status-closed">Hết suất đặt</span>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="card-info-body">
                    <h3 className="preorder-card-title-text">{p.name}</h3>
                    <p className="preorder-card-farmer">Nhà vườn: {p.farmerName}</p>

                    {/* Progress indicator */}
                    <div className="preorder-progress-wrapper">
                      <div className="progress-labels">
                        <span className="progress-left">Đã đặt {p.progressPercent}%</span>
                        <span className="progress-right">
                          {isClosed ? "Hết hàng" : `Còn ${p.remainingQty} ${p.unit}`}
                        </span>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar-bar"
                          style={{ width: `${p.progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Cost and Dates */}
                    <div className="preorder-meta-info">
                      <div className="meta-price-box">
                        <span className="price-label">
                          {isClosed ? "GIÁ ĐÃ BÁN" : "GIÁ DỰ KIẾN"}
                        </span>
                        <span className="price-value">
                          {p.price.toLocaleString("vi-VN")}đ
                          <span className="price-unit">/{p.unit}</span>
                        </span>
                      </div>

                      <div className="meta-date-box">
                        {isUpcoming ? (
                          <>
                            <span className="date-label">MỞ BÁN LÚC</span>
                            <span className="date-value">{p.openTime || "Đang cập nhật"}</span>
                          </>
                        ) : (
                          <>
                            <span className="date-label">THU HOẠCH</span>
                            <span className="date-value">{p.harvestDate}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="preorder-card-actions">
                      {isOpen && (
                        <button
                          type="button"
                          className="action-btn-preorder-now"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/products/${p.id}`);
                          }}
                        >
                          Đặt trước ngay
                        </button>
                      )}
                      {isUpcoming && (
                        <button
                          type="button"
                          className="action-btn-notify"
                          onClick={(e) => handleNotifyMe(p.name, e)}
                        >
                          Nhận thông báo
                        </button>
                      )}
                      {isClosed && (
                        <button type="button" className="action-btn-ended" disabled>
                          Đã kết thúc
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="preorder-view-more-container">
          <button
            type="button"
            className="view-more-preorders-btn"
            onClick={() => triggerToast("Bạn đang xem tất cả sản phẩm đặt trước có sẵn.", "info")}
          >
            Xem thêm nông sản khác
          </button>
        </div>
      </section>

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`custom-toast ${t.type}`}>
            <span className="custom-toast-icon">
              {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "⚠️"}
            </span>
            <span className="custom-toast-message">{t.message}</span>
            <button
              className="custom-toast-close"
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}

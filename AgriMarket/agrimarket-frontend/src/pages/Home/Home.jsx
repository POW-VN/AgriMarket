import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { getAllApprovedProducts } from "../../services/productService";
import cartService from "../../services/cartService";
import "./Home.css";
import NotificationBell from "../../components/common/NotificationBell/NotificationBell";
import Header from "../../components/common/Header/Header";

// Import local images
import heroBanner from "./assets/hero_banner.png";


const MAIN_CATEGORIES = [
  { name: "Cây lương thực", icon: "🌾" },
  { name: "Rau củ quả", icon: "🥕" },
  { name: "Trái cây", icon: "🍎" },
  { name: "Cây công nghiệp", icon: "🪵" },
  { name: "Chăn nuôi", icon: "🐖" },
  { name: "Giống cây trồng", icon: "🌱" },
  { name: "Nông sản chế biến", icon: "🥫" },
  { name: "Khác", icon: "📦" }
];

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Rau củ quả");
  const [loading, setLoading] = useState(true);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    // Check login state
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Fetch approved products
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getAllApprovedProducts();
        setProducts(data);
      } catch (err) {
        console.error("Lỗi khi load sản phẩm trang chủ:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();

    // Fetch cart count
    const fetchCartCount = async () => {
      if (currentUser) {
        try {
          const cart = await cartService.getCart();
          setCartItemsCount(cart.length);
        } catch (err) {
          console.error("Lỗi khi load giỏ hàng:", err);
          loadLocalCartCount();
        }
      } else {
        loadLocalCartCount();
      }
    };

    const loadLocalCartCount = () => {
      const savedCart = JSON.parse(localStorage.getItem("agrimarket_cart")) || [];
      setCartItemsCount(savedCart.length);
    };

    fetchCartCount();
  }, []);

  const displayProducts = products;

  const filteredProducts = displayProducts.filter((product) => {
    const mainNames = ["Cây lương thực", "Rau củ quả", "Trái cây", "Cây công nghiệp", "Chăn nuôi", "Giống cây trồng", "Nông sản chế biến"];
    if (selectedCategory === "Khác") {
      return !mainNames.includes(product.category);
    }
    return product.category === selectedCategory;
  });

  const featuredProducts = [...displayProducts]
    .sort((a, b) => {
      if (b.sold !== a.sold) {
        return b.sold - a.sold;
      }
      return b.rating - a.rating;
    })
    .slice(0, 6);
  const renderProductCard = (p, isBestSeller = false) => {
    return (
      <Link 
        key={p.id} 
        to={`/products/${p.id}`} 
        className={`product-card standard-card ${isBestSeller ? "best-seller-card" : ""}`}
        style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column" }}
      >
        <div 
          className="card-img-wrapper" 
          style={{ height: "200px", overflow: "hidden", position: "relative" }}
        >
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="standard-card-img" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0fdf4", color: "#16a34a", fontSize: "40px" }}>
              🌾
            </div>
          )}
          {isBestSeller && <span className="tag-pill tag-bestseller" style={{ position: "absolute", top: "10px", right: "10px", zIndex: 2 }}>🔥 Bán chạy nhất</span>}
        </div>
        <div className="card-body">
          <span className="card-category">{p.category}</span>
          <h3 
            className="standard-card-title" 
            title={p.name}
          >
            {isBestSeller && <span className="bestseller-crown">🏆 </span>}
            {p.name}
          </h3>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px", marginBottom: "4px" }}>
            {(p.isOrganic || p.farmerOrganicUrl) && (
              <span className="tag-pill tag-organic" style={{ 
                backgroundColor: "#e8f5e9", 
                color: "#2e7d32", 
                fontSize: "10px", 
                fontWeight: "700", 
                padding: "2px 6px", 
                borderRadius: "4px",
                border: "1px solid #c8e6c9",
                display: "inline-block"
              }}>
                Hữu cơ
              </span>
            )}
            {p.farmerVietgapUrl && (
              <span className="tag-pill tag-vietgap" style={{ 
                backgroundColor: "#e0f2fe", 
                color: "#0369a1", 
                fontSize: "10px", 
                fontWeight: "700", 
                padding: "2px 6px", 
                borderRadius: "4px",
                border: "1px solid #bae6fd",
                display: "inline-block"
              }}>
                VietGAP
              </span>
            )}
            {p.farmerGlobalgapUrl && (
              <span className="tag-pill tag-globalgap" style={{ 
                backgroundColor: "#fee2e2", 
                color: "#b91c1c", 
                fontSize: "10px", 
                fontWeight: "700", 
                padding: "2px 6px", 
                borderRadius: "4px",
                border: "1px solid #fecaca",
                display: "inline-block"
              }}>
                GlobalGAP
              </span>
            )}
          </div>
          
          {/* Rating and Sold */}
          <div className="product-rating-sold">
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star-icon ${star <= Math.round(p.rating) ? "filled" : ""}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="rating-val">{p.rating}</span>
            <span className="divider">•</span>
            <span className={`sold-count ${isBestSeller ? "bestseller-sold" : ""}`}>Đã bán {p.sold}</span>
          </div>

          <p className="standard-card-farm">{p.farmerName || "Nông trại địa phương"}</p>
          <div className="card-footer">
            <p className="standard-card-price">
              {p.price.toLocaleString("vi-VN")} đ <span className="unit">/ {p.unit}</span>
            </p>
            {(!user || user.role !== "admin") && (
              <button 
                className="add-cart-btn-plus" 
                aria-label="Thêm vào giỏ hàng"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/products/${p.id}`);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
      </Link>
    );
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate("/"); // Refresh or redirect to home page
  };

  return (
    <div className="home-page">
      <Header activeTab="home" />

      <main className="home-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-banner-container" style={{ backgroundImage: `url(${heroBanner})` }}>
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <span className="hero-tag">VỤ MÙA THU HOẠCH</span>
              <h1 className="hero-title">Tươi sạch từ ruộng vườn đến bàn ăn của bạn.</h1>
              <p className="hero-subtitle">
                Khám phá danh sách rau củ hữu cơ, táo vườn giòn ngọt và rau xanh tươi mát tuần này, được thu hoạch trực tiếp từ các trang trại địa phương bền vững.
              </p>
              <button className="hero-btn" onClick={() => navigate("/shop")}>
                Mua theo mùa <span className="arrow">→</span>
              </button>
            </div>
          </div>
        </section>

        {/* Nông sản nổi bật Section */}
        <section className="featured-section">
          <div className="featured-header">
            <div>
              <h2 className="section-title">Nông sản nổi bật</h2>
              <p className="section-subtitle">Top sản phẩm bán chạy có đánh giá cao nhất hệ thống.</p>
            </div>
            <Link to="/shop" className="view-all-link">
              Xem tất cả <span className="arrow">→</span>
            </Link>
          </div>

          <div className="products-grid">
            {loading ? (
              <div className="product-empty" style={{ width: "100%", padding: "40px", gridColumn: "1 / -1", textAlign: "center", color: "#9ca3af" }}>
                Đang tải danh sách sản phẩm...
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="product-empty" style={{ width: "100%", padding: "60px 40px", gridColumn: "1 / -1", textAlign: "center", color: "#6b7280", background: "#f9fafb", borderRadius: "16px", border: "1.5px dashed #e5e7eb" }}>
                Chưa có nông sản nổi bật nào.
              </div>
            ) : (
              featuredProducts.map((p, idx) => renderProductCard(p, idx === 0))
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section className="categories-section">
          <h2 className="section-title">Duyệt theo danh mục</h2>
          <div className="categories-grid">
            {MAIN_CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                className={`category-pill ${selectedCategory === cat.name ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.name)}
                style={{ cursor: "pointer" }}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </div>
            ))}
          </div>

          <div className="category-products-container" style={{ marginTop: "24px" }}>
            <div className="products-grid">
              {loading ? (
                <div className="product-empty" style={{ width: "100%", padding: "40px", gridColumn: "1 / -1", textAlign: "center", color: "#9ca3af" }}>
                  Đang tải danh sách sản phẩm...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="product-empty" style={{ width: "100%", padding: "60px 40px", gridColumn: "1 / -1", textAlign: "center", color: "#6b7280", background: "#f9fafb", borderRadius: "16px", border: "1.5px dashed #e5e7eb" }}>
                  Chưa có sản phẩm nào thuộc danh mục "{selectedCategory}".
                </div>
              ) : (
                filteredProducts.map((p) => renderProductCard(p, false))
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
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

export default Home;

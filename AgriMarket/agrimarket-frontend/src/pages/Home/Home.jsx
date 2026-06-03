import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { getAllApprovedProducts } from "../../services/productService";
import "./Home.css";

// Import local images
import heroBanner from "./assets/hero_banner.png";
import heirloomTomatoes from "./assets/heirloom_tomatoes.png";
import bunchedCarrots from "./assets/bunched_carrots.png";
import honeycrispApples from "./assets/honeycrisp_apples.png";

const MAIN_CATEGORIES = [
  { name: "Cây lương thực", icon: "🌾" },
  { name: "Rau củ quả", icon: "🥕" },
  { name: "Trái cây", icon: "🍎" },
  { name: "Cây công nghiệp", icon: "🪵" },
  { name: "Nông sản hữu cơ", icon: "🌿" },
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
  }, []);

  const displayProducts = products.length > 0 ? products : [
    {
      id: "mock-1",
      name: "Cà chua Heirloom hữu cơ",
      category: "Rau củ quả",
      price: 49900,
      unit: "kg",
      isOrganic: true,
      imageUrl: heirloomTomatoes,
      rating: 4.8,
      sold: 120
    },
    {
      id: "mock-2",
      name: "Cà rốt tươi Đà Lạt",
      category: "Rau củ quả",
      price: 25000,
      unit: "bó",
      isOrganic: true,
      imageUrl: bunchedCarrots,
      rating: 4.5,
      sold: 85
    },
    {
      id: "mock-3",
      name: "Táo Honeycrisp giòn ngọt",
      category: "Trái cây",
      price: 69000,
      unit: "kg",
      isOrganic: false,
      imageUrl: honeycrispApples,
      rating: 4.9,
      sold: 210
    },
    {
      id: "mock-4",
      name: "Gạo Tám Xoan Điện Biên",
      category: "Cây lương thực",
      price: 32000,
      unit: "kg",
      isOrganic: true,
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600",
      rating: 4.7,
      sold: 340
    },
    {
      id: "mock-5",
      name: "Dâu tây sạch loại A",
      category: "Trái cây",
      price: 150000,
      unit: "hộp",
      isOrganic: true,
      imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600",
      rating: 4.9,
      sold: 400
    },
    {
      id: "mock-6",
      name: "Mật ong hoa nhãn nguyên chất",
      category: "Nông sản chế biến",
      price: 180000,
      unit: "chai",
      isOrganic: false,
      imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600",
      rating: 4.6,
      sold: 150
    },
    {
      id: "mock-7",
      name: "Hạt tiêu đen chín đỏ",
      category: "Cây công nghiệp",
      price: 95000,
      unit: "hộp",
      isOrganic: true,
      imageUrl: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600",
      rating: 4.4,
      sold: 95
    },
    {
      id: "mock-8",
      name: "Trà ô long thượng hạng",
      category: "Nông sản hữu cơ",
      price: 250000,
      unit: "hộp",
      isOrganic: true,
      imageUrl: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600",
      rating: 4.8,
      sold: 180
    },
    {
      id: "mock-9",
      name: "Thịt heo rừng lai hữu cơ",
      category: "Chăn nuôi",
      price: 160000,
      unit: "kg",
      isOrganic: true,
      imageUrl: "https://images.unsplash.com/photo-1602491453977-63a5385166cf?w=600",
      rating: 4.5,
      sold: 70
    },
    {
      id: "mock-10",
      name: "Giống xoài cát Hòa Lộc",
      category: "Giống cây trồng",
      price: 45000,
      unit: "cây",
      isOrganic: false,
      imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600",
      rating: 4.3,
      sold: 50
    }
  ];

  const filteredProducts = displayProducts.filter((product) => {
    const mainNames = ["Cây lương thực", "Rau củ quả", "Trái cây", "Cây công nghiệp", "Nông sản hữu cơ", "Chăn nuôi", "Giống cây trồng", "Nông sản chế biến"];
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
      <div key={p.id} className={`product-card standard-card ${isBestSeller ? "best-seller-card" : ""}`}>
        <div className="card-img-wrapper" style={{ height: "200px", overflow: "hidden", position: "relative" }}>
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="standard-card-img" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0fdf4", color: "#16a34a", fontSize: "40px" }}>
              🌾
            </div>
          )}
          {p.isOrganic && <span className="tag-pill tag-organic" style={{ position: "absolute", top: "10px", left: "10px", zIndex: 1 }}>Hữu cơ</span>}
          {isBestSeller && <span className="tag-pill tag-bestseller" style={{ position: "absolute", top: "10px", right: "10px", zIndex: 2 }}>🔥 Bán chạy nhất</span>}
        </div>
        <div className="card-body">
          <span className="card-category">{p.category}</span>
          <h3 className="standard-card-title" title={p.name}>
            {isBestSeller && <span className="bestseller-crown">🏆 </span>}
            {p.name}
          </h3>
          
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

          <p className="standard-card-farm">Nông trại địa phương</p>
          <div className="card-footer">
            <p className="standard-card-price">
              {p.price.toLocaleString("vi-VN")} đ <span className="unit">/ {p.unit}</span>
            </p>
            {(!user || user.role !== "farmer") && (
              <button className="add-cart-btn-plus" aria-label="Thêm vào giỏ hàng">
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
      </div>
    );
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate("/"); // Refresh or redirect to home page
  };

  return (
    <div className="home-page">
      {/* Header / Navbar */}
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
            <Link to="/" className="nav-link active">Trang chủ</Link>
            <Link to="/shop" className="nav-link">Cửa hàng</Link>
            <Link to="/farms" className="nav-link">Nông trại</Link>
            <Link to="/about" className="nav-link">Giới thiệu</Link>
          </nav>

          <div className="header-actions">
            {/* Search Icon */}
            <button className="icon-btn" aria-label="Tìm kiếm">
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
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            {/* Cart Icon */}
            {user && user.role !== "farmer" && (
              <button className="icon-btn" aria-label="Giỏ hàng">
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
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </button>
            )}

            {/* Profile & Auth Info */}
            {user ? (
              <div className="auth-profile-container">
                <div className="profile-indicator" onClick={() => navigate("/profile")} title="Xem hồ sơ">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="avatar-img" />
                  ) : (
                    <div className="avatar-fallback">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="profile-name">{user.fullName}</span>
                </div>
                <button className="btn-auth btn-logout" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="auth-profile-container">
                <button className="btn-auth btn-login" onClick={() => navigate("/login")}>
                  Đăng nhập
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

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

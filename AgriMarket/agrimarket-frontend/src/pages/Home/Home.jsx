import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import "./Home.css";

// Import local images
import heroBanner from "./assets/hero_banner.png";
import heirloomTomatoes from "./assets/heirloom_tomatoes.png";
import bunchedCarrots from "./assets/bunched_carrots.png";
import honeycrispApples from "./assets/honeycrisp_apples.png";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check login state
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

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
            <span className="logo-text">FarmConnect</span>
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
                <button className="icon-btn-profile" onClick={() => navigate("/login")} title="Tài khoản">
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
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>
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

        {/* Categories Section */}
        <section className="categories-section">
          <h2 className="section-title">Duyệt theo danh mục</h2>
          <div className="categories-grid">
            <div className="category-pill active">
              <span className="category-icon">🌿</span>
              <span className="category-name">Rau củ</span>
            </div>
            <div className="category-pill">
              <span className="category-icon">🍎</span>
              <span className="category-name">Trái cây</span>
            </div>
            <div className="category-pill">
              <span className="category-icon">🥛</span>
              <span className="category-name">Sữa & Trứng</span>
            </div>
            <div className="category-pill">
              <span className="category-icon">🌾</span>
              <span className="category-name">Bách hóa</span>
            </div>
            <div className="category-pill">
              <span className="category-icon">🌸</span>
              <span className="category-name">Hoa tươi</span>
            </div>
            <div className="category-pill">
              <span className="category-icon">🥩</span>
              <span className="category-name">Thịt & Hải sản</span>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="featured-section">
          <div className="featured-header">
            <div>
              <h2 className="section-title">Nông sản hữu cơ nổi bật</h2>
              <p className="section-subtitle">Lựa chọn tuyển chọn kỹ lưỡng từ các nông trại địa phương hàng đầu.</p>
            </div>
            <Link to="/shop" className="view-all-link">
              Xem tất cả <span className="arrow">→</span>
            </Link>
          </div>

          <div className="products-grid">
            {/* Heirloom Tomatoes - Large Card */}
            <div className="product-card large-card" style={{ backgroundImage: `url(${heirloomTomatoes})` }}>
              <div className="card-overlay"></div>
              <div className="card-top-tags">
                <span className="tag-pill tag-organic">Hữu cơ</span>
                <span className="tag-pill tag-local">Địa phương</span>
              </div>
              <div className="card-bottom-content">
                <div className="card-info">
                  <h3 className="card-title">Cà chua Heirloom</h3>
                  <p className="card-farm">Nông trại Thung Lũng Xanh · Thu hoạch hôm nay</p>
                  <p className="card-price">$4.99 <span className="unit">/ kg</span></p>
                </div>
                <button className="add-cart-btn large-add-btn" aria-label="Thêm vào giỏ hàng">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Bunched Carrots - Standard Card */}
            <div className="product-card standard-card">
              <div className="card-img-wrapper">
                <img src={bunchedCarrots} alt="Cà rốt bó" className="standard-card-img" />
              </div>
              <div className="card-body">
                <span className="card-category">Rau củ quả</span>
                <h3 className="standard-card-title">Cà rốt bó</h3>
                <p className="standard-card-farm">Nông trại Bình Minh</p>
                <div className="card-footer">
                  <p className="standard-card-price">$2.49 <span className="unit">/ bó</span></p>
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
                </div>
              </div>
            </div>

            {/* Honeycrisp Apples - Standard Card with Sale */}
            <div className="product-card standard-card">
              <div className="card-img-wrapper">
                <img src={honeycrispApples} alt="Táo Honeycrisp" className="standard-card-img" />
                <span className="tag-pill tag-sale">GIẢM GIÁ</span>
              </div>
              <div className="card-body">
                <span className="card-category">Trái cây vườn quả</span>
                <h3 className="standard-card-title">Táo Honeycrisp</h3>
                <p className="standard-card-farm">Nông trại Đồi Trái Cây</p>
                <div className="card-footer">
                  <p className="standard-card-price">
                    $1.99 <span className="unit">/ kg</span>
                    <span className="old-price">$2.99</span>
                  </p>
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
                </div>
              </div>
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
              <span className="logo-text">FarmConnect</span>
            </div>
            <p className="footer-copy">© 2026 FarmConnect. Kết nối Nông nghiệp số.</p>
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

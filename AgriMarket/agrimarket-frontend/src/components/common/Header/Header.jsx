import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../../services/authService";
import cartService from "../../../services/cartService";
import NotificationBell from "../NotificationBell/NotificationBell";

const Header = ({ activeTab }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

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

    // Listen for custom event to update cart count when item is added/removed
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate("/");
    window.location.reload();
  };

  const role = user?.role?.toLowerCase();

  const renderNavLinks = () => {
    if (role === "admin") {
      return (
        <>
          <Link to="/" className={`nav-link ${activeTab === "home" ? "active" : ""}`}>Trang chủ</Link>
          <Link to="/admin/users" className={`nav-link ${activeTab === "admin" ? "active" : ""}`}>AgriAdmin</Link>
        </>
      );
    } else if (role === "partner" || role === "shipper") {
      return (
        <>
          <Link to="/" className={`nav-link ${activeTab === "home" ? "active" : ""}`}>Trang chủ</Link>
          <Link to="/shipper/requests" className={`nav-link ${activeTab === "shipper" ? "active" : ""}`}>Kênh Vận Chuyển</Link>
        </>
      );
    } else {
      // customer, farmer, hoặc chưa đăng nhập
      return (
        <>
          <Link to="/" className={`nav-link ${activeTab === "home" ? "active" : ""}`}>Trang chủ</Link>
          <Link to="/farms" className={`nav-link ${activeTab === "farms" ? "active" : ""}`}>Nông trại</Link>
        </>
      );
    }
  };

  const showCart = role !== "admin" && role !== "partner" && role !== "shipper";

  return (
    <header className="home-header">
      <div className="header-container">
        <div className="header-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
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
          {renderNavLinks()}
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
          {showCart && (
            <button className="icon-btn" aria-label="Giỏ hàng" onClick={() => navigate("/cart")}>
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
              {cartItemsCount > 0 && (
                <span className="cart-badge">{cartItemsCount}</span>
              )}
            </button>
          )}

          {/* Bell Icon (Thông báo) */}
          {user && <NotificationBell user={user} />}

          {/* Profile & Auth Info */}
          {user ? (
            <div className="auth-profile-container">
              <div className="profile-indicator" onClick={() => navigate("/profile")} title="Xem hồ sơ" style={{ cursor: "pointer" }}>
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
  );
};

export default Header;

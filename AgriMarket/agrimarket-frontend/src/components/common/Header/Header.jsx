import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../../services/authService";
import cartService from "../../../services/cartService";
import { getAllApprovedProducts } from "../../../services/productService";
import NotificationBell from "../NotificationBell/NotificationBell";

const Header = ({ activeTab }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [showSearch, setShowSearch] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const wrapperRef = useRef(null);

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

  useEffect(() => {
    // Sync state with URL search param
    const q = searchParams.get("search") || "";
    setSearchQuery(q);
    if (q) setShowSearch(true);
  }, [searchParams]);

  useEffect(() => {
    // Load products for suggestions
    const loadProducts = async () => {
      try {
        const data = await getAllApprovedProducts();
        setAllProducts(data);
      } catch (err) {
        console.error("Lỗi tải sản phẩm cho gợi ý tìm kiếm:", err);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const filtered = allProducts.filter(p => 
        p.name?.toLowerCase().includes(query.toLowerCase()) || 
        p.category?.toLowerCase().includes(query.toLowerCase()) ||
        p.farmerName?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const executeSearch = (query) => {
    setSuggestions([]);
    navigate(`/?search=${encodeURIComponent(query)}`);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter") {
      executeSearch(searchQuery);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate("/");
    window.location.reload();
  };

  const role = user?.role?.toLowerCase();

  const renderNavLinks = () => {
    if (role === "admin") {
      return null;
    } else {
      // customer, farmer, hoặc chưa đăng nhập
      return (
        <>
          <Link to="/" className={`nav-link ${activeTab === "home" ? "active" : ""}`}>Trang chủ</Link>
          <Link to="/farms" className={`nav-link ${activeTab === "farms" ? "active" : ""}`}>Nông trại</Link>
          <Link to="/preorders" className={`nav-link ${activeTab === "preorder" ? "active" : ""}`}>Đặt trước</Link>
          <Link to="/livestream" className={`nav-link ${activeTab === "live" ? "active" : ""}`}>Phiên Live</Link>
          <Link to="/support" className={`nav-link ${activeTab === "support" ? "active" : ""}`}>Hỗ trợ</Link>
        </>
      );
    }
  };

  const showCart = role !== "admin";

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
          {/* Search Area */}
          <div className="header-search-wrapper" ref={wrapperRef}>
            <div className={`header-search-bar ${showSearch ? "active" : ""}`}>
              <button 
                className="icon-btn search-btn" 
                aria-label="Tìm kiếm"
                onClick={() => {
                  if (showSearch && searchQuery.trim()) {
                    executeSearch(searchQuery);
                  } else {
                    setShowSearch(!showSearch);
                  }
                }}
              >
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
              <input
                type="text"
                className="header-search-input"
                placeholder="Tìm sản phẩm, nông trại..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchSubmit}
                onFocus={() => setShowSearch(true)}
              />
            </div>

            {/* Search Suggestions Dropdown */}
            {showSearch && suggestions.length > 0 && (
              <div className="search-suggestions-dropdown">
                {suggestions.map((p) => (
                  <div
                    key={p.id}
                    className="suggestion-item"
                    onClick={() => {
                      setSuggestions([]);
                      setSearchQuery("");
                      setShowSearch(false);
                      navigate(`/products/${p.id}`);
                    }}
                  >
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="suggestion-img" />
                    ) : (
                      <div className="suggestion-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontSize: '18px' }}>🌾</div>
                    )}
                    <div className="suggestion-info">
                      <span className="suggestion-title">{p.name}</span>
                      <span className="suggestion-farm">🧑‍🌾 {p.farmerName || "Nhà vườn Agri"}</span>
                    </div>
                    <span className="suggestion-price">{p.price.toLocaleString("vi-VN")}đ</span>
                  </div>
                ))}
              </div>
            )}
          </div>

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

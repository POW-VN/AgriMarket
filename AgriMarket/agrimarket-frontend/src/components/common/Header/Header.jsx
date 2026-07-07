import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Tractor, Search, ShoppingCart, Sprout, UserCheck } from "lucide-react";
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
          <Tractor className="logo-tractor" size={24} />
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
                <Search size={20} />
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
                      <div className="suggestion-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', color: '#10b981' }}>
                        <Sprout size={18} />
                      </div>
                    )}
                    <div className="suggestion-info">
                      <span className="suggestion-title">{p.name}</span>
                      <span className="suggestion-farm" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><UserCheck size={12} /> {p.farmerName || "Nhà vườn Agri"}</span>
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
              <ShoppingCart size={20} />
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

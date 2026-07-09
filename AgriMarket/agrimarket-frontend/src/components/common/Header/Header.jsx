import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import authService from "../../../services/authService";
import cartService from "../../../services/cartService";
import { getAllApprovedProducts } from "../../../services/productService";
import NotificationBell from "../NotificationBell/NotificationBell";
import "./Header.css";

const Header = ({ activeTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // State 2 UI Dropdown visibility
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Profile dropdown state
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // State 3: Filter sub-bar dropdown toggle states
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  // References for clicking outside to close
  const wrapperRef = useRef(null);
  const filterRef = useRef(null);
  const profileRef = useRef(null);

  // Active filter local states synchronized with URL
  const [activeFilterTab, setActiveFilterTab] = useState("all");
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);

  // Mock list of popular search tags (Vietnamese agricultural specialties)
  const popularTags = [
    { name: "Xoài cát hòa lộc", icon: "🥭" },
    { name: "Măng cụt Lái Thiêu", icon: "🍇" },
    { name: "Sầu riêng Ri6", icon: "👑" },
    { name: "Dưa lưới ôn đới", icon: "🍈" },
    { name: "Mật ong hoa cà phê", icon: "🍯" },
    { name: "Bơ sáp Đắk Lắk", icon: "🥑" }
  ];

  // Mock list of active livestreams
  const mockLives = [
    {
      id: "live_1",
      name: "Nông trại xanh Đà Lạt",
      description: "Rau củ tươi ngon mỗi ngày",
      viewers: "1.2K",
      imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=300&auto=format&fit=crop"
    },
    {
      id: "live_2",
      name: "Vườn trái cây miền Tây",
      description: "Xoài, cam, bưởi sạch",
      viewers: "856",
      imageUrl: "https://images.unsplash.com/photo-1610348725531-843dff163e2c?q=80&w=300&auto=format&fit=crop"
    },
    {
      id: "live_3",
      name: "Farm Organic",
      description: "Nông sản hữu cơ chuẩn VietGAP",
      viewers: "623",
      imageUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=300&auto=format&fit=crop"
    }
  ];

  const regionsList = [
    "Đà Lạt", "Lâm Đồng", "Tiền Giang", "Bến Tre", "Đắk Lắk",
    "Đồng Tháp", "Vĩnh Long", "Cần Thơ", "Hồ Chí Minh", "Hà Nội"
  ];

  // Auth & Cart synchronization
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

    // Load recent searches from localStorage
    const savedSearches = JSON.parse(localStorage.getItem("recent_searches")) || [];
    setRecentSearches(savedSearches);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  // Sync state with URL search parameters
  useEffect(() => {
    const q = searchParams.get("search") || "";
    setSearchQuery(q);

    // Sync filter states from URL params
    const category = searchParams.get("category") || "";
    if (category) {
      if (category === "Rau củ quả" || category === "Trái cây") {
        setActiveFilterTab("product");
      } else {
        setActiveFilterTab("all");
      }
    } else {
      setActiveFilterTab("all");
    }

    const locs = searchParams.get("locations");
    setSelectedLocations(locs ? locs.split(",") : []);

    setPriceMin(searchParams.get("priceMin") || "");
    setPriceMax(searchParams.get("priceMax") || "");
    setSelectedRating(Number(searchParams.get("rating")) || 0);
  }, [searchParams]);

  // Load products for suggestions
  useEffect(() => {
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

  // Clicks outside handlers
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsRegionOpen(false);
        setIsPriceOpen(false);
        setIsRatingOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Search input typing handler
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const getSuggestionsList = () => {
    if (!searchQuery.trim()) {
      return ["Xoài cát hòa lộc", "Cam sành", "Rau cải hữu cơ", "Sầu riêng thái", "Gạo lứt đỏ"];
    }
    const filtered = allProducts
      .filter((p) => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((p) => p.name)
      .slice(0, 5);
    return filtered.length > 0 ? filtered : [searchQuery];
  };

  // Perform search and save query to recent searches
  const executeSearch = (query) => {
    setShowSearchDropdown(false);

    if (query.trim()) {
      const updated = [query, ...recentSearches.filter((item) => item !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recent_searches", JSON.stringify(updated));
    }

    const currentParams = new URLSearchParams(searchParams);
    if (query.trim()) {
      currentParams.set("search", query);
    } else {
      currentParams.delete("search");
    }
    setSearchParams(currentParams);
    navigate(`/products/listing?${currentParams.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter") {
      executeSearch(searchQuery);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    const currentParams = new URLSearchParams(searchParams);
    currentParams.delete("search");
    setSearchParams(currentParams);
    navigate(`/products/listing?${currentParams.toString()}`);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate("/");
    window.location.reload();
  };

  // Synchronize dynamic filter parameters to URL
  const updateFilterParams = (key, value) => {
    const currentParams = new URLSearchParams(searchParams);
    if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
      currentParams.delete(key);
    } else {
      currentParams.set(key, Array.isArray(value) ? value.join(",") : value);
    }
    setSearchParams(currentParams);

    // Redirect to listing if not already there
    if (!location.pathname.startsWith("/products/listing")) {
      navigate(`/products/listing?${currentParams.toString()}`);
    }
  };

  // Filter Sub-bar Handlers
  const handleTabClick = (tab) => {
    setActiveFilterTab(tab);
    if (tab === "product") {
      updateFilterParams("category", "Rau củ quả");
    } else if (tab === "farm") {
      // Redirect to farms list page
      navigate("/farms");
    } else if (tab === "live") {
      // Redirect to livestreams listing
      navigate("/livestream");
    } else {
      updateFilterParams("category", "");
    }
  };

  const handleRegionSelect = (region) => {
    let nextLocations = [...selectedLocations];
    if (nextLocations.includes(region)) {
      nextLocations = nextLocations.filter((r) => r !== region);
    } else {
      nextLocations.push(region);
    }
    setSelectedLocations(nextLocations);
    updateFilterParams("locations", nextLocations);
  };

  const handlePriceApply = () => {
    setIsPriceOpen(false);
    updateFilterParams("priceMin", priceMin);
    updateFilterParams("priceMax", priceMax);
  };

  const handleRatingSelect = (ratingVal) => {
    const newVal = selectedRating === ratingVal ? 0 : ratingVal;
    setSelectedRating(newVal);
    updateFilterParams("rating", newVal > 0 ? newVal : "");
    setIsRatingOpen(false);
  };

  const role = user?.role?.toLowerCase();
  const isSearchPage = location.pathname.startsWith("/products/listing") || searchParams.has("search");
  const isHomepage = location.pathname === "/" || location.pathname === "/home";

  // Left navbar tabs
  const navLinks = [
    {
      id: "home", label: "Trang chủ", path: "/", icon: (
        <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: "farms", label: "Nông trại", path: "/farms", icon: (
        <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: "preorder", label: "Đặt trước", path: "/preorders", icon: (
        <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: "live", label: "Phiên Live", path: "/livestream", hasBadge: true, icon: (
        <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: "support", label: "Hỗ trợ", path: "/support", icon: (
        <svg className="nav-icon" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  ];

  return (
    <header className="home-header">
      {/* 1. Main Navbar Row */}
      <div className="header-main-row">

        <div className="header-left">
          {/* Logo */}
          <div className="header-logo" onClick={() => navigate("/")}>
            <div className="logo-tractor-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="7" cy="18" r="2"></circle>
                <circle cx="18" cy="18" r="2"></circle>
                <path d="M7 16h11v-2H9v-3h7V9H9V6H7v10z"></path>
                <path d="M16 9h3l2 3v4"></path>
              </svg>
            </div>
            <div className="logo-text-group">
              <span className="logo-title">AgriMarket</span>
              <span className="logo-subtitle">Nông sản sạch cho mọi nhà</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="header-nav">
            {role !== "admin" &&
              navLinks.map((link) => (
                <div key={link.id} className="nav-item-wrapper">
                  <Link
                    to={link.path}
                    className={`nav-link-pill ${activeTab === link.id ||
                        (link.id === "home" && activeTab === undefined && isHomepage)
                        ? "active"
                        : ""
                      }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                  {link.hasBadge && <span className="nav-live-badge">LIVE</span>}
                </div>
              ))}
          </nav>
        </div>

        <div className="header-center">
          {/* Search Bar Capsule Wrapper */}
          <div className="header-search-wrapper" ref={wrapperRef}>
            <div className={`search-capsule-container ${showSearchDropdown ? "active" : ""}`}>
              <button className="search-prefix-btn" onClick={() => executeSearch(searchQuery)} type="button" aria-label="Tìm kiếm">
                <svg
                  className="search-input-prefix-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <input
                type="text"
                className="search-capsule-input"
                placeholder="Tìm rau sạch, trái cây, nông trại, phiên Live..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchSubmit}
                onFocus={() => setShowSearchDropdown(true)}
              />
              {searchQuery && (
                <button className="search-input-clear-btn" onClick={handleClearSearch} aria-label="Xóa tìm kiếm">
                  <svg className="search-clear-icon" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* State 2: Dropdown 2-Column Card Overlay */}
            {showSearchDropdown && (
              <div className="search-overlay-dropdown-card">
                {/* Column 1: Gợi ý tìm kiếm */}
                <div className="search-dropdown-col">
                  <h4 className="dropdown-col-title">Gợi ý tìm kiếm</h4>
                  <ul className="dropdown-col-list">
                    {getSuggestionsList().map((term, index) => (
                      <li key={index}>
                        <button className="dropdown-list-item-btn" onClick={() => executeSearch(term)}>
                          <svg className="list-item-icon" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          {term}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 2: Tìm kiếm gần đây */}
                <div className="search-dropdown-col">
                  <h4 className="dropdown-col-title">Tìm kiếm gần đây</h4>
                  <ul className="dropdown-col-list">
                    {(recentSearches.length > 0
                      ? recentSearches
                      : ["Rau sạch Đà Lạt", "Gạo ST25", "Sầu riêng Ri6", "Cam sành Vĩnh Long", "Phiên Live nông trại"]
                    ).map((term, index) => (
                      <li key={index}>
                        <button className="dropdown-list-item-btn" onClick={() => executeSearch(term)}>
                          <svg className="list-item-icon" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {term}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="header-right">
          {/* Right Side Action Icons */}
          <div className="header-actions">
            {/* Cart Icon */}
            {role !== "admin" && (
              <button className="round-action-btn" aria-label="Giỏ hàng" onClick={() => navigate("/cart")}>
                <svg
                  className="action-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartItemsCount > 0 && (
                  <span className="cart-badge">{cartItemsCount}</span>
                )}
              </button>
            )}

            {/* Bell Icon (Thông báo) */}
            {user && <NotificationBell user={user} />}

            {/* Profile & Auth dropdown */}
            {user ? (
              <div className="nav-item-wrapper" ref={profileRef}>
                <div className="profile-card-trigger" onClick={() => navigate("/profile")}>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="profile-avatar-circle" />
                  ) : (
                    <div className="profile-avatar-circle">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="profile-card-name">{user.fullName}</span>
                </div>
              </div>
            ) : (
              <button className="search-submit-pill-btn" onClick={() => navigate("/login")}>
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. State 1 Sub-bar: Popular Searches (Rendered on Home page when search query is empty) */}
      {isHomepage && !searchQuery && (
        <div className="header-popular-searches-bar">
          <span className="popular-searches-title">
            <svg className="popular-search-fire-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Tìm kiếm phổ biến:
          </span>
          <div className="popular-search-tags-row">
            {popularTags.map((tag) => (
              <button
                key={tag.name}
                className="popular-search-tag-pill"
                onClick={() => {
                  setSearchQuery(tag.name);
                  executeSearch(tag.name);
                }}
              >
                <span className="popular-tag-icon">{tag.icon}</span>
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. State 3 Sub-bar: Top Filter Bar (Rendered on listing / when filtering search results) */}
      {isSearchPage && (
        <div className="header-filter-bar" ref={filterRef}>
          <div className="filter-bar-content">
            {/* Tabs Group */}
            <div className="filter-tabs-group">
              <button
                className={`filter-tab-pill-btn ${activeFilterTab === "all" ? "active" : ""}`}
                onClick={() => handleTabClick("all")}
              >
                <svg className="filter-tab-icon" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Tất cả
              </button>
              <button
                className={`filter-tab-pill-btn ${activeFilterTab === "product" ? "active" : ""}`}
                onClick={() => handleTabClick("product")}
              >
                <svg className="filter-tab-icon" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Sản phẩm
              </button>
              <button
                className={`filter-tab-pill-btn ${activeFilterTab === "farm" ? "active" : ""}`}
                onClick={() => handleTabClick("farm")}
              >
                <svg className="filter-tab-icon" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Nông trại
              </button>
              <button
                className={`filter-tab-pill-btn ${activeFilterTab === "live" ? "active" : ""}`}
                onClick={() => handleTabClick("live")}
              >
                <svg className="filter-tab-icon" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Phiên Live
              </button>
            </div>

            <div className="filter-bar-divider"></div>

            {/* Dropdowns Group */}
            <div className="filter-dropdowns-group">
              {/* Region Dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  className={`filter-dropdown-trigger-btn ${selectedLocations.length > 0 ? "active" : ""} ${isRegionOpen ? "open" : ""}`}
                  onClick={() => {
                    setIsRegionOpen(!isRegionOpen);
                    setIsPriceOpen(false);
                    setIsRatingOpen(false);
                  }}
                >
                  <svg className="filter-tab-icon" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {selectedLocations.length > 0 ? `Khu vực (${selectedLocations.length})` : "Khu vực"}
                  <svg className="dropdown-chevron-icon" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isRegionOpen && (
                  <div className="filter-dropdown-menu-card">
                    <div className="filter-region-list">
                      {regionsList.map((region) => {
                        const isSelected = selectedLocations.includes(region);
                        return (
                          <div
                            key={region}
                            className={`region-option-row ${isSelected ? "selected" : ""}`}
                            onClick={() => handleRegionSelect(region)}
                          >
                            {region}
                            {isSelected && (
                              <svg className="region-check-icon" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  className={`filter-dropdown-trigger-btn ${(priceMin || priceMax) ? "active" : ""} ${isPriceOpen ? "open" : ""}`}
                  onClick={() => {
                    setIsPriceOpen(!isPriceOpen);
                    setIsRegionOpen(false);
                    setIsRatingOpen(false);
                  }}
                >
                  <svg className="filter-tab-icon" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Giá
                  <svg className="dropdown-chevron-icon" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isPriceOpen && (
                  <div className="filter-dropdown-menu-card filter-price-card">
                    <div className="price-inputs-row">
                      <input
                        type="number"
                        placeholder="Từ (đ)"
                        className="price-input-box"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                      />
                      <span className="price-range-dash">-</span>
                      <input
                        type="number"
                        placeholder="Đến (đ)"
                        className="price-input-box"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                      />
                    </div>
                    <button className="price-apply-submit-btn" onClick={handlePriceApply}>
                      Áp dụng
                    </button>
                  </div>
                )}
              </div>

              {/* Rating Dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  className={`filter-dropdown-trigger-btn ${selectedRating > 0 ? "active" : ""} ${isRatingOpen ? "open" : ""}`}
                  onClick={() => {
                    setIsRatingOpen(!isRatingOpen);
                    setIsRegionOpen(false);
                    setIsPriceOpen(false);
                  }}
                >
                  <svg className="filter-tab-icon" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Đánh giá
                  <svg className="dropdown-chevron-icon" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isRatingOpen && (
                  <div className="filter-dropdown-menu-card" style={{ width: "160px" }}>
                    {[5, 4, 3].map((stars) => (
                      <div
                        key={stars}
                        className={`rating-option-row ${selectedRating === stars ? "selected" : ""}`}
                        onClick={() => handleRatingSelect(stars)}
                      >
                        <div className="rating-option-stars">
                          {Array.from({ length: stars }).map((_, i) => (
                            <svg key={i} className="rating-option-star-icon" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="rating-option-text"> trở lên</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

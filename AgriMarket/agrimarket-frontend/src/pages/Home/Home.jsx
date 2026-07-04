import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../services/authService";
import { getAllApprovedProducts } from "../../services/productService";
import cartService from "../../services/cartService";
import "./Home.css";
import Header from "../../components/common/Header/Header";

// Import local images
import heroBanner from "./assets/hero_banner.png";

const MAIN_CATEGORIES = [
  { name: "Cây lương thực", icon: "🌾" },
  { name: "Rau củ quả", icon: "🥕" },
  { name: "Trái cây", icon: "🍎" },
  { name: "Cây công nghiệp", icon: "🪵" },
  { name: "Giống cây trồng", icon: "🌱" },
  { name: "Nông sản chế biến", icon: "🥫" },
  { name: "Chăn nuôi", icon: "🐄" }
];

const MOCK_FARMS = [
  {
    id: "farm-1",
    name: "GreenFarm Củ Chi",
    distance: "3.2km",
    description: "Chuyên cung cấp các loại rau lá hữu cơ và nấm sạch theo tiêu chuẩn công nghệ cao. Giao hà...",
    badge: "VƯỜN AN TOÀN",
    tags: ["Huu_co", "Giao_nhanh"],
    imageUrl: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=600"
  },
  {
    id: "farm-2",
    name: "Vườn Thanh Long 10",
    distance: "8.5km",
    description: "Thanh long ruột đỏ xuất khẩu, độ ngọt cao, không thuốc trừ sâu.",
    imageUrl: "https://images.unsplash.com/photo-1527334919514-3c86290298c1?w=600"
  }
];

const HERO_SLIDES = [
  {
    title: "Nông sản tươi sạch mỗi ngày",
    subtitle: "Khám phá những sản phẩm được yêu thích nhất tại AgriMarket với chất lượng hàng đầu.",
    tag: "SẢN PHẨM BÁN CHẠY",
    discount: "20%",
    imageUrl: heroBanner
  },
  {
    title: "Nông trại hữu cơ xanh",
    subtitle: "Nhà vườn đạt chuẩn GlobalGAP, VietGAP mang nông sản an toàn trực tiếp đến gia đình bạn.",
    tag: "ĐẠT CHUẨN QUỐC TẾ",
    discount: "15%",
    imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1000"
  },
  {
    title: "Mùa thu hoạch trúng lớn",
    subtitle: "Hàng ngàn sản phẩm trái cây và ngũ cốc tươi ngon vừa thu hoạch với giá siêu rẻ.",
    tag: "GIÁ SỐC HÔM NAY",
    discount: "30%",
    imageUrl: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=1000"
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [activeFarms, setActiveFarms] = useState([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Remaining time calculations for Flash Sale (countdown to end of day)
  const getRemainingTime = () => {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const diff = endOfDay.getTime() - now.getTime();
    
    const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
    const minutes = Math.max(0, Math.floor((diff / 1000 / 60) % 60));
    const seconds = Math.max(0, Math.floor((diff / 1000) % 60));
    
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0')
    };
  };

  const [timeLeft, setTimeLeft] = useState(getRemainingTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getRemainingTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-slide hero banner carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const triggerToast = (message, type = "success") => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && (currentUser.role === "partner" || currentUser.role === "shipper")) {
      navigate("/shipper/requests");
      return;
    }
    setUser(currentUser);

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getAllApprovedProducts();
        setProducts(data);

        // Extract active farms from products database data
        const uniqueFarmers = [];
        const seenFarmerIds = new Set();

        for (const p of data) {
          if (p.farmerId && !seenFarmerIds.has(p.farmerId)) {
            seenFarmerIds.add(p.farmerId);
            uniqueFarmers.push({
              id: p.farmerId,
              name: p.farmerName || "Nhà vườn AgriMarket",
              distance: `${(2 + Math.random() * 8).toFixed(1)}km`,
              description: p.farmDescription || "Chuyên cung cấp các loại rau quả nông sản tươi ngon sạch đạt chuẩn.",
              badge: p.farmerOrganicUrl ? "ORGANIC" : p.farmerGlobalgapUrl ? "GLOBALGAP" : p.farmerVietgapUrl ? "VIETGAP" : "VƯỜN AN TOÀN",
              tags: p.category ? [p.category, "Sạch"] : ["Nông sản", "Hữu cơ"],
              imageUrl: p.imageUrl || "https://images.unsplash.com/photo-1595855759920-86582396756a?w=600"
            });
          }
        }

        const combinedFarms = [...uniqueFarmers];
        if (combinedFarms.length < 2) {
          const mockToAdd = MOCK_FARMS.filter(mf => !combinedFarms.some(cf => String(cf.id) === String(mf.id)));
          combinedFarms.push(...mockToAdd);
        }
        setActiveFarms(combinedFarms);
      } catch (err) {
        console.error("Lỗi khi load sản phẩm trang chủ:", err);
        setProducts([]);
        setActiveFarms(MOCK_FARMS);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();

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

    const savedFavorites = JSON.parse(localStorage.getItem("agrimarket_favorites")) || [];
    setFavorites(savedFavorites);
  }, []);

  const handleAddToCart = async (p, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (p.stock === 0) {
      triggerToast(`Sản phẩm "${p.name}" đã hết hàng!`, "error");
      return;
    }

    if (user) {
      try {
        const data = await cartService.addToCart(p.id, 1);
        setCartItemsCount(data.length);
        window.dispatchEvent(new Event("cartUpdated"));
        triggerToast(`Đã thêm 1 ${p.unit} "${p.name}" vào giỏ hàng!`, "success");
      } catch (err) {
        console.error("Lỗi khi thêm vào giỏ hàng:", err);
        triggerToast("Không thể thêm vào giỏ hàng. Vui lòng thử lại!", "error");
      }
    } else {
      const cartKey = "agrimarket_cart";
      const currentCart = JSON.parse(localStorage.getItem(cartKey)) || [];
      const existingIndex = currentCart.findIndex(item => String(item.id) === String(p.id));

      if (existingIndex > -1) {
        const newQty = currentCart[existingIndex].quantity + 1;
        if (p.stock !== undefined && newQty > p.stock) {
          triggerToast(`Không thể thêm số lượng vượt quá tồn kho hiện có (${p.stock}).`, "error");
          return;
        }
        currentCart[existingIndex].quantity = newQty;
      } else {
        currentCart.push({
          id: p.id,
          name: p.name,
          price: p.price,
          unit: p.unit,
          imageUrl: p.imageUrl,
          quantity: 1,
          checked: true,
          stockQuantity: p.stock ?? 100,
          farmerId: p.farmerId || 1,
          farmerName: p.farmerName
        });
      }
      localStorage.setItem(cartKey, JSON.stringify(currentCart));
      setCartItemsCount(currentCart.length);
      window.dispatchEvent(new Event("cartUpdated"));
      triggerToast(`Đã thêm 1 ${p.unit} "${p.name}" vào giỏ hàng!`, "success");
    }
  };

  const toggleFavorite = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();

    let updatedFavorites = [];
    if (favorites.includes(productId)) {
      updatedFavorites = favorites.filter(id => id !== productId);
      triggerToast("Đã xóa sản phẩm khỏi danh sách yêu thích!", "success");
    } else {
      updatedFavorites = [...favorites, productId];
      triggerToast("Đã thêm sản phẩm vào danh sách yêu thích!", "success");
    }
    setFavorites(updatedFavorites);
    localStorage.setItem("agrimarket_favorites", JSON.stringify(updatedFavorites));
  };

  const filteredProducts = products.filter((product) => {
    // 1. Check search query match if present
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        product.name?.toLowerCase().includes(q) ||
        product.category?.toLowerCase().includes(q) ||
        product.farmerName?.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q);

      if (!matchesSearch) return false;
    }

    // 2. Check category match
    if (!selectedCategory) {
      return true;
    }
    const productCat = (product.category || "").toLowerCase();
    const selectedCat = selectedCategory.toLowerCase();

    if (selectedCat === "rau củ quả") {
      return productCat.includes("rau") || productCat.includes("củ") || productCat.includes("quả");
    }
    if (selectedCat === "trái cây") {
      return productCat.includes("trái") || productCat.includes("quả") || productCat.includes("fruit");
    }
    if (selectedCat === "gia cầm") {
      return productCat.includes("gia cầm") || productCat.includes("trứng") || productCat.includes("chicken") || productCat.includes("gà");
    }
    if (selectedCat === "cây lương thực") {
      return productCat.includes("lương thực") || productCat.includes("gạo") || productCat.includes("nếp") || productCat.includes("lúa");
    }
    if (selectedCat === "thủy hải sản") {
      return productCat.includes("thủy") || productCat.includes("hải sản") || productCat.includes("tôm") || productCat.includes("cá");
    }
    if (selectedCat === "phân bón") {
      return productCat.includes("phân bón");
    }
    if (selectedCat === "vận chuyển") {
      return productCat.includes("vận chuyển");
    }
    if (selectedCat === "thiết bị") {
      return productCat.includes("thiết bị") || productCat.includes("máy");
    }
    if (selectedCat === "cây công nghiệp") {
      return productCat.includes("cây công nghiệp") || productCat.includes("tiêu") || productCat.includes("điều") || productCat.includes("cà phê");
    }
    if (selectedCat === "chăn nuôi") {
      return productCat.includes("chăn nuôi") || productCat.includes("heo") || productCat.includes("bò") || productCat.includes("thịt");
    }
    if (selectedCat === "giống cây trồng") {
      return productCat.includes("giống") || productCat.includes("mầm");
    }
    if (selectedCat === "nông sản chế biến") {
      return productCat.includes("chế biến") || productCat.includes("sấy") || productCat.includes("mật ong");
    }
    return productCat === selectedCat;
  });

  const renderProductCard = (p) => {
    return (
      <Link
        key={p.id}
        to={`/products/${p.id}`}
        className="new-product-card"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="new-card-img-wrapper">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="new-card-img" />
          ) : (
            <div className="new-card-img-fallback">🌾</div>
          )}
          {p.saleTag && <span className="new-card-sale-tag">{p.saleTag}</span>}

          <button
            className={`new-card-favorite-btn ${favorites.includes(p.id) ? "active" : ""}`}
            aria-label="Yêu thích"
            onClick={(e) => toggleFavorite(p.id, e)}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill={favorites.includes(p.id) ? "#DC2626" : "none"}
              stroke={favorites.includes(p.id) ? "#DC2626" : "currentColor"}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        <div className="new-card-body">
          <div className="new-card-body-top">
            <span className="new-card-category">{p.category.toUpperCase()}</span>
            <h3 className="new-card-title" title={p.name}>{p.name}</h3>

            <div className="new-card-farm-row">
              <span>🧑‍🌾 {p.farmerName || "Nhà vườn Agri"}</span>
            </div>

            <div className="new-card-rating-sold-row">
              <div className="new-card-rating">
                <span className="star-gold">★</span>
                <span className="rating-value">{p.rating || "4.8"}</span>
                <span className="reviews-count">({p.reviewsCount || "12"})</span>
              </div>
              <span className="new-card-sold">Đã bán {p.sold || "0"}</span>
            </div>
          </div>

          <div className="new-card-price-cart-row">
            <div className="new-card-price-col">
              <span className="new-card-price">
                {p.price.toLocaleString("vi-VN")}đ
              </span>
              {p.oldPrice && (
                <span className="new-card-old-price">
                  {p.oldPrice.toLocaleString("vi-VN")}đ
                </span>
              )}
            </div>

            <button
              className="new-card-add-cart-btn"
              aria-label="Thêm vào giỏ hàng"
              onClick={(e) => handleAddToCart(p, e)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                <line x1="12" y1="10" x2="16" y2="10"></line>
                <line x1="14" y1="8" x2="14" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </Link>
    );
  };

  const getSoldPercent = (id) => {
    let hash = 0;
    const str = String(id);
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const sold = Math.abs(hash % 12) + 6; // between 6 and 17
    return { sold, percent: Math.round((sold / 20) * 100) };
  };

  const flashSaleProducts = products.filter(p => p.oldPrice).slice(0, 4);
  const displayFlashSale = flashSaleProducts.length > 0 
    ? flashSaleProducts 
    : products.slice(0, 4).map(p => ({
        ...p,
        oldPrice: p.oldPrice || p.price * 1.25
      }));

  return (
    <div className="home-page">
      <Header activeTab="home" />

      <main className="home-main">
        {searchQuery && (
          <section className="search-feedback-section" style={{ marginBottom: "24px", padding: "16px 24px", backgroundColor: "#E8F5E9", borderRadius: "12px", border: "1px solid #C8E6C9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "15px", fontWeight: "600", color: "#1B5E20" }}>Kết quả tìm kiếm cho: </span>
              <strong style={{ fontSize: "16px", color: "#103314" }}>"{searchQuery}"</strong>
            </div>
            <button
              onClick={() => navigate("/")}
              style={{ background: "none", border: "none", color: "#1B5E20", fontWeight: "700", cursor: "pointer", fontSize: "15px" }}
            >
              Xóa bộ lọc ×
            </button>
          </section>
        )}
        {/* Hero Section Split Layout */}
        <section className="hero-section-split">
          {/* Left Large Banner */}
          <div className="hero-left-banner">
            {HERO_SLIDES.map((slide, idx) => (
              <div
                key={idx}
                className={`hero-slide-item ${idx === activeSlideIndex ? "active" : ""}`}
                style={{ backgroundImage: `url(${slide.imageUrl})` }}
              >
                <div className="hero-overlay"></div>

                <div className="hero-left-content">
                  <span className="hero-bestseller-badge">{slide.tag}</span>
                  <h1 className="hero-title">{slide.title}</h1>
                  <p className="hero-subtitle">{slide.subtitle}</p>
                  <button className="hero-buy-btn" onClick={() => navigate("/")}>
                    Mua ngay
                  </button>
                </div>

                {slide.discount && (
                  <div className="hero-discount-circle">
                    <span className="discount-tag">KHUYẾN MÃI</span>
                    <span className="discount-percent">{slide.discount}</span>
                    <span className="discount-sub">ƯU ĐÃI HẤP DẪN</span>
                  </div>
                )}
              </div>
            ))}

            <button
              className="hero-nav-arrow arrow-left"
              aria-label="Previous"
              onClick={() => setActiveSlideIndex(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              className="hero-nav-arrow arrow-right"
              aria-label="Next"
              onClick={() => setActiveSlideIndex(prev => (prev + 1) % HERO_SLIDES.length)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            <div className="hero-carousel-dots">
              {HERO_SLIDES.map((_, idx) => (
                <span
                  key={idx}
                  className={`carousel-dot ${idx === activeSlideIndex ? "active" : ""}`}
                  onClick={() => setActiveSlideIndex(idx)}
                ></span>
              ))}
            </div>
          </div>

          {/* Right Sub-banners Stack */}
          <div className="hero-right-banners">
            {/* Top Sub-banner */}
            <div className="hero-sub-banner top-sub-banner" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600)` }}>
              <div className="hero-sub-overlay"></div>
              <div className="hero-sub-content">
                <div className="hero-sub-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sub-icon">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span>ƯU ĐÃI HÈ</span>
                </div>
                <h2 className="hero-sub-title">Sản phẩm đang giảm giá</h2>
                <p className="hero-sub-desc">Tiết kiệm lên đến 50% cho các mặt hàng thiết yếu</p>
              </div>
            </div>

            {/* Bottom Sub-banner */}
            <div className="hero-sub-banner bottom-sub-banner">
              <div className="hero-sub-content">
                <span className="hero-sub-tag">GIÁ SỐC</span>
                <h2 className="hero-sub-title">Sản phẩm giảm giá ưu đãi</h2>
                <div className="hero-sub-link-row" onClick={() => navigate("/products")} style={{ cursor: "pointer" }}>
                  <span>Xem danh sách</span>
                  <span className="sub-link-arrow">→</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition Grid (4 Columns) */}
        <section className="value-proposition-section">
          <div className="value-prop-grid">
            <div className="value-prop-card">
              <div className="value-prop-icon">🌾</div>
              <div className="value-prop-info">
                <h4 className="value-prop-title">100% Nông sản sạch</h4>
                <p className="value-prop-desc">VietGAP, GlobalGAP & Hữu cơ tiêu chuẩn</p>
              </div>
            </div>
            <div className="value-prop-card">
              <div className="value-prop-icon">🚚</div>
              <div className="value-prop-info">
                <h4 className="value-prop-title">Giao nhanh siêu tốc 2h</h4>
                <p className="value-prop-desc">Bảo đảm tươi ngon nguyên bản đến nhà bạn</p>
              </div>
            </div>
            <div className="value-prop-card">
              <div className="value-prop-icon">🧑‍🌾</div>
              <div className="value-prop-info">
                <h4 className="value-prop-title">Giá tận gốc từ vườn</h4>
                <p className="value-prop-desc">Không qua trung gian thương lái, mua trực tiếp</p>
              </div>
            </div>
            <div className="value-prop-card">
              <div className="value-prop-icon">🛡️</div>
              <div className="value-prop-info">
                <h4 className="value-prop-title">Bảo đảm chất lượng</h4>
                <p className="value-prop-desc">Đổi trả 100% nếu có lỗi từ nhà vườn</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section (Original Emoji Pills Layout, without 'Khác', Grid 7col single-row) */}
        <section className="categories-section">
          <h2
            className="section-title"
            onClick={() => navigate("/products/listing")}
            style={{ cursor: "pointer", display: "inline-block" }}
            title="Xem tất cả danh mục"
          >
            Danh mục →
          </h2>
          <div className="categories-grid">
            {MAIN_CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                className={`category-pill ${selectedCategory === cat.name ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  navigate(`/products/listing?category=${encodeURIComponent(cat.name)}`);
                }}
                style={{ cursor: "pointer" }}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Flash Sale Section */}
        {displayFlashSale.length > 0 && (
          <section className="flash-sale-section">
            <div className="flash-sale-header">
              <div className="flash-sale-title-box">
                <span className="flash-sale-icon">⚡</span>
                <h2 className="flash-sale-title">GIỜ VÀNG GIÁ SỐC</h2>
                <div className="countdown-box">
                  <span className="countdown-number">{timeLeft.hours}</span>
                  <span className="countdown-colon">:</span>
                  <span className="countdown-number">{timeLeft.minutes}</span>
                  <span className="countdown-colon">:</span>
                  <span className="countdown-number">{timeLeft.seconds}</span>
                </div>
              </div>
              <button className="flash-sale-view-all" onClick={() => { setSelectedCategory("Rau củ quả"); document.querySelector(".categories-section")?.scrollIntoView({ behavior: "smooth" }); }}>
                Xem tất cả
              </button>
            </div>

            <div className="flash-sale-grid">
              {displayFlashSale.map((p) => {
                const discountPercent = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 25;
                const { sold, percent } = getSoldPercent(p.id);

                return (
                  <div key={p.id} className="flash-sale-card">
                    <Link to={`/product/${p.id}`} className="flash-card-link">
                      <div className="flash-card-img-wrapper">
                        <img src={p.imageUrl} alt={p.name} className="flash-card-img" />
                        <span className="flash-card-discount-tag">-{discountPercent}%</span>
                      </div>
                      <div className="flash-card-info">
                        <h3 className="flash-card-title">{p.name}</h3>
                        <div className="flash-card-price-row">
                          <span className="flash-card-price">{p.price.toLocaleString("vi-VN")}đ</span>
                          {p.oldPrice && (
                            <span className="flash-card-old-price">{p.oldPrice.toLocaleString("vi-VN")}đ</span>
                          )}
                        </div>
                        {/* Progress Bar */}
                        <div className="flash-progress-wrapper">
                          <div className="flash-progress-bar" style={{ width: `${percent}%` }}></div>
                          <span className="flash-progress-text">Đã bán {sold}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Nông trại gần bạn Section (Synchronized with Database Farmers) */}
        {activeFarms.length >= 2 && (
          <section className="new-farms-section">
            <div className="new-farms-header">
              <div>
                <h2 className="new-section-title">Nông trại gần bạn</h2>
                <p className="new-section-subtitle">Hỗ trợ các nhà vườn địa phương tại TP. Hồ Chí Minh</p>
              </div>
              <button className="new-farms-map-btn" onClick={() => navigate("/farms")}>
                Bản đồ nông trại
              </button>
            </div>

            <div className="new-farms-grid">
              {/* Wide Farm Card (activeFarms[0]) */}
              <div className="new-farm-card wide-farm-card">
                <div className="farm-card-left-img" style={{ backgroundImage: `url(${activeFarms[0].imageUrl})` }}></div>
                <div className="farm-card-right-info">
                  <div className="farm-card-meta">
                    <span className="farm-badge-secure">{activeFarms[0].badge}</span>
                    <span className="farm-distance-tag">📍 {activeFarms[0].distance}</span>
                  </div>
                  <h3 className="farm-card-title">{activeFarms[0].name}</h3>
                  <p className="farm-card-desc">{activeFarms[0].description}</p>
                  <div className="farm-card-tags">
                    {activeFarms[0].tags.map(t => (
                      <span key={t} className="farm-hashtag">#{t}</span>
                    ))}
                  </div>
                  <button className="farm-visit-btn" onClick={() => navigate(`/farmer-profile/${activeFarms[0].id}`)}>
                    Ghé thăm gian hàng
                  </button>
                </div>
              </div>

              {/* Standard/Narrow Farm Card (activeFarms[1]) */}
              <div className="new-farm-card narrow-farm-card">
                <div className="farm-card-top-img" style={{ backgroundImage: `url(${activeFarms[1].imageUrl})` }}></div>
                <div className="farm-card-bottom-info">
                  <div className="farm-card-meta">
                    <h3 className="farm-card-title">{activeFarms[1].name}</h3>
                    <span className="farm-distance-tag">📍 {activeFarms[1].distance}</span>
                  </div>
                  <p className="farm-card-desc">{activeFarms[1].description}</p>
                  <button className="farm-visit-btn" onClick={() => navigate(`/farmer-profile/${activeFarms[1].id}`)}>
                    Xem sản phẩm
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Sản phẩm nổi bật Section */}
        <section className="new-featured-section">
          <div className="new-featured-header">
            <h2 className="new-section-title">Sản phẩm nổi bật {selectedCategory && `- ${selectedCategory}`}</h2>
            <div className="new-featured-filters">
              <button className="filter-icon-btn" aria-label="Filters">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14"></line>
                  <line x1="4" y1="10" x2="4" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="3"></line>
                  <line x1="20" y1="21" x2="20" y2="16"></line>
                  <line x1="20" y1="12" x2="20" y2="3"></line>
                  <line x1="1" y1="14" x2="7" y2="14"></line>
                  <line x1="9" y1="8" x2="15" y2="8"></line>
                  <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
              </button>
              <div className="sort-dropdown-container">
                <select className="sort-select" defaultValue="newest">
                  <option value="newest">Mới nhất</option>
                  <option value="popular">Bán chạy nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                </select>
              </div>
            </div>
          </div>

          <div className="new-products-grid">
            {loading ? (
              <div className="product-empty-state">Đang tải danh sách sản phẩm...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="product-empty-state">Chưa có sản phẩm nào thuộc danh mục này.</div>
            ) : (
              filteredProducts.slice((currentPage - 1) * 10, currentPage * 10).map((p) => renderProductCard(p))
            )}
          </div>

          {filteredProducts.length > 10 && (
            <div className="product-pagination">
              <button 
                className="pagination-btn" 
                disabled={currentPage === 1} 
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  document.querySelector(".new-featured-section")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                &lt;
              </button>

              {(() => {
                const totalPages = Math.ceil(filteredProducts.length / 10);
                const pages = [];
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(
                    <button 
                      key={i} 
                      className={`pagination-btn ${currentPage === i ? "active" : ""}`}
                      onClick={() => {
                        setCurrentPage(i);
                        document.querySelector(".new-featured-section")?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {i}
                    </button>
                  );
                }
                return pages;
              })()}

              <button 
                className="pagination-btn" 
                disabled={currentPage === Math.ceil(filteredProducts.length / 10)} 
                onClick={() => {
                  const totalPages = Math.ceil(filteredProducts.length / 10);
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  document.querySelector(".new-featured-section")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                &gt;
              </button>
            </div>
          )}
        </section>

        {/* Livestream Previews Section */}
        <section className="livestream-section">
          <div className="livestream-header">
            <div>
              <h2 className="livestream-title">Phiên Live Nhà Vườn</h2>
              <p className="livestream-subtitle">Theo dõi quy trình thu hoạch sạch trực tiếp tại nông trại</p>
            </div>
            <button className="livestream-view-all" onClick={() => { setSelectedCategory("Rau củ quả"); document.querySelector(".categories-section")?.scrollIntoView({ behavior: "smooth" }); }}>
              Xem tất cả phiên live
            </button>
          </div>

          <div className="livestream-grid">
            <div className="livestream-card">
              <div className="live-thumbnail" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=600)` }}>
                <span className="live-badge">● LIVE</span>
                <span className="live-viewers">1.2k người xem</span>
              </div>
              <div className="live-info">
                <div className="live-farmer">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80" alt="Farmer" className="live-farmer-avatar" />
                  <div className="live-farmer-details">
                    <h4 className="live-farmer-name">Chú Bảy Nông Dân</h4>
                    <p className="live-farm-title">Vườn Chôm Chôm Nhãn Đồng Nai</p>
                  </div>
                </div>
                <h3 className="live-stream-headline">Thu hoạch chôm chôm quả to, giòn ngọt tại vườn!</h3>
              </div>
            </div>

            <div className="livestream-card">
              <div className="live-thumbnail" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1595855759920-86582396756a?w=600)` }}>
                <span className="live-badge">● LIVE</span>
                <span className="live-viewers">856 người xem</span>
              </div>
              <div className="live-info">
                <div className="live-farmer">
                  <img src="https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=80" alt="Farmer" className="live-farmer-avatar" />
                  <div className="live-farmer-details">
                    <h4 className="live-farmer-name">Cô Hoa Đà Lạt</h4>
                    <p className="live-farm-title">Trang trại Rau củ Hữu cơ organic</p>
                  </div>
                </div>
                <h3 className="live-stream-headline">Cắt cải kale, xà lách giòn ngọt chuẩn sạch tại chỗ</h3>
              </div>
            </div>

            <div className="livestream-card">
              <div className="live-thumbnail" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600)` }}>
                <span className="live-badge">● LIVE</span>
                <span className="live-viewers">2.1k người xem</span>
              </div>
              <div className="live-info">
                <div className="live-farmer">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80" alt="Farmer" className="live-farmer-avatar" />
                  <div className="live-farmer-details">
                    <h4 className="live-farmer-name">Anh Hải Măng Cụt</h4>
                    <p className="live-farm-title">Vườn cây ăn trái Lái Thiêu</p>
                  </div>
                </div>
                <h3 className="live-stream-headline">Măng cụt đầu mùa siêu ngọt thanh, bao bù hư hao</h3>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="new-footer">
        <div className="footer-columns">
          <div className="footer-column footer-brand">
            <h3 className="footer-brand-title">AgriMarket Việt Nam</h3>
            <p className="footer-brand-desc">
              Kênh thương mại điện tử chuyên biệt cho nông nghiệp Việt, kết nối trực tiếp nhà vườn và người tiêu dùng.
            </p>
            <div className="footer-social-icons">
              <a href="#" className="social-icon" aria-label="Website">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="Globe">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" />
                  <path d="M16 19h6M19 16l3 3-3 3" />
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="Mail">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h4 className="footer-col-title">DANH MỤC NỔI BẬT</h4>
            <ul className="footer-links">
              <li>
                <span 
                  style={{ cursor: "pointer" }} 
                  onClick={() => { 
                    setSelectedCategory("Rau củ quả"); 
                    document.querySelector(".categories-section")?.scrollIntoView({ behavior: "smooth" }); 
                  }}
                >
                  Rau củ quả sạch
                </span>
              </li>
              <li>
                <span 
                  style={{ cursor: "pointer" }} 
                  onClick={() => { 
                    setSelectedCategory("Trái cây"); 
                    document.querySelector(".categories-section")?.scrollIntoView({ behavior: "smooth" }); 
                  }}
                >
                  Trái cây tươi ngon
                </span>
              </li>
              <li>
                <span 
                  style={{ cursor: "pointer" }} 
                  onClick={() => { 
                    setSelectedCategory("Cây lương thực"); 
                    document.querySelector(".categories-section")?.scrollIntoView({ behavior: "smooth" }); 
                  }}
                >
                  Gạo & Ngũ cốc sạch
                </span>
              </li>
              <li>
                <span 
                  style={{ cursor: "pointer" }} 
                  onClick={() => { 
                    setSelectedCategory("Nông sản chế biến"); 
                    document.querySelector(".categories-section")?.scrollIntoView({ behavior: "smooth" }); 
                  }}
                >
                  Nông sản chế biến
                </span>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-col-title">THÔNG TIN LIÊN HỆ</h4>
            <ul className="footer-contact-info">
              <li className="footer-contact-item">
                <span className="icon">📍</span>
                <span>268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh</span>
              </li>
              <li className="footer-contact-item">
                <span className="icon">📞</span>
                <span>Hotline: 1900 6789 (8:00 - 21:00)</span>
              </li>
              <li className="footer-contact-item">
                <span className="icon">✉️</span>
                <span>Email: hotro@agrimarket.vn</span>
              </li>
              <li className="footer-contact-item">
                <span className="icon">🧑‍🌾</span>
                <span>Hợp tác nhà vườn: <strong className="footer-contact-highlight">0909 123 456</strong></span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 AgriMarket Việt Nam. Kết nối bền vững.</p>
        </div>
      </footer>

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`custom-toast ${t.type}`}>
            <span className="custom-toast-icon">
              {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "⚠️"}
            </span>
            <span className="custom-toast-message">{t.message}</span>
            <button className="custom-toast-close" onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;

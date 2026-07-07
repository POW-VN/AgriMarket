// src/pages/Profile/Wishlist.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Tractor, Apple, X, MapPin, CheckCircle2, XCircle, AlertTriangle, Sprout, Leaf, Star } from "lucide-react";
import useProfile from "../../hooks/useProfile";
import ProfileLayout from "../../components/profile/ProfileLayout";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileFooter from "../../components/profile/ProfileFooter";
import wishlistService from "../../services/wishlistService";
import cartService from "../../services/cartService";
import "./Wishlist.css";
import "./Profile.css";

export default function Wishlist() {
  const navigate = useNavigate();
  const { profile, isProfileLoading } = useProfile();

  // Navigation section: PRODUCTS or FARMERS
  const [activeSection, setActiveSection] = useState("PRODUCTS");

  // Wishlist states
  const [products, setProducts] = useState([]);
  const [followedFarmers, setFollowedFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL"); // ALL, IN_STOCK, OUT_OF_STOCK
  const [removingIds, setRemovingIds] = useState(new Set()); // Track items animating out
  const [removingFarmerIds, setRemovingFarmerIds] = useState(new Set()); // Track farmers animating out

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Load wishlist products & followed farmers
  const loadWishlistData = async () => {
    setLoading(true);
    try {
      const prods = await wishlistService.getWishlistProducts();
      setProducts(prods);

      const farmers = await wishlistService.getFollowedFarmers();
      setFollowedFarmers(farmers);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu yêu thích:", err);
      showToast("Không thể tải danh sách yêu thích.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      loadWishlistData();
    }
  }, [profile]);

  // Reset search keyword when toggling sections
  useEffect(() => {
    setSearchKeyword("");
  }, [activeSection]);

  // Determine availability status (IN_STOCK or OUT_OF_STOCK)
  const getProductWishlistStatus = (p) => {
    if (p.stock === 0) return "OUT_OF_STOCK";
    return "IN_STOCK";
  };

  // Handle product removal
  const handleRemoveProduct = async (productId, productName) => {
    setRemovingIds((prev) => {
      const next = new Set(prev);
      next.add(productId);
      return next;
    });

    await wishlistService.toggleWishlist(productId);

    setTimeout(() => {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      showToast(`Đã xóa "${productName}" khỏi mục yêu thích.`, "info");
      window.dispatchEvent(new Event("wishlistUpdated"));
    }, 350);
  };

  // Handle farmer unfollow
  const handleUnfollowFarmer = async (farmerId, farmerName) => {
    setRemovingFarmerIds((prev) => {
      const next = new Set(prev);
      next.add(farmerId);
      return next;
    });

    await wishlistService.toggleFollowFarmer({ id: farmerId });

    setTimeout(() => {
      setFollowedFarmers((prev) => prev.filter((f) => f.id !== farmerId));
      setRemovingFarmerIds((prev) => {
        const next = new Set(prev);
        next.delete(farmerId);
        return next;
      });
      showToast(`Đã hủy theo dõi nhà vườn "${farmerName}".`, "info");
    }, 350);
  };

  // Add to cart functionality
  const handleAddToCart = async (product) => {
    try {
      const data = await cartService.addToCart(product.id, 1);
      window.dispatchEvent(new Event("cartUpdated"));
      showToast(`Đã thêm 1 ${product.unit} "${product.name}" vào giỏ hàng!`, "success");
    } catch (err) {
      console.error("Lỗi thêm vào giỏ hàng:", err);
      showToast("Không thể thêm vào giỏ hàng. Vui lòng thử lại!", "error");
    }
  };



  // Handle notify me click
  const handleNotifyMe = (product) => {
    showToast(`Đã đăng ký nhận thông báo cho "${product.name}" khi có hàng lại.`, "success");
  };

  // Filter products by search keyword and status
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.farmerName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.category.toLowerCase().includes(searchKeyword.toLowerCase());

      const status = getProductWishlistStatus(p);
      const matchesFilter =
        activeFilter === "ALL" || status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [products, searchKeyword, activeFilter]);

  // Filter followed farmers by search keyword
  const filteredFarmers = useMemo(() => {
    return followedFarmers.filter((f) => {
      return (
        f.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        f.location.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (f.description && f.description.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    });
  }, [followedFarmers, searchKeyword]);

  const productCounts = useMemo(() => {
    const res = { all: products.length, inStock: 0, outOfStock: 0 };
    products.forEach((p) => {
      const status = getProductWishlistStatus(p);
      if (status === "IN_STOCK") res.inStock++;
      else if (status === "OUT_OF_STOCK") res.outOfStock++;
    });
    return res;
  }, [products]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " đ";
  };

  if (isProfileLoading) {
    return (
      <div className="profile-center-state">
        <div className="profile-spinner"></div>
        <p>Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-center-state">
        <h2>Bạn chưa đăng nhập</h2>
        <p>Vui lòng đăng nhập để xem danh sách yêu thích.</p>
        <button className="profile-primary-button" onClick={() => navigate("/login")}>
          Đi tới đăng nhập
        </button>
      </div>
    );
  }

  return (
    <ProfileLayout profile={profile}>
      <section className="profile-content wishlist-page-container">
        
        {/* Header & Search */}
        <div className="wishlist-top-header">
          <ProfileHeader
            title="Mục yêu thích của tôi"
            subtitle={
              activeSection === "PRODUCTS"
                ? `${productCounts.all} sản phẩm đã được lưu lại.`
                : `${followedFarmers.length} nhà vườn đang được theo dõi.`
            }
          />
          <div className="wishlist-search-wrapper">
            <Search className="search-icon-glass" size={16} />
            <input
              type="text"
              placeholder={
                activeSection === "PRODUCTS"
                  ? "Tìm sản phẩm yêu thích..."
                  : "Tìm kiếm nhà vườn..."
              }
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="wishlist-search-input"
            />
          </div>
        </div>

        {/* Section Tabs (Segmented Controller) */}
        <div className="wishlist-section-tabs">
          <button
            className={`wishlist-sec-btn ${activeSection === "PRODUCTS" ? "active" : ""}`}
            onClick={() => setActiveSection("PRODUCTS")}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "center" }}
          >
            <Apple size={16} />
            Sản phẩm yêu thích ({productCounts.all})
          </button>
          <button
            className={`wishlist-sec-btn ${activeSection === "FARMERS" ? "active" : ""}`}
            onClick={() => setActiveSection("FARMERS")}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "center" }}
          >
            <Tractor size={16} />
            Nhà vườn yêu thích ({followedFarmers.length})
          </button>
        </div>

        {/* Sub-Filters for Products only */}
        {activeSection === "PRODUCTS" && products.length > 0 && (
          <div className="wishlist-filter-bar">
            <button
              className={`wishlist-tab-btn ${activeFilter === "ALL" ? "active" : ""}`}
              onClick={() => setActiveFilter("ALL")}
            >
              Tất cả ({productCounts.all})
            </button>
            <button
              className={`wishlist-tab-btn ${activeFilter === "IN_STOCK" ? "active" : ""}`}
              onClick={() => setActiveFilter("IN_STOCK")}
            >
              Còn hàng ({productCounts.inStock})
            </button>
            <button
              className={`wishlist-tab-btn ${activeFilter === "OUT_OF_STOCK" ? "active" : ""}`}
              onClick={() => setActiveFilter("OUT_OF_STOCK")}
            >
              Hết hàng ({productCounts.outOfStock})
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="wishlist-main-grid">
          {loading ? (
            <div className="wishlist-empty-box">
              <div className="wishlist-spinner-large"></div>
              <p>Đang tải dữ liệu yêu thích...</p>
            </div>
          ) : activeSection === "PRODUCTS" ? (
            /* ================= PRODUCTS VIEW ================= */
            filteredProducts.length === 0 ? (
              <div className="wishlist-empty-box glassmorphic-card">
                <span className="wishlist-empty-emoji">🍎</span>
                <h3>Danh sách trống</h3>
                <p>
                  {searchKeyword
                    ? "Không tìm thấy sản phẩm yêu thích nào khớp với tìm kiếm."
                    : "Bạn chưa lưu sản phẩm nào trong danh mục này."}
                </p>
                <Link to="/" className="profile-primary-button discover-button">
                  Khám phá nông sản ngay
                </Link>
              </div>
            ) : (
              <div className="wishlist-products-grid">
                {filteredProducts.map((p) => {
                  const status = getProductWishlistStatus(p);
                  const isRemoving = removingIds.has(p.id);

                  return (
                    <div
                      key={p.id}
                      className={`wishlist-prod-card ${isRemoving ? "removing-anim" : ""}`}
                    >
                      <div 
                        className="wishlist-img-container"
                        onClick={() => navigate(`/products/${p.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="wishlist-prod-img" />
                        ) : (
                          <div className="wishlist-img-fallback" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#81c784" }}><Sprout size={28} /></div>
                        )}

                        {status === "IN_STOCK" && (
                          <span className="wishlist-status-badge in-stock">Còn hàng</span>
                        )}
                        {status === "OUT_OF_STOCK" && (
                          <span className="wishlist-status-badge out-of-stock">Hết hàng</span>
                        )}

                        <button
                          className="wishlist-heart-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveProduct(p.id, p.name);
                          }}
                          title="Xóa khỏi mục yêu thích"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="heart-icon-svg"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                        </button>
                      </div>

                      <div className="wishlist-card-body">
                        <span className="wishlist-farm-name">{p.farmerName}</span>
                        <h3 className="wishlist-title-name">
                          <Link to={`/products/${p.id}`}>{p.name}</Link>
                        </h3>
                        
                        <div className="wishlist-tags-row">
                          {p.farmerOrganicUrl && <span className="wishlist-tag organic">Hữu cơ</span>}
                          {p.farmerVietgapUrl && <span className="wishlist-tag vietgap">VietGAP</span>}
                          {p.isLocal && <span className="wishlist-tag local">Địa phương</span>}
                        </div>

                        <p className="wishlist-desc-short">{p.description}</p>

                        <div className="wishlist-card-footer">
                          <div className="wishlist-price-box">
                            <span className="wishlist-price-amount">{formatPrice(p.price)}</span>
                            <span className="wishlist-price-unit">/ {p.unit}</span>
                          </div>

                          {status === "IN_STOCK" && (
                            <button
                              className="wishlist-action-btn add-to-cart"
                              onClick={() => handleAddToCart(p)}
                              title="Thêm vào giỏ"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                <line x1="12" y1="10" x2="16" y2="10"></line>
                                <line x1="14" y1="8" x2="14" y2="12"></line>
                              </svg>
                            </button>
                          )}

                          {status === "OUT_OF_STOCK" && (
                            <button
                              className="wishlist-action-btn notify-btn"
                              onClick={() => handleNotifyMe(p)}
                            >
                              Báo tôi
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* ================= FARMERS VIEW ================= */
            filteredFarmers.length === 0 ? (
              <div className="wishlist-empty-box glassmorphic-card">
                <Tractor className="wishlist-empty-emoji" size={48} style={{ color: "#84918c", marginBottom: "16px" }} />
                <h3>Chưa có nhà vườn nào</h3>
                <p>
                  {searchKeyword
                    ? "Không tìm thấy nhà vườn nào khớp với tìm kiếm."
                    : "Danh sách theo dõi trống. Bạn hãy nhấn Theo dõi trong trang chi tiết nông sản để ủng hộ các nhà vườn nhé!"}
                </p>
                <Link to="/" className="profile-primary-button discover-button">
                  Tìm kiếm nhà vườn
                </Link>
              </div>
            ) : (
              <div className="wishlist-farmers-grid">
                {filteredFarmers.map((f) => {
                  const isRemoving = removingFarmerIds.has(f.id);

                  return (
                    <div
                      key={f.id}
                      className={`wishlist-farmer-card ${isRemoving ? "removing-anim" : ""}`}
                    >
                      {/* Unfollow Button */}
                      <button
                        className="wishlist-unfollow-btn"
                        onClick={() => handleUnfollowFarmer(f.id, f.name)}
                        title="Hủy theo dõi"
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <X size={14} />
                      </button>

                      {/* Header section (Avatar & Info) */}
                      <div className="wishlist-farmer-header">
                        <div className="wishlist-farmer-avatar">
                          {f.avatarUrl ? (
                            <img src={f.avatarUrl} alt={f.name} />
                          ) : (
                            <div className="wishlist-farmer-avatar-fallback">
                              {f.name ? f.name.charAt(0).toUpperCase() : "N"}
                            </div>
                          )}
                        </div>
                        <div className="wishlist-farmer-title">
                          <h3>{f.name}</h3>
                          <p className="wishlist-farmer-loc" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <MapPin className="loc-icon" size={14} />
                            {f.location}
                          </p>
                        </div>
                      </div>

                      {/* Certifications Row */}
                      <div className="wishlist-farmer-certs">
                        {f.organicUrl && <span className="farmer-cert-badge organic" style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}><Leaf size={11} /> Hữu cơ</span>}
                        {f.vietgapUrl && <span className="farmer-cert-badge vietgap" style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}><CheckCircle2 size={11} /> VietGAP</span>}
                        {f.globalgapUrl && <span className="farmer-cert-badge globalgap" style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}><Star size={11} /> GlobalGAP</span>}
                        {!f.organicUrl && !f.vietgapUrl && !f.globalgapUrl && (
                          <span className="farmer-cert-badge standard">Nông sản sạch</span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="wishlist-farmer-desc">
                        {f.description || "Nhà vườn liên kết chuyên canh nông sản hữu cơ, đảm bảo an toàn sinh học và nguồn hàng tươi sạch mỗi ngày."}
                      </p>

                      {/* View farm details */}
                      <button
                        className="wishlist-visit-farm-btn"
                        onClick={() => {
                          navigate(`/farmer-profile/${f.id}`);
                        }}
                      >
                        Ghé thăm nhà vườn ➔
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </section>

      <ProfileFooter />

      {/* Custom Toast Notification */}
      {toast.show && (
        <div className={`custom-toast ${toast.type}`}>
          <span className="custom-toast-icon" style={{ display: "inline-flex", alignItems: "center" }}>
            {toast.type === "success" ? (
              <CheckCircle2 size={18} color="#10b981" />
            ) : toast.type === "error" ? (
              <XCircle size={18} color="#ef4444" />
            ) : (
              <AlertTriangle size={18} color="#f59e0b" />
            )}
          </span>
          <span className="custom-toast-message">{toast.message}</span>
          <button className="custom-toast-close" onClick={() => setToast({ show: false })} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <X size={14} />
          </button>
        </div>
      )}
    </ProfileLayout>
  );
}

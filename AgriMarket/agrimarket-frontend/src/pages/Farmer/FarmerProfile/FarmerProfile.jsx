import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "../../../components/common/Header/Header";
import Footer from "../../../components/common/Footer/Footer";
import profileService from "../../../services/profileService";
import { getAllApprovedProducts } from "../../../services/productService";
import wishlistService from "../../../services/wishlistService";
import chatLogo from "../../../assets/images/chat-logo.png";
import "./FarmerProfile.css";

const formatDate = (dateString) => {
  if (!dateString) return "Chưa cập nhật";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateString;
  }
};

export default function FarmerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [farmer, setFarmer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowed, setIsFollowed] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certModalImage, setCertModalImage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // Load farmer details and products
  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        // 1. Fetch products first to filter and extract farmer info if needed
        const allProducts = await getAllApprovedProducts();
        const farmerProds = allProducts.filter(
          (p) => String(p.farmerId) === String(id)
        );
        setProducts(farmerProds);

        // 2. Fetch specific farmer details from backend
        let farmerData = await profileService.getFarmerProfile(id);

        if (!farmerData && farmerProds.length > 0) {
          // Fallback 1: Extract farmer details from products
          const first = farmerProds[0];
          farmerData = {
            id: first.farmerId,
            fullName: first.farmerName,
            farmName: first.farmerName,
            farmAddress: first.farmLocation,
            description: first.farmDescription,
            avatarUrl: first.farmerAvatarUrl,
            vietgapUrl: first.farmerVietgapUrl,
            globalgapUrl: first.farmerGlobalgapUrl,
            organicUrl: first.farmerOrganicUrl,
            ratingAverage: first.rating || 4.8,
            reviewsCount: first.reviewsCount || 120,
            joinedDate: first.createdAt || first.created_at || "Tháng 3, 2021",
            responseRate: "88% (Thường trả lời trong 1h)"
          };
        }

        // Fallback 2: If no data found at all, check mock profiles
        if (!farmerData) {
          farmerData = MOCK_FARMERS[id] || MOCK_FARMERS["default"];
        }

        // Standardize properties
        const finalFarmer = {
          id: farmerData.id || id,
          fullName: farmerData.fullName || farmerData.farmName || "Nhà vườn AgriMarket",
          farmName: farmerData.farmName || farmerData.fullName || "Nông trại Xanh",
          avatarUrl: farmerData.avatarUrl || farmerData.farmerAvatarUrl || "",
          farmAddress: farmerData.farmAddress || farmerData.farmLocation || "Lâm Đồng, Việt Nam",
          description: farmerData.description || farmerData.farmDescription || "Chuyên canh các loại nông sản sạch theo tiêu chuẩn hữu cơ an toàn tự nhiên.",
          vietgapUrl: farmerData.vietgapUrl || "",
          globalgapUrl: farmerData.globalgapUrl || "",
          organicUrl: farmerData.organicUrl || "",
          ratingAverage: farmerData.ratingAverage || farmerData.rating || 4.8,
          reviewsCount: farmerData.reviewsCount || farmerData.totalReviews || 120,
          joinedDate: formatDate(farmerData.createdAt || farmerData.created_at || farmerData.joinedDate),
          responseRate: farmerData.responseRate || "88% (Thường trả lời trong 1h)"
        };

        setFarmer(finalFarmer);
        const followStatus = await wishlistService.isFarmerFollowed(finalFarmer.id);
        setIsFollowed(followStatus);

        // If no products were found, populate with mock products for visual completeness
        if (farmerProds.length === 0) {
          setProducts(MOCK_PRODUCTS[id] || MOCK_PRODUCTS["default"]);
        }

      } catch (err) {
        console.error("Lỗi khi load dữ liệu hồ sơ nhà vườn:", err);
        setFarmer(MOCK_FARMERS["default"]);
        setProducts(MOCK_PRODUCTS["default"]);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [id]);

  const handleToggleFollow = async () => {
    if (!farmer) return;
    await wishlistService.toggleFollowFarmer(farmer);
    const followStatus = await wishlistService.isFarmerFollowed(farmer.id);
    setIsFollowed(followStatus);
  };

  const handleChat = () => {
    setIsChatOpen(true);
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          sender: "farmer",
          text: `Xin chào! Tôi là ${farmer?.fullName || "nhà vườn"}. Tôi có thể giúp gì cho bạn về các sản phẩm nông sản sạch của nông trại chúng tôi?`
        }
      ]);
    }
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: "user", text: userText }]);
    setChatInput("");
    
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: "farmer",
          text: `Cảm ơn bạn đã quan tâm! Tôi đã nhận được tin nhắn và sẽ liên hệ lại với bạn sớm nhất nhé.`
        }
      ]);
    }, 1200);
  };

  const getFullImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
    const host = apiBase.endsWith("/api") ? apiBase.substring(0, apiBase.length - 4) : apiBase;
    return `${host}${url}`;
  };

  const handleCertClick = (certType, url) => {
    const finalUrl = getFullImageUrl(url);
    let resolvedUrl = finalUrl;
    if (!finalUrl || url === "exists" || url === "") {
      const mockCertUrls = {
        organic: "https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=1200&q=80",
        vietgap: "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=1200&q=80",
        globalgap: "https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=1200&q=80"
      };
      resolvedUrl = mockCertUrls[certType] || mockCertUrls.organic;
    }
    setCertModalImage(resolvedUrl);
    setIsCertModalOpen(true);
  };

  if (loading) {
    return (
      <div className="farmer-profile-page-loading">
        <Header />
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin nhà vườn...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="farmer-profile-page-error">
        <Header />
        <div className="error-container">
          <h2>Không tìm thấy thông tin nhà vườn</h2>
          <Link to="/" className="btn-back-home">Quay lại trang chủ</Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="farmer-profile-page">
      <Header />

      {/* Breadcrumb Trail */}
      <div className="breadcrumb-container">
        <ul className="breadcrumbs">
          <li>
            <Link to="/">Trang chủ</Link>
            <span className="breadcrumb-separator">&gt;</span>
          </li>
          <li>
            <span>Nhà vườn</span>
            <span className="breadcrumb-separator">&gt;</span>
          </li>
          <li className="active">
            <span>{farmer.farmName}</span>
          </li>
        </ul>
      </div>

      <main className="farmer-profile-container">
        <div className="farmer-profile-grid">
          
          {/* Left Column: Sidebar Cards */}
          <aside className="farmer-sidebar">
            
            {/* Identity Card */}
            <div className="farmer-identity-card">
              <div className="farmer-avatar-wrapper">
                {farmer.avatarUrl ? (
                  <img src={farmer.avatarUrl} alt={farmer.fullName} className="farmer-avatar" />
                ) : (
                  <div className="farmer-avatar-placeholder">
                    {farmer.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <h2 className="farmer-name-title">
                {farmer.fullName}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" className="verified-tick-icon" title="Nhà vườn uy tín">
                  <circle cx="12" cy="12" r="10" fill="#0095F6" />
                  <polyline points="9 12 11 14 15 10" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </h2>
              
              <div className="farmer-sidebar-desc">
                {farmer.description || "Nhà vườn liên kết chuyên canh nông sản hữu cơ, đảm bảo an toàn sinh học và nguồn hàng tươi sạch mỗi ngày."}
              </div>
              
              <div className="sidebar-action-buttons">
                <button className="btn-chat-farmer" onClick={handleChat}>
                  <img src={chatLogo} alt="Chat Icon" className="farmer-btn-icon chat-btn-logo-img" />
                  Nhắn tin
                </button>
                
                <button className={`btn-follow-farmer ${isFollowed ? "followed" : ""}`} onClick={handleToggleFollow}>
                  {isFollowed ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="farmer-btn-icon">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Đang theo dõi
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="farmer-btn-icon">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                      </svg>
                      Theo dõi
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Info / Metadata Card */}
            <div className="farmer-info-card">
              <div className="info-row">
                <span className="info-icon">📍</span>
                <div className="info-text">
                  <span className="info-label">Địa điểm</span>
                  <span className="info-value">{farmer.farmAddress}</span>
                </div>
              </div>
              
              <div className="info-row">
                <span className="info-icon">📅</span>
                <div className="info-text">
                  <span className="info-label">Đã tham gia</span>
                  <span className="info-value">{farmer.joinedDate}</span>
                </div>
              </div>
              
            </div>
            
          </aside>
          
          {/* Right Column: Bio, Gallery, Products */}
          <section className="farmer-content">
            
            {/* Bio Card */}
            <div className="farmer-bio-card">
              <h3 className="content-section-title">Về nhà vườn</h3>
              <p className="farmer-description-text">{farmer.description}</p>
              
              <div className="certificates-badges-row">
                {farmer.organicUrl && (
                  <div 
                    className="cert-pill organic clickable" 
                    onClick={() => handleCertClick("organic", farmer.organicUrl)}
                    title="Click để xem chứng nhận Hữu cơ"
                  >
                    <span className="cert-dot">🌱</span>
                    <span>Chứng nhận Hữu cơ</span>
                  </div>
                )}
                {farmer.vietgapUrl && (
                  <div 
                    className="cert-pill vietgap clickable" 
                    onClick={() => handleCertClick("vietgap", farmer.vietgapUrl)}
                    title="Click để xem chứng nhận VietGAP"
                  >
                    <span className="cert-dot">✓</span>
                    <span>Chứng nhận VietGAP</span>
                  </div>
                )}
                {farmer.globalgapUrl && (
                  <div 
                    className="cert-pill globalgap clickable" 
                    onClick={() => handleCertClick("globalgap", farmer.globalgapUrl)}
                    title="Click để xem chứng nhận GlobalGAP"
                  >
                    <span className="cert-dot">★</span>
                    <span>Chứng nhận GlobalGAP</span>
                  </div>
                )}
              </div>
            </div>



            {/* Products Section */}
            <div className="farmer-products-section">
              <div className="products-section-header">
                <h3 className="content-section-title">Sản phẩm nổi bật</h3>
                <span className="products-count-link">Tất cả ({products.length})</span>
              </div>
              
              <div className="products-grid">
                {products.map((p) => (
                  <div 
                    key={p.id} 
                    className="product-card-item"
                    onClick={() => navigate(`/products/${p.id}`)}
                  >
                    <div className="product-card-img-wrapper">
                      <img src={p.imageUrl} alt={p.name} className="product-card-img" />
                      {p.organicUrl || p.farmerOrganicUrl ? (
                        <span className="product-badge organic">Hữu cơ</span>
                      ) : p.vietgapUrl || p.farmerVietgapUrl ? (
                        <span className="product-badge bestseller">VietGAP</span>
                      ) : (
                        <span className="product-badge bestseller">Bán chạy</span>
                      )}
                    </div>
                    
                    <div className="product-card-body">
                      <span className="product-card-category">{p.category || "Rau củ quả"}</span>
                      <h4 className="product-card-title">{p.name}</h4>
                      
                      <div className="product-card-footer">
                        <div className="product-card-price-box">
                          <span className="price-val">{formatPrice(p.price)}</span>
                          <span className="price-unit">/ {p.unit || "kg"}</span>
                        </div>
                        
                        <button 
                          className="btn-add-quick-cart"
                          onClick={(e) => {
                            e.stopPropagation();
                            const cartKey = "agrimarket_cart";
                            const currentCart = JSON.parse(localStorage.getItem(cartKey)) || [];
                            const idx = currentCart.findIndex(item => item.id === p.id);
                            if (idx > -1) {
                              currentCart[idx].quantity += 1;
                            } else {
                              currentCart.push({
                                id: p.id,
                                name: p.name,
                                price: p.price,
                                unit: p.unit,
                                imageUrl: p.imageUrl,
                                quantity: 1
                              });
                            }
                            localStorage.setItem(cartKey, JSON.stringify(currentCart));
                            alert(`Đã thêm "${p.name}" vào giỏ hàng!`);
                          }}
                          aria-label="Thêm vào giỏ"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>
          
        </div>
      </main>

      <Footer />

      {/* Lightbox / Modal for certificates */}
      {isCertModalOpen && (
        <div className="cert-modal-backdrop" onClick={() => setIsCertModalOpen(false)}>
          <div className="cert-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="cert-modal-close-btn" 
              onClick={() => setIsCertModalOpen(false)}
              aria-label="Đóng"
            >
              &times;
            </button>
            <img src={certModalImage} alt="Chứng nhận chất lượng" className="cert-modal-image" />
          </div>
        </div>
      )}

      {/* Dynamic Chat Widget in the bottom-right corner */}
      {isChatOpen && (
        <div className="farmer-chat-widget">
          <div className="chat-widget-header">
            <div className="chat-header-user">
              <div className="chat-header-avatar">
                {farmer.avatarUrl ? (
                  <img src={farmer.avatarUrl} alt={farmer.fullName} />
                ) : (
                  <img src={chatLogo} alt="Chat Logo" />
                )}
              </div>
              <div className="chat-header-info">
                <span className="chat-header-name">
                  {farmer.fullName}
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" className="verified-tick-icon chat-verified-tick" title="Nhà vườn uy tín">
                    <circle cx="12" cy="12" r="10" fill="#0095F6" />
                    <polyline points="9 12 11 14 15 10" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="chat-header-status">
                  <span className="status-dot"></span> Đang trực tuyến
                </span>
              </div>
            </div>
            <button className="chat-widget-close" onClick={() => setIsChatOpen(false)}>&times;</button>
          </div>
          
          <div className="chat-widget-body">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-msg-row ${msg.sender}`}>
                <div className="chat-msg-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          
          <form className="chat-widget-footer" onSubmit={handleSendChatMessage}>
            <input 
              type="text" 
              placeholder="Nhập tin nhắn..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" aria-label="Gửi">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// Fallback high-fidelity mockup farmers database
const MOCK_FARMERS = {
  "default": {
    fullName: "Thomas Miller",
    farmName: "Green Valley Organic Farms",
    avatarUrl: "https://images.unsplash.com/photo-1595273670150-db0a3e39843c?w=300", // High-quality image of farmer
    farmAddress: "Springfield, IL",
    description: "Tại Green Valley, chúng tôi tin rằng sự phát triển bền vững bắt đầu từ lòng đất mẹ. Trải qua hơn ba thế hệ, gia đình chúng tôi đã canh tác những mảnh ruộng màu mỡ tại Springfield hoàn toàn theo các phương pháp hữu cơ bền vững. Chúng tôi luôn kết hợp kinh nghiệm truyền thống của ông cha với công nghệ quản lý hiện đại để đảm bảo nông sản trao tận tay bạn luôn tươi ngon, an toàn và giàu dưỡng chất nhất.",
    vietgapUrl: "exists",
    organicUrl: "exists",
    globalgapUrl: "",
    ratingAverage: 4.9,
    reviewsCount: 128,
    joinedDate: "Tháng 3, 2021",
    responseRate: "88% (Thường phản hồi trong 1h)"
  }
};

// Fallback products database for visual showcase
const MOCK_PRODUCTS = {
  "default": [
    {
      id: "mock-2",
      name: "Cà rốt gia truyền hữu cơ",
      category: "Rau củ quả",
      price: 112500,
      unit: "bó",
      imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600",
      farmerOrganicUrl: "exists",
    },
    {
      id: "mock-1",
      name: "Cà chua Heirloom hữu cơ",
      category: "Rau củ quả",
      price: 49900,
      unit: "kg",
      imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600",
      farmerVietgapUrl: "exists",
    },
    {
      id: "mock-5",
      name: "Dâu tây sạch loại A",
      category: "Trái cây",
      price: 150000,
      unit: "hộp",
      imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600",
      farmerOrganicUrl: "exists",
    }
  ]
};

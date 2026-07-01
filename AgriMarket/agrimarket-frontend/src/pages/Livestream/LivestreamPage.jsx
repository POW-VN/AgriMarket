import React, { useState, useEffect, useRef } from "react";
import Header from "../../components/common/Header/Header";
import "./LivestreamPage.css";

// Import images from the assets folder
import farmerVideoImg from "../../assets/images/farmer_livestream_video.png";
import farmerAvatarImg from "../../assets/images/thomas_miller_avatar.png";
import honeyImg from "../../assets/images/wildflower_honey.png";
import carrotsImg from "../../assets/images/rainbow_carrots.png";

const LivestreamPage = () => {
  // Video player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(5085); // 01:24:45
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);

  // Farmer follow state
  const [isFollowing, setIsFollowing] = useState(false);

  // Voucher state
  const [voucherClaimed, setVoucherClaimed] = useState(false);
  const [voucherTime, setVoucherTime] = useState(296); // 04:56 (seconds)

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      user: "Sarah J.",
      text: "Are the carrots sweet this season?",
      isBot: false,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
    },
    {
      id: 2,
      user: "Mike L.",
      text: "Just bought 2 jars of honey! 🍯",
      isBot: false,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
    },
    {
      id: 3,
      user: "FarmConnect Bot",
      text: "Don't forget to claim the 20% off voucher before the stream ends!",
      isBot: true,
      avatar: ""
    },
    {
      id: 4,
      user: "Elena U.",
      text: "When is the next harvest?",
      isBot: false,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
    }
  ]);

  const chatEndRef = useRef(null);
  const videoTimerRef = useRef(null);
  const voucherTimerRef = useRef(null);
  const chatSimRef = useRef(null);

  // Random names and messages for simulating other users' chat comments
  const mockUsers = [
    { name: "John Doe", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
    { name: "Maria Green", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" },
    { name: "David K.", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100" },
    { name: "Emma Watson", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" },
    { name: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100" }
  ];

  const mockComments = [
    "Nhà vườn này mật ong ngon lắm ạ, em mua lần thứ 3 rồi!",
    "Cà rốt nhìn tươi ngon quá, có ship đi tỉnh không anh?",
    "Voucher 20% áp dụng cho toàn bộ đơn hàng luôn đúng không ạ?",
    "Hôm nay nông trại đẹp trời thế, thích quá!",
    "Đã nhận voucher thành công. Vừa chốt đơn mật ong xong nhé!",
    "Rau cải đợt này khi nào thu hoạch vậy Thomas?",
    "Ủng hộ nông dân Việt Nam và nông nghiệp hữu cơ sạch 👍",
    "Giao hàng nhanh lắm cả nhà, đóng gói rất cẩn thận nữa."
  ];

  // Helper to show custom toasts
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // 1. Live stream counter timer & voucher timer logic
  useEffect(() => {
    // Voucher countdown
    voucherTimerRef.current = setInterval(() => {
      setVoucherTime((prev) => {
        if (prev <= 1) {
          clearInterval(voucherTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Live video duration timer
    videoTimerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        // Only increment if simulated as playing
        return isPlaying ? prev + 1 : prev;
      });
    }, 1000);

    // Scroll chat to bottom on load
    scrollToBottom();

    return () => {
      clearInterval(voucherTimerRef.current);
      clearInterval(videoTimerRef.current);
    };
  }, [isPlaying]);

  // 2. Automated chat comments simulator
  useEffect(() => {
    chatSimRef.current = setInterval(() => {
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const randomComment = mockComments[Math.floor(Math.random() * mockComments.length)];
      
      // Occasionally print bot message, otherwise visitor comment
      const isBot = Math.random() < 0.2;
      
      const newMsg = {
        id: Date.now(),
        user: isBot ? "FarmConnect Bot" : randomUser.name,
        text: isBot 
          ? "💡 Hãy nhanh tay nhấn 'Nhận Voucher' để được giảm giá 20% trực tiếp trên livestream này!" 
          : randomComment,
        isBot: isBot,
        avatar: isBot ? "" : randomUser.avatar
      };

      setChatMessages((prev) => [...prev, newMsg]);
    }, 7000);

    return () => clearInterval(chatSimRef.current);
  }, []);

  // 3. Scroll to bottom when messages list updates
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Format time (seconds to hh:mm:ss)
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [
      h > 0 ? String(h).padStart(2, "0") : null,
      String(m).padStart(2, "0"),
      String(s).padStart(2, "0")
    ].filter(Boolean).join(":");
  };

  // Format voucher countdown time (mm:ss)
  const formatVoucherTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Interactive toggle for play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    setShowPlayOverlay(true);
    setTimeout(() => setShowPlayOverlay(false), 800);
  };

  // Mute volume toggle
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Claim voucher click handler
  const handleClaimVoucher = () => {
    if (voucherClaimed) return;
    setVoucherClaimed(true);
    showToast("Chúc mừng! Bạn đã nhận thành công Voucher giảm giá 20% Mật ong thiên nhiên. Mã giảm giá đã được thêm vào tài khoản của bạn!", "success");
  };

  // Follow farmer click handler
  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    if (!isFollowing) {
      showToast("Đã theo dõi nhà vườn Thomas Miller. Bạn sẽ nhận được thông báo khi nông trại này lên sóng livestream lần tới!", "success");
    } else {
      showToast("Đã hủy theo dõi nhà vườn Thomas Miller.", "info");
    }
  };

  // Submit comment in live chat
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const currentUser = JSON.parse(localStorage.getItem("agrimarket_user")) || { fullName: "Bạn", avatarUrl: "" };

    const newUserMsg = {
      id: Date.now(),
      user: currentUser.fullName || "Bạn",
      text: chatInput.trim(),
      isBot: false,
      avatar: currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
    };

    setChatMessages((prev) => [...prev, newUserMsg]);
    setChatInput("");
  };

  // Functional add to cart logic (simulated purchase on live stream)
  const handleBuyProduct = (product) => {
    // Structure of cart item corresponding to CartPage.jsx
    const localCart = JSON.parse(localStorage.getItem("agrimarket_cart")) || [];
    const existingItemIndex = localCart.findIndex((item) => item.id === product.id);

    if (existingItemIndex > -1) {
      localCart[existingItemIndex].quantity += 1;
    } else {
      localCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        imageUrl: product.imageUrl,
        quantity: 1,
        checked: true,
        stockQuantity: product.stockQuantity,
        farmerId: product.farmerId,
        farmerName: product.farmerName
      });
    }

    localStorage.setItem("agrimarket_cart", JSON.stringify(localCart));
    
    // Dispatch custom event to trigger Header cart badge update
    window.dispatchEvent(new Event("cartUpdated"));

    showToast(`Đã thêm "${product.name}" vào giỏ hàng thành công! 🛒`, "success");
  };

  // Mock products list corresponding to the design
  const featuredProducts = [
    {
      id: "mock-honey-1",
      name: "Raw Wildflower Honey",
      price: 12.99,
      unit: "500g Jar",
      imageUrl: honeyImg,
      farmerId: 1,
      farmerName: "Thomas Miller (Sun Valley Organics)",
      stockQuantity: 50
    },
    {
      id: "mock-carrots-1",
      name: "Organic Rainbow Carrots",
      price: 4.50,
      unit: "1 lb Bunch",
      imageUrl: carrotsImg,
      farmerId: 1,
      farmerName: "Thomas Miller (Sun Valley Organics)",
      stockQuantity: 100
    }
  ];

  return (
    <div className="livestream-page-root">
      {/* App Header */}
      <Header activeTab="live" />

      {/* Main Livestream Layout */}
      <main className="livestream-main-wrapper">
        <div className="livestream-layout-grid">
          
          {/* LEFT SIDE: Video Feed & Info */}
          <div className="livestream-left-column">
            
            {/* Simulated Live Video Player */}
            <div className="video-player-container">
              <div className="video-viewport" onClick={togglePlay}>
                <img 
                  src={farmerVideoImg} 
                  alt="Live Farm Stream" 
                  className={`video-background-img ${isPlaying ? "playing" : "paused"}`}
                />
                
                {/* Play/Pause center overlay icon on hover or action */}
                {showPlayOverlay && (
                  <div className="center-play-overlay">
                    {isPlaying ? (
                      <svg viewBox="0 0 24 24" width="48" height="48" fill="white">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="48" height="48" fill="white">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    )}
                  </div>
                )}

                {/* Top Overlay Badges */}
                <div className="video-top-overlays">
                  <span className="live-status-badge">
                    <span className="live-dot"></span>
                    LIVE
                  </span>
                  <span className="viewers-count-badge">
                    <svg className="viewer-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    1.2k watching
                  </span>
                </div>

                {/* Bottom Video Controls */}
                <div className="video-bottom-controls" onClick={(e) => e.stopPropagation()}>
                  
                  {/* Progress Line */}
                  <div className="video-progress-bar">
                    <div className="progress-fill" style={{ width: isPlaying ? "100%" : "99%" }}></div>
                  </div>

                  <div className="controls-flex">
                    <div className="controls-left">
                      {/* Play/Pause Button */}
                      <button className="control-btn" onClick={togglePlay} title={isPlaying ? "Tạm dừng" : "Phát"}>
                        {isPlaying ? (
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>

                      {/* Volume controls */}
                      <div className="volume-control-group">
                        <button className="control-btn" onClick={toggleMute}>
                          {isMuted || volume === 0 ? (
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                            </svg>
                          )}
                        </button>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={isMuted ? 0 : volume} 
                          onChange={(e) => {
                            setVolume(Number(e.target.value));
                            if (isMuted) setIsMuted(false);
                          }}
                          className="volume-slider-bar" 
                        />
                      </div>

                      {/* Timer */}
                      <span className="live-timer-duration">
                        {formatTime(currentTime)}
                      </span>
                    </div>

                    <div className="controls-right">
                      {/* Settings Gear */}
                      <button className="control-btn" title="Cài đặt">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                        </svg>
                      </button>

                      {/* Fullscreen */}
                      <button className="control-btn" title="Toàn màn hình">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Farmer Profile & Voucher Row */}
            <div className="farmer-voucher-cards-row">
              
              {/* Farmer Info Card */}
              <div className="farmer-profile-card">
                <div className="profile-details-left">
                  <img src={farmerAvatarImg} alt="Thomas Miller" className="farmer-avatar-circle" />
                  <div className="farmer-meta-text">
                    <h3 className="farmer-name-heading">Thomas Miller</h3>
                    <p className="farm-brand-name">Sun Valley Organics</p>
                    <span className="verified-badge-label">
                      <svg className="verified-badge-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Verified Farm
                    </span>
                  </div>
                </div>
                <button 
                  className={`follow-toggle-btn ${isFollowing ? "following-state" : "unfollowed-state"}`}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? (
                    <>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ marginRight: "4px" }}>
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                      </svg>
                      Following
                    </>
                  ) : (
                    "+ Follow"
                  )}
                </button>
              </div>

              {/* Live Voucher Coupon Card */}
              <div className="live-voucher-deal-card">
                <div className="voucher-details-left">
                  <div className="deal-status-badge">
                    LIVE ONLY DEAL
                  </div>
                  <h4 className="voucher-promo-text">20% Off Fresh Honey</h4>
                  <div className="voucher-timer-countdown">
                    Ends in <span className="timer-digits-monospace">{formatVoucherTime(voucherTime)}</span>
                  </div>
                </div>
                <button 
                  className={`claim-voucher-action-btn ${voucherClaimed ? "claimed-state" : "active-state"}`}
                  onClick={handleClaimVoucher}
                  disabled={voucherClaimed}
                >
                  <svg className="voucher-ticket-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M20 12c0-1.1.9-2 2-2V8c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2v2c1.1 0 1.99.9 1.99 2s-.89 2-2 2v2c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-2c-1.1 0-2-.9-2-2zm-9 1.5H9v-3h2v3zm4 0h-2v-3h2v3z"/>
                  </svg>
                  {voucherClaimed ? "Claimed" : "Claim Voucher"}
                </button>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE: Chat & Products */}
          <div className="livestream-right-column">
            
            {/* Live Chat Panel */}
            <div className="live-chat-panel-card">
              <div className="chat-header-row">
                <svg className="chat-bubble-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                </svg>
                <h3 className="chat-title-heading">Live Chat</h3>
              </div>

              {/* Scrollable chat messages container */}
              <div className="chat-messages-container">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`chat-message-bubble-wrapper ${msg.isBot ? "bot-highlight-bubble" : ""}`}
                  >
                    {!msg.isBot && (
                      <img 
                        src={msg.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
                        alt={msg.user} 
                        className="chat-user-avatar-circle" 
                      />
                    )}
                    <div className="message-content-inner">
                      <div className="chat-user-name-title">
                        {msg.isBot ? (
                          <span className="bot-badge-name-row">
                            <svg className="bot-status-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                              <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zm-2 10H6V7h12v12zm-9-6c-.83 0-1.5-.67-1.5-1.5S8.17 10 9 10s1.5.67 1.5 1.5S9.83 13 9 13zm6 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                            </svg>
                            {msg.user}
                          </span>
                        ) : (
                          msg.user
                        )}
                      </div>
                      <p className="chat-message-body-text">{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChat} className="chat-input-row-form">
                <input
                  type="text"
                  placeholder="Say hello..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="chat-text-input-field"
                />
                <button type="submit" className="chat-submit-action-btn" title="Gửi tin nhắn">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Featured Products list panel */}
            <div className="featured-products-panel-card">
              <div className="products-header-row">
                <svg className="shopping-bag-status-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
                </svg>
                <h3 className="products-title-heading">Featured in Stream</h3>
              </div>

              <div className="products-list-scrollable">
                {featuredProducts.map((prod) => (
                  <div key={prod.id} className="product-row-item-card">
                    <img src={prod.imageUrl} alt={prod.name} className="product-thumbnail-img" />
                    <div className="product-details-mid">
                      <h4 className="product-title-text">{prod.name}</h4>
                      <p className="product-specifications-text">{prod.unit}</p>
                      <span className="product-price-label">${prod.price.toFixed(2)}</span>
                    </div>
                    <button 
                      className="product-purchase-action-btn"
                      onClick={() => handleBuyProduct(prod)}
                    >
                      Buy
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Stacked Toasts Container */}
      {toast.show && (
        <div className="toast-container">
          <div className={`custom-toast ${toast.type}`}>
            <span className="custom-toast-icon">
              {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "i"}
            </span>
            <span className="custom-toast-message">{toast.message}</span>
            <button className="custom-toast-close" onClick={() => setToast({ show: false })}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivestreamPage;

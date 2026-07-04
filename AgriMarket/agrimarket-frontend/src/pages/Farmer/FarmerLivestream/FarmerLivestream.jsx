import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import * as productService from "../../../services/productService";
import "./FarmerLivestream.css";

export const FarmerLivestream = () => {
  const { farmerProfile, currentUser } = useOutletContext();

  // Step state: 'setup' (preparation), 'live' (broadcasting), 'ended' (showing report)
  const [streamState, setStreamState] = useState("setup");

  // Form setup states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [voucherPercent, setVoucherPercent] = useState(10); // 10%, 15%, 20%, 0 for none
  const [farmerProducts, setFarmerProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [productDiscounts, setProductDiscounts] = useState({}); // { productId: discount% }

  // Hardware states
  const [isCamOn, setIsCamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [cameraStream, setCameraStream] = useState(null);
  const [audioLevel, setAudioLevel] = useState(40);
  const videoRef = useRef(null);

  // Active Livestream Stats (Simulated)
  const [liveSessionId, setLiveSessionId] = useState(null);
  const [viewersCount, setViewersCount] = useState(0);
  const [heartsCount, setHeartsCount] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState([]); // Array of keys/positions for render
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [streamDuration, setStreamDuration] = useState(0); // in seconds
  const [pinnedProductId, setPinnedProductId] = useState(null);

  // Final Report Stats
  const [reportStats, setReportStats] = useState({
    duration: "00:00",
    peakViewers: 0,
    hearts: 0,
    orders: 0,
    newFollowers: 0,
  });

  // Timers and references
  const streamTimerRef = useRef(null);
  const viewersTimerRef = useRef(null);
  const chatsTimerRef = useRef(null);
  const chatEndRef = useRef(null);

  // Fetch Farmer Products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await productService.getFarmerProducts();
        // Only keep approved products
        const approved = products.filter(p => p.status === "approved" || p.status === "active");
        setFarmerProducts(approved.length > 0 ? approved : products);
      } catch (err) {
        console.error("Lỗi lấy danh sách sản phẩm nông dân:", err);
      }
    };
    fetchProducts();
  }, []);

  // WebRTC camera setup during preparation or live
  useEffect(() => {
    if (streamState === "setup" || streamState === "live") {
      if (isCamOn) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: isMicOn })
          .then((stream) => {
            setCameraStream(stream);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch((err) => {
            console.warn("Không thể truy cập camera thực tế. Chuyển sang mô phỏng.", err);
            setCameraStream(null);
          });
      } else {
        if (cameraStream) {
          cameraStream.getTracks().forEach((track) => track.stop());
          setCameraStream(null);
        }
      }
    }

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCamOn, streamState]);

  // Audio level simulator
  useEffect(() => {
    let interval;
    if (isMicOn && (streamState === "setup" || streamState === "live")) {
      interval = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 60) + 15);
      }, 300);
    } else {
      setAudioLevel(0);
    }
    return () => clearInterval(interval);
  }, [isMicOn, streamState]);

  // Autoscroll chat box
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Manage Active Livestream Timers (Simulated Chat, Viewers, Time Ticker)
  useEffect(() => {
    if (streamState === "live") {
      // 1. Stream Duration Timer
      setStreamDuration(0);
      streamTimerRef.current = setInterval(() => {
        setStreamDuration((prev) => prev + 1);
      }, 1000);

      // 2. Viewers simulator
      setViewersCount(1);
      viewersTimerRef.current = setInterval(() => {
        setViewersCount((prev) => {
          const change = Math.floor(Math.random() * 7) - 2; // general upward trend initially
          const next = prev + change;
          return next < 1 ? 1 : next;
        });
      }, 3000);

      // 3. Automated Viewer Chats simulator
      const mockComments = [
        "Rau củ nhìn sạch và tươi ngon quá chủ vườn ơi! 🌱",
        "Có giao nhanh trong ngày ở thành phố không ạ?",
        "Em vừa lấy voucher 15% rồi nha, tí đặt liền.",
        "Nông trại mình ở đâu vậy anh?",
        "Nhìn sầu riêng Ri6 chín ngon quá thèm quá đi thui 🤤",
        "Đã theo dõi kênh! Mong chờ đợt thu hoạch tới.",
        "Sản phẩm đạt chứng nhận VietGAP chuẩn sạch đúng ko ạ?",
        "Mới nhận đơn mật ong hôm qua, thơm lừng luôn ạ!",
        "Cho em hỏi quả này để được mấy ngày thế ạ?",
        "Đặt mua 2 ký cà chua rồi nha chủ vườn uy tín 👍",
      ];
      const mockUsers = [
        "Minh Khôi", "Thu Trang", "Văn Hùng", "Thanh Thảo",
        "Hoàng Nam", "Ngọc Ánh", "Hải Đăng", "Lan Anh",
        "Quốc Bảo", "Mai Phương", "Đức Huy", "Tố Uyên"
      ];

      setChatMessages([
        { id: "sys-1", type: "system", text: "Hệ thống: Kết nối livestream ổn định. Phiên live bắt đầu phát sóng!" },
        { id: "sys-2", type: "system", text: "Mẹo: Hãy ghim nông sản để thu hút người mua bấm đặt hàng trực tiếp." }
      ]);

      chatsTimerRef.current = setInterval(() => {
        // Decide whether a chat or a like/heart happens
        const isComment = Math.random() > 0.4;
        if (isComment) {
          const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
          const randomText = mockComments[Math.floor(Math.random() * mockComments.length)];
          setChatMessages((prev) => [
            ...prev,
            {
              id: `comment-${Date.now()}-${Math.random()}`,
              type: "buyer",
              user: randomUser,
              text: randomText
            }
          ]);
        } else {
          // Trigger a heart burst
          triggerHeartBurst();
        }
      }, 4000);
    }

    return () => {
      clearInterval(streamTimerRef.current);
      clearInterval(viewersTimerRef.current);
      clearInterval(chatsTimerRef.current);
    };
  }, [streamState]);

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Handle product selection / checkbox changes
  const handleProductCheckboxChange = (productId) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        // Set a default discount matching the active voucher percent (default to 10 if none)
        const defaultDiscount = voucherPercent > 0 ? voucherPercent : 10;
        setProductDiscounts(discs => ({
          ...discs,
          [productId]: discs[productId] !== undefined ? discs[productId] : defaultDiscount
        }));
        return [...prev, productId];
      }
    });
  };

  const handleDiscountChange = (productId, value) => {
    if (value === "") {
      setProductDiscounts((prev) => ({
        ...prev,
        [productId]: ""
      }));
      return;
    }
    const percent = Math.min(Math.max(parseInt(value) || 0, 0), 90);
    setProductDiscounts((prev) => ({
      ...prev,
      [productId]: percent
    }));
  };

  const handleVoucherPercentChange = (percent) => {
    setVoucherPercent(percent);
    if (percent > 0) {
      setProductDiscounts((prev) => {
        const next = { ...prev };
        selectedProductIds.forEach((id) => {
          next[id] = percent;
        });
        return next;
      });
    }
  };

  // Launch Livestream Session
  const handleStartLivestream = () => {
    if (!title.trim()) {
      alert("Vui lòng nhập Tiêu đề phiên livestream!");
      return;
    }

    const liveId = `custom-live-${Date.now()}`;
    setLiveSessionId(liveId);

    // Build product objects with discounts applied
    const selectedProductsDetails = farmerProducts
      .filter((p) => selectedProductIds.includes(p.id))
      .map((p) => {
        const discount = voucherPercent !== 0 ? (parseInt(productDiscounts[p.id]) || 0) : 0;
        const livePrice = discount > 0 ? Math.round(p.price * (1 - discount / 100)) : p.price;
        return {
          id: p.id,
          name: p.name,
          originalPrice: p.price,
          price: livePrice, // discounted price
          unit: p.unit || "kg",
          imageUrl: p.imageUrl,
          discountPercent: discount
        };
      });

    // Default pin is the first selected product, if any
    if (selectedProductsDetails.length > 0) {
      setPinnedProductId(selectedProductsDetails[0].id);
    }

    // Save customized live details to localStorage for buyer view
    const newLiveSession = {
      id: liveId,
      farmerName: currentUser?.fullName || "Nhà vườn AgriMarket",
      farmerBrand: farmerProfile?.farmName || "Nông trại sạch địa phương",
      farmerAvatar: farmerProfile?.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
      title: title,
      description: description || "Chào mừng quý khách đến với phiên livestream thực tế tại nông trại của chúng tôi!",
      status: "live",
      viewers: "0 đang xem",
      thumbnail: selectedProductsDetails[0]?.imageUrl || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800",
      tags: ["Trực tiếp tại vườn", "Nông sản sạch", voucherPercent > 0 ? `Voucher ${voucherPercent}%` : "Săn Deal"],
      scheduledTime: "Đang phát trực tiếp",
      products: selectedProductsDetails,
      voucherTitle: voucherPercent > 0 ? `Giảm ${voucherPercent}% Toàn Trang Trại` : null,
      voucherPercent: voucherPercent
    };

    // Store in localStorage lists
    try {
      const storedLives = JSON.parse(localStorage.getItem("farmer_custom_livestreams")) || [];
      localStorage.setItem("farmer_custom_livestreams", JSON.stringify([newLiveSession, ...storedLives]));
      localStorage.setItem("active_farmer_livestream_session", JSON.stringify(newLiveSession));
    } catch (e) {
      console.error("Lỗi lưu trữ dữ liệu livestream:", e);
    }

    // Move to broadcasting state
    setStreamState("live");
  };

  // Host sends chat comment
  const handleHostSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        id: `host-${Date.now()}`,
        type: "host",
        user: "Nhà vườn (Bạn)",
        text: chatInput.trim()
      }
    ]);
    setChatInput("");
  };

  // Interactive Hearts
  const triggerHeartBurst = () => {
    setHeartsCount((h) => h + 1);
    const newHeartId = Date.now() + Math.random();
    setFloatingHearts((prev) => [...prev, newHeartId]);

    // Cleanup heart after 2s
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((id) => id !== newHeartId));
    }, 2000);
  };

  // End Livestream and Show Stats
  const handleEndLivestream = () => {
    // Generate final metrics
    const durationStr = formatTime(streamDuration);
    const peakViewers = Math.max(viewersCount + 20, 15); // simulated peak
    const totalHearts = heartsCount + Math.floor(Math.random() * 50) + 20;
    const generatedOrders = Math.max(Math.floor(selectedProductIds.length * (Math.random() * 3 + 1)), 2);
    const newFollowers = Math.floor(Math.random() * 15) + 5;

    setReportStats({
      duration: durationStr,
      peakViewers,
      hearts: totalHearts,
      orders: generatedOrders,
      newFollowers
    });

    // Update session status in localStorage list from 'live' to 'replay'
    try {
      const storedLives = JSON.parse(localStorage.getItem("farmer_custom_livestreams")) || [];
      const updatedLives = storedLives.map((session) => {
        if (session.id === liveSessionId) {
          return {
            ...session,
            status: "replay",
            viewers: `${peakViewers} lượt xem`,
            scheduledTime: "Đã phát trực tiếp"
          };
        }
        return session;
      });
      localStorage.setItem("farmer_custom_livestreams", JSON.stringify(updatedLives));
      localStorage.removeItem("active_farmer_livestream_session");
    } catch (err) {
      console.error(err);
    }

    // Stop WebRTC tracks
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }

    setStreamState("ended");
  };

  return (
    <div className="farmer-live-root">
      {/* 1. SETUP PAGE */}
      {streamState === "setup" && (
        <div className="prep-layout-grid">
          {/* Setup configurations */}
          <div className="live-card">
            <h2 style={{ marginTop: 0, color: "#0f172a", fontSize: "1.3rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "20px" }}>
              📋 Thiết lập Phòng Livestream
            </h2>

            <div className="form-group-live">
              <label>Tiêu đề phiên livestream *</label>
              <input
                type="text"
                placeholder="Ví dụ: Quy trình thu hoạch cà chua sạch vườn Organic VietGAP"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group-live">
              <label>Mô tả buổi live (Không bắt buộc)</label>
              <textarea
                rows="3"
                placeholder="Mô tả nội dung buổi livestream, khuyến khích khách hàng đặt câu hỏi giao lưu..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="form-group-live" style={{ marginBottom: "24px" }}>
              <label className="product-pin-title-row">
                <span>📦 Chọn Nông sản bán trong live</span>
                {selectedProductIds.length > 0 && (
                  <span className="selected-count-tag">Đã chọn: {selectedProductIds.length}</span>
                )}
              </label>
              
              <div className="products-selection-container">
                {farmerProducts.length > 0 ? (
                  farmerProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className={`product-row-item ${selectedProductIds.includes(prod.id) ? "selected" : ""}`}
                      onClick={() => handleProductCheckboxChange(prod.id)}
                    >
                      <div className="product-row-left">
                        <input
                          type="checkbox"
                          className="product-row-checkbox"
                          checked={selectedProductIds.includes(prod.id)}
                          onChange={() => {}} // handled by item click
                        />
                        <img src={prod.imageUrl} alt={prod.name} className="product-row-thumbnail" />
                        <div className="product-row-details">
                          <p className="product-row-name">{prod.name}</p>
                          <p className="product-row-meta">
                            Giá: <span className="price-bold">{prod.price.toLocaleString()}đ</span>/{prod.unit} • Kho: {prod.stock}
                          </p>
                        </div>
                      </div>
                      {selectedProductIds.includes(prod.id) && voucherPercent !== 0 && (
                        <div className="product-row-inputs" onClick={(e) => e.stopPropagation()}>
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Giảm live:</span>
                          <input
                            type="number"
                            className="live-discount-box"
                            min="0"
                            max="90"
                            value={productDiscounts[prod.id] !== undefined ? productDiscounts[prod.id] : ""}
                            onChange={(e) => handleDiscountChange(prod.id, e.target.value)}
                          />
                          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>%</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ padding: "16px", color: "#64748b", margin: 0, textAlign: "center", fontSize: "0.85rem" }}>
                    Chưa có sản phẩm nào được phê duyệt. Vui lòng đăng bán sản phẩm trước khi livestream.
                  </p>
                )}
              </div>
            </div>

            <div className="form-group-live">
              <label>🎟️ Voucher/Mã giảm giá áp dụng (Độc quyền trên live)</label>
              <div className="voucher-option-pills">
                <button
                  className={`voucher-pill ${voucherPercent === 0 ? "active" : ""}`}
                  onClick={() => handleVoucherPercentChange(0)}
                >
                  Không áp dụng
                </button>
                <button
                  className={`voucher-pill ${voucherPercent === 10 ? "active" : ""}`}
                  onClick={() => handleVoucherPercentChange(10)}
                >
                  Giảm 10%
                </button>
                <button
                  className={`voucher-pill ${voucherPercent === 15 ? "active" : ""}`}
                  onClick={() => handleVoucherPercentChange(15)}
                >
                  Giảm 15%
                </button>
                <button
                  className={`voucher-pill ${voucherPercent === 20 ? "active" : ""}`}
                  onClick={() => handleVoucherPercentChange(20)}
                >
                  Giảm 20%
                </button>
              </div>
            </div>
          </div>

          {/* Device & Settings Check */}
          <div>
            <div className="live-card" style={{ paddingBottom: "16px" }}>
              <h3 style={{ marginTop: 0, color: "#0f172a", fontSize: "1.1rem", marginBottom: "16px" }}>
                🎥 Kiểm tra thiết bị
              </h3>

              {/* Viewfinder Preview */}
              <div className="camera-preview-box">
                {isCamOn && cameraStream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="camera-preview-video"
                  ></video>
                ) : (
                  <div className="camera-placeholder-graphic">
                    <span className="placeholder-cam-icon">📹</span>
                    <p style={{ margin: 0, fontSize: "0.85rem" }}>
                      {!isCamOn ? "Camera đã tắt" : "Đang chờ kết nối camera..."}
                    </p>
                  </div>
                )}
                <div className="camera-preview-overlay-bar">
                  <span className="live-indicator-dot"></span>
                  <span>XEM TRƯỚC HÌNH ẢNH</span>
                </div>
              </div>

              {/* Controls */}
              <div className="camera-controls-row">
                <button
                  className={`cam-btn-control ${!isCamOn ? "off" : ""}`}
                  onClick={() => setIsCamOn(!isCamOn)}
                  title={isCamOn ? "Tắt Camera" : "Bật Camera"}
                >
                  {isCamOn ? "📷" : "🚫"}
                </button>
                <button
                  className={`cam-btn-control ${!isMicOn ? "off" : ""}`}
                  onClick={() => setIsMicOn(!isMicOn)}
                  title={isMicOn ? "Tắt Microphone" : "Bật Microphone"}
                >
                  {isMicOn ? "🎤" : "🔇"}
                </button>
              </div>

              {/* Audio visualizer */}
              <div className="audio-check-row">
                <div className="audio-header">
                  <span>Tín hiệu Micro</span>
                  <span>{isMicOn ? "Hoạt động" : "Tắt"}</span>
                </div>
                {isMicOn ? (
                  <div className="audio-waves-container">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => {
                      const active = audioLevel > bar * 8;
                      return (
                        <div
                          key={bar}
                          className={`audio-wave-bar ${active ? "active" : ""}`}
                          style={{
                            height: active ? `${Math.floor(Math.random() * 15) + 6}px` : "6px",
                            backgroundColor: active ? "#10b981" : "#e2e8f0"
                          }}
                        ></div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="audio-bar-wrapper">
                    <div className="audio-level-fill" style={{ width: "0%" }}></div>
                  </div>
                )}
              </div>

              {/* Guideline reminders */}
              <div className="stream-tips-box">
                <h4 className="tips-title">💡 Mẹo Livestream đạt hiệu quả:</h4>
                <ul className="tips-list">
                  <li>Đảm bảo vị trí quay có đủ ánh sáng mặt trời tự nhiên.</li>
                  <li>Giữ đường truyền mạng Wifi/4G ổn định trong suốt buổi live.</li>
                  <li>Hãy tích cực tương tác, trả lời trực tiếp các thắc mắc của người xem.</li>
                  <li>Tạo các ưu đãi giảm giá độc quyền chỉ có trên phiên live để kích cầu.</li>
                </ul>
              </div>
            </div>

            <button className="btn-launch-live" onClick={handleStartLivestream}>
              📡 Bắt đầu Phát sóng ngay
            </button>
          </div>
        </div>
      )}

      {/* 2. BROADCASTING LIVE CONSOLE */}
      {streamState === "live" && (
        <div className="live-console-grid">
          {/* Main viewfinder broadcasting feed */}
          <div>
            <div className="live-viewfinder-wrapper">
              {/* Actual camera or animated fallback */}
              {isCamOn && cameraStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="viewfinder-stream"
                ></video>
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "radial-gradient(circle, #1e3a8a 0%, #0f172a 100%)",
                    color: "white"
                  }}
                >
                  <span style={{ fontSize: "3rem", animation: "bounce 2s infinite" }}>🎥</span>
                  <p style={{ marginTop: "12px", fontSize: "0.95rem", fontWeight: "600", color: "#cbd5e1" }}>
                    Livestream đang chạy (Hình ảnh giả lập từ camera trang trại)
                  </p>
                </div>
              )}

              {/* Viewfinder Header info */}
              <div className="viewfinder-top-bar">
                <div className="viewfinder-badges-left">
                  <span className="badge-live-pulse">
                    <span style={{ width: "6px", height: "6px", backgroundColor: "white", borderRadius: "50%" }}></span>
                    TRỰC TIẾP
                  </span>
                  <span className="badge-live-time">
                    {formatTime(streamDuration)}
                  </span>
                </div>

                <div className="viewfinder-badges-right">
                  <span className="badge-console-stats">
                    👥 {viewersCount} người xem
                  </span>
                  <span className="badge-console-stats">
                    ❤️ {heartsCount} Thích
                  </span>
                </div>
              </div>

              {/* Floating Product overlay */}
              {pinnedProductId && (() => {
                const prod = farmerProducts.find((p) => p.id === pinnedProductId);
                if (!prod) return null;
                const discount = productDiscounts[pinnedProductId] || 0;
                const livePrice = discount > 0 ? Math.round(prod.price * (1 - discount / 100)) : prod.price;

                return (
                  <div className="pinned-product-overlay">
                    <img src={prod.imageUrl} alt={prod.name} className="pinned-prod-img" />
                    <div className="pinned-prod-info">
                      <span className="pinned-prod-badge">🔥 ĐANG GHIM</span>
                      <h4 className="pinned-prod-name">{prod.name}</h4>
                      <div className="pinned-prod-prices">
                        {discount > 0 && (
                          <span className="pinned-price-orig">{prod.price.toLocaleString()}đ</span>
                        )}
                        <span className="pinned-price-live">{livePrice.toLocaleString()}đ</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Floating Hearts effect area */}
              <div className="hearts-fly-area">
                {floatingHearts.map((heartId) => {
                  const hearts = ["❤️", "💖", "🍓", "🍅", "⭐", "👍"];
                  const randomIcon = hearts[Math.floor((heartId * 10) % hearts.length)];
                  const leftPos = 10 + ((heartId * 100) % 40); // spread left position
                  return (
                    <span
                      key={heartId}
                      className="floating-heart"
                      style={{ left: `${leftPos}px` }}
                    >
                      {randomIcon}
                    </span>
                  );
                })}
              </div>

              {/* Overlay controls */}
              <div className="viewfinder-action-row">
                <button
                  className="btn-floating-action"
                  onClick={() => setIsCamOn(!isCamOn)}
                  title={isCamOn ? "Tắt Camera" : "Bật Camera"}
                >
                  {isCamOn ? "📷" : "🚫"}
                </button>
                <button
                  className="btn-floating-action"
                  onClick={() => setIsMicOn(!isMicOn)}
                  title={isMicOn ? "Tắt Mic" : "Bật Mic"}
                >
                  {isMicOn ? "🎤" : "🔇"}
                </button>
                <button
                  className="btn-floating-action heart-trigger"
                  onClick={triggerHeartBurst}
                  title="Thả Tim"
                >
                  ❤️
                </button>
              </div>
            </div>

            {/* End Stream Button */}
            <div className="live-console-footer">
              <button className="btn-end-stream" onClick={handleEndLivestream}>
                🟥 Kết thúc Livestream
              </button>
            </div>
          </div>

          {/* Right column: Live Chat box */}
          <div className="live-card live-chat-panel">
            <div className="chat-panel-header">
              <h3 className="chat-panel-title">
                💬 Khán giả trò chuyện
              </h3>
              <span className="badge-role" style={{ backgroundColor: "#e2e8f0", color: "#475569" }}>
                Host Console
              </span>
            </div>

            {/* Chat List */}
            <div className="chat-console-messages-list">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`chat-message-console-item ${msg.type}`}>
                  {msg.type === "system" ? (
                    <span>{msg.text}</span>
                  ) : (
                    <>
                      <span className={`chat-user-badge ${msg.type}`}>
                        {msg.user}:
                      </span>
                      <span className="chat-msg-text">{msg.text}</span>
                    </>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Host Reply chat input */}
            <form className="host-chat-input-row" onSubmit={handleHostSendChat}>
              <input
                type="text"
                placeholder="Trả lời bình luận của khán giả..."
                className="host-chat-input"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="btn-send-host-chat">
                Gửi
              </button>
            </form>

            {/* Console Products pinning selection list */}
            <div className="console-products-card">
              <h4 style={{ margin: "0 0 10px 0", fontSize: "0.9rem", color: "#475569" }}>
                📌 Sản phẩm trong buổi live ({selectedProductIds.length})
              </h4>
              <div className="pinned-products-grid">
                {farmerProducts
                  .filter((p) => selectedProductIds.includes(p.id))
                  .map((p) => {
                    const discount = productDiscounts[p.id] || 0;
                    const livePrice = discount > 0 ? Math.round(p.price * (1 - discount / 100)) : p.price;
                    const isActivePin = pinnedProductId === p.id;

                    return (
                      <div
                        key={p.id}
                        className={`console-product-item ${isActivePin ? "active" : ""}`}
                      >
                        <div className="console-prod-left">
                          <img src={p.imageUrl} alt={p.name} className="console-prod-img" />
                          <div className="console-prod-details">
                            <p className="console-prod-name">{p.name}</p>
                            <p className="console-prod-price">
                              {livePrice.toLocaleString()}đ/{p.unit}
                            </p>
                          </div>
                        </div>
                        <button
                          className={`btn-pin-control ${isActivePin ? "active" : ""}`}
                          onClick={() => setPinnedProductId(p.id)}
                        >
                          {isActivePin ? "📌 Đang ghim" : "Ghim lên live"}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. FINAL REPORT SCREEN */}
      {streamState === "ended" && (
        <div className="live-report-overlay">
          <div className="live-report-modal">
            <div className="report-icon-container">
              🎉
            </div>
            <h2 className="report-title">
              Đã Kết Thúc Livestream!
            </h2>
            <p className="report-subtitle">
              Cảm ơn bạn đã kết nối chia sẻ quy trình sạch cùng cộng đồng người tiêu dùng AgriMarket.
            </p>

            <div className="report-stats-grid">
              <div className="report-stat-card">
                <p className="stat-card-val">{reportStats.duration}</p>
                <p className="stat-card-lbl">Thời lượng</p>
              </div>
              <div className="report-stat-card">
                <p className="stat-card-val">{reportStats.peakViewers}</p>
                <p className="stat-card-lbl">Peak xem</p>
              </div>
              <div className="report-stat-card">
                <p className="stat-card-val">❤️ {reportStats.hearts}</p>
                <p className="stat-card-lbl">Lượt thả tim</p>
              </div>
              <div className="report-stat-card">
                <p className="stat-card-val">📦 {reportStats.orders}</p>
                <p className="stat-card-lbl">Đơn hàng live</p>
              </div>
            </div>

            <div className="report-stat-card" style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, color: "#475569", fontSize: "0.85rem" }}>👥 LƯỢT THEO DÕI MỚI</span>
              <span style={{ fontWeight: 800, color: "#10b981", fontSize: "1.1rem" }}>+{reportStats.newFollowers}</span>
            </div>

            <button className="btn-close-report" onClick={() => setStreamState("setup")}>
              Quay lại thiết lập
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerLivestream;

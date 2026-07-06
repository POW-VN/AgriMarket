import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header/Header";
import "./LivestreamPage.css";

// Import images from the assets folder
import farmerVideoImg from "../../assets/images/farmer_livestream_video.png";
import farmerAvatarImg from "../../assets/images/thomas_miller_avatar.png";
import honeyImg from "../../assets/images/wildflower_honey.png";
import carrotsImg from "../../assets/images/rainbow_carrots.png";

const LivestreamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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

  // Shop Direct Chat state
  const [isShopChatOpen, setIsShopChatOpen] = useState(false);
  const [shopChatInput, setShopChatInput] = useState("");
  const [shopChatMessages, setShopChatMessages] = useState([]);

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  // Upcoming subscription state
  const [isSubscribed, setIsSubscribed] = useState(false);

  const chatEndRef = useRef(null);
  const videoTimerRef = useRef(null);
  const voucherTimerRef = useRef(null);
  const chatSimRef = useRef(null);

  // Farmers and Livestreams Dynamic Database
  const streamsMap = {
    "thomas-miller": {
      id: "thomas-miller",
      farmerName: "Thomas Miller",
      farmerBrand: "Sun Valley Organics",
      farmerAvatar: farmerAvatarImg,
      title: "Thu hoạch mật ong rừng nguyên chất & Cà rốt hữu cơ",
      status: "live",
      viewersCount: "1.2k đang xem",
      videoSrc: farmerVideoImg,
      voucherTitle: "Giảm 20% Mật ong rừng",
      voucherTimeInit: 296,
      products: [
        {
          id: "mock-honey-1",
          name: "Mật ong hoa rừng nguyên chất",
          price: 12.99,
          unit: "Hũ 500g",
          imageUrl: honeyImg,
          farmerId: 1,
          farmerName: "Thomas Miller (Sun Valley Organics)",
          stockQuantity: 50
        },
        {
          id: "mock-carrots-1",
          name: "Cà rốt bảy sắc hữu cơ",
          price: 4.50,
          unit: "Bó 500g",
          imageUrl: carrotsImg,
          farmerId: 1,
          farmerName: "Thomas Miller (Sun Valley Organics)",
          stockQuantity: 100
        }
      ],
      initialChats: [
        {
          id: 1,
          user: "Sarah J.",
          text: "Cà rốt vụ này ngọt không nhà vườn?",
          isBot: false,
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        {
          id: 2,
          user: "Mike L.",
          text: "Vừa đặt mua 2 hũ mật ong! 🍯",
          isBot: false,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
        },
        {
          id: 3,
          user: "Hệ thống AgriMarket",
          text: "Đừng quên nhận voucher giảm giá 20% trước khi phiên livestream kết thúc nhé!",
          isBot: true,
          avatar: ""
        },
        {
          id: 4,
          user: "Elena U.",
          text: "Khi nào thì có đợt thu hoạch tiếp theo vậy?",
          isBot: false,
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
        }
      ]
    },
    "sarah-jenkins": {
      id: "sarah-jenkins",
      farmerName: "Sarah Jenkins",
      farmerBrand: "Green Valley Farms",
      farmerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
      title: "Trải nghiệm hái dâu tây chín mọng tại vườn organic Đà Lạt",
      status: "live",
      viewersCount: "856 đang xem",
      videoSrc: "https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=800",
      voucherTitle: "Giảm 15% Dâu tây tươi",
      voucherTimeInit: 450,
      products: [
        {
          id: "mock-strawberry-1",
          name: "Dâu tây hữu cơ loại A",
          price: 8.99,
          unit: "Hộp 500g",
          imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300",
          farmerId: 2,
          farmerName: "Sarah Jenkins (Green Valley Farms)",
          stockQuantity: 40
        },
        {
          id: "mock-strawberry-juice-1",
          name: "Sinh tố dâu tây nguyên chất",
          price: 3.50,
          unit: "Chai 350ml",
          imageUrl: "https://images.unsplash.com/photo-1502741224143-90386d7c8c82?w=300",
          farmerId: 2,
          farmerName: "Sarah Jenkins (Green Valley Farms)",
          stockQuantity: 80
        }
      ],
      initialChats: [
        {
          id: 1,
          user: "Hoàng M.",
          text: "Dâu tây này vận chuyển đi Hà Nội có sợ bị dập không ạ?",
          isBot: false,
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
        },
        {
          id: 2,
          user: "Kim Cương",
          text: "Em vừa mua 2 hộp, dâu to chín ngọt lắm mng nên mua nha!",
          isBot: false,
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"
        },
        {
          id: 3,
          user: "Hệ thống AgriMarket",
          text: "Nhấn 'Nhận Voucher' để nhận mã giảm giá 15% độc quyền tại phiên live này!",
          isBot: true,
          avatar: ""
        }
      ]
    },
    "tran-nam": {
      id: "tran-nam",
      farmerName: "Trần Văn Nam",
      farmerBrand: "Nông trại sữa bò Ba Vì",
      farmerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      title: "Quy trình vắt sữa bò tươi hữu cơ chuẩn VietGAP mỗi sáng",
      status: "upcoming",
      viewersCount: "420 đã đăng ký",
      videoSrc: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800",
      voucherTitle: "Giảm 10% Sữa tươi nguyên chất",
      voucherTimeInit: 0,
      products: [
        {
          id: "mock-milk-1",
          name: "Sữa bò tươi nguyên chất tiệt trùng",
          price: 2.49,
          unit: "Chai 1 Lít",
          imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300",
          farmerId: 3,
          farmerName: "Trần Văn Nam (Nông trại sữa bò Ba Vì)",
          stockQuantity: 200
        },
        {
          id: "mock-yogurt-1",
          name: "Sữa chua nếp cẩm Ba Vì",
          price: 1.20,
          unit: "Hũ 100g",
          imageUrl: "https://images.unsplash.com/photo-1571244856341-4f30dd55a0ab?w=300",
          farmerId: 3,
          farmerName: "Trần Văn Nam (Nông trại sữa bò Ba Vì)",
          stockQuantity: 150
        }
      ],
      initialChats: [
        {
          id: 1,
          user: "Thu Hương",
          text: "Trang trại mở cửa cho khách vào tham quan vắt sữa không ạ?",
          isBot: false,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
        },
        {
          id: 2,
          user: "Trần Văn Nam",
          text: "Dạ nông trại sữa bò Ba Vì xin chào cả nhà, hẹn gặp mọi người vào 8h sáng mai nhé!",
          isBot: false,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
        }
      ],
      scheduledTime: "08:00 AM, Ngày mai"
    },
    "nguyen-mai": {
      id: "nguyen-mai",
      farmerName: "Nguyễn Thị Mai",
      farmerBrand: "Vườn trái cây chín miền Tây",
      farmerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      title: "Thu hoạch sầu riêng Ri6 chín rụng từ cây & Hướng dẫn lựa sầu cực chuẩn",
      status: "replay",
      viewersCount: "2.4k lượt xem",
      videoSrc: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=800",
      voucherTitle: "Voucher đã hết hạn",
      voucherTimeInit: 0,
      products: [
        {
          id: "mock-durian-1",
          name: "Sầu riêng Ri6 chín cây cơm vàng hạt lép",
          price: 14.99,
          unit: "Kg",
          imageUrl: "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=300",
          farmerId: 4,
          farmerName: "Nguyễn Thị Mai (Vườn trái cây chín miền Tây)",
          stockQuantity: 30
        },
        {
          id: "mock-pia-1",
          name: "Bánh pía sầu riêng tươi đặc sản",
          price: 5.99,
          unit: "Túi 4 cái",
          imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300",
          farmerId: 4,
          farmerName: "Nguyễn Thị Mai (Vườn trái cây chín miền Tây)",
          stockQuantity: 120
        }
      ],
      initialChats: [
        {
          id: 1,
          user: "Tuấn Anh",
          text: "Sầu riêng này bao ăn không chị ơi?",
          isBot: false,
          avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100"
        },
        {
          id: 2,
          user: "Nguyễn Thị Mai",
          text: "Bao một đổi một nếu bị sượng hay nhạt luôn nha em!",
          isBot: false,
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
        },
        {
          id: 3,
          user: "Thảo Vy",
          text: "Thèm quá, vừa đặt 1 quả 3kg nha vườn.",
          isBot: false,
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"
        },
        {
          id: 4,
          user: "Hệ thống AgriMarket",
          text: "Phiên livestream này đã kết thúc. Quý khách có thể mua các sản phẩm với giá niêm yết của nhà vườn.",
          isBot: true,
          avatar: ""
        }
      ]
    }
  };

  // Get active stream data based on id, default to thomas-miller if not found
  const getStreamData = () => {
    let data = streamsMap[id];
    if (!data) {
      try {
        const storedLives = JSON.parse(localStorage.getItem("farmer_custom_livestreams")) || [];
        const found = storedLives.find((item) => item.id === id);
        if (found) {
          data = {
            ...found,
            viewersCount: found.viewers || "120 đang xem",
            videoSrc: found.videoSrc || found.thumbnail,
            voucherTimeInit: found.voucherPercent > 0 ? 300 : 0,
            initialChats: [
              {
                id: 1,
                user: "Hệ thống AgriMarket",
                text: "Chào mừng quý khách đến với livestream trực tiếp của nhà vườn!",
                isBot: true,
                avatar: ""
              }
            ]
          };
        }
      } catch (e) {
        console.error("Lỗi khi tìm custom livestream:", e);
      }
    }
    return data || streamsMap["thomas-miller"];
  };

  const [activeStream, setActiveStream] = useState(null);
  const streamData = activeStream || getStreamData();

  // Initialize page variables when streamData changes, and poll for changes in LocalStorage
  useEffect(() => {
    const data = getStreamData();
    setActiveStream(data);
    setVoucherTime(data.voucherTimeInit);
    setVoucherClaimed(false);
    setChatMessages(data.initialChats);
    setIsFollowing(false);
    setIsShopChatOpen(false);
    setShopChatMessages([]);

    const interval = setInterval(() => {
      const latestData = getStreamData();
      setActiveStream((prev) => {
        if (!prev || prev.status !== latestData.status || prev.isBanned !== latestData.isBanned) {
          return latestData;
        }
        return prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [id]);

  // Random names and messages for simulating other users' chat comments (Live only)
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
    "Voucher giảm giá áp dụng cho toàn bộ đơn hàng luôn đúng không ạ?",
    "Hôm nay nông trại đẹp trời thế, thích quá!",
    "Đã nhận voucher thành công. Vừa chốt đơn xong nhé!",
    "Rau quả đợt này khi nào thu hoạch vậy nông trang?",
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
    if (streamData.status !== "live") return;

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
        return isPlaying ? prev + 1 : prev;
      });
    }, 1000);

    // Scroll chat to bottom on load
    scrollToBottom();

    return () => {
      clearInterval(voucherTimerRef.current);
      clearInterval(videoTimerRef.current);
    };
  }, [isPlaying, id]);

  // 2. Automated chat comments simulator (Live only)
  useEffect(() => {
    if (streamData.status !== "live") return;

    chatSimRef.current = setInterval(() => {
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const randomComment = mockComments[Math.floor(Math.random() * mockComments.length)];
      
      const isBot = Math.random() < 0.2;
      
      const newMsg = {
        id: Date.now(),
        user: isBot ? "Hệ thống AgriMarket" : randomUser.name,
        text: isBot 
          ? `💡 Hãy nhanh tay nhấn 'Nhận Voucher' để được hưởng ưu đãi độc quyền trên livestream của ${streamData.farmerName}!` 
          : randomComment,
        isBot: isBot,
        avatar: isBot ? "" : randomUser.avatar
      };

      setChatMessages((prev) => [...prev, newMsg]);
    }, 7000);

    return () => clearInterval(chatSimRef.current);
  }, [id]);

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
    if (secs <= 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Interactive toggle for play/pause
  const togglePlay = () => {
    if (streamData.status === "upcoming") return; // Upcoming has no playback
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
    if (streamData.status !== "live") return;
    if (voucherClaimed) return;
    setVoucherClaimed(true);
    showToast(`Chúc mừng! Bạn đã nhận thành công ${streamData.voucherTitle}. Mã giảm giá đã được thêm vào ví của bạn!`, "success");
  };

  // Follow farmer click handler
  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    if (!isFollowing) {
      showToast(`Đã theo dõi nhà vườn ${streamData.farmerName}. Bạn sẽ nhận được thông báo khi nông trại ${streamData.farmerBrand} lên sóng livestream lần tới!`, "success");
    } else {
      showToast(`Đã hủy theo dõi nhà vườn ${streamData.farmerName}.`, "info");
    }
  };

  // Subscribe to upcoming livestream
  const handleToggleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    if (!isSubscribed) {
      showToast(`Đăng ký thành công! Bạn sẽ nhận được thông báo trước khi phiên live của ${streamData.farmerName} lên sóng.`, "success");
    } else {
      showToast(`Đã hủy đăng ký nhận thông báo.`, "info");
    }
  };

  // Shop direct message handlers
  const handleOpenShopChat = () => {
    setIsShopChatOpen(true);
    if (shopChatMessages.length === 0) {
      setShopChatMessages([
        {
          sender: "shop",
          text: `Xin chào! Tôi là ${streamData.farmerName} từ trang trại ${streamData.farmerBrand}. Rất vui được hỗ trợ bạn. Bạn cần tư vấn thêm về sản phẩm nông sản đang live ạ?`
        }
      ]);
    }
  };

  const handleSendShopChatMessage = (e) => {
    e.preventDefault();
    if (!shopChatInput.trim()) return;

    const userText = shopChatInput.trim();
    setShopChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setShopChatInput("");

    setTimeout(() => {
      setShopChatMessages((prev) => [
        ...prev,
        {
          sender: "shop",
          text: `Cảm ơn bạn đã quan tâm! Các sản phẩm của nông trại ${streamData.farmerBrand} đều được chăm sóc hoàn toàn hữu cơ. Bạn có thể bấm nút 'Mua' ở phần sản phẩm trong Live để chốt đơn ngay nhé, tôi sẽ chuẩn bị đóng gói gửi sớm nhất cho bạn!`
        }
      ]);
    }, 1200);
  };

  // Submit comment in live chat
  const handleSendChat = (e) => {
    e.preventDefault();
    if (streamData.status === "upcoming") {
      showToast("Phòng chat hiện tại đang khóa. Vui lòng quay lại khi phiên live bắt đầu!", "info");
      return;
    }
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
    if (streamData.status === "upcoming") {
      showToast(`Sản phẩm "${product.name}" sẽ chính thức mở bán khi phiên live lên sóng!`, "info");
      return;
    }

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

  return (
    <div className="livestream-page-root">
      {/* App Header */}
      <Header activeTab="live" />

      {/* Back Button and Navigation Path */}
      <div className="livestream-nav-bar">
        <button className="btn-back-to-list" onClick={() => navigate("/livestream")}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Quay lại danh sách
        </button>
        <span className="nav-divider">/</span>
        <span className="nav-current-title">{streamData.title}</span>
      </div>

      {/* Main Livestream Layout */}
      <main className="livestream-main-wrapper">
        <div className="livestream-layout-grid">
          
          {/* LEFT SIDE: Video Feed & Info */}
          <div className="livestream-left-column">
            
            {/* Simulated Live Video Player */}
            <div className={`video-player-container state-${streamData.status} ${streamData.isBanned ? "is-banned" : ""}`}>
              {streamData.isBanned ? (
                <div className="video-viewport banned" onClick={(e) => e.stopPropagation()}>
                  <div className="banned-blur-bg" style={{ backgroundImage: `url(${streamData.videoSrc})` }}></div>
                  <div className="banned-media-overlay">
                    <div className="banned-icon-wrapper">
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18.63 11.37L12 4.74l-6.63 6.63a3.56 3.56 0 1 0 5 5l6.63-6.63c.27-.27.42-.64.42-1.02V8.18c0-.66-.54-1.2-1.2-1.2h-.55a1.44 1.44 0 0 0-1.02.42L8.03 14.03a3.56 3.56 0 1 0 5 5l5.6-5.6"></path>
                        <path d="m14 11 1.5 1.5"></path>
                      </svg>
                    </div>
                    <h3 className="banned-overlay-title">PHIÊN PHÁT SÓNG ĐÃ DỪNG</h3>
                    <div className="banned-explanation-box">
                      Phiên livestream này đã bị quản trị viên dừng phát sóng do vi phạm tiêu chuẩn cộng đồng.
                    </div>
                    <div className="banned-overlay-actions">
                      <button className="btn-banned-more-info" onClick={() => setToast({ show: true, message: "Đã mở trang hướng dẫn tiêu chuẩn cộng đồng.", type: "success" })}>
                        Tìm hiểu thêm
                      </button>
                      <button className="btn-banned-report" onClick={() => setToast({ show: true, message: "Cảm ơn bạn đã đóng góp ý kiến.", type: "success" })}>
                        Báo cáo thêm
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="video-viewport" onClick={togglePlay}>
                  <img 
                    src={streamData.videoSrc} 
                    alt="Livestream nông trại" 
                    className={`video-background-img ${isPlaying && streamData.status !== "upcoming" ? "playing" : "paused"}`}
                  />
                  
                  {/* Play/Pause center overlay icon on hover or action */}
                  {showPlayOverlay && streamData.status !== "upcoming" && (
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

                  {/* Upcoming Livestream Overlay */}
                  {streamData.status === "upcoming" && (
                    <div className="upcoming-media-overlay" onClick={(e) => e.stopPropagation()}>
                      <div className="upcoming-glass-card">
                        <div className="upcoming-timer-badge">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                            <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          Sắp lên sóng
                        </div>
                        <h3>Phiên Live Sắp Bắt Đầu</h3>
                        <p className="scheduled-date-string">Thời gian phát sóng: <strong>{streamData.scheduledTime}</strong></p>
                        <button 
                          className={`upcoming-action-notify-btn ${isSubscribed ? "subscribed" : ""}`}
                          onClick={handleToggleSubscribe}
                        >
                          {isSubscribed ? (
                            <>
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ marginRight: "6px" }}>
                                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                              </svg>
                              Đã đăng ký nhận tin
                            </>
                          ) : (
                            "Đăng ký nhận thông báo"
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Top Overlay Badges */}
                  <div className="video-top-overlays">
                    {streamData.status === "live" && (
                      <span className="live-status-badge">
                        <span className="live-dot"></span>
                        TRỰC TIẾP
                      </span>
                    )}
                    {streamData.status === "upcoming" && (
                      <span className="live-status-badge upcoming-badge">
                        LÊN LỊCH
                      </span>
                    )}
                    {streamData.status === "replay" && (
                      <span className="live-status-badge replay-badge">
                        PHÁT LẠI
                      </span>
                    )}
                    
                    <span className="viewers-count-badge">
                      {streamData.status === "live" && (
                        <svg className="viewer-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      )}
                      {streamData.viewersCount}
                    </span>
                  </div>

                  {/* Bottom Video Controls (Hide on upcoming) */}
                  {streamData.status !== "upcoming" && (
                    <div className="video-bottom-controls" onClick={(e) => e.stopPropagation()}>
                      
                      {/* Progress Line */}
                      <div className="video-progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: streamData.status === "replay" ? (isPlaying ? "65%" : "35%") : (isPlaying ? "100%" : "99%") }}
                        ></div>
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
                        </div>

                        <div className="controls-right">
                          <span className="live-timer-duration">
                            {streamData.status === "replay" ? "00:45:12 / 01:15:30" : formatTime(currentTime)}
                          </span>
                          
                          <button className="control-btn" title="Cài đặt">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                            </svg>
                          </button>

                          <button className="control-btn" title="Toàn màn hình">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Farmer Profile & Voucher Row */}
            <div className="farmer-voucher-cards-row">
              
              {/* Farmer Info Card */}
              <div className="livestream-farmer-card">
                <div className="profile-details-left">
                  <img src={streamData.farmerAvatar} alt={streamData.farmerName} className="livestream-farmer-avatar" />
                  <div className="livestream-farmer-meta">
                    <h3 className="livestream-farmer-name">{streamData.farmerName}</h3>
                    <p className="livestream-farmer-brand">{streamData.farmerBrand}</p>
                    <span className="verified-badge-label">
                      <svg className="verified-badge-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Nhà vườn đã xác minh
                    </span>
                  </div>
                </div>
                <div className="farmer-actions-group">
                  <button 
                    className={`follow-toggle-btn ${isFollowing ? "following-state" : "unfollowed-state"}`}
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? (
                      <>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ marginRight: "4px" }}>
                          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                        </svg>
                        Đang theo dõi
                      </>
                    ) : (
                      "+ Theo dõi"
                    )}
                  </button>
                  <button className="btn-chat-shop" onClick={handleOpenShopChat} title="Nhắn tin riêng với shop">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Live Voucher Coupon Card */}
              <div className={`live-voucher-deal-card status-${streamData.status}`}>
                <div className="voucher-details-left">
                  <div className="deal-status-badge">
                    {streamData.status === "live" ? "ƯU ĐÃI TRÊN LIVE" : streamData.status === "upcoming" ? "ƯU ĐÃI SẮP DIỄN RA" : "ƯU ĐÃI ĐÃ KẾT THÚC"}
                  </div>
                  <h4 className="voucher-promo-text">{streamData.voucherTitle}</h4>
                  {streamData.status === "live" && (
                    <div className="voucher-timer-countdown">
                      Kết thúc sau <span className="timer-digits-monospace">{formatVoucherTime(voucherTime)}</span>
                    </div>
                  )}
                  {streamData.status === "upcoming" && (
                    <div className="voucher-timer-countdown">
                      Sẽ kích hoạt khi phiên live lên sóng
                    </div>
                  )}
                  {streamData.status === "replay" && (
                    <div className="voucher-timer-countdown">
                      Mã ưu đãi đã hết hạn sử dụng
                    </div>
                  )}
                </div>
                <button 
                  className={`claim-voucher-action-btn ${voucherClaimed || streamData.status !== "live" ? "claimed-state" : "active-state"}`}
                  onClick={handleClaimVoucher}
                  disabled={voucherClaimed || streamData.status !== "live"}
                >
                  <svg className="voucher-ticket-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M20 12c0-1.1.9-2 2-2V8c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2v2c1.1 0 1.99.9 1.99 2s-.89 2-2 2v2c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-2c-1.1 0-2-.9-2-2zm-9 1.5H9v-3h2v3zm4 0h-2v-3h2v3z"/>
                  </svg>
                  {streamData.status !== "live" ? "Hết hạn" : voucherClaimed ? "Đã nhận" : "Nhận Voucher"}
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
                <h3 className="chat-title-heading">
                  {streamData.status === "live" ? "Trò chuyện trực tiếp" : streamData.status === "upcoming" ? "Phòng chờ phiên live" : "Lịch sử cuộc trò chuyện"}
                </h3>
              </div>

              {/* Scrollable chat messages container */}
              {streamData.isBanned ? (
                <div className="banned-chat-placeholder">
                  <div className="banned-chat-icon-wrapper">
                    <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                    </svg>
                  </div>
                  <p className="banned-chat-title">Tính năng trò chuyện không khả dụng</p>
                  <p className="banned-chat-desc">Khung chat đã bị vô hiệu hóa cùng với phiên phát sóng này.</p>
                </div>
              ) : (
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
              )}

              {/* Chat Input form */}
              <form onSubmit={handleSendChat} className="chat-input-row-form">
                <input
                  type="text"
                  placeholder={streamData.status === "upcoming" ? "Phòng chat chưa mở..." : "Nhập tin nhắn..."}
                  value={chatInput}
                  disabled={streamData.status === "upcoming"}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="chat-text-input-field"
                />
                <button type="submit" className="chat-submit-action-btn" disabled={streamData.status === "upcoming"} title="Gửi tin nhắn">
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
                <h3 className="products-title-heading">
                  {streamData.status === "upcoming" ? "Sản phẩm sẽ bán" : "Sản phẩm trong Live"}
                </h3>
              </div>

              <div className="products-list-scrollable">
                {streamData.products.map((prod) => (
                  <div key={prod.id} className="product-row-item-card">
                    <img src={prod.imageUrl} alt={prod.name} className="product-thumbnail-img" />
                    <div className="product-details-mid">
                      <h4 className="product-title-text">{prod.name}</h4>
                      <p className="product-specifications-text">{prod.unit}</p>
                      <span className="product-price-label">${prod.price.toFixed(2)}</span>
                    </div>
                    <button 
                      className={`product-purchase-action-btn status-${streamData.status}`}
                      onClick={() => handleBuyProduct(prod)}
                    >
                      {streamData.status === "upcoming" ? "Xem trước" : "Mua"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Floating Shop Chat Widget */}
      {isShopChatOpen && (
        <div className="shop-chat-widget">
          <div className="shop-chat-header">
            <div className="shop-chat-header-user">
              <img src={streamData.farmerAvatar} alt={streamData.farmerName} className="shop-chat-avatar" />
              <div className="shop-chat-header-info">
                <span className="shop-chat-name">
                  {streamData.farmerName}
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" className="verified-tick-icon chat-verified-tick" title="Nhà vườn uy tín">
                    <circle cx="12" cy="12" r="10" fill="#0095F6" />
                    <polyline points="9 12 11 14 15 10" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="shop-chat-status">
                  <span className="shop-status-dot"></span> Đang trực tuyến
                </span>
              </div>
            </div>
            <button className="shop-chat-close-btn" onClick={() => setIsShopChatOpen(false)}>&times;</button>
          </div>
          
          <div className="shop-chat-body">
            {shopChatMessages.map((msg, idx) => (
              <div key={idx} className={`shop-chat-msg-row ${msg.sender}`}>
                <div className="shop-chat-msg-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          
          <form className="shop-chat-footer" onSubmit={handleSendShopChatMessage}>
            <input 
              type="text" 
              placeholder="Nhập tin nhắn..." 
              value={shopChatInput}
              onChange={(e) => setShopChatInput(e.target.value)}
            />
            <button type="submit" aria-label="Gửi">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}

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

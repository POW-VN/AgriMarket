import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  X, 
  ArrowLeft, 
  Image as ImageIcon, 
  Paperclip, 
  PlusCircle, 
  SendHorizontal, 
  CheckCheck,
  CheckCircle2,
  Pin,
  BellOff,
  Trash2,
  Ban,
  Info,
  ChevronDown,
  MoreVertical,
  FileText,
  MapPin,
  UserSquare2,
  Download
} from "lucide-react";
import { useLocation } from "react-router-dom";
import "./ChatPopup.css";

// Danh sách ảnh gửi mẫu mặc định
const DEFAULT_MEDIA_IMAGES = [
  "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&auto=format&fit=crop&q=80", // cà rốt
  "https://images.unsplash.com/photo-1610348725531-843dff163e2c?w=300&auto=format&fit=crop&q=80", // súp lơ
  "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=300&auto=format&fit=crop&q=80", // cà chua
  "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=300&auto=format&fit=crop&q=80", // dứa
  "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300&auto=format&fit=crop&q=80", // bắp cải
  "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=300&auto=format&fit=crop&q=80", // dưa leo
  "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&auto=format&fit=crop&q=80", // chuối
  "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=300&auto=format&fit=crop&q=80"  // cải thảo
];

// Dữ liệu mẫu khởi tạo ban đầu
const INITIAL_CHATS = [
  {
    id: "farm-xanh",
    name: "Nông trại Xanh",
    verified: true,
    avatar: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=150&auto=format&fit=crop&q=60",
    phone: "0912 345 678",
    farmAddress: "Xã Tà Nung, Thành phố Đà Lạt, Lâm Đồng",
    activeState: "Đang hoạt động",
    isOnline: true,
    unreadCount: 1,
    isPinned: false,
    isMuted: false,
    isBlocked: false,
    type: "normal",
    mediaImages: [...DEFAULT_MEDIA_IMAGES],
    messages: [
      { id: "m1", sender: "user", type: "text", text: "Xin chào, tôi muốn hỏi về bắp cải.", time: "10:30", status: "read", timestamp: 1782971400000 },
      { id: "m2", sender: "farmer", type: "text", text: "Chào bạn 👋 Bạn cần mình tư vấn điều gì?", time: "10:31", timestamp: 1782971460000 },
      { id: "m3", sender: "user", type: "text", text: "Bắp cải hôm nay còn hàng không?", time: "10:31", status: "read", timestamp: 1782971460000 },
      { id: "m4", sender: "farmer", type: "text", text: "Dạ còn ạ. Giá hôm nay là 28.000đ/kg.", time: "10:32", timestamp: 1782971520000 },
      { id: "m5", sender: "user", type: "text", text: "Nếu mua 5kg thì giao trong ngày được không?", time: "10:33", status: "read", timestamp: 1782971580000 },
      { id: "m6", sender: "farmer", type: "text", text: "Được bạn nhé! Nếu trong nội thành sẽ giao trong ngày.", time: "10:34", timestamp: 1782971640000 }
    ]
  },
  {
    id: "vuon-dalat",
    name: "Vườn Rau Đà Lạt",
    verified: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60",
    phone: "0987 654 321",
    farmAddress: "Phường 11, Thành phố Đà Lạt, Lâm Đồng",
    activeState: "Hoạt động 5 phút trước",
    isOnline: true,
    unreadCount: 2,
    isPinned: false,
    isMuted: false,
    isBlocked: false,
    type: "normal",
    mediaImages: [...DEFAULT_MEDIA_IMAGES],
    messages: [
      { id: "m1", sender: "farmer", type: "text", text: "Chào bạn, vườn rau Đà Lạt rất hân hạnh được phục vụ bạn.", time: "Hôm qua", timestamp: 1782885600000 },
      { id: "m2", sender: "user", type: "text", text: "Mình muốn đặt súp lơ xanh và cải bó xôi.", time: "Hôm qua", status: "read", timestamp: 1782885660000 },
      { id: "m3", sender: "farmer", type: "text", text: "Cảm ơn bạn đã quan tâm sản phẩm. Bạn vui lòng tạo đơn trên web hoặc nhắn trực tiếp số lượng ở đây nha.", time: "Hôm qua", timestamp: 1782885720000 }
    ]
  },
  {
    id: "farm-organic",
    name: "Farm Organic",
    verified: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60",
    phone: "0909 090 909",
    farmAddress: "Huyện Đơn Dương, Tỉnh Lâm Đồng",
    activeState: "Đang hoạt động",
    isOnline: true,
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isBlocked: false,
    type: "order",
    mediaImages: [...DEFAULT_MEDIA_IMAGES],
    messages: [
      { id: "m1", sender: "farmer", type: "text", text: "Chào bạn, đơn hàng súp lơ hữu cơ đã được gửi đi.", time: "24/05", timestamp: 1779624000000 },
      { id: "m2", sender: "farmer", type: "text", text: "Đơn hàng #12345 của bạn đã được giao. Bạn kiểm tra giúp mình nhé!", time: "24/05", timestamp: 1779624060000 }
    ]
  },
  {
    id: "vuon-vinhlong",
    name: "Vườn Cam Vĩnh Long",
    verified: true,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60",
    phone: "0911 223 344",
    farmAddress: "Huyện Trà Ôn, Tỉnh Vĩnh Long",
    activeState: "Hoạt động 1 giờ trước",
    isOnline: false,
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isBlocked: false,
    type: "normal",
    mediaImages: [...DEFAULT_MEDIA_IMAGES],
    messages: [
      { id: "m1", sender: "farmer", type: "text", text: "Chào bạn, hiện vườn đang thu hoạch cam sành vỏ mỏng mọng nước.", time: "22/05", timestamp: 1779451200000 },
      { id: "m2", sender: "farmer", type: "text", text: "Cam đang vào mùa rất ngọt, bạn thử nhé!", time: "22/05", timestamp: 1779451260000 }
    ]
  },
  {
    id: "farm-binhan",
    name: "Nông trại Bình An",
    verified: true,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60",
    phone: "0977 889 900",
    farmAddress: "Xã Lộc An, Huyện Đất Đỏ, Bà Rịa - Vũng Tàu",
    activeState: "Hoạt động 2 ngày trước",
    isOnline: false,
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isBlocked: false,
    type: "promo",
    mediaImages: [...DEFAULT_MEDIA_IMAGES],
    messages: [
      { id: "m1", sender: "farmer", type: "text", text: "Nông trại Bình An chào bạn!", time: "20/05", timestamp: 1779278400000 },
      { id: "m2", sender: "farmer", type: "text", text: "Chúng tôi có chương trình ưu đãi mới. Mua 3kg tặng 1kg rau mầm.", time: "20/05", timestamp: 1779278460000 }
    ]
  }
];

const ALL_SYSTEM_FARMS = [
  { id: "farm-xanh", name: "Nông trại Xanh", verified: true, avatar: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=150&auto=format&fit=crop&q=60", phone: "0912 345 678", farmAddress: "Xã Tà Nung, Thành phố Đà Lạt, Lâm Đồng", activeState: "Đang hoạt động", isOnline: true },
  { id: "vuon-dalat", name: "Vườn Rau Đà Lạt", verified: true, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60", phone: "0987 654 321", farmAddress: "Phường 11, Thành phố Đà Lạt, Lâm Đồng", activeState: "Hoạt động 5 phút trước", isOnline: true },
  { id: "farm-organic", name: "Farm Organic", verified: true, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60", phone: "0909 090 909", farmAddress: "Huyện Đơn Dương, Tỉnh Lâm Đồng", activeState: "Đang hoạt động", isOnline: true },
  { id: "vuon-vinhlong", name: "Vườn Cam Vĩnh Long", verified: true, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60", phone: "0911 223 344", farmAddress: "Huyện Trà Ôn, Tỉnh Vĩnh Long", activeState: "Hoạt động 1 giờ trước", isOnline: false },
  { id: "farm-binhan", name: "Nông trại Bình An", verified: true, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60", phone: "0977 889 900", farmAddress: "Xã Lộc An, Huyện Đất Đỏ, Bà Rịa - Vũng Tàu", activeState: "Hoạt động 2 ngày trước", isOnline: false },
  
  { id: "farm-hoamai", name: "Nông trại Hoa Mai", verified: true, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60", phone: "0901 112 222", farmAddress: "Xã Lộc Phát, Thành phố Bảo Lộc, Lâm Đồng", activeState: "Đang hoạt động", isOnline: true },
  { id: "htx-anbinh", name: "Hợp tác xã An Bình", verified: true, avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=60", phone: "0902 223 333", farmAddress: "Huyện Cần Giuộc, Tỉnh Long An", activeState: "Hoạt động 3 giờ trước", isOnline: false },
  { id: "vuon-buoizaxanh", name: "Vườn Bưởi Da Xanh", verified: false, avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60", phone: "0903 334 444", farmAddress: "Huyện Mỏ Cày Nam, Tỉnh Bến Tre", activeState: "Đang hoạt động", isOnline: true },
  { id: "farm-bavi", name: "Trang trại Bò Sữa Ba Vì", verified: true, avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=60", phone: "0904 445 555", farmAddress: "Huyện Ba Vì, Thành phố Hà Nội", activeState: "Hoạt động 1 ngày trước", isOnline: false }
];

const AUTO_RESPONSES = [
  "Dạ vâng ạ, nông trại của mình ghi nhận thông tin rồi nhé. Bên mình sẽ chuẩn bị sản phẩm tươi ngon nhất cho bạn ạ!",
  "Dạ cảm ơn bạn đã quan tâm. Sản phẩm của vườn hoàn toàn tự nhiên và được thu hoạch trong ngày nên bạn yên tâm nha.",
  "Dạ mình nghe đây ạ! Bạn có cần mình tư vấn thêm về cách bảo quản hay chế biến loại nông sản này không?",
  "Dạ bên mình đang đóng gói đơn hàng, một lát nữa shipper lấy hàng đi mình sẽ báo mã vận đơn cho bạn theo dõi nhé.",
  "Dạ chào bạn, hiện tại vườn đang bận thu hoạch ngoài đồng một chút. Mình sẽ phản hồi chi tiết lại cho bạn ngay sau ít phút nha! Cảm ơn bạn rất nhiều."
];

// Danh sách tin nhắn nhanh mẫu
const QUICK_REPLIES = [
  "Nông sản hôm nay có những loại nào tươi vậy vườn?",
  "Bao lâu thì đơn hàng của mình được ship đi ạ?",
  "Nông trại mình có bán sỉ số lượng lớn không?",
  "Rau củ này có đạt chuẩn VietGAP không bạn?"
];

export const ChatPopup = () => {
  const location = useLocation();

  const isFarmerDashboard = location.pathname === "/farmer" || location.pathname.startsWith("/farmer/");
  const shouldHideChat = isFarmerDashboard || 
                         location.pathname.startsWith("/admin") || 
                         location.pathname.startsWith("/shipper") ||
                         location.pathname.startsWith("/login") ||
                         location.pathname.startsWith("/register");

  if (shouldHideChat) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState("list"); // 'list' | 'chat' | 'new-chat'
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newChatQuery, setNewChatQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'unread' | 'pinned'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [inputText, setInputText] = useState("");
  const [totalUnread, setTotalUnread] = useState(0);

  // States cho Options Menu (3 chấm), Modal Thông tin, Modal Kho ảnh, Zoom Ảnh và Quick Actions
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const optionsMenuRef = useRef(null);
  
  // Refs cho input file ẩn
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Khởi tạo dữ liệu từ LocalStorage hoặc dữ liệu mẫu và đồng bộ tự động
  useEffect(() => {
    const savedChats = localStorage.getItem("agrimarket_chats");
    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        const needsUpdate = parsed.some(c => c.farmAddress === undefined || c.isPinned === undefined || c.mediaImages === undefined);
        if (needsUpdate) {
          const updated = parsed.map(c => {
            const initItem = INITIAL_CHATS.find(init => init.id === c.id);
            if (initItem) {
              return {
                ...initItem,
                ...c,
                farmAddress: c.farmAddress || initItem.farmAddress,
                phone: c.phone || initItem.phone,
                mediaImages: c.mediaImages || initItem.mediaImages || [...DEFAULT_MEDIA_IMAGES],
                isPinned: c.isPinned !== undefined ? c.isPinned : initItem.isPinned,
                isMuted: c.isMuted !== undefined ? c.isMuted : initItem.isMuted,
                isBlocked: c.isBlocked !== undefined ? c.isBlocked : initItem.isBlocked
              };
            }
            return c;
          });
          setChats(updated);
          localStorage.setItem("agrimarket_chats", JSON.stringify(updated));
        } else {
          setChats(parsed);
        }
      } catch (e) {
        setChats(INITIAL_CHATS);
      }
    } else {
      setChats(INITIAL_CHATS);
      localStorage.setItem("agrimarket_chats", JSON.stringify(INITIAL_CHATS));
    }
  }, []);

  // Đóng Options Menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setShowOptionsMenu(false);
      }
    };
    if (showOptionsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptionsMenu]);

  // Lắng nghe sự kiện mở chat từ các trang ProductDetail hoặc FarmerProfile
  useEffect(() => {
    const handleOpenChatEvent = (e) => {
      const { farmId, farmName, farmAvatar, phone, farmAddress } = e.detail;
      setIsOpen(true); // Mở cửa sổ chat popup lên
      
      const existingChat = chats.find(c => c.id === farmId);
      if (existingChat) {
        handleSelectFarm(existingChat, chats);
      } else {
        const initTimestamp = Date.now();
        const newChat = {
          id: farmId,
          name: farmName,
          verified: true,
          avatar: farmAvatar || "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=150&auto=format&fit=crop&q=60",
          phone: phone || "0912 345 678",
          farmAddress: farmAddress || "Đà Lạt, Lâm Đồng",
          activeState: "Đang hoạt động",
          isOnline: true,
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
          isBlocked: false,
          type: "normal",
          mediaImages: [...DEFAULT_MEDIA_IMAGES],
          messages: [
            { 
              id: `m-init-${initTimestamp}`, 
              sender: "farmer", 
              type: "text",
              text: `Chào bạn! Cảm ơn đã liên hệ với ${farmName}. Nông trại có thể giúp gì cho bạn?`, 
              time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
              timestamp: initTimestamp
            }
          ]
        };
        const updatedChats = [newChat, ...chats];
        saveChatsToStorage(updatedChats);
        handleSelectFarm(newChat, updatedChats);
      }
    };
    
    window.addEventListener("open_agrimarket_chat", handleOpenChatEvent);
    return () => {
      window.removeEventListener("open_agrimarket_chat", handleOpenChatEvent);
    };
  }, [chats]);

  // Tính tổng unread
  useEffect(() => {
    const count = chats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);
    setTotalUnread(count);
  }, [chats]);

  // Auto-scroll
  useEffect(() => {
    if (activeView === "chat" && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeView, selectedFarm, chats]);

  const saveChatsToStorage = (updatedChats) => {
    setChats(updatedChats);
    localStorage.setItem("agrimarket_chats", JSON.stringify(updatedChats));
  };

  const handleSelectFarm = (farm, currentChatsList = chats) => {
    setSelectedFarm(farm);
    setActiveView("chat");
    setShowOptionsMenu(false);
    setShowQuickActions(false);

    const listToUse = currentChatsList;
    const updatedChats = listToUse.map((c) => {
      if (c.id === farm.id) {
        const updatedMessages = c.messages.map(m => m.sender === 'farmer' ? { ...m, status: 'read' } : m);
        return { ...c, unreadCount: 0, messages: updatedMessages };
      }
      return c;
    });
    saveChatsToStorage(updatedChats);
  };

  const handleBackToList = () => {
    setActiveView("list");
    setSelectedFarm(null);
    setShowOptionsMenu(false);
    setShowQuickActions(false);
  };

  // Hàm phụ trợ gửi tin nhắn tự động
  const sendFarmerReply = (responseContent, chatList) => {
    setTimeout(() => {
      const checkChat = JSON.parse(localStorage.getItem("agrimarket_chats")) || [];
      const updatedCheck = checkChat.find(c => c.id === selectedFarm.id);
      if (updatedCheck?.isBlocked) return;

      const responseTime = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      const replyTimestamp = Date.now();
      
      const replyMsg = {
        id: `farmer-${replyTimestamp}`,
        sender: "farmer",
        type: "text",
        text: responseContent,
        time: responseTime,
        timestamp: replyTimestamp
      };

      const chatsWithReply = chatList.map((c) => {
        if (c.id === selectedFarm.id) {
          const isCurrentlyChatting = isOpen && activeView === "chat" && selectedFarm.id === c.id;
          return {
            ...c,
            unreadCount: isCurrentlyChatting ? 0 : (c.unreadCount || 0) + 1,
            messages: [...c.messages, replyMsg]
          };
        }
        return c;
      });

      saveChatsToStorage(chatsWithReply);
    }, 1500);
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedFarm) return;

    const currentDetail = chats.find(c => c.id === selectedFarm.id);
    if (currentDetail?.isBlocked) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const currentTimestamp = Date.now();

    const newMsg = {
      id: `user-${currentTimestamp}`,
      sender: "user",
      type: "text",
      text: inputText.trim(),
      time: timeStr,
      status: "sent",
      timestamp: currentTimestamp
    };

    const updatedChats = chats.map((c) => {
      if (c.id === selectedFarm.id) {
        return {
          ...c,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });

    saveChatsToStorage(updatedChats);
    setInputText("");

    const reply = AUTO_RESPONSES[Math.floor(Math.random() * AUTO_RESPONSES.length)];
    sendFarmerReply(reply, updatedChats);
  };

  // Gửi ảnh thực tế qua FileReader (base64)
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedFarm) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      const now = new Date();
      const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      const currentTimestamp = Date.now();

      const newMsg = {
        id: `user-img-${currentTimestamp}`,
        sender: "user",
        type: "image",
        mediaUrl: base64Data,
        time: timeStr,
        status: "sent",
        timestamp: currentTimestamp
      };

      const updatedChats = chats.map((c) => {
        if (c.id === selectedFarm.id) {
          const currentMedia = c.mediaImages || [...DEFAULT_MEDIA_IMAGES];
          return {
            ...c,
            mediaImages: [base64Data, ...currentMedia], // Đẩy ảnh mới lên đầu kho ảnh
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      });

      saveChatsToStorage(updatedChats);
      sendFarmerReply("Dạ vườn đã nhận được hình ảnh của bạn rồi nhé! Nông sản trông ngon quá.", updatedChats);
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // Reset input
  };

  // Gửi File đính kèm thực tế (Metadata hiển thị)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedFarm) return;

    // Tính kích thước
    let sizeStr = "";
    if (file.size < 1024 * 1024) {
      sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
    } else {
      sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const currentTimestamp = Date.now();

    const newMsg = {
      id: `user-file-${currentTimestamp}`,
      sender: "user",
      type: "file",
      fileName: file.name,
      fileSize: sizeStr,
      time: timeStr,
      status: "sent",
      timestamp: currentTimestamp
    };

    const updatedChats = chats.map((c) => {
      if (c.id === selectedFarm.id) {
        return {
          ...c,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });

    saveChatsToStorage(updatedChats);
    sendFarmerReply(`Dạ vườn nhận được file tài liệu "${file.name}" rồi nhé bạn. Vườn sẽ mở kiểm tra ạ.`, updatedChats);
    e.target.value = ""; // Reset input
  };

  // Gửi vị trí giả lập
  const handleSendLocation = () => {
    if (!selectedFarm) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const currentTimestamp = Date.now();

    const newMsg = {
      id: `user-loc-${currentTimestamp}`,
      sender: "user",
      type: "location",
      locationName: "Vị trí của tôi (Đang ở gần chợ nông sản Đà Lạt)",
      mapUrl: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=300&q=70",
      time: timeStr,
      status: "sent",
      timestamp: currentTimestamp
    };

    const updatedChats = chats.map((c) => {
      if (c.id === selectedFarm.id) {
        return {
          ...c,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });

    saveChatsToStorage(updatedChats);
    setShowQuickActions(false);
    sendFarmerReply("Dạ cảm ơn bạn đã gửi định vị! Bên mình sẽ báo shipper giao đúng vị trí này nha.", updatedChats);
  };

  // Gửi danh thiếp mẫu
  const handleSendContactCard = () => {
    if (!selectedFarm) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const currentTimestamp = Date.now();

    const newMsg = {
      id: `user-contact-${currentTimestamp}`,
      sender: "user",
      type: "contact",
      contactName: "Bùi Khắc Hưng (Nông dân số)",
      contactPhone: "0912 999 888",
      contactAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      time: timeStr,
      status: "sent",
      timestamp: currentTimestamp
    };

    const updatedChats = chats.map((c) => {
      if (c.id === selectedFarm.id) {
        return {
          ...c,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });

    saveChatsToStorage(updatedChats);
    setShowQuickActions(false);
    sendFarmerReply("Dạ vườn lưu lại thông tin liên hệ của bạn rồi nhé. Cảm ơn bạn!", updatedChats);
  };

  // Click chọn tin nhắn nhanh mẫu
  const handleSendQuickReply = (text) => {
    if (!selectedFarm) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const currentTimestamp = Date.now();

    const newMsg = {
      id: `user-quick-${currentTimestamp}`,
      sender: "user",
      type: "text",
      text: text,
      time: timeStr,
      status: "sent",
      timestamp: currentTimestamp
    };

    const updatedChats = chats.map((c) => {
      if (c.id === selectedFarm.id) {
        return {
          ...c,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });

    saveChatsToStorage(updatedChats);
    setShowQuickActions(false);
    
    // Auto trả lời thích hợp
    let responseText = "Dạ bắp cải và súp lơ hôm nay cắt ngoài vườn cực kỳ tươi xanh nhé bạn!";
    if (text.includes("ship")) {
      responseText = "Dạ sau khi bạn đặt đơn thì khoảng 30 phút - 1 tiếng shipper sẽ lấy hàng và giao đi ngay trong buổi ạ!";
    } else if (text.includes("bán sỉ")) {
      responseText = "Dạ bên mình có giá sỉ cực tốt cho các cửa hàng và bếp ăn từ 50kg trở lên. Bạn check Zalo số điện thoại vườn nhé!";
    }
    sendFarmerReply(responseText, updatedChats);
  };

  const handleCreateNewConversation = (farm) => {
    const existingChat = chats.find(c => c.id === farm.id);
    if (existingChat) {
      handleSelectFarm(existingChat);
    } else {
      const initTimestamp = Date.now();
      const newChat = {
        ...farm,
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        isBlocked: false,
        type: "normal",
        mediaImages: [...DEFAULT_MEDIA_IMAGES],
        messages: [
          { 
            id: `m-init-${initTimestamp}`, 
            sender: "farmer", 
            type: "text",
            text: `Chào bạn! Cảm ơn đã liên hệ với ${farm.name}. Nông trại có thể giúp gì cho bạn?`, 
            time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
            timestamp: initTimestamp
          }
        ]
      };
      const updatedChats = [newChat, ...chats];
      handleSelectFarm(newChat, updatedChats);
    }
    setNewChatQuery("");
  };

  const handleTogglePin = (farmId) => {
    const updatedChats = chats.map((c) => {
      if (c.id === farmId) {
        return { ...c, isPinned: !c.isPinned };
      }
      return c;
    });
    saveChatsToStorage(updatedChats);
    setShowOptionsMenu(false);
  };

  const handleToggleMute = (farmId) => {
    const updatedChats = chats.map((c) => {
      if (c.id === farmId) {
        return { ...c, isMuted: !c.isMuted };
      }
      return c;
    });
    saveChatsToStorage(updatedChats);
    setShowOptionsMenu(false);
  };

  const handleToggleBlock = (farmId) => {
    const updatedChats = chats.map((c) => {
      if (c.id === farmId) {
        return { ...c, isBlocked: !c.isBlocked };
      }
      return c;
    });
    saveChatsToStorage(updatedChats);
    setShowOptionsMenu(false);
  };

  const handleClearHistory = (farmId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện này không?")) {
      const updatedChats = chats.map((c) => {
        if (c.id === farmId) {
          return { ...c, messages: [] };
        }
        return c;
      });
      saveChatsToStorage(updatedChats);
      setShowOptionsMenu(false);
    }
  };

  const handleFeatureUnderDevelopment = (featureName) => {
    alert(`Tính năng ${featureName} đang được phát triển, hãy nhắn tin trò chuyện bằng văn bản nhé!`);
  };

  const getSortedChats = (chatsList) => {
    return [...chatsList].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      const aLast = a.messages[a.messages.length - 1];
      const bLast = b.messages[b.messages.length - 1];
      if (!aLast) return 1;
      if (!bLast) return -1;

      return (bLast.timestamp || 0) - (aLast.timestamp || 0);
    });
  };

  const sortedChats = getSortedChats(chats);

  const filteredChats = sortedChats.filter((chat) => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some(m => m.text?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "unread") return chat.unreadCount > 0;
    if (activeTab === "pinned") return chat.isPinned;

    return true;
  });

  const filteredSystemFarms = ALL_SYSTEM_FARMS.filter(farm => 
    farm.name.toLowerCase().includes(newChatQuery.toLowerCase())
  );

  const currentChatDetail = selectedFarm ? chats.find(c => c.id === selectedFarm.id) : null;

  return (
    <div className={`zalo-chat-container ${isOpen ? "zalo-popup-open" : ""}`}>
      {/* Inputs File Ẩn cho Chọn Ảnh / Tài liệu */}
      <input 
        type="file" 
        accept="image/*" 
        style={{ display: "none" }} 
        ref={imageInputRef} 
        onChange={handleImageUpload} 
      />
      <input 
        type="file" 
        accept="*" 
        style={{ display: "none" }} 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
      />

      {/* 1. Floating Trigger Button */}
      <button 
        className="zalo-chat-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Mở cửa sổ chat"
      >
        <div className="zalo-trigger-icon-wrapper">
          <svg className="zalo-chat-icon" width="24" height="22" viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C5.925 2 1 6.03 1 11c0 2.82 1.62 5.3 4.22 6.9l-1.07 3.2c-.1.31.2.6.49.46l3.78-1.89c1.13.22 2.33.33 3.58.33 6.075 0 11-4.03 11-9s-4.925-9-11-9zm-4.5 10c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="currentColor"/>
          </svg>
          <span className="zalo-trigger-text">Chat</span>
        </div>
        {totalUnread > 0 && (
          <span className="zalo-trigger-badge">{totalUnread}</span>
        )}
      </button>

      {/* Main Popup Window */}
      {isOpen && (
        <div className="zalo-chat-popup">
          
          {/* VIEW: LIST CHAT */}
          {activeView === "list" && (
            <div className="zalo-chat-list-view zalo-animate-fade-in">
              {/* Header */}
              <div className="zalo-chat-popup-header">
                <div className="zalo-header-title-wrapper">
                  <h3>
                    Tin nhắn 
                    {totalUnread > 0 && (
                      <span className="zalo-unread-number"> ({totalUnread})</span>
                    )}
                  </h3>
                </div>
                <div className="zalo-header-actions">
                  <button className="zalo-icon-btn zalo-header-btn zalo-text-primary-dark" onClick={() => setActiveView("new-chat")} title="Viết tin nhắn mới">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button className="zalo-icon-btn zalo-header-btn zalo-close-btn" onClick={() => setIsOpen(false)} title="Đóng chat">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Shopee Filter & Search Row */}
              <div className="shopee-chat-filter-row">
                <div className="shopee-search-wrapper">
                  <Search className="shopee-search-icon" size={15} />
                  <input 
                    type="text" 
                    placeholder="Tìm theo tên..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="shopee-clear-search" onClick={() => setSearchQuery("")}>
                      <X size={13} />
                    </button>
                  )}
                </div>
                
                <div className="shopee-dropdown-container">
                  <button 
                    type="button"
                    className="shopee-dropdown-trigger"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    <span>
                      {activeTab === "all" && "Tất cả"}
                      {activeTab === "unread" && "Chưa đọc"}
                      {activeTab === "pinned" && "Đã Ghim"}
                    </span>
                    <ChevronDown size={14} />
                  </button>
                  
                  {showFilterDropdown && (
                    <div className="shopee-dropdown-menu">
                      <button 
                        type="button"
                        className={`shopee-dropdown-item ${activeTab === "all" ? "selected" : ""}`}
                        onClick={() => { setActiveTab("all"); setShowFilterDropdown(false); }}
                      >
                        Tất cả
                      </button>
                      <button 
                        type="button"
                        className={`shopee-dropdown-item ${activeTab === "unread" ? "selected" : ""}`}
                        onClick={() => { setActiveTab("unread"); setShowFilterDropdown(false); }}
                      >
                        Chưa đọc
                      </button>
                      <button 
                        type="button"
                        className={`shopee-dropdown-item ${activeTab === "pinned" ? "selected" : ""}`}
                        onClick={() => { setActiveTab("pinned"); setShowFilterDropdown(false); }}
                      >
                        Đã Ghim
                      </button>
                    </div>
                  )}
                </div>
              </div>



              {/* Chat list */}
              <div className="zalo-chat-list-content">
                {filteredChats.length === 0 ? (
                  <div className="zalo-empty-chat-list">
                    <p>Không tìm thấy cuộc trò chuyện nào</p>
                  </div>
                ) : (
                  filteredChats.map((chat) => {
                    const lastMsg = chat.messages && chat.messages.length > 0 
                      ? chat.messages[chat.messages.length - 1] 
                      : null;
                    const isLastMsgUser = lastMsg?.sender === "user";
                    
                    let formattedLastMsg = "Lịch sử trò chuyện trống";
                    if (lastMsg) {
                      const prefix = isLastMsgUser ? "Bạn: " : "";
                      if (lastMsg.type === "image") {
                        formattedLastMsg = `${prefix}[Hình ảnh]`;
                      } else if (lastMsg.type === "file") {
                        formattedLastMsg = `${prefix}[Tài liệu] ${lastMsg.fileName}`;
                      } else if (lastMsg.type === "location") {
                        formattedLastMsg = `${prefix}[Vị trí]`;
                      } else if (lastMsg.type === "contact") {
                        formattedLastMsg = `${prefix}[Danh thiếp]`;
                      } else {
                        formattedLastMsg = `${prefix}${lastMsg.text}`;
                      }
                    }

                    const isCurrentActive = selectedFarm && selectedFarm.id === chat.id;
                    const hasUnread = chat.unreadCount > 0;

                    return (
                      <div 
                        key={chat.id} 
                        className={`zalo-chat-item-row ${hasUnread ? "zalo-unread-item" : ""} ${isCurrentActive ? "zalo-active-item" : ""}`}
                        onClick={() => handleSelectFarm(chat)}
                      >
                        <div className="zalo-avatar-wrapper">
                          <img src={chat.avatar} alt={chat.name} className="zalo-farm-avatar" />
                          {chat.isOnline && <span className="zalo-online-indicator"></span>}
                        </div>

                        <div className="zalo-chat-item-info">
                          <div className="zalo-chat-item-header">
                            <span className="zalo-farm-name-wrapper">
                              <span className="zalo-farm-name">{chat.name}</span>
                              {chat.verified && <CheckCircle2 className="zalo-verified-badge" size={14} />}
                              {chat.isPinned && <Pin size={11} className="zalo-mini-status-icon zalo-pinned-icon" />}
                              {chat.isMuted && <BellOff size={11} className="zalo-mini-status-icon zalo-muted-icon" />}
                            </span>
                            <span className="zalo-chat-time">{lastMsg?.time || ""}</span>
                          </div>
                          <div className="zalo-chat-item-preview">
                            <span className="zalo-preview-text" style={{ fontStyle: lastMsg ? "normal" : "italic" }}>
                              {formattedLastMsg}
                            </span>
                            {hasUnread && (
                              <span className="zalo-unread-badge-green">{chat.unreadCount}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* VIEW: TRÒ CHUYỆN MỚI */}
          {activeView === "new-chat" && (
            <div className="zalo-chat-list-view zalo-animate-fade-in">
              {/* Header */}
              <div className="zalo-chat-popup-header">
                <div className="zalo-header-title-wrapper" style={{display: "flex", alignItems: "center", gap: "6px"}}>
                  <button className="zalo-icon-btn zalo-back-btn" onClick={handleBackToList} title="Quay lại" style={{padding: "4px"}}>
                    <ArrowLeft size={20} />
                  </button>
                  <h3>Trò chuyện mới</h3>
                </div>
                <div className="zalo-header-actions">
                  <button className="zalo-icon-btn zalo-header-btn zalo-close-btn" onClick={() => setIsOpen(false)} title="Đóng chat">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Tìm kiếm */}
              <div className="shopee-chat-filter-row">
                <div className="shopee-search-wrapper">
                  <Search className="shopee-search-icon" size={16} />
                  <input 
                    type="text" 
                    placeholder="Tìm tên nông trại..." 
                    value={newChatQuery}
                    onChange={(e) => setNewChatQuery(e.target.value)}
                  />
                  {newChatQuery && (
                    <button className="shopee-clear-search" onClick={() => setNewChatQuery("")}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Danh sách nông trại đề xuất */}
              <div className="zalo-chat-list-content">
                <div className="zalo-new-chat-section-title">Nông trại đề xuất</div>
                {filteredSystemFarms.length === 0 ? (
                  <div className="zalo-empty-chat-list">
                    <p>Không tìm thấy nông trại nào</p>
                  </div>
                ) : (
                  filteredSystemFarms.map((farm) => {
                    return (
                      <div 
                        key={farm.id} 
                        className="zalo-new-chat-item-row"
                        onClick={() => handleCreateNewConversation(farm)}
                      >
                        <div className="zalo-avatar-wrapper">
                          <img src={farm.avatar} alt={farm.name} className="zalo-farm-avatar" />
                          {farm.isOnline && <span className="zalo-online-indicator"></span>}
                        </div>
                        <div className="zalo-chat-item-info">
                          <div className="zalo-new-chat-farm-header">
                            <span className="zalo-farm-name-wrapper">
                              <span className="zalo-farm-name" style={{fontWeight: "600"}}>{farm.name}</span>
                              {farm.verified && <CheckCircle2 className="zalo-verified-badge" size={14} />}
                            </span>
                            <span className="zalo-new-chat-status">{farm.activeState}</span>
                          </div>
                        </div>
                        <button className="zalo-start-chat-btn">Nhắn tin</button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* VIEW: DETAIL CHAT */}
          {activeView === "chat" && currentChatDetail && (
            <div className="zalo-chat-detail-view zalo-animate-slide-in">
              {/* Header */}
              <div className="zalo-chat-popup-header zalo-chat-detail-header">
                <button className="zalo-icon-btn zalo-back-btn" onClick={handleBackToList} title="Quay lại">
                  <ArrowLeft size={20} />
                </button>

                <div className="zalo-header-farm-info" onClick={() => setShowInfoModal(true)}>
                  <div className="zalo-avatar-wrapper">
                    <img src={currentChatDetail.avatar} alt={currentChatDetail.name} className="zalo-farm-avatar-small" />
                  </div>
                  <div className="zalo-header-text-details">
                    <div className="zalo-farm-title-wrapper">
                      <h4>{currentChatDetail.name}</h4>
                      {currentChatDetail.verified && <CheckCircle2 className="zalo-verified-badge-white" size={13} />}
                    </div>
                    <span className="zalo-active-status">
                      <span className="zalo-status-dot">●</span> {currentChatDetail.activeState}
                    </span>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="zalo-header-actions" style={{position: "relative"}}>
                  <button 
                    className={`zalo-icon-btn zalo-option-btn ${showOptionsMenu ? "zalo-option-btn-active" : ""}`}
                    onClick={() => setShowOptionsMenu(!showOptionsMenu)} 
                    title="Tùy chọn"
                  >
                    <MoreVertical size={18} />
                  </button>

                  <button className="zalo-icon-btn zalo-close-btn" onClick={() => setIsOpen(false)} title="Đóng chat">
                    <X size={20} />
                  </button>

                  {/* Dropdown Options Menu */}
                  {showOptionsMenu && (
                    <div className="zalo-options-dropdown" ref={optionsMenuRef}>
                      <button className="zalo-dropdown-item" onClick={() => { setShowInfoModal(true); setShowOptionsMenu(false); }}>
                        <Info size={15} />
                        <span>Thông tin nông trại</span>
                      </button>
                      <button className="zalo-dropdown-item" onClick={() => { setShowMediaModal(true); setShowOptionsMenu(false); }}>
                        <ImageIcon size={15} />
                        <span>Ảnh/Video đã gửi</span>
                      </button>
                      <button className="zalo-dropdown-item" onClick={() => handleTogglePin(currentChatDetail.id)}>
                        <Pin size={15} />
                        <span>{currentChatDetail.isPinned ? "Bỏ ghim trò chuyện" : "Ghim trò chuyện"}</span>
                      </button>
                      <button className="zalo-dropdown-item" onClick={() => handleToggleMute(currentChatDetail.id)}>
                        <BellOff size={15} />
                        <span>{currentChatDetail.isMuted ? "Bật thông báo" : "Tắt thông báo"}</span>
                      </button>
                      <button className="zalo-dropdown-item zalo-danger-item" onClick={() => handleClearHistory(currentChatDetail.id)}>
                        <Trash2 size={15} />
                        <span>Xóa lịch sử trò chuyện</span>
                      </button>
                      <button className="zalo-dropdown-item zalo-danger-item" onClick={() => handleToggleBlock(currentChatDetail.id)}>
                        <Ban size={15} />
                        <span>{currentChatDetail.isBlocked ? "Bỏ chặn nông trại" : "Chặn nông trại này"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages container */}
              <div className="zalo-chat-messages-container">
                <div className="zalo-chat-date-divider">
                  <span>Hôm nay</span>
                </div>

                {currentChatDetail.messages && currentChatDetail.messages.length === 0 ? (
                  <div className="zalo-empty-messages">
                    <p>Lịch sử trò chuyện trống. Nhập văn bản bên dưới để bắt đầu nhắn tin.</p>
                  </div>
                ) : (
                  currentChatDetail.messages && currentChatDetail.messages.map((msg, index) => {
                    const isUser = msg.sender === "user";
                    const isImg = msg.type === "image";
                    const isFile = msg.type === "file";
                    const isLoc = msg.type === "location";
                    const isCont = msg.type === "contact";

                    return (
                      <div 
                        key={msg.id || index} 
                        className={`zalo-message-row ${isUser ? "zalo-message-user" : "zalo-message-farmer"} ${isImg ? "zalo-row-image-type" : ""}`}
                      >
                        {!isUser && (
                          <img 
                            src={currentChatDetail.avatar} 
                            alt={currentChatDetail.name} 
                            className="zalo-msg-avatar-thumb" 
                          />
                        )}
                        
                        <div className="zalo-message-bubble-wrapper">
                          
                          {/* 1. TIN NHẮN DẠNG HÌNH ẢNH */}
                          {isImg && (
                            <div className="zalo-message-bubble-image-box" onClick={() => setZoomImageUrl(msg.mediaUrl)}>
                              <img src={msg.mediaUrl} alt="Hình ảnh đã gửi" className="zalo-chat-sent-image" />
                              <div className="zalo-image-meta-time">{msg.time}</div>
                            </div>
                          )}

                          {/* 2. TIN NHẮN DẠNG ĐÍNH KÈM FILE */}
                          {isFile && (
                            <div className="zalo-message-bubble zalo-message-bubble-file">
                              <div className="zalo-file-card-content">
                                <div className="zalo-file-icon-box">
                                  <FileText size={24} className="zalo-text-primary" />
                                </div>
                                <div className="zalo-file-metadata">
                                  <div className="zalo-file-name" title={msg.fileName}>{msg.fileName}</div>
                                  <div className="zalo-file-size">{msg.fileSize}</div>
                                </div>
                                <button className="zalo-file-download-btn" onClick={() => alert(`Tải xuống file giả lập: ${msg.fileName}`)} title="Tải xuống">
                                  <Download size={16} />
                                </button>
                              </div>
                              <span className="zalo-msg-time-generic">{msg.time}</span>
                            </div>
                          )}

                          {/* 3. TIN NHẮN DẠNG VỊ TRÍ BẢN ĐỒ */}
                          {isLoc && (
                            <div className="zalo-message-bubble zalo-message-bubble-location">
                              <div className="zalo-location-card-title">
                                <MapPin size={16} className="zalo-text-primary" />
                                <span>{msg.locationName}</span>
                              </div>
                              <div className="zalo-location-map-preview">
                                <img src={msg.mapUrl} alt="Bản đồ vị trí" />
                                <div className="zalo-location-map-overlay">
                                  <span className="zalo-location-pin-icon">📍</span>
                                </div>
                              </div>
                              <span className="zalo-msg-time-generic">{msg.time}</span>
                            </div>
                          )}

                          {/* 4. TIN NHẮN DẠNG DANH THIẾP */}
                          {isCont && (
                            <div className="zalo-message-bubble zalo-message-bubble-contact">
                              <div className="zalo-contact-card-header">
                                <UserSquare2 size={16} className="zalo-text-primary" />
                                <span>Gửi danh thiếp liên hệ</span>
                              </div>
                              <div className="zalo-contact-card-body">
                                <img src={msg.contactAvatar} alt={msg.contactName} className="zalo-contact-avatar" />
                                <div className="zalo-contact-text">
                                  <div className="zalo-contact-name">{msg.contactName}</div>
                                  <div className="zalo-contact-phone">{msg.contactPhone}</div>
                                </div>
                              </div>
                              <span className="zalo-msg-time-generic">{msg.time}</span>
                            </div>
                          )}

                          {/* 5. TIN NHẮN VĂN BẢN THƯỜNG */}
                          {!isImg && !isFile && !isLoc && !isCont && (
                            <div className="zalo-message-bubble">
                              <p className="zalo-message-text">{msg.text}</p>
                              {isUser && (
                                <div className="zalo-bubble-meta-user">
                                  <span className="zalo-msg-time-user">{msg.time}</span>
                                  <span className="zalo-msg-status-user">
                                    <CheckCheck size={12} className="zalo-tick-icon-green" />
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {!isUser && !isImg && (
                            <div className="zalo-message-meta-farmer">
                              <span className="zalo-msg-time-farmer">{msg.time}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* PANEL TIỆN ÍCH NHANH (QUICK ACTIONS MENU) */}
              {showQuickActions && (
                <div className="zalo-quick-actions-panel zalo-animate-fade-in">
                  <div className="zalo-quick-actions-header">
                    <span>Tiện ích nhanh</span>
                    <button className="zalo-quick-close-btn" onClick={() => setShowQuickActions(false)}>
                      <X size={14} />
                    </button>
                  </div>
                  
                  <div className="zalo-quick-buttons-grid">
                    <button className="zalo-quick-action-item-btn" onClick={handleSendLocation}>
                      <div className="zalo-quick-icon-circle zalo-bg-loc">
                        <MapPin size={18} />
                      </div>
                      <span>Gửi vị trí</span>
                    </button>
                    <button className="zalo-quick-action-item-btn" onClick={handleSendContactCard}>
                      <div className="zalo-quick-icon-circle zalo-bg-contact">
                        <UserSquare2 size={18} />
                      </div>
                      <span>Gửi danh bạ</span>
                    </button>
                  </div>

                  <div className="zalo-quick-replies-section">
                    <div className="zalo-quick-replies-title">Hỏi thăm nhanh:</div>
                    <div className="zalo-quick-replies-list">
                      {QUICK_REPLIES.map((reply, i) => (
                        <button key={i} className="zalo-quick-reply-pill" onClick={() => handleSendQuickReply(reply)}>
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Footer controls */}
              <div className="zalo-chat-footer-controls">
                {currentChatDetail.isBlocked ? (
                  <div className="zalo-blocked-input-banner">
                    <span>Bạn đã chặn nông trại này. Bỏ chặn để gửi tin nhắn.</span>
                    <button className="zalo-unblock-btn" onClick={() => handleToggleBlock(currentChatDetail.id)}>
                      Bỏ chặn
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="zalo-chat-attachments-row">
                      <button className="zalo-attachment-btn" onClick={() => imageInputRef.current.click()} title="Gửi ảnh">
                        <ImageIcon size={18} />
                      </button>
                      <button className="zalo-attachment-btn" onClick={() => fileInputRef.current.click()} title="Đính kèm file">
                        <Paperclip size={18} />
                      </button>
                      <button 
                        className={`zalo-attachment-btn ${showQuickActions ? "zalo-attachment-btn-active" : ""}`} 
                        onClick={() => setShowQuickActions(!showQuickActions)} 
                        title="Tính năng khác"
                      >
                        <PlusCircle size={18} />
                      </button>
                    </div>

                    <form className="zalo-chat-input-form" onSubmit={handleSendMessage}>
                      <input 
                        type="text" 
                        placeholder="Nhập tin nhắn..." 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        ref={chatInputRef}
                      />
                      <button 
                        type="submit" 
                        className={`zalo-send-msg-btn ${inputText.trim() ? "zalo-active" : ""}`}
                        disabled={!inputText.trim()}
                        title="Gửi tin nhắn"
                      >
                        <SendHorizontal size={18} />
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 4. MODAL XEM CHI TIẾT THÔNG TIN NÔNG TRẠI (Zalo Profile Card Style) */}
          {showInfoModal && currentChatDetail && (
            <div className="zalo-info-modal-overlay">
              <div className="zalo-info-modal-card">
                <div className="zalo-info-modal-header-container">
                  {/* Cánh đồng cover ảnh bìa */}
                  <img 
                    src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=80" 
                    alt="Ảnh bìa trang trại" 
                    className="zalo-info-modal-cover" 
                  />
                  <button className="zalo-info-modal-close-absolute" onClick={() => setShowInfoModal(false)}>
                    <X size={18} />
                  </button>
                </div>
                
                <div className="zalo-info-modal-body">
                  <div className="zalo-info-modal-avatar-wrapper">
                    <img 
                      src={currentChatDetail.avatar} 
                      alt={currentChatDetail.name} 
                      className="zalo-info-modal-avatar-profile" 
                    />
                  </div>
                  
                  <div className="zalo-info-modal-name-wrapper">
                    <h3>{currentChatDetail.name}</h3>
                    {currentChatDetail.verified && <CheckCircle2 className="zalo-verified-badge" size={16} />}
                  </div>
                  <span className="zalo-info-modal-status">{currentChatDetail.activeState}</span>
                  
                  <p className="zalo-info-modal-bio">
                    Chuyên cung cấp nông sản sạch hữu cơ đạt tiêu chuẩn VietGAP, an toàn cho sức khỏe gia đình bạn.
                  </p>
                  
                  <div className="zalo-info-details-list">
                    <div className="zalo-info-detail-item">
                      <svg className="zalo-info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      <div>
                        <div className="zalo-info-label">Điện thoại</div>
                        <div className="zalo-info-value">{currentChatDetail.phone}</div>
                      </div>
                    </div>
                    <div className="zalo-info-detail-item">
                      <svg className="zalo-info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      <div>
                        <div className="zalo-info-label">Địa chỉ nông trại</div>
                        <div className="zalo-info-value">{currentChatDetail.farmAddress || "Đang cập nhật"}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="zalo-info-modal-footer-two-buttons">
                  <button className="zalo-info-btn-secondary" onClick={() => handleFeatureUnderDevelopment("Xem cửa hàng nông nghiệp")}>
                    Xem cửa hàng
                  </button>
                  <button className="zalo-info-btn-primary" onClick={() => setShowInfoModal(false)}>
                    Nhắn tin
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. MODAL KHO ẢNH/VIDEO ĐÃ GỬI (Đọc động danh sách mediaImages) */}
          {showMediaModal && currentChatDetail && (
            <div className="zalo-info-modal-overlay">
              <div className="zalo-info-modal-card zalo-media-modal-card">
                <div className="zalo-media-modal-header">
                  <div className="zalo-media-header-left">
                    <h3>Ảnh/Video</h3>
                    <ChevronDown size={18} className="zalo-text-gray" />
                  </div>
                  <button className="zalo-info-modal-close" onClick={() => setShowMediaModal(false)}>
                    <X size={18} />
                  </button>
                </div>
                
                <div className="zalo-media-modal-body">
                  <div className="zalo-media-grid-2x4">
                    {(currentChatDetail.mediaImages || DEFAULT_MEDIA_IMAGES).slice(0, 8).map((imgUrl, i) => (
                      <div 
                        key={i} 
                        className="zalo-media-grid-item"
                        onClick={() => setZoomImageUrl(imgUrl)}
                        title="Xem ảnh lớn"
                      >
                        <img 
                          src={imgUrl} 
                          alt={`Ảnh đã gửi ${i + 1}`} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1610348725531-843dff163e2c?w=150";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="zalo-media-modal-footer">
                  <button 
                    className="zalo-media-view-all-btn"
                    onClick={() => alert(`Hiện đang hiển thị ${(currentChatDetail.mediaImages || DEFAULT_MEDIA_IMAGES).length} ảnh/video có trong cuộc hội thoại này.`)}
                  >
                    Xem tất cả
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. LIGHTBOX ZOOM PREVIEW */}
          {zoomImageUrl && (
            <div className="zalo-lightbox-overlay" onClick={() => setZoomImageUrl(null)}>
              <button className="zalo-lightbox-close" onClick={() => setZoomImageUrl(null)}>
                <X size={24} />
              </button>
              <div className="zalo-lightbox-image-wrapper" onClick={(e) => e.stopPropagation()}>
                <img src={zoomImageUrl} alt="Ảnh zoom lớn" className="zalo-lightbox-image" />
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default ChatPopup;

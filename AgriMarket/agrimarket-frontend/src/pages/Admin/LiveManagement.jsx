import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import {
  LayoutDashboard,
  Users,
  Sprout,
  CheckSquare,
  Folder,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  BarChart3,
  Globe,
  Bell,
  Activity,
  Settings,
  Truck,
  Search,
  Video,
  Eye,
  Heart,
  SlidersHorizontal,
  X,
  Radio,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import "./AdminStyles.css";
import "./LiveManagement.css";

export default function LiveManagement() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Products modal view state
  const [viewingProductsList, setViewingProductsList] = useState(null); // array of products or null
  
  // Custom terminate confirm modal state
  const [terminatingSession, setTerminatingSession] = useState(null); // { id, brand } or null

  // Interactive filters state
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'live', 'ended'
  const [sortBy, setSortBy] = useState("default"); // 'default', 'viewers', 'likes'

  // Baseline Mock sessions corresponding to the screenshot (plus mock product items and likes)
  const defaultMockSessions = [
    {
      id: "FRM-8892",
      farmerName: "Sơn Trà Green Farm",
      farmerBrand: "Sơn Trà Green Farm",
      farmerAvatar: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=150",
      title: "Thu hoạch sầu riêng Ri6 xuất khẩu - Siêu rẻ",
      description: "Sầu riêng Ri6 rụng chín cây chín tự nhiên cực kì thơm ngon béo ngậy.",
      status: "live",
      viewers: 1240,
      likes: 2840,
      durationLabel: "Đang diễn ra: 45 phút",
      products: [
        {
          id: 101,
          name: "Sầu riêng Ri6 chín cây loại 1",
          originalPrice: 85000,
          price: 76500,
          discountPercent: 10,
          unit: "kg",
          imageUrl: "https://images.unsplash.com/photo-1610970881699-44a5587caa9a?w=150"
        }
      ]
    },
    {
      id: "FRM-1024",
      farmerName: "Hải Đăng Hydroponics",
      farmerBrand: "Hải Đăng Hydroponics",
      farmerAvatar: "https://images.unsplash.com/photo-1560493450-4e5b3869023d?w=150",
      title: "Ưu đãi 50% combo Rau sạch thủy canh Đà Lạt",
      description: "Combo rau sạch organic chuẩn VietGAP giao tận nhà.",
      status: "live",
      viewers: 602,
      likes: 1200,
      durationLabel: "Đang diễn ra: 12 phút",
      products: [
        {
          id: 201,
          name: "Xà lách thủy canh Đà Lạt",
          originalPrice: 25000,
          price: 25000,
          discountPercent: 0,
          unit: "cây",
          imageUrl: "https://images.unsplash.com/photo-1622206194165-d29673b88980?w=150"
        },
        {
          id: 202,
          name: "Combo rau xà lách lolo xanh + đỏ",
          originalPrice: 60000,
          price: 30000,
          discountPercent: 50,
          unit: "combo",
          imageUrl: "https://images.unsplash.com/photo-1557844352-761f2565b576?w=150"
        }
      ]
    },
    {
      id: "FRM-2231",
      farmerName: "Mộc Châu Tea House",
      farmerBrand: "Mộc Châu Tea House",
      farmerAvatar: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=150",
      title: "Quy trình đóng gói Trà Shan Tuyết đặc sản",
      description: "Thưởng thức vị trà thượng hạng nổi tiếng của vùng cao Mộc Châu.",
      status: "ended",
      viewers: 3100,
      likes: 8400,
      durationLabel: "Kết thúc: 2 giờ trước",
      products: [
        {
          id: 301,
          name: "Trà cổ thụ Shan Tuyết Mộc Châu",
          originalPrice: 180000,
          price: 150000,
          discountPercent: 16,
          unit: "hộp",
          imageUrl: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=150"
        }
      ]
    },
    {
      id: "FRM-4451",
      farmerName: "Fruit Garden Vĩnh Long",
      farmerBrand: "Fruit Garden Vĩnh Long",
      farmerAvatar: "https://images.unsplash.com/photo-1527339760228-5c388274e80f?w=150",
      title: "Chôm chôm nhãn vườn nhà - Giao tận nơi",
      description: "Chôm chôm nhãn giòn ngọt tróc vỏ sấy tay thơm ngon.",
      status: "ended",
      viewers: 892,
      likes: 1850,
      durationLabel: "Kết thúc: 5 giờ trước",
      products: [
        {
          id: 401,
          name: "Chôm chôm nhãn chín đỏ ngọt",
          originalPrice: 35000,
          price: 35000,
          discountPercent: 0,
          unit: "kg",
          imageUrl: "https://images.unsplash.com/photo-1527339760228-5c388274e80f?w=150"
        }
      ]
    }
  ];

  const [sessions, setSessions] = useState([]);

  // Check auth and load sessions
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);

    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    loadSessions();
  }, [navigate]);

  const loadSessions = () => {
    // Read from localStorage to check for active farmer livestreams
    try {
      const storedCustom = JSON.parse(localStorage.getItem("farmer_custom_livestreams")) || [];
      const activeSession = JSON.parse(localStorage.getItem("active_farmer_livestream_session"));
      
      // Make a copy of custom list and merge
      let mergedList = [...storedCustom];

      // Convert stored sessions format into our admin display format
      const formattedCustom = mergedList.map((session) => {
        // Map products
        const parsedProducts = (session.products || []).map((p, idx) => ({
          id: p.id || idx,
          name: p.name,
          originalPrice: p.originalPrice || p.price,
          price: p.price,
          discountPercent: p.discountPercent || 0,
          unit: p.unit || "kg",
          imageUrl: p.imageUrl || "https://images.unsplash.com/photo-1550937386664-56d1dfef3854?w=150"
        }));

        // Extract viewers count number
        let viewersNum = 0;
        if (typeof session.viewers === "number") {
          viewersNum = session.viewers;
        } else if (typeof session.viewers === "string") {
          viewersNum = parseInt(session.viewers) || 0;
        }

        // Mock a like count based on viewers count or custom value
        const likesNum = session.likes || Math.max(Math.floor(viewersNum * (Math.random() * 2 + 1.2)), 50);

        return {
          id: session.id || `LIVE-${Math.floor(Math.random() * 9000) + 1000}`,
          farmerName: session.farmerName || "Nhà vườn AgriMarket",
          farmerBrand: session.farmerBrand || "Nông trại sạch địa phương",
          farmerAvatar: session.farmerAvatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
          title: session.title || "Phiên Livestream Nông sản",
          description: session.description || "",
          status: session.status || "live", // 'live' or 'replay'
          viewers: viewersNum,
          likes: likesNum,
          durationLabel: session.status === "live" ? "Đang trực tiếp" : "Đã phát xong",
          products: parsedProducts,
          isUserCreated: true // flag to distinguish
        };
      });

      // Filter out duplicate IDs from baseline mock sessions
      const customIds = formattedCustom.map(s => s.id);
      const uniqueMockBaselines = defaultMockSessions.filter(s => !customIds.includes(s.id));

      setSessions([...formattedCustom, ...uniqueMockBaselines]);
    } catch (err) {
      console.error("Lỗi đọc dữ liệu livestream:", err);
      setSessions(defaultMockSessions);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleTerminateStream = (sessionId, brandName) => {

    try {
      // Find the stream session in localStorage list
      const storedLives = JSON.parse(localStorage.getItem("farmer_custom_livestreams")) || [];
      const updatedLives = storedLives.map((session) => {
        if (session.id === sessionId || session.title.includes(brandName) || session.farmerBrand === brandName) {
          return {
            ...session,
            status: "replay",
            isBanned: true,
            scheduledTime: "Kết thúc bởi quản trị viên"
          };
        }
        return session;
      });

      localStorage.setItem("farmer_custom_livestreams", JSON.stringify(updatedLives));

      // Also remove active session if it matches
      const activeSession = JSON.parse(localStorage.getItem("active_farmer_livestream_session"));
      if (activeSession && (activeSession.id === sessionId || activeSession.farmerBrand === brandName)) {
        localStorage.removeItem("active_farmer_livestream_session");
      }

      showToast(`Đã chấm dứt livestream của nhà vườn ${brandName}.`);
      loadSessions(); // Reload state
    } catch (err) {
      console.error(err);
      
      // Fallback: update state locally
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, status: "ended", durationLabel: "Đã chấm dứt" } : s))
      );
      showToast(`Đã chấm dứt livestream của nhà vườn ${brandName} (Local).`);
    }
  };

  // Search filter, status filter, and sorting logic
  const filteredSessions = useMemo(() => {
    // Search query match
    let result = sessions.filter((s) => {
      const keyword = searchQuery.toLowerCase();
      return (
        s.farmerBrand.toLowerCase().includes(keyword) ||
        s.title.toLowerCase().includes(keyword) ||
        s.farmerName.toLowerCase().includes(keyword)
      );
    });

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }

    // Sort order
    if (sortBy === "viewers") {
      result = [...result].sort((a, b) => b.viewers - a.viewers);
    } else if (sortBy === "likes") {
      result = [...result].sort((a, b) => b.likes - a.likes);
    }

    return result;
  }, [sessions, searchQuery, statusFilter, sortBy]);

  // Derived stats counters
  const liveCount = useMemo(() => {
    return sessions.filter((s) => s.status === "live").length;
  }, [sessions]);

  const totalViewers = useMemo(() => {
    return sessions.reduce((acc, curr) => acc + (curr.viewers || 0), 0);
  }, [sessions]);

  const getFullImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
    return `${API_BASE_URL}/${cleanUrl}`;
  };

  return (
    <div className="admin-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast">
          <div className="admin-toast-content">
            <CheckCircle2 size={18} style={{ color: "#10b981", marginRight: "8px" }} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-logo-section">
          <Link to="/" className="admin-logo-link">
            <h1>
              <Truck size={24} className="admin-nav-icon-svg" />
              AgriAdmin
            </h1>
          </Link>
        </div>

        <nav className="admin-nav-menu">
          <button className="admin-nav-item" onClick={() => showToast("Chức năng Bảng điều khiển đang phát triển.")}>
            <span className="admin-nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
            </span>
            Bảng điều khiển
          </button>
          <button className="admin-nav-item" onClick={() => navigate("/admin/users")}>
            <span className="admin-nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </span>
            Quản lý tài khoản
          </button>

          <button className="admin-nav-item" onClick={() => showToast("Chức năng quản lý nông dân đang phát triển.")}>
            <span className="admin-nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><path d="M2 22 22 2"></path><path d="M8.5 20c.2-.5.5-1 1-1.4l5.2-5.2c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0L6.7 15.8c-.4.4-.9.7-1.4 1"></path><path d="M16 18c.2-.5.5-1 1-1.4l3.7-3.7c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0l-3.7 3.7c-.4.4-.9.7-1.4 1"></path><path d="M14 11.5c.2-.5.5-1 1-1.4l3.7-3.7c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0l-3.7 3.7c-.4.4-.9.7-1.4 1"></path><path d="M5.5 14.5c.5-.2 1-.5 1.4-1l5.2-5.2c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0l-5.2 5.2c-.4.4-.7.9-1 1.4"></path><path d="M11.5 6c.5-.2 1-.5 1.4-1l3.7-3.7c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0L10.3 3.3c-.4.4-.7.9-1 1.4"></path></svg>
            </span>
            Nông dân
          </button>
          <button className="admin-nav-item" onClick={() => navigate("/admin/products")}>
            <span className="admin-nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
            </span>
            Duyệt sản phẩm
          </button>
          <button className="admin-nav-item" onClick={() => showToast("Chức năng quản lý danh mục đang phát triển.")}>
            <span className="admin-nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </span>
            Danh mục
          </button>
          <button className="admin-nav-item" onClick={() => navigate("/admin/orders")}>
            <span className="admin-nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            </span>
            Đơn hàng
          </button>
          <button className="admin-nav-item" onClick={() => showToast("Chức năng giao dịch đang phát triển.")}>
            <span className="admin-nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            </span>
            Giao dịch
          </button>
          <button className="admin-nav-item" onClick={() => navigate("/admin/complaints")}>
            <span className="admin-nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </span>
            Hỗ trợ
          </button>
          <button className="admin-nav-item" onClick={() => navigate("/admin/reports")}>
            <span className="admin-nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </span>
            Báo cáo
          </button>
          <button className="admin-nav-item active" onClick={() => navigate("/admin/livestreams")}>
            <span className="admin-nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><path d="m22 8-6 4 6 4V8Z"></path><rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect></svg>
            </span>
            Quản lý Livestream
          </button>
          <button className="admin-nav-item" onClick={() => showToast("Chức năng AI Monitoring đang phát triển.")}>
            <span className="admin-nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>
            </span>
            Giám sát AI
          </button>
          <button className="admin-nav-item" onClick={() => navigate("/admin/notifications")}>
            <span className="admin-nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </span>
            Thông báo
          </button>
          <button className="admin-nav-item" onClick={() => showToast("Chức năng thống kê hệ thống đang phát triển.")}>
            <span className="admin-nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </span>
            Thống kê hệ thống
          </button>
          <button className="admin-nav-item" onClick={() => showToast("Chức năng cài đặt đang phát triển.")}>
            <span className="admin-nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </span>
            Cài đặt
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <img
            src={getFullImageUrl(currentUser?.avatarUrl) || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"}
            alt="Avatar admin"
            className="admin-footer-avatar"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150";
            }}
          />
          <div className="admin-footer-info">
            <p className="admin-footer-name">{currentUser?.fullName || "Quản trị viên"}</p>
            <p className="admin-footer-role">Quản trị viên cấp cao</p>
          </div>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="admin-main-container">
        {/* Header - Matching Image 1 */}
        <header className="admin-header">
          <div className="admin-search-wrapper">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm phiên live, nhà vườn..."
              className="admin-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin-header-actions">
            <button className="admin-notification-btn" aria-label="Notifications" onClick={() => navigate("/admin/notifications")}>
              <span>🔔</span>
              <span className="admin-notification-dot"></span>
            </button>
            <div className="admin-profile-dropdown-trigger">
              <span className="admin-username">AgriLive Management</span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="admin-page-body">
          <div className="live-management-container">
            {/* Page Header */}
            <div className="live-management-header">
              <div className="live-header-left">
                <h2>Quản lý Livestream</h2>
                <p>Giám sát và kiểm soát các hoạt động bán hàng trực tiếp trên hệ thống.</p>
              </div>
              <div className="live-header-right-wrapper" style={{ position: "relative" }}>
                <button
                  className={`btn-filter-trigger ${isFilterDropdownOpen ? "active" : ""}`}
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                >
                  <SlidersHorizontal size={16} />
                  Bộ lọc { (statusFilter !== "all" || sortBy !== "default") && "•" }
                </button>
                
                {isFilterDropdownOpen && (
                  <div className="filter-dropdown-menu">
                    <div className="filter-group">
                      <p className="filter-group-title">Trạng thái</p>
                      <label className="filter-option">
                        <input
                          type="radio"
                          name="statusFilter"
                          checked={statusFilter === "all"}
                          onChange={() => setStatusFilter("all")}
                        />
                        <span>Tất cả</span>
                      </label>
                      <label className="filter-option">
                        <input
                          type="radio"
                          name="statusFilter"
                          checked={statusFilter === "live"}
                          onChange={() => setStatusFilter("live")}
                        />
                        <span>Đang trực tiếp (LIVE)</span>
                      </label>
                      <label className="filter-option">
                        <input
                          type="radio"
                          name="statusFilter"
                          checked={statusFilter === "ended"}
                          onChange={() => setStatusFilter("ended")}
                        />
                        <span>Đã kết thúc (ENDED)</span>
                      </label>
                    </div>

                    <div className="filter-group" style={{ marginTop: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
                      <p className="filter-group-title">Sắp xếp theo</p>
                      <label className="filter-option">
                        <input
                          type="radio"
                          name="sortBy"
                          checked={sortBy === "default"}
                          onChange={() => setSortBy("default")}
                        />
                        <span>Mặc định</span>
                      </label>
                      <label className="filter-option">
                        <input
                          type="radio"
                          name="sortBy"
                          checked={sortBy === "viewers"}
                          onChange={() => setSortBy("viewers")}
                        />
                        <span>Lượt xem nhiều nhất</span>
                      </label>
                      <label className="filter-option">
                        <input
                          type="radio"
                          name="sortBy"
                          checked={sortBy === "likes"}
                          onChange={() => setSortBy("likes")}
                        />
                        <span>Lượt thích nhiều nhất</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Cards - Compact Layout (Only 2 cards based on requests) */}
            <div className="live-stats-grid">
              <div className="live-stat-card">
                <div className="live-stat-header">
                  <span className="live-stat-title">Đang trực tiếp</span>
                  <div className="live-stat-icon-wrapper live">
                    <Radio size={20} />
                  </div>
                </div>
                <h2 className="live-stat-value">{liveCount}</h2>
                <span className="live-stat-badge green">+12%</span>
              </div>

              <div className="live-stat-card">
                <div className="live-stat-header">
                  <span className="live-stat-title">Tổng người xem</span>
                  <div className="live-stat-icon-wrapper viewers">
                    <Users size={20} />
                  </div>
                </div>
                <h2 className="live-stat-value">
                  {totalViewers >= 1000 ? `${(totalViewers / 1000).toFixed(1)}k` : totalViewers.toLocaleString()}
                </h2>
                <span className="live-stat-badge blue">Ổn định</span>
              </div>
            </div>

            {/* Stream Table */}
            <div className="live-table-card">
              <table className="live-data-table">
                <thead>
                  <tr>
                    <th>Nhà vườn (Farmer)</th>
                    <th>Tiêu đề (Title)</th>
                    <th>Số người xem</th>
                    <th>Lượt thích</th>
                    <th>Sản phẩm</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.length > 0 ? (
                    filteredSessions.map((session) => (
                      <tr key={session.id}>
                        {/* Farmer column */}
                        <td>
                          <div className="live-farmer-cell">
                            <img
                              src={session.farmerAvatar}
                              alt={session.farmerBrand}
                              className="live-farmer-avatar"
                            />
                            <div>
                              <p className="live-farmer-brand">{session.farmerBrand}</p>
                              <p className="live-farmer-id">ID: {session.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Title column */}
                        <td>
                          <div className="live-title-cell">
                            <p className="live-stream-title">{session.title}</p>
                            <p className="live-stream-subtitle">
                              {session.status === "live" ? (
                                <>
                                  <span className="status-dot-blink" style={{ marginRight: "4px" }}></span>
                                  {session.durationLabel}
                                </>
                              ) : (
                                session.durationLabel
                              )}
                            </p>
                          </div>
                        </td>

                        {/* Viewers count column */}
                        <td>
                          <span className="live-viewers-count">
                            <Eye size={16} style={{ color: "#64748b" }} />
                            {session.viewers >= 1000
                              ? `${(session.viewers / 1000).toFixed(1)}k`
                              : session.viewers.toLocaleString()}
                          </span>
                        </td>

                        {/* Likes column */}
                        <td>
                          <span className="live-likes-count">
                            <Heart size={16} style={{ color: "#ef4444", fill: "#ef4444" }} />
                            {session.likes >= 1000
                              ? `${(session.likes / 1000).toFixed(1)}k`
                              : session.likes.toLocaleString()}
                          </span>
                        </td>

                        {/* Products overlapping thumbnails column */}
                        <td>
                          <div className="overlapping-products" onClick={() => setViewingProductsList(session.products)}>
                            {session.products && session.products.slice(0, 3).map((prod) => (
                              <img
                                key={prod.id}
                                src={prod.imageUrl}
                                alt={prod.name}
                                className="overlapping-product-img"
                                title={prod.name}
                              />
                            ))}
                            {session.products && session.products.length > 3 && (
                              <div className="more-products-badge" title="Xem tất cả">
                                +{session.products.length - 3}
                              </div>
                            )}
                            {(!session.products || session.products.length === 0) && (
                              <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Không có</span>
                            )}
                          </div>
                        </td>

                        {/* Status column */}
                        <td>
                          <span className={`status-badge-pill ${session.status}`}>
                            {session.status === "live" ? (
                              <>
                                <span className="status-dot-blink"></span>
                                LIVE
                              </>
                            ) : (
                              "ENDED"
                            )}
                          </span>
                        </td>

                        {/* Actions column */}
                        <td>
                          {session.status === "live" ? (
                            <button
                              className="btn-terminate-stream"
                              onClick={() => setTerminatingSession({ id: session.id, brand: session.farmerBrand })}
                            >
                              Chấm dứt
                            </button>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: "600" }}>---</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                        Không tìm thấy phiên livestream nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Table pagination footer */}
              <div className="live-pagination-bar">
                <span>Hiển thị 1-{filteredSessions.length} trên tổng số {sessions.length} phiên live</span>
                <div className="live-page-buttons">
                  <button className="page-btn" disabled>&lt;</button>
                  <button className="page-btn active">1</button>
                  <button className="page-btn">2</button>
                  <button className="page-btn">3</button>
                  <button className="page-btn">&gt;</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Viewing Products Details Modal */}
      {viewingProductsList && (
        <div className="products-modal-overlay" onClick={() => setViewingProductsList(null)}>
          <div className="products-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="products-modal-header">
              <h3>📦 Danh sách sản phẩm live</h3>
              <button className="btn-close-modal" onClick={() => setViewingProductsList(null)}>
                &times;
              </button>
            </div>
            <div className="products-modal-body">
              <div className="modal-product-list">
                {viewingProductsList.map((prod) => (
                  <div key={prod.id} className="modal-product-row">
                    <div className="modal-product-info">
                      <img src={prod.imageUrl} alt={prod.name} className="modal-product-img" />
                      <div>
                        <p className="modal-product-name">
                          {prod.name}
                          {prod.discountPercent > 0 && (
                            <span className="modal-product-badge-discount">
                              -{prod.discountPercent}%
                            </span>
                          )}
                        </p>
                        <p className="modal-product-price">
                          Đơn vị tính: {prod.unit || "kg"}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontWeight: "700", color: "#10b981", margin: 0 }}>
                        {prod.price.toLocaleString()}đ
                      </p>
                      {prod.discountPercent > 0 && (
                        <p style={{ fontSize: "0.75rem", textDecoration: "line-through", color: "#94a3b8", margin: 0 }}>
                          {prod.originalPrice.toLocaleString()}đ
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Terminate Confirmation Dialog Modal */}
      {terminatingSession && (
        <div className="confirm-modal-overlay" onClick={() => setTerminatingSession(null)}>
          <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-icon">
              <AlertTriangle size={28} />
            </div>
            <h3>Xác nhận buộc dừng</h3>
            <p>
              Bạn có chắc chắn muốn buộc <strong>DỪNG</strong> phiên livestream của nhà vườn <strong>{terminatingSession.brand}</strong> không?
            </p>
            <div className="confirm-modal-actions">
              <button className="btn-confirm-cancel" onClick={() => setTerminatingSession(null)}>
                Hủy bỏ
              </button>
              <button
                className="btn-confirm-submit"
                onClick={() => {
                  handleTerminateStream(terminatingSession.id, terminatingSession.brand);
                  setTerminatingSession(null);
                }}
              >
                Đồng ý dừng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

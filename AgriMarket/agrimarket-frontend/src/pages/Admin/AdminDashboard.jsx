import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Bell,
  HelpCircle,
  Download,
  ArrowUpRight,
  ChevronRight,
  AlertTriangle,
  Star,
  CreditCard,
  MessageSquare,
  CheckCircle2,
  UserPlus,
  RefreshCw,
  TrendingUp,
  LayoutDashboard,
  ShieldCheck,
  ScrollText
} from "lucide-react";
import authService from "../../services/authService";
import AdminSidebar from "../../components/common/Sidebar/AdminSidebar";
import apiClient from "../../services/apiClient";
import "./AdminStyles.css";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedRange, setSelectedRange] = useState("7days");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [visibleLogsCount, setVisibleLogsCount] = useState(4);
  const [toastMessage, setToastMessage] = useState("");

  const [data, setData] = useState({
    revenue: 4520000000,
    revenueTrend: "+12.4%",
    ordersCount: 12840,
    ordersCompletedPercent: 85,
    ordersPendingPercent: 15,
    usersTotal: 1580,
    usersCustomers: 1240,
    usersFarmers: 340,
    pendingProducts: 5,
    pendingComplaints: 2,
    revenueChart: [
      { label: "Thứ 2", value: 350000000 },
      { label: "Thứ 3", value: 520000000 },
      { label: "Thứ 4", value: 480000000 },
      { label: "Thứ 5", value: 610000000 },
      { label: "Thứ 6", value: 580000000 },
      { label: "Thứ 7", value: 720000000 },
      { label: "Chủ nhật", value: 790000000 }
    ],
    popularCategories: [
      { name: "Rau củ hữu cơ", percentage: 45, color: "#0f766e" },
      { name: "Trái cây Đà Lạt", percentage: 25, color: "#475569" },
      { name: "Hoa tươi", percentage: 20, color: "#854d0e" },
      { name: "Gạo & Ngũ cốc", percentage: 10, color: "#94a3b8" }
    ],
    topFarmers: [
      { initials: "NL", name: "Nông Trại Lam Anh", address: "Đà Lạt, Lâm Đồng", rating: 5, sold: 1420, revenue: 840000000 },
      { initials: "HG", name: "Hợp Tác Xã GreenWay", address: "Hòa Vang, Đà Nẵng", rating: 5, sold: 1150, revenue: 620000000 },
      { initials: "MT", name: "Vườn Cây Minh Tâm", address: "Cái Bè, Tiền Giang", rating: 5, sold: 980, revenue: 450000000 }
    ],
    operationalLogs: [
      { id: "mock_1", type: "VNPAY", title: "VNPay: Thanh toán #8492", time: "2 phút trước", description: "Giao dịch 1,200,000đ thành công từ khách hàng Nguyễn Văn A." },
      { id: "mock_2", type: "COMPLAINT", title: "Khiếu nại: Đơn hàng #9931", time: "45 phút trước", description: "Người dùng yêu cầu hoàn tiền do sản phẩm bị dập nát khi vận chuyển." },
      { id: "mock_3", type: "PRODUCT", title: "Duyệt sản phẩm: Măng tây hữu cơ", time: "2 giờ trước", description: "Nông trại Lam Anh vừa thêm danh mục sản phẩm mới vào gian hàng." },
      { id: "mock_4", type: "PARTNER", title: "Đối tác mới đăng ký", time: "5 giờ trước", description: "Hợp tác xã Mộc Châu vừa hoàn tất hồ sơ đăng ký đối tác chiến lược." }
    ]
  });

  const getFullImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
    return `${API_BASE_URL}/${cleanUrl}`;
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role?.toLowerCase() !== "admin") {
      navigate("/login");
      return;
    }
    setCurrentUser(user);
    fetchDashboardData(selectedRange);
  }, [selectedRange, navigate]);

  const fetchDashboardData = async (range) => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/admin/dashboard", {
        params: { range }
      });
      if (response.data) {
        setData(response.data);
      }
    } catch (err) {
      console.warn("Backend API không khả dụng, sử dụng dữ liệu mô phỏng local:", err.message);
      setError("Đang hiển thị dữ liệu mô phỏng do lỗi kết nối server.");
      // Simulated delay for local mock transitions
      setTimeout(() => {
        generateMockDataForRange(range);
      }, 300);
    } finally {
      setLoading(false);
    }
  };

  const generateMockDataForRange = (range) => {
    let revenue = 4520000000;
    let revenueTrend = "+12.4%";
    let ordersCount = 12840;
    let ordersCompletedPercent = 85;
    let ordersPendingPercent = 15;
    let chartData = [];

    if (range === "today") {
      revenue = 152000000;
      revenueTrend = "+5.8%";
      ordersCount = 450;
      ordersCompletedPercent = 90;
      ordersPendingPercent = 10;
      chartData = [
        { label: "00:00", value: 10000000 },
        { label: "04:00", value: 15000000 },
        { label: "08:00", value: 35000000 },
        { label: "12:00", value: 42000000 },
        { label: "16:00", value: 28000000 },
        { label: "20:00", value: 18000000 },
        { label: "24:00", value: 4000000 }
      ];
    } else if (range === "7days") {
      revenue = 4520000000;
      revenueTrend = "+12.4%";
      ordersCount = 12840;
      ordersCompletedPercent = 85;
      ordersPendingPercent = 15;
      chartData = [
        { label: "Thứ 2", value: 350000000 },
        { label: "Thứ 3", value: 520000000 },
        { label: "Thứ 4", value: 480000000 },
        { label: "Thứ 5", value: 610000000 },
        { label: "Thứ 6", value: 580000000 },
        { label: "Thứ 7", value: 720000000 },
        { label: "Chủ nhật", value: 790000000 }
      ];
    } else if (range === "30days") {
      revenue = 18240000000;
      revenueTrend = "+18.2%";
      ordersCount = 52190;
      ordersCompletedPercent = 82;
      ordersPendingPercent = 18;
      chartData = [
        { label: "Tuần 1", value: 4200000000 },
        { label: "Tuần 2", value: 4800000000 },
        { label: "Tuần 3", value: 4400000000 },
        { label: "Tuần 4", value: 4840000000 }
      ];
    } else if (range === "year") {
      revenue = 218500000000;
      revenueTrend = "+24.5%";
      ordersCount = 620800;
      ordersCompletedPercent = 88;
      ordersPendingPercent = 12;
      chartData = [
        { label: "Quý 1", value: 48000000000 },
        { label: "Quý 2", value: 55000000000 },
        { label: "Quý 3", value: 52000000000 },
        { label: "Quý 4", value: 63500000000 }
      ];
    }

    setData(prev => ({
      ...prev,
      revenue,
      revenueTrend,
      ordersCount,
      ordersCompletedPercent,
      ordersPendingPercent,
      revenueChart: chartData
    }));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // Export report to CSV function
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Thoi Gian,Doanh Thu (VND)"].join(",") + "\n"
      + data.revenueChart.map(p => `${p.label},${p.value}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bao_cao_doanh_thu_${selectedRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("📊 Xuất báo cáo doanh thu thành công!");
  };

  // Load more logs mock handler
  const handleLoadMoreLogs = () => {
    if (visibleLogsCount >= data.operationalLogs.length) {
      // Add dynamic mock operations
      const newLogs = [
        { id: `dyn_${Date.now()}_1`, type: "PARTNER", title: "Đối tác mới đăng ký", time: "1 ngày trước", description: "Hợp tác xã Mộc Châu vừa hoàn tất hồ sơ đăng ký đối tác chiến lược." },
        { id: `dyn_${Date.now()}_2`, type: "VNPAY", title: "VNPay: Thanh toán #8480", time: "1 ngày trước", description: "Giao dịch 750,000đ thành công từ khách hàng Lê Văn Tám." },
        { id: `dyn_${Date.now()}_3`, type: "PRODUCT", title: "Duyệt sản phẩm: Cam Cao Phong", time: "2 ngày trước", description: "Nông trại Cao Phong vừa gửi sản phẩm mới cần kiểm tra." },
        { id: `dyn_${Date.now()}_4`, type: "COMPLAINT", title: "Khiếu nại: Đơn hàng #9905", time: "2 ngày trước", description: "Hỗ trợ khách hàng đổi trả sản phẩm bị hỏng trong quá trình vận chuyển." }
      ];
      setData(prev => ({
        ...prev,
        operationalLogs: [...prev.operationalLogs, ...newLogs]
      }));
      showToast("🔄 Đã tải thêm nhật ký vận hành.");
    }
    setVisibleLogsCount(prev => prev + 4);
  };

  // SVG Chart Plotting parameters
  const chartWidth = 500;
  const chartHeight = 160;
  const chartPadding = 20;

  const points = data.revenueChart || [];
  const maxVal = Math.max(...points.map(p => p.value), 1000000);

  const getSvgCoordinates = () => {
    if (points.length === 0) return [];
    return points.map((p, index) => {
      const x = chartPadding + (index * (chartWidth - 2 * chartPadding)) / (points.length - 1);
      // Coordinate y goes down, so we subtract from chartHeight
      const y = chartHeight - chartPadding - ((p.value / maxVal) * (chartHeight - 2 * chartPadding));
      return { x, y, label: p.label, value: p.value };
    });
  };

  const svgCoords = getSvgCoordinates();

  const getPathD = () => {
    if (svgCoords.length === 0) return "";
    return svgCoords.reduce((acc, coord, idx) => {
      return acc + (idx === 0 ? `M ${coord.x} ${coord.y}` : ` L ${coord.x} ${coord.y}`);
    }, "");
  };

  const getAreaD = () => {
    if (svgCoords.length === 0) return "";
    const pathD = getPathD();
    const first = svgCoords[0];
    const last = svgCoords[svgCoords.length - 1];
    return `${pathD} L ${last.x} ${chartHeight - chartPadding} L ${first.x} ${chartHeight - chartPadding} Z`;
  };

  // Rendering avatars for mock total users
  const customerAvatars = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80",
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80"
  ];

  const farmerAvatars = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80",
    "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=80"
  ];

  // Helper log icons
  const getLogIcon = (type) => {
    switch (type) {
      case "VNPAY":
        return <CreditCard size={11} />;
      case "COMPLAINT":
        return <AlertTriangle size={11} />;
      case "PRODUCT":
        return <CheckCircle2 size={11} />;
      case "PARTNER":
      default:
        return <UserPlus size={11} />;
    }
  };

  const getLogColorClass = (type) => {
    switch (type) {
      case "VNPAY":
        return "bubble-vnpay";
      case "COMPLAINT":
        return "bubble-complaint";
      case "PRODUCT":
        return "bubble-product";
      case "PARTNER":
      default:
        return "bubble-partner";
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar navigation */}
      <AdminSidebar activeItem="dashboard" showToast={showToast} />

      {/* Main content grid */}
      <div className="admin-main-container">
        {/* Header - Image matching styling */}
        <header className="admin-header">
          <div className="admin-search-wrapper">
            <span className="admin-search-icon" style={{ display: "inline-flex", alignItems: "center" }}>
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm giao dịch..."
              className="admin-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#475569", cursor: "pointer" }} onClick={() => showToast("Chức năng Báo cáo")}>Báo cáo</span>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#475569", cursor: "pointer" }} onClick={() => showToast("Chức năng Đối soát")}>Đối soát</span>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#475569", cursor: "pointer" }} onClick={() => navigate("/admin/complaints")}>Hỗ trợ</span>
          </div>

          <div className="admin-header-actions">
            <button className="admin-notification-btn" aria-label="Notifications" onClick={() => showToast("Không có thông báo mới.")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={18} />
              <span className="admin-notification-dot"></span>
            </button>
            <button className="admin-notification-btn" aria-label="Help" onClick={() => showToast("Hệ thống trợ giúp admin.")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginLeft: "4px" }}>
              <HelpCircle size={18} />
            </button>
            <button 
              className="admin-notification-btn" 
              aria-label="Profile" 
              onClick={() => navigate("/profile")}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginLeft: "4px", borderRadius: "50%", overflow: "hidden" }}
            >
              <img
                src={getFullImageUrl(currentUser?.avatarUrl) || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"}
                alt="Profile"
                style={{ width: "32px", height: "32px", objectFit: "cover" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150";
                }}
              />
            </button>
          </div>
        </header>

        {/* Dashboard contents */}
        <div className="admin-dashboard-wrapper">
          
          {/* Header Row */}
          <div className="dashboard-header-section">
            <div>
              <div className="dashboard-breadcrumbs">
                <span className="dashboard-breadcrumbs-link">Admin</span>
                <span className="dashboard-breadcrumbs-separator">/</span>
                <span style={{ fontWeight: 600, color: "#0f766e" }}>Tổng quan</span>
              </div>
              <h2 className="dashboard-title-h2">Bảng Điều Khiển Hệ Thống</h2>
            </div>

            {/* Date Filters Selector */}
            <div className="date-filters-container">
              <button 
                className={`date-filter-btn ${selectedRange === "today" ? "active" : ""}`}
                onClick={() => setSelectedRange("today")}
              >
                Hôm nay
              </button>
              <button 
                className={`date-filter-btn ${selectedRange === "7days" ? "active" : ""}`}
                onClick={() => setSelectedRange("7days")}
              >
                7 ngày qua
              </button>
              <button 
                className={`date-filter-btn ${selectedRange === "30days" ? "active" : ""}`}
                onClick={() => setSelectedRange("30days")}
              >
                30 ngày qua
              </button>
              <button 
                className={`date-filter-btn ${selectedRange === "year" ? "active" : ""}`}
                onClick={() => setSelectedRange("year")}
              >
                Năm nay
              </button>
            </div>
          </div>

          {/* Toast feedback */}
          {toastMessage && (
            <div style={{
              position: "fixed", top: "85px", right: "30px", zIndex: 9999,
              backgroundColor: "#0f766e", color: "#ffffff", padding: "12px 24px",
              borderRadius: "10px", fontWeight: "600", fontSize: "14.5px",
              boxShadow: "0 10px 15px -3px rgba(15, 118, 110, 0.3)",
              display: "flex", alignItems: "center", gap: "8px"
            }}>
              <ShieldCheck size={18} />
              {toastMessage}
            </div>
          )}

          {/* Metric Cards Grid */}
          <div className="dashboard-metrics-grid">
            
            {/* CARD 1: TỔNG DOANH THU */}
            <div className="metric-card" style={{ height: "200px", minHeight: "200px", display: "flex", flexDirection: "column", padding: "20px 24px", boxSizing: "border-box" }}>
              <div className="metric-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", height: "40px" }}>
                <div className="metric-icon-wrapper metric-icon-revenue">
                  <CreditCard size={20} />
                </div>
                <div className="metric-trend-badge trend-positive">
                  <TrendingUp size={12} />
                  {data.revenueTrend}
                </div>
              </div>
              <p className="metric-card-label" style={{ margin: "0 0 4px 0" }}>Tổng doanh thu</p>
              <h3 className="metric-card-value" style={{ margin: "0", fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>{data.revenue.toLocaleString("en-US")} VND</h3>
              
              {/* Sparkline mini chart */}
              <div className="sparkline-container" style={{ height: "40px", width: "100%", marginTop: "12px", marginBottom: "0" }}>
                <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f766e" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M 0 35 Q 20 15 40 25 T 80 10 T 100 20" 
                    fill="none" 
                    stroke="#0f766e" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                  />
                  <path 
                    d="M 0 35 Q 20 15 40 25 T 80 10 T 100 20 L 100 40 L 0 40 Z" 
                    fill="url(#spark-grad)" 
                  />
                </svg>
              </div>
            </div>

            {/* CARD 2: ĐƠN HÀNG */}
            <div className="metric-card" style={{ height: "200px", minHeight: "200px", display: "flex", flexDirection: "column", padding: "20px 24px", boxSizing: "border-box" }}>
              <div className="metric-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", height: "40px" }}>
                <div className="metric-icon-wrapper" style={{ backgroundColor: "#f1f5f9", color: "#475569", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ScrollText size={20} />
                </div>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>Tháng này</span>
              </div>
              <p className="metric-card-label" style={{ margin: "0 0 4px 0" }}>Đơn hàng</p>
              <h3 className="metric-card-value" style={{ margin: "0", fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>{data.ordersCount.toLocaleString("en-US")}</h3>
              
              {/* Progress bar info */}
              <div className="progress-bar-container" style={{ marginTop: "12px", marginBottom: "0", width: "100%" }}>
                <div className="progress-info-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#475569", marginBottom: "6px", fontWeight: "600" }}>
                  <span>Hoàn tất: <span className="progress-info-label-highlight" style={{ fontWeight: "800", color: "#0f766e", fontSize: "15px" }}>{data.ordersCompletedPercent}%</span></span>
                  <span>Chờ xử lý: <span style={{ fontWeight: "800", color: "#ea580c", fontSize: "15px" }}>{data.ordersPendingPercent}%</span></span>
                </div>
                <div className="progress-bar-track" style={{ height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  <div className="progress-bar-fill" style={{ width: `${data.ordersCompletedPercent}%`, height: "100%", backgroundColor: "#0f766e", borderRadius: "4px" }}></div>
                </div>
              </div>
            </div>

            {/* CARD 3: TỔNG NGƯỜI DÙNG */}
            <div className="metric-card" style={{ height: "200px", minHeight: "200px", display: "flex", flexDirection: "column", padding: "20px 24px", boxSizing: "border-box" }}>
              <div className="metric-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", height: "40px" }}>
                <div className="metric-icon-wrapper metric-icon-users" style={{ width: "40px", height: "40px", borderRadius: "10px" }}>
                  <UserPlus size={20} />
                </div>
              </div>
              <p className="metric-card-label" style={{ margin: "0 0 4px 0" }}>Tổng người dùng</p>
              <h3 className="metric-card-value" style={{ margin: "0", fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>{data.usersTotal.toLocaleString("en-US")}</h3>
              
              {/* Group Users breakdown with stack avatars */}
              <div className="users-details-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", marginBottom: "0", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                <div className="user-type-stat">
                  <span className="user-type-label">Khách hàng</span>
                  <span className="user-type-val">
                    {data.usersCustomers.toLocaleString("en-US")}
                    <div className="avatar-stack">
                      {customerAvatars.map((url, i) => (
                        <img key={i} src={url} className="avatar-stack-item" alt="Customer" />
                      ))}
                    </div>
                  </span>
                </div>

                <div className="user-type-stat" style={{ borderLeft: "1px solid #f1f5f9", paddingLeft: "12px" }}>
                  <span className="user-type-label">Chủ trang trại</span>
                  <span className="user-type-val">
                    {data.usersFarmers.toLocaleString("en-US")}
                    <div className="avatar-stack">
                      {farmerAvatars.map((url, i) => (
                        <img key={i} src={url} className="avatar-stack-item" alt="Farmer" />
                      ))}
                    </div>
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 4: CẦN PHÊ DUYỆT */}
            <div className="metric-card" style={{ height: "200px", minHeight: "200px", display: "flex", flexDirection: "column", padding: "20px 24px", boxSizing: "border-box", border: "1px solid #fee2e2" }}>
              <div className="metric-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", height: "40px" }}>
                <div className="metric-icon-wrapper metric-icon-approval" style={{ width: "40px", height: "40px", borderRadius: "10px" }}>
                  <AlertTriangle size={20} />
                </div>
                <div className="pending-badge">
                  <span className="pending-badge-dot"></span>
                  Yêu cầu mới
                </div>
              </div>
              <p className="metric-card-label" style={{ color: "#991b1b", margin: "0 0 4px 0" }}>Cần phê duyệt</p>
              
              <div className="pending-action-list" style={{ marginTop: "12px", marginBottom: "0" }}>
                <div className="pending-action-item" onClick={() => navigate("/admin/products")}>
                  <span>{data.pendingProducts} sản phẩm</span>
                  <ChevronRight size={14} className="pending-action-icon" />
                </div>
                <div className="pending-action-item" onClick={() => navigate("/admin/complaints")}>
                  <span>{data.pendingComplaints} khiếu nại</span>
                  <ChevronRight size={14} className="pending-action-icon" />
                </div>
              </div>
            </div>

          </div>

          {/* Secondary Grid (SVG Line Chart and Donut Category Allocation) */}
          <div className="dashboard-grid-2cols">
            
            {/* Chart: Revenue Trend */}
            <div className="dashboard-panel">
              <div className="panel-header-row">
                <div>
                  <h4 className="panel-title">Biểu đồ doanh thu</h4>
                  <p className="panel-subtitle">Xu hướng 7 ngày gần nhất</p>
                </div>
                <button className="panel-action-link" onClick={handleExportCSV}>
                  <Download size={15} />
                  Xuất báo cáo
                </button>
              </div>

              {/* Dynamic SVG line graph */}
              <div className="revenue-chart-wrapper">
                {hoveredPoint && (
                  <div 
                    className="chart-tooltip-bubble"
                    style={{ left: `${hoveredPoint.x}px`, top: `${hoveredPoint.y}px` }}
                  >
                    {hoveredPoint.label}: {hoveredPoint.value.toLocaleString("vi-VN")} đ
                  </div>
                )}
                
                <svg className="chart-svg-elem" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                  <defs>
                    <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f766e" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#0f766e" stopOpacity="0.001" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guide lines */}
                  <line x1={chartPadding} y1={chartPadding} x2={chartWidth - chartPadding} y2={chartPadding} className="chart-grid-line" />
                  <line x1={chartPadding} y1={chartHeight / 2} x2={chartWidth - chartPadding} y2={chartHeight / 2} className="chart-grid-line" />
                  <line x1={chartPadding} y1={chartHeight - chartPadding} x2={chartWidth - chartPadding} y2={chartHeight - chartPadding} className="chart-axis-line" />

                  {/* Filled background area */}
                  <path d={getAreaD()} className="chart-area-fill" />

                  {/* Connecting Line path */}
                  <path d={getPathD()} className="chart-data-line" />

                  {/* Data points circle markers */}
                  {svgCoords.map((coord, i) => (
                    <circle
                      key={i}
                      cx={coord.x}
                      cy={coord.y}
                      r={hoveredPoint && hoveredPoint.index === i ? 6 : 4}
                      className="chart-dot-marker"
                      onMouseEnter={() => setHoveredPoint({ ...coord, index: i })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}

                  {/* X-Axis labels */}
                  {svgCoords.map((coord, i) => (
                    <text
                      key={i}
                      x={coord.x}
                      y={chartHeight - 4}
                      textAnchor="middle"
                      style={{ fontSize: "10.5px", fontWeight: "600", fill: "#94a3b8" }}
                    >
                      {coord.label}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            {/* Panel: Popular Categories */}
            <div className="dashboard-panel">
              <div className="panel-header-row">
                <div>
                  <h4 className="panel-title">Danh mục phổ biến</h4>
                  <p className="panel-subtitle">Phân bổ doanh thu theo ngành hàng</p>
                </div>
              </div>

              {/* Donut graph rendering */}
              <div className="donut-chart-container">
                <div className="donut-svg-wrapper">
                  <svg width="100%" height="100%" viewBox="0 0 100 100">
                    {/* Circle slices: Rau củ 45% (0-45), Trái cây 25% (45-70), Hoa 20% (70-90), Gạo 10% (90-100) */}
                    {/* Stroke offset values configured dynamically */}
                    <circle 
                      cx="50" cy="50" r="38" 
                      fill="transparent" stroke="#e2e8f0" strokeWidth="10" 
                    />
                    
                    {/* Rau củ 45%: dasharray=45, spacing=55. offset=100-0 = 100 (in circumference coordinates: 2 * pi * r = 2 * 3.14 * 38 = 238.6) */}
                    <circle 
                      cx="50" cy="50" r="38" 
                      fill="transparent" stroke="#0f766e" strokeWidth="10" 
                      strokeDasharray="107.4 131.2"
                      strokeDashoffset="59.6"
                    />

                    {/* Trái cây 25%: dasharray=25, spacing=75 */}
                    <circle 
                      cx="50" cy="50" r="38" 
                      fill="transparent" stroke="#475569" strokeWidth="10" 
                      strokeDasharray="59.6 179"
                      strokeDashoffset="-47.8"
                    />

                    {/* Hoa tươi 20%: dasharray=20 */}
                    <circle 
                      cx="50" cy="50" r="38" 
                      fill="transparent" stroke="#854d0e" strokeWidth="10" 
                      strokeDasharray="47.7 190.9"
                      strokeDashoffset="-107.4"
                    />

                    {/* Gạo 10%: dasharray=10 */}
                    <circle 
                      cx="50" cy="50" r="38" 
                      fill="transparent" stroke="#94a3b8" strokeWidth="10" 
                      strokeDasharray="23.9 214.7"
                      strokeDashoffset="-155.1"
                    />
                  </svg>

                  <div className="donut-label-center">
                    <p className="donut-percent-val">100%</p>
                    <p className="donut-percent-lbl">Tỷ trọng</p>
                  </div>
                </div>

                {/* Categories legend list */}
                <div className="donut-legend-grid">
                  {data.popularCategories.map((cat, idx) => (
                    <div key={idx} className="legend-item">
                      <span className="legend-bullet" style={{ backgroundColor: cat.color }}></span>
                      <div className="legend-info">
                        <span className="legend-name">{cat.name}</span>
                        <span className="legend-percent">{cat.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Grid (Top Suppliers & Operations Logs timeline) */}
          <div className="dashboard-grid-2cols">
            
            {/* Top Suppliers List */}
            <div className="dashboard-panel" style={{ padding: "16px 0 24px 0" }}>
              <div className="panel-header-row" style={{ padding: "0 24px 8px 24px" }}>
                <h4 className="panel-title">Top 5 Nhà cung cấp xuất sắc</h4>
                <Link to="/admin/users" className="panel-action-link">
                  Xem tất cả
                </Link>
              </div>

              <table className="dashboard-table-supplier">
                <thead>
                  <tr>
                    <th>Nhà cung cấp</th>
                    <th>Đánh giá</th>
                    <th>Đã bán</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topFarmers.slice(0, 5).map((sup, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="supplier-profile-cell">
                          <div className={`supplier-avatar-abbr supplier-color-${idx % 5}`}>
                            {sup.initials}
                          </div>
                          <div>
                            <p className="supplier-name-bold">{sup.name}</p>
                            <p className="supplier-location-lbl">{sup.address}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="star-rating-container">
                          {[...Array(Math.floor(sup.rating))].map((_, i) => (
                            <Star key={i} size={13} fill="currentColor" />
                          ))}
                          {sup.rating % 1 !== 0 && <Star size={13} style={{ opacity: 0.5 }} fill="currentColor" />}
                        </div>
                      </td>
                      <td>
                        <span className="sold-count-lbl">{sup.sold.toLocaleString("vi-VN")}</span>
                      </td>
                      <td>
                        <span className="revenue-sum-lbl">{sup.revenue.toLocaleString("vi-VN")}đ</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Timeline Operations Logs */}
            <div className="dashboard-panel">
              <div className="panel-header-row">
                <div>
                  <h4 className="panel-title">Nhật ký vận hành</h4>
                  <p className="panel-subtitle">Các hoạt động mới nhất trên hệ thống</p>
                </div>
              </div>

              {/* Vertical line timeline container */}
              <div className="timeline-logs-thread">
                {data.operationalLogs.slice(0, visibleLogsCount).map((log) => (
                  <div key={log.id} className="timeline-log-card">
                    {/* Anchor bullet icon */}
                    <div className={`timeline-bubble-anchor ${getLogColorClass(log.type)}`}>
                      {getLogIcon(log.type)}
                    </div>
                    
                    <div className="timeline-log-header">
                      <h5 className="log-title-bold">{log.title}</h5>
                      <span className="log-time-lbl">{log.time}</span>
                    </div>
                    <p className="log-description-lbl">{log.description}</p>
                  </div>
                ))}
              </div>

              {visibleLogsCount < data.operationalLogs.length && (
                <button className="btn-load-more-logs" onClick={handleLoadMoreLogs}>
                  Tải thêm nhật ký
                </button>
              )}
            </div>

          </div>

          {/* Footer standard section */}
          <footer className="admin-portal-footer">
            <span>© 2024 FinTech Admin Portal. Hệ thống được bảo mật bởi chuẩn quốc tế DSS/PCI.</span>
          </footer>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

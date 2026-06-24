import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import orderService from "../../services/orderService";
import "./ShipmentRequests.css";

// Sample mock requests data in Vietnamese
const INITIAL_REQUESTS = [
  {
    id: "REQ-8924",
    orderId: "ORD-22910",
    status: "new",
    priority: "urgent",
    priorityLabel: "Khẩn cấp",
    shippingType: "sameday",
    shippingTypeLabel: "Giao trong ngày",
    timeAgo: "10 phút trước",
    distance: "15 dặm (24 km)",
    pickup: {
      location: "Trang trại Thung lũng Xanh, Phân khu 4",
      contact: "Sarah Jenkins (+1 555-0192)",
      time: "14:00 - 15:00 Hôm nay"
    },
    delivery: {
      location: "FreshMart Hub, Trung tâm Thành phố",
      contact: "Cổng nhận hàng D (Liên hệ điều phối)",
      time: "17:00 Hôm nay"
    },
    cargoSummary: [
      { name: "Táo Fuji Hữu cơ", quantity: "1 Pallet", weight: "400kg", thumb: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=120", badge: "Bảo quản lạnh", badgeType: "cold" },
      { name: "Táo Gala Đỏ", quantity: "1 Pallet", weight: "400kg", thumb: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=120", badge: "Dễ vỡ", badgeType: "warning" }
    ],
    tempControl: "Yêu cầu xe bảo ôn kiểm soát nhiệt độ (4°C - 6°C). Vận chuyển nhẹ tay.",
    itemSummaryText: "2 Pallet (Táo Hữu cơ)"
  },
  {
    id: "REQ-8923",
    orderId: "ORD-22908",
    status: "new",
    priority: "normal",
    priorityLabel: "Thường",
    shippingType: "standard",
    shippingTypeLabel: "Giao tiêu chuẩn",
    timeAgo: "45 phút trước",
    distance: "8 dặm (13 km)",
    pickup: {
      location: "Nông trại Sunny Side, Đà Lạt",
      contact: "Trần Văn Nam (+84 901-234-567)",
      time: "15:30 - 16:30 Hôm nay"
    },
    delivery: {
      location: "Chợ đầu mối Nông sản Thành phố",
      contact: "Quầy B3 - Ban quản lý chợ",
      time: "19:00 Hôm nay"
    },
    cargoSummary: [
      { name: "Rau Cải Xanh VietGAP", quantity: "3 Thùng", weight: "150kg", thumb: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=120" },
      { name: "Súp Lơ Trắng", quantity: "2 Thùng", weight: "100kg", thumb: "https://images.unsplash.com/photo-1566385101042-1a010c12b57a?w=120", badge: "Tươi sống", badgeType: "cold" }
    ],
    tempControl: "Hàng tươi sống, tránh để trực tiếp dưới ánh nắng mặt trời và xếp chồng quá cao.",
    itemSummaryText: "5 Thùng (Rau củ Hỗn hợp)"
  },
  {
    id: "REQ-8922",
    orderId: "ORD-22895",
    status: "new",
    priority: "urgent",
    priorityLabel: "Khẩn cấp",
    shippingType: "scheduled",
    shippingTypeLabel: "Đơn hẹn ngày",
    timeAgo: "1 giờ trước",
    distance: "25 dặm (40 km)",
    pickup: {
      location: "Hợp tác xã Nông nghiệp Đà Lạt Xanh",
      contact: "Nguyễn Thị Lan (+84 912-345-678)",
      time: "09:00 - 10:00 Ngày mai"
    },
    delivery: {
      location: "Kho mát Siêu thị Co.opmart Quận 1",
      contact: "Bộ phận Tiếp nhận Kho lạnh",
      time: "13:00 Ngày mai"
    },
    cargoSummary: [
      { name: "Dâu Tây Giống Mỹ", quantity: "4 Pallet", weight: "1,200kg", thumb: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=120", badge: "Bảo quản mát", badgeType: "cold" }
    ],
    tempControl: "Tránh rung lắc mạnh, yêu cầu duy trì nhiệt độ ổn định (8°C - 12°C) suốt hành trình.",
    itemSummaryText: "4 Pallet (Dâu tây Tươi)"
  },
  {
    id: "REQ-8921",
    orderId: "ORD-22890",
    status: "new",
    priority: "normal",
    priorityLabel: "Thường",
    shippingType: "standard",
    shippingTypeLabel: "Giao tiêu chuẩn",
    timeAgo: "2 giờ trước",
    distance: "18 dặm (29 km)",
    pickup: {
      location: "Vườn Cam Sành Hòa Bình",
      contact: "Lê Hoàng Bình (+84 988-777-666)",
      time: "08:00 - 09:30 Hôm nay"
    },
    delivery: {
      location: "Tổng kho Bách Hóa Xanh, Bình Dương",
      contact: "Trưởng ca nhận hàng - A. Hùng",
      time: "12:00 Hôm nay"
    },
    cargoSummary: [
      { name: "Cam Sành Loại 1", quantity: "10 Thùng", weight: "500kg", thumb: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=120" }
    ],
    tempControl: "Thông khí tốt, không xếp chồng quá 5 lớp hộp carton.",
    itemSummaryText: "10 Thùng (Cam Sành)"
  }
];

const mapBackendOrderToRequest = (order) => {
  const isUrgent = order.shippingNote && (
    order.shippingNote.toLowerCase().includes("gấp") || 
    order.shippingNote.toLowerCase().includes("khẩn") || 
    order.shippingNote.toLowerCase().includes("sớm")
  );
  
  const priority = isUrgent ? "urgent" : "normal";
  const priorityLabel = isUrgent ? "Khẩn cấp" : "Thường";
  
  let shippingType = "standard";
  let shippingTypeLabel = "Giao tiêu chuẩn";
  if (order.shippingNote) {
    const noteLower = order.shippingNote.toLowerCase();
    if (noteLower.includes("hẹn") || noteLower.includes("ngày")) {
      shippingType = "scheduled";
      shippingTypeLabel = "Đơn hẹn ngày";
    } else if (noteLower.includes("hỏa tốc") || noteLower.includes("gấp") || noteLower.includes("nhanh") || noteLower.includes("trong ngày")) {
      shippingType = "sameday";
      shippingTypeLabel = "Giao trong ngày";
    }
  }

  // Calculate a mock distance based on order hash to make it stable
  const hash = (order.id || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const distanceKm = 5 + (hash % 25);
  const distanceMiles = Math.round(distanceKm * 0.621371);
  const distance = `${distanceMiles} dặm (${distanceKm} km)`;

  const pickupLocation = order.provider ? order.provider.location : "Nông trại địa phương";
  const pickupContact = order.provider ? `${order.provider.name} (${order.provider.phone || "Liên hệ"})` : "Nhà vườn";

  const cargoSummary = (order.items || []).map((item, index) => {
    const isCold = item.name.toLowerCase().includes("dâu") || 
                   item.name.toLowerCase().includes("táo") || 
                   item.name.toLowerCase().includes("sữa") || 
                   item.name.toLowerCase().includes("bơ") ||
                   item.name.toLowerCase().includes("lạnh");
    return {
      name: item.name,
      quantity: `${item.qty} ${item.unit || "phần"}`,
      weight: `${item.qty * 2}kg`,
      thumb: item.img || "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=120",
      badge: isCold ? "Bảo quản mát" : null,
      badgeType: isCold ? "cold" : null
    };
  });

  const firstItemName = order.items && order.items.length > 0 ? order.items[0].name : "Nông sản";
  const itemSummaryText = `${order.itemCount || 0} sản phẩm (${firstItemName})`;

  return {
    id: order.id,
    orderId: order.id,
    status: (order.partner || order.status === "shipping" || order.status === "delivered" || order.status === "accepted") ? "accepted" : "new",
    priority,
    priorityLabel,
    shippingType,
    shippingTypeLabel,
    timeAgo: order.time + " " + order.date,
    orderDate: order.date,
    distance,
    pickup: {
      location: pickupLocation,
      contact: pickupContact,
      time: "Trong ngày " + order.date
    },
    delivery: {
      location: order.address,
      contact: `${order.recipient} (${order.phone})`,
      time: "Hạn giao: " + order.date
    },
    cargoSummary,
    tempControl: order.shippingNote || "Hàng tươi sống, tránh để trực tiếp dưới ánh nắng mặt trời và xếp chồng quá cao.",
    itemSummaryText,
    // Driver info — prefer driverInfo from response (persisted), fallback to partner profile
    driverName: order.driverInfo?.driverName || (order.partner ? order.partner.fullName : ""),
    driverCode: order.driverInfo?.driverCode || "",
    driverPhone: order.driverInfo?.driverPhone || (order.partner ? order.partner.phone : ""),
    vehicleType: order.driverInfo?.vehicleType || "",
    licensePlate: order.driverInfo?.licensePlate || "",
    driverAvatar: order.partner?.avatarUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    detailedStatus: order.detailedStatus || "assigned",
    shipperNotes: order.shipperNotes || ""
  };
};

export const ShipmentRequests = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const renderJourneyHistory = (req) => {
    if (!req) return null;
    const currentStatus = req.detailedStatus || "assigned";
    const statusesOrder = ["assigned", "pickup", "intransit", "delivered"];
    const currentIndex = statusesOrder.indexOf(currentStatus === "out_for_delivery" ? "intransit" : currentStatus);

    const steps = [
      {
        key: "assigned",
        title: "Đã điều phối tài xế",
        icon: "🪪",
        getMeta: (statusType) => {
          if (statusType === "completed") {
            return `${req.orderDate || "Hôm nay"}, lúc 08:00 AM • Đã xác nhận tài xế & xe`;
          } else if (statusType === "active") {
            return `Đang chờ tài xế xác nhận chuyến đi`;
          }
          return "Chờ điều phối";
        }
      },
      {
        key: "pickup",
        title: "Đã lấy hàng thành công tại nhà vườn",
        icon: "🏡",
        getMeta: (statusType) => {
          if (statusType === "completed") {
            return `${req.orderDate || "Hôm nay"}, lúc 09:15 AM • Đã bốc xếp hàng lên xe`;
          } else if (statusType === "active") {
            return `Tài xế đang di chuyển đến lấy hàng tại: ${req.pickup.location}`;
          }
          return `Dự kiến lấy hàng: ${req.pickup.time}`;
        }
      },
      {
        key: "intransit",
        title: "Đang vận chuyển",
        icon: "🚚",
        getMeta: (statusType) => {
          if (statusType === "completed") {
            return `${req.orderDate || "Hôm nay"}, lúc 10:30 AM • Đã hoàn thành bốc xếp nông sản`;
          } else if (statusType === "active") {
            return `Đang trên đường di giao đến khách nhận tại: ${req.delivery.location}`;
          }
          return "Chờ vận chuyển";
        }
      },
      {
        key: "delivered",
        title: "Đã giao hàng thành công",
        icon: "🏁",
        getMeta: (statusType) => {
          if (statusType === "completed" || statusType === "active") {
            return `${req.orderDate || "Hôm nay"}, lúc 12:30 PM • Người nhận: ${req.delivery.contact}`;
          }
          return `Dự kiến giao: ${req.delivery.time}`;
        }
      }
    ];

    let timelineItems = steps.map((step, idx) => {
      let statusType = "pending";
      if (idx <= currentIndex) {
        statusType = "completed";
      } else if (idx === currentIndex + 1) {
        statusType = "active";
      }
      return { ...step, statusType };
    });

    if (currentStatus === "incident") {
      const incidentItem = {
        key: "incident",
        title: "Lô hàng gặp sự cố / Bị trễ",
        icon: "⚠️",
        statusType: "active",
        getMeta: () => req.shipperNotes ? `Chi tiết sự cố: ${req.shipperNotes}` : "Tài xế đang xử lý sự cố phát sinh trên tuyến đường."
      };
      timelineItems.unshift(incidentItem);
    }

    return (
      <div className="ast-timeline-list">
        {timelineItems.map((item, idx) => {
          const isCompleted = item.statusType === "completed";
          const isActive = item.statusType === "active";
          
          let itemClass = "ast-timeline-item";
          if (isCompleted) itemClass += " completed";
          
          let nodeClass = "node";
          if (isCompleted) nodeClass += " completed-node";
          else if (isActive) nodeClass += " active-node";
          else nodeClass += " pending-node";

          const displayIcon = isCompleted ? "✓" : item.icon;

          return (
            <div key={idx} className={itemClass}>
              <div className={nodeClass}>
                <span className="icon">{displayIcon}</span>
              </div>
              <div className="info">
                <h4 className="title">{item.title}</h4>
                <span className="meta">{item.getMeta(item.statusType)}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Dashboard requests state
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected request for details view
  const [selectedId, setSelectedId] = useState("");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTypeTab, setActiveTypeTab] = useState("unaccepted"); // "unaccepted" | "delivering" | "completed"
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "sameday" | "standard" | "scheduled"

  // Counts for KPI Cards
  const [newCount, setNewCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);

  // Success / error toast notification state
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    actionType: "", // "accept" | "reject"
    requestId: ""
  });

  // Driver Info Modal state
  const [driverModal, setDriverModal] = useState({
    isOpen: false,
    requestId: ""
  });
  const [driverForm, setDriverForm] = useState({
    driverName: "",
    driverCode: "",
    driverPhone: "",
    vehicleType: "Xe tải thường",
    licensePlate: ""
  });
  const [driverFormErrors, setDriverFormErrors] = useState({});

  const loadRequests = async () => {
    setLoading(true);
    try {
      const unacceptedData = await orderService.getShipperRequests();
      const acceptedData = await orderService.getShipperAccepted();

      const unacceptedMapped = unacceptedData.map(mapBackendOrderToRequest);
      const acceptedMapped = acceptedData.map(mapBackendOrderToRequest);

      const allMapped = [...unacceptedMapped, ...acceptedMapped];
      setRequests(allMapped);

      // Update KPI counts
      setNewCount(unacceptedMapped.length);
      setAcceptedCount(acceptedMapped.length);
      setUrgentCount(unacceptedMapped.filter(r => r.priority === "urgent").length);

      // Auto-select first request based on tab
      let filtered = [];
      if (activeTypeTab === "unaccepted") {
        filtered = allMapped.filter(r => r.status === "new");
      } else if (activeTypeTab === "delivering") {
        filtered = allMapped.filter(r => r.status === "accepted" && r.detailedStatus !== "delivered");
      } else {
        filtered = allMapped.filter(r => r.status === "accepted" && r.detailedStatus === "delivered");
      }

      if (filtered.length > 0) {
        if (!filtered.some(r => r.id === selectedId)) {
          setSelectedId(filtered[0].id);
        }
      } else {
        setSelectedId("");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
      showToast("Lỗi khi kết nối với máy chủ backend.", "danger");
    } finally {
      setLoading(false);
    }
  };

  // Load user and initial requests list
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    loadRequests();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  // Reload when tab changes
  useEffect(() => {
    if (requests.length > 0) {
      let filtered = [];
      if (activeTypeTab === "unaccepted") {
        filtered = requests.filter(r => r.status === "new");
      } else if (activeTypeTab === "delivering") {
        filtered = requests.filter(r => r.status === "accepted" && r.detailedStatus !== "delivered");
      } else {
        filtered = requests.filter(r => r.status === "accepted" && r.detailedStatus === "delivered");
      }
      if (filtered.length > 0) {
        setSelectedId(filtered[0].id);
      } else {
        setSelectedId("");
      }
    }
  }, [activeTypeTab]);

  // Show dynamic notification toast
  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Handle Accept/Reject action
  const triggerAction = (actionType, id) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;

    if (actionType === "accept") {
      // Open driver info form modal instead of simple confirm
      setDriverForm({ driverName: "", driverCode: "", driverPhone: "", vehicleType: "Xe tải thường", licensePlate: "" });
      setDriverFormErrors({});
      setDriverModal({ isOpen: true, requestId: id });
    } else if (actionType === "reject") {
      setConfirmModal({
        isOpen: true,
        title: "Từ Chối Yêu Cầu Vận Chuyển",
        message: `Bạn có chắc chắn muốn TỪ CHỐI yêu cầu vận chuyển ${id} này? Hành động này không thể hoàn tác.`,
        actionType: "reject",
        requestId: id
      });
    }
  };

  // Validate driver form fields (with format checks)
  const validateDriverForm = () => {
    const errors = {};

    if (!driverForm.driverName.trim()) {
      errors.driverName = "Vui lòng nhập họ tên tài xế.";
    } else if (driverForm.driverName.trim().length < 3) {
      errors.driverName = "Họ tên phải có ít nhất 3 ký tự.";
    }

    if (!driverForm.driverCode.trim()) {
      errors.driverCode = "Vui lòng nhập mã tài xế.";
    }

    if (!driverForm.driverPhone.trim()) {
      errors.driverPhone = "Vui lòng nhập số điện thoại.";
    } else {
      const vnPhoneRegex = /^0\d{9}$/;
      if (!vnPhoneRegex.test(driverForm.driverPhone)) {
        errors.driverPhone = "Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 chữ số và bắt đầu bằng số 0.";
      }
    }

    if (!driverForm.licensePlate.trim()) {
      errors.licensePlate = "Vui lòng nhập biển kiểm soát.";
    } else {
      // Vietnamese license: 2 digits + 1-2 letters + 4-5 alphanumeric with optional separators
      // E.g.: 51C-12345, 51C1-2345, 30A-123.45, 29H1-99999
      const plateRaw = driverForm.licensePlate.trim().replace(/\s/g, "").toUpperCase();
      const vnPlateRegex = /^[0-9]{2}[A-Z]{1,2}[0-9]?[-.]?[0-9]{3,5}([.]?[0-9]{1,2})?$/;
      if (!vnPlateRegex.test(plateRaw)) {
        errors.licensePlate = "Biển kiểm soát không hợp lệ (VD: 51C-123.45, 30A-12345).";
      }
    }

    return errors;
  };

  // Submit driver form and accept request
  const handleDriverFormSubmit = async () => {
    const errors = validateDriverForm();
    if (Object.keys(errors).length > 0) {
      setDriverFormErrors(errors);
      return;
    }
    const { requestId } = driverModal;
    setDriverModal({ isOpen: false, requestId: "" });
    try {
      // Pass all driver form data to the backend
      await orderService.acceptShipperRequest(requestId, {
        driverName: driverForm.driverName.trim(),
        driverCode: driverForm.driverCode.trim(),
        driverPhone: driverForm.driverPhone.trim().replace(/[\s.-]/g, ""),
        vehicleType: driverForm.vehicleType,
        licensePlate: driverForm.licensePlate.trim().toUpperCase()
      });
      showToast(`Đã chấp nhận đơn ${requestId} và điều phối tài xế ${driverForm.driverName.trim()} thành công!`, "success");
      await loadRequests();
    } catch (error) {
      console.error("Lỗi khi chấp nhận yêu cầu:", error);
      showToast("Lỗi: " + (error.response?.data || error.message), "danger");
    }
  };

  // Confirm Action execution
  const executeConfirmedAction = async () => {
    const { actionType, requestId } = confirmModal;
    setConfirmModal({ isOpen: false, title: "", message: "", actionType: "", requestId: "" });

    try {
      if (actionType === "accept") {
        await orderService.acceptShipperRequest(requestId);
        showToast(`Đã chấp nhận yêu cầu vận chuyển ${requestId} thành công!`, "success");
        await loadRequests();
      } else if (actionType === "reject") {
        await orderService.rejectShipperRequest(requestId, "Đối tác từ chối");
        showToast(`Đã từ chối yêu cầu vận chuyển ${requestId}.`, "warning");
        await loadRequests();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      showToast("Lỗi: " + (error.response?.data || error.message), "danger");
    }
  };

  // Reset demo requests data
  const handleResetDemo = () => {
    loadRequests();
    showToast("Đã tải lại danh sách yêu cầu vận chuyển từ máy chủ!", "success");
  };

  // Filter and search logic
  const filteredRequests = requests.filter(r => {
    // 1. Status classification (Type 1, Type 2 or Type 3)
    if (activeTypeTab === "unaccepted") {
      if (r.status !== "new") return false;
    } else if (activeTypeTab === "delivering") {
      if (r.status !== "accepted" || r.detailedStatus === "delivered") return false;
    } else {
      if (r.status !== "accepted" || r.detailedStatus !== "delivered") return false;
    }

    // 2. Search query matches ID, pickup location, or delivery location
    const matchQuery = 
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.pickup.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.delivery.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.orderId.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchQuery) return false;

    // 3. Category/Shipping Type filter
    if (activeFilter === "sameday") {
      return r.shippingType === "sameday";
    }
    if (activeFilter === "standard") {
      return r.shippingType === "standard";
    }
    if (activeFilter === "scheduled") {
      return r.shippingType === "scheduled";
    }

    return true;
  });


  const selectedRequest = requests.find(r => r.id === selectedId);

  return (
    <div className="agri-steward-root">
      
      {/* 1. SIDEBAR */}
      <aside className="as-sidebar">
        <div className="as-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <div className="as-logo-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 18H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11v11" />
              <path d="M19 18h2a1 1 0 0 0 1-1v-5.5L18.5 9H17v9" />
              <circle cx="7" cy="18" r="2" />
              <circle cx="17" cy="18" r="2" />
            </svg>
          </div>
          <div className="as-brand-text">
            <h2>Partner Hub</h2>
            <span>Verified Shipping Node</span>
          </div>
        </div>

        <nav className="as-nav-menu">
          <button className="as-nav-item" onClick={() => navigate("/shipper/requests")}>
            <span className="as-icon">📊</span>
            <span className="as-label">Bảng điều khiển</span>
          </button>
          
          <button className="as-nav-item active">
            <span className="as-icon">📦</span>
            <span className="as-label">Đơn vận chuyển</span>
            <span className="as-badge-count">
              {requests.filter(r => {
                if (activeTypeTab === "unaccepted") return r.status === "new";
                if (activeTypeTab === "delivering") return r.status === "accepted" && r.detailedStatus !== "delivered";
                return r.status === "accepted" && r.detailedStatus === "delivered";
              }).length}
            </span>
          </button>

          <button className="as-nav-item" onClick={() => navigate("/profile/orders")}>
            <span className="as-icon">🕒</span>
            <span className="as-label">Lịch sử</span>
          </button>

          <button className="as-nav-item" onClick={() => showToast("Đang kết nối tổng đài điều phối hỗ trợ...", "info")}>
            <span className="as-icon">📞</span>
            <span className="as-label">Liên hệ</span>
          </button>
        </nav>

        <div className="as-sidebar-footer">
          <button className="as-btn-support" onClick={() => showToast("Đang tạo phiếu hỗ trợ kỹ thuật...", "success")}>
            <span className="plus-icon">+</span> Gửi hỗ trợ mới
          </button>
          <button className="as-btn-logout" onClick={handleLogout}>
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN LAYOUT */}
      <div className="as-main-container">
        
        {/* 2. HEADER */}
        <header className="as-header">
          <div className="as-header-left">
            <h1>Đơn vận chuyển</h1>
          </div>
          
          <div className="as-header-right">
            <div className="as-actions-icons">
              <button className="as-circle-btn" title="Tìm kiếm nhanh" onClick={() => showToast("Nhập từ khóa tại ô tìm kiếm bên dưới.", "info")}>
                <span className="icon">🔍</span>
              </button>
              <button className="as-circle-btn" title="Thông báo hệ thống" onClick={() => showToast("Không có thông báo điều phối mới.", "success")}>
                <span className="icon">🔔</span>
                <span className="dot"></span>
              </button>
              <button className="as-circle-btn" title="Trợ giúp / Hướng dẫn">
                <span className="icon">❓</span>
              </button>
            </div>
            
            <div className="as-user-badge" onClick={() => navigate("/profile")} title="Chuyển đến hồ sơ" style={{ cursor: "pointer" }}>
              <img src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"} alt="Avatar" className="as-avatar" />
              <div className="as-user-info">
                <span className="name">{currentUser?.fullName || "Tài xế"}</span>
                <span className="role">{currentUser?.role === "partner" || currentUser?.role === "shipper" ? "Đơn vị Vận chuyển" : currentUser?.role || "Tài xế đối tác"}</span>
              </div>
              <span className="arrow-right">→</span>
            </div>
          </div>
        </header>

        {/* 3. CONTENT AREA */}
        <main className="as-content-body">
          
          {/* KPI Cards Row */}
          <div className="as-kpi-row">
            <div className="as-kpi-card">
              <span className="title">ĐƠN CHỜ XÁC NHẬN</span>
              <div className="value-row">
                <span className="number">{requests.filter(r => r.status === "new").length}</span>
                <span className="badge success">Đơn mới nhận</span>
              </div>
            </div>

            <div className="as-kpi-card">
              <span className="title">ĐƠN ĐANG GIAO</span>
              <div className="value-row">
                <span className="number">{requests.filter(r => r.status === "accepted" && r.detailedStatus !== "delivered").length}</span>
                <span className="trend-arrow">↗</span>
              </div>
            </div>

            <div className="as-kpi-card highlight-success" style={{ borderLeft: "4px solid #4CAF50" }}>
              <span className="title" style={{ color: "#2E7D32" }}>ĐƠN ĐÃ HOÀN TẤT</span>
              <div className="value-row">
                <span className="number" style={{ color: "#2E7D32" }}>{requests.filter(r => r.status === "accepted" && r.detailedStatus === "delivered").length}</span>
                <span className="badge success" style={{ background: "#E8F5E9", color: "#2E7D32" }}>Giao thành công</span>
              </div>
            </div>
          </div>

          {/* Segmented Control Tabs for Types */}
          <div className="as-type-tabs">
            <button 
              className={`as-tab-btn ${activeTypeTab === "unaccepted" ? "active" : ""}`}
              onClick={() => {
                setActiveTypeTab("unaccepted");
                // Select first unaccepted request
                const unaccepted = requests.filter(r => r.status === "new");
                if (unaccepted.length > 0) {
                  setSelectedId(unaccepted[0].id);
                } else {
                  setSelectedId("");
                }
              }}
            >
              📥 Đơn chờ xác nhận
            </button>
            <button 
              className={`as-tab-btn ${activeTypeTab === "delivering" ? "active" : ""}`}
              onClick={() => {
                setActiveTypeTab("delivering");
                // Select first delivering request
                const delivering = requests.filter(r => r.status === "accepted" && r.detailedStatus !== "delivered");
                if (delivering.length > 0) {
                  setSelectedId(delivering[0].id);
                } else {
                  setSelectedId("");
                }
              }}
            >
              🚚 Đơn đang giao
            </button>
            <button 
              className={`as-tab-btn ${activeTypeTab === "completed" ? "active" : ""}`}
              onClick={() => {
                setActiveTypeTab("completed");
                // Select first completed request
                const completed = requests.filter(r => r.status === "accepted" && r.detailedStatus === "delivered");
                if (completed.length > 0) {
                  setSelectedId(completed[0].id);
                } else {
                  setSelectedId("");
                }
              }}
            >
              ✅ Đơn đã hoàn tất
            </button>
          </div>

          {/* Filter Bar Row */}
          <div className="as-filters-bar">
            <div className="as-search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Tìm kiếm theo mã đơn, khách hàng hoặc vị trí..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // Reset selection if current selected is filtered out
                  let filtered = [];
                  if (activeTypeTab === "unaccepted") {
                    filtered = requests.filter(r => r.status === "new" && r.id.toLowerCase().includes(e.target.value.toLowerCase()));
                  } else if (activeTypeTab === "delivering") {
                    filtered = requests.filter(r => r.status === "accepted" && r.detailedStatus !== "delivered" && r.id.toLowerCase().includes(e.target.value.toLowerCase()));
                  } else {
                    filtered = requests.filter(r => r.status === "accepted" && r.detailedStatus === "delivered" && r.id.toLowerCase().includes(e.target.value.toLowerCase()));
                  }
                  if (filtered.length > 0 && !filtered.some(f => f.id === selectedId)) {
                    setSelectedId(filtered[0].id);
                  }
                }}
              />
            </div>

            <div className="as-filter-chips">
              <button 
                className={`filter-chip ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                Tất cả đơn
              </button>
              <button 
                className={`filter-chip ${activeFilter === "sameday" ? "active" : ""}`}
                onClick={() => setActiveFilter("sameday")}
              >
                Giao trong ngày
              </button>
              <button 
                className={`filter-chip ${activeFilter === "standard" ? "active" : ""}`}
                onClick={() => setActiveFilter("standard")}
              >
                Giao tiêu chuẩn
              </button>
              <button 
                className={`filter-chip ${activeFilter === "scheduled" ? "active" : ""}`}
                onClick={() => setActiveFilter("scheduled")}
              >
                Đơn hẹn ngày
              </button>
            </div>
          </div>

          {/* Grid Layout: Left Column (Cards list) & Right Column (Details) */}
          <div className="as-dashboard-grid">
            
            {/* LEFT COLUMN: LIST CARDS */}
            <div className="as-list-column">
              {filteredRequests.length === 0 ? (
                <div className="empty-state-card">
                  <span className="empty-icon">🍃</span>
                  <h3>Không tìm thấy yêu cầu nào</h3>
                  <p>Tất cả yêu cầu vận chuyển mới đã được điều phối hoặc không khớp với bộ lọc hiện tại.</p>
                  <button className="btn-secondary" onClick={handleResetDemo}>Nạp lại dữ liệu mẫu</button>
                </div>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = req.id === selectedId;
                  return (
                    <div 
                      key={req.id} 
                      className={`as-request-card ${isSelected ? "selected" : ""} ${req.priority === "urgent" ? "border-urgent" : ""}`}
                      onClick={() => setSelectedId(req.id)}
                    >
                      <div className="card-header">
                        <div className="id-tag">
                          <span className="req-id">{req.id}</span>
                          <span className={`priority-badge ${req.priority}`}>
                            {req.priorityLabel}
                          </span>
                        </div>
                        <span className="timestamp">{req.timeAgo}</span>
                      </div>

                      <div className="card-locations">
                        <div className="loc-item">
                          <span className="loc-dot pickup-dot"></span>
                          <div className="loc-info">
                            <span className="loc-label">Lấy hàng</span>
                            <span className="loc-value">{req.pickup.location}</span>
                          </div>
                        </div>

                        <div className="loc-item">
                          <span className="loc-dot delivery-dot"></span>
                          <div className="loc-info">
                            <span className="loc-label">Giao hàng</span>
                            <span className="loc-value">{req.delivery.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="card-footer">
                        <div className="cargo-type">
                          <span className="cargo-icon">📦</span>
                          <span className="cargo-text">{req.itemSummaryText}</span>
                        </div>
                        <span className="distance-badge">{req.distance}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* RIGHT COLUMN: DETAIL VIEW */}
            <div className="as-details-column">
              {selectedRequest ? (
                <div className="as-details-card">
                  
                  {/* Detail Header */}
                  <div className="details-header-block">
                    <div className="title-left">
                      <h2>Chi tiết Yêu cầu</h2>
                      <p className="order-refs">ID: {selectedRequest.id} • Đơn hàng liên kết: {selectedRequest.orderId}</p>
                    </div>
                    <span className={`priority-badge large ${selectedRequest.priority}`}>
                      {selectedRequest.priorityLabel}
                    </span>
                  </div>




                  {/* Information Timeline */}
                  <div className="details-timeline">
                    <div className="timeline-segment">
                      <div className="timeline-node green-node">
                        <span className="node-icon">📍</span>
                      </div>
                      <div className="timeline-info-panel">
                        <span className="block-label">THÔNG TIN LẤY HÀNG</span>
                        <h4 className="location-title">{selectedRequest.pickup.location}</h4>
                        <div className="meta-text-row">
                          <p><strong>Người liên hệ:</strong> {selectedRequest.pickup.contact}</p>
                          <p><strong>Thời gian dự kiến lấy:</strong> {selectedRequest.pickup.time}</p>
                        </div>
                      </div>
                    </div>

                    <div className="timeline-segment">
                      <div className="timeline-node red-node">
                        <span className="node-icon">🏁</span>
                      </div>
                      <div className="timeline-info-panel">
                        <span className="block-label">ĐIỂM ĐẾN GIAO HÀNG</span>
                        <h4 className="location-title">{selectedRequest.delivery.location}</h4>
                        <div className="meta-text-row">
                          <p><strong>Liên hệ nhận hàng:</strong> {selectedRequest.delivery.contact}</p>
                          <p><strong>Hạn chót giao hàng:</strong> {selectedRequest.delivery.time}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cargo Summary styled like Bảng kê hàng hóa */}
                  <div className="details-cargo-summary ast-manifest-card" style={{ border: "none", padding: 0, boxShadow: "none" }}>
                    <h3 className="card-title">📋 Tóm tắt Hàng hóa</h3>
                    <div className="manifest-items-list">
                      {selectedRequest.cargoSummary.map((cargo, index) => (
                        <div className="manifest-item" key={index}>
                          {cargo.thumb ? (
                            <img src={cargo.thumb} alt={cargo.name} className="item-thumb" />
                          ) : (
                            <div className="fallback-thumb">📦</div>
                          )}
                          <div className="item-details">
                            <h4>{cargo.name}</h4>
                            <span className="qty">S.Lượng: {cargo.quantity} • Trọng lượng: {cargo.weight}</span>
                          </div>
                          {cargo.badge && (
                            <span className={cargo.badgeType === "cold" ? "badge-cold-item" : "badge-warning-item"}>
                              {cargo.badge}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special Instruction Temp Alert banner */}
                  <div className="details-instruction-alert">
                    <span className="alert-icon">ℹ️</span>
                    <p className="alert-text">{selectedRequest.tempControl}</p>
                  </div>

                  {/* Loại 2 additional sections: Driver and Timeline */}
                  {selectedRequest.status === "accepted" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "10px" }}>
                      
                      {/* Assigned Driver Box */}
                      <div className="ast-right-card driver-card" style={{ border: "1px solid #E2E8F0", padding: "20px", borderRadius: "12px" }}>
                        <h3 className="section-title" style={{ fontSize: "11px", color: "#A0AEC0", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px 0" }}>TÀI XẾ PHỤ TRÁCH</h3>
                        
                        <div className="driver-profile-row" style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
                          {selectedRequest.driverAvatar ? (
                            <img src={selectedRequest.driverAvatar} alt={selectedRequest.driverName || "Tài xế"} className="driver-avatar" style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #0A2F1D, #1B5E20)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "16px" }}>
                              {(selectedRequest.driverName || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="driver-meta">
                            <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: "700" }}>
                              {selectedRequest.driverName || "Chưa cập nhật"}
                            </h4>
                            <span className="driver-rating" style={{ fontSize: "12px", color: "#718096" }}>
                              {selectedRequest.driverCode ? `Mã: ${selectedRequest.driverCode}` : ""}
                              {selectedRequest.driverPhone ? ` • 📞 ${selectedRequest.driverPhone}` : ""}
                            </span>
                          </div>
                        </div>
                        
                        <div className="vehicle-info-box" style={{ background: "#F8F9FA", border: "1px solid #EDF2F7", borderRadius: "8px", padding: "10px 12px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                          <span className="truck-symbol" style={{ fontSize: "20px" }}>🚚</span>
                          <div className="vehicle-meta" style={{ display: "flex", flexDirection: "column" }}>
                            <span className="type" style={{ fontSize: "12px", color: "#718096" }}>
                              {selectedRequest.vehicleType || "Xe tải thường"}
                            </span>
                            <span className="plate font-semibold" style={{ fontSize: "13.5px", color: "#2D3748", fontWeight: "600" }}>
                              {selectedRequest.licensePlate ? `Biển kiểm soát: ${selectedRequest.licensePlate}` : "Chưa cập nhật biển số"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="driver-action-buttons" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <button className="btn-driver-call" type="button"
                            onClick={() => selectedRequest.driverPhone
                              ? showToast(`Đang kết nối cuộc gọi đến tài xế ${selectedRequest.driverName} (${selectedRequest.driverPhone})...`, "success")
                              : showToast("Chưa có số điện thoại tài xế.", "warning")
                            }>
                            📞 Gọi điện
                          </button>
                          <button className="btn-driver-msg" type="button" onClick={() => showToast("Đang mở hộp thoại nhắn tin với tài xế...", "success")}>
                            💬 Nhắn tin
                          </button>
                        </div>
                      </div>

                      {/* Tracking History Timeline */}
                      <div className="ast-timeline-card" style={{ border: "1px solid #E2E8F0", padding: "20px", borderRadius: "12px" }}>
                        <h3 className="card-title" style={{ fontSize: "14px", fontWeight: "700", margin: "0 0 16px 0" }}>📈 Lịch sử hành trình</h3>
                        {renderJourneyHistory(selectedRequest)}
                      </div>

                    </div>
                  )}

                  {/* Accept / Reject actions or Update Status */}
                  <div className="details-action-buttons">
                    {selectedRequest.status === "accepted" ? (
                      <button 
                        className="btn-accept" 
                        type="button"
                        style={{ width: "100%", justifyContent: "center" }}
                        onClick={() => navigate(`/shipper/update-status?orderCode=${selectedRequest.id}`)}
                      >
                        🔄 Cập nhật trạng thái
                      </button>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <button className="btn-reject" style={{ width: "100%" }} onClick={() => triggerAction("reject", selectedRequest.id)}>
                          Từ chối Yêu cầu
                        </button>
                        <button className="btn-accept" style={{ width: "100%" }} onClick={() => triggerAction("accept", selectedRequest.id)}>
                          ✓ Chấp nhận Vận chuyển
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="details-empty-state">
                  <div className="content">
                    <span className="icon">🚚</span>
                    <h3>Chọn một yêu cầu vận chuyển</h3>
                    <p>Nhấp vào thẻ yêu cầu ở cột bên trái để xem thông tin chi tiết, lộ trình giao hàng và xác nhận điều phối vận chuyển.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-box">
            <h3 className="modal-title">{confirmModal.title}</h3>
            <p className="modal-message">{confirmModal.message}</p>
            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setConfirmModal({ isOpen: false, title: "", message: "", actionType: "", requestId: "" })}
              >
                Hủy bỏ
              </button>
              <button 
                className={`btn-confirm ${confirmModal.actionType === "reject" ? "btn-danger" : "btn-success"}`}
                onClick={executeConfirmedAction}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRIVER INFO FORM MODAL */}
      {driverModal.isOpen && (
        <div className="confirm-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDriverModal({ isOpen: false, requestId: "" }); }}>
          <div className="driver-modal-box">
            {/* Modal Header */}
            <div className="driver-modal-header">
              <div className="driver-modal-header-left">
                <div className="driver-modal-icon">🚚</div>
                <div>
                  <h3 className="driver-modal-title">Điều phối Tài xế</h3>
                  <p className="driver-modal-subtitle">Điền thông tin tài xế phụ trách đơn <strong>{driverModal.requestId}</strong></p>
                </div>
              </div>
              <button className="driver-modal-close-btn" onClick={() => setDriverModal({ isOpen: false, requestId: "" })}>✕</button>
            </div>

            {/* Form Body */}
            <div className="driver-modal-body">
              {/* Row 1: Name + Code */}
              <div className="driver-form-row-2">
                <div className="driver-form-group">
                  <label className="driver-form-label">
                    <span className="driver-form-label-icon">👤</span> Họ và tên Tài xế <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className={`driver-form-input ${driverFormErrors.driverName ? "input-error" : ""}`}
                    placeholder="VD: Nguyễn Văn An"
                    value={driverForm.driverName}
                    onChange={(e) => { setDriverForm(f => ({ ...f, driverName: e.target.value })); setDriverFormErrors(err => ({ ...err, driverName: "" })); }}
                  />
                  {driverFormErrors.driverName && <span className="driver-form-error">{driverFormErrors.driverName}</span>}
                </div>

                <div className="driver-form-group">
                  <label className="driver-form-label">
                    <span className="driver-form-label-icon">🪪</span> Mã Tài xế <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className={`driver-form-input ${driverFormErrors.driverCode ? "input-error" : ""}`}
                    placeholder="VD: TX-4092"
                    value={driverForm.driverCode}
                    onChange={(e) => { setDriverForm(f => ({ ...f, driverCode: e.target.value })); setDriverFormErrors(err => ({ ...err, driverCode: "" })); }}
                  />
                  {driverFormErrors.driverCode && <span className="driver-form-error">{driverFormErrors.driverCode}</span>}
                </div>
              </div>

              {/* Row 2: Phone */}
              <div className="driver-form-group">
                <label className="driver-form-label">
                  <span className="driver-form-label-icon">📞</span> Số Điện thoại <span className="required-star">*</span>
                </label>
                <input
                  type="tel"
                  className={`driver-form-input ${driverFormErrors.driverPhone ? "input-error" : ""}`}
                  placeholder="VD: 0901234567"
                  value={driverForm.driverPhone}
                  onChange={(e) => { setDriverForm(f => ({ ...f, driverPhone: e.target.value.replace(/\D/g, "").slice(0, 10) })); setDriverFormErrors(err => ({ ...err, driverPhone: "" })); }}
                  maxLength={10}
                />
                {driverFormErrors.driverPhone && <span className="driver-form-error">{driverFormErrors.driverPhone}</span>}
              </div>

              {/* Row 3: Vehicle Type + License Plate */}
              <div className="driver-form-row-2">
                <div className="driver-form-group">
                  <label className="driver-form-label">
                    <span className="driver-form-label-icon">🚛</span> Loại Phương tiện
                  </label>
                  <select
                    className="driver-form-input driver-form-select"
                    value={driverForm.vehicleType}
                    onChange={(e) => setDriverForm(f => ({ ...f, vehicleType: e.target.value }))}
                  >
                    <option value="Xe tải thường">Xe tải thường</option>
                    <option value="Xe tải bảo ôn">Xe tải bảo ôn (lạnh)</option>
                    <option value="Xe van">Xe van / Minivan</option>
                    <option value="Xe máy">Xe máy</option>
                    <option value="Xe tải lớn">Xe tải lớn (&gt;5 tấn)</option>
                  </select>
                </div>

                <div className="driver-form-group">
                  <label className="driver-form-label">
                    <span className="driver-form-label-icon">🔢</span> Biển Kiểm soát <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className={`driver-form-input ${driverFormErrors.licensePlate ? "input-error" : ""}`}
                    placeholder="VD: 51C-123.45"
                    value={driverForm.licensePlate}
                    onChange={(e) => { setDriverForm(f => ({ ...f, licensePlate: e.target.value.toUpperCase() })); setDriverFormErrors(err => ({ ...err, licensePlate: "" })); }}
                  />
                  {driverFormErrors.licensePlate && <span className="driver-form-error">{driverFormErrors.licensePlate}</span>}
                </div>
              </div>

              {/* Info preview box */}
              {driverForm.driverName && (
                <div className="driver-preview-box">
                  <span className="driver-preview-icon">👤</span>
                  <div className="driver-preview-text">
                    <strong>{driverForm.driverName}</strong>
                    {driverForm.driverCode && <span> · Mã: {driverForm.driverCode}</span>}
                    {driverForm.vehicleType && <span> · {driverForm.vehicleType}</span>}
                    {driverForm.licensePlate && <span> · Biển số: {driverForm.licensePlate}</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="driver-modal-footer">
              <button className="btn-cancel" onClick={() => setDriverModal({ isOpen: false, requestId: "" })}>
                Hủy bỏ
              </button>
              <button className="btn-driver-submit" onClick={handleDriverFormSubmit}>
                ✓ Xác nhận &amp; Chấp nhận Vận chuyển
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className={`custom-toast ${toastType}`}>
          <span className="custom-toast-icon">
            {toastType === "success" && "✅"}
            {toastType === "warning" && "⚠️"}
            {toastType === "info" && "ℹ️"}
          </span>
          <span className="custom-toast-message">{toastMessage}</span>
          <button className="custom-toast-close" onClick={() => setToastMessage("")}>✕</button>
        </div>
      )}

    </div>
  );
};

export default ShipmentRequests;

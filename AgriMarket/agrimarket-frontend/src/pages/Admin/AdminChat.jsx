import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import supportRequestService from "../../services/supportRequestService";
import authService from "../../services/authService";
import "./AdminComplaints.css";
import "./AdminStyles.css";
import "./AdminChat.css";

export default function AdminChat() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Status form fields
  const [updatingStatus, setUpdatingStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Interactive states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFileName, setAttachedFileName] = useState('');

  const [currentUser, setCurrentUser] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const emojis = ['😀', '😂', '😍', '👍', '👏', '🎉', '❤️', '🙏', '🔥', '✨'];

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auth verification & initial fetch
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role?.toLowerCase() !== "admin") {
      navigate("/login");
      return;
    }
    setCurrentUser(user);
    fetchRequests();
  }, [navigate]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await supportRequestService.getAdminRequests();
      setRequests(data);
      
      if (data.length > 0) {
        if (requestId) {
          const req = data.find(r => r.id === parseInt(requestId));
          if (req) {
            setSelectedRequest(req);
            setUpdatingStatus(req.status);
            setAdminNotes(req.adminNotes || "");
          } else {
            setSelectedRequest(data[0]);
            setUpdatingStatus(data[0].status);
            setAdminNotes(data[0].adminNotes || "");
            navigate(`/admin/chat/${data[0].id}`, { replace: true });
          }
        } else {
          setSelectedRequest(data[0]);
          setUpdatingStatus(data[0].status);
          setAdminNotes(data[0].adminNotes || "");
          navigate(`/admin/chat/${data[0].id}`, { replace: true });
        }
      }
    } catch (error) {
      console.error("Failed to load requests:", error);
      showToast("❌ Lỗi khi tải danh sách yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  // Poll for messages when selectedRequest changes
  useEffect(() => {
    if (!selectedRequest) return;

    const fetchMessages = async () => {
      try {
        const data = await supportRequestService.getMessages(selectedRequest.id);
        setMessages(data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
    const intervalId = setInterval(fetchMessages, 3000);

    return () => clearInterval(intervalId);
  }, [selectedRequest]);

  // Send Admin message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedFileName) return;
    if (!selectedRequest || sending) return;

    let messageContent = inputText.trim();
    if (attachedFileName) {
      messageContent = `[Đính kèm: ${attachedFileName}] ${messageContent}`.trim();
    }

    setInputText("");
    setAttachedFileName("");
    setShowEmojiPicker(false);
    setSending(true);

    try {
      // Optimistic update
      const tempMessage = {
        id: Date.now(),
        supportRequestId: selectedRequest.id,
        senderId: currentUser?.id || 9999,
        senderName: currentUser?.fullName || "Admin",
        senderRole: "admin",
        content: messageContent,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempMessage]);

      await supportRequestService.sendMessage(selectedRequest.id, messageContent);
    } catch (error) {
      console.error("Failed to send message:", error);
      showToast("❌ Gửi tin nhắn thất bại.");
      const data = await supportRequestService.getMessages(selectedRequest.id);
      setMessages(data);
    } finally {
      setSending(false);
    }
  };

  // Trigger file attachment
  const handleTriggerFile = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFileName(file.name);
      showToast(`📎 Đính kèm tệp thành công: ${file.name}`);
    }
  };

  // Append emoji
  const handleEmojiClick = (emoji) => {
    setInputText(prev => prev + emoji);
  };

  // Update Status & Notes direct from Chat
  const handleUpdateTicketStatus = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      const updated = await supportRequestService.updateRequestStatus(
        selectedRequest.id,
        updatingStatus,
        adminNotes
      );
      
      setSelectedRequest(updated);
      setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
      showToast("✅ Đã cập nhật trạng thái phiếu hỗ trợ!");
    } catch (err) {
      console.error("Failed to update status from chat:", err);
      showToast("❌ Cập nhật trạng thái thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending": return "Chờ duyệt";
      case "assigned": return "Đã phân công";
      case "processing": return "Đang xử lý";
      case "resolved": return "Đã giải quyết";
      case "rejected": return "Từ chối";
      default: return status;
    }
  };

  // Helper for admin user avatar image
  const getFullImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
    return `${API_BASE_URL}/${cleanUrl}`;
  };

  // Filter requests
  const filteredRequests = requests.filter(req => 
    req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(req.id).includes(searchTerm)
  );

  // Render Admin Sidebar Nav (synchronized with AdminComplaints)
  const renderSidebarNav = () => (
    <aside className="admin-sidebar">
      <div className="admin-logo-section">
        <Link to="/" className="admin-logo-link">
          <h1>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="18" r="2"></circle>
              <circle cx="18" cy="18" r="2"></circle>
              <path d="M7 16h11v-2H9v-3h7V9H9V6H7v10z"></path>
              <path d="M16 9h3l2 3v4"></path>
            </svg>
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
        <button className="admin-nav-item active" onClick={() => navigate("/admin/complaints")}>
          <span className="admin-nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </span>
          Hỗ trợ
        </button>
        <button className="admin-nav-item" onClick={() => navigate("/admin/reports")}>
          <span className="admin-nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-nav-icon-svg"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          </span>
          Báo cáo
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
          <p className="admin-footer-email">{currentUser?.email || "admin@agrimarket.com"}</p>
        </div>
      </div>
    </aside>
  );

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      {renderSidebarNav()}

      {/* Main Container */}
      <div className="admin-main-container">
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange} 
        />

        {/* Header */}
        <header className="admin-header">
          <div className="admin-search-wrapper" style={{ visibility: "hidden" }}>
            <span className="admin-search-icon">🔍</span>
            <input type="text" className="admin-search-input" placeholder="Search..." disabled />
          </div>

          <div className="admin-header-actions">
            <button className="admin-notification-btn" aria-label="Notifications" onClick={() => showToast("Không có thông báo mới.")}>
              <span>🔔</span>
              <span className="admin-notification-dot"></span>
            </button>
            <div className="admin-profile-pill" style={{ display: "flex", alignItems: "center", gap: "8px", borderLeft: "1px solid var(--admin-border)", paddingLeft: "12px" }}>
              <span className="admin-avatar" style={{ width: "32px", height: "32px", backgroundColor: "var(--admin-primary)", color: "#fff", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : "A"}
              </span>
              <span style={{ fontSize: "14px", fontWeight: "600" }}>Admin Panel</span>
            </div>
          </div>
        </header>

        {/* Page Body: 3 Column Workspace */}
        <main className="admin-page-body admin-chat-page-body">
          <div className="admin-chat-workspace">
            {/* Column 1: Sidebar List */}
            <div className="admin-chat-sidebar">
              <div className="admin-sidebar-search">
                <input
                  type="text"
                  placeholder="Tìm theo Tên, Tiêu đề..."
                  className="admin-sidebar-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="admin-chat-list">
                {loading ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: "13px" }}>
                    Đang tải danh sách...
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: "13px" }}>
                    Không có yêu cầu nào
                  </div>
                ) : (
                  filteredRequests.map((req) => (
                    <div
                      key={req.id}
                      className={`admin-chat-item ${selectedRequest?.id === req.id ? "active" : ""}`}
                      onClick={() => {
                        setSelectedRequest(req);
                        setUpdatingStatus(req.status);
                        setAdminNotes(req.adminNotes || "");
                        navigate(`/admin/chat/${req.id}`);
                      }}
                    >
                      <div className="admin-chat-item-header">
                        <span className="admin-chat-item-name">{req.senderName || "Khách hàng"}</span>
                        <span className="admin-chat-item-time">{formatTime(req.createdAt)}</span>
                      </div>
                      <div className="admin-chat-item-title">{req.title}</div>
                      <div className="admin-chat-item-footer">
                        <span className="admin-chat-item-category">{req.category}</span>
                        <span className={`admin-chat-item-status ${req.status}`}>
                          {getStatusLabel(req.status)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 2: Chat View */}
            <div className="admin-chat-area">
              {selectedRequest ? (
                <>
                  <div className="admin-chat-area-header">
                    <div className="admin-chat-area-header-info">
                      <h3>{selectedRequest.title}</h3>
                      <div className="admin-chat-area-header-status">
                        <span className="admin-status-dot"></span>
                        <span>Trò chuyện trực tiếp với Khách hàng {selectedRequest.senderName}</span>
                      </div>
                    </div>
                    <Link to="/admin/complaints" style={{ fontSize: "13.5px", color: "var(--admin-primary)", textDecoration: "none", fontWeight: "600" }}>
                      &larr; Duyệt phiếu
                    </Link>
                  </div>

                  <div className="admin-chat-messages-container">
                    {/* Welcome System Message */}
                    <div className="admin-msg-bubble incoming">
                      <div className="admin-msg-avatar">SYS</div>
                      <div className="admin-msg-content-wrapper">
                        <div className="admin-msg-content" style={{ backgroundColor: "#e2e8f0" }}>
                          Hệ thống: Cuộc trò chuyện với khách hàng **"{selectedRequest.senderName}"** về yêu cầu hỗ trợ **"{selectedRequest.category}"** đã kết nối.
                        </div>
                        <span className="admin-msg-time">{formatTime(selectedRequest.createdAt)}</span>
                      </div>
                    </div>

                    {/* Messages */}
                    {messages.map((msg) => {
                      const isAdmin = msg.senderRole === "admin";
                      return (
                        <div key={msg.id} className={`admin-msg-bubble ${isAdmin ? "outgoing" : "incoming"}`}>
                          <div className="admin-msg-avatar">{isAdmin ? "AD" : "US"}</div>
                          <div className="admin-msg-content-wrapper">
                            <div className="admin-msg-content">{msg.content}</div>
                            <span className="admin-msg-time">{formatTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="admin-chat-input-bar-container">
                    {/* Attachment preview */}
                    {attachedFileName && (
                      <div style={{ padding: '4px 10px', backgroundColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', width: 'fit-content', gap: '8px' }}>
                        <span>📎 {attachedFileName}</span>
                        <button type="button" onClick={() => setAttachedFileName('')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#ef4444' }}>✕</button>
                      </div>
                    )}

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div style={{ display: 'flex', gap: '8px', padding: '8px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '8px', width: 'fit-content' }}>
                        {emojis.map(emoji => (
                          <button key={emoji} type="button" onClick={() => handleEmojiClick(emoji)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer' }}>
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    <form className="admin-chat-input-bar" onSubmit={handleSendMessage}>
                      <div style={{ display: 'flex', gap: '6px', marginRight: '6px' }}>
                        <button type="button" className="input-action-btn" onClick={handleTriggerFile} title="Thêm file" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="16"></line>
                            <line x1="8" y1="12" x2="16" y2="12"></line>
                          </svg>
                        </button>
                        <button type="button" className="input-action-btn" onClick={handleTriggerFile} title="Hình ảnh" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                        </button>
                        <button type="button" className="input-action-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Emoji" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                            <line x1="9" y1="9" x2="9.01" y2="9"></line>
                            <line x1="15" y1="9" x2="15.01" y2="9"></line>
                          </svg>
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Nhập phản hồi gửi khách hàng..."
                        className="admin-chat-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                      />
                      
                      <button type="submit" className="admin-chat-send-btn" disabled={(!inputText.trim() && !attachedFileName) || sending}>
                        <span>Gửi</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="admin-chat-empty-state">
                  <div className="admin-chat-empty-icon">💬</div>
                  <h3>Chưa chọn hội thoại</h3>
                  <p>Hãy chọn một cuộc hội thoại từ danh sách bên trái để phản hồi khách hàng.</p>
                </div>
              )}
            </div>

            {/* Column 3: Quick Update Ticket Info */}
            {selectedRequest && (
              <div className="admin-chat-details-panel">
                <div className="admin-details-card">
                  <h3>Chi tiết phiếu</h3>
                  <div className="admin-ticket-details-box">
                    <div className="admin-details-row">
                      <span className="admin-details-label">Mã phiếu</span>
                      <span className="admin-details-value ticket-code">#REQ-{selectedRequest.id}</span>
                    </div>

                    <div className="admin-details-row">
                      <span className="admin-details-label">Người gửi</span>
                      <span className="admin-details-value">{selectedRequest.senderName}</span>
                    </div>

                    <div className="admin-details-row">
                      <span className="admin-details-label">Email</span>
                      <span className="admin-details-value">{selectedRequest.senderEmail || "N/A"}</span>
                    </div>

                    <div className="admin-details-row">
                      <span className="admin-details-label">Danh mục</span>
                      <span className="admin-details-value">{selectedRequest.category}</span>
                    </div>

                    {selectedRequest.orderCode && (
                      <div className="admin-details-row">
                        <span className="admin-details-label">Đơn hàng liên quan</span>
                        <span className="admin-details-value">{selectedRequest.orderCode}</span>
                      </div>
                    )}


                  </div>
                </div>

                {/* Direct Ticket Actions Form */}
                <div className="admin-details-card">
                  <h3>Cập nhật phiếu hỗ trợ</h3>
                  <form className="admin-chat-action-form" onSubmit={handleUpdateTicketStatus}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label>Trạng thái:</label>
                      <select 
                        value={updatingStatus} 
                        onChange={(e) => setUpdatingStatus(e.target.value)}
                        disabled={selectedRequest.status === "resolved" || selectedRequest.status === "rejected"}
                      >
                        {selectedRequest.status === "pending" && (
                          <>
                            <option value="pending">Chờ duyệt</option>
                            <option value="processing">Đang xử lý</option>
                            <option value="resolved">Đã giải quyết</option>
                            <option value="rejected">Từ chối</option>
                          </>
                        )}
                        {selectedRequest.status === "processing" && (
                          <>
                            <option value="processing">Đang xử lý</option>
                            <option value="resolved">Đã giải quyết</option>
                            <option value="rejected">Từ chối</option>
                          </>
                        )}
                        {selectedRequest.status === "resolved" && (
                          <option value="resolved">Đã giải quyết</option>
                        )}
                        {selectedRequest.status === "rejected" && (
                          <option value="rejected">Từ chối</option>
                        )}
                      </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label>Ghi chú phản hồi:</label>
                      <textarea
                        rows={4}
                        placeholder="Nhập ghi chú hoặc lý do giải quyết..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        disabled={selectedRequest.status === "resolved" || selectedRequest.status === "rejected"}
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="admin-chat-action-btn" 
                      disabled={isSubmitting || selectedRequest.status === "resolved" || selectedRequest.status === "rejected"}
                      style={{ backgroundColor: (selectedRequest.status === "resolved" || selectedRequest.status === "rejected") ? "#cbd5e1" : undefined }}
                    >
                      {isSubmitting ? "Đang cập nhật..." : "Cập nhật phiếu"}
                    </button>

                    {(selectedRequest.status === "resolved" || selectedRequest.status === "rejected") && (
                      <div style={{ marginTop: "8px", padding: "8px", backgroundColor: "#f3f4f6", borderRadius: "6px", color: "#475569", fontSize: "12px", fontWeight: "600", textAlign: "center" }}>
                        🔒 Yêu cầu đã đóng. Không thể cập nhật.
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Toast alert */}
      {toastMessage && (
        <div className="admin-toast-container">
          <div className="admin-toast">
            <div className="toast-message-content"><span>✅</span> {toastMessage}</div>
            <button className="toast-close-btn" onClick={() => setToastMessage("")}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

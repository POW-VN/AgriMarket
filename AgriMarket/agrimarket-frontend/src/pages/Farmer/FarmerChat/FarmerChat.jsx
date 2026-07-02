import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Search, 
  ChevronDown, 
  X, 
  MoreVertical, 
  Info, 
  Image as ImageIcon, 
  Pin, 
  BellOff, 
  Trash2, 
  Ban, 
  Phone,
  Paperclip,
  Send
} from "lucide-react";
import "./FarmerChat.css";

export const FarmerChat = () => {
  const { farmerProfile, currentUser } = useOutletContext();
  const [allChats, setAllChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [inputText, setInputText] = useState("");
  
  // States Lọc tin nhắn (Shopee)
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'unread' | 'pinned'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // States cho Option Menu & Modals giống Khách hàng
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Refs cho scroll, file upload & options dropdown click outside
  const chatEndRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const optionsMenuRef = useRef(null);

  // ID Nông trại hiện tại (mặc định 4 cho Bùi Khắc Hưng)
  const farmId = farmerProfile?.id || 4;

  // 1. Tải danh sách chat từ LocalStorage và sync định kỳ
  useEffect(() => {
    const loadChats = () => {
      const saved = localStorage.getItem("agrimarket_chats");
      let chatsArray = [];
      
      if (saved) {
        chatsArray = JSON.parse(saved);
      }
      
      // Tìm cuộc trò chuyện của nông trại hiện tại
      const myFarmChat = chatsArray.find(c => String(c.id) === String(farmId));
      
      if (!myFarmChat) {
        // Tạo cuộc trò chuyện mẫu với khách hàng Bảo Hưng
        const initTimestamp = Date.now() - 3600000;
        const defaultChat = {
          id: farmId,
          name: "Khách hàng Bảo Hưng",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
          verified: true,
          phone: "0337222769",
          farmAddress: "Thành phố Đà Nẵng",
          activeState: "Đang hoạt động",
          isOnline: true,
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
          isBlocked: false,
          type: "normal",
          mediaImages: [
            "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600",
            "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600"
          ],
          messages: [
            {
              id: `m-sample-1`,
              sender: "user",
              type: "text",
              text: "Chào nhà vườn! Tôi muốn mua một ít rau cải bắp và cam sạch từ vườn của mình. Không biết bên vườn mình có sẵn hàng và giao trong ngày được không ạ?",
              time: new Date(initTimestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
              timestamp: initTimestamp
            },
            {
              id: `m-sample-2`,
              sender: "farmer",
              type: "text",
              text: "Dạ vườn chào bạn Bảo Hưng nhé! Các loại rau cải bắp và cam sành bên mình luôn được hái tươi mới mỗi sáng và có sẵn hàng giao ngay trong ngày ạ.",
              time: new Date(initTimestamp + 300000).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
              timestamp: initTimestamp + 300000
            }
          ]
        };
        
        chatsArray.push(defaultChat);
        localStorage.setItem("agrimarket_chats", JSON.stringify(chatsArray));
        setAllChats(chatsArray);
        setActiveChat(defaultChat);
      } else {
        // Ép tên/avatar đối phương thành góc nhìn Khách hàng Bảo Hưng đối với Nông dân
        const myFarmChatModified = {
          ...myFarmChat,
          name: "Khách hàng Bảo Hưng",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
        };
        
        setAllChats(chatsArray);
        
        // Cập nhật active chat hiện tại
        setActiveChat(prev => {
          if (!prev) return myFarmChatModified;
          const updatedActive = chatsArray.find(c => String(c.id) === String(prev.id));
          return updatedActive ? {
            ...updatedActive,
            name: "Khách hàng Bảo Hưng",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
          } : myFarmChatModified;
        });
      }
    };

    loadChats();
    const timer = setInterval(loadChats, 1000);
    return () => clearInterval(timer);
  }, [farmId]);

  // Click outside để đóng options dropdown menu
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target)) {
        setShowOptionsMenu(false);
      }
    };
    if (showOptionsMenu) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showOptionsMenu]);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChat?.messages]);

  // 2. Các hàm Options Menu đồng bộ LocalStorage
  const handleTogglePin = (chatId) => {
    const saved = JSON.parse(localStorage.getItem("agrimarket_chats")) || [];
    const updated = saved.map(c => {
      if (String(c.id) === String(chatId)) {
        return { ...c, isPinned: !c.isPinned };
      }
      return c;
    });
    localStorage.setItem("agrimarket_chats", JSON.stringify(updated));
    setShowOptionsMenu(false);
  };

  const handleToggleMute = (chatId) => {
    const saved = JSON.parse(localStorage.getItem("agrimarket_chats")) || [];
    const updated = saved.map(c => {
      if (String(c.id) === String(chatId)) {
        return { ...c, isMuted: !c.isMuted };
      }
      return c;
    });
    localStorage.setItem("agrimarket_chats", JSON.stringify(updated));
    setShowOptionsMenu(false);
  };

  const handleToggleBlock = (chatId) => {
    const saved = JSON.parse(localStorage.getItem("agrimarket_chats")) || [];
    const updated = saved.map(c => {
      if (String(c.id) === String(chatId)) {
        return { ...c, isBlocked: !c.isBlocked };
      }
      return c;
    });
    localStorage.setItem("agrimarket_chats", JSON.stringify(updated));
    setShowOptionsMenu(false);
  };

  const handleClearHistory = (chatId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện này không?")) {
      const saved = JSON.parse(localStorage.getItem("agrimarket_chats")) || [];
      const updated = saved.map(c => {
        if (String(c.id) === String(chatId)) {
          return { ...c, messages: [], mediaImages: [] };
        }
        return c;
      });
      localStorage.setItem("agrimarket_chats", JSON.stringify(updated));
      setShowOptionsMenu(false);
    }
  };

  // Gửi tin nhắn chữ
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const timestamp = Date.now();
    const newMsg = {
      id: `m-farmer-${timestamp}`,
      sender: "farmer",
      type: "text",
      text: inputText.trim(),
      time: new Date(timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      timestamp: timestamp
    };

    const saved = JSON.parse(localStorage.getItem("agrimarket_chats")) || [];
    const updated = saved.map(c => {
      if (String(c.id) === String(activeChat.id)) {
        return {
          ...c,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });

    localStorage.setItem("agrimarket_chats", JSON.stringify(updated));
    setInputText("");
    window.dispatchEvent(new CustomEvent("agrimarket_chat_updated"));
  };

  // Gửi ảnh thực tế
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result;
      const timestamp = Date.now();
      
      const newMsg = {
        id: `m-farmer-img-${timestamp}`,
        sender: "farmer",
        type: "image",
        text: base64Data,
        time: new Date(timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        timestamp: timestamp
      };

      const saved = JSON.parse(localStorage.getItem("agrimarket_chats")) || [];
      const updated = saved.map(c => {
        if (String(c.id) === String(activeChat.id)) {
          const currentMedia = c.mediaImages || [];
          return {
            ...c,
            mediaImages: [base64Data, ...currentMedia].slice(0, 8),
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      });

      localStorage.setItem("agrimarket_chats", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("agrimarket_chat_updated"));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Gửi file tài liệu thực tế
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;

    const timestamp = Date.now();
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    
    const newMsg = {
      id: `m-farmer-file-${timestamp}`,
      sender: "farmer",
      type: "file",
      text: file.name,
      fileSize: `${fileSizeMB} MB`,
      time: new Date(timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      timestamp: timestamp
    };

    const saved = JSON.parse(localStorage.getItem("agrimarket_chats")) || [];
    const updated = saved.map(c => {
      if (String(c.id) === String(activeChat.id)) {
        return {
          ...c,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });

    localStorage.setItem("agrimarket_chats", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("agrimarket_chat_updated"));
    e.target.value = "";
  };

  const getLatestMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0) return "Chưa có tin nhắn";
    const last = chat.messages[chat.messages.length - 1];
    if (last.type === "image") return "[Hình ảnh]";
    if (last.type === "file") return `[Tệp đính kèm] ${last.text}`;
    if (last.type === "location") return "[📍 Vị trí bản đồ]";
    if (last.type === "contact") return "[📇 Danh thiếp]";
    return last.text;
  };

  const getLatestMessageTime = (chat) => {
    if (!chat.messages || chat.messages.length === 0) return "";
    const last = chat.messages[chat.messages.length - 1];
    return last.time;
  };

  // Filter hội thoại dựa trên Search và Dropdown Shopee
  const filteredChats = allChats.filter(chat => {
    if (String(chat.id) !== String(farmId)) return false;
    
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some(m => m.text?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (activeTab === "unread") return chat.unreadCount > 0;
    if (activeTab === "pinned") return chat.isPinned;
    
    return true;
  });

  return (
    <div className="farmer-chat-container">
      <div className="farmer-chat-workspace">
        
        {/* CỘT TRÁI: DANH SÁCH KHÁCH HÀNG */}
        <aside className="fc-sidebar-left">
          {/* Shopee Filter & Search Row */}
          <div className="shopee-chat-filter-row text-center-shopee">
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
                  <X size={12} />
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
          
          <div className="fc-chat-list">
            {filteredChats.length > 0 ? (
              filteredChats.map(chat => {
                const isCurrentActive = activeChat && String(activeChat.id) === String(chat.id);
                const isPinned = chat.isPinned;
                return (
                  <div 
                    key={chat.id} 
                    className={`fc-chat-item ${isCurrentActive ? "active" : ""}`}
                    onClick={() => setActiveChat(chat)}
                  >
                    <div className="fc-item-avatar-wrapper">
                      <img src={chat.avatar} alt={chat.name} />
                      <span className="online-indicator"></span>
                    </div>
                    <div className="fc-item-info">
                      <div className="fc-item-header">
                        <h4 className="fc-item-name">
                          {chat.name}
                          {isPinned && <span style={{ marginLeft: "4px", fontSize: "10px" }}>📌</span>}
                        </h4>
                        <span className="fc-item-time">{getLatestMessageTime(chat)}</span>
                      </div>
                      <p className="fc-item-last-msg">{getLatestMessage(chat)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="fc-empty-list-text">Không tìm thấy khách hàng nào</p>
            )}
          </div>
        </aside>

        {/* CỘT PHẢI: KHUNG CHAT CHI TIẾT GIỐNG KHÁCH HÀNG */}
        <main className="fc-chat-detail">
          {activeChat ? (
            <>
              {/* Header màu xanh lá cây đậm giống khách hàng */}
              <header className="fc-detail-header zalo-chat-popup-header-green">
                <div className="fc-header-avatar-box">
                  <div className="zalo-avatar-wrapper">
                    <img src={activeChat.avatar} alt={activeChat.name} />
                  </div>
                  <div className="fc-header-status-text">
                    <div className="fc-header-title-wrapper-green">
                      <h3 className="fc-header-name">{activeChat.name}</h3>
                    </div>
                    <span className="fc-header-sub fc-active-status-green">
                      <span className="fc-status-dot-green">●</span> Đang hoạt động
                    </span>
                  </div>
                </div>
                
                {/* Header Actions kèm 3 chấm */}
                <div className="fc-header-actions" style={{ position: "relative" }}>
                  <a href={`tel:${activeChat.phone}`} className="fc-phone-action-btn" title="Gọi hotline khách hàng">
                    <Phone size={16} />
                  </a>
                  
                  <button 
                    type="button"
                    className={`fc-option-btn ${showOptionsMenu ? "fc-option-btn-active" : ""}`}
                    onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                    title="Tùy chọn"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {/* Dropdown Options Menu */}
                  {showOptionsMenu && (
                    <div className="zalo-options-dropdown" ref={optionsMenuRef} style={{ top: "35px", right: "0" }}>
                      <button className="zalo-dropdown-item" onClick={() => { setShowInfoModal(true); setShowOptionsMenu(false); }}>
                        <Info size={15} />
                        <span>Thông tin khách hàng</span>
                      </button>
                      <button className="zalo-dropdown-item" onClick={() => { setShowMediaModal(true); setShowOptionsMenu(false); }}>
                        <ImageIcon size={15} />
                        <span>Ảnh/Video đã gửi</span>
                      </button>
                      <button className="zalo-dropdown-item" onClick={() => handleTogglePin(activeChat.id)}>
                        <Pin size={15} />
                        <span>{activeChat.isPinned ? "Bỏ ghim trò chuyện" : "Ghim trò chuyện"}</span>
                      </button>
                      <button className="zalo-dropdown-item" onClick={() => handleToggleMute(activeChat.id)}>
                        <BellOff size={15} />
                        <span>{activeChat.isMuted ? "Bật thông báo" : "Tắt thông báo"}</span>
                      </button>
                      <button className="zalo-dropdown-item zalo-danger-item" onClick={() => handleClearHistory(activeChat.id)}>
                        <Trash2 size={15} />
                        <span>Xóa lịch sử trò chuyện</span>
                      </button>
                      <button className="zalo-dropdown-item zalo-danger-item" onClick={() => handleToggleBlock(activeChat.id)}>
                        <Ban size={15} />
                        <span>{activeChat.isBlocked ? "Bỏ chặn khách hàng" : "Chặn khách hàng"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </header>

              {/* Thân Khung Chat - Bong bóng tin nhắn */}
              <div className="fc-detail-body">
                {activeChat.messages && activeChat.messages.map((msg) => {
                  const isMe = msg.sender === "farmer";
                  
                  return (
                    <div key={msg.id} className={`fc-msg-row ${isMe ? "right" : "left"}`}>
                      {!isMe && (
                        <div className="fc-msg-avatar">
                          <img src={activeChat.avatar} alt="User Avatar" />
                        </div>
                      )}
                      
                      <div className="fc-msg-bubble-box">
                        <div className="fc-msg-bubble">
                          {msg.type === "text" && <p className="fc-msg-text">{msg.text}</p>}
                          
                          {msg.type === "image" && (
                            <img 
                              src={msg.text} 
                              alt="Gửi từ chat" 
                              className="fc-msg-image-content"
                              onClick={() => setLightboxImage(msg.text)}
                            />
                          )}
                          
                          {msg.type === "file" && (
                            <div className="fc-msg-file-card">
                              <span className="fc-file-icon">📄</span>
                              <div className="fc-file-meta">
                                <span className="fc-file-name" title={msg.text}>{msg.text}</span>
                                <span className="fc-file-size">{msg.fileSize || "0.5 MB"}</span>
                              </div>
                              <button 
                                className="fc-btn-download-file" 
                                onClick={() => {
                                  alert(`Đang chuẩn bị tải xuống tệp tin: ${msg.text}`);
                                }}
                              >
                                ⬇️
                              </button>
                            </div>
                          )}

                          {msg.type === "location" && (
                            <div className="fc-msg-location-card">
                              <div className="location-card-map-header">
                                <span className="map-badge-pin">📍</span>
                                <span className="map-location-title">Vị trí chia sẻ</span>
                              </div>
                              <div className="location-card-body-map">
                                <p className="location-card-address">{msg.text || "Ngũ Hành Sơn, Đà Nẵng, Việt Nam"}</p>
                                <div className="simulated-map-block-farmer">
                                  <div className="simulated-pin-farmer"></div>
                                </div>
                              </div>
                            </div>
                          )}

                          {msg.type === "contact" && (
                            <div className="fc-msg-contact-card">
                              <div className="contact-card-header">
                                <span className="contact-card-avatar-fallback">👤</span>
                                <div className="contact-card-title-box">
                                  <span className="contact-card-name">{msg.text || "Khách hàng mua nông sản"}</span>
                                  <span className="contact-card-sub">Khách hàng của hệ thống</span>
                                </div>
                              </div>
                              <div className="contact-card-footer-action">
                                <a href={`tel:${msg.phone || '0900000000'}`} className="btn-contact-action-call">📞 Gọi ngay</a>
                              </div>
                            </div>
                          )}
                        </div>
                        <span className="fc-msg-time">{msg.time}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chân Khung Chat - Công cụ & ô nhập */}
              <footer className="fc-detail-footer">
                <div className="fc-footer-toolbar">
                  <button 
                    type="button" 
                    className="fc-toolbar-icon-btn" 
                    title="Gửi hình ảnh"
                    onClick={() => imageInputRef.current.click()}
                  >
                    <ImageIcon size={20} />
                  </button>
                  <button 
                    type="button" 
                    className="fc-toolbar-icon-btn" 
                    title="Đính kèm tệp tin"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <Paperclip size={20} />
                  </button>
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={imageInputRef} 
                    style={{ display: "none" }} 
                    onChange={handleImageChange} 
                  />
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: "none" }} 
                    onChange={handleFileChange} 
                  />
                </div>

                <form className="fc-chat-input-form" onSubmit={handleSendMessage}>
                  <input 
                    type="text" 
                    placeholder="Nhập nội dung phản hồi khách hàng..." 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <button type="submit" disabled={!inputText.trim()} className="fc-send-btn" aria-label="Gửi phản hồi">
                    <Send size={18} />
                  </button>
                </form>
              </footer>
            </>
          ) : (
            <div className="fc-empty-viewport">
              <span className="fc-empty-icon">💬</span>
              <h3>Hộp thư tư vấn khách hàng</h3>
              <p>Chọn một khách hàng ở cột bên trái để bắt đầu hỗ trợ tư vấn và chốt đơn.</p>
            </div>
          )}
        </main>
      </div>

      {/* Lightbox Zoom Ảnh */}
      {lightboxImage && (
        <div className="fc-lightbox-backdrop" onClick={() => setLightboxImage(null)}>
          <div className="fc-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="fc-lightbox-close" onClick={() => setLightboxImage(null)}>&times;</button>
            <img src={lightboxImage} alt="Zoom Ảnh" />
          </div>
        </div>
      )}

      {/* Modal 1: Thông tin khách hàng */}
      {showInfoModal && activeChat && (
        <div className="zalo-modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="zalo-info-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="zalo-info-modal-header-container">
              <h3>Thông tin khách hàng</h3>
              <button className="zalo-modal-close-btn" onClick={() => setShowInfoModal(false)}>&times;</button>
            </div>
            
            <div className="zalo-info-modal-body">
              <div className="zalo-info-avatar-section">
                <img src={activeChat.avatar} alt={activeChat.name} />
                <h4>{activeChat.name}</h4>
                <span className="badge-member">Thành viên đồng hành</span>
              </div>
              
              <div className="zalo-info-details-list">
                <div className="zalo-info-row">
                  <span className="info-label">Số điện thoại:</span>
                  <span className="info-value text-primary">{activeChat.phone}</span>
                </div>
                <div className="zalo-info-row">
                  <span className="info-label">Địa chỉ giao hàng:</span>
                  <span className="info-value">{activeChat.farmAddress || "Thành phố Đà Nẵng"}</span>
                </div>
                <div className="zalo-info-row">
                  <span className="info-label">Ngày tham gia:</span>
                  <span className="info-value">30/06/2026</span>
                </div>
                <div className="zalo-info-row">
                  <span className="info-label">Lịch sử mua sắm:</span>
                  <span className="info-value text-success">3 đơn hàng thành công</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Kho Ảnh/Video đã gửi */}
      {showMediaModal && activeChat && (
        <div className="zalo-modal-overlay" onClick={() => setShowMediaModal(false)}>
          <div className="zalo-media-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="zalo-media-modal-header">
              <div className="zalo-media-header-left">
                <h3>Kho Ảnh/Video đã gửi</h3>
                <span>({activeChat.mediaImages?.length || 0} ảnh)</span>
              </div>
              <button className="zalo-modal-close-btn" onClick={() => setShowMediaModal(false)}>&times;</button>
            </div>
            
            <div className="zalo-media-modal-body">
              {activeChat.mediaImages && activeChat.mediaImages.length > 0 ? (
                <div className="zalo-media-grid">
                  {activeChat.mediaImages.map((imgSrc, index) => (
                    <div 
                      key={index} 
                      className="zalo-media-grid-item"
                      onClick={() => { setLightboxImage(imgSrc); setShowMediaModal(false); }}
                    >
                      <img src={imgSrc} alt={`Media gửi ${index}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="zalo-media-empty">
                  <span className="empty-icon">🖼️</span>
                  <p>Chưa có hình ảnh nào được gửi giữa hai bên.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FarmerChat;

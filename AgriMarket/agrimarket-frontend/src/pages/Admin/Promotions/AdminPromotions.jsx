import React, { useState, useEffect } from 'react';
import {
  Search, Download, Lock, Tag, Zap, Calendar, Clock, AlertTriangle,
  Eye, Edit2, MoreVertical, Filter, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  ArrowLeft, Bold, Italic, Underline, List, Link, Image as ImageIcon, Bell
} from 'lucide-react';
import AdminSidebar from '../../../components/common/Sidebar/AdminSidebar';
import '../AdminStyles.css';
import './AdminPromotions.css';

// Mock images
const tomatoImg = "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80";
const cucumberImg = "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=800&q=80";
const mangoImg = "https://images.unsplash.com/photo-1553279768-865429fd01a5?w=800&q=80";
const fruitImg = "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80";
const cherryImg = "https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=800&q=80";

const AdminPromotions = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'detail' | 'edit'
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", actionType: "", reason: "", feedback: "" });
  const [toastMessage, setToastMessage] = useState("");

  const defaultCampaigns = [
    {
      id: "KM-2024-001",
      code: "TOMATO15",
      name: "Giảm giá Cà chua hữu cơ",
      image: tomatoImg,
      farmerName: "Green Farm",
      farmerProductsCount: 128,
      type: "Giảm theo %",
      discountVal: "15%",
      discountMax: "Tối đa 50.000đ",
      minOrder: "50.000đ",
      usageLimit: "Không giới hạn",
      targetAudience: "Tất cả khách hàng",
      timeRange: "01/05/2024 - 31/05/2024",
      revenue: "12.400.000đ",
      redemptions: 214,
      orders: 56,
      conversionRate: "26.2%",
      status: "pending",
      statusLabel: "Chờ duyệt",
      desc: "Chương trình giảm giá đặc biệt cho sản phẩm cà chua hữu cơ từ các nông trại đối tác. Áp dụng cho đơn hàng online và tại cửa hàng."
    },
    {
      id: "KM-2024-002",
      code: "CUCUMBER10",
      name: "Ưu đãi dưa leo VietGAP",
      image: cucumberImg,
      farmerName: "Happy Farm",
      farmerProductsCount: 86,
      type: "Giảm theo %",
      discountVal: "10%",
      discountMax: "Tối đa 30.000đ",
      minOrder: "30.000đ",
      usageLimit: "Không giới hạn",
      targetAudience: "Tất cả khách hàng",
      timeRange: "05/05/2024 - 15/05/2024",
      revenue: "8.900.000đ",
      redemptions: 156,
      orders: 40,
      conversionRate: "20.1%",
      status: "pending",
      statusLabel: "Chờ duyệt",
      desc: "Ưu đãi đặc biệt cho dòng dưa leo VietGAP tươi sạch."
    }
  ];

  const [campaigns, setCampaignsState] = useState(() => {
    const saved = localStorage.getItem('mockPromotions');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('mockPromotions', JSON.stringify(defaultCampaigns));
    return defaultCampaigns;
  });

  const setCampaigns = (newCampaigns) => {
    setCampaignsState(prev => {
      const updated = typeof newCampaigns === 'function' ? newCampaigns(prev) : newCampaigns;
      localStorage.setItem('mockPromotions', JSON.stringify(updated));
      return updated;
    });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const triggerApprove = () => setConfirmModal({ isOpen: true, title: "Xác nhận phê duyệt", message: `Bạn có chắc chắn muốn phê duyệt chương trình "${selectedPromo?.name}"?`, actionType: "approve", reason: "", feedback: "" });
  const triggerReject = () => setConfirmModal({ isOpen: true, title: "Xác nhận từ chối", message: `Nhập lý do từ chối chương trình "${selectedPromo?.name}".`, actionType: "reject", reason: "", feedback: "" });
  const triggerRequestChanges = () => setConfirmModal({ isOpen: true, title: "Yêu cầu tạo lại", message: `Nhập nội dung yêu cầu tạo lại/sửa đổi cho chương trình "${selectedPromo?.name}".`, actionType: "request_changes", reason: "", feedback: "" });
  const triggerLock = () => setConfirmModal({ isOpen: true, title: "Xác nhận khóa chương trình", message: `Nhập lý do khóa chương trình "${selectedPromo?.name}". Chương trình sẽ bị dừng ngay lập tức.`, actionType: "lock", reason: "", feedback: "" });

  const executeAction = () => {
    const { actionType, reason, feedback } = confirmModal;

    if (actionType === "reject" && !reason.trim()) { showToast("⚠️ Cần nhập lý do từ chối."); return; }
    if (actionType === "lock" && !reason.trim()) { showToast("⚠️ Cần nhập lý do khóa chương trình."); return; }
    if (actionType === "request_changes" && !feedback.trim()) { showToast("⚠️ Cần nhập nội dung yêu cầu."); return; }

    setConfirmModal({ ...confirmModal, isOpen: false });

    const updatedStatus = actionType === "approve" ? "active" : actionType === "reject" ? "rejected" : actionType === "lock" ? "locked" : "request_changes";
    const updatedLabel = actionType === "approve" ? "Đang hoạt động" : actionType === "reject" ? "Đã từ chối" : actionType === "lock" ? "Đã khóa" : "Yêu cầu sửa đổi";

    const newPromo = { ...selectedPromo, status: updatedStatus, statusLabel: updatedLabel };
    setCampaigns(prev => prev.map(p => p.id === newPromo.id ? newPromo : p));
    setSelectedPromo(newPromo);

    const messages = {
      approve: "✅ Đã phê duyệt chương trình thành công.",
      reject: "✅ Đã từ chối chương trình.",
      lock: "✅ Đã khóa chương trình.",
      request_changes: "✅ Đã gửi yêu cầu tạo lại/sửa đổi."
    };
    showToast(messages[actionType]);
  };

  // Filtering logic for list view
  const filteredCampaigns = campaigns.filter(camp => {
    if (activeTab !== 'all' && camp.status !== activeTab) return false;
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      return camp.name.toLowerCase().includes(lowerTerm) ||
        camp.farmerName.toLowerCase().includes(lowerTerm) ||
        camp.id.toLowerCase().includes(lowerTerm);
    }
    return true;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedCampaigns(filteredCampaigns.map(c => c.id));
    else setSelectedCampaigns([]);
  };

  const handleSelectOne = (id) => {
    if (selectedCampaigns.includes(id)) {
      setSelectedCampaigns(selectedCampaigns.filter(cId => cId !== id));
    } else {
      setSelectedCampaigns([...selectedCampaigns, id]);
    }
  };

  const openDetail = (promo) => {
    setSelectedPromo(promo);
    setViewMode('detail');
  };

  const openEdit = (promo) => {
    setSelectedPromo(promo);
    setEditForm({ ...promo, rawDiscount: promo.discountVal.replace(/[^0-9K]/g, '') });
    setViewMode('edit');
  };

  const renderDetailView = () => {
    const promo = selectedPromo;
    return (
      <div className="ap-detail-view">
        <div className="details-breadcrumbs" style={{ marginBottom: "20px" }}>
          <span className="details-breadcrumb-link" onClick={() => setViewMode('list')} style={{ cursor: 'pointer', color: '#6b7280', fontSize: '13px' }}>
            Quản lý khuyến mãi
          </span>
          <span className="details-breadcrumb-separator" style={{ margin: '0 8px', color: '#9ca3af', fontSize: '13px' }}>&gt;</span>
          <span className="details-breadcrumb-current" style={{ fontWeight: '600', color: '#111827', fontSize: '13px' }}>
            Chi tiết chương trình #{promo.id}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", gap: "20px", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: "0 0 6px 0", fontSize: "24px", fontWeight: "800", color: "#111827", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              {promo.name}
              <span style={{ backgroundColor: "#ecfdf5", color: "#065f46", border: "1.5px solid #6ee7b7", borderRadius: "20px", padding: "2px 10px", fontSize: "12px", fontWeight: "700" }}>
                {promo.statusLabel}
              </span>
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
              Mã chương trình: <strong style={{ color: "#374151" }}>{promo.code}</strong>
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flexShrink: 0 }}>
            {promo.status === 'pending' && (
              <>
                <button className="btn-admin-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', background: '#064e3b', borderColor: '#064e3b', color: '#fff', boxShadow: '0 2px 8px rgba(6,78,59,0.25)' }} onClick={triggerApprove}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  Duyệt chương trình
                </button>
                <button className="btn-admin-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', borderColor: '#fca5a5', backgroundColor: '#fff5f5', color: '#dc2626' }} onClick={triggerReject}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /></svg>
                  Từ chối (Hủy)
                </button>
                <button className="btn-admin-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', borderColor: '#fcd34d', backgroundColor: '#fffbeb', color: '#92400e' }} onClick={triggerRequestChanges}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  Yêu cầu tạo lại
                </button>
              </>
            )}
            {(promo.status === 'active' || promo.status === 'upcoming') && (
              <button className="btn-admin-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', borderColor: '#fca5a5', backgroundColor: '#fff5f5', color: '#dc2626' }} onClick={triggerLock}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                Khóa chương trình
              </button>
            )}
            <button className="btn-admin-outline" onClick={() => setViewMode('list')}>
              <ArrowLeft size={16} style={{ marginRight: '6px' }} /> Quay lại danh sách
            </button>
          </div>
        </div>



        <div className="ap-detail-layout">
          <div className="ap-detail-left">
            {/* General Info */}
            <div className="ap-card">
              <h3 className="ap-card-title">Thông tin chung</h3>
              <div className="ap-info-grid">
                <div>
                  <div className="ap-info-item">
                    <div className="ap-info-label">Tên chương trình</div>
                    <div className="ap-info-value">{promo.name}</div>
                  </div>
                  <div className="ap-info-item">
                    <div className="ap-info-label">Mã chương trình</div>
                    <div className="ap-info-value">{promo.code}</div>
                  </div>
                  <div className="ap-info-item">
                    <div className="ap-info-label">Trạng thái</div>
                    <div className="ap-info-value" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                      {promo.statusLabel}
                    </div>
                  </div>
                  <div className="ap-info-item">
                    <div className="ap-info-label">Mô tả chương trình</div>
                    <div className="ap-desc-text">{promo.desc}</div>
                  </div>
                </div>
                <div>
                  <div className="ap-banner-preview">
                    <img src={promo.image} alt={promo.name} />
                    <div className="ap-banner-overlay">
                      <div className="badge">{promo.discountVal.includes('%') ? `GIẢM ${promo.discountVal}` : promo.discountVal}</div>
                      <h4 className="title">{promo.name.replace('Giảm giá ', '').replace('Ưu đãi ', '')}</h4>
                      <p className="subtitle">Áp dụng đến {promo.timeRange.split(' - ')[1]}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Range */}
            <div className="ap-card">
              <h3 className="ap-card-title">Thời gian diễn ra</h3>
              <div className="ap-time-row">
                <div className="ap-time-box">
                  <Calendar size={18} color="#6b7280" />
                  <div className="val">{promo.timeRange.split(' - ')[0]} 00:00</div>
                </div>
                <div className="ap-time-box">
                  <Calendar size={18} color="#6b7280" />
                  <div className="val">{promo.timeRange.split(' - ')[1]} 23:59</div>
                </div>
                <div className="ap-time-box" style={{ background: '#f9fafb' }}>
                  <Clock size={18} color="#6b7280" />
                  <div className="val" style={{ color: '#4b5563', fontSize: '13px' }}>(GMT+07:00) Asia/Ho Chi Minh</div>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="ap-card">
              <h3 className="ap-card-title">Hiệu suất chương trình</h3>
              <div className="ap-stats-row">
                <div className="ap-stat-item">
                  <div className="label">Doanh thu</div>
                  <div className="val">{promo.revenue}</div>
                  <div className="trend">↑ 18.5%</div>
                </div>
                <div className="ap-stat-item">
                  <div className="label">Lượt sử dụng</div>
                  <div className="val">{promo.redemptions}</div>
                  <div className="trend">↑ 12.3%</div>
                </div>
                <div className="ap-stat-item">
                  <div className="label">Đơn hàng</div>
                  <div className="val">{promo.orders}</div>
                  <div className="trend">↑ 8.7%</div>
                </div>
                <div className="ap-stat-item">
                  <div className="label">Tỷ lệ chuyển đổi</div>
                  <div className="val">{promo.conversionRate}</div>
                  <div className="trend">↑ 5.2%</div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '16px' }}>Dữ liệu cập nhật đến 31/05/2024 10:30</div>
            </div>

            {/* Channels */}
            <div className="ap-card">
              <h3 className="ap-card-title">Kênh phân phối</h3>
              <div className="ap-channel-row">
                <div className="ap-channel-name">
                  <div style={{ width: '32px', height: '32px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Link size={16} color="#4b5563" />
                  </div>
                  Website
                </div>
                <div className="ap-status-pill active" style={{ marginRight: 'auto', marginLeft: '12px' }}>Đang phân phối</div>
                <div className="ap-channel-link">https://agromarket.com</div>
                <div className="ap-channel-dates">
                  <div>Ngày bắt đầu: <strong>{promo.timeRange.split(' - ')[0]}</strong></div>
                  <div>Ngày kết thúc: <strong>{promo.timeRange.split(' - ')[1]}</strong></div>
                </div>
              </div>
              <div className="ap-channel-row">
                <div className="ap-channel-name">
                  <div style={{ width: '32px', height: '32px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Link size={16} color="#4b5563" />
                  </div>
                  Mobile App
                </div>
                <div className="ap-status-pill active" style={{ marginRight: 'auto', marginLeft: '12px' }}>Đang phân phối</div>
                <div className="ap-channel-link"></div>
                <div className="ap-channel-dates">
                  <div>Ngày bắt đầu: <strong>{promo.timeRange.split(' - ')[0]}</strong></div>
                  <div>Ngày kết thúc: <strong>{promo.timeRange.split(' - ')[1]}</strong></div>
                </div>
              </div>
            </div>

          </div>

          <div className="ap-detail-right">
            {/* Summary Box */}
            <div className="ap-card">
              <h3 className="ap-card-title">Tóm tắt chương trình</h3>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Loại chương trình</div>
                <div className="ap-summary-value">{promo.type}</div>
              </div>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Giá trị giảm</div>
                <div className="ap-summary-value" style={{ color: '#ef4444' }}>{promo.discountVal}</div>
              </div>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Sản phẩm áp dụng</div>
                <div className="ap-summary-value">1 sản phẩm</div>
              </div>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Đơn hàng tối thiểu</div>
                <div className="ap-summary-value">{promo.minOrder}</div>
              </div>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Số lần sử dụng</div>
                <div className="ap-summary-value">{promo.usageLimit}</div>
              </div>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Đối tượng áp dụng</div>
                <div className="ap-summary-value">{promo.targetAudience}</div>
              </div>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Kênh phân phối</div>
                <div className="ap-summary-value" style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Website</span>
                  <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Mobile App</span>
                </div>
              </div>
            </div>

            {/* Other Info */}
            <div className="ap-card">
              <h3 className="ap-card-title">Thông tin khác</h3>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Ưu tiên hiển thị</div>
                <div className="ap-summary-value">1</div>
              </div>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Ngày tạo</div>
                <div className="ap-summary-value">25/04/2024 14:30</div>
              </div>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Người tạo</div>
                <div className="ap-summary-value">Admin User</div>
              </div>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Cập nhật lần cuối</div>
                <div className="ap-summary-value">30/04/2024 09:15</div>
              </div>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Người cập nhật</div>
                <div className="ap-summary-value">Admin User</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEditView = () => {
    const promo = editForm || selectedPromo;
    return (
      <div className="ap-edit-view">
        <div className="details-breadcrumbs" style={{ marginBottom: "20px" }}>
          <span className="details-breadcrumb-link" onClick={() => setViewMode('list')} style={{ cursor: 'pointer', color: '#6b7280', fontSize: '13px' }}>
            Quản lý khuyến mãi
          </span>
          <span className="details-breadcrumb-separator" style={{ margin: '0 8px', color: '#9ca3af', fontSize: '13px' }}>&gt;</span>
          <span className="details-breadcrumb-current" style={{ fontWeight: '600', color: '#111827', fontSize: '13px' }}>
            Chỉnh sửa chương trình #{promo.id}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", gap: "20px", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: "0 0 6px 0", fontSize: "24px", fontWeight: "800", color: "#111827", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              Chỉnh sửa: {promo.name}
              <span style={{ backgroundColor: "#ecfdf5", color: "#065f46", border: "1.5px solid #6ee7b7", borderRadius: "20px", padding: "2px 10px", fontSize: "12px", fontWeight: "700" }}>
                {promo.statusLabel}
              </span>
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
              Mã chương trình: <strong style={{ color: "#374151" }}>{promo.code}</strong>
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flexShrink: 0 }}>
            <button className="btn-admin-outline" onClick={() => setViewMode('detail')}>
              <Eye size={16} style={{ marginRight: '6px' }} /> Xem trước
            </button>
            <button className="btn-admin-outline" onClick={() => setViewMode('list')}>Hủy</button>
            <button className="btn-admin-primary" onClick={() => setViewMode('detail')}>
              <Download size={16} style={{ transform: 'rotate(180deg)', marginRight: '6px' }} /> Lưu thay đổi
            </button>
          </div>
        </div>



        <div className="ap-detail-layout">
          <div className="ap-detail-left">
            <div className="ap-card">
              <h3 className="ap-card-title">Thông tin chung</h3>
              <div className="ap-info-grid">
                <div>
                  <div className="ap-form-group">
                    <label>Tên chương trình <span className="req">*</span></label>
                    <input type="text" className="ap-input" value={promo.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  </div>
                  <div className="ap-form-group">
                    <label>Mô tả chương trình</label>
                    <div className="ap-rich-editor">
                      <div className="ap-editor-toolbar">
                        <button className="ap-editor-btn"><Bold size={14} /></button>
                        <button className="ap-editor-btn"><Italic size={14} /></button>
                        <button className="ap-editor-btn"><Underline size={14} /></button>
                        <button className="ap-editor-btn"><List size={14} /></button>
                        <button className="ap-editor-btn"><Link size={14} /></button>
                      </div>
                      <div className="ap-editor-content" contentEditable suppressContentEditableWarning>
                        {promo.desc}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="ap-form-group">
                    <label>Trạng thái</label>
                    <select className="ap-input" value={promo.status} onChange={(e) => {
                      const status = e.target.value;
                      let label = 'Đang hoạt động';
                      if (status === 'upcoming') label = 'Sắp diễn ra';
                      if (status === 'ended') label = 'Đã kết thúc';
                      setEditForm({ ...editForm, status: status, statusLabel: label });
                    }}>
                      <option value="active">● Đang hoạt động</option>
                      <option value="upcoming">● Sắp diễn ra</option>
                      <option value="ended">● Đã kết thúc</option>
                    </select>
                  </div>
                  <div className="ap-form-group">
                    <label>Mã chương trình</label>
                    <input type="text" className="ap-input" value={promo.code} onChange={(e) => setEditForm({ ...editForm, code: e.target.value })} />
                    <div className="ap-help-text">Mã này sẽ được khách hàng sử dụng để nhận ưu đãi</div>
                  </div>
                  <div className="ap-form-group">
                    <label>Loại chương trình</label>
                    <select className="ap-input" value={promo.type === 'Giảm theo %' ? 'percent' : 'amount'} onChange={(e) => {
                      const isPercent = e.target.value === 'percent';
                      setEditForm({ ...editForm, type: isPercent ? 'Giảm theo %' : 'Giảm tiền mặt', discountVal: isPercent ? (editForm.rawDiscount || '') + '%' : (editForm.rawDiscount || '') + 'đ' });
                    }}>
                      <option value="percent">Giảm giá theo %</option>
                      <option value="amount">Giảm tiền mặt</option>
                    </select>
                  </div>
                  <div className="ap-form-group">
                    <label>Giá trị giảm <span className="req">*</span></label>
                    <input type="text" className="ap-input" value={promo.rawDiscount || ''} onChange={(e) => {
                      const raw = e.target.value;
                      const isPercent = promo.type === 'Giảm theo %';
                      setEditForm({ ...editForm, rawDiscount: raw, discountVal: isPercent ? raw + '%' : raw + 'đ' });
                    }} />
                    <div className="ap-help-text">Nhập số phần trăm (VD: 15) hoặc số tiền (VD: 50K)</div>
                  </div>
                  <div className="ap-form-group">
                    <label>Ưu tiên hiển thị</label>
                    <input type="number" className="ap-input" defaultValue="1" />
                    <div className="ap-help-text">Số càng nhỏ hiển thị càng ưu tiên</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ap-card">
              <h3 className="ap-card-title">Thời gian diễn ra</h3>
              <div className="ap-info-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="ap-form-group">
                  <label>Ngày bắt đầu <span className="req">*</span></label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="ap-input" style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'text' }}>
                      <Calendar size={14} color="#6b7280" /> {promo.timeRange.split(' - ')[0]}
                    </div>
                    <input type="text" className="ap-input" style={{ flex: 1, textAlign: 'center' }} defaultValue="00:00" />
                  </div>
                </div>
                <div className="ap-form-group">
                  <label>Ngày kết thúc <span className="req">*</span></label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="ap-input" style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'text' }}>
                      <Calendar size={14} color="#6b7280" /> {promo.timeRange.split(' - ')[1]}
                    </div>
                    <input type="text" className="ap-input" style={{ flex: 1, textAlign: 'center' }} defaultValue="23:59" />
                  </div>
                </div>
                <div className="ap-form-group">
                  <label>Múi giờ</label>
                  <div className="ap-input" style={{ background: '#f9fafb', color: '#6b7280' }}>
                    (GMT+07:00) Asia/Ho Chi Minh
                  </div>
                </div>
              </div>
            </div>

            <div className="ap-card">
              <h3 className="ap-card-title">Hình ảnh & Banner</h3>
              <div className="ap-info-grid">
                <div className="ap-form-group">
                  <label>Hình ảnh đại diện <span className="req">*</span></label>
                  <div className="ap-upload-area">
                    <img src={promo.image} alt="Thumb" className="ap-upload-img" style={{ width: '80px', height: '80px' }} />
                    <div className="ap-upload-actions">
                      <button className="ap-btn-upload">+ Thay đổi ảnh</button>
                      <button className="ap-btn-text-danger">Xóa ảnh</button>
                    </div>
                  </div>
                  <div className="ap-help-text">Kích thước đề xuất: 800x800px, dung lượng tối đa 2MB</div>
                </div>
                <div className="ap-form-group">
                  <label>Banner (tùy chọn)</label>
                  <div className="ap-upload-area">
                    <img src={promo.image} alt="Banner" className="ap-upload-img" />
                    <div className="ap-upload-actions">
                      <button className="ap-btn-upload"><Edit2 size={12} style={{ marginRight: '4px' }} /> Thay đổi banner</button>
                      <button className="ap-btn-text-danger">Xóa banner</button>
                    </div>
                  </div>
                  <div className="ap-help-text">Kích thước đề xuất: 1200x300px, dung lượng tối đa 2MB</div>
                </div>
              </div>
            </div>
          </div>

          <div className="ap-detail-right">
            <div className="ap-card" style={{ padding: 0 }}>
              <h3 className="ap-card-title" style={{ padding: '20px 20px 0 20px' }}>Xem trước chương trình</h3>
              <div style={{ padding: '0 20px 20px 20px' }}>
                <div className="ap-preview-card-wrap">
                  <div className="ap-preview-img-area">
                    <img src={promo.image} alt="Preview" />
                    <div className="ap-preview-badge">GIẢM {promo.discountVal.replace(/\D/g, '')}%</div>
                  </div>
                  <div className="ap-preview-content">
                    <h4 className="ap-preview-title">{promo.name.replace('Giảm giá ', '').replace('Ưu đãi ', '')}</h4>
                    <p className="ap-preview-subtitle">Áp dụng đến {promo.timeRange.split(' - ')[1]}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="ap-card">
              <h3 className="ap-card-title">Tóm tắt chương trình</h3>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Loại ưu đãi</div>
                <div className="ap-summary-value">{promo.type}</div>
              </div>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Trạng thái</div>
                <div className="ap-summary-value" style={{ color: promo.status === 'active' ? '#10b981' : promo.status === 'upcoming' ? '#d97706' : '#6b7280' }}>
                  {promo.statusLabel}
                </div>
              </div>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Giá trị giảm</div>
                <div className="ap-summary-value" style={{ color: '#ef4444' }}>{promo.discountVal}</div>
              </div>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Sản phẩm áp dụng</div>
                <div className="ap-summary-value">1 sản phẩm</div>
              </div>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Đơn hàng tối thiểu</div>
                <div className="ap-summary-value">{promo.minOrder}</div>
              </div>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Số lần sử dụng</div>
                <div className="ap-summary-value">{promo.usageLimit}</div>
              </div>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Đối tượng áp dụng</div>
                <div className="ap-summary-value">{promo.targetAudience}</div>
              </div>
              <div className="ap-summary-row">
                <div className="ap-summary-label">Kênh phân phối</div>
                <div className="ap-summary-value" style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Website</span>
                  <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Mobile App</span>
                </div>
              </div>
            </div>

            <div className="ap-card">
              <h3 className="ap-card-title">Hiệu suất chương trình</h3>
              <div className="ap-stats-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="ap-stat-item" style={{ borderRight: 'none', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div className="label">Doanh thu</div>
                  <div className="val" style={{ fontSize: '16px' }}>{promo.revenue}</div>
                  <div className="trend">↑ 18.5%</div>
                </div>
                <div className="ap-stat-item" style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div className="label">Lượt sử dụng</div>
                  <div className="val" style={{ fontSize: '16px' }}>{promo.redemptions}</div>
                  <div className="trend">↑ 12.3%</div>
                </div>
                <div className="ap-stat-item" style={{ borderRight: 'none' }}>
                  <div className="label">Đơn hàng</div>
                  <div className="val" style={{ fontSize: '16px' }}>{promo.orders}</div>
                  <div className="trend">↑ 8.7%</div>
                </div>
                <div className="ap-stat-item">
                  <div className="label">Tỷ lệ chuyển đổi</div>
                  <div className="val" style={{ fontSize: '16px' }}>{promo.conversionRate}</div>
                  <div className="trend">↑ 5.2%</div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '16px' }}>Dữ liệu cập nhật đến 31/05/2024 10:30</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderListView = () => {
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);

    return (
      <>
        {/* Header */}
        <div className="admin-page-title-row">
          <div className="admin-page-title-info">
            <h2>Quản lý khuyến mãi</h2>
            <p>Quản lý tất cả chương trình khuyến mãi trên toàn hệ thống.</p>
          </div>
          <div className="admin-page-actions">
            {selectedCampaigns.length >= 2 && (
              <button
                className="btn-admin-primary"
                style={{ marginRight: "10px", padding: "10px 20px" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Duyệt nhanh ({selectedCampaigns.length})
              </button>
            )}
            <button className="btn-admin-outline" style={{ marginRight: '10px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Xuất dữ liệu
            </button>
            <button className="btn-admin-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
              <Lock size={16} style={{ marginRight: '6px' }} /> Khóa chương trình
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="ap-analytics-grid">
          <div className="ap-stat-card">
            <div className="ap-stat-icon-wrapper green">
              <Tag size={20} />
            </div>
            <div className="ap-stat-label">Tổng chương trình</div>
            <h2 className="ap-stat-value">154</h2>
            <div className="ap-stat-trend positive">↑ 18% so với tháng trước</div>
          </div>
          <div className="ap-stat-card">
            <div className="ap-stat-icon-wrapper green">
              <Zap size={20} />
            </div>
            <div className="ap-stat-label">Đang hoạt động</div>
            <h2 className="ap-stat-value">38</h2>
            <div className="ap-stat-trend positive">↑ 24.7% so với tháng trước</div>
          </div>
          <div className="ap-stat-card">
            <div className="ap-stat-icon-wrapper blue">
              <Calendar size={20} />
            </div>
            <div className="ap-stat-label">Sắp diễn ra</div>
            <h2 className="ap-stat-value">27</h2>
            <div className="ap-stat-trend positive">↑ 17.5% so với tháng trước</div>
          </div>
          <div className="ap-stat-card">
            <div className="ap-stat-icon-wrapper purple">
              <Clock size={20} />
            </div>
            <div className="ap-stat-label">Đã kết thúc</div>
            <h2 className="ap-stat-value">85</h2>
            <div className="ap-stat-trend positive">↑ 55.2% so với tháng trước</div>
          </div>
          <div className="ap-stat-card">
            <div className="ap-stat-icon-wrapper orange">
              <AlertTriangle size={20} />
            </div>
            <div className="ap-stat-label">Vi phạm</div>
            <h2 className="ap-stat-value" style={{ color: '#f97316' }}>4</h2>
            <div className="ap-stat-trend negative" style={{ color: '#f97316' }}>Cần xử lý</div>
          </div>
          <div className="ap-stat-card">
            <div className="ap-stat-icon-wrapper red">
              <Lock size={20} />
            </div>
            <div className="ap-stat-label">Đã khóa</div>
            <h2 className="ap-stat-value" style={{ color: '#ef4444' }}>9</h2>
            <div className="ap-stat-trend negative" style={{ color: '#ef4444' }}>Bị khóa</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs-row" style={{ marginTop: '24px' }}>
          {[{ id: 'all', label: 'Tất cả' }, { id: 'pending', label: 'Chờ duyệt' }, { id: 'active', label: 'Đang hoạt động' }, { id: 'upcoming', label: 'Sắp diễn ra' }, { id: 'ended', label: 'Đã kết thúc' }, { id: 'violation', label: 'Vi phạm' }, { id: 'locked', label: 'Đã khóa' }].map(tab => (
            <button key={tab.id} className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="admin-filters-bar" style={{ marginTop: '20px' }}>
          <div className="filter-search-wrapper">
            <span className="filter-search-icon" style={{ display: "inline-flex", alignItems: "center" }}><Search size={16} /></span>
            <input
              type="text"
              placeholder="Tìm theo tên chương trình, nông dân..."
              className="filter-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-selects">
            <div className="filter-select-wrapper">
              <label>Trạng thái</label>
              <select className="filter-select">
                <option>Tất cả trạng thái</option>
                <option>Đang hoạt động</option>
                <option>Sắp diễn ra</option>
                <option>Đã kết thúc</option>
              </select>
            </div>
            <div className="filter-select-wrapper">
              <label>Loại giảm giá</label>
              <select className="filter-select">
                <option>Tất cả loại</option>
                <option>Giảm theo %</option>
                <option>Flash Sale</option>
                <option>Freeship</option>
              </select>
            </div>
            <div className="filter-select-wrapper">
              <label>Thời gian</label>
              <div className="filter-select" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <span style={{ flex: 1 }}>01/05 - 31/05/2024</span>
                <CalendarIcon size={14} color="#6b7280" />
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    className="ap-checkbox"
                    checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Chương trình</th>
                <th>Nông dân</th>
                <th>Loại giảm giá</th>
                <th>Giá trị giảm</th>
                <th>Thời gian</th>
                <th>Doanh thu</th>
                <th>Lượt dùng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map(camp => (
                <tr key={camp.id}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      className="ap-checkbox"
                      checked={selectedCampaigns.includes(camp.id)}
                      onChange={() => handleSelectOne(camp.id)}
                    />
                  </td>
                  <td>
                    <div className="ap-cell-campaign">
                      <img src={camp.image} alt={camp.name} className="ap-camp-img" />
                      <div className="ap-camp-info">
                        <span className="ap-camp-title">{camp.name}</span>
                        <span className="ap-camp-id">ID: {camp.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="ap-cell-farmer">
                      <span className="ap-farmer-name">{camp.farmerName}</span>
                      <span className="ap-farmer-products">{camp.farmerProductsCount} sản phẩm</span>
                    </div>
                  </td>
                  <td>{camp.type}</td>
                  <td>
                    <div className="ap-cell-discount">
                      <span className="ap-discount-val">{camp.discountVal}</span>
                      <span className="ap-discount-max">{camp.discountMax}</span>
                    </div>
                  </td>
                  <td>
                    <div className="ap-cell-time">
                      {camp.timeRange.split(' - ').map((t, i) => (
                        <div key={i}>{i === 0 ? t : `- ${t}`}</div>
                      ))}
                    </div>
                  </td>
                  <td className="ap-cell-revenue">{camp.revenue}</td>
                  <td>{camp.redemptions}</td>
                  <td>
                    <span className={`ap-status-pill ${camp.status}`}>
                      {camp.statusLabel}
                    </span>
                  </td>
                  <td>
                    <div className="ap-actions-cell">
                      <button className="ap-action-icon" title="Xem chi tiết / Duyệt" onClick={() => openDetail(camp)}><Eye size={18} /></button>
                      <button className="ap-action-icon" title="Thêm"><MoreVertical size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCampaigns.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                    Không tìm thấy chương trình nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="admin-pagination-row">
            <div className="admin-pagination-info">
              Hiển thị 1 đến {filteredCampaigns.length} trong tổng số {filteredCampaigns.length} chương trình
            </div>
            <div className="admin-pagination-controls">
              <button className="btn-pagination-nav" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
              </button>

              {/* Dynamic Pages */}
              {totalPages > 0 ? [...Array(totalPages).keys()].map(p => (
                <button key={p + 1} className={`btn-pagination-page ${p === 0 ? 'active' : ''}`}>{p + 1}</button>
              )) : (
                <button className="btn-pagination-page active">1</button>
              )}

              <button className="btn-pagination-nav" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="admin-layout">
      <AdminSidebar activeItem="promotions" />
      <div className="admin-main-container">
        <header className="admin-header">
          <div className="admin-search-wrapper">
            <span className="admin-search-icon" style={{ display: "inline-flex", alignItems: "center" }}><Search size={16} /></span>
            <input type="text" placeholder="Tìm kiếm chương trình, sản phẩm..." className="admin-search-input" />
          </div>
          <div className="admin-header-actions">
            <button className="admin-notification-btn" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={18} />
              <span className="admin-notification-dot"></span>
            </button>
            <button className="btn-quick-action">
              + Thao tác nhanh
            </button>
          </div>
        </header>

        <main className="admin-page-body">
          <div className="admin-promotions-container">
            {viewMode === 'detail' && renderDetailView()}
            {viewMode === 'edit' && renderEditView()}
            {viewMode === 'list' && renderListView()}
          </div>
        </main>
      </div>

      {/* ── Modal & Toast ── */}
      {confirmModal.isOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", width: "450px", maxWidth: "90%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "18px", fontWeight: "700", color: "#111827" }}>{confirmModal.title}</h3>
            <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "#4b5563", lineHeight: "1.5" }}>{confirmModal.message}</p>

            {(confirmModal.actionType === "reject" || confirmModal.actionType === "lock") && (
              <textarea
                placeholder="Nhập lý do (bắt buộc)..."
                value={confirmModal.reason}
                onChange={(e) => setConfirmModal({ ...confirmModal, reason: e.target.value })}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", marginBottom: "20px", fontSize: "14px", minHeight: "80px", resize: "vertical", boxSizing: 'border-box' }}
              />
            )}

            {confirmModal.actionType === "request_changes" && (
              <textarea
                placeholder="Nhập nội dung yêu cầu tạo lại/sửa đổi (bắt buộc)..."
                value={confirmModal.feedback}
                onChange={(e) => setConfirmModal({ ...confirmModal, feedback: e.target.value })}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", marginBottom: "20px", fontSize: "14px", minHeight: "80px", resize: "vertical", boxSizing: 'border-box' }}
              />
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", color: "#374151", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>Hủy</button>
              <button onClick={executeAction} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: (confirmModal.actionType === "reject" || confirmModal.actionType === "lock") ? "#dc2626" : confirmModal.actionType === "request_changes" ? "#d97706" : "#064e3b", color: "#fff", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", backgroundColor: "#1f2937", color: "#fff", padding: "12px 20px", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", zIndex: 1100, fontSize: "14px", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px", animation: "slideInRight 0.3s ease-out" }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;

import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, ChevronDown, Download, Check, Edit2, Copy, X, Bell,
  PlayCircle, Clock, CheckCircle2, DollarSign, ShoppingBag, PiggyBank, Timer,
  Heart, User, Star, ShoppingCart, AlertTriangle, Percent, Truck, CalendarIcon
} from 'lucide-react';
import './FarmerPromotions.css';
import { useNavigate } from 'react-router-dom';

const FarmerPromotions = () => {
  const navigate = useNavigate();
  
  // Using some placeholder images for the UI
  const tomatoImg = "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop";
  const cucumberImg = "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=200&h=200&fit=crop";
  const carrotImg = "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&h=200&fit=crop";
  const mangoImg = "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=200&h=200&fit=crop";

  const [chartTime, setChartTime] = useState("7");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  const productCategories = [
    { category: "Cây lương thực", icon: "🌾", items: ["Lúa gạo", "Ngô", "Khoai lang", "Sắn"] },
    { category: "Rau củ quả", icon: "🥕", items: ["Cà chua hữu cơ", "Cà chua bi đen", "Rau sạch", "Dưa leo", "Cà rốt"] },
    { category: "Trái cây", icon: "🍎", items: ["Kiwi New Zealand", "Xoài Cát", "Sầu Riêng", "Chuối", "Cam", "Dưa hấu"] },
    { category: "Cây công nghiệp", icon: "🌳", items: ["Cà phê", "Cao su", "Hồ tiêu", "Điều", "Chè"] },
    { category: "Giống cây trồng", icon: "🌱", items: ["Hạt giống rau", "Cây giống ăn quả", "Hạt giống hoa"] },
    { category: "Nông sản chế biến", icon: "📦", items: ["Trái cây sấy", "Nước ép", "Bột nông sản", "Mứt"] },
    { category: "Chăn nuôi", icon: "🥚", items: ["Thịt lợn", "Thịt bò", "Thịt gà", "Trứng", "Sữa tươi"] }
  ];
  
  const [formData, setFormData] = useState({
    title: "",
    discountType: "percent", // percent, amount, free_ship
    discountVal: "",
    products: [], // list of product IDs
    startDate: "",
    endDate: "",
    minOrder: "",
    maxDiscount: "",
    maxUses: "",
    description: "",
  });

  const mockProducts = [
    { id: 'Cà chua hữu cơ', name: 'Cà chua hữu cơ', price: 40000, img: tomatoImg, cat: 'Rau củ quả' },
    { id: 'Cà chua bi đen', name: 'Cà chua bi đen', price: 35000, img: tomatoImg, cat: 'Rau củ quả' },
    { id: 'Dưa leo', name: 'Dưa leo VietGAP', price: 18000, img: cucumberImg, cat: 'Rau củ quả' },
    { id: 'Xoài Cát', name: 'Xoài cát Hòa Lộc', price: 45000, img: mangoImg, cat: 'Trái cây' }
  ];
  
  const defaultPromotions = [
    {
      id: 1,
      image: tomatoImg,
      title: "Cà chua hữu cơ - Giảm 15%",
      discountVal: "15%",
      status: "active",
      statusLabel: "Đang hoạt động",
      type: "Giảm theo %",
      products: ["Cà chua hữu cơ", "Cà chua bi đen"],
      usedStr: "18 / 100",
      usedPercent: 18,
      revenue: "2.450.000đ"
    },
    {
      id: 2,
      image: cucumberImg,
      title: "Dưa leo siêu sale",
      discountVal: "50.000đ",
      status: "upcoming",
      statusLabel: "Sắp diễn ra",
      type: "Giảm tiền mặt",
      products: ["Dưa leo VietGAP"],
      usedStr: "0 / 50",
      usedPercent: 0,
      revenue: "0đ"
    }
  ];

  const [promotions, setPromotionsState] = useState(() => {
    const saved = localStorage.getItem('mockPromotions');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('mockPromotions', JSON.stringify(defaultPromotions));
    return defaultPromotions;
  });

  const setPromotions = (newPromos) => {
    setPromotionsState(newPromos);
    localStorage.setItem('mockPromotions', JSON.stringify(newPromos));
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setPromotions(promotions.filter(p => p.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };



  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: "",
      discountType: "percent",
      discountVal: "",
      products: [],
      startDate: "2024-08-01",
      endDate: "2024-08-31",
      minOrder: "",
      maxDiscount: "",
      maxUses: "",
      description: "",
    });
    setIsProductDropdownOpen(false);
    setActiveCategory(null);
    setProductSearchTerm("");
    setIsModalOpen(true);
  };

  const openEditModal = (promo) => {
    setEditingId(promo.id);
    setFormData({
      title: promo.title,
      discountType: promo.type === "Giảm theo %" ? "percent" : "amount",
      discountVal: promo.discountVal.replace(/\D/g, ''),
      products: promo.products || [],
      startDate: "2024-08-01",
      endDate: "2024-08-31",
      minOrder: "100000",
      maxDiscount: "100000",
      maxUses: "300",
      description: `Chương trình ${promo.title.toLowerCase()}`,
    });
    setIsProductDropdownOpen(false);
    setActiveCategory(null);
    setProductSearchTerm("");
    setIsModalOpen(true);
  };

  const toggleProduct = (prodName) => {
    let newProducts = [...formData.products];
    if (newProducts.includes(prodName)) {
      newProducts = newProducts.filter(p => p !== prodName);
    } else {
      newProducts.push(prodName);
    }
    setFormData({...formData, products: newProducts});
    setPreviewIndex(0);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    const productNames = formData.products;
    const typeLabel = formData.discountType === "percent" ? "Giảm theo %" : (formData.discountType === "amount" ? "Giảm tiền mặt" : "Miễn phí vận chuyển");
    const valLabel = formData.discountType === "percent" ? `${formData.discountVal}%` : (formData.discountType === "amount" ? `${formData.discountVal}đ` : 'Miễn phí');

    if (editingId) {
      setPromotions(promotions.map(p => p.id === editingId ? {
        ...p,
        title: formData.title,
        discountVal: valLabel,
        type: typeLabel,
        products: productNames.length ? productNames : ["Tất cả sản phẩm"],
        status: "pending",
        statusLabel: "Chờ duyệt"
      } : p));
    } else {
      const newPromo = {
        id: Date.now(),
        title: formData.title || "Khuyến mãi mới",
        discountVal: valLabel,
        type: typeLabel,
        status: "pending",
        statusLabel: "Chờ duyệt",
        image: tomatoImg,
        products: productNames.length ? productNames : ["Tất cả sản phẩm"],
        usedStr: "0 / 100",
        usedPercent: 0,
        revenue: "0đ"
      };
      setPromotions([...promotions, newPromo]);
    }
    setIsModalOpen(false);
  };

  const filteredPromotions = promotions.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchProduct = filterProduct === "all" || p.products.includes(filterProduct) || p.products.includes("Tất cả sản phẩm");
    const matchType = filterType === "all" || p.type === filterType;
    const matchTime = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchProduct && matchType && matchTime;
  });

  // Derived state for Preview
  const formatMoney = (val) => val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  
  const safePreviewIndex = Math.min(previewIndex, Math.max(0, formData.products.length - 1));
  const previewProduct = formData.products.length > 0 
    ? (mockProducts.find(m => m.id === formData.products[safePreviewIndex]) || { id: formData.products[safePreviewIndex], name: formData.products[safePreviewIndex], price: 35000, img: mangoImg, cat: 'Nông sản' })
    : mockProducts[0];

  let calculatedNewPrice = previewProduct.price;
  let badgeText = "";
  if (formData.discountType === "percent" && formData.discountVal) {
    calculatedNewPrice = previewProduct.price * (1 - parseFloat(formData.discountVal)/100);
    badgeText = `-${formData.discountVal}%`;
  } else if (formData.discountType === "amount" && formData.discountVal) {
    calculatedNewPrice = Math.max(0, previewProduct.price - parseFloat(formData.discountVal.replace(/\./g, '')));
    badgeText = `-${formatMoney(formData.discountVal)}`;
  } else if (formData.discountType === "free_ship") {
    badgeText = "Freeship";
  }

  const startDateStr = formData.startDate ? formData.startDate.split('-').reverse().join('/') : "01/08/2024";
  const endDateStr = formData.endDate ? formData.endDate.split('-').reverse().join('/') : "31/08/2024";

  return (
    <div className="fp-page-wrapper">
      {/* Header */}
      <div className="fp-header-row">
        <div className="fp-title-area">
          <h1>Quản lý khuyến mãi</h1>
          <p>Tạo và quản lý các chương trình giảm giá cho nông sản của bạn.</p>
        </div>
        <div className="fp-header-actions">
          <button className="fp-btn-create" onClick={openCreateModal}>
            <Plus size={16} /> Tạo khuyến mãi
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="fp-stats-grid">
        <div className="fp-stat-card">
          <div className="fp-stat-card-header">
            <p className="fp-stat-label">Đang chạy</p>
            <div className="fp-stat-icon active-icon"><PlayCircle size={18}/></div>
          </div>
          <h2 className="fp-stat-value">5</h2>
          <p className="fp-stat-trend trend-up"><span className="trend-arrow">▲</span> 2 so với tháng trước</p>
        </div>
        <div className="fp-stat-card">
          <div className="fp-stat-card-header">
            <p className="fp-stat-label">Sắp diễn ra</p>
            <div className="fp-stat-icon upcoming-icon"><Clock size={18}/></div>
          </div>
          <h2 className="fp-stat-value">3</h2>
          <p className="fp-stat-trend trend-neutral">Chờ bắt đầu</p>
        </div>
        <div className="fp-stat-card">
          <div className="fp-stat-card-header">
            <p className="fp-stat-label">Đã kết thúc</p>
            <div className="fp-stat-icon expired-icon"><CheckCircle2 size={18}/></div>
          </div>
          <h2 className="fp-stat-value">18</h2>
          <p className="fp-stat-trend trend-down"><span className="trend-arrow">▼</span> 3 so với tháng trước</p>
        </div>
        <div className="fp-stat-card">
          <div className="fp-stat-card-header">
            <p className="fp-stat-label">Doanh thu (KM)</p>
            <div className="fp-stat-icon revenue-icon"><DollarSign size={18}/></div>
          </div>
          <h2 className="fp-stat-value">42.300.000đ</h2>
          <p className="fp-stat-trend trend-up"><span className="trend-arrow">▲</span> 15% so với tháng trước</p>
        </div>
        <div className="fp-stat-card">
          <div className="fp-stat-card-header">
            <p className="fp-stat-label">Đơn dùng KM</p>
            <div className="fp-stat-icon orders-icon"><ShoppingBag size={18}/></div>
          </div>
          <h2 className="fp-stat-value">284</h2>
          <p className="fp-stat-trend trend-up"><span className="trend-arrow">▲</span> 32 đơn</p>
        </div>
        <div className="fp-stat-card">
          <div className="fp-stat-card-header">
            <p className="fp-stat-label">Tiết kiệm cho KH</p>
            <div className="fp-stat-icon savings-icon"><PiggyBank size={18}/></div>
          </div>
          <h2 className="fp-stat-value">5.200.000đ</h2>
          <p className="fp-stat-trend trend-up"><span className="trend-arrow">▲</span> 12% so với tháng trước</p>
        </div>
      </div>

      {/* NEW Filter Bar */}
      <div className="fp-filter-bar">
        <div className="fp-search-box">
          <Search size={18} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Tìm kiếm chương trình..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="fp-filter-buttons">
          <button className="fp-filter-btn active" onClick={() => {setFilterProduct("all"); setFilterType("all"); setFilterStatus("all"); setSearchQuery("");}}>Tất cả {promotions.length}</button>
          
          <select className="fp-filter-btn" value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)} style={{appearance: 'none', paddingRight: '30px', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px top 50%', backgroundSize: '10px auto'}}>
            <option value="all">Sản phẩm</option>
            {mockProducts.map(mp => <option key={mp.id} value={mp.id}>{mp.name}</option>)}
          </select>

          <select className="fp-filter-btn" value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{appearance: 'none', paddingRight: '30px', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px top 50%', backgroundSize: '10px auto'}}>
            <option value="all">Loại giảm</option>
            <option value="Giảm theo %">Giảm theo %</option>
            <option value="Giảm tiền mặt">Giảm tiền mặt</option>
            <option value="Miễn phí vận chuyển">Miễn phí vận chuyển</option>
          </select>

          <select className="fp-filter-btn" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{appearance: 'none', paddingRight: '30px', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px top 50%', backgroundSize: '10px auto'}}>
            <option value="all">Thời gian</option>
            <option value="active">Đang hoạt động</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="pending">Chờ duyệt</option>
            <option value="expired">Đã kết thúc</option>
          </select>
        </div>
        <button className="fp-btn-export" onClick={() => alert("Đang xuất dữ liệu ra file Excel...")}>
          <Download size={16} /> Xuất Excel
        </button>
      </div>

      {/* Promo List */}
      <div className="fp-promo-list">
        {filteredPromotions.length === 0 ? (
          <p style={{textAlign: 'center', color: '#6b7280', padding: '20px'}}>Không tìm thấy khuyến mãi nào.</p>
        ) : (
          filteredPromotions.map((promo) => (
            <div className="fp-promo-card" key={promo.id}>
              <div className="fp-promo-image">
                <img src={promo.image} alt={promo.title} />
              </div>
              
              <div className="fp-promo-info">
                <h3>{promo.title}</h3>
                <div className="fp-promo-discount-row">
                  <span className="fp-discount-val">{promo.discountVal}</span>
                  <span className={`fp-badge badge-${promo.status}`}>{promo.statusLabel}</span>
                </div>
                <p className="fp-discount-type">Loại: {promo.type}</p>
              </div>

              <div className="fp-promo-applies">
                <p className="fp-col-label">Sản phẩm áp dụng</p>
                <div className="fp-product-list">
                  {promo.products.map((prod, idx) => (
                    <div className="fp-prod-item" key={idx}><Check size={14} color="#059669" /> {prod}</div>
                  ))}
                </div>
              </div>

              <div className="fp-promo-stats">
                <div className="fp-stat-row">
                  <span className="fp-col-label">Đã sử dụng</span>
                  <span className="fp-stat-val-small">{promo.usedStr}</span>
                </div>
                <div className="fp-progress-bar">
                  <div className="fp-progress-fill" style={{ width: `${promo.usedPercent}%` }}></div>
                </div>
                <div className="fp-stat-row mt-3">
                  <span className="fp-col-label">Doanh thu mang lại</span>
                  <span className="fp-revenue-val">{promo.revenue}</span>
                </div>
              </div>

              <div className="fp-promo-actions">
                <button className="fp-action-btn" title="Chỉnh sửa" onClick={() => openEditModal(promo)}>
                  <Edit2 size={16} />
                </button>

                <button className="fp-action-btn delete" title="Xóa" onClick={() => handleDeleteClick(promo.id)}>
                  <X size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* NEW Modal */}
      {isModalOpen && (
        <div className="fp-modal-overlay">
          <div className="fp-modal-content large">
            <div className="fp-modal-header">
              <h2>{editingId ? "Chỉnh sửa khuyến mãi" : "Tạo khuyến mãi mới"}</h2>
              <button className="fp-modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveModal}>
              <div className="fp-modal-3col">
                
                {/* Column 1 */}
                <div className="fp-modal-col">
                  <div className="fp-form-group">
                    <label>Tên chương trình <span className="req">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      placeholder="Nhập tên chương trình" 
                      className="fp-input"
                    />
                  </div>

                  <div className="fp-form-group">
                    <label>Loại giảm giá</label>
                    <div className="fp-type-toggles">
                      <button 
                        type="button" 
                        className={`fp-toggle-btn ${formData.discountType === 'percent' ? 'active' : ''}`}
                        onClick={() => setFormData({...formData, discountType: 'percent'})}
                      >
                        <Percent size={16}/> Giảm theo %
                      </button>
                      <button 
                        type="button" 
                        className={`fp-toggle-btn ${formData.discountType === 'amount' ? 'active' : ''}`}
                        onClick={() => setFormData({...formData, discountType: 'amount'})}
                      >
                        <DollarSign size={16}/> Giảm theo số tiền
                      </button>
                      <button 
                        type="button" 
                        className={`fp-toggle-btn ${formData.discountType === 'free_ship' ? 'active' : ''}`}
                        onClick={() => setFormData({...formData, discountType: 'free_ship'})}
                      >
                        <Truck size={16}/> Miễn phí vận chuyển
                      </button>
                    </div>
                  </div>

                  <div className="fp-form-group">
                    <label>Giá trị giảm <span className="req">*</span></label>
                    <div className="fp-input-suffix-wrapper">
                      <input 
                        type="text" 
                        required={formData.discountType !== 'free_ship'}
                        disabled={formData.discountType === 'free_ship'}
                        value={formData.discountVal} 
                        onChange={e => setFormData({...formData, discountVal: e.target.value})} 
                        className="fp-input"
                      />
                      <span className="fp-input-suffix">{formData.discountType === 'percent' ? '%' : 'đ'}</span>
                    </div>
                  </div>

                  <div className="fp-form-group" style={{ position: 'relative', zIndex: 11 }}>
                    <label>Sản phẩm áp dụng <span className="req">*</span></label>
                    <div 
                      className="fp-product-selector"
                      onClick={() => { setIsProductDropdownOpen(!isProductDropdownOpen); setActiveCategory(null); }}
                      style={{
                        border: '1px solid var(--fp-border-dark)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        minHeight: '40px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        backgroundColor: 'white',
                        alignItems: 'center'
                      }}
                    >
                      {formData.products.length === 0 ? (
                        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
                          <span style={{color: '#6b7280', fontSize: '14px'}}>Lựa chọn sản phẩm...</span>
                          <ChevronDown size={16} color="#6b7280"/>
                        </div>
                      ) : (
                        <>
                          {formData.products.map(prod => (
                            <div key={prod} style={{background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                              {prod}
                              <X size={14} style={{cursor: 'pointer'}} onClick={(e) => { e.stopPropagation(); toggleProduct(prod); }} />
                            </div>
                          ))}
                          <div style={{flex: 1, display: 'flex', justifyContent: 'flex-end'}}>
                            <ChevronDown size={16} color="#6b7280"/>
                          </div>
                        </>
                      )}
                    </div>

                    {isProductDropdownOpen && (
                      <>
                        <div 
                          style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9}}
                          onClick={(e) => { e.stopPropagation(); setIsProductDropdownOpen(false); setActiveCategory(null); }}
                        />
                        <div style={{
                          position: 'relative', width: '100%',
                          background: 'white', border: '1px solid var(--fp-border-dark)',
                          borderRadius: '6px', marginTop: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 10,
                          display: 'flex', flexDirection: 'column'
                        }}>
                          <div style={{maxHeight: '250px', overflowY: 'auto'}}>
                            {!activeCategory ? (
                              <div style={{padding: '12px'}}>
                                <div style={{fontSize: '13px', fontWeight: 'bold', color: '#6b7280', marginBottom: '12px'}}>CHỌN DANH MỤC</div>
                                <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                                  {productCategories.map(cat => (
                                    <div 
                                      key={cat.category}
                                      onClick={(e) => { e.stopPropagation(); setActiveCategory(cat.category); setProductSearchTerm(""); }}
                                      style={{
                                        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', 
                                        borderRadius: '20px', background: '#f3f4f6', color: '#374151',
                                        fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s',
                                        border: '1px solid transparent'
                                      }}
                                    >
                                      <span>{cat.icon}</span> {cat.category}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <>
                                <div style={{padding: '8px', borderBottom: '1px solid var(--fp-border-dark)', position: 'sticky', top: 0, background: 'white', zIndex: 2}}>
                                  <div 
                                    style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px', cursor: 'pointer', color: '#059669', fontSize: '13px', fontWeight: '600'}} 
                                    onClick={(e) => { e.stopPropagation(); setActiveCategory(null); setProductSearchTerm(""); }}
                                  >
                                    <span style={{fontSize: '16px'}}>←</span> Quay lại danh mục
                                  </div>
                                  <div style={{position: 'relative'}}>
                                    <Search size={14} style={{position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af'}} />
                                    <input 
                                      type="text" 
                                      placeholder={`Tìm kiếm trong ${activeCategory}...`}
                                      value={productSearchTerm}
                                      onChange={e => setProductSearchTerm(e.target.value)}
                                      style={{width: '100%', padding: '8px 10px 8px 32px', border: '1px solid var(--fp-border-dark)', borderRadius: '4px', outline: 'none', fontSize: '13px'}}
                                      onClick={e => e.stopPropagation()}
                                    />
                                  </div>
                                </div>
                                
                                <div style={{padding: '4px 0'}}>
                                  {(() => {
                                    const catObj = productCategories.find(c => c.category === activeCategory);
                                    const filteredItems = catObj ? catObj.items.filter(item => item.toLowerCase().includes(productSearchTerm.toLowerCase())) : [];
                                    
                                    return (
                                      <>
                                        <div 
                                          onClick={() => toggleProduct(activeCategory)}
                                          style={{
                                            padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', 
                                            background: formData.products.includes(activeCategory) ? '#ecfdf5' : 'transparent', 
                                            color: formData.products.includes(activeCategory) ? '#059669' : '#374151', 
                                            fontSize: '14px', fontWeight: formData.products.includes(activeCategory) ? '600' : '400',
                                            borderBottom: '1px solid #f3f4f6'
                                          }}
                                        >
                                          {formData.products.includes(activeCategory) ? <Check size={16} /> : <div style={{width: 16}} />}
                                          Chọn tất cả trong {activeCategory}
                                        </div>
                                        {filteredItems.map(item => (
                                          <div 
                                            key={item}
                                            onClick={() => toggleProduct(item)}
                                            style={{
                                              padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', 
                                              background: formData.products.includes(item) ? '#ecfdf5' : 'transparent', 
                                              color: formData.products.includes(item) ? '#059669' : '#374151', 
                                              fontSize: '14px', fontWeight: formData.products.includes(item) ? '600' : '400'
                                            }}
                                          >
                                            {formData.products.includes(item) ? <Check size={16} /> : <div style={{width: 16}} />}
                                            {item}
                                          </div>
                                        ))}
                                        {filteredItems.length === 0 && (
                                          <div style={{fontSize: '13px', color: '#6b7280', padding: '12px', width: '100%', textAlign: 'center'}}>
                                            Không tìm thấy sản phẩm nào.
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              </>
                            )}
                          </div>
                          <div style={{padding: '10px 12px', borderTop: '1px solid var(--fp-border-dark)', background: '#f9fafb', display: 'flex', justifyContent: 'flex-end', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px'}}>
                            <button 
                              onClick={(e) => { e.preventDefault(); setIsProductDropdownOpen(false); setActiveCategory(null); }}
                              style={{background: '#059669', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s'}}
                              onMouseOver={(e) => e.target.style.background = '#047857'}
                              onMouseOut={(e) => e.target.style.background = '#059669'}
                            >
                              Hoàn tất
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Column 2 */}
                <div className="fp-modal-col mid-col">
                  <div className="fp-form-group">
                    <label>Thời gian áp dụng</label>
                    <div className="fp-form-row">
                      <div className="fp-form-group-half">
                        <label className="sub-label">Ngày bắt đầu</label>
                        <div className="fp-input-icon-wrapper">
                          <input 
                            type="date" 
                            className="fp-input"
                            value={formData.startDate}
                            onChange={e => setFormData({...formData, startDate: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="fp-form-group-half">
                        <label className="sub-label">Ngày kết thúc</label>
                        <div className="fp-input-icon-wrapper">
                          <input 
                            type="date" 
                            className="fp-input"
                            value={formData.endDate}
                            onChange={e => setFormData({...formData, endDate: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="fp-form-group">
                    <label>Điều kiện áp dụng</label>
                    <div className="fp-form-row">
                      <div className="fp-form-group-half">
                        <label className="sub-label">Đơn tối thiểu (tùy chọn)</label>
                        <div className="fp-input-suffix-wrapper">
                          <input 
                            type="text" 
                            className="fp-input" 
                            placeholder="100.000"
                            value={formData.minOrder}
                            onChange={e => setFormData({...formData, minOrder: e.target.value})}
                          />
                          <span className="fp-input-suffix">đ</span>
                        </div>
                      </div>
                      <div className="fp-form-group-half">
                        <label className="sub-label">Giảm tối đa (tùy chọn)</label>
                        <div className="fp-input-suffix-wrapper">
                          <input 
                            type="text" 
                            className="fp-input" 
                            placeholder="100.000"
                            value={formData.maxDiscount}
                            onChange={e => setFormData({...formData, maxDiscount: e.target.value})}
                            disabled={formData.discountType !== 'percent'}
                          />
                          <span className="fp-input-suffix">đ</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="fp-form-group">
                    <label>Giới hạn lượt sử dụng</label>
                    <label className="sub-label">Tổng lượt sử dụng</label>
                    <div className="fp-input-suffix-wrapper">
                      <input 
                        type="text" 
                        className="fp-input" 
                        placeholder="300"
                        value={formData.maxUses}
                        onChange={e => setFormData({...formData, maxUses: e.target.value})}
                      />
                      <span className="fp-input-suffix">lượt</span>
                    </div>
                    <p className="fp-help-text">Để trống nếu không giới hạn</p>
                  </div>

                  <div className="fp-form-group">
                    <label>Mô tả (tùy chọn)</label>
                    <textarea 
                      className="fp-input fp-textarea" 
                      placeholder="Nhập mô tả chương trình..."
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                  </div>
                </div>

                {/* Column 3: Preview */}
                <div className="fp-modal-col preview-col">
                  <div className="fp-preview-header">Xem trước hiển thị</div>
                  
                  <div className="fp-preview-mobile fp-product-card" style={{margin: '0', maxWidth: '100%'}}>
                    <div className="fpm-img-wrap" style={{position: 'relative'}}>
                      <img src={previewProduct.img} alt={previewProduct.name} />
                      {badgeText && <span className="fpm-discount-badge">{badgeText}</span>}
                      <button className="fpm-heart-btn" type="button">
                        <Heart size={16} color="#666" />
                      </button>
                      
                      {formData.products.length > 1 && (
                        <>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setPreviewIndex(prev => (prev - 1 + formData.products.length) % formData.products.length); }}
                            style={{position: 'absolute', top: '50%', left: '8px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}
                          >
                            <span style={{fontSize: '16px', color: '#333'}}>←</span>
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setPreviewIndex(prev => (prev + 1) % formData.products.length); }}
                            style={{position: 'absolute', top: '50%', right: '8px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}
                          >
                            <span style={{fontSize: '16px', color: '#333'}}>→</span>
                          </button>
                          <div style={{position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '11px', padding: '2px 8px', borderRadius: '10px'}}>
                            {safePreviewIndex + 1} / {formData.products.length}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="fpm-content">
                      <span className="fpm-category">{previewProduct.cat ? previewProduct.cat.toUpperCase() : 'NÔNG SẢN'}</span>
                      <h4 style={{fontSize: '16px', fontWeight: '700', margin: '0 0 12px 0', color: '#111827'}}>{previewProduct.name}</h4>
                      
                      <div className="fpm-store" style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280', marginBottom: '8px'}}>
                        <User size={14} /> Nông trại Green Farm
                      </div>
                      
                      <div className="fpm-rating-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '13px'}}>
                        <div className="fpm-rating" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                          <Star fill="#f59e0b" color="#f59e0b" size={14} /> 
                          <span style={{fontWeight: '600', color: '#111827'}}>5.0</span> 
                          <span style={{color: '#9ca3af'}}>(12)</span>
                        </div>
                        <div style={{color: '#6b7280'}}>Đã bán 150</div>
                      </div>
                      
                      <div style={{height: '1px', background: '#f1f1f1', marginBottom: '12px'}}></div>
                      
                      <div className="fpm-price-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                        <div className="fpm-price-col" style={{display: 'flex', flexDirection: 'column'}}>
                          {badgeText ? (
                            <>
                              <span style={{fontSize: '12px', color: '#9ca3af', textDecoration: 'line-through', marginBottom: '2px'}}>{formatMoney(previewProduct.price)}</span>
                              <span style={{fontSize: '18px', fontWeight: '700', color: '#111827'}}>{formatMoney(calculatedNewPrice)}</span>
                            </>
                          ) : (
                            <span style={{fontSize: '18px', fontWeight: '700', color: '#111827'}}>{formatMoney(previewProduct.price)}</span>
                          )}
                        </div>
                        <button className="fpm-cart-btn" type="button" style={{background: 'white', border: '1px solid #059669', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}>
                          <ShoppingCart size={18} color="#059669" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="fp-preview-note">* Giao diện hiển thị có thể thay đổi trên các thiết bị khác nhau.</p>
                </div>

              </div>
              
              <div className="fp-modal-footer">
                <button type="button" className="fp-btn-cancel-wide" onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="fp-btn-save-wide">{editingId ? "Cập nhật" : "Tạo chương trình"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fp-modal-overlay">
          <div className="fp-modal-content" style={{maxWidth: '400px', textAlign: 'center', padding: '32px 24px'}}>
            <div style={{marginBottom: '16px', color: '#ef4444', display: 'flex', justifyContent: 'center'}}>
               <AlertTriangle size={56} strokeWidth={1.5} />
            </div>
            <h2 style={{fontSize: '22px', fontWeight: '700', marginBottom: '12px', color: '#111827'}}>Xác nhận xóa</h2>
            <p style={{color: '#6b7280', marginBottom: '32px', fontSize: '15px', lineHeight: '1.5'}}>
              Bạn có chắc chắn muốn xóa chương trình khuyến mãi này không? Hành động này không thể hoàn tác.
            </p>
            
            <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
              <button 
                className="fp-btn-cancel-wide" 
                style={{flex: 1, padding: '12px', fontSize: '15px'}} 
                onClick={cancelDelete}
              >
                Hủy bỏ
              </button>
              <button 
                className="fp-btn-save-wide" 
                style={{flex: 1, backgroundColor: '#ef4444', color: 'white', padding: '12px', fontSize: '15px'}} 
                onClick={confirmDelete}
              >
                Xóa khuyến mãi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerPromotions;

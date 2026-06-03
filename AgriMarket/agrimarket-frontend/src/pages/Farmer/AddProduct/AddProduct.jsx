import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./AddProduct.css";

// --- Sidebar nav items ---
const NAV_ITEMS = [
  { icon: "home",     label: "Trang chủ",          path: "/" },
  { icon: "profile",  label: "Hồ sơ",              path: "/profile" },
  { icon: "product",  label: "Sản phẩm",          path: "/farmer/products", active: true },
  { icon: "security", label: "Bảo mật",           path: "/security" },
  { icon: "bell",     label: "Thông báo",          path: "/farmer/notifications" },
  { icon: "history",  label: "Lịch sử giao dịch", path: "/farmer/orders" },
];

const NavIcon = ({ type }) => {
  const props = { viewBox: "0 0 24 24", fill: "none", strokeWidth: "2", width: "18", height: "18" };
  if (type === "home")     return <svg {...props} stroke="#f97316"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
  if (type === "profile")  return <svg {...props} stroke="#8b5cf6"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if (type === "product")  return <svg {...props} stroke="#16a34a"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
  if (type === "security") return <svg {...props} stroke="#f59e0b"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
  if (type === "bell")     return <svg {...props} stroke="#eab308"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
  if (type === "history")  return <svg {...props} stroke="#64748b"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 109.03-7.93"/><polyline points="3 4 3 11 10 11"/></svg>;
  return null;
};

const CATEGORIES = [
  "Rau củ",
  "Trái cây",
  "Ngũ cốc & Hạt",
  "Thảo mộc & Gia vị",
  "Sản phẩm bơ sữa",
  "Thịt & Gia cầm",
  "Thủy hải sản",
  "Đồ uống hữu cơ",
];

const UNITS = ["kg", "bó", "thùng", "cái", "lít"];

export const AddProduct = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form state
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [description, setDescription] = useState("");
  const [isOrganic, setIsOrganic] = useState(false);
  const [basePrice, setBasePrice] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("kg");
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [customUnitVal, setCustomUnitVal] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");

  const [currentUser, setCurrentUser] = useState(() => {
    const userStr = localStorage.getItem("farmconnect_user");
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  });

  const getRoleLabel = (role) => {
    const roles = {
      farmer: "Nông dân",
      customer: "Khách hàng",
      admin: "Quản trị viên"
    };
    return roles[role] || "Nông dân";
  };

  // Multi-image state
  const [productImages, setProductImages] = useState([]);  // [{ id, url }]
  const [isDragging, setIsDragging] = useState(false);
  const multiImgRef = useRef(null);
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0); // slider index

  // Certificate upload state
  const certInputRef = useRef(null);
  const [certFile, setCertFile] = useState(null);   // { name, url }

  const [loading, setLoading] = useState(false);
  const [previewToast, setPreviewToast] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Multi-image handlers ──────────────────────────────
  const readFiles = (files) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImages((prev) => [
          ...prev,
          { id: Date.now() + Math.random(), url: reader.result },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInput = (e) => readFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    readFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const removeImage = (id) =>
    setProductImages((prev) => prev.filter((img) => img.id !== id));

  // ── Certificate upload ────────────────────────────────
  const handleCertChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCertFile({ name: file.name, url: reader.result });
      setPreviewSlideIdx(productImages.length);
    };
    reader.readAsDataURL(file);
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!productName.trim()) newErrors.productName = "Vui lòng nhập tên sản phẩm.";
    if (!category) newErrors.category = "Vui lòng chọn danh mục.";
    if (!basePrice || isNaN(basePrice) || parseFloat(basePrice) < 0)
      newErrors.basePrice = "Vui lòng nhập giá hợp lệ.";
    if (!stockQty || isNaN(stockQty) || parseInt(stockQty) < 0)
      newErrors.stockQty = "Vui lòng nhập số lượng hợp lệ.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    navigate("/farmer/products");
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    // Optionally show a toast
  };

  const handlePreviewCart = () => {
    setPreviewToast(true);
    setTimeout(() => setPreviewToast(false), 2500);
  };

  const displayPrice = basePrice
    ? `${parseInt(basePrice).toLocaleString("vi-VN")} VNĐ`
    : "0 VNĐ";
  const displayName = productName || "Tên sản phẩm xem trước";
  // All preview slides: product images + cert (if organic + uploaded)
  const previewSlides = [
    ...productImages.map((img) => ({ url: img.url, type: "product" })),
    ...(isOrganic && certFile ? [{ url: certFile.url, type: "cert" }] : []),
  ];
  const slideCount = previewSlides.length;
  const safeIdx = slideCount > 0 ? previewSlideIdx % slideCount : 0;

  const prevSlide = () =>
    setPreviewSlideIdx((i) => (i - 1 + Math.max(slideCount, 1)) % Math.max(slideCount, 1));
  const nextSlide = () =>
    setPreviewSlideIdx((i) => (i + 1) % Math.max(slideCount, 1));

  return (
    <div className="ap-page">
      {/* SIDEBAR */}
      <aside className="ap-sidebar">
        {/* Logo */}
        <div className="ap-sidebar-logo">
          <span className="ap-logo-text">AgriMarket</span>
        </div>

        {/* User info */}
        <div className="ap-sidebar-user">
          <div className="ap-user-avatar">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Avatar" className="ap-user-avatar-img" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            )}
          </div>
          <div className="ap-user-info">
            <span className="ap-user-greeting">Xin chào,</span>
            <span className="ap-user-name">{currentUser?.fullName || "Khách"}</span>
            <span className="ap-user-role">{getRoleLabel(currentUser?.role)}</span>
          </div>
        </div>

        <nav className="ap-sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={`ap-nav-item ${item.active ? "ap-nav-active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="ap-nav-icon">
                <NavIcon type={item.icon} />
              </span>
              <span className="ap-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="ap-main">
        {/* TOP BAR */}
        <header className="ap-topbar">
          <div className="ap-topbar-left">
            <h1 className="ap-page-title">Tạo Sản phẩm</h1>
            <p className="ap-page-subtitle">Thêm sản phẩm nông nghiệp mới vào gian hàng của bạn.</p>
          </div>
          <div className="ap-topbar-actions">
            <button className="ap-btn-draft" onClick={handleSaveDraft} disabled={loading}>
              Lưu nháp
            </button>
            <button className="ap-btn-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <span className="ap-spinner" />
              ) : (
                "Gửi duyệt"
              )}
            </button>
          </div>
        </header>

        {/* FORM + PREVIEW LAYOUT */}
        <div className="ap-content-grid">
          {/* LEFT: FORM */}
          <div className="ap-form-col">
            {/* Product Media - Multi-image */}
            <section className="ap-card">
              <h2 className="ap-card-title">Hình ảnh sản phẩm</h2>
              <p className="ap-card-subtitle">
                Tải lên nhiều góc chụp khác nhau của nông sản — ảnh đầu tiên sẽ làm ảnh đại diện.
              </p>

              {/* Gallery grid */}
              {productImages.length > 0 && (
                <div className="ap-gallery-grid">
                  {productImages.map((img, idx) => (
                    <div key={img.id} className={`ap-gallery-item ${idx === 0 ? "ap-gallery-main" : ""}`}>
                      <img src={img.url} alt={`Ảnh ${idx + 1}`} />
                      {idx === 0 && <span className="ap-gallery-main-badge">Ảnh đại diện</span>}
                      <button
                        className="ap-gallery-remove"
                        onClick={() => removeImage(img.id)}
                        title="Xóa ảnh"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload zone */}
              <div
                className={`ap-upload-zone ${isDragging ? "ap-upload-dragging" : ""}`}
                onClick={() => multiImgRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  type="file"
                  ref={multiImgRef}
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleFileInput}
                />
                <div className="ap-upload-placeholder">
                  <div className="ap-upload-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className="ap-upload-text">
                    {productImages.length === 0
                      ? "Nhấp hoặc kéo thả ảnh vào đây"
                      : `+ Thêm ảnh (${productImages.length} ảnh)`}
                  </p>
                  <p className="ap-upload-hint">PNG, JPG, GIF — tối đa 5 ảnh, mỗi ảnh &le; 5MB</p>
                </div>
              </div>
            </section>

            {/* General Information */}
            <section className="ap-card">
              <h2 className="ap-card-title">Thông tin chung</h2>

              <div className="ap-field-group">
                <label className="ap-label">
                  Tên sản phẩm <span className="ap-required">*</span>
                </label>
                <input
                  type="text"
                  className={`ap-input ${errors.productName ? "ap-input-error" : ""}`}
                  placeholder="Ví dụ: Cà chua bi, Rau muống..."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
                {errors.productName && <span className="ap-error-msg">{errors.productName}</span>}
              </div>

              <div className="ap-field-row">
                <div className="ap-field-group">
                  <label className="ap-label">
                    Danh mục <span className="ap-required">*</span>
                  </label>
                  <select
                    className={`ap-select ${errors.category ? "ap-input-error" : ""}`}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Chọn danh mục</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.category && <span className="ap-error-msg">{errors.category}</span>}
                </div>

                <div className="ap-field-group">
                  <label className="ap-label">Ngày đăng sản phẩm</label>
                  <input
                    type="date"
                    className="ap-input"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="ap-field-group">
                <label className="ap-label">Mô tả sản phẩm</label>
                <textarea
                  className="ap-textarea"
                  placeholder="Mô tả hương vị, hình thức và phương pháp canh tác..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Organic toggle + cert upload */}
              <div className={`ap-organic-toggle ${isOrganic ? "ap-organic-active" : ""}`}>
                <div className="ap-toggle-info">
                  <span className="ap-toggle-label">Giấy chứng nhận nguồn gốc & An toàn sản phẩm</span>
                  <span className="ap-toggle-hint">Huy hiệu sẽ hiển thị trên thẻ sản phẩm</span>
                </div>
                <button
                  type="button"
                  className={`ap-toggle-btn ${isOrganic ? "ap-toggle-on" : ""}`}
                  onClick={() => {
                    const nextOrganic = !isOrganic;
                    setIsOrganic(nextOrganic);
                    if (nextOrganic && certFile) {
                      setPreviewSlideIdx(productImages.length);
                    } else {
                      setPreviewSlideIdx(0);
                    }
                  }}
                  aria-label="Bật/tắt giấy chứng nhận nguồn gốc & an toàn sản phẩm"
                >
                  <span className="ap-toggle-thumb" />
                </button>
              </div>

              {/* Certificate upload — shows when toggle is ON */}
              {isOrganic && (
                <div className="ap-cert-upload">
                  <div className="ap-cert-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" width="16" height="16">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                    <span className="ap-cert-title">Tải ảnh giấy chứng nhận</span>
                    <span className="ap-cert-badge">bắt buộc</span>
                  </div>

                  {certFile ? (
                    <div className="ap-cert-preview">
                      <img src={certFile.url} alt="Chứng nhận" className="ap-cert-img" />
                      <div className="ap-cert-info">
                        <span className="ap-cert-name">{certFile.name}</span>
                        <button className="ap-cert-remove" onClick={() => setCertFile(null)}>Xóa</button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="ap-cert-zone"
                      onClick={() => certInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={certInputRef}
                        accept="image/*,application/pdf"
                        style={{ display: "none" }}
                        onChange={handleCertChange}
                      />
                      <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" width="28" height="28">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <p className="ap-cert-zone-text">Nhấp để tải ảnh chứng nhận lên</p>
                      <p className="ap-cert-zone-hint">JPG, PNG hoặc PDF — tối đa 10MB</p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Bottom row: Pricing + Inventory */}
            <div className="ap-bottom-grid">
              {/* Pricing Setup */}
              <section className="ap-card">
                <div className="ap-card-header-row">
                  <span className="ap-card-icon">💰</span>
                  <h2 className="ap-card-title">Thiết lập giá</h2>
                </div>

                <div className="ap-field-group">
                  <label className="ap-label">
                    Giá bán <span className="ap-required">*</span>
                  </label>
                  <div className="ap-price-input-wrap">
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      className={`ap-input ap-price-input-vnd ${errors.basePrice ? "ap-input-error" : ""}`}
                      placeholder="0"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                    />
                    <span className="ap-price-suffix-vnd">VNĐ</span>
                  </div>
                  {errors.basePrice && <span className="ap-error-msg">{errors.basePrice}</span>}
                </div>

                <div className="ap-field-group">
                  <label className="ap-label">Đơn vị bán</label>
                  <div className="ap-unit-options">
                    {UNITS.map((u) => (
                      <button
                        key={u}
                        type="button"
                        className={`ap-unit-pill ${(!isCustomUnit && selectedUnit === u) ? "ap-unit-active" : ""}`}
                        onClick={() => {
                          setSelectedUnit(u);
                          setIsCustomUnit(false);
                        }}
                      >
                        {u}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`ap-unit-pill ${isCustomUnit ? "ap-unit-active" : ""}`}
                      onClick={() => {
                        setIsCustomUnit(true);
                        setSelectedUnit(customUnitVal || "");
                      }}
                    >
                      + Khác
                    </button>
                  </div>
                  {isCustomUnit && (
                    <div className="ap-custom-unit-wrap" style={{ marginTop: "10px" }}>
                      <input
                        type="text"
                        className="ap-input"
                        placeholder="Nhập đơn vị khác (ví dụ: gram, túi, chậu...)"
                        value={customUnitVal}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomUnitVal(val);
                          setSelectedUnit(val);
                        }}
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Inventory Tracking */}
              <section className="ap-card">
                <div className="ap-card-header-row">
                  <span className="ap-card-icon">📊</span>
                  <h2 className="ap-card-title">Theo dõi tồn kho</h2>
                </div>

                <div className="ap-field-group">
                  <label className="ap-label">
                    Số lượng tồn kho <span className="ap-required">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={`ap-input ${errors.stockQty ? "ap-input-error" : ""}`}
                    placeholder="Ví dụ: 50"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                  />
                  {errors.stockQty && <span className="ap-error-msg">{errors.stockQty}</span>}
                </div>

                <div className="ap-field-group">
                  <label className="ap-label">Ngưỡng cảnh báo hết hàng</label>
                  <input
                    type="number"
                    min="0"
                    className="ap-input"
                    placeholder="Cảnh báo khi số lượng giảm xuống..."
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                  />
                </div>
              </section>
            </div>
          </div>

          {/* RIGHT: LIVE STOREFRONT PREVIEW */}
          <aside className="ap-preview-col">
            <div className="ap-preview-card">
              <div className="ap-preview-label">XEM TRƯỚC GIAN HÀNG THỰC TẾ</div>

              {isOrganic && (
                <div className="ap-preview-badge">🌿 Đạt chứng nhận</div>
              )}

              {/* Image slider */}
              <div className="ap-preview-image-wrap">
                {slideCount > 0 ? (
                  <>
                    <div className="ap-slider-wrap">
                      <img
                        src={previewSlides[safeIdx].url}
                        alt={`Slide ${safeIdx + 1}`}
                        className={`ap-preview-img ${
                          previewSlides[safeIdx].type === "cert" ? "ap-preview-cert-img" : ""
                        }`}
                      />
                      {previewSlides[safeIdx].type === "cert" && (
                        <div className="ap-slide-cert-badge">
                          📜 Giấy chứng nhận nguồn gốc & An toàn sản phẩm
                        </div>
                      )}
                    </div>
                    {slideCount > 1 && (
                      <>
                        <button className="ap-slider-btn ap-slider-prev" onClick={prevSlide}>
                          ‹
                        </button>
                        <button className="ap-slider-btn ap-slider-next" onClick={nextSlide}>
                          ›
                        </button>
                        <div className="ap-slider-dots">
                          {previewSlides.map((s, i) => (
                            <button
                              key={i}
                              className={`ap-slider-dot ${
                                i === safeIdx ? "ap-slider-dot-active" : ""
                              } ${s.type === "cert" ? "ap-slider-dot-cert" : ""}`}
                              onClick={() => setPreviewSlideIdx(i)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="ap-preview-img-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" width="40" height="40">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Xem trước ảnh</span>
                  </div>
                )}
              </div>

              <div className="ap-preview-meta">
                <span className="ap-preview-category">{category || "DANH MỤC"}</span>
                <span className="ap-preview-new-badge">★ Mới</span>
              </div>

              <h3 className="ap-preview-name">{displayName}</h3>
              <div className="ap-preview-price">
                {displayPrice}
                <span className="ap-preview-unit"> / {selectedUnit}</span>
              </div>

              <div className="ap-preview-cart-wrap">
                <button className="ap-preview-cart-btn" onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <span className="ap-spinner" />
                  ) : (
                    "Đăng sản phẩm"
                  )}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;

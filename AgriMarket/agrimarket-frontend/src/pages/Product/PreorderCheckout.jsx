/* PreorderCheckout.jsx */
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../components/common/Header/Header";
import authService from "../../services/authService";
import { Leaf, Shield } from "lucide-react";
import "./PreorderCheckout.css";

const PreorderCheckout = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  
  // Checkout data states
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryMode, setDeliveryMode] = useState("pickup"); // 'pickup' or 'custom'
  const [customDate, setCustomDate] = useState("2026-09-01");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [placedPreorderId, setPlacedPreorderId] = useState(null);

  // Helper format VND
  const formatVND = (number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(number);
  };

  useEffect(() => {
    // Check auth
    const user = authService.getCurrentUser();
    setCurrentUser(user);

    // Load checkout item from localStorage
    const checkoutDataRaw = localStorage.getItem("agrimarket_checkout");
    if (checkoutDataRaw) {
      try {
        const parsed = JSON.parse(checkoutDataRaw);
        if (parsed && parsed.selectedItems && parsed.selectedItems.length > 0) {
          const item = parsed.selectedItems[0];
          setProduct(item);
          setQuantity(item.quantity || 1);
        } else {
          loadMockFallback();
        }
      } catch (err) {
        console.error("Lỗi parse checkout data:", err);
        loadMockFallback();
      }
    } else {
      loadMockFallback();
    }
  }, []);

  const loadMockFallback = () => {
    // Gorgeous default product if accessed directly without selecting one
    setProduct({
      id: "mock_tomato_preorder",
      name: "Giỏ Cà chua Heirloom Hữu cơ (10 lbs)",
      price: 1100000,
      unit: "Giỏ 4.5kg",
      imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60",
      farmerId: 101,
      farmerName: "Nông trại Thung Lũng Xanh (Green Valley)",
      expectedHarvest: "Cuối tháng 08, 2026",
      deliveryWindow: "Từ 01/09 đến 07/09/2026",
      isPreorder: true
    });
  };

  if (!product) {
    return (
      <div className="preorder-checkout-page">
        <Header activeTab="" />
        <div style={{ textAlign: "center", padding: "100px 20px", color: "#64748b" }}>
          Đang tải dữ liệu đơn đặt trước...
        </div>
      </div>
    );
  }

  // Cost calculations
  const pricePerUnit = product.price || 0;
  const subtotal = pricePerUnit * quantity;
  const deliveryFee = deliveryMode === "pickup" ? 0 : 35000; // Miễn phí vận chuyển nếu tự nhận
  const estimatedTaxes = Math.round(subtotal * 0.05); // 5% VAT
  const totalAmount = subtotal + deliveryFee + estimatedTaxes;
  const depositAmount = Math.round(totalAmount * 0.2); // 20% Deposit cọc

  const formatDateString = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  };

  const handleQuantityChange = (newVal) => {
    if (newVal < 1) return;
    setQuantity(newVal);
  };

  const handleConfirmPreorder = () => {
    // Generate unique preorder ID
    const preorderId = "PO-" + Math.floor(100000 + Math.random() * 900000);
    setPlacedPreorderId(preorderId);

    // Build preorder object to save
    const newPreorder = {
      id: preorderId,
      productId: product.id,
      productName: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      unit: product.unit,
      quantity: quantity,
      farmerId: product.farmerId,
      farmerName: product.farmerName,
      status: "paid", // Deposit has been paid successfully simulated
      expectedHarvest: product.expectedHarvest || "Cuối tháng 08, 2026",
      deliveryWindow: product.deliveryWindow || "Từ 01/09 đến 07/09/2026",
      totalAmount: totalAmount,
      depositPaid: depositAmount,
      remainingAmount: totalAmount - depositAmount,
      createdAt: new Date().toLocaleDateString("vi-VN"),
      deliveryOption: deliveryMode === "pickup" ? "Tự nhận tại nông trại" : `Giao tận nơi ngày ${formatDateString(customDate)}`,
      specialInstructions: specialInstructions,
      isPreorder: true
    };

    // Save to localStorage preorders
    const existingPreorders = JSON.parse(localStorage.getItem("agrimarket_preorders")) || [];
    localStorage.setItem("agrimarket_preorders", JSON.stringify([newPreorder, ...existingPreorders]));

    // Dispatch event to update tabs/badges elsewhere
    window.dispatchEvent(new Event("preordersUpdated"));

    // Show success modal
    setShowSuccessModal(true);
  };

  return (
    <div className="preorder-checkout-page">
      <Header activeTab="preorder" />

      <main className="preorder-checkout-main">
        {/* Breadcrumb */}
        <nav className="preorder-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="separator">&gt;</span>
          <Link to="/products">Cửa hàng</Link>
          <span className="separator">&gt;</span>
          <span className="current">Đặt trước nông sản</span>
        </nav>

        {/* Grid Layout */}
        <div className="preorder-layout-grid">
          
          {/* Left Main Panels */}
          <div className="preorder-left-column">
            
            {/* 1. Product Info Panel */}
            <div className="preorder-card-panel preorder-product-card">
              <div className="preorder-image-wrapper">
                <img src={product.imageUrl} alt={product.name} />
                <span className="preorder-badge-pill">Đặt trước</span>
              </div>

              <div className="preorder-details-info">
                <h2>{product.name}</h2>
                <div className="preorder-farm-row">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <span>{product.farmerName || "Nông trại địa phương"}</span>
                </div>

                <div className="preorder-timeline-cards">
                  <div className="timeline-box">
                    <div className="box-label">Dự kiến thu hoạch</div>
                    <div className="box-value">{product.expectedHarvest || "Tháng 8, 2026"}</div>
                  </div>
                  <div className="timeline-box">
                    <div className="box-label">Thời gian giao hàng</div>
                    <div className="box-value">{product.deliveryWindow || "Tháng 9, 2026"}</div>
                  </div>
                </div>

                <p className="preorder-product-desc">
                  Đặt trước sản phẩm của mùa vụ thu hoạch mới giúp đảm bảo nguồn cung tươi ngon nhất trực tiếp từ nông trại. 
                  Hỗ trợ nông dân yên tâm sản xuất với cam kết bao tiêu đầu ra chất lượng cao.
                </p>
              </div>
            </div>

            {/* 2. Configure Preorder Form */}
            <div className="preorder-card-panel">
              <h3 className="config-title">Cấu hình thông tin đặt trước</h3>

              {/* Quantity */}
              <div className="config-group">
                <label className="group-label">Chọn số lượng đặt trước ({product.unit})</label>
                <div className="qty-selector-row">
                  <div className="qty-control-buttons">
                    <button 
                      type="button" 
                      className="qty-btn" 
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      －
                    </button>
                    <input 
                      type="text" 
                      className="qty-input-text" 
                      value={quantity}
                      readOnly
                    />
                    <button 
                      type="button" 
                      className="qty-btn" 
                      onClick={() => handleQuantityChange(quantity + 1)}
                    >
                      ＋
                    </button>
                  </div>
                  <span className="price-indicator-text">{formatVND(pricePerUnit)} / {product.unit}</span>
                </div>
              </div>

              {/* Preferred Delivery Date */}
              <div className="config-group">
                <label className="group-label">Phương thức nhận hàng mong muốn</label>
                <div className="delivery-options-grid">
                  <div
                    className={`delivery-opt-card ${deliveryMode === "pickup" ? "selected" : ""}`}
                    onClick={() => setDeliveryMode("pickup")}
                  >
                    <div className="opt-date">Tự nhận tại vườn</div>
                    <div className="opt-desc">Bạn tự đến vườn lấy hàng (Miễn phí giao hàng)</div>
                    {deliveryMode === "pickup" && (
                      <div className="checkmark-icon">✓</div>
                    )}
                  </div>

                  <div
                    className={`delivery-opt-card ${deliveryMode === "custom" ? "selected" : ""}`}
                    onClick={() => setDeliveryMode("custom")}
                  >
                    <div className="opt-date">Tự chọn ngày nhận</div>
                    <div className="opt-desc">Hệ thống sẽ giao đến địa chỉ của bạn vào ngày đã chọn</div>
                    {deliveryMode === "custom" && (
                      <div className="checkmark-icon">✓</div>
                    )}
                  </div>
                </div>

                {deliveryMode === "custom" && (
                  <div className="preorder-date-picker-wrapper" style={{ marginTop: "16px" }}>
                    <label className="group-label" style={{ fontSize: "13.5px", color: "#475569", marginBottom: "8px", display: "block" }}>
                      Chọn ngày nhận hàng trên lịch *
                    </label>
                    <input
                      type="date"
                      className="preorder-date-picker-input"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      min="2026-08-01"
                      max="2026-12-31"
                    />
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              <div className="config-group" style={{ marginBottom: 0 }}>
                <label className="group-label">Ghi chú vận chuyển (Không bắt buộc)</label>
                <textarea
                  className="special-instructions-area"
                  placeholder="Nhập bất kỳ yêu cầu cụ thể nào về việc giao hàng của bạn..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>

            </div>

            {/* 3. Bottom Trust Badges */}
            <div className="preorder-trust-badges">
              <div className="trust-badge-item">
                <div className="trust-badge-icon leaf-icon">
                  <Leaf size={20} />
                </div>
                <div className="trust-badge-text">
                  <h4>Cam kết nông sản hữu cơ</h4>
                  <p>Sản phẩm được trồng hoàn toàn tự nhiên, không sử dụng hóa chất bảo vệ thực vật độc hại.</p>
                </div>
              </div>

              <div className="trust-badge-item">
                <div className="trust-badge-icon shield-icon">
                  <Shield size={20} />
                </div>
                <div className="trust-badge-text">
                  <h4>Hủy đặt trước an toàn</h4>
                  <p>Tiền đặt cọc được bảo đảm. Được phép hủy đặt trước miễn phí trước khi vụ mùa bước vào 1/3 giai đoạn cuối của chu kỳ thu hoạch.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column Sidebar Summary */}
          <div className="preorder-right-column">
            <div className="preorder-summary-card">
              <h3 className="summary-title">Tóm tắt đơn đặt trước</h3>
              
              <div className="summary-rows">
                <div className="summary-item-line">
                  <span>{quantity}x {product.name}</span>
                  <span>{formatVND(subtotal)}</span>
                </div>
                <div className="summary-item-line">
                  <span>Phí giao hàng (Tạm tính)</span>
                  <span>{formatVND(deliveryFee)}</span>
                </div>
                <div className="summary-item-line">
                  <span>Thuế VAT (5%)</span>
                  <span>{formatVND(estimatedTaxes)}</span>
                </div>
                
                <div className="summary-item-line total-line">
                  <span>Tổng giá trị ước tính</span>
                  <span>{formatVND(totalAmount)}</span>
                </div>
              </div>

              {/* Deposit Highlights */}
              <div className="deposit-required-box">
                <div className="deposit-header-row">
                  <span className="deposit-label-text">Yêu cầu đặt cọc (20%)</span>
                  <span className="deposit-val-text">{formatVND(depositAmount)}</span>
                </div>
                <span className="deposit-note-text">Thanh toán cọc hôm nay để giữ suất mua thu hoạch của nông trại.</span>
              </div>

              {/* Confirm Button */}
              <button 
                type="button" 
                className="btn-confirm-preorder"
                onClick={handleConfirmPreorder}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Xác nhận đặt trước
              </button>

              <p className="preorder-agreement-disclaimer">
                Bằng việc xác nhận, bạn đồng ý với Điều khoản và quy trình mua sắm đặt trước Seasonal Preorder của AgriMarket.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div className="preorder-success-overlay">
          <div className="preorder-success-modal">
            <div className="success-check-badge">✓</div>
            <h3>Đặt trước thành công!</h3>
            <p className="success-msg">
              Yêu cầu đặt trước sản phẩm mùa vụ của bạn đã được ghi nhận. 
              Khoản đặt cọc 20% đã được thanh toán thông qua số dư liên kết của bạn.
            </p>

            <div className="success-receipt-info">
              <div className="receipt-row">
                <span className="label">Mã đặt trước:</span>
                <span className="value">{placedPreorderId}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Nông sản:</span>
                <span className="value">{quantity}x {product.name}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Đã thanh toán cọc (20%):</span>
                <span className="value" style={{ color: "#16a34a" }}>{formatVND(depositAmount)}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Dự kiến thu hoạch:</span>
                <span className="value">{product.expectedHarvest || "Cuối tháng 08, 2026"}</span>
              </div>
            </div>

            <div className="success-actions-col">
              <button 
                type="button" 
                className="btn-success-primary"
                onClick={() => {
                  navigate("/profile/orders");
                  // Trigger direct navigation to preorder tab if needed
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent("setActiveOrderTab", { detail: "preorder" }));
                  }, 100);
                }}
              >
                Xem đơn đặt trước của tôi
              </button>
              <button 
                type="button" 
                className="btn-success-outline"
                onClick={() => navigate("/products")}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreorderCheckout;

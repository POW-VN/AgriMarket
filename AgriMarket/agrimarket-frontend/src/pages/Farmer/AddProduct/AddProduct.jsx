import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as productService from "../../../services/productService";
import apiClient from "../../../services/apiClient";
import "./AddProduct.css";

const CATEGORIES = [
  "Cây lương thực",
  "Rau củ quả",
  "Trái cây",
  "Cây công nghiệp",
  "Chăn nuôi",
  "Giống cây trồng",
  "Nông sản chế biến",
  "Khác"
];

const UNITS = ["kg", "bó", "thùng", "cái", "lít"];

export const AddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const descriptionRef = useRef(null);

  // Form state
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("kg");
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [customUnitVal, setCustomUnitVal] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [productStatus, setProductStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [perishability, setPerishability] = useState("khô");
  const [limitDistance, setLimitDistance] = useState("");

  const handlePerishabilityChange = (val) => {
    setPerishability(val);
    if (val === "rất dễ hư") {
      setLimitDistance(15);
    } else if (val === "dễ hư") {
      setLimitDistance(40);
    } else if (val === "trung bình") {
      setLimitDistance(85);
    } else if (val === "khô") {
      setLimitDistance("");
    }
  };

  // Multi-image state
  const [productImages, setProductImages] = useState([]);  // [{ id, url }]
  const [isDragging, setIsDragging] = useState(false);
  const multiImgRef = useRef(null);
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0); // slider index

  // Traceability image upload state
  const traceabilityInputRef = useRef(null);
  const [traceabilityFile, setTraceabilityFile] = useState(null); // { name, url }

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // AI description suggestion state
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiGeneratedText, setAiGeneratedText] = useState("");

  const cleanMarkdown = (text) => {
    if (!text) return "";
    return text
      .replace(/###\s+/g, "") // Remove H3 headers
      .replace(/##\s+/g, "")  // Remove H2 headers
      .replace(/#\s+/g, "")   // Remove H1 headers
      .replace(/\*\*/g, "")   // Remove bold markdown
      .replace(/\*/g, "")     // Remove italic markdown
      .replace(/`/g, "")      // Remove backticks
      .trim();
  };

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = "auto";
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  }, [description]);

  // AI price suggestion state
  const [isAiSuggestingPrice, setIsAiSuggestingPrice] = useState(false);
  const [showAiPriceModal, setShowAiPriceModal] = useState(false);
  const [aiPriceData, setAiPriceData] = useState({ recommendedPrice: 0, minPrice: 0, maxPrice: 0, explanation: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Load product info if in Edit mode
  useEffect(() => {
    if (isEdit) {
      const loadProductDetails = async () => {
        setLoading(true);
        try {
          const prod = await productService.getProductById(id);
          if (prod) {
            setProductName(prod.name || "");
            if (CATEGORIES.includes(prod.category)) {
              setCategory(prod.category);
              setCustomCategory("");
            } else {
              setCategory("Khác");
              setCustomCategory(prod.category || "");
            }
            setHarvestDate(prod.harvestDate ? prod.harvestDate.substring(0, 10) : "");
            setExpirationDate(prod.expirationDate ? prod.expirationDate.substring(0, 10) : "");
            setDescription(prod.description || "");
            setBasePrice(prod.price || "");
            
            if (UNITS.includes(prod.unit)) {
              setSelectedUnit(prod.unit);
              setIsCustomUnit(false);
              setCustomUnitVal("");
            } else {
              setSelectedUnit(prod.unit || "kg");
              setIsCustomUnit(true);
              setCustomUnitVal(prod.unit || "");
            }
            setStockQty(prod.stockQuantity !== undefined ? prod.stockQuantity : prod.stock || 0);

            // Load images
            if (prod.images && prod.images.length > 0) {
              setProductImages(prod.images.map((imgUrl, i) => ({ id: i, url: imgUrl })));
            } else if (prod.imageUrl) {
              setProductImages([{ id: 0, url: prod.imageUrl }]);
            } else {
              setProductImages([]);
            }

            if (prod.traceabilityImageUrl) {
              setTraceabilityFile({ name: "traceability_image.jpg", url: prod.traceabilityImageUrl });
            } else {
              setTraceabilityFile(null);
            }
            setProductStatus(prod.status || "");
            setAdminNotes(prod.adminNotes || "");
            setRejectionReason(prod.rejectionReason || "");
            setPerishability(prod.perishability || "khô");
            setLimitDistance(prod.limitDistance !== undefined && prod.limitDistance !== null ? prod.limitDistance : "");
          }
        } catch (err) {
          console.error("Lỗi khi tải chi tiết sản phẩm để chỉnh sửa:", err);
          showToast("Không thể tải thông tin sản phẩm.", "error");
        } finally {
          setLoading(false);
        }
      };
      loadProductDetails();
    }
  }, [id, isEdit]);

  const handleAiGenerate = async () => {
    if (!productName.trim()) {
      showToast("Vui lòng nhập tên sản phẩm trước để AI gợi ý mô tả.", "warning");
      return;
    }
    if (!category) {
      showToast("Vui lòng chọn danh mục trước để AI gợi ý mô tả.", "warning");
      return;
    }

    setIsAiGenerating(true);
    try {
      const response = await apiClient.post("/api/ai/generate-description", {
        productName: productName.trim(),
        category: category === "Khác" ? customCategory.trim() : category,
        harvestDate: harvestDate || null,
        expirationDate: expirationDate || null
      });

      if (response.data && response.data.description) {
        const cleaned = cleanMarkdown(response.data.description);
        setAiGeneratedText(cleaned);
        setShowAiModal(true);
      } else {
        showToast("Có lỗi xảy ra, vui lòng thử lại", "error");
      }
    } catch (err) {
      console.error("AI generation failed:", err);
      showToast("Có lỗi xảy ra, vui lòng thử lại", "error");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleAiSuggestPrice = async () => {
    if (!productName.trim()) {
      showToast("Vui lòng nhập tên sản phẩm trước để gợi ý giá bán.", "warning");
      return;
    }
    if (!category) {
      showToast("Vui lòng chọn danh mục trước để gợi ý giá bán.", "warning");
      return;
    }

    setIsAiSuggestingPrice(true);
    try {
      const response = await apiClient.post("/api/ai/suggest-price", {
        productName: productName.trim(),
        category: category === "Khác" ? customCategory.trim() : category,
        unit: selectedUnit,
        harvestDate: harvestDate || null,
        expirationDate: expirationDate || null
      });

      if (response.data && response.data.recommendedPrice) {
        setAiPriceData(response.data);
        setShowAiPriceModal(true);
      } else {
        showToast("Có lỗi xảy ra, vui lòng thử lại", "error");
      }
    } catch (err) {
      console.error("AI price suggestion failed:", err);
      showToast("Có lỗi xảy ra, vui lòng thử lại", "error");
    } finally {
      setIsAiSuggestingPrice(false);
    }
  };

  // Multi-image handlers
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

  // Traceability image upload
  const handleTraceabilityChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setTraceabilityFile({ name: file.name, url: reader.result });
      setPreviewSlideIdx(productImages.length);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors = {};
    if (!productName.trim()) newErrors.productName = "Vui lòng nhập tên sản phẩm.";
    if (!category) {
      newErrors.category = "Vui lòng chọn danh mục.";
    } else if (category === "Khác" && !customCategory.trim()) {
      newErrors.customCategory = "Vui lòng nhập tên danh mục tự chọn.";
    }
    if (!basePrice || isNaN(basePrice) || parseFloat(basePrice) < 0)
      newErrors.basePrice = "Vui lòng nhập giá hợp lệ.";
    if (!stockQty || isNaN(stockQty) || parseInt(stockQty) < 0)
      newErrors.stockQty = "Vui lòng nhập số lượng hợp lệ.";
    if (productImages.length === 0) {
      newErrors.images = "Hình ảnh sản phẩm là bắt buộc. Vui lòng chọn ít nhất một hình ảnh.";
    }
    setErrors(newErrors);

    const isValid = Object.keys(newErrors).length === 0;
    if (!isValid) {
      showToast("Vui lòng nhập đầy đủ thông tin các mục bắt buộc (có dấu *)", "warning");
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        name: productName,
        categoryName: category === "Khác" ? customCategory.trim() : category,
        description: description,
        price: parseFloat(basePrice),
        stockQuantity: parseInt(stockQty),
        unit: selectedUnit,
        status: "pending",
        harvestDate: harvestDate || null,
        expirationDate: expirationDate || null,
        traceabilityImageBase64: traceabilityFile ? traceabilityFile.url : null,
        traceabilityImageName: traceabilityFile ? traceabilityFile.name : null,
        images: productImages.map((img) => img.url),
        perishability: perishability,
        limitDistance: limitDistance ? parseFloat(limitDistance) : null,
      };

      if (isEdit) {
        await productService.updateFarmerProduct(id, payload);
        sessionStorage.setItem("product_success_message", "Cập nhật sản phẩm thành công, đang chờ quản trị viên phê duyệt!");
      } else {
        await productService.createFarmerProduct(payload);
        sessionStorage.setItem("product_success_message", "Thêm sản phẩm thành công và đang chờ phê duyệt!");
      }
      navigate("/farmer/products");
    } catch (err) {
      console.error(err);
      showToast("Đã xảy ra lỗi: " + (err.response?.data || err.message), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        name: productName,
        categoryName: category === "Khác" ? customCategory.trim() : (category || null),
        description: description || "",
        price: basePrice ? parseFloat(basePrice) : 0.0,
        stockQuantity: stockQty ? parseInt(stockQty) : 0,
        unit: selectedUnit,
        status: "draft",
        harvestDate: harvestDate || null,
        expirationDate: expirationDate || null,
        traceabilityImageBase64: traceabilityFile ? traceabilityFile.url : null,
        traceabilityImageName: traceabilityFile ? traceabilityFile.name : null,
        images: productImages.map((img) => img.url),
        perishability: perishability || "khô",
        limitDistance: limitDistance ? parseFloat(limitDistance) : null,
      };

      if (isEdit) {
        await productService.updateFarmerProduct(id, payload);
        sessionStorage.setItem("product_success_message", "Đã cập nhật bản nháp thành công!");
      } else {
        await productService.createFarmerProduct(payload);
        sessionStorage.setItem("product_success_message", "Đã lưu bản nháp thành công!");
      }
      navigate("/farmer/products");
    } catch (err) {
      console.error(err);
      showToast("Đã xảy ra lỗi khi lưu bản nháp: " + (err.response?.data || err.message), "error");
    } finally {
      setLoading(false);
    }
  };

  const displayPrice = basePrice
    ? `${parseInt(basePrice).toLocaleString("vi-VN")} VNĐ`
    : "0 VNĐ";
  const displayName = productName || "Tên sản phẩm xem trước";
  const previewSlides = [
    ...productImages.map((img) => ({ url: img.url, type: "product" })),
    ...(traceabilityFile ? [{ url: traceabilityFile.url, type: "traceability" }] : []),
  ];
  const slideCount = previewSlides.length;
  const safeIdx = slideCount > 0 ? previewSlideIdx % slideCount : 0;

  const prevSlide = () =>
    setPreviewSlideIdx((i) => (i - 1 + Math.max(slideCount, 1)) % Math.max(slideCount, 1));
  const nextSlide = () =>
    setPreviewSlideIdx((i) => (i + 1) % Math.max(slideCount, 1));

  return (
    <div className="ap-page" style={{ padding: "0 4px" }}>
      {/* MAIN CONTENT */}
      <div className="ap-main">
        {/* TOP BAR */}
        <header className="ap-topbar">
          <div className="ap-topbar-left">
            <h1 className="ap-page-title">{isEdit ? "Chỉnh sửa Sản phẩm" : "Tạo Sản phẩm"}</h1>
            <p className="ap-page-subtitle">
              {isEdit ? "Cập nhật các thông số và thuộc tính của sản phẩm hiện tại." : "Thêm sản phẩm nông nghiệp mới vào gian hàng của bạn."}
            </p>
          </div>
          <div className="ap-topbar-actions">
            <button className="ap-btn-draft" onClick={handleSaveDraft} disabled={loading}>
              Lưu nháp
            </button>
            <button className="ap-btn-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <span className="ap-spinner" />
              ) : (
                isEdit ? "Cập nhật sản phẩm" : "Gửi duyệt"
              )}
            </button>
          </div>
        </header>

        {/* BANNER FOR CHANGES REQUESTED OR REJECTED */}
        {isEdit && productStatus === "request_changes" && adminNotes && (
          <div className="ap-changes-banner">
            <div className="ap-changes-banner-icon">⚠️</div>
            <div className="ap-changes-banner-content">
              <strong>Yêu cầu sửa đổi từ Quản trị viên:</strong>
              <p>{adminNotes}</p>
            </div>
          </div>
        )}

        {isEdit && productStatus === "rejected" && rejectionReason && (
          <div className="ap-changes-banner rejected">
            <div className="ap-changes-banner-icon">❌</div>
            <div className="ap-changes-banner-content">
              <strong>Sản phẩm bị từ chối phê duyệt:</strong>
              <p>{rejectionReason}</p>
            </div>
          </div>
        )}

        {isEdit && productStatus === "hidden" && rejectionReason && (
          <div className="ap-changes-banner rejected">
            <div className="ap-changes-banner-icon">🚫</div>
            <div className="ap-changes-banner-content">
              <strong>Sản phẩm bị ẩn khỏi thị trường công khai:</strong>
              <p>{rejectionReason}</p>
            </div>
          </div>
        )}

        {/* FORM + PREVIEW LAYOUT */}
        <div className="ap-content-grid">
          {/* LEFT: FORM */}
          <div className="ap-form-col">
            {/* Product Media - Multi-image */}
            <section className="ap-card">
              <h2 className="ap-card-title">Hình ảnh sản phẩm <span className="ap-required">*</span></h2>
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
                className={`ap-upload-zone ${isDragging ? "ap-upload-dragging" : ""} ${errors.images ? "ap-input-error" : ""}`}
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
              {errors.images && <span className="ap-error-msg" style={{ display: "block", marginTop: "8px" }}>{errors.images}</span>}
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

              {category === "Khác" && (
                <div className="ap-field-group" style={{ marginTop: "12px" }}>
                  <label className="ap-label">
                    Tên danh mục khác <span className="ap-required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`ap-input ${errors.customCategory ? "ap-input-error" : ""}`}
                    placeholder="Nhập tên danh mục tự chọn (ví dụ: Hoa tươi, Nấm...)"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  />
                  {errors.customCategory && <span className="ap-error-msg">{errors.customCategory}</span>}
                </div>
              )}

              <div className="ap-field-group">
                <div className="ap-label-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label className="ap-label" style={{ marginBottom: 0 }}>Mô tả sản phẩm</label>
                  <button
                    type="button"
                    className="ap-btn-ai"
                    onClick={handleAiGenerate}
                    disabled={isAiGenerating}
                  >
                    {isAiGenerating ? (
                      <>
                        <span className="ap-ai-spinner" /> Đang tạo...
                      </>
                    ) : (
                      "✨ AI gợi ý mô tả"
                    )}
                  </button>
                </div>
                <textarea
                  ref={descriptionRef}
                  className="ap-textarea"
                  placeholder="Mô tả hương vị, hình thức và phương pháp canh tác..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  style={{ overflow: "hidden", resize: "none" }}
                />
              </div>
            </section>

            {/* Hạn dùng & Truy xuất nguồn gốc */}
            <section className="ap-card">
              <h2 className="ap-card-title">Hạn dùng & Truy xuất nguồn gốc</h2>
              <p className="ap-card-subtitle">
                Cung cấp thời hạn của nông sản và ảnh chụp tài liệu truy xuất nguồn gốc.
              </p>

              <div className="ap-grid-3col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div className="ap-field-group" style={{ marginBottom: 0 }}>
                  <label className="ap-label">Ngày thu hoạch/đóng gói</label>
                  <input
                    type="date"
                    className="ap-input"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                  />
                </div>

                <div className="ap-field-group" style={{ marginBottom: 0 }}>
                  <label className="ap-label">Hạn sử dụng</label>
                  <input
                    type="date"
                    className="ap-input"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                  />
                </div>

                <div className="ap-field-group" style={{ marginBottom: 0 }}>
                  <label className="ap-label">Độ hư hỏng / Vận chuyển</label>
                  <select
                    className="ap-select"
                    value={perishability}
                    onChange={(e) => handlePerishabilityChange(e.target.value)}
                    style={{ width: "100%", height: "42px", padding: "0 12px", border: "1px solid #d1d5db", borderRadius: "6px" }}
                  >
                    <option value="khô">Khô (Giao toàn quốc)</option>
                    <option value="trung bình">Trung bình (Giao liên tỉnh)</option>
                    <option value="dễ hư">Dễ hư hỏng (Giao nhanh)</option>
                    <option value="rất dễ hư">Rất dễ hư hỏng (Giao nội tỉnh)</option>
                  </select>
                </div>
              </div>

              {/* Limit Distance Input Row */}
              <div className="ap-limit-distance-row" style={{ marginBottom: "16px" }}>
                <div className="ap-field-group">
                  <label className="ap-label">Khoảng cách giới hạn giao hàng (km)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    className="ap-input"
                    style={{ width: "100%" }}
                    placeholder={perishability === "khô" ? "Không giới hạn" : "Ví dụ: 15"}
                    value={limitDistance}
                    onChange={(e) => setLimitDistance(e.target.value)}
                  />
                  <small style={{ color: "#6b7280", marginTop: "4px", display: "block" }}>
                    {perishability === "khô" 
                      ? "Sản phẩm khô không giới hạn khoảng cách giao hàng." 
                      : `Gợi ý mặc định cho độ hư hỏng đã chọn. Bạn có thể tự do điều chỉnh.`}
                  </small>
                </div>
              </div>

              <div className="ap-cert-upload" style={{ borderTop: "1px solid rgba(229, 231, 235, 0.5)", paddingTop: "16px", marginTop: "8px" }}>
                <div className="ap-cert-header" style={{ marginBottom: "10px" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.8" width="16" height="16">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <circle cx="10" cy="13" r="2"/>
                    <path d="M12 15l3 3"/>
                  </svg>
                  <span className="ap-cert-title" style={{ color: "#0284c7" }}>Ảnh thông tin truy xuất nguồn gốc</span>
                </div>

                {traceabilityFile ? (
                  <div className="ap-cert-preview">
                    <img src={traceabilityFile.url} alt="Truy xuất nguồn gốc" className="ap-cert-img" />
                    <div className="ap-cert-info">
                      <span className="ap-cert-name">{traceabilityFile.name}</span>
                      <button className="ap-cert-remove" onClick={() => setTraceabilityFile(null)}>Xóa</button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="ap-cert-zone"
                    onClick={() => traceabilityInputRef.current?.click()}
                    style={{ border: "2px dashed rgba(2, 132, 199, 0.2)" }}
                  >
                    <input
                      type="file"
                      ref={traceabilityInputRef}
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleTraceabilityChange}
                    />
                    <svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.5" width="28" height="28">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <p className="ap-cert-zone-text" style={{ color: "#0284c7" }}>Nhấp để tải ảnh truy xuất lên</p>
                    <p className="ap-cert-zone-hint">JPG, PNG — tối đa 10MB</p>
                  </div>
                )}
              </div>
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
                  <div className="ap-label-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label className="ap-label" style={{ marginBottom: 0 }}>
                      Giá bán <span className="ap-required">*</span>
                    </label>
                    <button
                      type="button"
                      className="ap-btn-ai"
                      onClick={handleAiSuggestPrice}
                      disabled={isAiSuggestingPrice}
                    >
                      {isAiSuggestingPrice ? (
                        <>
                          <span className="ap-ai-spinner" /> Đang gợi ý...
                        </>
                      ) : (
                        "✨ AI gợi ý giá"
                      )}
                    </button>
                  </div>
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

              {/* Image slider */}
              <div className="ap-preview-image-wrap">
                {slideCount > 0 ? (
                  <>
                    <div className="ap-slider-wrap">
                      <img
                        src={previewSlides[safeIdx].url}
                        alt={`Slide ${safeIdx + 1}`}
                        className={`ap-preview-img ${
                          previewSlides[safeIdx].type === "cert" || previewSlides[safeIdx].type === "traceability" ? "ap-preview-cert-img" : ""
                        }`}
                      />
                      {previewSlides[safeIdx].type === "traceability" && (
                        <div className="ap-slide-cert-badge" style={{ backgroundColor: "#0284c7" }}>
                          🔍 Ảnh thông tin truy xuất nguồn gốc
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
                              }`}
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
                <span className="ap-preview-category">{(category === "Khác" ? customCategory : category) || "DANH MỤC"}</span>
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
                    isEdit ? "Cập nhật" : "Đăng sản phẩm"
                  )}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showAiModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal ai-modal" style={{ maxWidth: "600px", width: "90%" }}>
            <div className="custom-modal-header" style={{ borderBottom: "1px solid rgba(16, 185, 129, 0.1)", paddingBottom: "12px", marginBottom: "16px" }}>
              <span className="custom-modal-icon" style={{ fontSize: "22px" }}>✨</span>
              <h3 style={{ fontSize: "18px", color: "#065f46" }}>AI Gợi ý mô tả nông sản</h3>
            </div>
            <div className="ai-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              <p className="ai-modal-intro" style={{ fontSize: "14px", color: "#4b5563" }}>
                AI đã tự động thiết kế nội dung mô tả dựa trên các thông số sản phẩm của bạn. Bạn có thể tự chỉnh sửa nội dung này trực tiếp bên dưới trước khi áp dụng:
              </p>
              <textarea
                className="ai-modal-textarea"
                value={aiGeneratedText}
                onChange={(e) => setAiGeneratedText(e.target.value)}
                rows={12}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14.5px",
                  lineHeight: "1.6",
                  color: "#1f2937",
                  backgroundColor: "#f9fafb",
                  resize: "vertical"
                }}
              />
            </div>
            <div className="custom-modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                type="button"
                className="custom-btn-cancel"
                onClick={() => setShowAiModal(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="custom-btn-confirm"
                style={{ backgroundColor: "#10b981", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}
                onClick={() => {
                  setDescription(aiGeneratedText);
                  setShowAiModal(false);
                  showToast("Đã áp dụng mô tả từ AI!", "success");
                }}
              >
                Áp dụng mô tả
              </button>
            </div>
          </div>
        </div>
      )}

      {showAiPriceModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal ai-modal" style={{ maxWidth: "550px", width: "90%" }}>
            <div className="custom-modal-header" style={{ borderBottom: "1px solid rgba(16, 185, 129, 0.1)", paddingBottom: "12px", marginBottom: "16px" }}>
              <span className="custom-modal-icon" style={{ fontSize: "22px" }}>💰</span>
              <h3 style={{ fontSize: "18px", color: "#065f46" }}>AI Gợi ý giá bán nông sản</h3>
            </div>
            
            <div className="ai-modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
              <p style={{ fontSize: "14px", color: "#4b5563", margin: 0 }}>
                Dựa trên tên sản phẩm, danh mục và trạng thái hữu cơ của bạn, AI đề xuất giá bán sau (đơn vị: <strong>{selectedUnit}</strong>):
              </p>

              <div className="ai-price-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div 
                  className="ai-price-card"
                  onClick={() => {
                    setBasePrice(aiPriceData.minPrice);
                    setShowAiPriceModal(false);
                    showToast("Đã áp dụng giá sàn!", "success");
                  }}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Giá tối thiểu</div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>
                    {aiPriceData.minPrice?.toLocaleString('vi-VN')} đ
                  </div>
                  <span style={{ fontSize: "11px", color: "#9ca3af", display: "block", marginTop: "6px" }}>Bấm để chọn</span>
                </div>

                <div 
                  className="ai-price-card recommended"
                  onClick={() => {
                    setBasePrice(aiPriceData.recommendedPrice);
                    setShowAiPriceModal(false);
                    showToast("Đã áp dụng giá đề xuất!", "success");
                  }}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "2px solid #10b981",
                    backgroundColor: "#ecfdf5",
                    textAlign: "center",
                    cursor: "pointer",
                    position: "relative",
                    transition: "all 0.2s ease"
                  }}
                >
                  <span style={{
                    position: "absolute",
                    top: "-10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#10b981",
                    color: "#fff",
                    fontSize: "9px",
                    padding: "2px 8px",
                    borderRadius: "20px",
                    fontWeight: "600",
                    textTransform: "uppercase"
                  }}>Đề xuất</span>
                  <div style={{ fontSize: "12px", color: "#065f46", marginBottom: "4px", marginTop: "4px" }}>Giá tối ưu</div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#047857" }}>
                    {aiPriceData.recommendedPrice?.toLocaleString('vi-VN')} đ
                  </div>
                  <span style={{ fontSize: "11px", color: "#059669", display: "block", marginTop: "4px", fontWeight: "500" }}>Bấm để chọn</span>
                </div>

                <div 
                  className="ai-price-card"
                  onClick={() => {
                    setBasePrice(aiPriceData.maxPrice);
                    setShowAiPriceModal(false);
                    showToast("Đã áp dụng giá trần!", "success");
                  }}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Giá tối đa</div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>
                    {aiPriceData.maxPrice?.toLocaleString('vi-VN')} đ
                  </div>
                  <span style={{ fontSize: "11px", color: "#9ca3af", display: "block", marginTop: "6px" }}>Bấm để chọn</span>
                </div>
              </div>

              {aiPriceData.explanation && (
                <div style={{ 
                  backgroundColor: "#f3f4f6", 
                  padding: "12px 16px", 
                  borderRadius: "10px", 
                  fontSize: "13.5px", 
                  lineHeight: "1.5", 
                  color: "#4b5563",
                  borderLeft: "4px solid #10b981"
                }}>
                  <strong>💡 Giải thích từ AI:</strong> {aiPriceData.explanation}
                </div>
              )}
            </div>

            <div className="custom-modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                type="button"
                className="custom-btn-cancel"
                onClick={() => setShowAiPriceModal(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="custom-btn-confirm"
                style={{ backgroundColor: "#10b981", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}
                onClick={() => {
                  setBasePrice(aiPriceData.recommendedPrice);
                  setShowAiPriceModal(false);
                  showToast("Đã áp dụng giá tối ưu!", "success");
                }}
              >
                Áp dụng giá tối ưu
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={`custom-toast ${toast.type}`}>
          <span className="custom-toast-icon">
            {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "⚠️"}
          </span>
          <span className="custom-toast-message">{toast.message}</span>
          <button className="custom-toast-close" onClick={() => setToast({ show: false })}>×</button>
        </div>
      )}
    </div>
  );
};

export default AddProduct;

import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import authService from "../../services/authService";
import "./ProductReview.css";
import bunchedCarrots from "../Home/assets/bunched_carrots.png";
import heirloomTomatoes from "../Home/assets/heirloom_tomatoes.png";
import honeycrispApples from "../Home/assets/honeycrisp_apples.png";

/* Mock data dùng tạm khi refresh trang */
const REVIEW_ORDERS_DB = {
    "FH-2024-8892": {
        id: "FH-2024-8892",
        status: "delivered",
        provider: { name: "Nông trại hữu cơ Thung lũng Xanh" },
        items: [
            { productId: 1, name: "Cà rốt hữu cơ", price: 112500, qty: 10, img: bunchedCarrots },
            { productId: 2, name: "Cà chua Heirloom", price: 49900, qty: 15, img: heirloomTomatoes },
            { productId: 3, name: "Táo giòn ngọt", price: 69000, qty: 8, img: honeycrispApples },
        ],
    },
};

const reviewSuggestions = [
    "Sản phẩm tươi",
    "Đóng gói tốt",
    "Giao hàng nhanh",
    "Đúng mô tả",
    "Giá hợp lý",
    "Nhà vườn nhiệt tình",
];

const ratingGroups = [
    { key: "quality", label: "Chất lượng sản phẩm" },
    { key: "freshness", label: "Độ tươi ngon" },
    { key: "packaging", label: "Đóng gói" },
    { key: "delivery", label: "Trải nghiệm giao hàng" },
];

const StarRating = ({ value, onChange, size = "normal" }) => (
    <div className={`star-rating star-${size}`}>
        {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} className={star <= value ? "star-btn active" : "star-btn"} onClick={() => onChange(star)} aria-label={`${star} sao`}>★</button>
        ))}
    </div>
);

const ProductReview = () => {
    const { orderId, itemIndex } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(null);
    const [order, setOrder] = useState(location.state?.order || null);
    const [item, setItem] = useState(location.state?.item || null);
    const [overallRating, setOverallRating] = useState(0);
    const [specificRatings, setSpecificRatings] = useState({ quality: 0, freshness: 0, packaging: 0, delivery: 0 });
    const [selectedTags, setSelectedTags] = useState([]);
    const [reviewText, setReviewText] = useState("");
    const [anonymous, setAnonymous] = useState(false);
    const [photoFiles, setPhotoFiles] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        setUser(authService.getCurrentUser());

        if (location.state?.order && location.state?.item) {
            setOrder(location.state.order);
            setItem(location.state.item);
            return;
        }

        const mockOrder = REVIEW_ORDERS_DB[orderId];
        if (mockOrder) {
            setOrder(mockOrder);
            setItem(mockOrder.items[Number(itemIndex)] || null);
        }
    }, [orderId, itemIndex, location.state]);

    const formatVND = (value) => Number(value || 0).toLocaleString("vi-VN") + " ₫";

    const toggleTag = (tag) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const handleSpecificRatingChange = (key, value) => {
        setSpecificRatings(prev => ({ ...prev, [key]: value }));
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files || []).filter(f => f.size <= 5 * 1024 * 1024);
        setPhotoFiles(files);
        setPhotoPreviews(files.map(f => URL.createObjectURL(f)));
    };

    const removePhoto = (index) => {
        setPhotoFiles(prev => prev.filter((_, i) => i !== index));
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        if (!item) return "Không tìm thấy sản phẩm cần đánh giá.";
        if (overallRating === 0) return "Vui lòng chọn đánh giá tổng quan.";
        if (Object.values(specificRatings).some(v => v === 0)) return "Vui lòng đánh giá đầy đủ các tiêu chí chi tiết.";
        if (reviewText.trim().length < 10) return "Vui lòng nhập nhận xét ít nhất 10 ký tự.";
        return "";
    };

    const handleSubmit = () => {
        const error = validateForm();
        if (error) { setErrorMessage(error); return; }
        // TODO: Backend API submit review
        setSuccessMessage("Gửi đánh giá sản phẩm thành công!");
        setTimeout(() => navigate(`/profile/orders/${orderId}`), 1200);
    };

    if (!order || !item) {
        return (
            <div className="review-empty-page">
                <h2>Không tìm thấy sản phẩm cần đánh giá</h2>
                <p>Vui lòng quay lại chi tiết đơn hàng và chọn lại sản phẩm.</p>
                <Link to={`/profile/orders/${orderId}`} className="review-back-link">Quay lại chi tiết đơn hàng</Link>
            </div>
        );
    }

    if (order.status !== "delivered") {
        return (
            <div className="review-empty-page">
                <h2>Chỉ có thể đánh giá đơn hàng đã giao</h2>
                <p>Sản phẩm này chưa đủ điều kiện để đánh giá.</p>
                <Link to={`/profile/orders/${orderId}`} className="review-back-link">Quay lại chi tiết đơn hàng</Link>
            </div>
        );
    }

    return (
        <div className="product-review-page">
            <header className="review-header">
                <button className="review-back-btn" onClick={() => navigate(`/profile/orders/${orderId}`)}>←</button>
                <div className="review-logo" onClick={() => navigate("/")}>🚜 AgriMarket</div>
                <Link to="/help" className="review-help-link">Trợ giúp</Link>
            </header>

            {successMessage && <div className="review-toast success">{successMessage}</div>}

            <main className="review-main">
                <section className="review-left-panel">
                    <h1>Đánh giá sản phẩm</h1>
                    <div className="review-product-card">
                        <div className="review-product-image">
                            {item.img ? <img src={item.img} alt={item.name} /> : <div className="review-no-image">Ảnh sản phẩm</div>}
                        </div>
                        <div className="review-product-info">
                            <span className="review-farm-name">{item.farmer || order?.provider?.name}</span>
                            <h2>{item.name}</h2>
                            <p>Đơn hàng #{orderId}</p>
                            <p>Số lượng: {item.qty}</p>
                            <strong>{formatVND(item.price)}</strong>
                        </div>
                    </div>
                    <div className="review-note-box">
                        <span>ⓘ</span>
                        <p>Đánh giá của bạn giúp nhà vườn cải thiện chất lượng sản phẩm và giúp khách khác chọn lựa tốt hơn.</p>
                    </div>
                </section>

                <section className="review-form-card">
                    <div className="overall-rating-block">
                        <h2>Đánh giá tổng quan</h2>
                        <p>Bạn cảm thấy thế nào về sản phẩm này?</p>
                        <StarRating value={overallRating} onChange={setOverallRating} size="large" />
                    </div>

                    <div className="review-divider" />

                    <div className="specific-rating-block">
                        <h3>Đánh giá chi tiết</h3>
                        <div className="specific-rating-grid">
                            {ratingGroups.map(group => (
                                <div key={group.key} className="specific-rating-item">
                                    <span>{group.label}</span>
                                    <StarRating value={specificRatings[group.key]} onChange={(v) => handleSpecificRatingChange(group.key, v)} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="written-review-block">
                        <h3>Nhận xét của bạn</h3>
                        <p>Bạn thích điều gì ở sản phẩm này? Sản phẩm có đúng mô tả không?</p>
                        <div className="review-tags">
                            {reviewSuggestions.map(tag => (
                                <button key={tag} className={`review-tag ${selectedTags.includes(tag) ? "active" : ""}`} onClick={() => toggleTag(tag)}>{tag}</button>
                            ))}
                        </div>
                        <textarea className="review-textarea" placeholder="Chia sẻ trải nghiệm..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} maxLength={1000} />
                        <div className="review-char-count">{reviewText.length}/1000 ký tự</div>
                    </div>

                    <div className="photo-upload-block">
                        <h3>Thêm hình ảnh</h3>
                        <p>Tối đa 5 ảnh. Định dạng JPG, PNG, WEBP.</p>
                        <label className="photo-upload-box">
                            <input type="file" accept="image/*" multiple onChange={handlePhotoChange} />
                            <span className="upload-icon">📷</span>
                            <strong>Bấm để tải ảnh lên</strong>
                            <small>hoặc kéo thả ảnh vào đây</small>
                        </label>
                        {photoPreviews.length > 0 && (
                            <div className="photo-preview-grid">
                                {photoPreviews.map((src, i) => (
                                    <div key={i} className="photo-preview-item">
                                        <img src={src} alt={`Ảnh ${i + 1}`} />
                                        <button type="button" onClick={() => removePhoto(i)}>×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <label className="anonymous-check">
                        <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
                        <span>Đánh giá ẩn danh</span>
                    </label>

                    {errorMessage && <div className="review-error">{errorMessage}</div>}

                    <div className="review-actions">
                        <button className="review-cancel-btn" onClick={() => navigate(`/profile/orders/${orderId}`)}>Hủy</button>
                        <button className="review-submit-btn" onClick={handleSubmit}>Gửi đánh giá →</button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ProductReview;
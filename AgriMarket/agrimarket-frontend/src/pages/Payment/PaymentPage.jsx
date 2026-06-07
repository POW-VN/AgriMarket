import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import Footer from "../../components/common/Footer/Footer";
import "./PaymentPage.css";

const INITIAL_ORDERS = [
    {
        id: "FH-2024-8892",
        status: "delivered",
        statusLabel: "Đã giao",
        date: "12 thg 10, 2024",
        time: "10:24 SA",
        amount: 3562500,
        itemCount: 6,
        provider: {
            name: "Nông trại hữu cơ Thung lũng Xanh",
            avatarText: "TX",
            avatarBg: "#1b5e20",
        },
        thumbnails: [
            "https://images.unsplash.com/photo-1445280471656-618bf9abcfe0?w=200",
            "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200",
            "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200"
        ],
        hasMoreItems: 3,
    },
    {
        id: "FH-2024-9104",
        status: "shipping",
        statusLabel: "Đang vận chuyển",
        date: "14 thg 10, 2024",
        time: "03:15 CH",
        amount: 2150000,
        itemCount: 2,
        provider: {
            name: "Nhà máy bơ sữa thủ công Hillside",
            avatarText: "HS",
            avatarBg: "#0d47a1",
        },
        thumbnails: [
            "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200",
            "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200"
        ],
        hasMoreItems: 0,
    },
    {
        id: "FH-2024-7721",
        status: "cancelled",
        statusLabel: "Đã hủy",
        date: "05 thg 10, 2024",
        time: "09:12 SA",
        amount: 1127500,
        itemCount: 3,
        provider: {
            name: "Hợp tác xã Vườn Nắng",
            avatarText: "VN",
            avatarBg: "#e65100",
        },
        thumbnails: ["https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200"],
        hasMoreItems: 2,
    },
    {
        id: "FH-2026-1011",
        status: "pending",
        statusLabel: "Chờ xử lý",
        date: "06 thg 06, 2026",
        time: "16:30 CH",
        amount: 250000,
        itemCount: 1,
        provider: {
            name: "Nông trại hữu cơ Sông Hồng",
            avatarText: "SH",
            avatarBg: "#004d40",
        },
        thumbnails: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200"],
        hasMoreItems: 0,
    },
    {
        id: "FH-2026-1012",
        status: "confirmed",
        statusLabel: "Đã xác nhận",
        date: "05 thg 06, 2026",
        time: "08:20 SA",
        amount: 1200000,
        itemCount: 4,
        provider: {
            name: "Vườn Cây Trái Miền Tây",
            avatarText: "MT",
            avatarBg: "#3e2723",
        },
        thumbnails: [
            "https://images.unsplash.com/photo-1553279768-865429fa0078?w=200",
            "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200"
        ],
        hasMoreItems: 2,
    },
    {
        id: "FH-2026-1013",
        status: "preparing",
        statusLabel: "Đang chuẩn bị",
        date: "04 thg 06, 2026",
        time: "14:15 CH",
        amount: 640000,
        itemCount: 3,
        provider: {
            name: "Đà Lạt Eco Farm",
            avatarText: "DL",
            avatarBg: "#33691e",
        },
        thumbnails: [
            "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200",
            "https://images.unsplash.com/photo-1445280471656-618bf9abcfe0?w=200"
        ],
        hasMoreItems: 1,
    }
];

export default function PaymentPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    // Checkout data from localStorage
    const [checkoutData, setCheckoutData] = useState(null);

    // Form inputs
    const [recipientName, setRecipientName] = useState("");
    const [recipientPhone, setRecipientPhone] = useState("");
    const [recipientAddress, setRecipientAddress] = useState("");
    const [shippingNote, setShippingNote] = useState("");

    // Payment method
    const [paymentMethod, setPaymentMethod] = useState("cod"); // cod, bank, card

    // Card inputs
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [cardHolder, setCardHolder] = useState("");

    // Form Validation errors
    const [errors, setErrors] = useState({});

    // Success State
    const [isSuccess, setIsSuccess] = useState(false);
    const [placedOrder, setPlacedOrder] = useState(null);

    // Generate static order ID on component load for QR and tracking
    const orderId = useMemo(() => {
        return "FH-2026-" + Math.floor(1000 + Math.random() * 9000);
    }, []);

    // Format VND
    const formatVND = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price) + " đ";
    };

    useEffect(() => {
        // Load user session
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
            setRecipientName(currentUser.fullName || "");
        }

        // Load checkout data
        const data = localStorage.getItem("agrimarket_checkout");
        if (data) {
            setCheckoutData(JSON.parse(data));
        }
    }, []);

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        navigate("/");
    };

    const handleCardNumberChange = (e) => {
        // Format as XXXX XXXX XXXX XXXX
        let value = e.target.value.replace(/\D/g, "").slice(0, 16);
        let formatted = value.match(/.{1,4}/g)?.join(" ") || value;
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e) => {
        // Format as MM/YY
        let value = e.target.value.replace(/\D/g, "").slice(0, 4);
        if (value.length > 2) {
            value = value.slice(0, 2) + "/" + value.slice(2);
        }
        setCardExpiry(value);
    };

    const validateForm = () => {
        const formErrors = {};
        if (!recipientName.trim()) formErrors.recipientName = "Vui lòng nhập họ và tên";
        if (!recipientPhone.trim()) {
            formErrors.recipientPhone = "Vui lòng nhập số điện thoại";
        } else if (!/^(0[123456789])([0-9]{8})$/.test(recipientPhone.trim().replace(/\s+/g, ""))) {
            formErrors.recipientPhone = "Số điện thoại không đúng định dạng (ví dụ: 0901234567)";
        }
        if (!recipientAddress.trim()) formErrors.recipientAddress = "Vui lòng nhập địa chỉ giao hàng";

        if (paymentMethod === "card") {
            if (!cardNumber.trim() || cardNumber.replace(/\s/g, "").length < 16) {
                formErrors.cardNumber = "Mã số thẻ phải đủ 16 số";
            }
            if (!cardExpiry.trim() || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
                formErrors.cardExpiry = "Định dạng HSD thẻ là MM/YY";
            }
            if (!cardCvv.trim() || cardCvv.length < 3) {
                formErrors.cardCvv = "Mã CVV phải gồm 3 chữ số";
            }
            if (!cardHolder.trim()) formErrors.cardHolder = "Vui lòng nhập tên chủ thẻ";
        }

        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const handlePlaceOrder = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            // Scroll to the first error
            const firstErrorKey = Object.keys(errors)[0];
            const errorElement = document.getElementsByName(firstErrorKey)[0];
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }

        const now = new Date();
        const formattedDate = `${now.getDate()} thg ${now.getMonth() + 1}, ${now.getFullYear()}`;
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'CH' : 'SA';
        const displayHours = hours % 12 || 12;
        const formattedTime = `${displayHours}:${minutes} ${ampm}`;

        const subtotal = checkoutData.subtotal;
        const shippingFee = checkoutData.shippingFee;
        const serviceFee = checkoutData.serviceFee;
        const discountAmount = checkoutData.discountAmount;
        const totalAmount = checkoutData.totalAmount;
        const selectedItems = checkoutData.selectedItems;

        const newOrder = {
            id: orderId,
            status: "pending",
            statusLabel: "Chờ xử lý",
            date: formattedDate,
            time: formattedTime,
            subtotal: subtotal,
            shippingFee: shippingFee,
            serviceFee: serviceFee,
            discount: discountAmount,
            amount: totalAmount,
            recipient: recipientName,
            address: recipientAddress,
            phone: recipientPhone,
            trackingNumber: `FH-TRACK-${Math.floor(100000 + Math.random() * 900000)}`,
            cardEnding: paymentMethod === "card" ? cardNumber.slice(-4) : null,
            paymentMethod: paymentMethod === "cod" ? "COD" : paymentMethod === "bank" ? "Chuyển khoản" : "Thẻ Visa",
            provider: {
                name: selectedItems[0]?.farmer || "Hợp tác xã Nông nghiệp số",
                location: "Cái Bè, Tiền Giang",
                estYear: 2018,
                avatarText: selectedItems[0]?.name ? selectedItems[0].name.charAt(0).toUpperCase() : "AG",
                avatarBg: "#1b5e20",
            },
            items: selectedItems.map(item => ({
                name: item.name,
                farmer: item.farmer || "Nhà vườn địa phương",
                price: item.price,
                qty: item.quantity,
                img: item.imageUrl
            })),
            thumbnails: selectedItems.slice(0, 3).map(item => item.imageUrl),
            itemCount: selectedItems.reduce((sum, item) => sum + item.quantity, 0),
            hasMoreItems: selectedItems.length > 3 ? selectedItems.length - 3 : 0
        };

        // Write to local storage under orders database
        const stored = localStorage.getItem("agrimarket_orders");
        const existingOrders = stored ? JSON.parse(stored) : INITIAL_ORDERS;
        const updatedOrders = [newOrder, ...existingOrders];
        localStorage.setItem("agrimarket_orders", JSON.stringify(updatedOrders));

        // Do not clear products from cart after payment as per user's request

        // Clear checkout data
        localStorage.removeItem("agrimarket_checkout");

        // Keep order reference for confirmation screen
        setPlacedOrder(newOrder);
        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Calculate sum items count
    const totalCartItems = useMemo(() => {
        const savedCart = JSON.parse(localStorage.getItem("agrimarket_cart")) || [];
        return savedCart.reduce((sum, item) => sum + item.quantity, 0);
    }, [isSuccess]);

    // VietQR code dynamic image link
    const bankTransferQRUrl = useMemo(() => {
        if (!checkoutData) return "";
        const amount = checkoutData.totalAmount;
        const description = `AGRIMARKET ${orderId}`;
        const accountName = "CONG TY CO PHAN AGRIMARKET";
        return `https://img.vietqr.io/image/mbbank-1900123456789-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;
    }, [checkoutData, orderId]);

    // Render loading or empty state
    if (!checkoutData && !isSuccess) {
        return (
            <div className="payment-page-wrapper">
                <header className="home-header">
                    <div className="header-container">
                        <div className="header-logo" onClick={() => navigate("/")}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-tractor">
                                <circle cx="7" cy="18" r="2"></circle>
                                <circle cx="18" cy="18" r="2"></circle>
                                <path d="M7 16h11v-2H9v-3h7V9H9V6H7v10z"></path>
                                <path d="M16 9h3l2 3v4"></path>
                            </svg>
                            <span className="logo-text">AgriMarket</span>
                        </div>
                        <nav className="header-nav">
                            <Link to="/" className="nav-link">Trang chủ</Link>
                            <Link to="/products" className="nav-link">Cửa hàng</Link>
                            <Link to="/farms" className="nav-link">Nông trại</Link>
                            <Link to="/about" className="nav-link">Giới thiệu</Link>
                        </nav>
                        <div className="header-actions">
                            <button className="icon-btn" aria-label="Giỏ hàng" onClick={() => navigate("/cart")}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="payment-main-container empty-checkout-container">
                    <div className="empty-checkout-card">
                        <div className="empty-checkout-icon">💳</div>
                        <h2>Thông tin thanh toán trống</h2>
                        <p>Không tìm thấy sản phẩm nào được thiết lập thanh toán. Vui lòng chọn sản phẩm và thanh toán từ giỏ hàng.</p>
                        <button className="btn-back-to-cart" onClick={() => navigate("/cart")}>
                            ← Quay lại giỏ hàng
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="payment-page-wrapper">
            {/* ── HEADER ── */}
            <header className="home-header">
                <div className="header-container">
                    <div className="header-logo" onClick={() => navigate("/")}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="logo-tractor"
                        >
                            <circle cx="7" cy="18" r="2"></circle>
                            <circle cx="18" cy="18" r="2"></circle>
                            <path d="M7 16h11v-2H9v-3h7V9H9V6H7v10z"></path>
                            <path d="M16 9h3l2 3v4"></path>
                        </svg>
                        <span className="logo-text">AgriMarket</span>
                    </div>

                    <nav className="header-nav">
                        <Link to="/" className="nav-link">Trang chủ</Link>
                        <Link to="/products" className="nav-link">Cửa hàng</Link>
                        <Link to="/farms" className="nav-link">Nông trại</Link>
                        <Link to="/about" className="nav-link">Giới thiệu</Link>
                    </nav>

                    <div className="header-actions">
                        {/* Search Icon */}
                        <button className="icon-btn" aria-label="Tìm kiếm">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>

                        {/* Cart Icon */}
                        {(!user || user.role !== "farmer") && (
                            <button className="icon-btn" aria-label="Giỏ hàng" onClick={() => navigate("/cart")}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                                {totalCartItems > 0 && (
                                    <span className="cart-badge">{totalCartItems}</span>
                                )}
                            </button>
                        )}

                        {/* Profile Dropdown */}
                        {user ? (
                            <div className="auth-profile-container" style={{ position: "relative" }}>
                                <div
                                    className="profile-indicator"
                                    onClick={() => setShowProfileDropdown(v => !v)}
                                    title="Tùy chọn tài khoản"
                                >
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt={user.fullName} className="avatar-img" />
                                    ) : (
                                        <div className="avatar-fallback">
                                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                                        </div>
                                    )}
                                    <span className="profile-name">{user.fullName}</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12" style={{ marginLeft: "4px" }}>
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>

                                {showProfileDropdown && (
                                    <div className="header-dropdown-menu">
                                        <button onClick={() => { navigate("/profile"); setShowProfileDropdown(false); }}>Hồ sơ của tôi</button>
                                        <button onClick={() => { navigate("/profile/orders"); setShowProfileDropdown(false); }}>Lịch sử đơn hàng</button>
                                        <button onClick={() => { navigate("/security"); setShowProfileDropdown(false); }}>Bảo mật</button>
                                        <hr />
                                        <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button className="btn-auth btn-login" onClick={() => navigate("/login")}>
                                Đăng nhập
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="payment-main-container">
                {/* Step Indicator */}
                <div className="payment-step-indicator">
                    <div className="step-node active">
                        <span className="node-num">1</span>
                        <span className="node-label">Giỏ hàng</span>
                    </div>

                    <div className="step-connector active"></div>

                    <div className={`step-node ${!isSuccess ? "active" : ""}`}>
                        <span className="node-num">2</span>
                        <span className="node-label">Nhận hàng & Thanh toán</span>
                    </div>

                    <div className={`step-connector ${isSuccess ? "active" : ""}`}></div>

                    <div className={`step-node ${isSuccess ? "active" : ""}`}>
                        <span className="node-num">3</span>
                        <span className="node-label">Hoàn tất</span>
                    </div>
                </div>

                {/* ── SUCCESS VIEW ── */}
                {isSuccess && placedOrder ? (
                    <section className="payment-success-card">
                        <div className="success-icon-wrapper">
                            <div className="success-checkmark-ring"></div>
                            <div className="success-checkmark-line">✓</div>
                        </div>

                        <h2>Đặt hàng thành công!</h2>
                        <p className="success-desc-text">
                            Cảm ơn bạn đã mua hàng tại AgriMarket. Đơn hàng của bạn đang được chuyển đến nhà vườn để xử lý.
                        </p>

                        <div className="success-order-details-box">
                            <div className="receipt-header">
                                <h3>HÓA ĐƠN ĐƠN HÀNG</h3>
                                <span className="receipt-id">MÃ ĐƠN: #{placedOrder.id}</span>
                            </div>

                            <div className="receipt-body">
                                <div className="receipt-row">
                                    <span>Thời gian đặt</span>
                                    <span>{placedOrder.date} lúc {placedOrder.time}</span>
                                </div>
                                <div className="receipt-row">
                                    <span>Người nhận</span>
                                    <span>{placedOrder.recipient}</span>
                                </div>
                                <div className="receipt-row">
                                    <span>Số điện thoại</span>
                                    <span>{placedOrder.phone}</span>
                                </div>
                                <div className="receipt-row">
                                    <span>Địa chỉ giao</span>
                                    <span className="receipt-address-txt">{placedOrder.address}</span>
                                </div>
                                <div className="receipt-row">
                                    <span>Phương thức</span>
                                    <span>{placedOrder.paymentMethod}</span>
                                </div>
                                <div className="receipt-row">
                                    <span>Mã vận đơn</span>
                                    <span>{placedOrder.trackingNumber}</span>
                                </div>

                                <hr className="receipt-divider" />

                                <div className="receipt-products">
                                    <h4>Sản phẩm đã mua ({placedOrder.items.length})</h4>
                                    {placedOrder.items.map((item, idx) => (
                                        <div className="receipt-product-row" key={idx}>
                                            <span className="receipt-prod-name">{item.name} <strong className="receipt-prod-qty">x{item.qty}</strong></span>
                                            <span>{formatVND(item.price * item.qty)}</span>
                                        </div>
                                    ))}
                                </div>

                                <hr className="receipt-divider" />

                                <div className="receipt-row receipt-total">
                                    <span>Tổng thanh toán</span>
                                    <span>{formatVND(placedOrder.amount)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="success-actions">
                            <button className="btn-success-orders" onClick={() => navigate("/profile/orders")}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" style={{ marginRight: "8px" }}>
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                                Xem đơn hàng của tôi
                            </button>
                            <button className="btn-success-home" onClick={() => navigate("/")}>
                                Tiếp tục mua sắm →
                            </button>
                        </div>
                    </section>
                ) : (
                    /* ── CHECKOUT FLOW VIEW ── */
                    <form className="payment-checkout-grid" onSubmit={handlePlaceOrder}>
                        {/* LEFT COLUMN: Shipping & Payment Options */}
                        <div className="payment-left-column">
                            {/* Card 1: Delivery Details */}
                            <div className="payment-form-card">
                                <h3>1. Thông tin giao hàng</h3>
                                <p className="form-card-subtitle">Vui lòng nhập địa chỉ nhận hàng chính xác để chúng tôi giao sản phẩm tươi ngon nhất.</p>

                                <div className="form-group-row">
                                    <div className="form-group">
                                        <label htmlFor="recipientName">Họ và tên người nhận <span className="req-star">*</span></label>
                                        <input
                                            type="text"
                                            id="recipientName"
                                            name="recipientName"
                                            value={recipientName}
                                            onChange={(e) => setRecipientName(e.target.value)}
                                            placeholder="Nguyễn Văn A"
                                            className={errors.recipientName ? "input-err" : ""}
                                        />
                                        {errors.recipientName && <span className="error-hint-text">{errors.recipientName}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="recipientPhone">Số điện thoại liên hệ <span className="req-star">*</span></label>
                                        <input
                                            type="text"
                                            id="recipientPhone"
                                            name="recipientPhone"
                                            value={recipientPhone}
                                            onChange={(e) => setRecipientPhone(e.target.value)}
                                            placeholder="09XXXXXXXX"
                                            className={errors.recipientPhone ? "input-err" : ""}
                                        />
                                        {errors.recipientPhone && <span className="error-hint-text">{errors.recipientPhone}</span>}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="recipientAddress">Địa chỉ nhận hàng chi tiết <span className="req-star">*</span></label>
                                    <input
                                        type="text"
                                        id="recipientAddress"
                                        name="recipientAddress"
                                        value={recipientAddress}
                                        onChange={(e) => setRecipientAddress(e.target.value)}
                                        placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
                                        className={errors.recipientAddress ? "input-err" : ""}
                                    />
                                    {errors.recipientAddress && <span className="error-hint-text">{errors.recipientAddress}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="shippingNote">Ghi chú giao hàng (Không bắt buộc)</label>
                                    <textarea
                                        id="shippingNote"
                                        name="shippingNote"
                                        value={shippingNote}
                                        onChange={(e) => setShippingNote(e.target.value)}
                                        placeholder="Ví dụ: Giao ngoài giờ hành chính, gọi điện trước khi giao..."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Card 2: Payment Methods */}
                            <div className="payment-form-card">
                                <h3>2. Phương thức thanh toán</h3>
                                <p className="form-card-subtitle">Lựa chọn một trong các phương thức thanh toán an toàn dưới đây.</p>

                                <div className="payment-methods-selector">
                                    <label className={`method-option-card ${paymentMethod === "cod" ? "selected" : ""}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={paymentMethod === "cod"}
                                            onChange={() => setPaymentMethod("cod")}
                                        />
                                        <div className="method-option-info">
                                            <span className="method-icon">💵</span>
                                            <div className="method-text">
                                                <span className="method-title">Thanh toán khi nhận hàng (COD)</span>
                                                <span className="method-desc">Thanh toán bằng tiền mặt cho shipper khi nhận được hàng.</span>
                                            </div>
                                        </div>
                                    </label>

                                    <label className={`method-option-card ${paymentMethod === "bank" ? "selected" : ""}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="bank"
                                            checked={paymentMethod === "bank"}
                                            onChange={() => setPaymentMethod("bank")}
                                        />
                                        <div className="method-option-info">
                                            <span className="method-icon">🏦</span>
                                            <div className="method-text">
                                                <span className="method-title">Chuyển khoản Ngân hàng (VietQR)</span>
                                                <span className="method-desc">Quét mã QR để chuyển khoản nhanh 24/7 không cần nhập thông tin.</span>
                                            </div>
                                        </div>
                                    </label>

                                    <label className={`method-option-card ${paymentMethod === "card" ? "selected" : ""}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="card"
                                            checked={paymentMethod === "card"}
                                            onChange={() => setPaymentMethod("card")}
                                        />
                                        <div className="method-option-info">
                                            <span className="method-icon">💳</span>
                                            <div className="method-text">
                                                <span className="method-title">Thẻ tín dụng / Thẻ ghi nợ (Visa/Mastercard)</span>
                                                <span className="method-desc">Hỗ trợ các thẻ nội địa và quốc tế an toàn tuyệt đối.</span>
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                {/* Dynamic Details according to selection */}
                                {paymentMethod === "cod" && (
                                    <div className="method-detail-box cod-box">
                                        <p>📦 Bạn sẽ thanh toán tổng số tiền là <strong>{formatVND(checkoutData.totalAmount)}</strong> cho nhân viên giao hàng khi đơn hàng được giao đến. Vui lòng chuẩn bị sẵn số tiền mặt để thuận tiện giao dịch.</p>
                                    </div>
                                )}

                                {paymentMethod === "bank" && (
                                    <div className="method-detail-box bank-box">
                                        <h4>Thông tin chuyển khoản nhanh qua VietQR</h4>
                                        <p className="bank-info-note">Mở ứng dụng Mobile Banking của ngân hàng bạn dùng, chọn quét mã QR dưới đây:</p>

                                        <div className="qr-flex-container">
                                            <div className="qr-wrapper">
                                                <img src={bankTransferQRUrl} alt="VietQR bank transfer code" className="vietqr-img" />
                                                <span className="qr-subtext">Quét mã QR để thanh toán</span>
                                            </div>

                                            <div className="bank-text-details">
                                                <div className="bank-detail-row">
                                                    <span>Ngân hàng</span>
                                                    <strong>MB Bank (Ngân hàng Quân đội)</strong>
                                                </div>
                                                <div className="bank-detail-row">
                                                    <span>Số tài khoản</span>
                                                    <strong className="copyable-field">1900123456789</strong>
                                                </div>
                                                <div className="bank-detail-row">
                                                    <span>Tên tài khoản</span>
                                                    <strong>CONG TY CO PHAN AGRIMARKET</strong>
                                                </div>
                                                <div className="bank-detail-row">
                                                    <span>Số tiền</span>
                                                    <strong className="text-green-amount">{formatVND(checkoutData.totalAmount)}</strong>
                                                </div>
                                                <div className="bank-detail-row">
                                                    <span>Nội dung CK</span>
                                                    <strong className="copyable-field text-memo">AGRIMARKET {orderId}</strong>
                                                </div>
                                                <p className="payment-warning-text">⚠️ Chuyển đúng số tiền và nội dung chuyển khoản để hệ thống tự động xác nhận sau 1-3 phút.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === "card" && (
                                    <div className="method-detail-box card-box-form">
                                        <h4>Nhập thông tin thẻ thanh toán</h4>
                                        <div className="credit-card-inputs">
                                            <div className="form-group">
                                                <label htmlFor="cardNumber">Mã số thẻ (16 chữ số)</label>
                                                <input
                                                    type="text"
                                                    id="cardNumber"
                                                    name="cardNumber"
                                                    value={cardNumber}
                                                    onChange={handleCardNumberChange}
                                                    placeholder="4123 4567 8901 2345"
                                                    className={errors.cardNumber ? "input-err" : ""}
                                                />
                                                {errors.cardNumber && <span className="error-hint-text">{errors.cardNumber}</span>}
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="cardHolder">Họ và tên chủ thẻ (In nổi trên thẻ)</label>
                                                <input
                                                    type="text"
                                                    id="cardHolder"
                                                    name="cardHolder"
                                                    value={cardHolder}
                                                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                                                    placeholder="NGUYEN VAN A"
                                                    className={errors.cardHolder ? "input-err" : ""}
                                                />
                                                {errors.cardHolder && <span className="error-hint-text">{errors.cardHolder}</span>}
                                            </div>

                                            <div className="form-group-row">
                                                <div className="form-group">
                                                    <label htmlFor="cardExpiry">Hạn sử dụng (Tháng/Năm)</label>
                                                    <input
                                                        type="text"
                                                        id="cardExpiry"
                                                        name="cardExpiry"
                                                        value={cardExpiry}
                                                        onChange={handleExpiryChange}
                                                        placeholder="MM/YY"
                                                        className={errors.cardExpiry ? "input-err" : ""}
                                                    />
                                                    {errors.cardExpiry && <span className="error-hint-text">{errors.cardExpiry}</span>}
                                                </div>

                                                <div className="form-group">
                                                    <label htmlFor="cardCvv">Mã CVV (3 chữ số ở mặt sau)</label>
                                                    <input
                                                        type="password"
                                                        id="cardCvv"
                                                        name="cardCvv"
                                                        value={cardCvv}
                                                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                                                        placeholder="***"
                                                        className={errors.cardCvv ? "input-err" : ""}
                                                    />
                                                    {errors.cardCvv && <span className="error-hint-text">{errors.cardCvv}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Order Summary & Placement */}
                        <div className="payment-right-column">
                            <div className="checkout-summary-card">
                                <h4>Thông tin đơn hàng</h4>

                                <div className="checkout-items-list">
                                    {checkoutData.selectedItems.map((item, index) => (
                                        <div className="checkout-item-row" key={index}>
                                            <div className="checkout-item-image">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.name} />
                                                ) : (
                                                    <div className="checkout-item-fallback">🌾</div>
                                                )}
                                            </div>
                                            <div className="checkout-item-details">
                                                <span className="checkout-item-title" title={item.name}>{item.name}</span>
                                                <span className="checkout-item-sub">Số lượng: {item.quantity} {item.unit || "kg"}</span>
                                            </div>
                                            <span className="checkout-item-price">{formatVND(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="summary-details">
                                    <div className="summary-row">
                                        <span>Tạm tính</span>
                                        <span>{formatVND(checkoutData.subtotal)}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Phí dịch vụ</span>
                                        <span>{formatVND(checkoutData.serviceFee)}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Phí vận chuyển</span>
                                        <span className={checkoutData.shippingFee === 0 ? "free-txt" : ""}>
                                            {checkoutData.shippingFee === 0 ? "Miễn phí" : formatVND(checkoutData.shippingFee)}
                                        </span>
                                    </div>
                                    <hr className="summary-divider" />
                                    <div className="summary-row total-row">
                                        <span>Tổng thanh toán</span>
                                        <span className="grand-total-val">{formatVND(checkoutData.totalAmount)}</span>
                                    </div>
                                </div>

                                <button type="submit" className="btn-confirm-order">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" style={{ marginRight: "8px" }}>
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Xác nhận đặt hàng
                                </button>

                                <button type="button" className="btn-return-to-cart" onClick={() => navigate("/cart")}>
                                    Quay lại giỏ hàng
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </main>
            <Footer />
        </div>
    );
}

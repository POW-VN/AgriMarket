import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import cartService from "../../services/cartService";
import profileService from "../../services/profileService";
import * as addressService from "../../services/addressService";
import { buildProfileUpdatePayload } from "../../utils/profileMapper";
import orderService from "../../services/orderService";
import Footer from "../../components/common/Footer/Footer";
import "./CheckoutPage.css";

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
    }
];

export default function CheckoutPage() {
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

    // Address selection states
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [addrProvince, setAddrProvince] = useState({ code: "", name: "" });
    const [addrDistrict, setAddrDistrict] = useState({ code: "", name: "" });
    const [addrWard, setAddrWard] = useState({ code: "", name: "" });
    const [addrStreet, setAddrStreet] = useState("");
    const [profileData, setProfileData] = useState(null);

    // Payment method
    const [paymentMethod, setPaymentMethod] = useState("cod"); // cod, bank, card

    // Form Validation errors
    const [errors, setErrors] = useState({});

    // Success State (Used for COD)
    const [isSuccess, setIsSuccess] = useState(false);
    const [placedOrder, setPlacedOrder] = useState(null);
    const [cartItemsCount, setCartItemsCount] = useState(0);

    // Generate static order ID on component load for tracking
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

        // Load cart count
        const fetchCartCount = async () => {
            if (currentUser) {
                try {
                    const cart = await cartService.getCart();
                    setCartItemsCount(cart.length);
                } catch (err) {
                    console.error("Lỗi khi load giỏ hàng:", err);
                    loadLocalCartCount();
                }
            } else {
                loadLocalCartCount();
            }
        };

        const loadLocalCartCount = () => {
            const savedCart = JSON.parse(localStorage.getItem("agrimarket_cart")) || [];
            setCartItemsCount(savedCart.length);
        };

        fetchCartCount();
    }, [isSuccess]);

    // Load provinces on mount
    useEffect(() => {
        const initProvinces = async () => {
            const provs = await addressService.getProvinces();
            setProvinces(provs);
        };
        initProvinces();
    }, []);

    // Load user profile and parse address on mount or when provinces loaded
    useEffect(() => {
        const loadProfileAndAddress = async () => {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) return;

            try {
                const profile = await profileService.getCurrentProfile();
                if (profile) {
                    setProfileData(profile);
                    setRecipientName(profile.fullName || "");
                    setRecipientPhone(profile.phone || "");

                    const rawAddress = profile.role === "farmer" 
                      ? (profile.farmAddress || "") 
                      : (profile.addresses?.[0]?.address || "");

                    if (rawAddress && provinces.length > 0) {
                        const parsed = addressService.parseAddress(rawAddress);
                        
                        if (!parsed.province) {
                            setAddrStreet(rawAddress);
                            return;
                        }

                        setAddrStreet(parsed.street || "");

                        // Find province
                        const normProv = addressService.normalizeName(parsed.province);
                        const provinceMatch = provinces.find(
                            (p) => addressService.normalizeName(p.name) === normProv
                        );

                        if (provinceMatch) {
                            const provCode = provinceMatch.code;
                            setAddrProvince({ code: provCode, name: provinceMatch.name });

                            // Load districts
                            const dists = await addressService.getDistricts(provCode);
                            setDistricts(dists);

                            // Find district
                            const normDist = addressService.normalizeName(parsed.district);
                            const districtMatch = dists.find(
                                (d) => addressService.normalizeName(d.name) === normDist
                            );

                            if (districtMatch) {
                                const distCode = districtMatch.code;
                                setAddrDistrict({ code: distCode, name: districtMatch.name });

                                // Load wards
                                const wds = await addressService.getWards(distCode);
                                setWards(wds);

                                // Find ward
                                const normWard = addressService.normalizeName(parsed.ward);
                                const wardMatch = wds.find(
                                    (w) => addressService.normalizeName(w.name) === normWard
                                );

                                if (wardMatch) {
                                    setAddrWard({ code: wardMatch.code, name: wardMatch.name });
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Lỗi khi load thông tin cá nhân:", err);
            }
        };

        if (provinces.length > 0) {
            loadProfileAndAddress();
        }
    }, [provinces]);

    const handleProvinceChange = async (e) => {
        const provinceCode = e.target.value;
        const provinceObj = provinces.find((p) => p.code === parseInt(provinceCode));
        if (provinceObj) {
            setAddrProvince({ code: provinceCode, name: provinceObj.name });
            setAddrDistrict({ code: "", name: "" });
            setAddrWard({ code: "", name: "" });
            setWards([]);
            const dists = await addressService.getDistricts(provinceCode);
            setDistricts(dists);
        } else {
            setAddrProvince({ code: "", name: "" });
            setAddrDistrict({ code: "", name: "" });
            setAddrWard({ code: "", name: "" });
            setDistricts([]);
            setWards([]);
        }
    };

    const handleDistrictChange = async (e) => {
        const districtCode = e.target.value;
        const districtObj = districts.find((d) => d.code === parseInt(districtCode));
        if (districtObj) {
            setAddrDistrict({ code: districtCode, name: districtObj.name });
            setAddrWard({ code: "", name: "" });
            const wds = await addressService.getWards(districtCode);
            setWards(wds);
        } else {
            setAddrDistrict({ code: "", name: "" });
            setAddrWard({ code: "", name: "" });
            setWards([]);
        }
    };

    const handleWardChange = (e) => {
        const wardCode = e.target.value;
        const wardObj = wards.find((w) => w.code === parseInt(wardCode));
        if (wardObj) {
            setAddrWard({ code: wardCode, name: wardObj.name });
        } else {
            setAddrWard({ code: "", name: "" });
        }
    };

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        navigate("/");
    };

    const validateForm = () => {
        const formErrors = {};
        if (!recipientName.trim()) formErrors.recipientName = "Vui lòng nhập họ và tên";
        if (!recipientPhone.trim()) {
            formErrors.recipientPhone = "Vui lòng nhập số điện thoại";
        } else if (!/^(0[123456789])([0-9]{8})$/.test(recipientPhone.trim().replace(/\s+/g, ""))) {
            formErrors.recipientPhone = "Số điện thoại không đúng định dạng (ví dụ: 0901234567)";
        }
        if (!addrProvince.code || !addrDistrict.code || !addrWard.code || !addrStreet.trim()) {
            formErrors.recipientAddress = "Vui lòng nhập đầy đủ địa chỉ giao hàng 4 cấp";
        }

        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            const firstErrorKey = Object.keys(errors)[0];
            const errorElement = document.getElementsByName(firstErrorKey)[0];
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }

        const formattedAddress = addressService.formatAddress({
            street: addrStreet.trim(),
            ward: addrWard.name,
            district: addrDistrict.name,
            province: addrProvince.name,
        });

        // Auto-save phone and address to user profile
        if (profileData) {
            try {
                const updatedFormData = {
                    fullName: profileData.fullName || recipientName,
                    phone: recipientPhone,
                    avatarUrl: profileData.avatarUrl,
                    address: profileData.role === "customer" ? formattedAddress : (profileData.addresses?.[0]?.address || ""),
                    farmAddress: profileData.role === "farmer" ? formattedAddress : (profileData.farmAddress || ""),
                    farmName: profileData.farmName || "",
                    description: profileData.description || ""
                };

                const payload = buildProfileUpdatePayload(profileData.role, updatedFormData);
                await profileService.updateProfile(payload);
                console.log("Auto-saved phone and address to database profile.");
            } catch (err) {
                console.error("Lỗi khi tự động lưu thông tin giao hàng:", err);
            }
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

        const orderPayload = {
            recipient: recipientName,
            phone: recipientPhone,
            address: formattedAddress,
            shippingNote: shippingNote,
            paymentMethod: paymentMethod === "cod" ? "COD" : paymentMethod === "bank" ? "BANK_TRANSFER" : "CARD",
            subtotal: subtotal,
            shippingFee: shippingFee,
            serviceFee: serviceFee,
            discount: discountAmount,
            amount: totalAmount,
            items: selectedItems.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }))
        };

        if (user) {
            try {
                const backendOrder = await orderService.createOrder(orderPayload);
                
                // Clear checked items from local cart
                const savedCart = JSON.parse(localStorage.getItem("agrimarket_cart")) || [];
                const remainingCart = savedCart.filter(item => !selectedItems.some(sel => sel.id === item.id));
                localStorage.setItem("agrimarket_cart", JSON.stringify(remainingCart));

                // Clear checkout data
                localStorage.removeItem("agrimarket_checkout");

                if (paymentMethod === "cod") {
                    setPlacedOrder(backendOrder);
                    setIsSuccess(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                    localStorage.setItem("agrimarket_pending_order", JSON.stringify(backendOrder));
                    navigate("/payment", { state: { pendingOrder: backendOrder, paymentMethod } });
                }
            } catch (err) {
                console.error("Lỗi khi đặt hàng:", err);
                const errMsg = err.response?.data
                    ? (typeof err.response.data === "object" ? (err.response.data.message || JSON.stringify(err.response.data)) : err.response.data)
                    : "Có lỗi xảy ra khi xử lý đặt hàng. Vui lòng thử lại.";
                alert(errMsg);
            }
        } else {
            const now = new Date();
            const formattedDate = `${now.getDate()} thg ${now.getMonth() + 1}, ${now.getFullYear()}`;
            const hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'CH' : 'SA';
            const displayHours = hours % 12 || 12;
            const formattedTime = `${displayHours}:${minutes} ${ampm}`;

            const newOrder = {
                id: orderId,
                status: "pending",
                statusLabel: "Chờ xác nhận",
                date: formattedDate,
                time: formattedTime,
                subtotal: subtotal,
                shippingFee: shippingFee,
                serviceFee: serviceFee,
                discount: discountAmount,
                amount: totalAmount,
                recipient: recipientName,
                address: formattedAddress,
                phone: recipientPhone,
                trackingNumber: `FH-TRACK-${Math.floor(100000 + Math.random() * 900000)}`,
            paymentMethod: paymentMethod === "cod" ? "COD" : paymentMethod === "bank" ? "BANK_TRANSFER" : "CARD",
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

            if (paymentMethod === "cod") {
                // Write to local storage under orders database
                const stored = localStorage.getItem("agrimarket_orders");
                const existingOrders = stored ? JSON.parse(stored) : INITIAL_ORDERS;
                const updatedOrders = [newOrder, ...existingOrders];
                localStorage.setItem("agrimarket_orders", JSON.stringify(updatedOrders));

                // Clear checkout data
                localStorage.removeItem("agrimarket_checkout");

                // Keep order reference for confirmation screen
                setPlacedOrder(newOrder);
                setIsSuccess(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                // Store pending order details and redirect to new payment page
                localStorage.setItem("agrimarket_pending_order", JSON.stringify(newOrder));
                navigate("/payment", { state: { pendingOrder: newOrder, paymentMethod } });
            }
        }
    };

    // Calculate sum items count
    const totalCartItems = useMemo(() => {
        const savedCart = JSON.parse(localStorage.getItem("agrimarket_cart")) || [];
        return savedCart.reduce((sum, item) => sum + item.quantity, 0);
    }, [isSuccess]);

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
                            {user && user.role === "admin" ? (
                                <Link to="/admin/users" className="nav-link">AgriAdmin</Link>
                            ) : (
                                <Link to="/about" className="nav-link">Giới thiệu</Link>
                            )}
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
                        {user && user.role === "admin" ? (
                            <Link to="/admin/users" className="nav-link">AgriAdmin</Link>
                        ) : (
                            <Link to="/about" className="nav-link">Giới thiệu</Link>
                        )}
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
                        {(!user || user.role !== "admin") && (
                            <button className="icon-btn" aria-label="Giỏ hàng" onClick={() => navigate("/cart")}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                                {cartItemsCount > 0 && (
                                    <span className="cart-badge">{cartItemsCount}</span>
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

                {/* ── SUCCESS VIEW (COD Order receipt) ── */}
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

                                <div className="form-group-row">
                                    <div className="form-group">
                                        <label>Tỉnh / Thành phố <span className="req-star">*</span></label>
                                        <select
                                            value={addrProvince.code}
                                            onChange={handleProvinceChange}
                                            className={errors.recipientAddress ? "input-err" : ""}
                                        >
                                            <option value="">Chọn Tỉnh / Thành phố</option>
                                            {provinces.map((p) => (
                                                <option key={p.code} value={p.code}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Quận / Huyện <span className="req-star">*</span></label>
                                        <select
                                            value={addrDistrict.code}
                                            onChange={handleDistrictChange}
                                            disabled={!addrProvince.code}
                                            className={errors.recipientAddress ? "input-err" : ""}
                                        >
                                            <option value="">Chọn Quận / Huyện</option>
                                            {districts.map((d) => (
                                                <option key={d.code} value={d.code}>
                                                    {d.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group-row">
                                    <div className="form-group">
                                        <label>Phường / Xã <span className="req-star">*</span></label>
                                        <select
                                            value={addrWard.code}
                                            onChange={handleWardChange}
                                            disabled={!addrDistrict.code}
                                            className={errors.recipientAddress ? "input-err" : ""}
                                        >
                                            <option value="">Chọn Phường / Xã</option>
                                            {wards.map((w) => (
                                                <option key={w.code} value={w.code}>
                                                    {w.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Số nhà / Tên đường <span className="req-star">*</span></label>
                                        <input
                                            type="text"
                                            id="recipientAddress"
                                            name="recipientAddress"
                                            value={addrStreet}
                                            onChange={(e) => setAddrStreet(e.target.value)}
                                            placeholder="Số nhà, ngõ, tên đường..."
                                            className={errors.recipientAddress ? "input-err" : ""}
                                        />
                                    </div>
                                </div>
                                {errors.recipientAddress && (
                                    <div className="form-group" style={{ marginTop: "-12px", marginBottom: "20px" }}>
                                        <span className="error-hint-text">{errors.recipientAddress}</span>
                                    </div>
                                )}

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
                                                <span className="method-title">Chuyển khoản Ngân hàng</span>
                                                <span className="method-desc">Quét mã QR qua ví điện tử hoặc Mobile Banking của bạn ở trang kế tiếp.</span>
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
                                                <span className="method-desc">Thanh toán qua thẻ Visa/Mastercard quốc tế hoặc nội địa ở trang kế tiếp.</span>
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
                                {paymentMethod !== "cod" && (
                                    <div className="method-detail-box cod-box">
                                        <p>🔒 Bạn sẽ được chuyển sang cổng thanh toán bảo mật ở bước tiếp theo để hoàn thành giao dịch chuyển khoản hoặc thẻ tín dụng trị giá <strong>{formatVND(checkoutData.totalAmount)}</strong>.</p>
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
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    {paymentMethod === "cod" ? "Xác nhận đặt hàng" : "Tiến hành thanh toán"}
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

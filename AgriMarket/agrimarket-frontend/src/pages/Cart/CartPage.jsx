import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import cartService from "../../services/cartService";
import CartItem from "./CartItem";
import Footer from "../../components/common/Footer/Footer";
import "./CartPage.css";
import Header from "../../components/common/Header/Header";

export default function CartPage() {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [toastMessage, setToastMessage] = useState("");
    const [user, setUser] = useState(null);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    useEffect(() => {
        // Load user session
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        const loadCart = async () => {
            if (currentUser) {
                try {
                    const data = await cartService.getCart();
                    setCartItems(data);
                } catch (err) {
                    console.error("Lỗi khi load giỏ hàng từ DB:", err);
                    loadLocalCart();
                }
            } else {
                loadLocalCart();
            }
        };

        const loadLocalCart = () => {
            let savedCart = JSON.parse(localStorage.getItem("agrimarket_cart"));

            if (!savedCart || savedCart.length === 0) {
                savedCart = [
                    {
                        id: "mock-1",
                        name: "Cà chua Heirloom hữu cơ",
                        price: 49900,
                        unit: "kg",
                        imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300",
                        quantity: 2,
                        checked: true
                    },
                    {
                        id: "mock-2",
                        name: "Cà rốt gia truyền hữu cơ",
                        price: 112500,
                        unit: "bó",
                        imageUrl: "https://images.unsplash.com/photo-1445280471656-618bf9abcfe0?w=300",
                        quantity: 1,
                        checked: true
                    },
                    {
                        id: "mock-3",
                        name: "Táo Honeycrisp giòn ngọt",
                        price: 69000,
                        unit: "kg",
                        imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300",
                        quantity: 3,
                        checked: true
                    }
                ];

                localStorage.setItem("agrimarket_cart", JSON.stringify(savedCart));
            }

            savedCart = savedCart.map(item => ({
                ...item,
                checked: item.checked ?? true
            }));

            setCartItems(savedCart);
        };

        loadCart();
    }, []);

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        navigate("/");
    };

    const triggerToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const selectedItems = useMemo(() => {
        return cartItems.filter(item => item.checked);
    }, [cartItems]);

    const selectedItemsQuantity = useMemo(() => {
        return selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    }, [selectedItems]);

    const subtotal = useMemo(() => {
        return selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [selectedItems]);

    const totalCartQty = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }, [cartItems]);

    const serviceFee = subtotal > 0 ? 15000 : 0;
    const shippingFee = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
    const discountAmount = 0;
    const totalAmount = subtotal + serviceFee + shippingFee - discountAmount;

    const freeShipProgress = useMemo(() => {
        return Math.min((subtotal / 500000) * 100, 100);
    }, [subtotal]);

    const formatVND = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price) + " đ";
    };

    const syncCart = (updatedCart) => {
        setCartItems(updatedCart);
        localStorage.setItem("agrimarket_cart", JSON.stringify(updatedCart));
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (user) {
            try {
                const data = await cartService.updateCartItem(itemId, newQuantity, null);
                setCartItems(data);
            } catch (err) {
                console.error("Lỗi khi cập nhật số lượng:", err);
            }
        } else {
            const updatedCart = cartItems.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            );
            syncCart(updatedCart);
        }
    };

    const handleRemoveItem = async (itemId) => {
        if (user) {
            try {
                const data = await cartService.removeFromCart(itemId);
                setCartItems(data);
                triggerToast("Đã xóa sản phẩm khỏi giỏ hàng!");
            } catch (err) {
                console.error("Lỗi khi xóa sản phẩm:", err);
            }
        } else {
            const updatedCart = cartItems.filter(item => item.id !== itemId);
            syncCart(updatedCart);
            triggerToast("Đã xóa sản phẩm khỏi giỏ hàng!");
        }
    };

    const handleSelectItem = async (itemId) => {
        const item = cartItems.find(i => i.id === itemId);
        if (!item) return;

        if (user) {
            try {
                const data = await cartService.updateCartItem(itemId, null, !item.checked);
                setCartItems(data);
            } catch (err) {
                console.error("Lỗi khi chọn sản phẩm:", err);
            }
        } else {
            const updatedCart = cartItems.map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
            );
            syncCart(updatedCart);
        }
    };

    const handleSelectAllItems = async () => {
        const isAllSelected = cartItems.length > 0 && cartItems.every(item => item.checked);
        const newCheckedVal = !isAllSelected;

        if (user) {
            try {
                let lastData = cartItems;
                for (const item of cartItems) {
                    if (item.checked !== newCheckedVal) {
                        lastData = await cartService.updateCartItem(item.id, null, newCheckedVal);
                    }
                }
                setCartItems(lastData);
            } catch (err) {
                console.error("Lỗi khi chọn tất cả sản phẩm:", err);
            }
        } else {
            const updatedCart = cartItems.map(item => ({
                ...item,
                checked: newCheckedVal
            }));
            syncCart(updatedCart);
        }
    };

    const handleClearCart = async () => {
        const confirmed = window.confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?");
        if (!confirmed) return;

        if (user) {
            try {
                const data = await cartService.clearCart();
                setCartItems(data);
                triggerToast("Giỏ hàng đã được làm trống!");
            } catch (err) {
                console.error("Lỗi khi làm trống giỏ hàng:", err);
            }
        } else {
            setCartItems([]);
            localStorage.removeItem("agrimarket_cart");
            triggerToast("Giỏ hàng đã được làm trống!");
        }
    };

    const handleProceedToPayment = () => {
        if (cartItems.length === 0) {
            triggerToast("Giỏ hàng của bạn đang trống!");
            return;
        }

        if (selectedItems.length === 0) {
            triggerToast("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
            return;
        }

        const checkoutData = {
            selectedItems,
            subtotal,
            serviceFee,
            shippingFee,
            discountAmount,
            totalAmount
        };

        localStorage.setItem("agrimarket_checkout", JSON.stringify(checkoutData));
        navigate("/checkout");
    };

    return (
        <div className="cart-page-wrapper">
            <Header />

            {toastMessage && (
                <div className="cart-toast">
                    <span className="toast-icon">✅</span>
                    <span className="toast-text">{toastMessage}</span>
                </div>
            )}

            <main className="cart-main-container">
                {/* Breadcrumbs */}
                <nav className="breadcrumbs" aria-label="Breadcrumb">
                    <Link to="/">Trang chủ</Link>
                    <span className="breadcrumb-separator">›</span>
                    <span className="breadcrumb-current">Giỏ hàng</span>
                </nav>

                {/* Step Indicator */}
                <div className="cart-step-indicator">
                    <div className="step-node active">
                        <span className="node-num">1</span>
                        <span className="node-label">Giỏ hàng</span>
                    </div>

                    <div className="step-connector"></div>

                    <div className="step-node">
                        <span className="node-num">2</span>
                        <span className="node-label">Đặt hàng thành công</span>
                    </div>

                    <div className="step-connector"></div>

                    <div className="step-node">
                        <span className="node-num">3</span>
                        <span className="node-label">Hoàn tất giao hàng</span>
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    <section className="cart-empty-state">
                        <div className="empty-cart-icon">🛒</div>
                        <h2>Giỏ hàng của bạn đang trống</h2>
                        <p>Bạn chưa thêm sản phẩm nào vào giỏ hàng hoặc đã hoàn tất thanh toán.</p>

                        <button
                            type="button"
                            className="btn-back-to-shop"
                            onClick={() => navigate("/")}
                        >
                            Khám phá cửa hàng ngay
                        </button>
                    </section>
                ) : (
                    <section className="cart-content-grid">
                        <div className="cart-left-section">
                            <div className="section-header-row">
                                <h3>Sản phẩm trong giỏ ({cartItems.length})</h3>

                                <button
                                    type="button"
                                    className="btn-clear-all"
                                    onClick={handleClearCart}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                    Làm trống giỏ hàng
                                </button>
                            </div>

                            <div className="cart-select-all-row">
                                <label className="cart-select-all-label">
                                    <input
                                        type="checkbox"
                                        checked={cartItems.length > 0 && cartItems.every(item => item.checked)}
                                        onChange={handleSelectAllItems}
                                    />
                                    <span className="custom-checkbox-span"></span>
                                    <span className="select-all-text">Chọn tất cả sản phẩm</span>
                                </label>

                                <span className="cart-selected-info">
                                    Đã chọn <strong>{selectedItems.length}</strong> sản phẩm / <strong>{selectedItemsQuantity}</strong> mặt hàng
                                </span>
                            </div>

                            <div className="cart-items-table-header">
                                <span>Sản phẩm</span>
                                <span>Đơn giá</span>
                                <span>Số lượng</span>
                                <span>Tạm tính</span>
                            </div>

                            <div className="cart-items-list-container">
                                {cartItems.map(item => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        onUpdateQuantity={handleUpdateQuantity}
                                        onRemove={handleRemoveItem}
                                        onSelectItem={handleSelectItem}
                                    />
                                ))}
                            </div>

                            <button
                                type="button"
                                className="btn-continue-shopping"
                                onClick={() => navigate("/products")}
                            >
                                ← Tiếp tục mua sắm
                            </button>
                        </div>

                        <aside className="cart-right-section">
                            <div className="cart-summary-card">
                                <h4>Tóm tắt đơn hàng</h4>

                                <p className="summary-selected-note">
                                    Đơn hàng chỉ tính các sản phẩm đã chọn.
                                </p>

                                <div className="summary-selected-products-list">
                                    {selectedItems.length === 0 ? (
                                        <p className="summary-no-items-selected">
                                            Chưa chọn sản phẩm nào để thanh toán
                                        </p>
                                    ) : (
                                        selectedItems.map(item => (
                                            <div className="summary-selected-product-item" key={item.id}>
                                                <span className="summary-selected-product-name" title={item.name}>
                                                    {item.name}
                                                </span>
                                                <span className="summary-selected-product-qty">
                                                    x{item.quantity}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="summary-row">
                                    <span>Tạm tính</span>
                                    <span>{formatVND(subtotal)}</span>
                                </div>

                                <div className="summary-row">
                                    <span>Phí dịch vụ</span>
                                    <span>{formatVND(serviceFee)}</span>
                                </div>

                                <div className="summary-row">
                                    <span>Phí vận chuyển</span>
                                    <span className={shippingFee === 0 ? "free-shipping-txt" : ""}>
                                        {shippingFee === 0 ? "Miễn phí" : formatVND(shippingFee)}
                                    </span>
                                </div>

                                <div className="freeship-info-container">
                                    <div className="freeship-progress-wrapper">
                                        <div className="freeship-progress-bar" style={{ width: `${freeShipProgress}%` }}></div>
                                    </div>
                                    {subtotal > 0 && subtotal < 500000 ? (
                                        <p className="shipping-hint-text">
                                            Mua thêm <strong>{formatVND(500000 - subtotal)}</strong> để được miễn phí giao hàng.
                                        </p>
                                    ) : subtotal >= 500000 ? (
                                        <p className="shipping-hint-text success-hint">
                                            🎉 Chúc mừng! Đơn hàng của bạn được miễn phí giao hàng.
                                        </p>
                                    ) : (
                                        <p className="shipping-hint-text">
                                            Đạt tối thiểu <strong>500.000 đ</strong> để được miễn phí vận chuyển.
                                        </p>
                                    )}
                                </div>

                                <hr className="summary-divider" />

                                <div className="summary-row total-row">
                                    <span>Tổng thanh toán</span>
                                    <span className="grand-total-val">
                                        {formatVND(totalAmount)}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="btn-proceed-checkout"
                                    onClick={handleProceedToPayment}
                                    disabled={selectedItems.length === 0}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" style={{ marginRight: "8px" }}>
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    Tiến hành thanh toán
                                </button>
                            </div>
                        </aside>
                    </section>
                )}
            </main>
            <Footer />
        </div>
    );
}
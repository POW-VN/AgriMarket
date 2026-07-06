import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import cartService from "../../services/cartService";
import { getProductById } from "../../services/productService";
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
    const [isLoading, setIsLoading] = useState(true);

    const enrichCartItems = async (items) => {
        if (!items || items.length === 0) return [];
        return await Promise.all(items.map(async (item) => {
            if (!item.farmerId || !item.farmerName || item.stockQuantity === undefined) {
                try {
                    const prodDetails = await getProductById(item.id);
                    return {
                        ...item,
                        farmerId: item.farmerId || prodDetails.farmerId,
                        farmerName: item.farmerName || prodDetails.farmerName,
                        stockQuantity: item.stockQuantity !== undefined ? item.stockQuantity : prodDetails.stock
                    };
                } catch (e) {
                    console.error("Error enriching product details:", e);
                }
            }
            return item;
        }));
    };

    const updateCartState = async (items) => {
        const enriched = await enrichCartItems(items);
        setCartItems(enriched);
    };

    useEffect(() => {
        // Load user session
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        const loadCart = async () => {
            if (currentUser) {
                try {
                    const data = await cartService.getCart();
                    // Enrich items with farmer details if they are missing
                    const enrichedData = await Promise.all(data.map(async (item) => {
                        if (!item.farmerId || !item.farmerName) {
                            try {
                                const prodDetails = await getProductById(item.id);
                                return {
                                    ...item,
                                    farmerId: item.farmerId || prodDetails.farmerId,
                                    farmerName: item.farmerName || prodDetails.farmerName,
                                    stockQuantity: item.stockQuantity !== undefined ? item.stockQuantity : prodDetails.stock
                                };
                            } catch (e) {
                                console.error("Error enriching product details:", e);
                            }
                        }
                        return item;
                    }));
                    setCartItems(enrichedData);
                } catch (err) {
                    console.error("Lỗi khi load giỏ hàng từ DB:", err);
                    await loadLocalCart();
                } finally {
                    setIsLoading(false);
                }
            } else {
                await loadLocalCart();
            }
        };

        const loadLocalCart = async () => {
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
                        checked: true,
                        stockQuantity: 10,
                        farmerId: 1,
                        farmerName: "Trang trại Đà Lạt Xanh"
                    },
                    {
                        id: "mock-2",
                        name: "Cà rốt gia truyền hữu cơ",
                        price: 112500,
                        unit: "bó",
                        imageUrl: "https://images.unsplash.com/photo-1445280471656-618bf9abcfe0?w=300",
                        quantity: 1,
                        checked: true,
                        stockQuantity: 5,
                        farmerId: 1,
                        farmerName: "Trang trại Đà Lạt Xanh"
                    },
                    {
                        id: "mock-3",
                        name: "Táo Honeycrisp giòn ngọt",
                        price: 69000,
                        unit: "kg",
                        imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300",
                        quantity: 3,
                        checked: true,
                        stockQuantity: 12,
                        farmerId: 2,
                        farmerName: "Nông trại Hoa Mặt Trời"
                    }
                ];

                localStorage.setItem("agrimarket_cart", JSON.stringify(savedCart));
            }

            // Enrich local items if they lack farmer data
            const enrichedCart = await Promise.all(savedCart.map(async (item) => {
                if (!item.farmerId || !item.farmerName || item.stockQuantity === undefined) {
                    try {
                        const prodDetails = await getProductById(item.id);
                        return {
                            ...item,
                            farmerId: item.farmerId || prodDetails.farmerId,
                            farmerName: item.farmerName || prodDetails.farmerName,
                            stockQuantity: item.stockQuantity !== undefined ? item.stockQuantity : prodDetails.stock
                        };
                    } catch (e) {
                        console.error("Error enriching local product details:", e);
                    }
                }
                return item;
            }));

            const checkedCart = enrichedCart.map(item => ({
                ...item,
                checked: item.checked ?? true
            }));

            setCartItems(checkedCart);
            setIsLoading(false);
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

    const syncCart = async (updatedCart) => {
        await updateCartState(updatedCart);
        localStorage.setItem("agrimarket_cart", JSON.stringify(updatedCart));
    };

    const groupedItems = useMemo(() => {
        const groups = {};
        cartItems.forEach(item => {
            const fId = item.farmerId || 999;
            const fName = item.farmerName || "Nhà vườn AgriMarket";
            if (!groups[fId]) {
                groups[fId] = {
                    farmerId: fId,
                    farmerName: fName,
                    items: []
                };
            }
            groups[fId].items.push(item);
        });
        return Object.values(groups);
    }, [cartItems]);

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (user) {
            try {
                const data = await cartService.updateCartItem(itemId, newQuantity, null);
                await updateCartState(data);
            } catch (err) {
                console.error("Lỗi khi cập nhật số lượng:", err);
                const errMsg = err.response?.data || "Không thể cập nhật số lượng. Đã vượt quá số lượng tồn kho.";
                triggerToast(errMsg);
            }
        } else {
            const item = cartItems.find(i => i.id === itemId);
            if (item && item.stockQuantity !== undefined && newQuantity > item.stockQuantity) {
                triggerToast(`Không thể cập nhật số lượng vượt quá tồn kho hiện có (${item.stockQuantity}).`);
                return;
            }
            const updatedCart = cartItems.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            );
            await syncCart(updatedCart);
        }
    };

    const handleRemoveItem = async (itemId) => {
        if (user) {
            try {
                const data = await cartService.removeFromCart(itemId);
                await updateCartState(data);
                triggerToast("Đã xóa sản phẩm khỏi giỏ hàng!");
            } catch (err) {
                console.error("Lỗi khi xóa sản phẩm:", err);
            }
        } else {
            const updatedCart = cartItems.filter(item => item.id !== itemId);
            await syncCart(updatedCart);
            triggerToast("Đã xóa sản phẩm khỏi giỏ hàng!");
        }
    };

    const handleSelectItem = async (itemId) => {
        const item = cartItems.find(i => i.id === itemId);
        if (!item) return;

        if (user) {
            try {
                const data = await cartService.updateCartItem(itemId, null, !item.checked);
                await updateCartState(data);
            } catch (err) {
                console.error("Lỗi khi chọn sản phẩm:", err);
            }
        } else {
            const updatedCart = cartItems.map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
            );
            await syncCart(updatedCart);
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
                await updateCartState(lastData);
            } catch (err) {
                console.error("Lỗi khi chọn tất cả sản phẩm:", err);
            }
        } else {
            const updatedCart = cartItems.map(item => ({
                ...item,
                checked: newCheckedVal
            }));
            await syncCart(updatedCart);
        }
    };

    const handleSelectFarmerAll = async (farmerId, newCheckedVal) => {
        const targetItems = cartItems.filter(item => (item.farmerId || 999) === farmerId);
        if (user) {
            try {
                let lastData = cartItems;
                for (const item of targetItems) {
                    if (item.checked !== newCheckedVal) {
                        lastData = await cartService.updateCartItem(item.id, null, newCheckedVal);
                    }
                }
                await updateCartState(lastData);
            } catch (err) {
                console.error("Lỗi khi chọn sản phẩm của nhà vườn:", err);
            }
        } else {
            const updatedCart = cartItems.map(item =>
                (item.farmerId || 999) === farmerId ? { ...item, checked: newCheckedVal } : item
            );
            await syncCart(updatedCart);
        }
    };

    const handleClearCart = async () => {
        const confirmed = window.confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?");
        if (!confirmed) return;

        if (user) {
            try {
                const data = await cartService.clearCart();
                await updateCartState(data);
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

        // Validate stock quantity for selected items
        const invalidItem = selectedItems.find(item => item.quantity > (item.stockQuantity ?? 0));
        if (invalidItem) {
            triggerToast(`Sản phẩm "${invalidItem.name}" vượt quá tồn kho (Tồn kho: ${invalidItem.stockQuantity}). Vui lòng giảm số lượng!`);
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

                {isLoading ? (
                    <div className="cart-loading-state">
                        <div className="loading-spinner"></div>
                        <p>Đang tải danh sách sản phẩm...</p>
                    </div>
                ) : cartItems.length === 0 ? (
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

                            <div className="cart-grouped-list-container">
                                {groupedItems.map(group => (
                                    <div key={group.farmerId} className="farmer-group-container">
                                        <div className="farmer-group-header">
                                            <label className="farmer-select-all-label">
                                                <input
                                                    type="checkbox"
                                                    checked={group.items.every(item => item.checked)}
                                                    onChange={() => handleSelectFarmerAll(group.farmerId, !group.items.every(item => item.checked))}
                                                />
                                                <span className="custom-checkbox-span"></span>
                                            </label>
                                            <span className="farmer-icon">🏡</span>
                                            <span className="farmer-name">{group.farmerName}</span>
                                            <span className="farmer-badge">Nhà vườn</span>
                                        </div>
                                        <div className="farmer-items-list">
                                            {group.items.map(item => (
                                                <CartItem
                                                    key={item.id}
                                                    item={item}
                                                    onUpdateQuantity={handleUpdateQuantity}
                                                    onRemove={handleRemoveItem}
                                                    onSelectItem={handleSelectItem}
                                                />
                                            ))}
                                        </div>
                                    </div>
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
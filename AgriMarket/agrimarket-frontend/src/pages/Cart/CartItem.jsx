import React, { useState, useEffect } from "react";

export default function CartItem({ item, onUpdateQuantity, onRemove, onSelectItem }) {
    const [imageError, setImageError] = useState(false);
    const [tempValue, setTempValue] = useState(undefined);

    useEffect(() => {
        setTempValue(undefined);
    }, [item.quantity]);

    const formatVND = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price) + " đ";
    };

    const handleDecrease = () => {
        if (item.quantity > 1) {
            onUpdateQuantity(item.id, item.quantity - 1);
        }
    };

    const handleIncrease = () => {
        if (item.stockQuantity !== undefined && item.quantity >= item.stockQuantity) {
            return;
        }
        onUpdateQuantity(item.id, item.quantity + 1);
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        if (val === "" || /^\d+$/.test(val)) {
            setTempValue(val);
        }
    };

    const handleInputBlur = () => {
        if (tempValue === undefined) return;
        
        let parsed = parseInt(tempValue, 10);
        const maxStock = item.stockQuantity !== undefined ? item.stockQuantity : 9999;
        
        if (isNaN(parsed) || parsed < 1) {
            parsed = 1;
        } else if (parsed > maxStock) {
            parsed = maxStock;
        }
        
        setTempValue(undefined);
        if (parsed !== item.quantity) {
            onUpdateQuantity(item.id, parsed);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleInputBlur();
        }
    };

    return (
        <div className="cart-item-row">
            <div className="cart-item-info">
                <div className="cart-item-checkbox">
                    <input
                        type="checkbox"
                        checked={item.checked || false}
                        onChange={() => onSelectItem(item.id)}
                        aria-label={`Chọn ${item.name}`}
                    />
                </div>
                <div className="cart-item-image">
                    {imageError || !item.imageUrl ? (
                        <div className="cart-item-image-fallback">🌾</div>
                    ) : (
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            onError={() => setImageError(true)}
                        />
                    )}
                </div>
                <div className="cart-item-details">
                    <h4 className="cart-item-title">{item.name}</h4>
                    <div className="cart-item-meta">
                        <span className="cart-item-unit">Đơn vị: {item.unit || "kg"}</span>
                        {item.stockQuantity !== undefined && (
                            <span className={`cart-item-stock-badge ${item.stockQuantity === 0 ? "out-of-stock" : ""}`}>
                                {item.stockQuantity === 0 ? "Hết hàng" : `Tồn kho: ${item.stockQuantity}`}
                            </span>
                        )}
                    </div>
                    {item.isWithinDeliveryRange === false && (
                        <div className="cart-item-delivery-warning" style={{
                            color: "#d93838",
                            fontSize: "0.85rem",
                            fontWeight: "500",
                            marginTop: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                        }}>
                            <span>⚠️</span> Ngoài phạm vi giao hàng của nhà vườn ({item.distance != null ? item.distance.toFixed(1) : "?"} km / tối đa {item.maxDeliveryRange != null ? item.maxDeliveryRange.toFixed(1) : "?"} km)
                        </div>
                    )}
                    <span className="cart-item-price-mobile">{formatVND(item.price)}</span>
                </div>
            </div>

            <div className="cart-item-price-col">
                <span className="cart-item-unit-price">{formatVND(item.price)}</span>
            </div>

            <div className="cart-item-quantity-col">
                <div className="quantity-controls">
                    <button
                        type="button"
                        className="qty-btn btn-minus"
                        onClick={handleDecrease}
                        disabled={item.quantity <= 1}
                        aria-label="Giảm số lượng"
                    >
                        -
                    </button>
                    <input
                        type="text"
                        className="qty-input"
                        value={tempValue !== undefined ? tempValue : item.quantity}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleKeyDown}
                        aria-label="Số lượng"
                    />
                    <button
                        type="button"
                        className="qty-btn btn-plus"
                        onClick={handleIncrease}
                        disabled={item.stockQuantity !== undefined && item.quantity >= item.stockQuantity}
                        aria-label="Tăng số lượng"
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="cart-item-total-col">
                <span className="cart-item-subtotal">{formatVND(item.price * item.quantity)}</span>
                <button
                    type="button"
                    className="btn-remove-item"
                    onClick={() => onRemove(item.id)}
                    aria-label="Xóa sản phẩm khỏi giỏ hàng"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>
        </div>
    );
}

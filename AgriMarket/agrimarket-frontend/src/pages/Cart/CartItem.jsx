import React, { useState } from "react";

export default function CartItem({ item, onUpdateQuantity, onRemove, onSelectItem }) {
    const [imageError, setImageError] = useState(false);

    const formatVND = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price) + " đ";
    };

    const handleDecrease = () => {
        if (item.quantity > 1) {
            onUpdateQuantity(item.id, item.quantity - 1);
        }
    };

    const handleIncrease = () => {
        onUpdateQuantity(item.id, item.quantity + 1);
    };

    return (
        <div className="cart-item-row">
            <div className="cart-item-info">
                <div className="cart-item-checkbox">
                    <label className="cart-item-select-label">
                        <input
                            type="checkbox"
                            checked={item.checked || false}
                            onChange={() => onSelectItem(item.id)}
                            aria-label={`Chọn ${item.name}`}
                        />
                        <span className="custom-checkbox-span"></span>
                    </label>
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
                    <span className="cart-item-unit">Đơn vị: {item.unit || "kg"}</span>
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
                    <span className="qty-value">{item.quantity}</span>
                    <button
                        type="button"
                        className="qty-btn btn-plus"
                        onClick={handleIncrease}
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

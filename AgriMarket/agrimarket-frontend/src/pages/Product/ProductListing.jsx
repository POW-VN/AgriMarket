import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Check, Star } from "lucide-react";
import Header from "../../components/common/Header/Header";
import Footer from "../../components/common/Footer/Footer";
import { getApprovedProductsPaged } from "../../services/productService";
import authService from "../../services/authService";
import cartService from "../../services/cartService";
import wishlistService from "../../services/wishlistService";
import "../Home/Home.css";
import "./ProductListing.css";

// ===============================
// MOCK DATA
// ===============================
// TODO BACKEND:
// Sau này xóa mockCategories và lấy danh mục từ API backend
const mockCategories = [
    "Trái cây",
    "Rau củ quả",
    "Cây lương thực",
    "Cây công nghiệp",
    "Chăn nuôi",
    "Giống cây trồng",
    "Nông sản chế biến",
    "Khác",
];

// TODO BACKEND:
// Sau này xóa mockProducts và lấy dữ liệu sản phẩm từ API backend
const mockProducts = [
    {
        id: 1,
        name: "Cam Sành Tiền Giang - Loại 1",
        category: "Trái cây",
        price: 32000,
        unit: "kg",
        rating: 4.8,
        sold: "1.2k",
        stockStatus: "Còn hàng",
        location: "Mỹ Tho, Tiền Giang",
        shopName: "Nông trại Sạch Miền Tây",
        image:
            "https://images.unsplash.com/photo-1547514701-42782101795e?q=80&w=1200&auto=format&fit=crop",
        badges: ["VIETGAP", "HỮU CƠ"],
    },
    {
        id: 2,
        name: "Bắp Cải Trắng Đà Lạt",
        category: "Rau củ quả",
        price: 18500,
        unit: "cái",
        rating: 4.9,
        sold: "780",
        stockStatus: "Còn hàng",
        location: "Đà Lạt, Lâm Đồng",
        shopName: "Farm Đà Lạt Green",
        image:
            "https://images.unsplash.com/photo-1615485925873-9c2b6a1f0e2f?q=80&w=1200&auto=format&fit=crop",
        badges: ["HỮU CƠ"],
    },
];

// TODO BACKEND:
// Sau này xóa mockLocations và lấy danh sách nơi bán từ backend
const mockLocations = [
    "Hồ Chí Minh",
    "Hà Nội",
    "Đà Nẵng",
    "Cần Thơ",
    "Lâm Đồng",
];

const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
};

const formatSold = (soldCount) => {
    const count = Number(soldCount || 0);
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + "k";
    }
    return count.toString();
};

const normalizeLocation = (value) => value.trim().toLowerCase();

const formatCurrencyInput = (value) => {
    if (!value) return "";
    const digits = value.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");
    if (!digits) return "";
    return new Intl.NumberFormat("vi-VN").format(Number(digits));
};

const parseCurrencyInput = (value) => {
    if (!value) return null;
    const digits = value.replace(/[^\d]/g, "");
    if (!digits) return null;
    return Number(digits);
};

export default function ProductListing() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [wishlistIds, setWishlistIds] = useState(new Set());
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");
    const [priceError, setPriceError] = useState("");

    const [selectedCategory, setSelectedCategory] = useState(() => {
        return searchParams.get("category") || "";
    });
    const [selectedSort, setSelectedSort] = useState("Phổ biến");
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [locationQuery, setLocationQuery] = useState("");
    const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
    const [shopKeyword, setShopKeyword] = useState("");
    const [priceMinInput, setPriceMinInput] = useState("");
    const [priceMaxInput, setPriceMaxInput] = useState("");
    const [debouncedPriceMin, setDebouncedPriceMin] = useState(null);
    const [debouncedPriceMax, setDebouncedPriceMax] = useState(null);
    const [selectedRating, setSelectedRating] = useState(0);
    const [currentPage, setCurrentPage] = useState(1); // UI: 1-indexed
    const locationFilterRef = useRef(null);

    const itemsPerPage = 6;

    const triggerToast = (msg, type = "success") => {
        setToastMessage(msg);
        setToastType(type);
        setTimeout(() => {
            setToastMessage("");
        }, 2500);
    };

    const handleAddToCart = async (product) => {
        try {
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                await cartService.addToCart(product.id, 1);
            } else {
                const cartKey = "agrimarket_cart";
                const currentCart = JSON.parse(localStorage.getItem(cartKey)) || [];
                const existingIndex = currentCart.findIndex(
                    (item) => String(item.id) === String(product.id)
                );

                if (existingIndex >= 0) {
                    const newQty = currentCart[existingIndex].quantity + 1;
                    if (product.stock !== undefined && newQty > product.stock) {
                        triggerToast(`Không thể thêm số lượng vượt quá tồn kho hiện có (${product.stock}).`);
                        return;
                    }
                    currentCart[existingIndex].quantity = newQty;
                } else {
                    if (product.stock !== undefined && 1 > product.stock) {
                        triggerToast(`Không thể thêm số lượng vượt quá tồn kho hiện có (${product.stock}).`);
                        return;
                    }
                    currentCart.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        unit: product.unit,
                        imageUrl: product.imageUrl,
                        quantity: 1,
                        checked: true,
                        stockQuantity: product.stock,
                        farmerId: product.farmerId,
                        farmerName: product.farmerName
                    });
                }

                localStorage.setItem(cartKey, JSON.stringify(currentCart));
            }

            window.dispatchEvent(new CustomEvent("cartUpdated"));
            triggerToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
        } catch (err) {
            console.error("Lỗi khi thêm vào giỏ hàng:", err);
            triggerToast("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
        }
    };

    const handleToggleWishlist = async (productId) => {
        try {
            const res = await wishlistService.toggleWishlist(productId);
            setWishlistIds((prev) => {
                const next = new Set(prev);
                if (next.has(String(productId))) {
                    next.delete(String(productId));
                } else {
                    next.add(String(productId));
                }
                return next;
            });
            triggerToast(res?.message || "Đã cập nhật danh sách yêu thích.");
        } catch (e) {
            console.error("Lỗi khi cập nhật yêu thích:", e);
            triggerToast("Vui lòng thử lại sau.");
        }
    };

    // Chuyển đổi selectedSort (UI label) sang sort key cho API
    const sortKeyMap = {
        "Phổ biến": "popular",
        "Mới nhất": "newest",
        "Bán chạy": "best_selling",
        "Giá tăng dần": "price_asc",
        "Giá giảm dần": "price_desc",
    };

    // Tải dữ liệu từ server mỗi khi filter/sort/page thay đổi
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const searchQuery = searchParams.get("search") || undefined;
            const sortKey = sortKeyMap[selectedSort] || "popular";
            // Location: gộp các location đã chọn thành chuỗi (lấy cái đầu tiên, hoặc bỏ nếu multi)
            const location = selectedLocations.length === 1 ? selectedLocations[0] : undefined;

            const result = await getApprovedProductsPaged({
                page: currentPage - 1, // API 0-indexed
                size: itemsPerPage,
                sort: sortKey,
                category: selectedCategory || undefined,
                search: searchQuery,
                minPrice: debouncedPriceMin || undefined,
                maxPrice: debouncedPriceMax || undefined,
                location,
                shopKeyword: shopKeyword.trim() || undefined,
                minRating: selectedRating > 0 ? selectedRating : undefined,
            });

            setProducts(result.content);
            setTotalPages(result.totalPages || 1);
            setTotalElements(result.totalElements || 0);

            // Load wishlist ids
            const ids = await wishlistService.getWishlistIds();
            setWishlistIds(new Set(ids.map((id) => String(id))));
        } catch (err) {
            console.error("Lỗi khi tải sản phẩm:", err);
        } finally {
            setLoading(false);
        }
    }, [
        currentPage, selectedCategory, selectedSort, selectedLocations,
        shopKeyword, debouncedPriceMin, debouncedPriceMax, selectedRating, searchParams
    ]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);



    // Đồng bộ category từ URL nếu user điều hướng lại với category khác
    useEffect(() => {
        const cat = searchParams.get("category");
        if (cat) {
            setSelectedCategory(cat);
            setCurrentPage(1);
        }
    }, [searchParams]);

    // Cuộn lên đầu trang khi thay đổi danh mục (với độ trễ nhỏ để tránh cơ chế tự động cuộn của trình duyệt)
    useEffect(() => {
        window.scrollTo(0, 0);
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);
        return () => clearTimeout(timer);
    }, [selectedCategory, searchParams]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (locationFilterRef.current && !locationFilterRef.current.contains(event.target)) {
                setIsLocationDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const minVal = parseCurrencyInput(priceMinInput);
            const maxVal = parseCurrencyInput(priceMaxInput);

            if (minVal !== null && maxVal !== null && minVal > maxVal) {
                setPriceError("Giá kết thúc phải lớn hơn hoặc bằng giá bắt đầu");
                setDebouncedPriceMin(null);
                setDebouncedPriceMax(null);
            } else {
                setPriceError("");
                setDebouncedPriceMin(minVal);
                setDebouncedPriceMax(maxVal);
            }
            setCurrentPage(1);
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [priceMinInput, priceMaxInput]);

    // Sản phẩm hiển thị = đã nhận từ server (không cần slice thêm)
    const paginatedProducts = products;

    // locationsList dùng cho dropdown (dùng mockLocations vì đây là UI helper)
    const locationsList = mockLocations;

    const filteredLocationOptions = locationsList.filter((loc) => {
        if (!locationQuery) return true;
        return normalizeLocation(loc).includes(normalizeLocation(locationQuery));
    });

    const toggleLocation = (location) => {
        setSelectedLocations((current) => {
            const next = current.includes(location)
                ? current.filter((item) => item !== location)
                : [...current, location];
            setCurrentPage(1);
            return next;
        });
    };

    const removeLocation = (location) => {
        setSelectedLocations((current) => {
            const next = current.filter((item) => item !== location);
            setCurrentPage(1);
            return next;
        });
    };

    const clearAllLocations = () => {
        setSelectedLocations([]);
        setLocationQuery("");
        setIsLocationDropdownOpen(false);
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="product-page">
                <Header />
                <div className="pl-loading-container">
                    <div className="pl-spinner" />
                    <p>Đang tải danh sách sản phẩm...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="product-page">
            {/* ================= HEADER ================= */}
            <Header />

            {/* ================= CONTENT ================= */}
            <main className="product-main">
                {/* Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-card">
                        <h3 className="sidebar-title">☷ Tất Cả Danh Mục</h3>
                        <ul className="category-list">
                            <li>
                                <button
                                    className={`category-btn ${!selectedCategory ? "active" : ""}`}
                                    onClick={() => {
                                        setSelectedCategory("");
                                        setCurrentPage(1);
                                    }}
                                >
                                    Tất cả sản phẩm
                                </button>
                            </li>
                            {mockCategories.map((category) => (
                                <li key={category}>
                                    <button
                                        className={`category-btn ${selectedCategory === category ? "active" : ""
                                            }`}
                                        onClick={() => {
                                            setSelectedCategory(category);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        {category}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="sidebar-card">
                        <h3 className="sidebar-title">🧪 Bộ Lọc Tìm Kiếm</h3>

                        <div className="filter-group">
                            <p className="filter-label">Nơi bán</p>
                            <div className="multi-select" ref={locationFilterRef}>
                                <div
                                    className={`multi-select-trigger ${isLocationDropdownOpen ? "open" : ""}`}
                                    onClick={() => setIsLocationDropdownOpen(true)}
                                >
                                    <div className="multi-select-values">
                                        {selectedLocations.length > 0 ? (
                                            selectedLocations.map((location) => (
                                                <span className="location-chip" key={location}>
                                                    <span className="location-chip-label">{location}</span>
                                                    <button
                                                        type="button"
                                                        className="location-chip-remove"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            removeLocation(location);
                                                        }}
                                                        aria-label={`Xóa ${location}`}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))
                                        ) : (
                                            <span className="multi-select-placeholder">
                                                Tất cả nơi bán
                                            </span>
                                        )}
                                        <input
                                            type="text"
                                            className="multi-select-input"
                                            value={locationQuery}
                                            placeholder={selectedLocations.length > 0 ? "Thêm nơi bán..." : "Tìm nơi bán..."}
                                            onClick={(event) => event.stopPropagation()}
                                            onChange={(e) => {
                                                setLocationQuery(e.target.value);
                                                setIsLocationDropdownOpen(true);
                                            }}
                                            onFocus={() => setIsLocationDropdownOpen(true)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Backspace" && !locationQuery && selectedLocations.length > 0) {
                                                    removeLocation(selectedLocations[selectedLocations.length - 1]);
                                                }
                                                if (event.key === "Escape") {
                                                    setIsLocationDropdownOpen(false);
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="multi-select-actions">
                                        {selectedLocations.length > 0 && (
                                            <button
                                                type="button"
                                                className="multi-select-clear"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    clearAllLocations();
                                                }}
                                                aria-label="Xóa toàn bộ nơi bán"
                                            >
                                                ×
                                            </button>
                                        )}
                                        <span className="multi-select-arrow">▾</span>
                                    </div>
                                </div>

                                {isLocationDropdownOpen && (
                                    <div className="multi-select-dropdown">
                                        <div className="multi-select-dropdown-header">
                                            <span>Chọn nhiều địa điểm</span>
                                            {selectedLocations.length > 0 && (
                                                <button
                                                    type="button"
                                                    className="multi-select-dropdown-clear"
                                                    onClick={clearAllLocations}
                                                >
                                                    Bỏ chọn hết
                                                </button>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            className={`multi-select-option ${selectedLocations.length === 0 ? "selected" : ""}`}
                                            onClick={clearAllLocations}
                                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                                        >
                                            <span className="multi-select-option-label">Tất cả nơi bán</span>
                                            <span className="multi-select-option-check" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                                {selectedLocations.length === 0 ? <Check size={14} /> : ""}
                                            </span>
                                        </button>

                                        {filteredLocationOptions.map((location) => {
                                            const isSelected = selectedLocations.includes(location);
                                            return (
                                                <button
                                                    key={location}
                                                    type="button"
                                                    className={`multi-select-option ${isSelected ? "selected" : ""}`}
                                                    onClick={() => toggleLocation(location)}
                                                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                                                >
                                                    <span className="multi-select-option-label">{location}</span>
                                                    <span className="multi-select-option-check" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                                        {isSelected ? <Check size={14} /> : ""}
                                                    </span>
                                                </button>
                                            );
                                        })}

                                        {filteredLocationOptions.length === 0 && (
                                            <div className="multi-select-empty">
                                                Không tìm thấy địa điểm phù hợp
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="filter-group">
                            <p className="filter-label">Tên cửa hàng</p>
                            <input
                                type="text"
                                className="filter-input"
                                placeholder="Tìm tên cửa hàng..."
                                value={shopKeyword}
                                onChange={(e) => {
                                    setShopKeyword(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <div className="filter-group">
                            <div className="filter-title-row">
                                <p className="filter-label filter-label-inline">Giá tiền</p>
                                {(priceMinInput || priceMaxInput) && (
                                    <button
                                        type="button"
                                        className="filter-clear-icon"
                                        onClick={() => {
                                            setPriceMinInput("");
                                            setPriceMaxInput("");
                                            setPriceError("");
                                            setDebouncedPriceMin(null);
                                            setDebouncedPriceMax(null);
                                            setCurrentPage(1);
                                        }}
                                        aria-label="Xóa bộ lọc giá"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            <div className="price-range-row">
                                <div className="price-range-input-wrap">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className={`price-range-input price-range-input-with-suffix ${priceError ? "price-range-input-error" : ""}`}
                                        placeholder="Từ"
                                        value={priceMinInput}
                                        onChange={(e) => {
                                            const formatted = formatCurrencyInput(e.target.value);
                                            setPriceMinInput(formatted);
                                            setCurrentPage(1);
                                        }}
                                    />
                                    <span className="price-range-currency">đ</span>
                                </div>
                                <span className="price-range-separator">-</span>
                                <div className="price-range-input-wrap">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className={`price-range-input price-range-input-with-suffix ${priceError ? "price-range-input-error" : ""}`}
                                        placeholder="Đến"
                                        value={priceMaxInput}
                                        onChange={(e) => {
                                            const formatted = formatCurrencyInput(e.target.value);
                                            setPriceMaxInput(formatted);
                                            setCurrentPage(1);
                                        }}
                                    />
                                    <span className="price-range-currency">đ</span>
                                </div>
                            </div>
                            {priceError && (
                                <p className="price-error-message" style={{ color: "#ef4444", fontSize: "12px", marginTop: "6px", fontWeight: "500", display: "flex", alignItems: "center", gap: "4px" }}>
                                    ⚠️ {priceError}
                                </p>
                            )}
                        </div>

                        <div className="filter-group">
                            <p className="filter-label">Đánh giá</p>
                            {[5, 4, 3, 2, 1].map((star) => (
                                <button
                                    key={star}
                                    className={`rating-btn ${selectedRating === star ? "active" : ""}`}
                                    onClick={() => {
                                        setSelectedRating(selectedRating === star ? 0 : star);
                                        setCurrentPage(1);
                                    }}
                                >
                                    {"★".repeat(star)} <span>từ {star} sao</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Product area */}
                <section className="product-section">
                    <div className="toolbar">
                        <div className="sort-group">
                            <span className="toolbar-label">Sắp xếp theo:</span>

                            <button
                                className={`sort-btn ${selectedSort === "Phổ biến" ? "active" : ""}`}
                                onClick={() => setSelectedSort("Phổ biến")}
                            >
                                Phổ biến
                            </button>

                            <button
                                className={`sort-btn ${selectedSort === "Mới nhất" ? "active" : ""}`}
                                onClick={() => setSelectedSort("Mới nhất")}
                            >
                                Mới nhất
                            </button>

                            <button
                                className={`sort-btn ${selectedSort === "Bán chạy" ? "active" : ""}`}
                                onClick={() => setSelectedSort("Bán chạy")}
                            >
                                Bán chạy
                            </button>

                            <select
                                className="price-select"
                                value={selectedSort}
                                onChange={(e) => setSelectedSort(e.target.value)}
                            >
                                <option value="Phổ biến">Giá</option>
                                <option value="Giá tăng dần">Giá tăng dần</option>
                                <option value="Giá giảm dần">Giá giảm dần</option>
                            </select>
                        </div>

                        <div className="toolbar-right">
                            <span className="result-count">
                                {totalElements > 0
                                    ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalElements)}`
                                    : "0"} của {totalElements} sản phẩm
                            </span>
                        </div>
                    </div>

                    <div className="product-grid">
                        {paginatedProducts.length > 0 ? (
                            paginatedProducts.map((product) => {
                                const resolvedBadges = [];
                                if (product.farmerOrganicUrl || product.organicUrl) resolvedBadges.push("HỮU CƠ");
                                if (product.farmerVietgapUrl || product.vietgapUrl) resolvedBadges.push("VIETGAP");
                                if (product.farmerGlobalgapUrl || product.globalgapUrl) resolvedBadges.push("GLOBALGAP");
                                if (resolvedBadges.length === 0) resolvedBadges.push("NÔNG SẢN");

                                return (
                                    <div
                                        className="product-card"
                                        key={product.id}
                                        onClick={() => navigate(`/products/${product.id}`)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className="product-image-wrap">
                                            <img src={product.imageUrl || product.image} alt={product.name} className="product-image" />
                                            <button
                                                className={`wishlist-btn ${wishlistIds.has(String(product.id)) ? "active" : ""}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleWishlist(product.id);
                                                }}
                                            >
                                                {wishlistIds.has(String(product.id)) ? "♥" : "♡"}
                                            </button>

                                            <div className="badge-row">
                                                {resolvedBadges.map((badge, index) => (
                                                    <span className="badge" key={index}>
                                                        {badge}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="product-body">
                                            <div className="product-top-row">
                                                <span className="product-category">{product.category}</span>
                                                <span className="product-rating" style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                                                    <Star size={14} style={{ fill: "#f59e0b", stroke: "#f59e0b" }} />
                                                    {product.rating ? Number(product.rating).toFixed(1) : "0.0"}
                                                </span>
                                            </div>

                                            <h4 className="product-name">{product.name}</h4>
                                            <p className="product-shop">
                                                {product.farmerName || product.shopName} • {product.farmLocation || product.location}
                                            </p>

                                            <div className="price-row">
                                                <div>
                                                    <span className="product-price">{formatPrice(product.price)}đ</span>
                                                    <span className="product-unit"> / {product.unit}</span>
                                                </div>
                                                <button
                                                    className="add-cart-btn"
                                                    aria-label="Thêm vào giỏ hàng"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToCart(product);
                                                    }}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="9" cy="21" r="1"></circle>
                                                        <circle cx="20" cy="21" r="1"></circle>
                                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                                        <line x1="12" y1="10" x2="16" y2="10"></line>
                                                        <line x1="14" y1="8" x2="14" y2="12"></line>
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="product-footer">
                                                <span>Đã bán {formatSold(product.sold)}</span>
                                                <span className="stock">{product.stock > 0 ? "Còn hàng" : "Hết hàng"}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty-state">
                                Không tìm thấy sản phẩm phù hợp.
                            </div>
                        )}

                        <div className="promo-card">
                            <div className="promo-content">
                                <h3>Miễn phí vận chuyển cho đơn từ 200k!</h3>
                                <p>
                                    Áp dụng cho tất cả các sản phẩm rau củ quả trong tuần lễ nông sản sạch.
                                </p>
                                <button>Xem chi tiết →</button>
                            </div>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="pagination">
                        <button
                            className="page-btn"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        >
                            ‹
                        </button>

                        {Array.from({ length: totalPages || 1 }).map((_, index) => {
                            const page = index + 1;
                            return (
                                <button
                                    key={page}
                                    className={`page-btn ${currentPage === page ? "active" : ""}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            className="page-btn"
                            onClick={() =>
                                setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))
                            }
                        >
                            ›
                        </button>
                    </div>
                </section>
            </main>

            <Footer />

            {toastMessage && (
                <div className={`pl-toast pl-toast-${toastType}`}>
                    {toastType === "success" ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    ) : toastType === "error" ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    )}
                    <span>{toastMessage}</span>
                </div>
            )}
        </div>
    );
}
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header/Header";
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
    const [currentPage, setCurrentPage] = useState(1);
    const locationFilterRef = useRef(null);

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
            setDebouncedPriceMin(parseCurrencyInput(priceMinInput));
            setDebouncedPriceMax(parseCurrencyInput(priceMaxInput));
            setCurrentPage(1);
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [priceMinInput, priceMaxInput]);

    const itemsPerPage = 6;

    const filteredLocationOptions = useMemo(() => {
        const query = normalizeLocation(locationQuery);
        return mockLocations.filter((location) => {
            if (!query) return true;
            return normalizeLocation(location).includes(query);
        });
    }, [locationQuery]);

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

    const filteredProducts = useMemo(() => {
        let result = [...mockProducts];

        // Lọc theo danh mục
        if (selectedCategory) {
            result = result.filter((item) => item.category === selectedCategory);
        }

        // Lọc theo nơi bán
        if (selectedLocations.length > 0) {
            result = result.filter((item) => {
                const itemLocation = normalizeLocation(item.location);
                return selectedLocations.some((location) =>
                    itemLocation.includes(normalizeLocation(location))
                );
            });
        }

        // Lọc theo tên cửa hàng
        if (shopKeyword.trim()) {
            result = result.filter((item) =>
                item.shopName.toLowerCase().includes(shopKeyword.toLowerCase())
            );
        }

        // Lọc theo giá tiền
        if (debouncedPriceMin !== null) {
            result = result.filter((item) => item.price >= debouncedPriceMin);
        }
        if (debouncedPriceMax !== null) {
            result = result.filter((item) => item.price <= debouncedPriceMax);
        }

        // Lọc theo đánh giá
        if (selectedRating > 0) {
            result = result.filter((item) => item.rating >= selectedRating);
        }

        // Sắp xếp
        if (selectedSort === "Mới nhất") {
            // TODO BACKEND:
            // Khi có backend, nên sắp xếp theo createdAt từ API
            result = [...result].reverse();
        } else if (selectedSort === "Bán chạy") {
            // TODO BACKEND:
            // Khi có backend, thay bằng totalSold thật từ API
            result = [...result].sort((a, b) => parseFloat(b.sold) - parseFloat(a.sold));
        } else if (selectedSort === "Giá tăng dần") {
            result = [...result].sort((a, b) => a.price - b.price);
        } else if (selectedSort === "Giá giảm dần") {
            result = [...result].sort((a, b) => b.price - a.price);
        }

        return result;
    }, [selectedCategory, selectedLocations, shopKeyword, debouncedPriceMin, debouncedPriceMax, selectedRating, selectedSort]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
                                        >
                                            <span className="multi-select-option-label">Tất cả nơi bán</span>
                                            <span className="multi-select-option-check">
                                                {selectedLocations.length === 0 ? "✓" : ""}
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
                                                >
                                                    <span className="multi-select-option-label">{location}</span>
                                                    <span className="multi-select-option-check">
                                                        {isSelected ? "✓" : ""}
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
                                        className="price-range-input price-range-input-with-suffix"
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
                                        className="price-range-input price-range-input-with-suffix"
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
                                {filteredProducts.length > 0 ? "1" : "0"}-
                                {Math.min(currentPage * itemsPerPage, filteredProducts.length)} của{" "}
                                {filteredProducts.length} sản phẩm
                            </span>
                        </div>
                    </div>

                    <div className="product-grid">
                        {paginatedProducts.length > 0 ? (
                            paginatedProducts.map((product) => (
                                <div className="product-card" key={product.id}>
                                    <div className="product-image-wrap">
                                        <img src={product.image} alt={product.name} className="product-image" />
                                        <button className="wishlist-btn">♡</button>

                                        <div className="badge-row">
                                            {product.badges.map((badge, index) => (
                                                <span className="badge" key={index}>
                                                    {badge}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="product-body">
                                        <div className="product-top-row">
                                            <span className="product-category">{product.category}</span>
                                            <span className="product-rating">⭐ {product.rating}</span>
                                        </div>

                                        <h4 className="product-name">{product.name}</h4>
                                        <p className="product-shop">
                                            {product.shopName} • {product.location}
                                        </p>

                                        <div className="price-row">
                                            <div>
                                                <span className="product-price">{formatPrice(product.price)}đ</span>
                                                <span className="product-unit"> / {product.unit}</span>
                                            </div>
                                            <button className="add-cart-btn">🛒</button>
                                        </div>

                                        <div className="product-footer">
                                            <span>Đã bán {product.sold}</span>
                                            <span className="stock">{product.stockStatus}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
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

            {/* ================= FOOTER ================= */}
            <footer className="product-footer-main">
                <div className="footer-brand">
                    <h4>FarmConnect</h4>
                    <p>
                        Kết nối trực tiếp người tiêu dùng với các nông trại uy tín, mang đến nguồn thực
                        phẩm tươi sạch và minh bạch mỗi ngày.
                    </p>
                </div>

                <div className="footer-bottom">
                    <span>© 2024 FarmConnect. Cultivating Digital Growth.</span>
                    <div className="footer-icons">
                        <span>⌁</span>
                        <span>◎</span>
                        <span>✆</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
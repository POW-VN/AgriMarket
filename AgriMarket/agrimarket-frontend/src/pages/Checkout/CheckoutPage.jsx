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
import Header from "../../components/common/Header/Header";
import { MapPicker } from "../../components/MapPicker/MapPicker";
import apiClient from "../../services/apiClient";

// Geocode address using Nominatim (sequential to avoid rate-limiting)
const geocodeAddressIfNeeded = async (addressStr) => {
    if (!addressStr) return null;
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressStr)}&format=json&limit=1`, {
            headers: {
                "User-Agent": "AgriMarket-Application/1.0",
            }
        });
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                };
            }
        }
    } catch (e) {
        console.error("Geocoding failed for address:", addressStr, e);
    }
    return null;
};

// Calculate distance in km between two GPS coordinates using Haversine formula
const getHaversineDistance = (lat1, lon1, lat2, lon2) => {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

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
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);
    const [showAddressSelector, setShowAddressSelector] = useState(false);

    // Payment method
    const [paymentMethod, setPaymentMethod] = useState("cod"); // cod, vnpay

    // Form Validation errors
    const [errors, setErrors] = useState({});

    // Success State (Used for COD)
    const [isSuccess, setIsSuccess] = useState(false);
    const [placedOrder, setPlacedOrder] = useState(null);
    const [cartItemsCount, setCartItemsCount] = useState(0);
    
    // Farmer coordinates & max shipping distance
    const [farmerCoords, setFarmerCoords] = useState(null);

    // Generate static order ID on component load for tracking
    const orderId = useMemo(() => {
        return "FH-2026-" + Math.floor(1000 + Math.random() * 9000);
    }, []);

    // Format VND
    const formatVND = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price) + " đ";
    };

    // Helper to get distance & validity info for an address
    const getAddressDistanceInfo = (addr) => {
        if (!farmerCoords || addr.latitude == null || addr.longitude == null) {
            return { distance: null, isValid: true, message: "" };
        }
        if (farmerCoords.latitude == null || farmerCoords.longitude == null) {
            return { distance: null, isValid: true, message: "" };
        }
        const dist = getHaversineDistance(
            parseFloat(addr.latitude),
            parseFloat(addr.longitude),
            farmerCoords.latitude,
            farmerCoords.longitude
        );
        if (dist === null) {
            return { distance: null, isValid: true, message: "" };
        }
        const isValid = dist <= farmerCoords.maxDistance;
        return {
            distance: dist.toFixed(1),
            isValid,
            message: isValid 
                ? `Khoảng cách: ${dist.toFixed(1)} km (Hợp lệ)` 
                : `Khoảng cách: ${dist.toFixed(1)} km (Vượt giới hạn giao hàng ${farmerCoords.maxDistance} km của nhà vườn)`
        };
    };

    // Calculate active selected address distance info
    const activeDistanceInfo = useMemo(() => {
        if (selectedAddressIndex !== -1) {
            const addr = savedAddresses[selectedAddressIndex];
            if (addr) {
                return getAddressDistanceInfo(addr);
            }
        } else {
            if (latitude != null && longitude != null) {
                return getAddressDistanceInfo({ latitude, longitude });
            }
        }
        return { distance: null, isValid: true, message: "" };
    }, [selectedAddressIndex, savedAddresses, latitude, longitude, farmerCoords]);

    // Fetch farmer coordinates & max delivery distance when checkoutData is loaded
    useEffect(() => {
        if (checkoutData && checkoutData.selectedItems && checkoutData.selectedItems.length > 0) {
            const fetchFarmerCoords = async () => {
                try {
                    const prodId = checkoutData.selectedItems[0].id;
                    const res = await apiClient.get(`/api/products/${prodId}`);
                    if (res && res.data) {
                        const lat = res.data.farmerLatitude;
                        const lng = res.data.farmerLongitude;
                        const maxDist = res.data.limitDistance || res.data.farmerMaxDeliveryDistance || 15.0; // fallback standard limit
                        setFarmerCoords({
                            latitude: lat != null ? parseFloat(lat) : null,
                            longitude: lng != null ? parseFloat(lng) : null,
                            maxDistance: maxDist != null ? parseFloat(maxDist) : 15.0,
                            farmName: res.data.farmerName || ""
                        });
                        console.log("Loaded farmer coordinates and delivery limit:", { lat, lng, maxDist });
                    }
                } catch (err) {
                    console.error("Lỗi khi lấy thông tin toạ độ nhà vườn:", err);
                }
            };
            fetchFarmerCoords();
        }
    }, [checkoutData]);

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

                    const profileAddr = profile.addresses || [];

                    // Fetch previous orders
                    let orderAddr = [];
                    try {
                        const prevOrders = await orderService.getCustomerOrders();
                        if (prevOrders && Array.isArray(prevOrders)) {
                            orderAddr = prevOrders.map(o => ({
                                receiverName: o.recipient || profile.fullName || "",
                                phone: o.phone || profile.phone || "",
                                address: o.address || "",
                                isDefault: false,
                                latitude: null,
                                longitude: null,
                            }));
                        }
                    } catch (err) {
                        console.warn("Failed to fetch previous orders:", err);
                    }

                    // Merge unique addresses
                    const merged = [];

                    // Add default address from profile
                    const defaultAddrObj = profileAddr.find(a => a.isDefault);
                    if (defaultAddrObj) {
                        merged.push({
                            ...defaultAddrObj,
                            isDefault: true,
                        });
                    }

                    // Add previous order addresses (DO NOT add other profile addresses)
                    orderAddr.forEach(a => {
                        if (a.address && !merged.some(m => m.address.trim().toLowerCase() === a.address.trim().toLowerCase())) {
                            // Find corresponding coordinates in DB profile addresses if any
                            const matchInDB = profileAddr.find(pa => pa.address.trim().toLowerCase() === a.address.trim().toLowerCase());
                            if (matchInDB) {
                                a.latitude = matchInDB.latitude;
                                a.longitude = matchInDB.longitude;
                            }
                            merged.push(a);
                        }
                    });

                    // Geocode sequentially any historical address that has null coordinates
                    const resolvedAddresses = [];
                    for (let i = 0; i < merged.length; i++) {
                        const addr = merged[i];
                        if (addr.latitude == null || addr.longitude == null) {
                            if (i > 0) {
                                await new Promise(resolve => setTimeout(resolve, 500));
                            }
                            const coords = await geocodeAddressIfNeeded(addr.address);
                            if (coords) {
                                resolvedAddresses.push({
                                    ...addr,
                                    latitude: coords.latitude,
                                    longitude: coords.longitude
                                });
                                continue;
                            }
                        }
                        resolvedAddresses.push(addr);
                    }

                    setSavedAddresses(resolvedAddresses);

                    // Determine index of default address
                    let selectedIdx = resolvedAddresses.findIndex(m => m.isDefault);
                    if (selectedIdx === -1 && resolvedAddresses.length > 0) {
                        selectedIdx = 0; // fallback to first
                    }

                    setSelectedAddressIndex(selectedIdx);

                    // Setup fields based on selected address
                    const activeAddr = selectedIdx !== -1 ? resolvedAddresses[selectedIdx] : null;
                    if (activeAddr) {
                        setRecipientName(activeAddr.receiverName || profile.fullName || "");
                        setRecipientPhone(activeAddr.phone || profile.phone || "");
                        setLatitude(activeAddr.latitude || null);
                        setLongitude(activeAddr.longitude || null);

                        const parsed = addressService.parseAddress(activeAddr.address);
                        setAddrStreet(parsed.street || "");

                        if (parsed.province) {
                            const normProv = addressService.normalizeName(parsed.province);
                            const provinceMatch = provinces.find(
                                (p) => addressService.normalizeName(p.name) === normProv
                            );

                            if (provinceMatch) {
                                const provCode = provinceMatch.code;
                                setAddrProvince({ code: String(provCode), name: provinceMatch.name });

                                const dists = await addressService.getDistricts(provCode);
                                setDistricts(dists);

                                const normDist = addressService.normalizeName(parsed.district);
                                const districtMatch = dists.find(
                                    (d) => addressService.normalizeName(d.name) === normDist
                                );

                                if (districtMatch) {
                                    const distCode = districtMatch.code;
                                    setAddrDistrict({ code: String(distCode), name: districtMatch.name });

                                    const wds = await addressService.getWards(distCode);
                                    setWards(wds);

                                    const normWard = addressService.normalizeName(parsed.ward);
                                    const wardMatch = wds.find(
                                        (w) => addressService.normalizeName(w.name) === normWard
                                    );

                                    if (wardMatch) {
                                        setAddrWard({ code: String(wardMatch.code), name: wardMatch.name });
                                    }
                                }
                            }
                        }
                    } else {
                        setRecipientName(profile.fullName || "");
                        setRecipientPhone(profile.phone || "");
                        setLatitude(null);
                        setLongitude(null);
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
            setLatitude(null);
            setLongitude(null);
            const dists = await addressService.getDistricts(provinceCode);
            setDistricts(dists);
        } else {
            setAddrProvince({ code: "", name: "" });
            setAddrDistrict({ code: "", name: "" });
            setAddrWard({ code: "", name: "" });
            setDistricts([]);
            setWards([]);
            setLatitude(null);
            setLongitude(null);
        }
    };

    const handleDistrictChange = async (e) => {
        const districtCode = e.target.value;
        const districtObj = districts.find((d) => d.code === parseInt(districtCode));
        if (districtObj) {
            setAddrDistrict({ code: districtCode, name: districtObj.name });
            setAddrWard({ code: "", name: "" });
            setLatitude(null);
            setLongitude(null);
            const wds = await addressService.getWards(districtCode);
            setWards(wds);
        } else {
            setAddrDistrict({ code: "", name: "" });
            setAddrWard({ code: "", name: "" });
            setWards([]);
            setLatitude(null);
            setLongitude(null);
        }
    };

    const handleWardChange = (e) => {
        const wardCode = e.target.value;
        const wardObj = wards.find((w) => w.code === parseInt(wardCode));
        if (wardObj) {
            setAddrWard({ code: wardCode, name: wardObj.name });
            if (!latitude || !longitude) {
                setLatitude(null);
                setLongitude(null);
            }
        } else {
            setAddrWard({ code: "", name: "" });
            if (!latitude || !longitude) {
                setLatitude(null);
                setLongitude(null);
            }
        }
    };

    const selectSavedAddress = async (index) => {
        setSelectedAddressIndex(index);
        if (index === -1) {
            setRecipientName("");
            setRecipientPhone("");
            setAddrProvince({ code: "", name: "" });
            setAddrDistrict({ code: "", name: "" });
            setAddrWard({ code: "", name: "" });
            setAddrStreet("");
            setLatitude(null);
            setLongitude(null);
            setDistricts([]);
            setWards([]);
            return;
        }

        const selected = savedAddresses[index];
        setRecipientName(selected.receiverName || "");
        setRecipientPhone(selected.phone || "");
        setLatitude(selected.latitude || null);
        setLongitude(selected.longitude || null);

        const parsed = addressService.parseAddress(selected.address);
        setAddrStreet(parsed.street || "");

        if (parsed.province) {
            const normProv = addressService.normalizeName(parsed.province);
            const provinceMatch = provinces.find(
                (p) => addressService.normalizeName(p.name) === normProv
            );

            if (provinceMatch) {
                const provCode = provinceMatch.code;
                setAddrProvince({ code: String(provCode), name: provinceMatch.name });

                const dists = await addressService.getDistricts(provCode);
                setDistricts(dists);

                const normDist = addressService.normalizeName(parsed.district);
                const districtMatch = dists.find(
                    (d) => addressService.normalizeName(d.name) === normDist
                );

                if (districtMatch) {
                    const distCode = districtMatch.code;
                    setAddrDistrict({ code: String(distCode), name: districtMatch.name });

                    const wds = await addressService.getWards(distCode);
                    setWards(wds);

                    const normWard = addressService.normalizeName(parsed.ward);
                    const wardMatch = wds.find(
                        (w) => addressService.normalizeName(w.name) === normWard
                    );

                    if (wardMatch) {
                        setAddrWard({ code: String(wardMatch.code), name: wardMatch.name });
                    } else {
                        setAddrWard({ code: "", name: "" });
                    }
                } else {
                    setAddrDistrict({ code: "", name: "" });
                    setAddrWard({ code: "", name: "" });
                    setWards([]);
                }
            } else {
                setAddrProvince({ code: "", name: "" });
                setAddrDistrict({ code: "", name: "" });
                setAddrWard({ code: "", name: "" });
                setDistricts([]);
                setWards([]);
            }
        }
    };

    const handleMapLocationChange = async (lat, lng) => {
        setLatitude(lat);
        setLongitude(lng);

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=vi`, {
                headers: {
                    "User-Agent": "AgriMarket-Application/1.0",
                },
            });
            if (res.ok) {
                const data = await res.json();
                if (data && data.address) {
                    const addr = data.address;
                    const streetName = addr.road || addr.suburb || addr.neighbourhood || "";
                    const houseNo = addr.house_number || "";
                    const streetValue = houseNo ? `${houseNo} ${streetName}` : streetName;
                    
                    if (streetValue) {
                        setAddrStreet(streetValue);
                    }

                    // Match Province/City
                    const provinceCandidates = [
                        addr.city,
                        addr.province,
                        addr.state
                    ].filter(Boolean);

                    let provinceMatch = null;
                    if (provinces.length > 0) {
                        for (const candidate of provinceCandidates) {
                            const normProv = addressService.normalizeName(candidate);
                            provinceMatch = provinces.find(
                                (p) => addressService.normalizeName(p.name) === normProv
                            );
                            if (provinceMatch) break;
                        }
                    }

                    if (provinceMatch) {
                        const provCode = provinceMatch.code;
                        setAddrProvince({ code: String(provCode), name: provinceMatch.name });

                        // Load and Match District
                        const dists = await addressService.getDistricts(provCode);
                        setDistricts(dists);

                        const districtCandidates = [
                            addr.district,
                            addr.city_district,
                            addr.county,
                            addr.suburb,
                            addr.town
                        ].filter(Boolean);

                        let districtMatch = null;
                        if (dists.length > 0) {
                            for (const candidate of districtCandidates) {
                                const normDist = addressService.normalizeName(candidate);
                                districtMatch = dists.find(
                                    (d) => addressService.normalizeName(d.name) === normDist
                                );
                                if (districtMatch) break;
                            }
                        }

                        if (districtMatch) {
                            const distCode = districtMatch.code;
                            setAddrDistrict({ code: String(distCode), name: districtMatch.name });

                            // Load and Match Ward
                            const wds = await addressService.getWards(distCode);
                            setWards(wds);

                            const wardCandidates = [
                                addr.quarter,
                                addr.suburb,
                                addr.village,
                                addr.town,
                                addr.neighbourhood,
                                addr.subdistrict,
                                addr.hamlet
                            ].filter(Boolean);

                            let wardMatch = null;
                            if (wds.length > 0) {
                                for (const candidate of wardCandidates) {
                                    const normWard = addressService.normalizeName(candidate);
                                    wardMatch = wds.find(
                                        (w) => addressService.normalizeName(w.name) === normWard
                                    );
                                    if (wardMatch) break;
                                }
                            }

                            if (wardMatch) {
                                setAddrWard({ code: String(wardMatch.code), name: wardMatch.name });
                            } else {
                                setAddrWard((prev) => {
                                    const isSameDistrict = addrDistrict.name && districtMatch.name &&
                                        addressService.normalizeName(addrDistrict.name) === addressService.normalizeName(districtMatch.name);
                                    return isSameDistrict && prev.code ? prev : { code: "", name: "" };
                                });
                            }
                        } else {
                            setAddrDistrict({ code: "", name: "" });
                            setAddrWard({ code: "", name: "" });
                            setWards([]);
                        }
                    } else {
                        setAddrProvince({ code: "", name: "" });
                        setAddrDistrict({ code: "", name: "" });
                        setAddrWard({ code: "", name: "" });
                        setDistricts([]);
                        setWards([]);
                    }
                }
            }
        } catch (err) {
            console.error("Reverse geocoding failed: ", err);
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
        } else if (activeDistanceInfo.distance !== null && !activeDistanceInfo.isValid) {
            formErrors.recipientAddress = `Địa chỉ nhận hàng vượt quá khoảng cách giao hàng tối đa của nhà vườn (${farmerCoords.maxDistance} km). Vui lòng chọn địa chỉ khác.`;
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

        // Auto-save address to customer_address if not already existing
        if (profileData && profileData.role === "customer") {
            try {
                const isExisting = savedAddresses.some(
                    (a) => a.address.trim().toLowerCase() === formattedAddress.trim().toLowerCase()
                );
                if (!isExisting) {
                    await apiClient.post("/api/customers/addresses", {
                        receiverName: recipientName,
                        phone: recipientPhone,
                        address: formattedAddress,
                        latitude: latitude ? parseFloat(latitude) : null,
                        longitude: longitude ? parseFloat(longitude) : null,
                        isDefault: false
                    });
                    console.log("Saved new delivery address to customer_address.");
                }
            } catch (err) {
                console.error("Lỗi khi tự động lưu địa chỉ giao hàng mới:", err);
            }
        }

        // Auto-save phone to user profile if updated
        if (profileData && recipientPhone !== profileData.phone) {
            try {
                const updatedFormData = {
                    fullName: profileData.fullName || recipientName,
                    phone: recipientPhone,
                    avatarUrl: profileData.avatarUrl,
                    address: profileData.role === "customer" ? (profileData.addresses?.[0]?.address || "") : (profileData.addresses?.[0]?.address || ""),
                    farmAddress: profileData.role === "farmer" ? (profileData.farmAddress || "") : (profileData.farmAddress || ""),
                    farmName: profileData.farmName || "",
                    description: profileData.description || ""
                };
                const payload = buildProfileUpdatePayload(profileData.role, updatedFormData);
                await profileService.updateProfile(payload);
            } catch (err) {
                console.error("Lỗi khi cập nhật số điện thoại hồ sơ:", err);
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
            paymentMethod: paymentMethod === "cod" ? "COD" : "VNPAY",
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
                    // For online VNPAY, redirect directly
                    try {
                        const res = await orderService.createVNPayPaymentUrl(backendOrder.id);
                        if (res && res.paymentUrl) {
                            window.location.href = res.paymentUrl;
                        } else {
                            throw new Error("Không thể tạo liên kết thanh toán VNPay.");
                        }
                    } catch (payErr) {
                        console.error("Lỗi khi kết nối VNPay:", payErr);
                        alert("Không thể khởi tạo thanh toán VNPay. Vui lòng thử lại hoặc chọn phương thức thanh toán khi nhận hàng.");
                    }
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
            paymentMethod: paymentMethod === "cod" ? "COD" : "VNPAY",
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
                <Header />

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
            <Header />

            <main className="payment-main-container">
                {/* Step Indicator */}
                <div className="payment-step-indicator">
                    <div className="step-node active">
                        <span className="node-num">1</span>
                        <span className="node-label">Giỏ hàng</span>
                    </div>

                    <div className="step-connector active"></div>

                    <div className="step-node active">
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
                                <p className="form-card-subtitle">Vui lòng nhập địa chỉ nhận hàng chính xác để chúng tôi giao sản phẩm tươi ngon nhất.</p>                                {savedAddresses.length > 0 ? (
                                    <div className="shopee-address-section" style={{ marginBottom: "24px" }}>
                                        <div className="shopee-address-header">
                                            <span className="shopee-address-pin">📍</span>
                                            <span className="shopee-address-title">Địa chỉ nhận hàng</span>
                                        </div>
                                        <div className="shopee-address-content">
                                            {selectedAddressIndex !== -1 ? (
                                                <div className="shopee-active-address">
                                                    <div className="shopee-active-name-phone">
                                                        <strong>{savedAddresses[selectedAddressIndex].receiverName}</strong>
                                                        <span className="shopee-active-phone">{savedAddresses[selectedAddressIndex].phone}</span>
                                                        {savedAddresses[selectedAddressIndex].isDefault && (
                                                            <span className="shopee-default-badge">Mặc định</span>
                                                        )}
                                                    </div>
                                                    <div className="shopee-active-detail">
                                                        {savedAddresses[selectedAddressIndex].address}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="shopee-active-address">
                                                    <div className="shopee-active-name-phone">
                                                        <strong>{recipientName || "Chưa nhập họ tên"}</strong>
                                                        <span className="shopee-active-phone">{recipientPhone || "Chưa nhập SĐT"}</span>
                                                        <span className="shopee-new-badge">Địa chỉ mới</span>
                                                    </div>
                                                    <div className="shopee-active-detail">
                                                        {addressService.formatAddress({
                                                            street: addrStreet,
                                                            ward: addrWard.name,
                                                            district: addrDistrict.name,
                                                            province: addrProvince.name
                                                        }) || "Vui lòng nhập chi tiết địa chỉ bên dưới"}
                                                    </div>
                                                </div>
                                            )}
                                            {activeDistanceInfo.distance !== null && (
                                                <div 
                                                    className="shopee-active-distance-badge"
                                                    style={{
                                                        display: "inline-block",
                                                        padding: "4px 8px",
                                                        borderRadius: "4px",
                                                        backgroundColor: activeDistanceInfo.isValid ? "#e8f5e9" : "#ffebee",
                                                        color: activeDistanceInfo.isValid ? "#2e7d32" : "#c62828",
                                                        fontSize: "12.5px",
                                                        fontWeight: "bold",
                                                        marginTop: "8px"
                                                    }}
                                                >
                                                    📍 {activeDistanceInfo.message}
                                                </div>
                                            )}
                                            <button 
                                                type="button" 
                                                className="btn-change-address" 
                                                onClick={() => setShowAddressSelector(!showAddressSelector)}
                                            >
                                                {showAddressSelector ? "Đóng lại" : "Thay đổi"}
                                            </button>
                                        </div>

                                        {showAddressSelector && (
                                            <div className="shopee-address-dropdown">
                                                <div className="shopee-dropdown-header">
                                                    <h4>Chọn địa chỉ nhận hàng</h4>
                                                </div>
                                                <div className="shopee-dropdown-list">
                                                    {savedAddresses.map((addr, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            className={`shopee-dropdown-item ${selectedAddressIndex === idx ? "selected" : ""}`}
                                                            onClick={() => {
                                                                selectSavedAddress(idx);
                                                                setShowAddressSelector(false);
                                                            }}
                                                        >
                                                            <div className="shopee-radio-wrapper">
                                                                <input 
                                                                    type="radio" 
                                                                    name="selectedAddressRadio" 
                                                                    checked={selectedAddressIndex === idx} 
                                                                    readOnly
                                                                />
                                                            </div>
                                                            <div className="shopee-item-info">
                                                                <div className="shopee-item-header">
                                                                    <span className="shopee-item-name">{addr.receiverName}</span>
                                                                    <span className="shopee-item-phone">{addr.phone}</span>
                                                                    {addr.isDefault && <span className="shopee-default-badge">Mặc định</span>}
                                                                </div>
                                                                <div className="shopee-item-address">{addr.address}</div>
                                                                {(() => {
                                                                    const distInfo = getAddressDistanceInfo(addr);
                                                                    if (distInfo.distance !== null) {
                                                                        return (
                                                                            <div 
                                                                                className="shopee-item-distance" 
                                                                                style={{ 
                                                                                    color: distInfo.isValid ? "#2e7d32" : "#c62828", 
                                                                                    fontSize: "12px", 
                                                                                    fontWeight: "bold",
                                                                                    marginTop: "4px"
                                                                                }}
                                                                            >
                                                                                📍 {distInfo.message}
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })()}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div 
                                                        className={`shopee-dropdown-item ${selectedAddressIndex === -1 ? "selected" : ""}`}
                                                        onClick={() => {
                                                            selectSavedAddress(-1);
                                                            setShowAddressSelector(false);
                                                        }}
                                                    >
                                                        <div className="shopee-radio-wrapper">
                                                            <input 
                                                                type="radio" 
                                                                name="selectedAddressRadio" 
                                                                checked={selectedAddressIndex === -1} 
                                                                readOnly
                                                            />
                                                        </div>
                                                        <div className="shopee-item-info">
                                                            <div className="shopee-item-header">
                                                                <span className="shopee-item-name" style={{ fontWeight: 700 }}>Giao tới địa chỉ khác / Thêm địa chỉ mới</span>
                                                            </div>
                                                            <div className="shopee-item-address">Nhập địa chỉ mới và định vị trên bản đồ bên dưới.</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : null}

                                {selectedAddressIndex === -1 && (
                                    <div className="new-address-form-fields" style={{ animation: "fadeIn 0.3s ease" }}>
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
                                                    onChange={(e) => {
                                                        setAddrStreet(e.target.value);
                                                        if (!latitude || !longitude) {
                                                            setLatitude(null);
                                                            setLongitude(null);
                                                        }
                                                    }}
                                                    placeholder="Số nhà, ngõ, tên đường..."
                                                    className={errors.recipientAddress ? "input-err" : ""}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group full-width" style={{ marginTop: "15px", marginBottom: "20px" }}>
                                            <MapPicker
                                                latitude={latitude}
                                                longitude={longitude}
                                                onChange={handleMapLocationChange}
                                                defaultAddress={addressService.formatAddress({
                                                    street: addrStreet.trim(),
                                                    ward: addrWard.name,
                                                    district: addrDistrict.name,
                                                    province: addrProvince.name,
                                                })}
                                            />
                                        </div>

                                        {errors.recipientAddress && (
                                            <div className="form-group" style={{ marginTop: "-12px", marginBottom: "20px" }}>
                                                <span className="error-hint-text">{errors.recipientAddress}</span>
                                            </div>
                                        )}
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

                                    <label className={`method-option-card ${paymentMethod === "vnpay" ? "selected" : ""}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="vnpay"
                                            checked={paymentMethod === "vnpay"}
                                            onChange={() => setPaymentMethod("vnpay")}
                                        />
                                        <div className="method-option-info">
                                            <span className="method-icon">💳</span>
                                            <div className="method-text">
                                                <span className="method-title">Thanh toán trực tuyến qua VNPAY</span>
                                                <span className="method-desc">Thanh toán an toàn qua VietQR, thẻ ATM nội địa hoặc thẻ quốc tế Visa/Mastercard.</span>
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
                                {paymentMethod === "vnpay" && (
                                    <div className="method-detail-box cod-box">
                                        <p>🔒 Bạn sẽ được chuyển sang cổng thanh toán bảo mật VNPAY để hoàn thành giao dịch trực tuyến trị giá <strong>{formatVND(checkoutData.totalAmount)}</strong>.</p>
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

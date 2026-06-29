// src/pages/Product/ProductDetail.jsx

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import cartService from "../../services/cartService";
import { getProductById, getAllApprovedProducts } from "../../services/productService";
import reviewService from "../../services/reviewService";
import NotificationBell from "../../components/common/NotificationBell/NotificationBell";
import wishlistService from "../../services/wishlistService";
import "./ProductDetail.css";
import Header from "../../components/common/Header/Header";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Header / Auth States
  const [user, setUser] = useState(null);

  // Product Detail States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [brokenImages, setBrokenImages] = useState({});
  const [mainImageError, setMainImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [savedRelatedIds, setSavedRelatedIds] = useState(new Set());
  const [isFarmerFollowed, setIsFarmerFollowed] = useState(false);

  // Lightbox Modal States
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    setMainImageError(false);
  }, [activeImage]);

  // Related Products
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // Shipping location state
  const [selectedCity, setSelectedCity] = useState("TP. Hồ Chí Minh");
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);

  // Reviews and Rating states
  const [reviewsList, setReviewsList] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [attachedImages, setAttachedImages] = useState([]);
  const [attachedVideo, setAttachedVideo] = useState(null);

  const VIETNAM_CITIES = useMemo(() => [
    { name: "TP. Hồ Chí Minh", region: "South" },
    { name: "Hà Nội", region: "North" },
    { name: "Đà Nẵng", region: "Central" },
    { name: "Lâm Đồng", region: "Central" },
    { name: "Cần Thơ", region: "South" },
    { name: "Hải Phòng", region: "North" },
    { name: "Hưng Yên", region: "North" },
    { name: "Gia Lai", region: "Central" },
    { name: "Khánh Hòa", region: "Central" },
    { name: "Tiền Giang", region: "South" },
    { name: "Điện Biên", region: "North" }
  ], []);

  const shippingInfo = useMemo(() => {
    if (!product) return null;
    const origin = product.farmLocation || "Lâm Đồng";

    // Normalize location checking
    const isLocal = origin.toLowerCase().includes(selectedCity.toLowerCase()) ||
      (selectedCity === "Lâm Đồng" && origin.toLowerCase().includes("đà lạt"));

    if (isLocal) {
      return {
        method: "Vận chuyển hỏa tốc",
        time: "Giao nhận trong đúng 2 giờ",
        fee: 15000
      };
    }

    // Check zones
    const originRegion = origin.toLowerCase().includes("lâm đồng") ||
      origin.toLowerCase().includes("đà lạt") ||
      origin.toLowerCase().includes("gia lai") ||
      origin.toLowerCase().includes("khánh hòa") ? "Central" :
      origin.toLowerCase().includes("hưng yên") ||
        origin.toLowerCase().includes("điện biên") ||
        origin.toLowerCase().includes("hà nội") ||
        origin.toLowerCase().includes("hải phòng") ? "North" : "South";

    const targetRegion = VIETNAM_CITIES.find(c => c.name === selectedCity)?.region || "South";

    if (originRegion === targetRegion) {
      return {
        method: "Vận chuyển nội vùng",
        time: "Giao nhận trong đúng 24 giờ",
        fee: 25000
      };
    } else {
      return {
        method: "Vận chuyển liên miền",
        time: "Giao nhận trong đúng 3 ngày",
        fee: 45000
      };
    }
  }, [product, selectedCity, VIETNAM_CITIES]);

  const getFileExtension = (url) => {
    if (!url) return "";
    return url.split('.').pop().split('?')[0].toLowerCase();
  };

  const allImages = useMemo(() => {
    if (!product) return [];
    const imgs = [];
    if (product.images && product.images.length > 0) {
      imgs.push(...product.images);
    } else if (product.imageUrl) {
      imgs.push(product.imageUrl);
    }
    // Append traceability image URL if exists
    if (product.traceabilityImageUrl && !imgs.includes(product.traceabilityImageUrl)) {
      imgs.push(product.traceabilityImageUrl);
    }
    return imgs.filter(Boolean);
  }, [product]);

  // Lightbox keydown event listener
  useEffect(() => {
    if (!isLightboxOpen || allImages.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, allImages]);

  const triggerToast = (message, type = "success") => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    // Sync current user for header
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    if (currentUser && currentUser.fullName) {
      setNewAuthor(currentUser.fullName);
    }

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
  }, []);

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        setProduct(data);
        
        const [savedStatus, followStatus, savedIds] = await Promise.all([
          wishlistService.isWishlistItem(id),
          wishlistService.isFarmerFollowed(data.farmerId),
          wishlistService.getWishlistIds()
        ]);
        
        setIsSaved(savedStatus);
        setIsFarmerFollowed(followStatus);
        setSavedRelatedIds(new Set(savedIds.map(String)));

        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0]);
        } else {
          setActiveImage(data.imageUrl);
        }
        if (data.stock === 0) {
          setQuantity(0);
        } else {
          setQuantity(1);
        }

        // Fetch reviews from backend
        try {
          const dbReviews = await reviewService.getReviewsByProductId(id);
          setReviewsList(dbReviews || []);
        } catch (err) {
          console.error("Lỗi khi tải đánh giá từ backend:", err);
          setReviewsList([]);
        }

        // Fetch related products
        // Let's create related products matching the mockup if it's the carrot product
        if (id === "mock-2" || data.name.toLowerCase().includes("cà rốt") || data.name.toLowerCase().includes("carrot")) {
          setRelatedProducts([
            {
              id: "related-1",
              name: "Củ dền đỏ hữu cơ",
              price: 75000,
              unit: "bó",
              imageUrl: "https://images.unsplash.com/photo-1445280471656-618bf9abcfe0?w=600", // Beets
            },
            {
              id: "related-2",
              name: "Xà lách hỗn hợp Spring Mix",
              price: 137500,
              unit: "túi",
              imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600", // Greens
            },
            {
              id: "related-3",
              name: "Khoai tây Yukon Gold",
              price: 100000,
              unit: "túi",
              imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600", // Potatoes
            },
            {
              id: "related-4",
              name: "Củ cải đường French Breakfast",
              price: 62500,
              unit: "bó",
              imageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600", // Radish
            }
          ]);
        } else {
          // General fallback for related products: fetch approved products from the same category
          const all = await getAllApprovedProducts();
          const filtered = all
            .filter((p) => String(p.id) !== String(id) && p.category === data.category)
            .slice(0, 4);

          if (filtered.length < 4) {
            // Fill with other categories
            const others = all.filter((p) => String(p.id) !== String(id) && p.category !== data.category);
            const combined = [...filtered, ...others].slice(0, 4);
            setRelatedProducts(combined);
          } else {
            setRelatedProducts(filtered);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRelated();
  }, [id]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate("/");
  };

  const handleQuantityChange = (val) => {
    if (!product || product.stock === 0) return;
    const currentQty = parseInt(quantity, 10) || 1;
    const newQty = currentQty + val;
    const maxStock = product.stock !== undefined && product.stock !== null ? product.stock : 100;
    if (newQty >= 1 && newQty <= maxStock) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return;
    const qtyToUse = parseInt(quantity, 10) || 1;

    if (user) {
      try {
        const data = await cartService.addToCart(product.id, qtyToUse);
        setCartItemsCount(data.length);
        triggerToast(`Đã thêm ${qtyToUse} ${product.unit} "${product.name}" vào giỏ hàng!`);
      } catch (err) {
        console.error("Lỗi khi thêm vào giỏ hàng:", err);
        triggerToast("Không thể thêm vào giỏ hàng. Vui lòng thử lại!");
      }
    } else {
      const cartKey = "agrimarket_cart";
      const currentCart = JSON.parse(localStorage.getItem(cartKey)) || [];
      const existingIndex = currentCart.findIndex(item => String(item.id) === String(product.id));

      if (existingIndex > -1) {
        const newQty = currentCart[existingIndex].quantity + qtyToUse;
        if (product.stock !== undefined && newQty > product.stock) {
          triggerToast(`Không thể thêm số lượng vượt quá tồn kho hiện có (${product.stock}).`);
          return;
        }
        currentCart[existingIndex].quantity = newQty;
      } else {
        if (product.stock !== undefined && qtyToUse > product.stock) {
          triggerToast(`Không thể thêm số lượng vượt quá tồn kho hiện có (${product.stock}).`);
          return;
        }
        currentCart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          imageUrl: product.imageUrl,
          quantity: qtyToUse,
          checked: true,
          stockQuantity: product.stock,
          farmerId: product.farmerId,
          farmerName: product.farmerName
        });
      }
      localStorage.setItem(cartKey, JSON.stringify(currentCart));
      setCartItemsCount(currentCart.length);
      triggerToast(`Đã thêm ${qtyToUse} ${product.unit} "${product.name}" vào giỏ hàng!`);
    }
  };

  const handleBuyNow = async () => {
    if (!product || product.stock === 0) return;
    await handleAddToCart();
    navigate("/cart");
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (attachedImages.length + files.length > 3) {
      triggerToast("Bạn chỉ được tải lên tối đa 3 hình ảnh!");
      return;
    }
    const newUrls = files.map(file => URL.createObjectURL(file));
    setAttachedImages(prev => [...prev, ...newUrls]);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (attachedVideo) {
        URL.revokeObjectURL(attachedVideo);
      }
      const newUrl = URL.createObjectURL(file);
      setAttachedVideo(newUrl);
    }
  };

  const removeAttachedImage = (index) => {
    const urlToRemove = attachedImages[index];
    if (urlToRemove) {
      URL.revokeObjectURL(urlToRemove);
    }
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeAttachedVideo = () => {
    if (attachedVideo) {
      URL.revokeObjectURL(attachedVideo);
    }
    setAttachedVideo(null);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      triggerToast("Vui lòng điền nội dung nhận xét!");
      return;
    }

    const authorNameToUse = newAuthor.trim() || (user ? user.fullName : "") || "Khách hàng ẩn danh";
    const dateToday = new Date().toISOString().split("T")[0];

    const newReviewObj = {
      id: Date.now(),
      author: authorNameToUse,
      rating: newRating,
      date: dateToday,
      comment: newComment.trim(),
      images: attachedImages,
      video: attachedVideo
    };

    const updatedReviews = [newReviewObj, ...reviewsList];
    setReviewsList(updatedReviews);

    // Tính toán lại rating trung bình và lượt nhận xét
    if (product) {
      const currentReviewsCount = product.reviewsCount || 0;
      const currentRating = product.rating || 4.5;
      const totalScore = currentRating * currentReviewsCount;
      const newReviewsCount = currentReviewsCount + 1;
      const newAvgRating = parseFloat(((totalScore + newRating) / newReviewsCount).toFixed(1));

      setProduct(prev => ({
        ...prev,
        rating: newAvgRating,
        reviewsCount: newReviewsCount
      }));
    }

    setNewComment("");
    setNewRating(5);
    setAttachedImages([]);
    setAttachedVideo(null);
    if (!user) {
      setNewAuthor("");
    }
    triggerToast("Gửi nhận xét thành công! Xin cảm ơn phản hồi của bạn.");
  };

  const agriDetails = useMemo(() => {
    if (!product) return {};
    const idStr = String(product.id);
    const nameLower = product.name.toLowerCase();

    // 1. Cà chua (Tomato - mock-1)
    if (idStr === "mock-1" || nameLower.includes("cà chua") || nameLower.includes("tomato")) {
      return {
        story: {
          originStory: "Giống cà chua Heirloom cổ điển được canh tác tại trang trại Happy Farm ở Lâm Đồng. Hạt giống được lưu truyền qua nhiều thế hệ giúp quả giữ nguyên hương vị mộc mạc thuở xưa.",
          farmingMethod: "Trồng trong nhà màng tự nhiên, sử dụng các loài thiên địch để kiểm soát sâu bệnh sinh học, nói không với thuốc trừ sâu hóa học.",
          growingConditions: "Đón nhận nắng ấm cao nguyên hơn 8 tiếng mỗi ngày cùng đất tơi xốp giàu dinh dưỡng vi sinh.",
          seasonality: "Được thu hoạch đúng vụ khi quả chín đỏ mọng tự nhiên 100% trên cây, mang lại vị ngon đậm đà nhất.",
          uniqueness: "Quả có kết cấu nhiều bột mịn cát, mọng nước, vị ngọt dịu xen lẫn chút chua nhẹ rất tự nhiên.",
          sustainability: "Hệ thống tưới nhỏ giọt tiết kiệm nước và giá thể trồng từ xơ dừa hữu cơ tái chế."
        },
        highlights: [
          { text: "Chín cây tự nhiên", icon: "🍅" },
          { text: "Nhiều bột mọng nước", icon: "💦" },
          { text: "Không thuốc trừ sâu", icon: "🌱" },
          { text: "Hữu cơ sinh học", icon: "🌾" },
          { text: "Thu hoạch thủ công", icon: "🙌" }
        ],
        nutrition: {
          calories: "18 kcal / 100g",
          water: "94.5%",
          fiber: "1.2g",
          fiberPercent: 5,
          vitaminC: "13.7mg",
          vitaminCPercent: 23,
          potassium: "237mg",
          potassiumPercent: 5,
          lycopene: "3025mcg",
          lycopenePercent: 15
        },
        usage: [
          { text: "Nấu nước sốt mì Ý hoặc sốt cà chua đậm đà", icon: "🍝" },
          { text: "Làm salad tươi mát giải nhiệt mùa hè", icon: "🥗" },
          { text: "Xay sinh tố dinh dưỡng đẹp da", icon: "🍹" },
          { text: "Ăn sống kèm muối ớt hoặc làm món xào", icon: "🍽️" }
        ],
        storage: {
          temp: "18°C - 22°C (Nhiệt độ phòng thoáng mát)",
          life: "5 - 7 ngày",
          guide: "Nên xếp cuống cà chua hướng lên trên để quả không bị đè dập. Không để trong tủ lạnh khi quả chưa chín hoàn toàn vì hơi lạnh sẽ làm ngừng quá trình chín tự nhiên, khiến quả bị bở và giảm bớt mùi thơm."
        },
        faq: [
          {
            q: "Tại sao không nên cất cà chua vào tủ lạnh ngay khi mua về?",
            a: "Nhiệt độ lạnh dưới 10°C sẽ làm phá hủy màng tế bào của cà chua chưa chín, ngăn cản quá trình tạo ra các chất tạo mùi thơm tự nhiên, làm cà chua bị bở và nhạt vị. Bạn nên để cà chua chín tự nhiên ở nhiệt độ phòng, sau khi chín đỏ đều mới cất tủ lạnh ăn dần trong vòng 2 ngày."
          },
          {
            q: "Sản phẩm có phun thuốc kích thích chín đỏ nhanh không?",
            a: "Tuyệt đối không. Cà chua tại Happy Farm được cam kết để chín đỏ tự nhiên trên cây và thu hoạch tỉ mỉ bằng tay. Chúng tôi cam kết nói không với hóa chất giấm chín hóa học."
          },
          {
            q: "Làm thế nào để rửa sạch cà chua an toàn?",
            a: "Bạn chỉ cần rửa nhẹ nhàng dưới vòi nước chảy để loại bỏ lớp bụi mỏng bên ngoài quả. Không nên ngâm trong nước muối quá đậm hoặc quá lâu vì có thể làm mềm vỏ quả và giảm vị ngon ngọt."
          }
        ]
      };
    }

    // 2. Cà rốt (Carrot - mock-2)
    if (idStr === "mock-2" || nameLower.includes("cà rốt") || nameLower.includes("carrot")) {
      return {
        story: {
          originStory: "Cà rốt giống cổ Heirloom được gieo trồng tại thung lũng đất đỏ bazan giàu khoáng chất của nông trại Green Valley tại Đà Lạt, Lâm Đồng. Đất sạch và khí hậu ôn đới lý tưởng giúp củ phát triển khỏe mạnh.",
          farmingMethod: "Canh tác hữu cơ sinh học hoàn toàn. Sử dụng phân trùn quế tự nhiên để làm giàu dinh dưỡng cho đất mà không sử dụng hóa chất kích thích sinh trưởng.",
          growingConditions: "Thời gian sinh trưởng dài hơn giúp củ cà rốt tích tụ tối đa hàm lượng vitamin A cùng khoáng chất ngầm từ lòng đất sâu.",
          seasonality: "Được thu hoạch thủ công vào sáng sớm khi củ đạt độ giòn và mọng nước cao nhất, giữ được độ ngọt đậm đà vốn có.",
          uniqueness: "Thân củ màu cam đậm đặc trưng nhờ hàm lượng Beta-Carotene vượt trội, lõi nhỏ dẻo, ngọt và không bị xơ cứng.",
          sustainability: "Phương pháp canh tác bảo vệ lớp đất mặt, đóng gói quấn lá chuối xanh tươi và buộc bằng dây đay thiên nhiên thân thiện môi trường."
        },
        highlights: [
          { text: "Ngọt đậm đà tự nhiên", icon: "🥕" },
          { text: "Beta-Carotene cao", icon: "✨" },
          { text: "Không hóa chất bảo quản", icon: "🛡️" },
          { text: "Trồng đất Bazan Đà Lạt", icon: "⛰️" },
          { text: "Đóng gói lá chuối", icon: "🍃" }
        ],
        nutrition: {
          calories: "41 kcal / 100g",
          water: "88.0%",
          fiber: "2.8g",
          fiberPercent: 11,
          vitaminC: "5.9mg",
          vitaminCPercent: 10,
          potassium: "320mg",
          potassiumPercent: 9,
          vitaminA: "835mcg",
          vitaminAPercent: 93
        },
        usage: [
          { text: "Ép nước detox kết hợp táo, gừng giúp đẹp da", icon: "🍹" },
          { text: "Nấu súp dinh dưỡng hoặc cháo ăn dặm cho trẻ em", icon: "🥣" },
          { text: "Bào sợi trộn nộm salad giòn sần sật", icon: "🥗" },
          { text: "Ăn sống trực tiếp như một món snack lành mạnh", icon: "🥕" }
        ],
        storage: {
          temp: "3°C - 5°C (Ngăn rau củ của tủ lạnh)",
          life: "7 - 10 ngày",
          guide: "Nếu chưa chế biến ngay, hãy giữ nguyên lớp đất đỏ bám quanh củ. Khi cất vào tủ lạnh, cắt bỏ bớt phần lá xanh sát cuống để tránh mất nước, bọc củ bằng giấy báo hoặc khăn giấy khô rồi đặt vào túi kéo kín để hút ẩm thừa."
        },
        faq: [
          {
            q: "Tại sao cà rốt khi giao tới vẫn còn bám đất đỏ bazan?",
            a: "Lớp đất bazan tự nhiên bọc ngoài củ hoạt động như một lớp màng sinh học bảo vệ cà rốt khỏi mất nước và ngăn cản sự xâm nhập của vi khuẩn gây thối nhũn. Giữ nguyên đất giúp cà rốt tươi lâu hơn gấp đôi so với cà rốt đã rửa nước sạch."
          },
          {
            q: "Cà rốt này có cần phải gọt sạch vỏ khi nấu ăn không?",
            a: "Vì được trồng theo phương pháp hữu cơ sinh học an toàn không thuốc trừ sâu, bạn không nhất thiết phải gọt bỏ toàn bộ lớp vỏ. Chỉ cần ngâm rửa và chà sạch đất bằng bàn chải mềm dưới vòi nước là có thể ăn cả vỏ để giữ trọn vẹn chất xơ và Beta-Carotene."
          },
          {
            q: "Giống cà rốt này khác gì so với cà rốt chợ thường?",
            a: "Cà rốt giống cổ Heirloom của Green Valley có ruột lõi rất nhỏ, kết cấu thịt chắc dẻo, không xơ và có vị ngọt đậm đặc trưng rõ rệt, đặc biệt rất thơm khi xay nước ép tươi."
          }
        ]
      };
    }

    // 3. Táo (Apple - mock-3)
    if (idStr === "mock-3" || nameLower.includes("táo") || nameLower.includes("apple")) {
      return {
        story: {
          originStory: "Những trái táo Honeycrisp giòn ngọt được trồng tại đồi táo công nghệ cao của nhà vườn Orchard House ở Đà Lạt. Cây táo được hấp thụ đầy đủ nắng gió cao nguyên để cho quả đẹp nhất.",
          farmingMethod: "Áp dụng kỹ thuật bao trái bằng túi sinh học trực tiếp trên cây từ lúc quả non, ngăn chặn côn trùng xâm hại một cách tự nhiên mà không cần phun thuốc hóa học lên vỏ quả.",
          growingConditions: "Chênh lệch nhiệt độ lớn giữa ngày và đêm ở cao nguyên Đà Lạt kích thích táo tích tụ lượng mật đường tự nhiên xung quanh lõi quả.",
          seasonality: "Táo được thu hoạch chính vụ vào cuối mùa thu, từng quả được hái tay cẩn thận, đo độ đường đạt chuẩn trước khi phân loại.",
          uniqueness: "Thịt táo siêu giòn rụm, cắn ngập miệng mọng nước, vị chua nhẹ thanh khiết đan xen vị ngọt đậm đà khó quên.",
          sustainability: "Dùng phân bón hữu cơ chế biến từ bã thực vật tự nhiên, kết hợp hệ thống tưới nước tiết kiệm bán tự động."
        },
        highlights: [
          { text: "Siêu giòn giòn rụm", icon: "🍎" },
          { text: "Bao trái sinh học", icon: "🛡️" },
          { text: "Không sáp bóng hóa học", icon: "✨" },
          { text: "Tiêu chuẩn GlobalGAP", icon: "🏆" },
          { text: "Hái tay chọn lọc", icon: "🖐️" }
        ],
        nutrition: {
          calories: "52 kcal / 100g",
          water: "85.6%",
          fiber: "2.4g",
          fiberPercent: 10,
          vitaminC: "4.6mg",
          vitaminCPercent: 8,
          potassium: "107mg",
          potassiumPercent: 3,
          antioxidants: "Dồi dào",
          antioxidantsPercent: 20
        },
        usage: [
          { text: "Tráng miệng ăn tươi nguyên quả giòn mát", icon: "🍎" },
          { text: "Làm nước ép táo nguyên chất giàu vitamin", icon: "🥤" },
          { text: "Làm nhân bánh táo nướng hoặc nướng tẩm mật ong", icon: "🥧" },
          { text: "Cắt lát trộn salad trái cây kèm hạt hạnh nhân", icon: "🥗" }
        ],
        storage: {
          temp: "2°C - 4°C (Ngăn mát tủ lạnh)",
          life: "14 - 21 ngày",
          guide: "Cất táo trong túi zip đục lỗ ở tủ lạnh. Tránh để táo sát cạnh các loại rau lá xanh hoặc bông cải vì táo chín sinh ra chất khí ethylene tự nhiên làm thúc đẩy rau bị úa vàng nhanh hơn."
        },
        faq: [
          {
            q: "Vỏ quả táo có bị phun lớp sáp bóng bảo quản không?",
            a: "Tuyệt đối không. Lớp phấn mờ trên vỏ táo là lớp sáp tự nhiên do bản thân trái táo tiết ra để tự bảo vệ chống mất nước và côn trùng. Vườn Orchard House cam kết không sử dụng bất kỳ loại sáp nhân tạo hay chất bảo quản hóa học nào lên trái táo."
          },
          {
            q: "Tại sao quả táo đôi khi có những vết trong suốt xung quanh lõi?",
            a: "Đó gọi là hiện tượng 'táo ngấm mật' (honey core). Đây là hiện tượng sinh lý hoàn toàn tự nhiên khi táo đạt độ chín hoàn hảo, tích tụ hàm lượng đường fructose cô đặc xung quanh lõi. Những vùng thịt quả này ngọt lịm và rất thơm, không phải bị hỏng."
          }
        ]
      };
    }

    // 4. Gạo (Rice - mock-4)
    if (idStr === "mock-4" || nameLower.includes("gạo") || nameLower.includes("rice")) {
      return {
        story: {
          originStory: "Gạo đặc sản Tám Xoan được thu hoạch từ những cánh đồng lúa nước trù phú của vùng thung lũng lòng chảo Điện Biên. Đất phù sa sông Nậm Rốm bồi đắp mang lại hương vị hạt gạo đặc trưng.",
          farmingMethod: "Canh tác truyền thống theo mô hình lúa sạch luân canh. Sử dụng nguồn nước mát lành từ dòng suối vùng cao chảy tự nhiên vào ruộng lúa.",
          growingConditions: "Hạt lúa đón nhận ánh nắng rực rỡ ban ngày và khí trời mát lạnh ban đêm vùng núi Tây Bắc, giúp hạt lúa chín chắc hạt, tích tụ hương thơm đậm.",
          seasonality: "Mỗi năm chỉ trồng đúng một vụ chiêm/mùa chính, thu hoạch thủ công và phơi nắng tự nhiên trên sân gạch để giữ hương gạo mộc mạc.",
          uniqueness: "Hạt gạo nhỏ, thon dài, màu trắng đục nhẹ. Khi nấu cho cơm dẻo, thơm ngào ngạt hương nếp cốm non và cơm vẫn dẻo ngọt dù để nguội.",
          sustainability: "Phương pháp canh tác ruộng bậc thang kết hợp chăn nuôi vịt làm cỏ tự nhiên, cam kết không lạm dụng phân hóa học."
        },
        highlights: [
          { text: "Thơm dẻo cốm non", icon: "🌾" },
          { text: "Đất phù sa Điện Biên", icon: "🏞️" },
          { text: "Nguồn nước suối rừng", icon: "💧" },
          { text: "Không tẩm hương liệu", icon: "🛡" },
          { text: "Hút chân không bảo vệ", icon: "📦" }
        ],
        nutrition: {
          calories: "348 kcal / 100g",
          water: "12.0%",
          carbs: "79.0g",
          carbsPercent: 26,
          protein: "6.5g",
          proteinPercent: 13,
          potassium: "85mg",
          potassiumPercent: 2,
          vitaminB1: "0.12mg",
          vitaminB1Percent: 8
        },
        usage: [
          { text: "Nấu cơm nóng gia đình dẻo ngọt ăn hàng ngày", icon: "🍚" },
          { text: "Nấu cháo dinh dưỡng sánh nhuyễn thơm bùi", icon: "🥣" },
          { text: "Làm cơm cơm cháy chà bông siêu giòn", icon: "🍳" },
          { text: "Nấu cơm lam ống tre mang vị núi rừng đặc sản", icon: "🪵" }
        ],
        storage: {
          temp: "Nhiệt độ phòng (dưới 28°C), nơi khô ráo thoáng mát",
          life: "6 tháng",
          guide: "Tránh ánh nắng mặt trời trực tiếp và nơi ẩm ướt. Sau khi mở túi chân không, nên trút gạo vào thùng kín có nắp đậy chặt (thùng gỗ, nhựa PP sạch) để tránh ẩm mốc và sự xâm nhập của mối mọt."
        },
        faq: [
          {
            q: "Tại sao gạo nấu cơm dẻo hơn hẳn gạo thông thường?",
            a: "Gạo Tám Xoan Điện Biên có cấu trúc tinh bột amylose thấp hơn, kết hợp trồng trên thổ nhưỡng thung lũng có chênh lệch nhiệt độ cao giúp cơm dính dẻo tự nhiên, giữ vị ngọt lâu dài ngay cả khi nguội lạnh mà không cần tẩm phụ gia."
          },
          {
            q: "Gạo có chất chống mối mọt hay sấy hóa chất không?",
            a: "AgriMarket cam kết hạt gạo sạch thô 100%, được đóng gói hút chân không an toàn để bảo quản tự nhiên mà không dùng bất kỳ chất phun sấy diệt côn trùng hay chất chống mốc hóa học nào."
          }
        ]
      };
    }

    // 5. dâu tây (Strawberry - mock-5)
    if (idStr === "mock-5" || nameLower.includes("dâu") || nameLower.includes("strawberry")) {
      return {
        story: {
          originStory: "Dâu tây giống New Zealand chuẩn A được trồng thủy canh hiện đại tại nông trại BerryLand ở vùng đồi thông Đà Lạt, Lâm Đồng.",
          farmingMethod: "Hệ thống canh tác trên giàn cao cách mặt đất 1.2m, hoàn toàn tránh được mầm bệnh từ đất. Thụ phấn bằng ong nuôi tự nhiên trong vườn kính.",
          growingConditions: "Nước tưới được lọc tinh khiết và kiểm soát dinh dưỡng chính xác bằng hệ thống máy tính tự động hóa chuẩn châu Âu.",
          seasonality: "Dâu cho trái rải rác quanh năm dưới thời tiết nhà màng bảo vệ, quả được tuyển chọn thu hoạch khi đạt đúng 90% độ chín đỏ đẹp.",
          uniqueness: "Quả dâu tây trái to, thon dài căng mọng, cuống xanh tươi, thịt quả giòn ngọt mát dịu và thơm nồng nàn đặc trưng.",
          sustainability: "Hệ thống thủy canh tuần hoàn khép kín thu hồi nước thừa, không xả thải hóa chất ra nguồn nước tự nhiên."
        },
        highlights: [
          { text: "Thủy canh giàn cao", icon: "🍓" },
          { text: "Không mầm bệnh từ đất", icon: "🛡️" },
          { text: "Giòn thơm New Zealand", icon: "🇳🇿" },
          { text: "Thụ phấn nhờ ong", icon: "🐝" },
          { text: "Hộp lót mút chống dập", icon: "📦" }
        ],
        nutrition: {
          calories: "32 kcal / 100g",
          water: "91.0%",
          vitaminC: "58.8mg",
          vitaminCPercent: 98,
          fiber: "2.0g",
          fiberPercent: 8,
          potassium: "153mg",
          potassiumPercent: 4,
          folate: "24mcg",
          folatePercent: 6
        },
        usage: [
          { text: "Dùng trực tiếp tráng miệng tươi ngon mọng nước", icon: "🍓" },
          { text: "Dầm cùng sữa chua không đường và hạt chia ăn kiêng", icon: "🥣" },
          { text: "Xay sinh tố kem dâu mát lạnh sảng khoái", icon: "🍹" },
          { text: "Làm mứt dâu phết bánh mì hoặc làm trà dâu tây", icon: "🍞" }
        ],
        storage: {
          temp: "3°C - 5°C (Ngăn mát tủ lạnh)",
          life: "3 ngày",
          guide: "Tránh va chạm mạnh vì dâu rất dễ dập. Chỉ rửa dâu ngay trước khi ăn vì nước bám ngoài sẽ làm dâu nhanh úng thối. Nên lót một lớp khăn giấy dưới đáy hộp đựng dâu để hút ẩm trong tủ lạnh."
        },
        faq: [
          {
            q: "Tại sao trái dâu có thời gian bảo quản khá ngắn?",
            a: "Dâu tây là loại quả mọng nước, vỏ siêu mỏng và không có lớp sáp bảo vệ. Chúng tôi hoàn toàn không phun hóa chất ức chế nấm hay chất chống hỏng sau thu hoạch nên dâu cần được ăn tươi sớm trong vòng 3 ngày để đảm bảo vị ngon lành nhất."
          },
          {
            q: "Quả dâu tây này có ngọt hoàn toàn không?",
            a: "Giống dâu New Zealand tại Đà Lạt có vị ngọt mát hài hòa đi kèm một chút chua thanh nhẹ đặc trưng ở đầu lưỡi, chứ không ngọt lịm hoàn toàn như dâu tẩm hóa chất tạo ngọt. Vị chua thanh này chứng minh quả dâu chín tự nhiên dồi dào Vitamin C."
          }
        ]
      };
    }

    // 6. Mật ong (Honey - mock-6)
    if (idStr === "mock-6" || nameLower.includes("mật ong") || nameLower.includes("honey")) {
      return {
        story: {
          originStory: "Mật ong nguyên chất được khai thác từ những cánh rừng nhãn bạt ngàn tại Khoái Châu, Hưng Yên. Đàn ong được đặt trực tiếp dưới những tán cây nhãn cổ thụ trong mùa hoa nở.",
          farmingMethod: "Khai thác bằng phương pháp quay ly tâm truyền thống vệ sinh, lọc thô bỏ sáp ong, giữ nguyên vẹn các hạt phấn hoa nhãn tự nhiên bổ dưỡng.",
          growingConditions: "Những giọt mật ong mang hương thơm nhãn đặc trưng được đàn ong mật chăm chỉ tích tụ từ bầu không khí trong lành miền quê sông Hồng.",
          seasonality: "Chỉ thu hoạch duy nhất vào đợt hoa nhãn nở rộ tháng 3 - tháng 4 âm lịch hàng năm để có chất lượng mật ngon sánh nhất.",
          uniqueness: "Mật có màu vàng óng ánh hổ phách, đặc sánh, vị ngọt đậm sắc sảo và mang hương thơm ngào ngạt thanh khiết của hoa nhãn chín.",
          sustainability: "Duy trì mô hình nuôi ong tự nhiên bảo vệ đa dạng sinh học hệ sinh thái cây ăn quả hữu cơ địa phương."
        },
        highlights: [
          { text: "Hoa nhãn nguyên chất", icon: "🐝" },
          { text: "Màu hổ phách óng ánh", icon: "🍯" },
          { text: "Không pha trộn đường", icon: "🛡️" },
          { text: "Quay ly tâm thô sạch", icon: "⚙️" },
          { text: "Chai thủy tinh cao cấp", icon: "🍾" }
        ],
        nutrition: {
          calories: "304 kcal / 100g",
          water: "17.1%",
          carbs: "82.0g",
          carbsPercent: 27,
          sugar: "82.0g",
          antioxidants: "Dồi dào",
          zinc: "0.22mg",
          zincPercent: 2
        },
        usage: [
          { text: "Pha cùng nước ấm và chanh tươi uống detox buổi sáng", icon: "🍋" },
          { text: "Dùng làm gia vị ướp thịt nướng giúp lên màu vàng đẹp", icon: "🥩" },
          { text: "Rưới lên bánh mì kẹp hoặc bánh pancake tráng miệng", icon: "🥞" },
          { text: "Hấp tỏi chanh đào trị ho tự nhiên hiệu quả", icon: "🧪" }
        ],
        storage: {
          temp: "18°C - 25°C (Nhiệt độ phòng, bóng mát)",
          life: "2 năm",
          guide: "Tránh ánh nắng mặt trời chiếu trực tiếp. Tuyệt đối không cất mật ong trong tủ lạnh vì nhiệt độ lạnh dưới 12°C sẽ kích thích mật ong nguyên chất kết tinh thành các hạt đường đường glucose trắng ở đáy chai, làm giảm chất lượng mật."
        },
        faq: [
          {
            q: "Tại sao mật ong hoa nhãn nguyên chất bị đóng đường ở đáy khi trời lạnh?",
            a: "Đây là hiện tượng vật lý hoàn toàn tự nhiên của mật ong thật nguyên chất (kết tinh đường tự nhiên). Mật chứa nhiều hạt phấn hoa nhỏ li ti và hàm lượng glucose tự nhiên cao. Để khắc phục, bạn chỉ cần ngâm chai mật vào nước ấm 60°C trong 15 phút mật sẽ tan chảy sánh mịn lại bình thường."
          },
          {
            q: "Trẻ em có sử dụng được mật ong không?",
            a: "Tuyệt đối không dùng mật ong cho trẻ dưới 1 tuổi vì hệ tiêu hóa non nớt của bé chưa tự bảo vệ được trước các bào tử vi khuẩn tự nhiên có thể tồn tại trong mật ong sống."
          }
        ]
      };
    }

    // Generic Fallback (for other products)
    const defaults = {
      story: {
        originStory: `Sản phẩm này được thu hoạch từ các hộ nông trại và hợp tác xã liên kết chặt chẽ cùng AgriMarket tại ${product.farmLocation || "Lâm Đồng, Việt Nam"}. Quy trình trồng trọt được theo dõi sát sao từ gieo hạt đến thu hoạch để đảm bảo chất lượng an lành nhất.`,
        farmingMethod: "Ứng dụng phương pháp sản xuất nông nghiệp tốt (Good Agricultural Practices), sử dụng phân hữu cơ ủ hoai mục và hạn chế tối đa các chế phẩm vô cơ.",
        growingConditions: "Môi trường đất đai và nguồn nước được xét nghiệm định kỳ đạt chuẩn không chứa kim loại nặng và độc tố hóa học nguy hại.",
        seasonality: "Sản phẩm được bán theo đúng mùa vụ tự nhiên để quả ngọt tự nhiên nhất và không lạm dụng chất giấm ép chín.",
        uniqueness: "Nông sản tươi sạch được thu hoạch tươi sống tại vườn và chuyển giao trực tiếp đến tay người tiêu dùng trong thời gian ngắn nhất.",
        sustainability: "AgriMarket hỗ trợ nông nghiệp bền vững, trả mức giá công bằng cho nông dân và đóng gói sản phẩm thân thiện với thiên nhiên."
      },
      highlights: [
        { text: "Canh tác an toàn", icon: "🌱" },
        { text: "Không chất bảo quản", icon: "🛡️" },
        { text: "Thu hoạch tươi sống", icon: "🌾" },
        { text: "Nguồn gốc rõ ràng", icon: "🔍" },
        { text: "Hỗ trợ nông dân Việt", icon: "🇻🇳" }
      ],
      nutrition: {
        calories: "35 kcal / 100g",
        water: "85% - 90%",
        fiber: "Dồi dào chất xơ",
        vitaminC: "Nguồn Vitamin C tự nhiên",
        potassium: "Giàu kali & khoáng chất",
        naturalPurity: "100% tươi sạch"
      },
      usage: [
        { text: "Chế biến các món xào, luộc ngon miệng trong bữa cơm gia đình", icon: "🍳" },
        { text: "Ăn sống tươi ngon hoặc trộn salad mát lành giải nhiệt", icon: "🥗" },
        { text: "Ép nước uống hoặc làm sinh tố bổ dưỡng tăng sức đề kháng", icon: "🍹" }
      ],
      storage: {
        temp: "5°C - 8°C (Ngăn rau tủ lạnh)",
        life: "3 - 5 ngày",
        guide: "Nên làm ráo nước sản phẩm trước khi cất giữ. Sử dụng các túi bọc có đục lỗ thoát khí để tránh tích tụ hơi nước làm úng lá héo củ. Tránh đè các vật nặng lên sản phẩm dễ gây dập nát."
      },
      faq: [
        {
          q: "Làm thế nào để tôi kiểm chứng nguồn gốc sản phẩm này?",
          a: "Mọi sản phẩm trên AgriMarket đều đính kèm thông tin nhà vườn cụ thể ở phần thông tin phía trên. Bạn có thể nhấn vào để xem chi tiết hồ sơ nông trại, chứng chỉ kiểm định và ảnh chụp truy xuất thực địa tại nông trại."
        },
        {
          q: "Nếu sản phẩm nhận được bị hư hỏng, dập nát thì xử lý như thế nào?",
          a: "Chính sách của AgriMarket cam kết hoàn tiền 100% hoặc đổi trả miễn phí đối với sản phẩm bị dập nát, hỏng hóc do quá trình vận chuyển. Bạn chỉ cần chụp ảnh sản phẩm lỗi và gửi phản hồi yêu cầu đổi trả trên ứng dụng trong vòng 24 giờ sau khi nhận hàng."
        }
      ]
    };

    return defaults;
  }, [product]);

  const handleSaveProduct = async () => {
    if (!product) return;
    const res = await wishlistService.toggleWishlist(product.id);
    setIsSaved(res.saved);
    triggerToast(res.message, res.saved ? "success" : "info");
  };

  const handleToggleFollowFarmer = async () => {
    if (!product || !product.farmerId) return;
    const farmerObj = {
      id: product.farmerId,
      name: product.farmerName,
      location: product.farmLocation,
      description: product.farmDescription,
      avatarUrl: product.farmerAvatarUrl,
      vietgapUrl: product.farmerVietgapUrl,
      globalgapUrl: product.farmerGlobalgapUrl,
      organicUrl: product.farmerOrganicUrl,
    };
    const res = await wishlistService.toggleFollowFarmer(farmerObj);
    setIsFarmerFollowed(res.followed);
    triggerToast(res.message, res.followed ? "success" : "info");
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleToggleSaveRelated = async (relatedId, relatedName) => {
    const res = await wishlistService.toggleWishlist(relatedId);
    const updated = new Set(savedRelatedIds);
    if (res.saved) {
      updated.add(String(relatedId));
    } else {
      updated.delete(String(relatedId));
    }
    setSavedRelatedIds(updated);
    triggerToast(res.message, res.saved ? "success" : "info");
  };

  const formatPrice = (price) => {
    if (product?.unit === "bunch" || product?.unit === "bag" || product?.unit === "3lbs") {
      // If mock product values are small (like $4.50 or $3.00), format as currency USD or VND. 
      // Let's display VND for mock price of carrots (112,500 đ) or USD style depending on price range.
      if (price < 1000) {
        return `$${price.toFixed(2)}`;
      }
    }
    return new Intl.NumberFormat("vi-VN").format(price) + " đ";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Đang cập nhật";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <Header />
        <div className="product-detail-loading">
          <div className="detail-spinner"></div>
          <p>Đang tải chi tiết nông sản...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <Header />
        <div className="product-detail-loading">
          <h2>Không tìm thấy sản phẩm</h2>
          <p>Sản phẩm này không tồn tại hoặc đã bị ẩn.</p>
          <Link to="/" style={{ color: "var(--primary-color)", fontWeight: "600", marginTop: "12px" }}>Quay lại Trang chủ</Link>
        </div>
      </div>
    );
  }

  // Generate breadcrumb items dynamically
  const categoryLabel = product.category || "Rau củ quả";

  return (
    <div className="product-detail-page">
      <Header />

      {/* Breadcrumbs */}
      <div className="breadcrumb-container">
        <ul className="breadcrumbs">
          <li>
            <Link to="/">Trang chủ</Link>
            <span className="breadcrumb-separator">&gt;</span>
          </li>
          <li>
            <Link to="/shop">Cửa hàng</Link>
            <span className="breadcrumb-separator">&gt;</span>
          </li>
          <li>
            <span>{categoryLabel}</span>
            <span className="breadcrumb-separator">&gt;</span>
          </li>
          <li className="active">
            <span>{product.name}</span>
          </li>
        </ul>
      </div>

      {/* Product Detail Grid Layout */}
      <main className="product-detail-container">
        {/* Left Column - Image Gallery */}
        <section className="product-image-section">
          <div
            className="main-image-wrapper"
            style={{ cursor: mainImageError || getFileExtension(activeImage) === "pdf" ? "default" : "zoom-in" }}
            onClick={() => {
              if (getFileExtension(activeImage) !== "pdf" && !mainImageError) {
                const idx = allImages.indexOf(activeImage);
                setLightboxIndex(idx >= 0 ? idx : 0);
                setIsLightboxOpen(true);
              }
            }}
          >
            {mainImageError ? (
              <div className="main-image-placeholder-broken">
                {product.farmerOrganicUrl && activeImage === product.farmerOrganicUrl ? "📜" : "🌾"}
                <p style={{ fontSize: "14px", marginTop: "8px", color: "#6b7280" }}>Hình ảnh không khả dụng</p>
              </div>
            ) : getFileExtension(activeImage) === "pdf" ? (
              <div className="main-image-placeholder-pdf">
                <iframe src={activeImage} title="Certificate PDF" width="100%" height="100%" style={{ border: "none" }} />
              </div>
            ) : (
              <img
                src={activeImage}
                alt={product.name}
                className="main-product-img"
                onError={() => setMainImageError(true)}
              />
            )}
            <div className="badge-overlay">
              {product.isLocal && <span className="badge-tag local-tag">Địa phương</span>}
            </div>
          </div>

          {allImages.length > 1 && (
            <div className="thumbnail-gallery">
              {allImages.map((imgUrl, idx) => {
                const isCertificate = product.farmerOrganicUrl && imgUrl === product.farmerOrganicUrl;
                const isTraceability = product.traceabilityImageUrl && imgUrl === product.traceabilityImageUrl;
                const isPdf = getFileExtension(imgUrl) === "pdf";
                const isBroken = brokenImages[idx];

                return (
                  <div
                    key={idx}
                    className={`thumbnail-item ${activeImage === imgUrl ? "active" : ""} ${isCertificate ? "organic-cert-thumbnail" : ""} ${isTraceability ? "traceability-thumbnail" : ""}`}
                    onClick={() => setActiveImage(imgUrl)}
                  >
                    {isBroken ? (
                      <div className="thumbnail-placeholder-broken">
                        {isCertificate ? "📜" : isTraceability ? "🔍" : "🌾"}
                      </div>
                    ) : isPdf ? (
                      <div className="pdf-thumbnail-placeholder">
                        <span className="pdf-icon">📄</span>
                        <span className="pdf-text">PDF</span>
                      </div>
                    ) : (
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        onError={() => setBrokenImages(prev => ({ ...prev, [idx]: true }))}
                      />
                    )}
                    {isCertificate && (
                      <div className="cert-mini-badge">
                        🌱 Chứng nhận
                      </div>
                    )}
                    {isTraceability && (
                      <div className="cert-mini-badge" style={{ backgroundColor: "#0284c7" }}>
                        🔍 Truy xuất
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column - Product details */}
        <section className="product-info-section">
          <h1 className="product-title">{product.name}</h1>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px", marginBottom: "12px" }}>
            {product.farmerOrganicUrl && (
              <span className="tag-pill tag-organic" style={{ 
                backgroundColor: "#e8f5e9", 
                color: "#2e7d32", 
                fontSize: "12px", 
                fontWeight: "700", 
                padding: "4px 10px", 
                borderRadius: "4px",
                border: "1px solid #c8e6c9",
                display: "inline-block"
              }}>
                Hữu cơ
              </span>
            )}
            {product.farmerVietgapUrl && (
              <span className="tag-pill tag-vietgap" style={{ 
                backgroundColor: "#e0f2fe", 
                color: "#0369a1", 
                fontSize: "12px", 
                fontWeight: "700", 
                padding: "4px 10px", 
                borderRadius: "4px",
                border: "1px solid #bae6fd",
                display: "inline-block"
              }}>
                VietGAP
              </span>
            )}
            {product.farmerGlobalgapUrl && (
              <span className="tag-pill tag-globalgap" style={{ 
                backgroundColor: "#fee2e2", 
                color: "#b91c1c", 
                fontSize: "12px", 
                fontWeight: "700", 
                padding: "4px 10px", 
                borderRadius: "4px",
                border: "1px solid #fecaca",
                display: "inline-block"
              }}>
                GlobalGAP
              </span>
            )}
          </div>

          <div className="rating-reviews-row">
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`rating-star-icon ${star <= Math.round(product.rating || 0) ? "filled" : ""}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span
              className="rating-value-reviews"
              onClick={() => navigate(`/products/${product.id}/reviews`)}
              title="Xem tất cả đánh giá"
              style={{ cursor: "pointer" }}
            >
              {product.rating !== undefined && product.rating !== null ? product.rating.toFixed(1) : "0.0"} ({product.reviewsCount !== undefined && product.reviewsCount !== null ? product.reviewsCount : 0} đánh giá)
            </span>
          </div>

          <div className="price-display">
            <span className="price-amount">{formatPrice(product.price)}</span>
            <span className="price-unit">/ {product.unit === "bunch" ? "bó" : product.unit === "bag" ? "túi" : product.unit === "3lbs" ? "túi" : product.unit || "bó"}</span>
          </div>

          {/* Harvest & Origin Metadata Info Bar */}
          <div className="harvest-meta-spec">
            <div className="harvest-meta-item">
              <span className="harvest-meta-icon">📍</span>
              <div className="harvest-meta-text">
                <span className="harvest-meta-label">Nơi thu hoạch</span>
                <span className="harvest-meta-val" title={product.farmLocation || "Lâm Đồng, Việt Nam"}>
                  {product.farmLocation || "Lâm Đồng, Việt Nam"}
                </span>
              </div>
            </div>
            <div className="harvest-meta-item">
              <span className="harvest-meta-icon">📅</span>
              <div className="harvest-meta-text">
                <span className="harvest-meta-label">Ngày thu hoạch</span>
                <span className="harvest-meta-val">{formatDate(product.harvestDate)}</span>
              </div>
            </div>
            <div className="harvest-meta-item">
              <span className="harvest-meta-icon">⏳</span>
              <div className="harvest-meta-text">
                <span className="harvest-meta-label">Hạn sử dụng</span>
                <span className="harvest-meta-val">{formatDate(product.expirationDate)}</span>
              </div>
            </div>
          </div>

          <div className="product-desc-box">
            <p style={{ whiteSpace: "pre-line" }}>{product.description || "Được canh tác trong lòng đất giàu dinh dưỡng hoàn toàn tự nhiên, không sử dụng thuốc trừ sâu hóa học. Nông sản hữu cơ mang hương vị ngọt thanh đặc trưng, thích hợp cho bữa ăn lành mạnh hàng ngày."}</p>
          </div>

          {/* Purchase Option Box */}
          <div className="purchase-options-card">
            <h3 className="purchase-label">Tùy chọn mua hàng</h3>

            <div className="purchase-controls-row">
              <div className="qty-selector">
                <button
                  className="qty-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={product.stock === 0 || (parseInt(quantity, 10) || 1) <= 1}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  type="number"
                  className="qty-input"
                  value={quantity}
                  onChange={(e) => {
                    if (product.stock === 0) return;
                    const valStr = e.target.value;
                    if (valStr === "") {
                      setQuantity("");
                      return;
                    }
                    const val = parseInt(valStr, 10);
                    if (!isNaN(val)) {
                      const maxStock = product.stock !== undefined && product.stock !== null ? product.stock : 45;
                      if (val >= 1 && val <= maxStock) {
                        setQuantity(val);
                      } else if (val < 1) {
                        setQuantity(1);
                      } else if (val > maxStock) {
                        setQuantity(maxStock);
                      }
                    }
                  }}
                  onBlur={() => {
                    if (product.stock === 0) {
                      setQuantity(0);
                      return;
                    }
                    const parsed = parseInt(quantity, 10);
                    if (isNaN(parsed) || parsed < 1) {
                      setQuantity(1);
                    }
                  }}
                  min={product.stock === 0 ? "0" : "1"}
                  max={product.stock !== undefined && product.stock !== null ? product.stock : 45}
                  disabled={product.stock === 0}
                />
                <button
                  className="qty-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={product.stock === 0 || (parseInt(quantity, 10) || 1) >= (product.stock !== undefined && product.stock !== null ? product.stock : 45)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              {product.stock === 0 ? (
                <span className="stock-status-info out-of-stock" style={{ color: "#dc2626", fontWeight: "700" }}>
                  Hết hàng
                </span>
              ) : (
                <span className="stock-status-info">
                  Còn hàng ({product.stock} {product.unit === "bunch" ? "bó" : product.unit === "bag" ? "túi" : product.unit === "3lbs" ? "túi" : product.unit || "bó"})
                </span>
              )}
            </div>

            {/* Vận chuyển location selector */}
            <div className="shipping-calc-container">
              <div className="shipping-calc-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shipping-truck-icon">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
                <span className="shipping-calc-title">Địa điểm giao hàng:</span>
              </div>
              <div className="shipping-calc-select-row">
                <select
                  className="shipping-city-select"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  {VIETNAM_CITIES.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              {shippingInfo && (
                <div className="shipping-calc-result">
                  <div className="shipping-info-line">
                    <span className="shipping-result-label">Hình thức:</span>
                    <span className="shipping-result-value bold">{shippingInfo.method}</span>
                  </div>
                  <div className="shipping-info-line">
                    <span className="shipping-result-label">Thời gian:</span>
                    <span className="shipping-result-value">{shippingInfo.time}</span>
                  </div>
                  <div className="shipping-info-line">
                    <span className="shipping-result-label">Phí vận chuyển:</span>
                    <span className="shipping-result-value fee-highlight">{formatPrice(shippingInfo.fee)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="action-buttons-group">
              <button 
                className="btn-buy-now" 
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                style={product.stock === 0 ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
                Mua ngay
              </button>

              <button 
                className="btn-add-to-cart" 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={product.stock === 0 ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                Thêm vào giỏ hàng
              </button>

              <button
                className={`btn-save-later ${isSaved ? "saved" : ""}`}
                onClick={handleSaveProduct}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                {isSaved ? "Đã lưu" : "Lưu lại"}
              </button>
            </div>
          </div>

          {/* Farm details box */}
          <div className="farmer-profile-card">
            <div className="farmer-header-info">
              <div className="farmer-avatar-wrapper">
                {product.farmerAvatarUrl ? (
                  <img
                    src={product.farmerAvatarUrl}
                    alt={product.farmerName}
                  />
                ) : (
                  <div className="farmer-avatar-fallback">
                    {product.farmerName ? product.farmerName.charAt(0).toUpperCase() : "N"}
                  </div>
                )}
              </div>
              <div className="farmer-title-box">
                <h4 className="farmer-name">{product.farmerName}</h4>
                <div className="farmer-location-row">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{product.farmLocation}</span>
                </div>
              </div>
            </div>

            <p className="farmer-desc-text">{product.farmDescription}</p>

            <div className="farmer-card-actions" style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button 
                className="btn-view-farm-profile" 
                style={{ flex: 1 }}
                onClick={() => navigate(`/farmer-profile/${product.farmerId}`)}
              >
                Xem hồ sơ nông trại →
              </button>
              <button
                className={`btn-follow-farmer ${isFarmerFollowed ? "followed" : ""}`}
                onClick={handleToggleFollowFarmer}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  border: isFarmerFollowed ? "1px solid #e2e8f0" : "none",
                  backgroundColor: isFarmerFollowed ? "#e2e8f0" : "var(--profile-green, #00412f)",
                  color: isFarmerFollowed ? "var(--profile-text, #0a2f24)" : "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {isFarmerFollowed ? "✓ Đang theo dõi" : "＋ Theo dõi"}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Redesigned Value-Added Product Details Section */}
      <section className="product-redesigned-details-section">
        <div className="details-layout-full-width">
          {/* Full Width: Product Specifications Card */}
          <div className="details-specifications-card full-width">
            <h2 className="details-card-title-main">📋 Thông tin chi tiết nông sản</h2>
            <div className="spec-list-table">
              <div className="spec-row">
                <span className="spec-label">Tên sản phẩm</span>
                <span className="spec-value">{product.name}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Danh mục rau củ</span>
                <span className="spec-value">{product.category || "Rau củ quả tươi"}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Nhà vườn sản xuất</span>
                <span className="spec-value">{product.farmerName || "Nông trại AgriMarket"}</span>
              </div>
              <div className="spec-row spec-row-address">
                <span className="spec-label">Nơi thu hoạch (Địa chỉ)</span>
                <span className="spec-value spec-value-address">
                  {product.farmLocation && product.farmLocation.length > 40 ? (
                    <>
                      <span className={`address-text ${isAddressExpanded ? "expanded" : "collapsed"}`}>
                        {isAddressExpanded ? product.farmLocation : `${product.farmLocation.substring(0, 38)}...`}
                      </span>
                      <button
                        type="button"
                        className="btn-toggle-address"
                        onClick={() => setIsAddressExpanded(!isAddressExpanded)}
                      >
                        {isAddressExpanded ? " Rút gọn ▴" : " Xem thêm ▾"}
                      </button>
                    </>
                  ) : (
                    product.farmLocation || "Lâm Đồng, Việt Nam"
                  )}
                </span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Ngày thu hoạch</span>
                <span className="spec-value">{formatDate(product.harvestDate)}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Hạn sử dụng / Ngày hết hạn</span>
                <span className="spec-value">{formatDate(product.expirationDate)}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Quy cách đóng gói</span>
                <span className="spec-value">{product.unit || "Sản phẩm"}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Độ hư hỏng / Vận chuyển</span>
                <span className="spec-value" style={{ textTransform: "capitalize" }}>
                  {product.perishability || "Khô (Giao toàn quốc)"}
                </span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Khoảng cách giao tối đa</span>
                <span className="spec-value">
                  {product.limitDistance ? `${product.limitDistance} km` : "Không giới hạn (Giao toàn quốc)"}
                </span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Tiêu chuẩn chất lượng</span>
                <span className="spec-value">
                  {product.farmerOrganicUrl ? "Hữu cơ (Organic)" : product.farmerVietgapUrl ? "Tiêu chuẩn VietGAP" : product.farmerGlobalgapUrl ? "Tiêu chuẩn GlobalGAP" : "Nông sản sạch an toàn"}
                </span>
              </div>
            </div>
          </div>

          {/* Quality Commitment from AgriMarket */}
          <div className="agrimarket-commitment-box-redesigned full-width">
            <h4>🤝 Cam kết từ AgriMarket</h4>
            <ul className="commitment-list-small">
              <li><span>✅</span> 100% Tươi sạch tự nhiên, thu hoạch tại vườn</li>
              <li><span>✅</span> Đền bù hoàn tiền nếu nông sản dập nát, hỏng lỗi</li>
              <li><span>✅</span> Nhà vườn được xác minh uy tín & kiểm định thực địa</li>
              <li><span>✅</span> Quy trình vận chuyển an toàn giữ nguyên dưỡng chất</li>
            </ul>
          </div>
        </div>

        {/* Section 8: FAQ Accordion */}
        <div className="details-faq-accordion-section">
          <h2 className="faq-section-title-main">💬 Câu hỏi thường gặp (FAQ)</h2>
          <div className="faq-accordion-container">
            {agriDetails.faq.map((faqItem, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className={`faq-accordion-item ${isOpen ? "open" : ""}`}>
                  <button 
                    className="faq-accordion-question" 
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faqItem.q}</span>
                    <span className="faq-arrow-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </button>
                  <div className="faq-accordion-answer">
                    <div className="faq-answer-inner">
                      <p>{faqItem.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* Reviews Section */}
      <section className="product-reviews-section">
        <h2 className="reviews-section-title">Đánh giá từ khách hàng</h2>

        <div className="reviews-layout-grid">
          {/* Left Column: Overall stats & Review list */}
          <div className="reviews-list-column">
            <div className="reviews-summary-card">
              <div className="reviews-average-rating-box">
                <span className="reviews-average-score">{product.rating !== undefined && product.rating !== null ? product.rating.toFixed(1) : "0.0"}</span>
                <span className="reviews-average-max">/ 5</span>
              </div>
              <div className="reviews-summary-info">
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`rating-star-icon ${star <= Math.round(product.rating || 0) ? "filled" : ""}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="reviews-total-count">({product.reviewsCount !== undefined && product.reviewsCount !== null ? product.reviewsCount : 0} nhận xét từ khách mua hàng)</span>
              </div>
            </div>

            <div className="reviews-list-container">
              {reviewsList.length === 0 ? (
                <p className="no-reviews-text">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!</p>
              ) : (
                reviewsList.slice(0, 3).map((rev) => (
                  <div key={rev.id} className="review-item-card">
                    <div className="review-item-header">
                      <div className="review-author-avatar">
                        {rev.author ? rev.author.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="review-author-meta">
                        <h4 className="review-author-name">{rev.author}</h4>
                        <div className="review-item-subline">
                          <div className="rating-stars mini">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`rating-star-icon ${star <= rev.rating ? "filled" : ""}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="review-item-date">{rev.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="review-item-comment">{rev.comment}</p>

                    {/* Hiển thị hình ảnh đính kèm */}
                    {rev.images && rev.images.length > 0 && (
                      <div className="review-attached-gallery">
                        {rev.images.map((img, i) => (
                          <div key={i} className="review-gallery-thumb" onClick={() => window.open(img, "_blank")} title="Xem ảnh kích thước lớn">
                            <img src={img} alt={`Đánh giá đính kèm ${i}`} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Hiển thị video đính kèm */}
                    {rev.video && (
                      <div className="review-attached-video">
                        <video className="review-video-player" src={rev.video} controls preload="metadata" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {reviewsList.length > 0 && (
              <button
                type="button"
                className="btn-view-all-reviews"
                onClick={() => navigate(`/products/${product.id}/reviews`)}
                style={{ marginTop: "20px", display: "block" }}
              >
                Xem tất cả đánh giá →
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      <section className="related-products-section">
        <h2 className="related-section-title">Sản phẩm khác từ nông trại này</h2>

        <div className="related-grid">
          {relatedProducts.map((p) => {
            const isRelatedSaved = savedRelatedIds.has(p.id);
            return (
              <div key={p.id} className="related-card">
                <div className="related-card-img-wrapper" onClick={() => navigate(`/products/${p.id}`)} style={{ cursor: "pointer" }}>
                  <img src={p.imageUrl} alt={p.name} className="related-card-img" />
                </div>

                <button
                  className={`related-save-btn ${isRelatedSaved ? "saved" : ""}`}
                  onClick={() => handleToggleSaveRelated(p.id, p.name)}
                  aria-label="Save for later"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isRelatedSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>

                <div className="related-card-body">
                  <h3 className="related-card-title" onClick={() => navigate(`/products/${p.id}`)} style={{ cursor: "pointer" }}>
                    {p.name}
                  </h3>

                  <div className="related-card-price-row">
                    <div className="related-card-price-box">
                      <span className="related-card-price">{formatPrice(p.price)}</span>
                      <span className="related-card-unit">/ {p.unit === "bunch" ? "bó" : p.unit === "bag" ? "túi" : p.unit === "3lbs" ? "túi" : p.unit || "bó"}</span>
                    </div>

                    <button
                      className="related-add-cart-btn"
                      onClick={() => {
                        const cartKey = "agrimarket_cart";
                        const currentCart = JSON.parse(localStorage.getItem(cartKey)) || [];
                        const idx = currentCart.findIndex(item => item.id === p.id);
                        if (idx > -1) {
                          currentCart[idx].quantity += 1;
                        } else {
                          currentCart.push({
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            unit: p.unit,
                            imageUrl: p.imageUrl,
                            quantity: 1
                          });
                        }
                        localStorage.setItem(cartKey, JSON.stringify(currentCart));
                        triggerToast(`Đã thêm 1 ${p.unit} "${p.name}" vào giỏ hàng!`);
                      }}
                      aria-label="Add to cart"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Sync from Home */}
      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-left">
            <div className="footer-logo">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
            <p className="footer-copy">© 2026 AgriMarket. Kết nối Nông nghiệp số.</p>
          </div>
          <div className="footer-right">
            <Link to="/help" className="footer-link">Trung tâm trợ giúp</Link>
            <Link to="/privacy" className="footer-link">Chính sách bảo mật</Link>
            <Link to="/terms" className="footer-link">Điều khoản dịch vụ</Link>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal overlay */}
      {isLightboxOpen && allImages.length > 0 && (
        <div
          className="lightbox-backdrop"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            className="lightbox-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
            aria-label="Đóng"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Previous Arrow */}
          {allImages.length > 1 && (
            <button
              className="lightbox-arrow-btn lightbox-arrow-left"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
              }}
              aria-label="Ảnh trước"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          )}

          {/* Image Container */}
          <div
            className="lightbox-image-container"
            onClick={(e) => e.stopPropagation()}
          >
            {getFileExtension(allImages[lightboxIndex]) === "pdf" ? (
              <iframe
                src={allImages[lightboxIndex]}
                title="Certificate Full PDF"
                className="lightbox-pdf-view"
              />
            ) : (
              <img
                src={allImages[lightboxIndex]}
                alt={`${product.name} Fullscreen`}
                className="lightbox-main-img"
              />
            )}
          </div>

          {/* Next Arrow */}
          {allImages.length > 1 && (
            <button
              className="lightbox-arrow-btn lightbox-arrow-right"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
              }}
              aria-label="Ảnh sau"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          )}

          {/* Bottom Controls Panel */}
          <div
            className="lightbox-bottom-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-counter">
              {product.farmerOrganicUrl && allImages[lightboxIndex] === product.farmerOrganicUrl ? (
                <span>🌱 Giấy chứng nhận hữu cơ ({lightboxIndex + 1} / {allImages.length})</span>
              ) : (
                <span>Hình ảnh sản phẩm ({lightboxIndex + 1} / {allImages.length})</span>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="lightbox-thumbnails-strip">
                {allImages.map((imgUrl, idx) => {
                  const isCertificate = product.farmerOrganicUrl && imgUrl === product.farmerOrganicUrl;
                  const isPdf = getFileExtension(imgUrl) === "pdf";

                  return (
                    <div
                      key={idx}
                      className={`lightbox-thumbnail-item ${lightboxIndex === idx ? "active" : ""} ${isCertificate ? "cert-item" : ""}`}
                      onClick={() => setLightboxIndex(idx)}
                    >
                      {isPdf ? (
                        <div className="lightbox-thumbnail-pdf-placeholder">📄 PDF</div>
                      ) : (
                        <img src={imgUrl} alt={`Thumb ${idx + 1}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Action Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="product-detail-toast">
            <span>{t.type === "error" ? "❌" : "✅"}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

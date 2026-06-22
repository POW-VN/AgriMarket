// src/pages/Product/ProductDetail.jsx

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import cartService from "../../services/cartService";
import { getProductById, getAllApprovedProducts } from "../../services/productService";
import reviewService from "../../services/reviewService";
import NotificationBell from "../../components/common/NotificationBell/NotificationBell";
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
    // Append organic certificate URL if exists
    if (product.farmerOrganicUrl && !imgs.includes(product.farmerOrganicUrl)) {
      imgs.push(product.farmerOrganicUrl);
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

  const extendedInfo = useMemo(() => {
    if (!product) return {};
    const defaults = {
      whySoughtAfter: "Sản phẩm được trồng thủ công theo phương pháp truyền thống, giữ trọn vẹn hương vị tự nhiên và giá trị dinh dưỡng cao nhất, không hóa chất bảo quản.",
      origin: "Đà Lạt, Lâm Đồng",
      method: "Canh tác hữu cơ an toàn",
      shelfLife: "5 ngày (bảo quản lạnh ở nhiệt độ 5°C)",
      howToUse: "Rửa sạch dưới vòi nước chảy trong 30 giây trước khi chế biến. Thích hợp ăn trực tiếp, làm các món salad, nấu canh hoặc ép nước uống giải nhiệt.",
      precautions: "Bảo quản trong ngăn mát tủ lạnh ở nhiệt độ ổn định 4°C. Không dùng sản phẩm nếu có dấu hiệu hư hỏng, dập nát.",
      shippingInfo: "Giao hàng hỏa tốc trong đúng 2 giờ tại khu vực nội thành. Giao hàng tiêu chuẩn trong đúng 2 ngày đối với tỉnh lân cận.",
      packaging: "Đóng gói khối lượng chính xác 500g trong bao bì tự phân hủy sinh học bảo vệ môi trường."
    };

    const idStr = String(product.id);

    if (idStr === "mock-2" || product.name.toLowerCase().includes("cà rốt")) {
      return {
        whySoughtAfter: "Giống cà rốt gia truyền Heirloom nguyên bản giữ được vị ngọt đậm tự nhiên vượt trội, giàu vitamin A và các khoáng chất quý giá. Sản lượng thu hoạch thủ công giới hạn theo đợt gieo trồng tự nhiên.",
        origin: "Nông trại Green Valley, Đà Lạt",
        method: "Hữu cơ sinh học 100% (Không thuốc trừ sâu)",
        shelfLife: "7 ngày (bảo quản lạnh ở nhiệt độ 5°C)",
        howToUse: "Rất phù hợp làm nước ép detox thanh lọc cơ thể, nấu súp dinh dưỡng cho bé, làm salad giòn mát hoặc chế biến các món xào, luộc.",
        precautions: "Nên giữ lớp đất bám ngoài nếu chưa ăn ngay. Rửa sạch bằng bàn chải mềm và gọt nhẹ vỏ trước khi ăn trực tiếp.",
        shippingInfo: "Vận chuyển hỏa tốc trong đúng 2 giờ bằng thùng mát giữ tươi từ nông trại trực tiếp đến tận tay khách hàng.",
        packaging: "Đóng gói thành 1 bó có trọng lượng chính xác 500g, quấn bằng 1 lớp lá chuối tươi hữu cơ sạch và buộc bằng 1 sợi dây đay tự nhiên."
      };
    }

    if (idStr === "mock-1" || product.name.toLowerCase().includes("cà chua")) {
      return {
        whySoughtAfter: "Cà chua được để chín tự nhiên trên cây, vỏ mọng mọc nước, nhiều bột và có vị chua ngọt thanh mát đặc trưng khác biệt hoàn toàn với cà chua chín ép.",
        origin: "Trang trại Happy Farm, Lâm Đồng",
        method: "Hữu cơ tuần hoàn tiêu chuẩn VietGAP",
        shelfLife: "5 ngày (bảo quản ở nhiệt độ 22°C)",
        howToUse: "Ăn sống kèm salad, làm nước sốt mì Ý thơm ngon, nấu canh chua hoặc xay sinh tố giải nhiệt.",
        precautions: "Tránh xếp đè nhiều quả lên nhau gây dập nát. Rửa nhẹ tay dưới vòi nước chảy.",
        shippingInfo: "Giao hỏa tốc nội thành trong đúng 2 giờ, đóng hộp chống sốc chuyên dụng tránh dập nát.",
        packaging: "Đóng gói trong 1 hộp giấy kraft thân thiện môi trường, khối lượng chính xác 500g, có vách ngăn lót xốp chống dập."
      };
    }

    if (idStr === "mock-3" || product.name.toLowerCase().includes("táo")) {
      return {
        whySoughtAfter: "Táo giống Honeycrisp có kết cấu giòn rụm và vị ngọt đậm pha chút chua nhẹ cực kỳ sảng khoái. Được săn đón nhờ độ tươi ngon vượt trội.",
        origin: "Vườn táo Orchard House, Đà Lạt",
        method: "Canh tác công nghệ cao chuẩn GlobalGAP",
        shelfLife: "14 ngày (bảo quản ở nhiệt độ 4°C)",
        howToUse: "Ăn trực tiếp làm món tráng miệng giải nhiệt, ép nước nguyên chất, trộn salad hoặc làm nhân bánh táo nướng thơm lừng.",
        precautions: "Rửa sạch lớp sáp bảo vệ tự nhiên bên ngoài vỏ quả bằng nước muối loãng trước khi ăn cả vỏ.",
        shippingInfo: "Giao nhanh trong đúng 3 giờ bằng hộp carton giữ lạnh bọc túi khí chống va đập.",
        packaging: "Đóng gói trong 1 khay giấy bọc màng co thực phẩm, khối lượng chính xác 1000g."
      };
    }

    if (idStr === "mock-4" || product.name.toLowerCase().includes("gạo")) {
      return {
        whySoughtAfter: "Gạo đặc sản Điện Biên hạt nhỏ đều, thơm dẻo đậm đà ngay cả khi để nguội. Canh tác an toàn tự nhiên.",
        origin: "Điện Biên",
        method: "Canh tác truyền thống tự nhiên",
        shelfLife: "6 tháng (bảo quản nơi khô ráo ở độ ẩm dưới 12%)",
        howToUse: "Đong gạo, vo nhẹ đúng 2 lần. Nấu với tỷ lệ chuẩn xác là 1 phần gạo kết hợp với đúng 1.1 phần nước. Ăn nóng kèm thức ăn.",
        precautions: "Bảo quản kín sau khi mở bao bì để tránh mối mọt và mất mùi thơm.",
        shippingInfo: "Vận chuyển tiêu chuẩn trong đúng 3 ngày, đóng bao đay chắc chắn bên ngoài.",
        packaging: "Đóng gói trong 1 túi PE hút chân không, khối lượng chính xác 1000g giúp bảo vệ hạt gạo nguyên vẹn và thơm lâu."
      };
    }

    if (idStr === "mock-5" || product.name.toLowerCase().includes("dâu tây")) {
      return {
        whySoughtAfter: "Dâu tây giống New Zealand trồng thủy canh theo tiêu chuẩn khắt khe, trái to mọng, ngọt thơm đặc trưng.",
        origin: "Đà Lạt, Lâm Đồng",
        method: "Canh tác thủy canh an toàn",
        shelfLife: "3 ngày (bảo quản lạnh ở nhiệt độ 4°C)",
        howToUse: "Tráng qua nước lọc lạnh, cắt bỏ cuống. Dùng trực tiếp hoặc trộn sữa yogurt, làm sinh tố dâu tây ngon tuyệt.",
        precautions: "Tránh chạm mạnh làm dập dâu tây, chỉ rửa ngay trước khi ăn.",
        shippingInfo: "Giao nhanh trong đúng 2 giờ bằng túi cách nhiệt chuyên dụng giữ mát nội thành.",
        packaging: "Đóng gói trong 1 hộp nhựa PET thoáng khí có khối lượng chính xác 250g, có lót mút xốp dày 5mm giảm chấn bảo vệ."
      };
    }

    if (idStr === "mock-6" || product.name.toLowerCase().includes("mật ong")) {
      return {
        whySoughtAfter: "Mật ong tự nhiên từ hoa nhãn Hưng Yên thơm nồng, sánh đặc, cam kết nguyên chất 100% không pha tạp.",
        origin: "Khoái Châu, Hưng Yên",
        method: "Khai thác mật ong hoa nhãn tự nhiên",
        shelfLife: "2 năm (đậy kín ở nhiệt độ phòng 25°C)",
        howToUse: "Pha nước ấm uống vào buổi sáng detox, dùng làm gia vị ướp thịt nướng, pha nước cam, chanh giải nhiệt.",
        precautions: "Không bảo quản mật ong trong tủ lạnh vì dễ bị kết tinh đường. Không dùng cho trẻ dưới 1 tuổi.",
        shippingInfo: "Giao tiêu chuẩn trong đúng 2 ngày, bọc chống sốc dầy dặn chống bể vỡ.",
        packaging: "Đóng gói trong 1 chai thủy tinh cao cấp, khối lượng mật ong chính xác là 650g (chứa đúng 500ml mật ong nguyên chất), quấn bọc bằng 1 lớp giấy kraft bảo vệ."
      };
    }

    if (idStr === "mock-7" || product.name.toLowerCase().includes("tiêu")) {
      return {
        whySoughtAfter: "Hạt tiêu chín đỏ được hái lượm thủ công, phơi sấy tự nhiên cho hương vị cay nồng nàn thơm lâu đặc biệt.",
        origin: "Chư Sê, Gia Lai",
        method: "Phơi sấy tự nhiên sạch bụi bẩn",
        shelfLife: "18 tháng (bảo quản nơi khô ráo dưới 25°C)",
        howToUse: "Dùng để ướp các món kho, xào, nướng hoặc rắc lên món ăn chín để tăng hương vị.",
        precautions: "Nên đậy kín sau khi sử dụng để giữ mùi thơm cay nồng lâu nhất.",
        shippingInfo: "Giao tiêu chuẩn trong đúng 3 ngày toàn quốc.",
        packaging: "Đóng gói trong 1 hũ thủy tinh có đầu xay tiện lợi, khối lượng chính xác 100g, tháo nắp bảo vệ để xay trực tiếp vào món ăn."
      };
    }

    if (idStr === "mock-8" || product.name.toLowerCase().includes("trà")) {
      return {
        whySoughtAfter: "Trà Ô Long tuyển chọn từ búp trà tươi 1 tôm 2 lá vùng chè Cầu Đất, vị tiền chát ngọt hậu kéo dài.",
        origin: "Cầu Đất, Đà Lạt",
        method: "Thu hoạch tay thủ công và lên men bán phần",
        shelfLife: "12 tháng (đậy kín tránh ánh sáng mặt trời)",
        howToUse: "Tráng nước sôi ấm trà, dùng đúng 5g trà hãm với đúng 150ml nước sôi ở nhiệt độ đúng 90°C trong đúng 45 giây và thưởng thức.",
        precautions: "Không nên uống trà khi đói hoặc trước khi đi ngủ.",
        shippingInfo: "Giao nhanh nội thành trong đúng 1 ngày hoặc giao tiêu chuẩn trong đúng 2 ngày.",
        packaging: "Đóng gói trong 1 túi nhôm hút chân không bảo vệ tối đa hương trà, đặt trong hộp thiếc cao cấp khối lượng chính xác 250g."
      };
    }

    if (idStr === "mock-9" || product.name.toLowerCase().includes("thịt")) {
      return {
        whySoughtAfter: "Heo rừng lai được chăn thả tự nhiên, thức ăn hữu cơ, thịt chắc, bì giòn ngọt, ít mỡ cực kỳ thơm ngon.",
        origin: "Trang trại Khánh Hòa",
        method: "Chăn thả tự nhiên hữu cơ",
        shelfLife: "3 tháng (bảo quản đông lạnh ở nhiệt độ -18°C)",
        howToUse: "Rã đông tự nhiên, thái mỏng làm các món hấp sả, xào sả ớt, nướng mọi hoặc giả cầy.",
        precautions: "Không tái cấp đông sau khi đã rã đông hoàn toàn.",
        shippingInfo: "Vận chuyển nhanh trong đúng 2 giờ bằng thùng xốp trữ đá mát giữ thịt đông lạnh ổn định.",
        packaging: "Thịt heo rừng cắt miếng vuông vức, đóng gói trong khay hút chân không khối lượng chính xác 1000g."
      };
    }

    if (idStr === "mock-10" || product.name.toLowerCase().includes("xoài")) {
      return {
        whySoughtAfter: "Cây giống xoài cát Hòa Lộc chuẩn F1, khỏe mạnh, sạch sâu bệnh, dễ trồng và nhanh ra quả.",
        origin: "Cái Bè, Tiền Giang",
        method: "Nhân giống ghép cành tuyển chọn",
        shelfLife: "Phải trồng xuống đất trong đúng 2 ngày sau khi nhận cây để bảo đảm tỉ lệ sống",
        howToUse: "Đào hố rộng hơn bầu đất, bóc nhẹ túi nilon bầu, đặt cây xuống, nén nhẹ đất và tưới đẫm nước.",
        precautions: "Che mát cho cây con trong đúng 14 ngày đầu tiên sau khi hạ thổ.",
        shippingInfo: "Giao nhanh trong đúng 2 ngày bằng xe chuyên dụng chở cây xanh.",
        packaging: "Bầu đất xơ dừa bọc bao tải đay bảo vệ rễ khỏe mạnh, buộc tag giống chuẩn F1, chiều cao cây đúng 70cm."
      };
    }

    return {
      ...defaults,
      origin: product.farmLocation || defaults.origin,
      packaging: "Đóng gói tiêu chuẩn khối lượng chính xác 500g trong bao bì sinh học tự phân hủy bảo vệ môi trường."
    };
  }, [product]);

  const handleSaveProduct = () => {
    setIsSaved(!isSaved);
    if (!isSaved) {
      triggerToast(`Đã lưu sản phẩm "${product?.name}" vào danh sách yêu thích.`);
    } else {
      triggerToast(`Đã xóa sản phẩm "${product?.name}" khỏi danh sách yêu thích.`);
    }
  };

  const handleToggleSaveRelated = (relatedId, relatedName) => {
    const updated = new Set(savedRelatedIds);
    if (updated.has(relatedId)) {
      updated.delete(relatedId);
      triggerToast(`Đã xóa "${relatedName}" khỏi danh sách yêu thích.`);
    } else {
      updated.add(relatedId);
      triggerToast(`Đã lưu "${relatedName}" vào danh sách yêu thích.`);
    }
    setSavedRelatedIds(updated);
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

            <button className="btn-view-farm-profile">
              Xem hồ sơ nông trại →
            </button>
          </div>
        </section>
      </main>

      {/* Detailed Product Info Section */}
      <section className="product-extended-details-section">
        <h2 className="extended-section-title">Thông tin chi tiết nông sản</h2>

        <div className="extended-details-grid">
          {/* Card 1: Vì sao săn tìm */}
          <div className="extended-card-item highlight-green">
            <div className="extended-card-header">
              <span className="extended-icon">🌟</span>
              <h3>Vì sao được săn đón?</h3>
            </div>
            <p>{extendedInfo.whySoughtAfter}</p>
          </div>

          {/* Card 2: Thông tin sản phẩm */}
          <div className="extended-card-item">
            <div className="extended-card-header">
              <span className="extended-icon">📋</span>
              <h3>Thông tin sản phẩm</h3>
            </div>
            <ul className="extended-specs-list">
              <li>
                <strong>Nguồn gốc:</strong> <span>{extendedInfo.origin}</span>
              </li>
              <li>
                <strong>Canh tác:</strong> <span>{extendedInfo.method}</span>
              </li>
              {product.harvestDate ? (
                <li>
                  <strong>Ngày thu hoạch/đóng gói:</strong> <span>{product.harvestDate}</span>
                </li>
              ) : (
                <li>
                  <strong>Ngày thu hoạch/đóng gói:</strong> <span>Chưa xác định</span>
                </li>
              )}
              {product.expirationDate ? (
                <li>
                  <strong>Hạn sử dụng:</strong> <span>{product.expirationDate}</span>
                </li>
              ) : (
                <li>
                  <strong>Hạn bảo quản:</strong> <span>{extendedInfo.shelfLife}</span>
                </li>
              )}
              {product.traceabilityImageUrl && (
                <li>
                  <strong>Truy xuất nguồn gốc:</strong>{" "}
                  <a href={product.traceabilityImageUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary-color)", fontWeight: "600", textDecoration: "underline" }}>
                    Xem ảnh truy xuất
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Card 3: Cách sử dụng */}
          <div className="extended-card-item">
            <div className="extended-card-header">
              <span className="extended-icon">🍽️</span>
              <h3>Hướng dẫn sử dụng</h3>
            </div>
            <p>{extendedInfo.howToUse}</p>
          </div>

          {/* Card 4: Lưu ý */}
          <div className="extended-card-item">
            <div className="extended-card-header">
              <span className="extended-icon">⚠️</span>
              <h3>Lưu ý bảo quản</h3>
            </div>
            <p>{extendedInfo.precautions}</p>
          </div>

          {/* Card 5: Đóng gói */}
          <div className="extended-card-item">
            <div className="extended-card-header">
              <span className="extended-icon">📦</span>
              <h3>Quy cách đóng gói</h3>
            </div>
            <p>{extendedInfo.packaging}</p>
          </div>

          {/* Card 6: Vận chuyển */}
          <div className="extended-card-item">
            <div className="extended-card-header">
              <span className="extended-icon">🚚</span>
              <h3>Địa điểm vận chuyển</h3>
            </div>
            <p>{extendedInfo.shippingInfo}</p>
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

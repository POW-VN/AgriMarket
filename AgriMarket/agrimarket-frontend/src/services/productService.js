// src/services/productService.js

import apiClient from "./apiClient";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/*
  File này dùng để lấy danh sách sản phẩm của farmer.
...
*/

const getFullImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("/uploads/")) {
        const host = API_BASE_URL.endsWith("/api") 
            ? API_BASE_URL.substring(0, API_BASE_URL.length - 4) 
            : API_BASE_URL;
        return `${host}${url}`;
    }
    return url;
};

const getDefaultImage = (category, name) => {
    const cat = (category || "").toLowerCase();
    const n = (name || "").toLowerCase();
    
    if (cat.includes("trái cây") || cat.includes("fruit") || n.includes("táo") || n.includes("dâu") || n.includes("xoài")) {
        return "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=600"; // Generic mixed fruits
    }
    if (cat.includes("rau") || cat.includes("củ") || cat.includes("quả") || cat.includes("vegetable") || n.includes("cà chua") || n.includes("cà rốt") || n.includes("dưa")) {
        return "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600"; // Carrot/vegetables
    }
    if (cat.includes("lương thực") || cat.includes("gạo") || cat.includes("nếp") || n.includes("gạo")) {
        return "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600"; // Rice
    }
    if (cat.includes("chăn nuôi") || cat.includes("thịt") || n.includes("thịt") || n.includes("heo") || n.includes("bò") || n.includes("gà")) {
        return "https://images.unsplash.com/photo-1602491453977-63a5385166cf?w=600"; // Meat / Livestock
    }
    if (cat.includes("chế biến") || cat.includes("mật ong") || n.includes("mật ong")) {
        return "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600"; // Honey
    }
    if (cat.includes("trứng") || cat.includes("sữa") || n.includes("trứng") || n.includes("sữa")) {
        return "https://images.unsplash.com/photo-1516448424440-5dbf97e69009?w=600"; // Eggs
    }
    return "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600"; // General fallback (carrot)
};

const normalizeProduct = (item) => {
    const categoryName =
        item.category_name ||
        item.categoryName ||
        item.category?.name ||
        `Danh mục #${item.category_id || item.categoryId || "N/A"}`;

    const defaultImg = getDefaultImage(categoryName, item.name);

    const primaryImageUrl =
        item.thumbnail_url ||
        item.thumbnailUrl ||
        item.image_url ||
        item.imageUrl ||
        item.img_url ||
        item.productImage ||
        "";

    const resolvedImageUrl = primaryImageUrl ? getFullImageUrl(primaryImageUrl) : defaultImg;

    const resolvedImages = (item.images && item.images.length > 0)
        ? item.images.map(getFullImageUrl)
        : [resolvedImageUrl];

    return {
        // product.id
        id: item.id,

        // product.farmer_id
        farmerId: item.farmer_id || item.farmerId,

        // product.category_id
        categoryId: item.category_id || item.categoryId,

        // product.name
        name: item.name || "Chưa có tên sản phẩm",

        // product.description
        description: item.description || "",

        // product.ai_generated_description
        aiGeneratedDescription: item.ai_generated_description || item.aiGeneratedDescription || "",

        // categories.name
        // Backend nên join categories và trả về category_name
        category: categoryName,

        // product.price
        price: Number(item.price ?? 0),

        // product.ai_suggested_price
        aiSuggestedPrice: Number(item.ai_suggested_price ?? item.aiSuggestedPrice ?? 0),

        // product.stock
        stock: Number(item.stockQuantity ?? item.stock_quantity ?? item.stock ?? 0),

        // product.unit
        unit: item.unit || "sản phẩm",

        // product.status
        // Database dùng: draft, pending, approved, rejected, hidden, sold_out
        status: item.status || "draft",

        // product.harvest_date
        harvestDate: item.harvest_date || item.harvestDate || null,

        // product.expiration_date
        expirationDate: item.expiration_date || item.expirationDate || null,

        // product.traceability_image_url
        traceabilityImageUrl: getFullImageUrl(item.traceability_image_url || item.traceabilityImageUrl || ""),

        // product.created_at
        createdAt: item.created_at || item.createdAt || null,

        // organic fields
        isOrganic: !!(item.isOrganic || item.is_organic),
        certificateUrl: getFullImageUrl(item.certificateUrl || item.certificate_url || ""),
        isLocal: true,
        images: resolvedImages,
        reviewsCount: (item.reviewsCount !== undefined && item.reviewsCount !== null)
            ? Number(item.reviewsCount)
            : ((item.reviews_count !== undefined && item.reviews_count !== null)
                ? Number(item.reviews_count)
                : (10 + (Number(item.id || 0) * 7) % 150)),

        // rating and sales (sold)
        rating: (item.rating !== undefined && item.rating !== null)
            ? Number(item.rating)
            : Number((4.0 + (Number(item.id || 0) % 11) * 0.1).toFixed(1)),
        sold: (item.sold !== undefined && item.sold !== null)
            ? Number(item.sold)
            : 0,

        // product_image.img_url
        // Backend nên trả ảnh thumbnail là thumbnail_url
        imageUrl: resolvedImageUrl,
        farmerName: item.farmerName || item.farmer_name || item.farmer?.farmName || "Nông trại Green Valley",
        farmLocation: item.farmLocation || item.farm_location || item.farmer?.farmAddress || "Đà Lạt, Lâm Đồng (cách 12 km)",
        farmDescription: item.farmDescription || item.farm_description || item.farmer?.description || "Nông trại gia đình chuyên canh các loại rau củ hữu cơ chất lượng cao.",
        farmerAvatarUrl: getFullImageUrl(item.farmerAvatarUrl || item.farmer_avatar_url || item.farmer?.avatarUrl || ""),
        adminNotes: item.adminNotes || item.admin_notes || "",
        rejectionReason: item.rejectionReason || item.rejection_reason || "",
        farmerVietgapUrl: item.farmerVietgapUrl || item.farmer_vietgap_url || "",
        farmerGlobalgapUrl: item.farmerGlobalgapUrl || item.farmer_globalgap_url || "",
        farmerOrganicUrl: item.farmerOrganicUrl || item.farmer_organic_url || "",
    };
};

export const getFarmerProducts = async () => {
    try {
        const response = await apiClient.get("/api/farmer/products");
        const data = response.data;
        const productList = Array.isArray(data) ? data : data.data || [];
        return productList.map(normalizeProduct);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error);
        console.warn("⚠️ Không thể kết nối API Backend hoặc chưa đăng nhập hợp lệ. Đang tự động sử dụng Dữ liệu mô phỏng (Mock Data)! Chi tiết lỗi:", error);


        /*
          Dữ liệu mẫu dưới đây chỉ để test giao diện frontend.
          Khi backend/API đã chạy thật, bạn có thể xóa phần return mẫu này.
    
          Dữ liệu mẫu này đã đặt tên field theo dạng sau khi normalize,
          tức là ProductPage.jsx có thể dùng trực tiếp:
          product.name
          product.category
          product.stock
          product.price
          product.status
          product.imageUrl
        */

        return [
            {
                id: 1,
                farmerId: 1,
                categoryId: 1,
                name: "Cà chua hữu cơ",
                description: "Cà chua sạch được trồng tại nông trại địa phương.",
                aiGeneratedDescription: "",
                category: "Rau củ",
                price: 49900,
                aiSuggestedPrice: 52000,
                stock: 45,
                unit: "kg",
                status: "approved",
                harvestDate: "2026-06-01",
                createdAt: "2026-06-01",
                imageUrl:
                    "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300",
            },
            {
                id: 2,
                farmerId: 1,
                categoryId: 2,
                name: "Mật ong hoa rừng",
                description: "Mật ong nguyên chất từ hoa rừng.",
                aiGeneratedDescription: "",
                category: "Thực phẩm khô",
                price: 120000,
                aiSuggestedPrice: 125000,
                stock: 0,
                unit: "hũ",
                status: "sold_out",
                harvestDate: "2026-05-20",
                createdAt: "2026-05-21",
                imageUrl:
                    "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300",
            },
            {
                id: 3,
                farmerId: 1,
                categoryId: 3,
                name: "Trứng gà thả vườn",
                description: "Trứng gà sạch từ mô hình thả vườn.",
                aiGeneratedDescription: "",
                category: "Trứng & Sữa",
                price: 65000,
                aiSuggestedPrice: 67000,
                stock: 24,
                unit: "vỉ",
                status: "pending",
                harvestDate: "2026-05-28",
                createdAt: "2026-05-29",
                imageUrl: "",
            },
            {
                id: 4,
                farmerId: 1,
                categoryId: 4,
                name: "Rau cải xanh",
                description: "Rau cải xanh thu hoạch trong ngày.",
                aiGeneratedDescription: "",
                category: "Rau xanh",
                price: 15000,
                aiSuggestedPrice: 18000,
                stock: 30,
                unit: "bó",
                status: "draft",
                harvestDate: "2026-06-02",
                createdAt: "2026-06-02",
                imageUrl: "",
            },
            {
                id: 5,
                farmerId: 1,
                categoryId: 5,
                name: "Dưa leo sạch",
                description: "Dưa leo tươi, phù hợp cho món salad và nước ép.",
                aiGeneratedDescription: "",
                category: "Rau củ",
                price: 22000,
                aiSuggestedPrice: 25000,
                stock: 18,
                unit: "kg",
                status: "hidden",
                harvestDate: "2026-05-30",
                createdAt: "2026-05-30",
                imageUrl: "",
            },
            {
                id: 6,
                farmerId: 1,
                categoryId: 6,
                name: "Bơ sáp Đắk Lắk",
                description: "Bơ sáp chín tự nhiên, cơm vàng, béo.",
                aiGeneratedDescription: "",
                category: "Trái cây",
                price: 75000,
                aiSuggestedPrice: 79000,
                stock: 12,
                unit: "kg",
                status: "rejected",
                harvestDate: "2026-05-25",
                createdAt: "2026-05-26",
                imageUrl: "",
            },
        ];
    }
};

export const deleteFarmerProduct = async (productId) => {
    try {
        const response = await apiClient.delete(`/api/farmer/products/${productId}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        throw error;
    }
};

export const createFarmerProduct = async (productData) => {
    try {
        const response = await apiClient.post("/api/farmer/products", productData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm:", error);
        throw error;
    }
};

export const updateFarmerProduct = async (productId, productData) => {
    try {
        const response = await apiClient.put(`/api/farmer/products/${productId}`, productData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi sửa sản phẩm:", error);
        throw error;
    }
};

export const getAllApprovedProducts = async () => {
    try {
        const response = await apiClient.get("/api/products");
        const data = response.data;
        const productList = Array.isArray(data) ? data : data.data || [];
        return productList.map(normalizeProduct);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm công khai:", error);
        return [];
    }
};

export const getProductById = async (productId) => {
    try {
        const response = await apiClient.get(`/api/products/${productId}`);
        return normalizeProduct(response.data);
    } catch (error) {
        console.error(`Lỗi khi lấy thông tin sản phẩm #${productId}:`, error);
        const found = MOCK_PRODUCTS.find(p => String(p.id) === String(productId));
        if (found) return found;

        // Fallback default
        return {
            id: productId,
            name: "Nông sản sạch chất lượng cao",
            category: "Rau củ quả",
            price: 35000,
            unit: "kg",
            isOrganic: true,
            isLocal: true,
            imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600",
            images: [
                "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600"
            ],
            rating: 4.6,
            reviewsCount: 15,
            sold: 50,
            description: "Nông sản được canh tác an toàn, đảm bảo chất lượng, tươi ngon thu hoạch trực tiếp tại nông trại địa phương trong ngày.",
            stock: 20,
            farmerName: "Nông trại Xanh địa phương",
            farmLocation: "Lâm Đồng",
            farmDescription: "Canh tác nông sản an toàn theo hướng hữu cơ bền vững."
        };
    }
};

const MOCK_PRODUCTS = [
    {
        id: "mock-1",
        name: "Cà chua Heirloom hữu cơ",
        category: "Rau củ quả",
        price: 49900,
        unit: "kg",
        isOrganic: true,
        isLocal: true,
        imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600",
        images: [
            "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600",
            "https://images.unsplash.com/photo-1595855759920-86582396756a?w=600"
        ],
        rating: 4.8,
        reviewsCount: 120,
        sold: 120,
        stock: 35,
        description: "Cà chua hữu cơ Heirloom với màu sắc rực rỡ và hương vị ngọt thanh tự nhiên. Thích hợp cho các món salad, nấu sốt hoặc ăn trực tiếp.",
        farmerName: "Happy Farm",
        farmLocation: "Lâm Đồng (cách 15 km)",
        farmDescription: "Nông nghiệp hữu cơ tuần hoàn, cam kết không phân bón hóa học và thuốc trừ sâu độc hại."
    },
    {
        id: "mock-2",
        name: "Cà rốt gia truyền hữu cơ",
        category: "Rau củ quả",
        price: 112500, // Tương đương $4.50
        unit: "bó",
        isOrganic: true,
        isLocal: true,
        imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600",
        images: [
            "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600",
            "https://images.unsplash.com/photo-1538582499627-12f6d9a98ef2?w=600"
        ],
        rating: 4.8,
        reviewsCount: 124,
        sold: 85,
        stock: 45,
        description: "Cà rốt gia truyền hữu cơ (Organic Heirloom Carrots) được trồng trong lòng đất giàu dinh dưỡng hoàn toàn tự nhiên, không sử dụng thuốc trừ sâu hóa học. Vị ngọt thanh đặc trưng, giàu vitamin và chất xơ. Rất thích hợp để làm nước ép, nướng hoặc ăn sống.",
        farmerName: "Nông trại Green Valley",
        farmLocation: "Đà Lạt, Lâm Đồng (cách 12 km)",
        farmDescription: "Nông trại gia đình 3 thế hệ chuyên canh các loại rau củ hữu cơ chất lượng cao. Được chứng nhận hữu cơ từ năm 2010."
    },
    {
        id: "mock-3",
        name: "Táo Honeycrisp giòn ngọt",
        category: "Trái cây",
        price: 69000,
        unit: "kg",
        isOrganic: false,
        isLocal: false,
        imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600",
        images: [
            "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600"
        ],
        rating: 4.9,
        reviewsCount: 48,
        sold: 210,
        stock: 60,
        description: "Táo Honeycrisp ngọt thanh, mọng nước và có màu đỏ hồng bắt mắt. Thích hợp để làm quà biếu hoặc tráng miệng cho gia đình.",
        farmerName: "Vườn trái cây Orchard House",
        farmLocation: "Đà Lạt (cách 20 km)",
        farmDescription: "Chuyên canh các loại cây ăn trái theo hướng công nghệ cao, an toàn sinh học."
    },
    {
        id: "mock-4",
        name: "Gạo Tám Xoan Điện Biên",
        category: "Cây lương thực",
        price: 32000,
        unit: "kg",
        isOrganic: true,
        isLocal: true,
        imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600",
        images: [
            "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600"
        ],
        rating: 4.7,
        reviewsCount: 89,
        sold: 340,
        stock: 150,
        description: "Gạo đặc sản Điện Biên hạt nhỏ đều, thơm dẻo đậm đà ngay cả khi để nguội. Canh tác an toàn tự nhiên.",
        farmerName: "Hợp tác xã Lương thực Điện Biên",
        farmLocation: "Điện Biên (cách 350 km)",
        farmDescription: "Chuyên cung cấp gạo sạch đặc sản vùng cao tây bắc."
    },
    {
        id: "mock-5",
        name: "Dâu tây sạch loại A",
        category: "Trái cây",
        price: 150000,
        unit: "hộp",
        isOrganic: true,
        isLocal: true,
        imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600",
        images: [
            "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600"
        ],
        rating: 4.9,
        reviewsCount: 156,
        sold: 400,
        stock: 25,
        description: "Dâu tây giống New Zealand trồng thủy canh theo tiêu chuẩn khắt khe, trái to mọng, ngọt thơm đặc trưng.",
        farmerName: "Nông trại Dâu tây BerryLand",
        farmLocation: "Đà Lạt (cách 8 km)",
        farmDescription: "Trải nghiệm và canh tác dâu tây organic công nghệ cao."
    },
    {
        id: "mock-6",
        name: "Mật ong hoa nhãn nguyên chất",
        category: "Nông sản chế biến",
        price: 180000,
        unit: "chai",
        isOrganic: false,
        isLocal: true,
        imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600",
        images: [
            "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600"
        ],
        rating: 4.6,
        reviewsCount: 74,
        sold: 150,
        stock: 80,
        description: "Mật ong tự nhiên từ hoa nhãn Hưng Yên thơm nồng, sánh đặc, cam kết nguyên chất 100% không pha tạp.",
        farmerName: "Hộ nuôi ong truyền thống Hưng Yên",
        farmLocation: "Hưng Yên (cách 60 km)",
        farmDescription: "Gia đình nuôi ong mật lâu năm, chất lượng và uy tín đặt lên hàng đầu."
    },
    {
        id: "mock-7",
        name: "Hạt tiêu đen chín đỏ",
        category: "Cây công nghiệp",
        price: 95000,
        unit: "hộp",
        isOrganic: true,
        isLocal: true,
        imageUrl: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600",
        images: [
            "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600"
        ],
        rating: 4.4,
        reviewsCount: 32,
        sold: 95,
        stock: 40,
        description: "Hạt tiêu chín đỏ được hái lượm thủ công, phơi sấy tự nhiên cho hương vị cay nồng nàn thơm lâu đặc biệt.",
        farmerName: "Nông trường tiêu Chư Sê",
        farmLocation: "Gia Lai (cách 250 km)",
        farmDescription: "Tiêu sạch xuất khẩu vùng Tây Nguyên màu mỡ."
    },
    {
        id: "mock-8",
        name: "Trà ô long thượng hạng",
        category: "Nông sản hữu cơ",
        price: 250000,
        unit: "hộp",
        isOrganic: true,
        isLocal: true,
        imageUrl: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600",
        images: [
            "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600"
        ],
        rating: 4.8,
        reviewsCount: 65,
        sold: 180,
        stock: 50,
        description: "Trà Ô Long tuyển chọn từ búp trà tươi 1 tôm 2 lá vùng chè Cầu Đất, vị tiền chát ngọt hậu kéo dài.",
        farmerName: "Đồi chè Cầu Đất",
        farmLocation: "Lâm Đồng (cách 18 km)",
        farmDescription: "Vùng chè lâu đời Cầu Đất chuyên trà sạch chất lượng cao."
    },
    {
        id: "mock-9",
        name: "Thịt heo rừng lai hữu cơ",
        category: "Chăn nuôi",
        price: 160000,
        unit: "kg",
        isOrganic: true,
        isLocal: true,
        imageUrl: "https://images.unsplash.com/photo-1602491453977-63a5385166cf?w=600",
        images: [
            "https://images.unsplash.com/photo-1602491453977-63a5385166cf?w=600"
        ],
        rating: 4.5,
        reviewsCount: 42,
        sold: 70,
        stock: 15,
        description: "Heo rừng lai được chăn thả tự nhiên, thức ăn hữu cơ, thịt chắc, bì giòn ngọt, ít mỡ cực kỳ thơm ngon.",
        farmerName: "Trang trại chăn thả tự nhiên Khánh Hòa",
        farmLocation: "Khánh Hòa (cách 180 km)",
        farmDescription: "Chăn thả mô hình sinh thái bền vững tự nhiên."
    },
    {
        id: "mock-10",
        name: "Giống xoài cát Hòa Lộc",
        category: "Giống cây trồng",
        price: 45000,
        unit: "cây",
        isOrganic: false,
        isLocal: true,
        imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600",
        images: [
            "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600"
        ],
        rating: 4.3,
        reviewsCount: 28,
        sold: 50,
        stock: 100,
        description: "Cây giống xoài cát Hòa Lộc chuẩn F1, khỏe mạnh, sạch sâu bệnh, dễ trồng và nhanh ra quả.",
        farmerName: "Vườn ươm giống miền Tây",
        farmLocation: "Tiền Giang (cách 120 km)",
        farmDescription: "Chuyên sản xuất và phân phối cây giống ăn quả chuẩn giống chất lượng cao."
    }
];
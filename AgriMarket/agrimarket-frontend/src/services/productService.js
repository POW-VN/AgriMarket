// src/services/productService.js

import apiClient from "./apiClient";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/*
  File này dùng để lấy danh sách sản phẩm của farmer.
...
*/

const normalizeProduct = (item) => {
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
        category:
            item.category_name ||
            item.categoryName ||
            item.category?.name ||
            `Danh mục #${item.category_id || item.categoryId || "N/A"}`,

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

        // product.created_at
        createdAt: item.created_at || item.createdAt || null,

        // organic fields
        isOrganic: !!(item.isOrganic || item.is_organic),
        certificateUrl: item.certificateUrl || item.certificate_url || "",

        // rating and sales (sold)
        rating: Number(item.rating || (4.0 + (Number(item.id || 0) % 11) * 0.1).toFixed(1)),
        sold: Number(item.sold || ((Number(item.id || 0) * 17) % 150) + 10),

        // product_image.img_url
        // Backend nên trả ảnh thumbnail là thumbnail_url
        imageUrl:
            item.thumbnail_url ||
            item.thumbnailUrl ||
            item.image_url ||
            item.imageUrl ||
            item.img_url ||
            item.productImage ||
            "",
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
export const mockPromotions = [
  {
    id: 1,
    title: "Khuyến mãi rau củ hữu cơ mùa hè",
    description: "Giảm 15% cho các sản phẩm rau củ, chất lượng cao.",
    discountType: "percent",
    discountVal: 15,
    farmerName: "Toàn hệ thống", // Admin only
    startDate: "2024-06-01",
    endDate: "2024-06-30",
    status: "active",
    productsCount: 2,
    maxUses: 1000,
    usedCount: 850,
    budget: 50000000,
    usedBudget: 35000000,
    revenueGenerated: 150000000,
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=400",
    code: "SUMMER_VEG_15"
  },
  {
    id: 2,
    title: "Trái cây miền Tây giảm sốc",
    description: "Giảm 20.000đ cho đơn từ 200.000đ",
    discountType: "amount",
    discountVal: 20000,
    farmerName: "Nguyễn Văn A (Farm Fresh)",
    startDate: "2024-07-15",
    endDate: "2024-07-25",
    status: "upcoming",
    productsCount: 5,
    maxUses: 500,
    usedCount: 0,
    budget: 10000000,
    usedBudget: 0,
    revenueGenerated: 0,
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=400",
    code: "FRUIT_WEST_20K"
  },
  {
    id: 3,
    title: "Lúa gạo đồng bằng sông Cửu Long",
    description: "Miễn phí vận chuyển cho đơn hàng lúa gạo.",
    discountType: "free_ship",
    discountVal: 30000,
    farmerName: "Hợp tác xã lúa sạch",
    startDate: "2024-05-01",
    endDate: "2024-05-31",
    status: "ended",
    productsCount: 1,
    maxUses: 200,
    usedCount: 200,
    budget: 6000000,
    usedBudget: 6000000,
    revenueGenerated: 45000000,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&q=80&w=400",
    code: "RICE_FREESHIP"
  }
];

export const mockFarmers = [
  { id: "f1", name: "Toàn hệ thống" },
  { id: "f2", name: "Nguyễn Văn A (Farm Fresh)" },
  { id: "f3", name: "Trần Thị B (Vườn Xanh)" },
  { id: "f4", name: "Lê Văn C (Eco Farm)" }
];

export const productCategories = [
  { category: "Cây lương thực", icon: "🌾", items: ["Lúa gạo", "Ngô", "Khoai lang", "Sắn"] },
  { category: "Rau củ quả", icon: "🥕", items: ["Cà chua hữu cơ", "Cà chua bi đen", "Rau sạch", "Dưa leo", "Cà rốt"] },
  { category: "Trái cây", icon: "🍎", items: ["Kiwi New Zealand", "Xoài Cát", "Sầu Riêng", "Chuối", "Cam", "Dưa hấu"] },
  { category: "Cây công nghiệp", icon: "🌳", items: ["Cà phê", "Cao su", "Hồ tiêu", "Điều", "Chè"] },
  { category: "Giống cây trồng", icon: "🌱", items: ["Hạt giống rau", "Cây giống ăn quả", "Hạt giống hoa"] },
  { category: "Nông sản chế biến", icon: "📦", items: ["Trái cây sấy", "Nước ép", "Bột nông sản", "Mứt"] },
  { category: "Chăn nuôi", icon: "🥚", items: ["Thịt lợn", "Thịt bò", "Thịt gà", "Trứng", "Sữa tươi"] }
];

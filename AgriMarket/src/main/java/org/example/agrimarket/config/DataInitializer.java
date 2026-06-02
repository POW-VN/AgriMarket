package org.example.agrimarket.config;

import org.example.agrimarket.model.Category;
import org.example.agrimarket.model.Farmer;
import org.example.agrimarket.model.Product;
import org.example.agrimarket.model.ProductImage;
import org.example.agrimarket.repository.CategoryRepository;
import org.example.agrimarket.repository.FarmerRepository;
import org.example.agrimarket.repository.ProductImageRepository;
import org.example.agrimarket.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Initialize Categories
        if (categoryRepository.count() == 0) {
            String[] categoryNames = {
                    "Rau củ",
                    "Trái cây",
                    "Sữa & Trứng",
                    "Bách hóa",
                    "Hoa tươi",
                    "Thịt & Hải sản"
            };

            List<Category> categories = new ArrayList<>();
            for (String name : categoryNames) {
                Category cat = new Category();
                cat.setName(name);
                cat.setDescription("Danh mục nông sản " + name);
                categories.add(cat);
            }
            categoryRepository.saveAll(categories);
            System.out.println(">>> DataInitializer: Đã thêm các Danh mục sản phẩm mẫu.");
        }

        // 2. Initialize Mock Products for first farmer if product table is empty
        if (productRepository.count() == 0) {
            List<Farmer> farmers = farmerRepository.findAll();
            if (!farmers.isEmpty()) {
                Farmer testFarmer = farmers.get(0);
                
                Category rauCu = categoryRepository.findByName("Rau củ").orElse(null);
                Category bachHoa = categoryRepository.findByName("Bách hóa").orElse(null);
                Category suaTrung = categoryRepository.findByName("Sữa & Trứng").orElse(null);
                Category traiCay = categoryRepository.findByName("Trái cây").orElse(null);

                // Product 1: Cà chua hữu cơ
                Product p1 = new Product();
                p1.setFarmer(testFarmer);
                p1.setCategory(rauCu);
                p1.setName("Cà chua hữu cơ");
                p1.setDescription("Cà chua sạch được trồng tại nông trại địa phương, không dùng thuốc trừ sâu hóa học.");
                p1.setPrice(49900.0);
                p1.setAiSuggestedPrice(52000.0);
                p1.setStockQuantity(45);
                p1.setUnit("kg");
                p1.setStatus("approved");
                p1.setHarvestDate(LocalDate.now().minusDays(1));
                productRepository.save(p1);

                ProductImage img1 = new ProductImage();
                img1.setProduct(p1);
                img1.setImgUrl("https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300");
                img1.setIsThumbnail(true);
                productImageRepository.save(img1);

                // Product 2: Mật ong hoa rừng
                Product p2 = new Product();
                p2.setFarmer(testFarmer);
                p2.setCategory(bachHoa);
                p2.setName("Mật ong hoa rừng");
                p2.setDescription("Mật ong nguyên chất từ hoa rừng tự nhiên.");
                p2.setPrice(120000.0);
                p2.setAiSuggestedPrice(125000.0);
                p2.setStockQuantity(0);
                p2.setUnit("hũ");
                p2.setStatus("sold_out");
                p2.setHarvestDate(LocalDate.now().minusDays(10));
                productRepository.save(p2);

                ProductImage img2 = new ProductImage();
                img2.setProduct(p2);
                img2.setImgUrl("https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300");
                img2.setIsThumbnail(true);
                productImageRepository.save(img2);

                // Product 3: Trứng gà thả vườn
                Product p3 = new Product();
                p3.setFarmer(testFarmer);
                p3.setCategory(suaTrung);
                p3.setName("Trứng gà thả vườn");
                p3.setDescription("Trứng gà sạch từ mô hình thả vườn tự nhiên.");
                p3.setPrice(65000.0);
                p3.setAiSuggestedPrice(67000.0);
                p3.setStockQuantity(24);
                p3.setUnit("vỉ");
                p3.setStatus("pending");
                p3.setHarvestDate(LocalDate.now().minusDays(3));
                productRepository.save(p3);

                // Product 4: Rau cải xanh
                Product p4 = new Product();
                p4.setFarmer(testFarmer);
                p4.setCategory(rauCu);
                p4.setName("Rau cải xanh");
                p4.setDescription("Rau cải xanh thu hoạch trong ngày, tươi ngon, an toàn.");
                p4.setPrice(15000.0);
                p4.setAiSuggestedPrice(18000.0);
                p4.setStockQuantity(30);
                p4.setUnit("bó");
                p4.setStatus("draft");
                p4.setHarvestDate(LocalDate.now());
                productRepository.save(p4);

                // Product 5: Dưa leo sạch
                Product p5 = new Product();
                p5.setFarmer(testFarmer);
                p5.setCategory(rauCu);
                p5.setName("Dưa leo sạch");
                p5.setDescription("Dưa leo tươi, phù hợp cho món salad và nước ép giải nhiệt.");
                p5.setPrice(22000.0);
                p5.setAiSuggestedPrice(25000.0);
                p5.setStockQuantity(18);
                p5.setUnit("kg");
                p5.setStatus("hidden");
                p5.setHarvestDate(LocalDate.now().minusDays(2));
                productRepository.save(p5);

                // Product 6: Bơ sáp Đắk Lắk
                Product p6 = new Product();
                p6.setFarmer(testFarmer);
                p6.setCategory(traiCay);
                p6.setName("Bơ sáp Đắk Lắk");
                p6.setDescription("Bơ sáp chín tự nhiên, cơm vàng dẻo béo ngậy.");
                p6.setPrice(75000.0);
                p6.setAiSuggestedPrice(79000.0);
                p6.setStockQuantity(12);
                p6.setUnit("kg");
                p6.setStatus("rejected");
                p6.setHarvestDate(LocalDate.now().minusDays(5));
                productRepository.save(p6);

                System.out.println(">>> DataInitializer: Đã thêm các Sản phẩm mẫu cho Farmer đầu tiên (" + testFarmer.getEmail() + ").");
            } else {
                System.out.println(">>> DataInitializer: Không tìm thấy Farmer nào trong cơ sở dữ liệu. Vui lòng đăng ký tài khoản Farmer trước.");
            }
        }
    }
}

package org.example.agrimarket.config;

import org.example.agrimarket.model.Admin;
import org.example.agrimarket.model.Category;
import org.example.agrimarket.model.Farmer;
import org.example.agrimarket.model.Product;
import org.example.agrimarket.model.ProductImage;
import org.example.agrimarket.repository.AdminRepository;
import org.example.agrimarket.repository.CategoryRepository;
import org.example.agrimarket.repository.FarmerRepository;
import org.example.agrimarket.repository.ProductImageRepository;
import org.example.agrimarket.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // ========== Ensure default admin account exists ==========
        String adminEmail = "admin@agrimarket.com";
        if (adminRepository.findByEmail(adminEmail).isEmpty()) {
            Admin admin = new Admin();
            admin.setFullName("Administrator");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setCreatedAt(LocalDateTime.now());
            adminRepository.save(admin);
            System.out.println(">>> DataInitializer: Created default admin account: " + adminEmail);
        } else {
            // Always reset password to ensure it's correct
            Admin admin = adminRepository.findByEmail(adminEmail).get();
            admin.setPassword(passwordEncoder.encode("admin123"));
            adminRepository.save(admin);
            System.out.println(">>> DataInitializer: Reset admin password for: " + adminEmail);
        }

        // Clean up redundant legacy columns in orders table
        String[] ordersCols = {"checkout_id", "total_price", "shipping_address"};
        for (String col : ordersCols) {
            try {
                // Drop default constraints if any
                jdbcTemplate.execute(
                    "DECLARE @ConstraintName nvarchar(200)\n" +
                    "SELECT @ConstraintName = Name FROM sys.default_constraints\n" +
                    "WHERE parent_object_id = OBJECT_ID('orders') AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('orders'), '" + col + "', 'ColumnId')\n" +
                    "IF @ConstraintName IS NOT NULL\n" +
                    "    EXEC('ALTER TABLE orders DROP CONSTRAINT ' + @ConstraintName);"
                );
                
                // Drop foreign key constraints if any
                jdbcTemplate.execute(
                    "DECLARE @FKName nvarchar(200)\n" +
                    "SELECT @FKName = f.name FROM sys.foreign_keys AS f\n" +
                    "INNER JOIN sys.foreign_key_columns AS fc ON f.object_id = fc.constraint_object_id\n" +
                    "WHERE fc.parent_object_id = OBJECT_ID('orders') AND fc.parent_column_id = COLUMNPROPERTY(OBJECT_ID('orders'), '" + col + "', 'ColumnId')\n" +
                    "IF @FKName IS NOT NULL\n" +
                    "    EXEC('ALTER TABLE orders DROP CONSTRAINT ' + @FKName);"
                );

                jdbcTemplate.execute(
                    "IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('orders') AND name = '" + col + "')\n" +
                    "    ALTER TABLE orders DROP COLUMN " + col + ";"
                );
                System.out.println(">>> DataInitializer: Dropped legacy column '" + col + "' from orders table.");
            } catch (Exception e) {
                System.err.println(">>> DataInitializer: Could not drop legacy column '" + col + "' from orders table: " + e.getMessage());
            }
        }

        // Clean up redundant legacy columns in order_item table
        String[] orderItemCols = {"product_thumbnail", "unit_price", "subtotal"};
        for (String col : orderItemCols) {
            try {
                // Drop default constraints if any
                jdbcTemplate.execute(
                    "DECLARE @ConstraintName nvarchar(200)\n" +
                    "SELECT @ConstraintName = Name FROM sys.default_constraints\n" +
                    "WHERE parent_object_id = OBJECT_ID('order_item') AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('order_item'), '" + col + "', 'ColumnId')\n" +
                    "IF @ConstraintName IS NOT NULL\n" +
                    "    EXEC('ALTER TABLE order_item DROP CONSTRAINT ' + @ConstraintName);"
                );

                // Drop foreign key constraints if any
                jdbcTemplate.execute(
                    "DECLARE @FKName nvarchar(200)\n" +
                    "SELECT @FKName = f.name FROM sys.foreign_keys AS f\n" +
                    "INNER JOIN sys.foreign_key_columns AS fc ON f.object_id = fc.constraint_object_id\n" +
                    "WHERE fc.parent_object_id = OBJECT_ID('order_item') AND fc.parent_column_id = COLUMNPROPERTY(OBJECT_ID('order_item'), '" + col + "', 'ColumnId')\n" +
                    "IF @FKName IS NOT NULL\n" +
                    "    EXEC('ALTER TABLE order_item DROP CONSTRAINT ' + @FKName);"
                );

                jdbcTemplate.execute(
                    "IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('order_item') AND name = '" + col + "')\n" +
                    "    ALTER TABLE order_item DROP COLUMN " + col + ";"
                );
                System.out.println(">>> DataInitializer: Dropped legacy column '" + col + "' from order_item table.");
            } catch (Exception e) {
                System.err.println(">>> DataInitializer: Could not drop legacy column '" + col + "' from order_item table: " + e.getMessage());
            }
        }

        // 1. Ensure the 8 main categories exist
        String[] targetCategories = {
                "Cây lương thực",
                "Rau củ quả",
                "Trái cây",
                "Cây công nghiệp",
                "Nông sản hữu cơ",
                "Chăn nuôi",
                "Giống cây trồng",
                "Nông sản chế biến"
        };

        for (String name : targetCategories) {
            if (!categoryRepository.findByName(name).isPresent()) {
                Category cat = new Category();
                cat.setName(name);
                cat.setDescription("Danh mục nông sản " + name);
                categoryRepository.save(cat);
                System.out.println(">>> DataInitializer: Đã tạo danh mục mới: " + name);
            }
        }

        // 2. Fetch target categories for re-mapping and seeding
        Category rauCuQua = categoryRepository.findByName("Rau củ quả").orElse(null);
        Category chanNuoi = categoryRepository.findByName("Chăn nuôi").orElse(null);
        Category nongSanCheBien = categoryRepository.findByName("Nông sản chế biến").orElse(null);
        Category giongCayTrong = categoryRepository.findByName("Giống cây trồng").orElse(null);
        Category traiCay = categoryRepository.findByName("Trái cây").orElse(null);

        // 3. Map existing products in database from old categories to new ones
        List<Product> products = productRepository.findAll();
        for (Product product : products) {
            Category currentCat = product.getCategory();
            if (currentCat != null) {
                String catName = currentCat.getName();
                Category targetCat = null;
                if ("Rau củ".equals(catName)) {
                    targetCat = rauCuQua;
                } else if ("Sữa & Trứng".equals(catName) || "Thịt & Hải sản".equals(catName)) {
                    targetCat = chanNuoi;
                } else if ("Bách hóa".equals(catName)) {
                    targetCat = nongSanCheBien;
                } else if ("Hoa tươi".equals(catName)) {
                    targetCat = giongCayTrong;
                }

                if (targetCat != null) {
                    product.setCategory(targetCat);
                    productRepository.save(product);
                    System.out.println(">>> DataInitializer: Di chuyển sản phẩm '" + product.getName() + "' sang danh mục '" + targetCat.getName() + "'");
                }
            }
        }

        // 4. Safely delete old default categories if no products reference them
        List<String> oldSystemCategories = List.of("Rau củ", "Bách hóa", "Sữa & Trứng", "Thịt & Hải sản", "Hoa tươi");
        for (String oldName : oldSystemCategories) {
            categoryRepository.findByName(oldName).ifPresent(oldCat -> {
                try {
                    categoryRepository.delete(oldCat);
                    System.out.println(">>> DataInitializer: Đã xóa danh mục cũ '" + oldName + "' khỏi database.");
                } catch (Exception e) {
                    System.err.println(">>> DataInitializer: Không thể xóa danh mục cũ '" + oldName + "': " + e.getMessage());
                }
            });
        }

        // 5. Initialize Mock Products for first farmer if product table is empty
        if (productRepository.count() == 0) {
            List<Farmer> farmers = farmerRepository.findAll();
            if (!farmers.isEmpty()) {
                Farmer testFarmer = farmers.get(0);

                // Product 1: Cà chua hữu cơ
                Product p1 = new Product();
                p1.setFarmer(testFarmer);
                p1.setCategory(rauCuQua);
                p1.setName("Cà chua hữu cơ");
                p1.setDescription("Cà chua sạch được trồng tại nông trại địa phương, không dùng thuốc trừ sâu hóa học.");
                p1.setPrice(49900.0);
                p1.setAiSuggestedPrice(52000.0);
                p1.setStockQuantity(45);
                p1.setUnit("kg");
                p1.setStatus("approved");
                p1.setHarvestDate(LocalDate.now().minusDays(1));
                p1.setExpirationDate(LocalDate.now().plusDays(6));
                productRepository.save(p1);

                ProductImage img1 = new ProductImage();
                img1.setProduct(p1);
                img1.setImgUrl("https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300");
                img1.setIsThumbnail(true);
                productImageRepository.save(img1);

                // Product 2: Mật ong hoa rừng
                Product p2 = new Product();
                p2.setFarmer(testFarmer);
                p2.setCategory(nongSanCheBien);
                p2.setName("Mật ong hoa rừng");
                p2.setDescription("Mật ong nguyên chất từ hoa rừng tự nhiên.");
                p2.setPrice(120000.0);
                p2.setAiSuggestedPrice(125000.0);
                p2.setStockQuantity(0);
                p2.setUnit("hũ");
                p2.setStatus("sold_out");
                p2.setHarvestDate(LocalDate.now().minusDays(10));
                p2.setExpirationDate(LocalDate.now().minusDays(3));
                productRepository.save(p2);

                ProductImage img2 = new ProductImage();
                img2.setProduct(p2);
                img2.setImgUrl("https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300");
                img2.setIsThumbnail(true);
                productImageRepository.save(img2);

                // Product 3: Trứng gà thả vườn
                Product p3 = new Product();
                p3.setFarmer(testFarmer);
                p3.setCategory(chanNuoi);
                p3.setName("Trứng gà thả vườn");
                p3.setDescription("Trứng gà sạch từ mô hình thả vườn tự nhiên.");
                p3.setPrice(65000.0);
                p3.setAiSuggestedPrice(67000.0);
                p3.setStockQuantity(24);
                p3.setUnit("vỉ");
                p3.setStatus("pending");
                p3.setHarvestDate(LocalDate.now().minusDays(3));
                p3.setExpirationDate(LocalDate.now().plusDays(4));
                productRepository.save(p3);

                // Product 4: Rau cải xanh
                Product p4 = new Product();
                p4.setFarmer(testFarmer);
                p4.setCategory(rauCuQua);
                p4.setName("Rau cải xanh");
                p4.setDescription("Rau cải xanh thu hoạch trong ngày, tươi ngon, an toàn.");
                p4.setPrice(15000.0);
                p4.setAiSuggestedPrice(18000.0);
                p4.setStockQuantity(30);
                p4.setUnit("bó");
                p4.setStatus("draft");
                p4.setHarvestDate(LocalDate.now());
                p4.setExpirationDate(LocalDate.now().plusDays(3));
                productRepository.save(p4);

                // Product 5: Dưa leo sạch
                Product p5 = new Product();
                p5.setFarmer(testFarmer);
                p5.setCategory(rauCuQua);
                p5.setName("Dưa leo sạch");
                p5.setDescription("Dưa leo tươi, phù hợp cho món salad và nước ép giải nhiệt.");
                p5.setPrice(22000.0);
                p5.setAiSuggestedPrice(25000.0);
                p5.setStockQuantity(18);
                p5.setUnit("kg");
                p5.setStatus("hidden");
                p5.setHarvestDate(LocalDate.now().minusDays(2));
                p5.setExpirationDate(LocalDate.now().plusDays(3));
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
                p6.setExpirationDate(LocalDate.now().plusDays(2));
                productRepository.save(p6);

                System.out.println(">>> DataInitializer: Đã thêm các Sản phẩm mẫu cho Farmer đầu tiên (" + testFarmer.getEmail() + ").");
            } else {
                System.out.println(">>> DataInitializer: Không tìm thấy Farmer nào trong cơ sở dữ liệu. Vui lòng đăng ký tài khoản Farmer trước.");
            }
        }
    }
}

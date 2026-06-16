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
        String[] ordersCols = { "checkout_id", "total_price", "shipping_address" };
        for (String col : ordersCols) {
            try {
                // Drop default constraints if any
                jdbcTemplate.execute(
                        "DECLARE @ConstraintName nvarchar(200)\n" +
                                "SELECT @ConstraintName = Name FROM sys.default_constraints\n" +
                                "WHERE parent_object_id = OBJECT_ID('orders') AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('orders'), '"
                                + col + "', 'ColumnId')\n" +
                                "IF @ConstraintName IS NOT NULL\n" +
                                "    EXEC('ALTER TABLE orders DROP CONSTRAINT ' + @ConstraintName);");

                // Drop foreign key constraints if any
                jdbcTemplate.execute(
                        "DECLARE @FKName nvarchar(200)\n" +
                                "SELECT @FKName = f.name FROM sys.foreign_keys AS f\n" +
                                "INNER JOIN sys.foreign_key_columns AS fc ON f.object_id = fc.constraint_object_id\n" +
                                "WHERE fc.parent_object_id = OBJECT_ID('orders') AND fc.parent_column_id = COLUMNPROPERTY(OBJECT_ID('orders'), '"
                                + col + "', 'ColumnId')\n" +
                                "IF @FKName IS NOT NULL\n" +
                                "    EXEC('ALTER TABLE orders DROP CONSTRAINT ' + @FKName);");

                jdbcTemplate.execute(
                        "IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('orders') AND name = '" + col
                                + "')\n" +
                                "    ALTER TABLE orders DROP COLUMN " + col + ";");
                System.out.println(">>> DataInitializer: Dropped legacy column '" + col + "' from orders table.");
            } catch (Exception e) {
                System.err.println(">>> DataInitializer: Could not drop legacy column '" + col + "' from orders table: "
                        + e.getMessage());
            }
        }

        // Clean up redundant legacy columns in order_item table
        String[] orderItemCols = { "product_thumbnail", "unit_price", "subtotal" };
        for (String col : orderItemCols) {
            try {
                // Drop default constraints if any
                jdbcTemplate.execute(
                        "DECLARE @ConstraintName nvarchar(200)\n" +
                                "SELECT @ConstraintName = Name FROM sys.default_constraints\n" +
                                "WHERE parent_object_id = OBJECT_ID('order_item') AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('order_item'), '"
                                + col + "', 'ColumnId')\n" +
                                "IF @ConstraintName IS NOT NULL\n" +
                                "    EXEC('ALTER TABLE order_item DROP CONSTRAINT ' + @ConstraintName);");

                // Drop foreign key constraints if any
                jdbcTemplate.execute(
                        "DECLARE @FKName nvarchar(200)\n" +
                                "SELECT @FKName = f.name FROM sys.foreign_keys AS f\n" +
                                "INNER JOIN sys.foreign_key_columns AS fc ON f.object_id = fc.constraint_object_id\n" +
                                "WHERE fc.parent_object_id = OBJECT_ID('order_item') AND fc.parent_column_id = COLUMNPROPERTY(OBJECT_ID('order_item'), '"
                                + col + "', 'ColumnId')\n" +
                                "IF @FKName IS NOT NULL\n" +
                                "    EXEC('ALTER TABLE order_item DROP CONSTRAINT ' + @FKName);");

                jdbcTemplate.execute(
                        "IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('order_item') AND name = '"
                                + col + "')\n" +
                                "    ALTER TABLE order_item DROP COLUMN " + col + ";");
                System.out.println(">>> DataInitializer: Dropped legacy column '" + col + "' from order_item table.");
            } catch (Exception e) {
                System.err.println(">>> DataInitializer: Could not drop legacy column '" + col
                        + "' from order_item table: " + e.getMessage());
            }
        }

        // 1. Ensure the 7 main categories exist
        String[] targetCategories = {
                "Cây lương thực",
                "Rau củ quả",
                "Trái cây",
                "Cây công nghiệp",
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

        // 2.5. Automatically migrate products from "Nông sản hữu cơ" to "Rau củ quả"
        // and delete "Nông sản hữu cơ"
        categoryRepository.findByName("Nông sản hữu cơ").ifPresent(oldCat -> {
            try {
                if (rauCuQua != null) {
                    List<Product> affectedProducts = productRepository.findAll();
                    for (Product p : affectedProducts) {
                        if (p.getCategory() != null && p.getCategory().getId().equals(oldCat.getId())) {
                            p.setCategory(rauCuQua);
                            productRepository.save(p);
                            System.out.println(">>> DataInitializer: Di chuyển sản phẩm '" + p.getName()
                                    + "' từ 'Nông sản hữu cơ' sang '" + rauCuQua.getName() + "'");
                        }
                    }
                }
                categoryRepository.delete(oldCat);
                System.out.println(">>> DataInitializer: Đã xóa danh mục 'Nông sản hữu cơ' khỏi database.");
            } catch (Exception e) {
                System.err.println(">>> DataInitializer: Không thể xóa danh mục 'Nông sản hữu cơ': " + e.getMessage());
            }
        });

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
                    System.out.println(">>> DataInitializer: Di chuyển sản phẩm '" + product.getName()
                            + "' sang danh mục '" + targetCat.getName() + "'");
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
                    System.err.println(
                            ">>> DataInitializer: Không thể xóa danh mục cũ '" + oldName + "': " + e.getMessage());
                }
            });
        }
    }
}


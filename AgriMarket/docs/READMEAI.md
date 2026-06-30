# Cẩm nang Kỹ thuật Hệ thống AgriMarket (Dành cho AI Agents)

Chào mừng bạn đến với tài liệu hướng dẫn kỹ thuật của dự án **AgriMarket**. Tài liệu này được thiết kế chi tiết nhằm giúp các AI coding assistants dễ dàng nắm bắt cấu trúc thư mục, kiến trúc công nghệ, mô hình dữ liệu và các luồng xử lý nghiệp vụ cốt lõi của hệ thống.

---

## 1. Tổng quan Dự án

**AgriMarket** là một nền tảng thương mại điện tử kết nối trực tiếp **Nông dân/Nhà vườn (Farmer)** với **Khách hàng (Customer)**. Hệ thống loại bỏ khâu trung gian để tối ưu giá thành cho người mua và tăng thu nhập cho người sản xuất, đồng thời tích hợp các giải pháp công nghệ hiện đại như trí tuệ nhân tạo (AI) và bản đồ số địa lý để kiểm soát chất lượng nông sản tươi sống.

Hệ thống hỗ trợ 4 vai trò chính:
1. **Khách hàng (Customer)**: Tìm kiếm, lọc sản phẩm theo danh mục/độ tươi, đặt hàng, thanh toán trực tuyến, theo dõi đơn hàng, đánh giá sản phẩm/nhà vườn, gửi yêu cầu hỗ trợ hoặc báo cáo vi phạm.
2. **Nông dân/Nhà vườn (Farmer)**: Đăng ký thông tin nhà vườn kèm chứng nhận chất lượng (VietGAP, GlobalGAP, Organic); đăng bán sản phẩm; sử dụng AI viết mô tả/gợi ý giá; quản lý số lượng tồn kho; xử lý/chuẩn bị đơn hàng; chat trực tiếp với người mua. (Lưu ý: Người bán hàng cũng có thể là người mua nên họ có đầy đủ các usecase của người mua).
3. **Đơn vị vận chuyển (Shipper/Partner)**: Nhận yêu cầu giao hàng; cập nhật thông tin xe/tài xế; ghi nhận trạng thái vận chuyển và tải ảnh xác minh giao hàng thành công (POD - Proof of Delivery).
4. **Quản trị viên (Admin)**: Duyệt hồ sơ nông dân và sản phẩm; khóa/mở tài khoản; kiểm duyệt nội dung do AI tạo ra; cấu hình voucher/mã giảm giá; quản lý khiếu nại/vi phạm; phát thông báo hệ thống; theo dõi doanh thu và lịch sử hệ thống (audit logs).

---

## 2. Kiến trúc & Công nghệ (Tech Stack)

### Backend
- **Core Framework**: Java 21, Spring Boot 3.3.0
- **Security**: Spring Security & JWT (Json Web Token) bảo mật stateless API. Hashing mật khẩu bằng [BCryptPasswordEncoder](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/security/SecurityConfig.java#L30).
- **Data Access**: Spring Data JPA & Hibernate.
- **Database**: Microsoft SQL Server (tên database mặc định: `AgriMarketplace`).
- **Email**: Spring Mail (SMTP) hỗ trợ gửi mã OTP và thư thông báo.
- **API Documentation**: Springdoc OpenAPI / Swagger (`/swagger-ui/index.html`).
- **Tiện ích**: Lombok giảm thiểu code mẫu.

### Frontend
- **Framework**: React JS (Vite)
- **Routing**: React Router Dom v6
- **HTTP Client**: Axios (với interceptors tự động đính kèm JWT Token và xử lý lỗi đăng xuất tự động khi hết hạn - mã lỗi `401`).
- **Maps (Bản đồ)**: Leaflet & React Leaflet (hiển thị vị trí nông trại và tọa độ giao hàng).
- **Styling**: Vanilla CSS.

### Các tích hợp bên thứ ba (Third-party Integrations)
- **Google Gemini API**: Model `gemini-3.1-flash-lite` phục vụ việc viết mô tả tự động và phân tích định giá nông sản.
- **VNPay Sandbox**: Cổng thanh toán trực tuyến của Việt Nam.
- **Nominatim OpenStreetMap**: Geocoding địa chỉ (chuyển đổi chuỗi địa chỉ thành tọa độ Vĩ độ/Kinh độ).
- **OSRM (Open Source Routing Machine)**: Tính toán khoảng cách lái xe thực tế giữa nông trại và địa chỉ giao hàng.

---

## 3. Cấu trúc Cơ sở dữ liệu & Thực thể (Database & Models)

### Mô hình Kế thừa Tài khoản (JPA Joined Inheritance)
Hệ thống sử dụng chiến lược **JOINED Inheritance** của JPA để quản lý các nhóm người dùng khác nhau có chung thuộc tính cơ bản. 

- Lớp cơ sở: [User.java](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/model/User.java) (Ánh xạ bảng `users`). Phân biệt bằng cột `user_type` (`CUSTOMER`, `FARMER`, `ADMIN`, `SHIPPER`).
- Lớp con cấp 1:
  - [Admin.java](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/model/Admin.java) (Bảng `admin`, discriminator: `ADMIN`)
  - [Partner.java](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/model/Partner.java) (Bảng `partner`, discriminator: `SHIPPER` đại diện cho Shipper)
  - [Customer.java](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/model/Customer.java) (Bảng `customer`, discriminator: `CUSTOMER`)
- Lớp con cấp 2:
  - [Farmer.java](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/model/Farmer.java) (Bảng `farmer`, kế thừa từ `Customer`, discriminator: `FARMER`).

> [!NOTE]
> Cách thiết kế này giúp `Farmer` kế thừa toàn bộ thuộc tính mua hàng của `Customer` (địa chỉ, giỏ hàng, wishlist) đồng thời bổ sung các trường bán hàng (tên nông trại, tọa độ GPS, các chứng chỉ chất lượng hữu cơ như VietGAP, GlobalGAP).

### Các bảng dữ liệu chính

| Tên lớp thực thể | Bảng SQL tương ứng | Mô tả vai trò & mối quan hệ |
| :--- | :--- | :--- |
| [Category](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/model/Category.java) | `category` | Danh mục sản phẩm đa cấp (hỗ trợ liên kết cha-con thông qua `parent_id`). |
| [Product](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/model/Product.java) | `product` | Sản phẩm nông sản, liên kết với `Farmer` và `Category`. Lưu thông tin độ tươi sống (`perishability`) và khoảng cách giới hạn giao hàng (`limit_distance`). |
| [Cart](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/model/Cart.java) / [CartItem](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/model/CartItem.java) | `cart` / `cart_item` | Giỏ hàng của từng khách hàng. |
| [OrderGroup](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/model/OrderGroup.java) | `order_group` | Đại diện cho cả phiên thanh toán của giỏ hàng. Lưu thông tin tổng tiền, địa chỉ giao hàng và trạng thái VNPay. |
| [Order](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/model/Order.java) | `orders` | Đơn hàng con được tách ra cho từng `Farmer` từ `OrderGroup`. Shipper (`Partner`) sẽ xử lý đơn ở mức này. |
| [OrderItem](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/model/OrderItem.java) | `order_item` | Chi tiết sản phẩm trong từng đơn hàng con. |
| [SupportRequest](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/model/SupportRequest.java) | `support_request` | Ticket yêu cầu hỗ trợ/khiếu nại từ người dùng gửi lên admin. |
| [SupportMessage](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/model/SupportMessage.java) | `support_message` | Các tin nhắn trao đổi trong luồng giải quyết ticket hỗ trợ giữa Admin và User. |
| [AdminNotification](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/model/AdminNotification.java) | `admin_notification` | Các thông báo hệ thống được Admin lên lịch phát sóng. |
| [Notification](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/model/Notification.java) | `notification` | Hộp thư thông báo cá nhân hóa (đã đọc/chưa đọc) hiển thị ở chuông thông báo người dùng. |

### Cơ chế Tự động Đồng bộ Schema & Seed Dữ liệu
Khi khởi động ứng dụng backend, lớp [DataInitializer](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/config/DataInitializer.java) sẽ thực thi:
1. Tạo tài khoản Admin mặc định `admin@agrimarket.com` (mật khẩu: `admin123`) nếu chưa tồn tại, hoặc reset lại mật khẩu về mặc định để tránh mất quyền truy cập.
2. Thực thi các truy vấn SQL thô (`JdbcTemplate`) để tự động nâng cấp cấu trúc bảng (như thêm cột vĩ độ `latitude`, kinh độ `longitude`, trạng thái `perishability`, giới hạn khoảng cách `limit_distance` mà không làm mất dữ liệu hiện có).
3. Loại bỏ các cột dư thừa từ các phiên bản phát triển cũ để tránh mâu thuẫn dữ liệu.

---

## 4. Các Luồng Nghiệp vụ & Logic Cốt lõi

### 4.1. Xác thực & Bảo mật (Authentication Flow)
1. **Đăng nhập truyền thống**: Người dùng gửi Email/Mật khẩu về `/auth/login`. Hệ thống xác thực bằng Spring Security, sinh JWT token lưu trữ thông tin ID, Email, Role.
2. **Lưu trữ**: Token được lưu trong `localStorage` với key `farmconnect_token`. Thông tin user lưu với key `farmconnect_user`.
3. **Đăng nhập Google**: Tích hợp OAuth2 thông qua API Google Identity Services trên frontend, gửi ID Token về backend để xác thực và tạo phiên.
4. **Auto-logout khi hết hạn**: File [apiClient.js](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/agrimarket-frontend/src/services/apiClient.js) chứa bộ lọc phản hồi (Response Interceptor). Khi nhận mã lỗi HTTP `401 Unauthorized` từ API, nó tự động xóa thông tin đăng nhập trong `localStorage` và chuyển hướng trình duyệt về trang `/login`.

---

### 4.2. Xử lý Đơn hàng Tách biệt (Split-Order Logic)
Khi Khách hàng tiến hành đặt một giỏ hàng chứa sản phẩm từ nhiều nhà vườn khác nhau:
1. Frontend gửi yêu cầu thanh toán tổng thể tới [OrderService](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/service/OrderService.java).
2. Hệ thống lưu lại một thực thể [OrderGroup](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/model/OrderGroup.java) để làm đầu mối thanh toán duy nhất (liên kết với mã giao dịch VNPay).
3. Đồng thời, backend tự động phân tách giỏ hàng theo từng nhà vườn (`Farmer`) thành các đơn hàng con riêng biệt ([Order](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/model/Order.java)).
4. **Lợi ích**: Mỗi nông dân chỉ nhìn thấy và xử lý (chấp nhận/từ chối/chuẩn bị) phần đơn hàng liên quan đến sản phẩm của họ. Trạng thái thanh toán (đã thanh toán hoặc hoàn tiền) của `OrderGroup` sẽ đồng bộ xuống các đơn hàng con.

---

### 4.3. Giới hạn Khoảng cách Giao hàng (Perishability Distance Checks)
Nông sản tươi sống có thời gian bảo quản hạn chế. Để ngăn chặn việc giao hàng quá xa gây hư hỏng:
1. **Phân loại Độ bảo quản (`perishability`)**: Sản phẩm có thuộc tính này với 4 giá trị mặc định:
   - *Rất dễ hư (very_perishable)*: Giới hạn giao hàng mặc định là **15.0 km**.
   - *Dễ hư (perishable)*: Giới hạn giao hàng mặc định là **40.0 km**.
   - *Trung bình (medium)*: Giới hạn giao hàng mặc định là **85.0 km**.
   - *Khô (dry)*: Không giới hạn giao hàng (**999999.0 km**).
2. **Cách tính khoảng cách thực tế**: Trong [DistanceService](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/service/DistanceService.java#L22):
   - Trước tiên, chuyển đổi địa chỉ bằng API **Nominatim OpenStreetMap** thành tọa độ.
   - Gọi API **OSRM** để lấy khoảng cách đường đi thực tế.
   - Nếu lỗi kết nối mạng hoặc không định vị được, hệ thống sẽ tự tính khoảng cách đường chim bay **Haversine** hoặc tra cứu theo tỉnh thành (cùng tỉnh mặc định 10km, khác tỉnh mặc định 120km).
3. **Logic kiểm tra**:
   ```java
   double maxProductDist = product.getLimitDistance() != null ? product.getLimitDistance() : distanceService.getMaxAllowedDistance(product.getPerishability());
   double maxFarmerDist = product.getFarmer().getMaxDeliveryDistance() != null ? product.getFarmer().getMaxDeliveryDistance() : 1000.0;
   double maxAllowed = Math.min(maxProductDist, maxFarmerDist);
   ```
   Nếu khoảng cách tính toán lớn hơn `maxAllowed`, hệ thống sẽ ném lỗi `RuntimeException` chặn việc đặt hàng hoặc thêm vào giỏ hàng và yêu cầu đổi địa chỉ.

---

### 4.4. Tích hợp Google Gemini AI
Luồng tích hợp nằm tại [AiService](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/service/AiService.java):
1. **Tạo mô tả nông sản (`/api/ai/generate-description`)**: Gửi tên sản phẩm, danh mục, thông tin trang trại và chứng nhận nông nghiệp hữu cơ (VietGAP, v.v.). Gemini sinh ra một bài viết Markdown sống động, tối ưu từ khóa SEO và chèn biểu tượng cảm xúc gần gũi với thiên nhiên (không chứa hashtag).
2. **Gợi ý giá bán (`/api/ai/suggest-price`)**: Gemini nhận thông tin đầu vào và trả về chuỗi JSON thô chứa:
   - `recommendedPrice` (Giá đề xuất)
   - `minPrice` (Giá tối thiểu)
   - `maxPrice` (Giá tối đa)
   - `explanation` (Giải thích chi tiết dựa trên địa lý, độ tươi ngon và chứng nhận của sản phẩm).

---

### 4.5. Bộ lập lịch Thông báo Broadcast (Notification Scheduler)
1. Admin tạo một tin nhắn truyền thông trong bảng `admin_notification` và đặt trạng thái là `scheduled` kèm thời gian gửi mong muốn.
2. [NotificationScheduler](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/scheduler/NotificationScheduler.java) chạy ngầm mỗi **30 giây**:
   - Quét các thông báo đến hạn gửi.
   - Chuyển đổi thông báo hệ thống thành các thông báo cá nhân lưu vào bảng `notification` cho từng tài khoản thuộc nhóm mục tiêu (`all`, `customer`, `farmer`, `partner`, hoặc gửi đích danh `single`).
   - Nếu cấu hình có gửi qua Email, bộ scheduler sẽ gọi [EmailService](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/java/org/example/agrimarket/service/EmailService.java) gửi email bất đồng bộ nhằm tối ưu tài nguyên của máy chủ.

---

### 4.6. Vận chuyển & Giao hàng (Shipping Flow)
1. Sau khi nông dân chuẩn bị hàng xong, trạng thái đơn hàng con được đổi thành `preparing` rồi chuyển giao cho Shipper.
2. Tài khoản Shipper truy cập trang `/shipper/requests` để xem và nhận các đơn hàng cần giao.
3. Khi nhận giao, Shipper cập nhật các trường: Tên tài xế (`driverName`), Số điện thoại tài xế (`driverPhone`), Biển số xe (`licensePlate`), Loại phương tiện (`vehicleType`).
4. Khi giao hàng thành công, Shipper chụp ảnh thực tế và tải lên làm bằng chứng giao nhận (Proof of Delivery - `podPhoto`), đơn hàng sẽ cập nhật trạng thái thành `delivered`.

---

## 5. Sơ đồ Cấu trúc Thư mục Hệ thống

### 📂 Backend (Spring Boot)
```text
AgriMarket/
├── pom.xml                                   # Quản lý thư viện Maven (Java 21, Spring Boot 3.3.0)
└── src/main/
    ├── java/org/example/agrimarket/
    │   ├── MainApplication.java              # Lớp khởi chạy ứng dụng Spring Boot
    │   ├── config/                           # Cấu hình CORS, bất đồng bộ, VNPay và khởi tạo/migrate DB
    │   │   ├── DataInitializer.java          # Tự động đồng bộ schema và seed dữ liệu Admin
    │   │   └── WebConfig.java                # Cấu hình phục vụ file tĩnh trong thư mục uploads/
    │   ├── controller/                       # Lớp định nghĩa API (REST Controllers)
    │   │   ├── AiController.java             # Endpoint gọi Gemini AI để tạo mô tả và gợi ý giá
    │   │   ├── PaymentController.java        # Endpoint tạo link thanh toán VNPay và callback webhook
    │   │   └── ProfileController.java        # Xử lý cập nhật hồ sơ người dùng
    │   ├── dto/                              # Data Transfer Objects (chứa các cấu trúc request/response)
    │   ├── model/                            # Thực thể dữ liệu JPA (Entities)
    │   │   ├── User.java                     # Lớp gốc phục vụ Joined Inheritance
    │   │   ├── Customer.java                 # Kế thừa User (Khách hàng)
    │   │   ├── Farmer.java                   # Kế thừa Customer (Nông dân/Nhà vườn)
    │   │   ├── Partner.java                  # Kế thừa User (Đơn vị vận chuyển/Shipper)
    │   │   └── OrderGroup.java               # Đơn hàng tổng thể thanh toán
    │   ├── repository/                       # Giao tiếp với database (Spring Data JPA Repositories)
    │   ├── scheduler/                        # Các tiến trình ngầm tự động chạy
    │   │   └── NotificationScheduler.java    # Quét và gửi thông báo hệ thống / email broadcast
    │   ├── security/                         # Cấu hình phân quyền & xác thực người dùng
    │   │   ├── SecurityConfig.java           # Định nghĩa các API public/private và CORS
    │   │   └── JwtFilter.java                # Bộ lọc chặn request để trích xuất & kiểm tra JWT token
    │   └── service/                          # Chứa logic nghiệp vụ xử lý chính (Services)
    │       ├── AiService.java                # Giao tiếp API Gemini Flash
    │       ├── DistanceService.java          # Tính khoảng cách bằng OSM/OSRM/Haversine
    │       └── OrderService.java             # Logic tạo đơn, tách đơn, cập nhật trạng thái đơn
    └── resources/
        └── application.properties            # Cấu hình Database URL, cổng SMTP Mail, VNPay, và API Key Gemini
```

### 📂 Frontend (React + Vite)
```text
agrimarket-frontend/
├── package.json                              # Quản lý dependencies (React 18, Axios, React Leaflet)
├── vite.config.js                            # Cấu hình công cụ đóng gói Vite
├── index.html                                # File HTML gốc
└── src/
    ├── main.jsx                              # Điểm khởi chạy của ứng dụng React
    ├── App.jsx                               # Component chính bọc ngoài
    ├── index.css                             # Chứa các biến CSS toàn cục và định dạng chung
    ├── layouts/                              # Các bố cục dùng chung (AuthLayout, v.v.)
    ├── components/                           # Các component UI tái sử dụng nhiều lần
    ├── services/                             # Xử lý giao tiếp API với backend
    │   ├── apiClient.js                      # Axios instance cấu hình sẵn Base URL & interceptors JWT/401
    │   ├── authService.js                    # Quản lý đăng ký, đăng nhập, quên mật khẩu
    │   └── productService.js                 # Gọi các API về nông sản và gợi ý từ AI
    ├── routes/                               # Quản lý điều hướng client-side
    │   └── AppRoutes.jsx                     # Khai báo toàn bộ đường dẫn URL của các trang
    └── pages/                                # Thư mục chứa giao diện các trang cụ thể
        ├── Home/                             # Trang chủ hiển thị danh sách sản phẩm nổi bật
        ├── Login/                            # Trang đăng nhập tài khoản
        ├── Checkout/                         # Trang tính toán đơn hàng trước khi thanh toán
        ├── Farmer/                           # Dashboard của Nông dân (quản lý kho, doanh thu)
        ├── Admin/                            # Trang quản lý dành cho Admin hệ thống
        └── Shipper/                          # Trang tiếp nhận và giao nhận vận đơn của Shipper
```

---

## 6. Hướng dẫn Thiết lập & Chạy dưới Local

### Bước 1: Chuẩn bị Cơ sở dữ liệu
Hệ thống sử dụng **Microsoft SQL Server**.
1. Tạo một cơ sở dữ liệu mới tên là `AgriMarketplace`.
2. (Tùy chọn) Chạy mã SQL trong [Agrimarket-system.sql](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/docs/Agrimarket-system.sql) để khởi tạo các bảng và chèn vai trò mặc định. 
   *(Lưu ý: Nếu không chạy thủ công, Spring Boot cũng tự tạo và đồng bộ hóa lại cấu trúc các bảng khi khởi động nhờ cơ chế `ddl-auto=update` và `DataInitializer`)*.

### Bước 2: Cấu hình ứng dụng Backend
Mở file [application.properties](file:///d:/POW/Learn/FPT%20University/Ki_5/SWP391/Project/AgriMarket/AgriMarket/src/main/resources/application.properties) và điều chỉnh các thông số sau hoặc đặt chúng qua biến môi trường:
- Cấu hình kết nối SQL Server: `spring.datasource.url`, `spring.datasource.username`, `spring.datasource.password`.
- Cấu hình API Key Gemini: `gemini.api.key`.
- Cấu hình Email gửi OTP: `spring.mail.username` và `spring.mail.password` (sử dụng Google App Password).

### Bước 3: Khởi chạy Backend
Tại thư mục `AgriMarket`, thực hiện biên dịch và chạy bằng Maven:
```bash
# Clean và build project
mvn clean install

# Chạy ứng dụng Spring Boot
mvn spring-boot:run
```
Backend sẽ khởi chạy tại cổng mặc định: `http://localhost:8080`.

### Bước 4: Khởi chạy Frontend
Tại thư mục `AgriMarket/agrimarket-frontend`:
1. Tạo file `.env` nếu chưa có và cấu hình URL API của backend:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```
2. Cài đặt các gói thư viện và chạy máy chủ phát triển (Vite):
   ```bash
   # Cài đặt dependencies
   npm install

   # Khởi chạy dev server
   npm run dev
   ```
Frontend sẽ chạy tại địa chỉ mặc định: `http://localhost:3000` hoặc `http://localhost:5173`.

### Bước 5: Đăng nhập Hệ thống
Sử dụng tài khoản Admin mặc định để cấu hình ban đầu:
- **Email**: `admin@agrimarket.com`
- **Mật khẩu**: `admin123`

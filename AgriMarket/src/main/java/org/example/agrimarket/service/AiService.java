package org.example.agrimarket.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.agrimarket.dto.AiPriceResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.example.agrimarket.repository.FarmerRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Autowired
    private FarmerRepository farmerRepository;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final RestTemplate restTemplate;

    public AiService() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000); // 10 seconds connection timeout
        factory.setReadTimeout(15000);    // 15 seconds read timeout (AI chat cần thêm thời gian)
        this.restTemplate = new RestTemplate(factory);
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.equals("${GEMINI_API_KEY}")) {
            System.err.println(">>> AiService Warning: GEMINI_API_KEY environment variable is not configured or empty! Falling back to local templates.");
        } else {
            System.out.println(">>> AiService: GEMINI_API_KEY is configured successfully (length: " + geminiApiKey.length() + ")");
        }
    }

    public String generateProductDescription(String productName, String category, String harvestDate, String expirationDate, String farmerEmail) {
        if (productName == null || productName.trim().isEmpty()) {
            return "Vui lòng nhập tên sản phẩm để AI có thể gợi ý mô tả chi tiết nhất.";
        }

        String farmName = "Trang trại đối tác";
        String farmAddress = "";
        String farmDescription = "";
        String farmerCerts = "";

        if (farmerEmail != null && !farmerEmail.trim().isEmpty() && farmerRepository != null) {
            try {
                org.example.agrimarket.model.Farmer farmer = farmerRepository.findByEmail(farmerEmail).orElse(null);
                if (farmer != null) {
                    if (farmer.getFarmName() != null) farmName = farmer.getFarmName();
                    if (farmer.getFarmAddress() != null) farmAddress = farmer.getFarmAddress();
                    if (farmer.getDescription() != null) farmDescription = farmer.getDescription();

                    java.util.List<String> certs = new java.util.ArrayList<>();
                    if (farmer.getVietgapUrl() != null && !farmer.getVietgapUrl().isEmpty()) certs.add("VietGAP");
                    if (farmer.getGlobalgapUrl() != null && !farmer.getGlobalgapUrl().isEmpty()) certs.add("GlobalGAP");
                    if (farmer.getOrganicUrl() != null && !farmer.getOrganicUrl().isEmpty()) certs.add("Hữu cơ (Organic)");
                    if (!certs.isEmpty()) {
                        farmerCerts = String.join(", ", certs);
                    }
                }
            } catch (Exception e) {
                System.err.println(">>> AiService: Error loading farmer info: " + e.getMessage());
            }
        }

        try {
            if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.equals("${GEMINI_API_KEY}")) {
                throw new RuntimeException("GEMINI_API_KEY environment variable is not configured or empty!");
            }
            // Build the prompt for Google Gemini
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append("Hãy viết một mô tả bán hàng hấp dẫn, chuyên nghiệp và chuẩn SEO bằng tiếng Việt cho sản phẩm nông sản sau:\n")
                    .append("- Tên sản phẩm: ").append(productName.trim()).append("\n")
                    .append("- Danh mục: ").append(category != null ? category.trim() : "Nông sản").append("\n");


            if (harvestDate != null && !harvestDate.trim().isEmpty()) {
                promptBuilder.append("- Ngày thu hoạch: ").append(harvestDate).append("\n");
            }
            if (expirationDate != null && !expirationDate.trim().isEmpty()) {
                promptBuilder.append("- Hạn sử dụng: ").append(expirationDate).append("\n");
            }

            promptBuilder.append("\nThông tin về nhà vườn sản xuất:\n")
                    .append("- Tên trang trại: ").append(farmName).append("\n");
            if (!farmAddress.isEmpty()) {
                promptBuilder.append("- Địa chỉ trang trại: ").append(farmAddress).append("\n");
            }
            if (!farmDescription.isEmpty()) {
                promptBuilder.append("- Giới thiệu trang trại: ").append(farmDescription).append("\n");
            }
            if (!farmerCerts.isEmpty()) {
                promptBuilder.append("- Các chứng nhận chất lượng của trang trại: ").append(farmerCerts).append("\n");
            }

            promptBuilder.append("\nYêu cầu bài viết có cấu trúc rõ ràng:\n")
                    .append("1. Giới thiệu sản phẩm (Hương vị, cảm quan ban đầu, sự tươi ngon đặc trưng từ trang trại ").append(farmName).append(")\n")
                    .append("2. Đặc điểm nổi bật (Phương pháp canh tác, các chứng nhận chất lượng nếu có, sự an toàn từ nguồn gốc trang trại ở ").append(farmAddress).append(")\n")
                    .append("3. Ngày thu hoạch và Hạn sử dụng (Thời điểm thu hoạch để đảm bảo chất lượng, hạn dùng an toàn)\n")
                    .append("4. Hướng dẫn bảo quản & chế biến/sử dụng tốt nhất\n\n")
                    .append("Không hiển thị các phần hướng dẫn hay các lời chào thừa của AI. Thêm một số biểu tượng cảm xúc (emoji) sinh động, gần gũi với nông sản và thiên nhiên (như 🌿, 🍎, 🥦, 🥬, 🍊, ✨, 🍀, 📅, 📦, 🛡️) vào các mục và đầu dòng để bài viết thêm trực quan, đẹp mắt và thu hút khách hàng. Tuyệt đối không bao gồm bất kỳ hashtag nào (không dùng kí tự #). Viết trực tiếp nội dung mô tả bằng markdown.");

            String prompt = promptBuilder.toString();
            // Google Gemini API URL
            String url = "https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=" + geminiApiKey;

            // Prepare Request Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Prepare Request Body matching Google Gemini API contract
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> partsObj = new HashMap<>();
            partsObj.put("parts", List.of(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(partsObj));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Send POST request
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<?, ?> body = response.getBody();
                List<?> candidates = (List<?>) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
                    Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
                    if (content != null) {
                        List<?> parts = (List<?>) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);
                            String text = (String) firstPart.get("text");
                            if (text != null && !text.trim().isEmpty()) {
                                return text.trim();
                            }
                        }
                    }
                }
            }

            throw new RuntimeException("Phản hồi rỗng hoặc không hợp lệ từ máy chủ AI.");
        } catch (Exception e) {
            System.err.println(">>> AiService: Error calling Gemini API: " + e.getMessage());
            throw new RuntimeException("Có lỗi xảy ra khi gọi dịch vụ AI: " + e.getMessage());
        }
    }

    public AiPriceResponse suggestProductPrice(String productName, String category, String unit, String harvestDate, String expirationDate, String farmerEmail) {
        if (productName == null || productName.trim().isEmpty()) {
            throw new RuntimeException("Tên sản phẩm trống.");
        }

        String farmName = "Trang trại đối tác";
        String farmAddress = "";
        String farmerCerts = "";

        if (farmerEmail != null && !farmerEmail.trim().isEmpty() && farmerRepository != null) {
            try {
                org.example.agrimarket.model.Farmer farmer = farmerRepository.findByEmail(farmerEmail).orElse(null);
                if (farmer != null) {
                    if (farmer.getFarmName() != null) farmName = farmer.getFarmName();
                    if (farmer.getFarmAddress() != null) farmAddress = farmer.getFarmAddress();

                    java.util.List<String> certs = new java.util.ArrayList<>();
                    if (farmer.getVietgapUrl() != null && !farmer.getVietgapUrl().isEmpty()) certs.add("VietGAP");
                    if (farmer.getGlobalgapUrl() != null && !farmer.getGlobalgapUrl().isEmpty()) certs.add("GlobalGAP");
                    if (farmer.getOrganicUrl() != null && !farmer.getOrganicUrl().isEmpty()) certs.add("Hữu cơ (Organic)");
                    if (!certs.isEmpty()) {
                        farmerCerts = String.join(", ", certs);
                    }
                }
            } catch (Exception e) {
                System.err.println(">>> AiService: Error loading farmer info: " + e.getMessage());
            }
        }

        try {
            if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.equals("${GEMINI_API_KEY}")) {
                throw new RuntimeException("GEMINI_API_KEY environment variable is not configured or empty!");
            }
            // Build the prompt for Google Gemini
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append("Hãy gợi ý khoảng giá bán (giá tối thiểu, giá tối đa) và giá khuyến nghị phù hợp cho sản phẩm nông sản sau tại thị trường Việt Nam:\n")
                    .append("- Tên sản phẩm: ").append(productName.trim()).append("\n")
                    .append("- Danh mục: ").append(category != null ? category.trim() : "Nông sản").append("\n")
                    .append("- Đơn vị tính: ").append(unit != null ? unit.trim() : "kg").append("\n");


            if (harvestDate != null && !harvestDate.trim().isEmpty()) {
                promptBuilder.append("- Ngày thu hoạch: ").append(harvestDate).append("\n");
            }
            if (expirationDate != null && !expirationDate.trim().isEmpty()) {
                promptBuilder.append("- Hạn sử dụng: ").append(expirationDate).append("\n");
            }

            promptBuilder.append("\nThông tin về địa điểm sản xuất:\n")
                    .append("- Tên trang trại: ").append(farmName).append("\n");
            if (!farmAddress.isEmpty()) {
                promptBuilder.append("- Địa chỉ/Vị trí trang trại: ").append(farmAddress).append("\n");
            }
            if (!farmerCerts.isEmpty()) {
                promptBuilder.append("- Các chứng nhận chất lượng của trang trại: ").append(farmerCerts).append("\n");
            }

            promptBuilder.append("\nYêu cầu phản hồi bằng một chuỗi JSON thuần túy (không kèm lời chào hay ký tự markdown, không bọc trong thẻ ```json) theo cấu trúc chính xác sau:\n")
                    .append("{\n")
                    .append("  \"recommendedPrice\": <số nguyên đại diện giá đề xuất bằng VNĐ>,\n")
                    .append("  \"minPrice\": <số nguyên đại diện giá tối thiểu bằng VNĐ>,\n")
                    .append("  \"maxPrice\": <số nguyên đại diện giá tối đa bằng VNĐ>,\n")
                    .append("  \"explanation\": \"<chuỗi giải thích ngắn gọn bằng tiếng Việt lý do đề xuất giá này dựa trên địa lý của trang trại tại ")
                    .append(farmAddress).append(", chất lượng hữu cơ, các chứng nhận chất lượng và thời hạn sử dụng sản phẩm>\"\n")
                    .append("}");

            String prompt = promptBuilder.toString();

            // Google Gemini API URL
            String url = "https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=" + geminiApiKey;

            // Prepare Request Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Prepare Request Body matching Google Gemini API contract
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> partsObj = new HashMap<>();
            partsObj.put("parts", List.of(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(partsObj));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Send POST request
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<?, ?> body = response.getBody();
                List<?> candidates = (List<?>) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
                    Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
                    if (content != null) {
                        List<?> parts = (List<?>) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);
                            String text = (String) firstPart.get("text");
                            if (text != null && !text.trim().isEmpty()) {
                                String cleanJson = cleanJsonText(text);
                                ObjectMapper mapper = new ObjectMapper();
                                JsonNode root = mapper.readTree(cleanJson);
                                
                                int recommended = root.path("recommendedPrice").asInt();
                                int min = root.path("minPrice").asInt();
                                int max = root.path("maxPrice").asInt();
                                String explanation = root.path("explanation").asText();

                                if (recommended > 0 && min > 0 && max > 0) {
                                    return new AiPriceResponse(recommended, min, max, explanation);
                                }
                            }
                        }
                    }
                }
            }

            throw new RuntimeException("Phản hồi rỗng hoặc không hợp lệ từ máy chủ AI.");
        } catch (Exception e) {
            System.err.println(">>> AiService (Price): Error calling Gemini API: " + e.getMessage());
            throw new RuntimeException("Có lỗi xảy ra khi gọi dịch vụ AI: " + e.getMessage());
        }
    }

    private String cleanJsonText(String text) {
        if (text == null) return "";
        text = text.trim();
        if (text.startsWith("```json")) {
            text = text.substring(7);
        } else if (text.startsWith("```")) {
            text = text.substring(3);
        }
        if (text.endsWith("```")) {
            text = text.substring(0, text.length() - 3);
        }
        return text.trim();
    }

    /**
     * AgriBot – Chat AI hỗ trợ người dùng AgriMarket.
     * Hỗ trợ multi-turn conversation thông qua history.
     *
     * @param userMessage Tin nhắn người dùng gửi hiện tại
     * @param history     Lịch sử hội thoại: [{role: "user"|"model", text: "..."}]
     * @return Câu trả lời của AI (String)
     */
    public String chat(String userMessage, List<Map<String, String>> history) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return "Xin lỗi, tôi chưa nhận được câu hỏi của bạn. Vui lòng thử lại! 🌿";
        }

        // Fallback khi API key chưa cấu hình
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.equals("${GEMINI_API_KEY}")) {
            return "🤖 AgriBot đang trong chế độ thử nghiệm. Vui lòng liên hệ admin để kích hoạt AI đầy đủ!\n\nBạn có thể tìm thêm thông tin qua mục **Hỗ trợ** trên AgriMarket.";
        }

        try {
            // System prompt định nghĩa vai trò AgriBot với kiến thức chi tiết về AgriMarket
            String systemInstruction =
                "Bạn là AgriBot - trợ lý AI chính thức của sàn thương mại điện tử nông sản AgriMarket (Việt Nam). " +
                "Nhiệm vụ của bạn là hỗ trợ người dùng hiểu và sử dụng hệ thống AgriMarket một cách tốt nhất.\n\n" +

                "=== TỔNG QUAN HỆ THỐNG AGRIMARKET ===\n" +
                "AgriMarket là nền tảng kết nối trực tiếp nông dân (farmer) với người tiêu dùng (customer), " +
                "loại bỏ trung gian để mang lại nông sản tươi ngon với giá hợp lý. " +
                "Hệ thống có 3 vai trò: Customer (người mua), Farmer (nông dân/nhà vườn), Admin (quản trị viên).\n\n" +

                "=== HƯỚNG DẪN CÁC THAO TÁC CHÍNH TRÊN MÀN HÌNH ===\n" +

                "ĐẶT HÀNG:\n" +
                "Bước 1: Nhấn vào ô tìm kiếm ở đầu trang, gõ tên sản phẩm cần tìm, hoặc chọn danh mục (Rau củ, Trái cây...) trên thanh menu.\n" +
                "Bước 2: Nhấn vào sản phẩm muốn mua để xem chi tiết, chọn số lượng rồi nhấn nút 'Thêm vào giỏ hàng'.\n" +
                "Bước 3: Nhấn vào biểu tượng giỏ hàng 🛒 ở góc trên bên phải, kiểm tra lại sản phẩm.\n" +
                "Bước 4: Nhấn 'Đặt hàng', điền địa chỉ nhận hàng, chọn phương thức thanh toán (VNPay hoặc COD).\n" +
                "Bước 5: Nhấn 'Xác nhận đơn hàng' để hoàn tất.\n\n" +

                "THEO DÕI ĐƠN HÀNG:\n" +
                "Nhấn vào ảnh đại diện góc trên bên phải → chọn 'Đơn hàng của tôi' → xem danh sách và trạng thái đơn hàng (Chờ xác nhận → Đang chuẩn bị → Đang giao → Đã giao).\n\n" +

                "MUA TRONG LIVESTREAM:\n" +
                "Vào mục 'Livestream' trên thanh menu → chọn phiên live đang phát → xem sản phẩm được giới thiệu → nhấn nút 'Thêm vào giỏ hàng' ngay trên màn hình live để hưởng giá ưu đãi. Giá ưu đãi chỉ áp dụng trong suốt thời gian livestream còn đang diễn ra.\n\n" +

                "ĐĂNG KÝ TRỞ THÀNH FARMER:\n" +
                "Nhấn vào ảnh đại diện góc trên bên phải → chọn 'Đăng ký bán hàng' → điền đầy đủ thông tin nông trại (tên, địa chỉ, mô tả, ảnh) → upload giấy chứng nhận nếu có (VietGAP, GlobalGAP, Hữu cơ) → nhấn 'Gửi đăng ký' → chờ Admin xét duyệt.\n\n" +

                "FARMER ĐĂNG SẢN PHẨM:\n" +
                "Đăng nhập với tài khoản Farmer → vào mục 'Quản lý sản phẩm' trong Dashboard → nhấn 'Thêm sản phẩm' → điền tên, mô tả, giá, số lượng, ngày thu hoạch → upload ảnh → nhấn 'Đăng sản phẩm'. Có thể nhấn nút 'Gợi ý AI' để AI tự tạo mô tả sản phẩm.\n\n" +

                "FARMER MỞ LIVESTREAM:\n" +
                "Vào Dashboard Farmer → chọn 'Livestream' → nhấn 'Tạo phiên Live mới' → chọn sản phẩm muốn giới thiệu → đặt % giảm giá ưu đãi cho từng sản phẩm → nhấn 'Bắt đầu Live'. Khi kết thúc nhấn 'Kết thúc Live', giá tự động về giá gốc.\n\n" +

                "YÊU THÍCH SẢN PHẨM:\n" +
                "Nhấn biểu tượng trái tim ❤️ trên thẻ sản phẩm để lưu vào Wishlist. Xem lại tại ảnh đại diện → 'Sản phẩm yêu thích'.\n\n" +

                "CHAT VỚI NÔNG DÂN:\n" +
                "Vào trang sản phẩm hoặc hồ sơ nông trại → nhấn nút 'Nhắn tin' → cửa sổ chat hiện ra ở góc phải màn hình để bắt đầu trò chuyện.\n\n" +

                "ĐÁNH GIÁ SẢN PHẨM:\n" +
                "Sau khi nhận hàng → vào 'Đơn hàng của tôi' → tìm đơn đã giao → nhấn 'Đánh giá' → chọn số sao (1-5) → viết nhận xét → nhấn 'Gửi đánh giá'.\n\n" +

                "YÊU CẦU HỖ TRỢ:\n" +
                "Nhấn vào biểu tượng chat 💬 ở góc dưới bên phải màn hình → mục 'Hỗ trợ' để gửi ticket cho đội ngũ AgriMarket.\n\n" +

                "=== CHỨNG NHẬN CHẤT LƯỢNG ===\n" +
                "- VietGAP: Tiêu chuẩn thực hành nông nghiệp tốt của Việt Nam\n" +
                "- GlobalGAP: Tiêu chuẩn quốc tế về thực hành nông nghiệp tốt\n" +
                "- Hữu cơ (Organic): Trồng không dùng hóa chất\n\n" +

                "=== CHÍNH SÁCH ===\n" +
                "- GIAO HÀNG: Farmer tự giao hoặc qua đơn vị vận chuyển đối tác. Phí ship tùy nông trại và khoảng cách.\n" +
                "- ĐỔI TRẢ: Liên hệ Farmer trong vòng 24h nếu hàng không đúng mô tả hoặc bị hỏng.\n" +
                "- PRE-ORDER: Đặt trước sản phẩm chưa thu hoạch, nhận hàng khi đến mùa vụ.\n\n" +

                "=== QUY TẮC TRẢ LỜI BẮT BUỘC ===\n" +
                "- TUYỆT ĐỐI KHÔNG đưa ra đường link, URL hay đường dẫn kỹ thuật (/farmer/register, /support...). Thay vào đó hãy MÔ TẢ THAO TÁC CỤ THỂ TRÊN MÀN HÌNH (ví dụ: 'nhấn vào ảnh đại diện góc trên bên phải', 'chọn menu Livestream').\n" +
                "- Trả lời ngắn gọn, thân thiện, dùng tiếng Việt.\n" +
                "- Dùng emoji phù hợp (🌿🥦🍅🛒📦🚚✅🌾) để tạo cảm giác gần gũi.\n" +
                "- Chỉ trả lời về nông sản và AgriMarket; từ chối chủ đề không liên quan.\n" +
                "- Không bịa thông tin; nếu không chắc thì hướng dẫn nhấn biểu tượng chat 💬 để liên hệ hỗ trợ.\n" +
                "- Câu trả lời tối đa 200 từ, ưu tiên bullet points hoặc các bước đánh số khi liệt kê.";

            // Build Gemini contents array với history (multi-turn)
            List<Map<String, Object>> contents = new java.util.ArrayList<>();

            // Thêm system instruction là turn đầu tiên (role: user, model echo)
            // Gemini API chuẩn: systemInstruction là field riêng
            // Nhưng với v1/generateContent, ta nhúng vào contents đầu tiên
            Map<String, Object> systemPart = new HashMap<>();
            systemPart.put("text", systemInstruction);
            Map<String, Object> systemContent = new HashMap<>();
            systemContent.put("role", "user");
            systemContent.put("parts", List.of(systemPart));
            contents.add(systemContent);

            // Echo từ model để khởi động context
            Map<String, Object> systemAckPart = new HashMap<>();
            systemAckPart.put("text", "Xin chào! Tôi là AgriBot 🤖 - trợ lý AI của AgriMarket. Tôi sẵn sàng hỗ trợ bạn về nông sản và mọi thắc mắc liên quan đến AgriMarket. Bạn cần giúp gì nào?");
            Map<String, Object> systemAckContent = new HashMap<>();
            systemAckContent.put("role", "model");
            systemAckContent.put("parts", List.of(systemAckPart));
            contents.add(systemAckContent);

            // Thêm lịch sử hội thoại
            if (history != null && !history.isEmpty()) {
                for (Map<String, String> turn : history) {
                    String role = turn.getOrDefault("role", "user");
                    String text = turn.getOrDefault("text", "");
                    if (text.trim().isEmpty()) continue;

                    Map<String, Object> part = new HashMap<>();
                    part.put("text", text);
                    Map<String, Object> content = new HashMap<>();
                    content.put("role", role);
                    content.put("parts", List.of(part));
                    contents.add(content);
                }
            }

            // Thêm tin nhắn hiện tại của người dùng
            Map<String, Object> userPart = new HashMap<>();
            userPart.put("text", userMessage.trim());
            Map<String, Object> userContent = new HashMap<>();
            userContent.put("role", "user");
            userContent.put("parts", List.of(userPart));
            contents.add(userContent);

            // Gọi Gemini API
            String url = "https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=" + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", contents);

            // Cấu hình generation để giới hạn output
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("maxOutputTokens", 512);
            generationConfig.put("temperature", 0.7);
            requestBody.put("generationConfig", generationConfig);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<?, ?> body = response.getBody();
                List<?> candidates = (List<?>) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
                    Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
                    if (content != null) {
                        List<?> parts = (List<?>) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);
                            String text = (String) firstPart.get("text");
                            if (text != null && !text.trim().isEmpty()) {
                                return text.trim();
                            }
                        }
                    }
                }
            }

            return "Xin lỗi, tôi không thể xử lý yêu cầu lúc này. Vui lòng thử lại sau! 🙏";

        } catch (Exception e) {
            System.err.println(">>> AiService (Chat): Error calling Gemini API: " + e.getMessage());
            return "Xin lỗi, dịch vụ AI đang tạm thời gián đoạn. Bạn có thể liên hệ qua mục **Hỗ trợ** trên AgriMarket nhé! 🌿";
        }
    }
}


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

    public static String sanitizeVoiceTranscript(String text) {
        if (text == null) return null;
        String cleaned = text.trim();
        if (cleaned.isEmpty()) return null;

        // Iteratively strip lead-in command & filler phrases from start of transcript
        boolean changed = true;
        while (changed) {
            String prev = cleaned;
            cleaned = cleaned.replaceAll("(?i)^(hãy|cho|tôi|mình|em|bạn|ơi|vui lòng|làm ơn|giúp|giúp tôi|giúp mình|xin|có thể)\\s+", "").trim();
            cleaned = cleaned.replaceAll("(?i)^(muốn|cần|thích|đang|định)\\s+", "").trim();
            cleaned = cleaned.replaceAll("(?i)^(tìm|mua|xem|kiếm|tra|lọc|cho xem|cho tìm|tìm kiếm|tìm mua|muốn mua|muốn tìm)\\s+", "").trim();
            cleaned = cleaned.replaceAll("(?i)^(sản phẩm|nông sản|mặt hàng|món|loại|danh mục|trái|quả|củ|rau)\\s+", "").trim();
            if (prev.equalsIgnoreCase(cleaned)) {
                changed = false;
            }
        }

        // Remove trailing filler words and modal particles
        cleaned = cleaned.replaceAll("(?i)\\s+(gì đó|nè|à|nhỉ|với|ạ|với ạ|nha|nhé|dùm|dùm tôi|giúp tôi|giúp mình|không|với nào|đó)$", "").trim();

        return cleaned.isEmpty() ? null : cleaned;
    }

    public static Map<String, Object> extractFiltersFromTranscript(String transcript) {
        Map<String, Object> res = new HashMap<>();
        if (transcript == null || transcript.trim().isEmpty()) return res;

        String lower = transcript.toLowerCase().trim();

        // Max Price regex (e.g. "dưới 200k", "dưới 200 nghìn", "tối đa 200k")
        java.util.regex.Matcher maxPriceMatcher = java.util.regex.Pattern.compile("(?i)(dưới|nhỏ hơn|tối đa|dưới mức|ít hơn|dưới giá)\\s*([0-9\\.,]+)\\s*(k|nghìn|ngàn|tr|triệu|đ|đồng)?").matcher(lower);
        if (maxPriceMatcher.find()) {
            Double val = parsePriceUnit(maxPriceMatcher.group(2), maxPriceMatcher.group(3));
            if (val != null && val > 0) {
                res.put("maxPrice", val);
            }
        }

        // Min Price regex (e.g. "trên 50k", "từ 50k", "tối thiểu 50k")
        java.util.regex.Matcher minPriceMatcher = java.util.regex.Pattern.compile("(?i)(trên|từ|lớn hơn|tối thiểu|cao hơn|hơn)\\s*([0-9\\.,]+)\\s*(k|nghìn|ngàn|tr|triệu|đ|đồng)?").matcher(lower);
        if (minPriceMatcher.find()) {
            Double val = parsePriceUnit(minPriceMatcher.group(2), minPriceMatcher.group(3));
            if (val != null && val > 0) {
                res.put("minPrice", val);
            }
        }

        // Category matching
        if (lower.contains("trái cây") || lower.contains("hoa quả")) {
            res.put("category", "Trái cây");
        } else if (lower.contains("rau củ") || lower.contains("rau củ quả") || lower.contains("rau")) {
            res.put("category", "Rau củ quả");
        } else if (lower.contains("lương thực") || lower.contains("gạo")) {
            res.put("category", "Cây lương thực");
        } else if (lower.contains("công nghiệp") || lower.contains("cà phê") || lower.contains("tiêu")) {
            res.put("category", "Cây công nghiệp");
        } else if (lower.contains("chăn nuôi") || lower.contains("thịt") || lower.contains("trứng")) {
            res.put("category", "Chăn nuôi");
        } else if (lower.contains("giống cây") || lower.contains("cây giống")) {
            res.put("category", "Giống cây trồng");
        } else if (lower.contains("chế biến") || lower.contains("nông sản chế biến")) {
            res.put("category", "Nông sản chế biến");
        }

        return res;
    }

    private static Double parsePriceUnit(String numStr, String unitStr) {
        if (numStr == null) return null;
        try {
            double num = Double.parseDouble(numStr.replace(".", "").replace(",", "."));
            if (unitStr == null) unitStr = "";
            unitStr = unitStr.toLowerCase();
            if (unitStr.contains("k") || unitStr.contains("nghìn") || unitStr.contains("ngàn")) {
                return num * 1000;
            } else if (unitStr.contains("tr") || unitStr.contains("triệu")) {
                return num * 1000000;
            } else {
                if (num < 1000) {
                    return num * 1000;
                }
                return num;
            }
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Bóc tách câu thoại giọng nói từ người dùng bằng Gemini API thành các tham số tìm kiếm sản phẩm.
     */
    public VoiceSearchDTO.Response parseVoiceSearch(String transcript) {
        if (transcript == null || transcript.trim().isEmpty()) {
            return VoiceSearchDTO.Response.builder()
                    .search("")
                    .originalTranscript(transcript)
                    .aiSummary("Vui lòng nhập hoặc nói câu tìm kiếm sản phẩm 🌿")
                    .build();
        }

        String cleanTranscript = transcript.trim();
        Map<String, Object> extractedFilters = extractFiltersFromTranscript(cleanTranscript);

        String fallbackSearch = sanitizeVoiceTranscript(cleanTranscript);
        String fallbackCategory = (String) extractedFilters.get("category");
        Double fallbackMinPrice = (Double) extractedFilters.get("minPrice");
        Double fallbackMaxPrice = (Double) extractedFilters.get("maxPrice");

        if (fallbackSearch != null) {
            String searchLower = fallbackSearch.toLowerCase();
            if (searchLower.equals("trái cây") || searchLower.equals("hoa quả")) {
                fallbackCategory = "Trái cây";
                fallbackSearch = null;
            } else if (searchLower.equals("rau củ quả") || searchLower.equals("rau củ") || searchLower.equals("nông sản")) {
                fallbackCategory = "Rau củ quả";
                fallbackSearch = null;
            } else if (searchLower.equals("cây lương thực") || searchLower.equals("lương thực")) {
                fallbackCategory = "Cây lương thực";
                fallbackSearch = null;
            } else if (searchLower.equals("cây công nghiệp")) {
                fallbackCategory = "Cây công nghiệp";
                fallbackSearch = null;
            } else if (searchLower.equals("chăn nuôi")) {
                fallbackCategory = "Chăn nuôi";
                fallbackSearch = null;
            } else if (searchLower.equals("giống cây trồng") || searchLower.equals("giống cây")) {
                fallbackCategory = "Giống cây trồng";
                fallbackSearch = null;
            } else if (searchLower.equals("nông sản chế biến") || searchLower.equals("chế biến")) {
                fallbackCategory = "Nông sản chế biến";
                fallbackSearch = null;
            }
        }

        // Fallback mặc định khi API key chưa được cấu hình
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.equals("${GEMINI_API_KEY}")) {
            return VoiceSearchDTO.Response.builder()
                    .search(fallbackSearch)
                    .category(fallbackCategory)
                    .minPrice(fallbackMinPrice)
                    .maxPrice(fallbackMaxPrice)
                    .originalTranscript(cleanTranscript)
                    .aiSummary("Đã bóc tách bộ lọc tìm kiếm 🌿")
                    .build();
        }

        try {
            String prompt = "Bạn là trợ lý AI tìm kiếm sản phẩm nông sản cho hệ thống thương mại điện tử AgriMarket tại Việt Nam.\n" +
                    "Danh mục sản phẩm hiện có trên hệ thống AgriMarket gồm: 'Trái cây', 'Rau củ quả', 'Cây lương thực', 'Cây công nghiệp', 'Chăn nuôi', 'Giống cây trồng', 'Nông sản chế biến'.\n\n" +
                    "Hãy phân tích câu thoại thu âm giọng nói của người dùng bên dưới và bóc tách thành một đối tượng JSON thuần túy (không dùng định dạng markdown, không bọc trong thẻ ```json) chứa các trường sau:\n" +
                    "- \"search\": CHỈ CHỨA TÊN NÔNG SẢN / TỪ KHÓA SẢN PHẨM CỤ THỂ (ví dụ: 'cà chua', 'rau má', 'sầu riêng Ri6', 'bơ sáp', 'thịt heo', 'cà phê', 'gạo ST25'). TUYỆT ĐỐI BỎ TẤT CẢ CÂU DẪN DẮT HOẶC TỪ LỆNH NHƯ 'hãy tìm', 'tôi muốn tìm', 'tìm sản phẩm', 'cho tôi', 'cần mua', 'gì đó'. Nếu người dùng chỉ tìm tên danh mục chung chung (ví dụ nói 'tìm trái cây', 'tìm rau củ') thì để search là null.\n" +
                    "- \"category\": Tên danh mục nông sản tương ứng chính xác nếu nhận diện được (chỉ chọn 1 trong các giá trị: 'Trái cây', 'Rau củ quả', 'Cây lương thực', 'Cây công nghiệp', 'Chăn nuôi', 'Giống cây trồng', 'Nông sản chế biến'). Nếu người dùng tìm cà chua/rau củ thì chọn 'Rau củ quả', nếu tìm sầu riêng/cam/xoài chọn 'Trái cây', nếu tìm trái cây chung chung chọn 'Trái cây', nếu không chắc chắn thì để null.\n" +
                    "- \"location\": Tên địa danh/vùng miền sản xuất (ví dụ: 'Đà Lạt', 'Đắk Lắk', 'Miền Tây', 'Tiền Giang', 'Bến Tre', 'Hà Nội', 'Hồ Chí Minh'). Nếu không nói thì để null.\n" +
                    "- \"minPrice\": Giá tối thiểu bằng VNĐ (kiểu số nguyên). Nếu nói 'từ 50k' hoặc 'trên 50k' thì minPrice = 50000. Nếu không có thì để null.\n" +
                    "- \"maxPrice\": Giá tối đa bằng VNĐ (kiểu số nguyên). Nếu nói 'dưới 200k' hoặc 'giá dưới 200k' thì maxPrice = 200000. Nếu không có thì để null.\n" +
                    "- \"sort\": Sắp xếp ('price_asc', 'price_desc', 'newest', 'popular'). Nếu không có thì để null.\n" +
                    "- \"aiSummary\": 1 câu tóm tắt thật ngắn gọn (dưới 15 từ bằng tiếng Việt kèm emoji) về bộ lọc vừa tìm được (ví dụ: 'Đã tìm sản phẩm: Trái cây giá dưới 200.000đ 🌿').\n\n" +
                    "Câu thoại thu âm của người dùng: \"" + cleanTranscript + "\"";

            String url = "https://generativelanguage.googleapis.com/v1/models/" + getGeminiModel() + ":generateContent?key=" + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> partsObj = new HashMap<>();
            partsObj.put("parts", List.of(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(partsObj));

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
                                String cleanJson = cleanJsonText(text);
                                ObjectMapper mapper = new ObjectMapper();
                                JsonNode root = mapper.readTree(cleanJson);

                                String rawSearch = root.hasNonNull("search") ? root.get("search").asText() : null;
                                String searchVal = sanitizeVoiceTranscript(rawSearch);

                                String categoryVal = root.hasNonNull("category") ? root.get("category").asText() : fallbackCategory;
                                String locationVal = root.hasNonNull("location") ? root.get("location").asText() : null;
                                Double minPriceVal = root.hasNonNull("minPrice") ? root.get("minPrice").asDouble() : fallbackMinPrice;
                                Double maxPriceVal = root.hasNonNull("maxPrice") ? root.get("maxPrice").asDouble() : fallbackMaxPrice;
                                String sortVal = root.hasNonNull("sort") ? root.get("sort").asText() : null;
                                String summaryVal = root.hasNonNull("aiSummary") ? root.get("aiSummary").asText() : "Đã bóc tách thành công bộ lọc tìm kiếm 🌿";

                                // If search term matches category, reset searchVal to null
                                if (searchVal != null) {
                                    String sLower = searchVal.toLowerCase();
                                    if (sLower.equals("trái cây") || sLower.equals("hoa quả")) {
                                        categoryVal = "Trái cây";
                                        searchVal = null;
                                    } else if (sLower.equals("rau củ quả") || sLower.equals("rau củ") || sLower.equals("nông sản")) {
                                        categoryVal = "Rau củ quả";
                                        searchVal = null;
                                    }
                                }

                                return VoiceSearchDTO.Response.builder()
                                        .search(searchVal)
                                        .category(categoryVal)
                                        .location(locationVal)
                                        .minPrice(minPriceVal)
                                        .maxPrice(maxPriceVal)
                                        .sort(sortVal)
                                        .originalTranscript(cleanTranscript)
                                        .aiSummary(summaryVal)
                                        .build();
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println(">>> AiService (VoiceSearch): Error calling Gemini API: " + e.getMessage());
        }

        // Fallback khi xảy ra lỗi parse hoặc timeout
        return VoiceSearchDTO.Response.builder()
                .search(fallbackSearch)
                .category(fallbackCategory)
                .minPrice(fallbackMinPrice)
                .maxPrice(fallbackMaxPrice)
                .originalTranscript(cleanTranscript)
                .aiSummary("Đã lọc sản phẩm theo nhu cầu 🌿")
                .build();
    }
}


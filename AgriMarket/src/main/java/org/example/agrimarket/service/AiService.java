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
        factory.setConnectTimeout(5000); // 5 seconds connection timeout
        factory.setReadTimeout(5000);    // 5 seconds read timeout
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

    public String generateProductDescription(String productName, String category, Boolean isOrganic, String harvestDate, String expirationDate, String farmerEmail) {
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
                System.err.println(">>> AiService: Gemini API key is missing or invalid. Early fallback to local templates.");
                return generateLocalFallbackDescription(productName, category, isOrganic, harvestDate, expirationDate, farmName, farmerCerts);
            }
            // Build the prompt for Google Gemini
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append("Hãy viết một mô tả bán hàng hấp dẫn, chuyên nghiệp và chuẩn SEO bằng tiếng Việt cho sản phẩm nông sản sau:\n")
                    .append("- Tên sản phẩm: ").append(productName.trim()).append("\n")
                    .append("- Danh mục: ").append(category != null ? category.trim() : "Nông sản").append("\n");

            if (isOrganic != null && isOrganic) {
                promptBuilder.append("- Chứng nhận hữu cơ của sản phẩm: Có (Đạt tiêu chuẩn hữu cơ)\n");
            }
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
                    .append("Không hiển thị các phần hướng dẫn hay các lời chào thừa của AI. Tuyệt đối không bao gồm bất kỳ hashtag nào (không dùng kí tự #). Viết trực tiếp nội dung mô tả bằng markdown.");

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

            System.err.println(">>> AiService: Empty or invalid response from Gemini API, falling back to templates.");
        } catch (Exception e) {
            System.err.println(">>> AiService: Error calling Gemini API: " + e.getMessage() + ". Falling back to local templates.");
            e.printStackTrace();
        }

        // Graceful fallback to static templates
        return generateLocalFallbackDescription(productName, category, isOrganic, harvestDate, expirationDate, farmName, farmerCerts);
    }

    private String generateLocalFallbackDescription(String productName, String category, Boolean isOrganic, String harvestDate, String expirationDate, String farmName, String farmerCerts) {
        String name = productName.trim();
        String cat = category != null ? category.trim() : "";
        boolean organic = isOrganic != null && isOrganic;

        StringBuilder sb = new StringBuilder();

        // 1. OPENING
        sb.append("✨ **Giới thiệu sản phẩm: ").append(name).append("** ✨\n\n");
        sb.append("Chào đón vụ mùa mới từ trang trại **").append(farmName).append("**, chúng tôi tự hào mang đến sản phẩm **").append(name).append("** ");
        
        if (organic) {
            sb.append("đạt tiêu chuẩn canh tác hữu cơ tự nhiên. Sản phẩm được chăm sóc hoàn toàn thủ công, không sử dụng hóa chất độc hại hay phân bón hóa học, cam kết an toàn tuyệt đối cho sức khỏe gia đình bạn.\n\n");
        } else {
            sb.append("tươi ngon, được thu hoạch trực tiếp từ nhà vườn tại địa phương. Sản phẩm luôn được đảm bảo quy trình thu hái và vận chuyển nghiêm ngặt nhất để giữ nguyên hương vị tự nhiên và giá trị dinh dưỡng dồi dào.\n\n");
        }

        // 2. CHARACTERISTICS BY CATEGORY
        sb.append("🍀 **Đặc điểm nổi bật:**\n");
        if (cat.equalsIgnoreCase("Trái cây")) {
            sb.append("- **Hương vị:** Ngọt thanh tự nhiên, mọng nước, mùi thơm đặc trưng quyến rũ.\n");
            sb.append("- **Hình thức:** Trái đều màu, vỏ bóng đẹp, không bị dập nát, được chọn lọc kỹ càng.\n");
            sb.append("- **Dinh dưỡng:** Giàu Vitamin C, chất xơ và các khoáng chất thiết yếu giúp tăng cường đề kháng và làm đẹp da.\n");
            sb.append("- **Thưởng thức:** Dùng ăn trực tiếp, làm sinh tố, nước ép hoặc làm nguyên liệu cho các món tráng miệng hấp dẫn.\n");
        } else if (cat.equalsIgnoreCase("Rau củ quả") || cat.equalsIgnoreCase("Nông sản hữu cơ")) {
            sb.append("- **Độ tươi:** Rau củ được thu hoạch vào sáng sớm, giữ được độ giòn ngọt và tươi xanh tự nhiên.\n");
            sb.append("- **Canh tác:** Đất trồng và nguồn nước tưới được kiểm định an toàn, hạn chế tối đa sinh vật gây hại.\n");
            sb.append("- **Dinh dưỡng:** Cung cấp nguồn chất xơ tự nhiên dồi dào, hỗ trợ tiêu hóa tốt và thanh lọc cơ thể.\n");
            sb.append("- **Chế biến:** Phù hợp làm các món salad tươi mát, xào, nấu canh hoặc luộc chấm kho quẹt thơm ngon.\n");
        } else if (cat.equalsIgnoreCase("Cây lương thực")) {
            sb.append("- **Chất lượng:** Hạt đều, chắc mẩy, không chứa chất bảo quản hay tạo mùi nhân tạo.\n");
            sb.append("- **Hương vị:** Khi chín/nấu tỏa hương thơm dịu nhẹ, kết cấu dẻo mềm hoặc bùi ngậy đặc trưng.\n");
            sb.append("- **Dinh dưỡng:** Nguồn cung cấp tinh bột lành mạnh và năng lượng bền vững cho cả ngày dài hoạt động.\n");
            sb.append("- **Bảo quản:** Đóng gói kỹ lượng trong túi kín khí, tránh ẩm mốc và giữ trọn hương vị lâu dài.\n");
        } else if (cat.equalsIgnoreCase("Nông sản chế biến")) {
            sb.append("- **Quy trình:** Chế biến theo phương pháp truyền thống kết hợp tiêu chuẩn vệ sinh hiện đại.\n");
            sb.append("- **Thành phần:** 100% nguyên liệu tự nhiên tinh tuyển, không chất tạo màu hay phụ gia nhân tạo.\n");
            sb.append("- **Hương vị:** Đậm đà, chuẩn vị đặc sản vùng miền, dễ dàng kích thích vị giác.\n");
            sb.append("- **Tiện lợi:** Đóng gói hộp/hũ tiện dụng, dễ dàng mang đi xa hoặc làm quà biếu ý nghĩa.\n");
        } else {
            sb.append("- **Chất lượng:** Đảm bảo độ sạch, độ tươi ngon đạt tiêu chuẩn chất lượng nông sản tốt.\n");
            sb.append("- **Nguồn gốc:** Xuất xứ rõ ràng từ trang trại liên kết vùng nguyên liệu bền vững.\n");
            sb.append("- **Dinh dưỡng:** Giữ trọn vẹn dưỡng chất tốt lành có sẵn trong nông sản.\n");
            sb.append("- **Cam kết:** Không chất bảo quản hóa học, đóng gói vệ sinh và giao hàng nhanh chóng.\n");
        }

        // 3. HARVEST & EXPIRATION DATES
        sb.append("\n📅 **Thông tin thời hạn sản phẩm:**\n");
        if (harvestDate != null && !harvestDate.trim().isEmpty()) {
            sb.append("- **Ngày thu hoạch/đóng gói:** ").append(harvestDate).append("\n");
        } else {
            sb.append("- **Ngày thu hoạch/đóng gói:** Xem trên bao bì thực tế.\n");
        }
        if (expirationDate != null && !expirationDate.trim().isEmpty()) {
            sb.append("- **Hạn sử dụng:** ").append(expirationDate).append(" (Đảm bảo độ tươi ngon nhất trong thời hạn này).\n");
        } else {
            sb.append("- **Hạn sử dụng:** Xem trên bao bì.\n");
        }

        // 4. STORAGE & USAGE INFO
        sb.append("\n📦 **Hướng dẫn bảo quản & Sử dụng:**\n");
        sb.append("- Bảo quản nơi khô ráo, thoáng mát hoặc giữ trong ngăn mát tủ lạnh (đối với rau củ quả tươi) để duy trì độ tươi ngon tốt nhất.\n");
        sb.append("- Nên dùng trong vòng 3-5 ngày kể từ ngày nhận hàng để thưởng thức hương vị trọn vẹn nhất.\n\n");

        // 5. CERTIFICATION HIGHLIGHT
        if (farmerCerts != null && !farmerCerts.trim().isEmpty()) {
            sb.append("🛡️ **Chứng nhận chất lượng của trang trại:** ").append(farmerCerts).append("\n");
            sb.append("*Sản phẩm được bảo chứng chất lượng từ quy trình canh tác đạt chuẩn của trang trại.*\n");
        } else if (organic) {
            sb.append("🛡️ *Sản phẩm có đầy đủ giấy chứng nhận xuất xứ hữu cơ, cam kết mang tới nguồn thực phẩm sạch, an lành cho bữa cơm của mọi gia đình Việt.*\n");
        }

        return sb.toString();
    }

    public AiPriceResponse suggestProductPrice(String productName, String category, Boolean isOrganic, String unit, String harvestDate, String expirationDate, String farmerEmail) {
        if (productName == null || productName.trim().isEmpty()) {
            return generateLocalFallbackPrice(productName, category, isOrganic, unit, harvestDate, expirationDate, null, "");
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
                System.err.println(">>> AiService (Price): Gemini API key is missing or invalid. Early fallback to local templates.");
                return generateLocalFallbackPrice(productName, category, isOrganic, unit, harvestDate, expirationDate, farmAddress, farmerCerts);
            }
            // Build the prompt for Google Gemini
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append("Hãy gợi ý khoảng giá bán (giá tối thiểu, giá tối đa) và giá khuyến nghị phù hợp cho sản phẩm nông sản sau tại thị trường Việt Nam:\n")
                    .append("- Tên sản phẩm: ").append(productName.trim()).append("\n")
                    .append("- Danh mục: ").append(category != null ? category.trim() : "Nông sản").append("\n")
                    .append("- Đơn vị tính: ").append(unit != null ? unit.trim() : "kg").append("\n");

            if (isOrganic != null && isOrganic) {
                promptBuilder.append("- Chứng nhận hữu cơ của sản phẩm: Có (Đạt tiêu chuẩn hữu cơ)\n");
            }
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

            System.err.println(">>> AiService (Price): Empty or invalid response from Gemini API, falling back to templates.");
        } catch (Exception e) {
            System.err.println(">>> AiService (Price): Error calling Gemini API: " + e.getMessage() + ". Falling back to local templates.");
            e.printStackTrace();
        }

        return generateLocalFallbackPrice(productName, category, isOrganic, unit, harvestDate, expirationDate, farmAddress, farmerCerts);
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

    private AiPriceResponse generateLocalFallbackPrice(String productName, String category, Boolean isOrganic, String unit, String harvestDate, String expirationDate, String farmAddress, String farmerCerts) {
        String cat = category != null ? category.trim() : "";
        boolean organic = isOrganic != null && isOrganic;
        String u = unit != null ? unit.trim().toLowerCase() : "kg";

        int minPrice = 15000;
        int maxPrice = 60000;
        int recommendedPrice = 30000;
        String locText = (farmAddress != null && !farmAddress.trim().isEmpty()) ? " tại khu vực " + farmAddress : "";
        String explanation = "Giá ước tính dựa trên giá khảo sát trung bình của thị trường nông sản Việt Nam" + locText + ".";

        if (cat.equalsIgnoreCase("Trái cây")) {
            minPrice = 20000;
            maxPrice = 80000;
            recommendedPrice = 45000;
            explanation = "Dựa trên mặt bằng giá các loại trái cây nội địa phổ biến tại vườn" + locText + ".";
        } else if (cat.equalsIgnoreCase("Rau củ quả") || cat.equalsIgnoreCase("Nông sản hữu cơ")) {
            minPrice = 10000;
            maxPrice = 40000;
            recommendedPrice = 22000;
            explanation = "Dựa trên mặt bằng giá rau xanh và củ quả tươi thu hoạch tại vườn" + locText + ".";
        } else if (cat.equalsIgnoreCase("Cây lương thực")) {
            minPrice = 15000;
            maxPrice = 35000;
            recommendedPrice = 22000;
            explanation = "Giá tham khảo trung bình cho các mặt hàng nông sản lương thực khô" + locText + ".";
        } else if (cat.equalsIgnoreCase("Chăn nuôi")) {
            minPrice = 70000;
            maxPrice = 180000;
            recommendedPrice = 120000;
            explanation = "Dựa trên giá trung bình của các loại thực phẩm tươi sống từ trang trại chăn nuôi" + locText + ".";
        }

        double premiumFactor = 1.0;
        java.util.List<String> premiumReasons = new java.util.ArrayList<>();

        if (organic) {
            premiumFactor = Math.max(premiumFactor, 1.30);
            premiumReasons.add("sản phẩm đạt tiêu chuẩn hữu cơ (+30%)");
        }

        if (farmerCerts != null && !farmerCerts.trim().isEmpty()) {
            String certsLower = farmerCerts.toLowerCase();
            if (certsLower.contains("hữu cơ") || certsLower.contains("organic")) {
                premiumFactor = Math.max(premiumFactor, 1.30);
                premiumReasons.add("trang trại đạt chứng nhận Hữu cơ (Organic) (+30%)");
            } else if (certsLower.contains("globalgap") || certsLower.contains("global gap")) {
                premiumFactor = Math.max(premiumFactor, 1.20);
                premiumReasons.add("trang trại đạt chứng nhận GlobalGAP (+20%)");
            } else if (certsLower.contains("vietgap") || certsLower.contains("viet gap")) {
                premiumFactor = Math.max(premiumFactor, 1.15);
                premiumReasons.add("trang trại đạt chứng nhận VietGAP (+15%)");
            }
        }

        if (premiumFactor > 1.0) {
            minPrice = (int) (minPrice * premiumFactor);
            maxPrice = (int) (maxPrice * premiumFactor);
            recommendedPrice = (int) (recommendedPrice * premiumFactor);
            explanation += " Giá đề xuất được điều chỉnh tăng dựa trên: " + String.join(", ", premiumReasons) + ".";
        }

        // Adjust based on unit
        if (u.equals("bó")) {
            minPrice /= 3;
            maxPrice /= 3;
            recommendedPrice /= 3;
        } else if (u.equals("thùng")) {
            minPrice *= 15;
            maxPrice *= 15;
            recommendedPrice *= 15;
        }

        // Round to nearest 1,000 VND
        minPrice = (minPrice / 1000) * 1000;
        maxPrice = (maxPrice / 1000) * 1000;
        recommendedPrice = (recommendedPrice / 1000) * 1000;

        if (minPrice < 1000) minPrice = 1000;
        if (recommendedPrice < 1000) recommendedPrice = 2000;
        if (maxPrice < recommendedPrice) maxPrice = recommendedPrice + 5000;

        return new AiPriceResponse(recommendedPrice, minPrice, maxPrice, explanation);
    }
}

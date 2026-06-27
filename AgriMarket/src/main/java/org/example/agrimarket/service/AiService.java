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
}

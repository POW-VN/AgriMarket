import apiClient from "./apiClient";

/**
 * AgriBot AI Service
 * Giao tiếp với backend /api/ai/chat để hỗ trợ multi-turn conversation
 */
const aiService = {
  /**
   * Gửi tin nhắn đến AgriBot và nhận phản hồi.
   * @param {string} message - Tin nhắn người dùng
   * @param {Array<{role: string, text: string}>} history - Lịch sử hội thoại
   * @returns {Promise<string>} - Câu trả lời từ AI
   */
  chat: async (message, history = []) => {
    const response = await apiClient.post("/api/ai/chat", {
      message,
      history,
    });
    return response.data.reply;
  },

  /**
   * Phân tích câu nói giọng nói bằng Gemini AI trên backend
   * @param {string} transcript
   * @returns {Promise<Object>}
   */
  parseVoiceSearch: async (transcript) => {
    const response = await apiClient.post("/api/ai/voice-search", {
      transcript,
    });
    return response.data;
  },
};

export default aiService;

import apiClient from "./apiClient";

const notificationService = {
  getNotifications: async () => {
    try {
      const response = await apiClient.get("/api/notifications");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thông báo:", error);
      throw error;
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await apiClient.put(`/api/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi đánh dấu đã đọc thông báo ${id}:`, error);
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await apiClient.put("/api/notifications/read-all");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi đánh dấu đọc tất cả thông báo:", error);
      throw error;
    }
  },

  deleteNotification: async (id) => {
    try {
      const response = await apiClient.delete(`/api/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa thông báo ${id}:`, error);
      throw error;
    }
  }
};

export default notificationService;

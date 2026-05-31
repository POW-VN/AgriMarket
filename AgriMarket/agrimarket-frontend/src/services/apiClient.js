import axios from "axios";

// Nếu chưa set VITE_API_BASE_URL thì mặc định gọi localhost:8080
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Gắn token vào header nếu đã đăng nhập
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("farmconnect_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;

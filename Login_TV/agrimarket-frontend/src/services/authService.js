import axios from 'axios'

// Nếu chưa set VITE_API_BASE_URL thì mặc định gọi localhost:8080
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: tự động gắn token vào header nếu có
apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('farmconnect_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
)

export const authService = {
  login: async (credentials) => {
    // credentials: { email, password, role }
    try {
      const response = await apiClient.post('/auth/login', credentials)
      if (response.data?.token) {
        localStorage.setItem('farmconnect_token', response.data.token)
        localStorage.setItem('farmconnect_user', JSON.stringify(response.data.user))
      }
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  googleLogin: async (googleData) => {
    // googleData: { token, role }
    try {
      const response = await apiClient.post('/auth/google', googleData)
      if (response.data?.token) {
        localStorage.setItem('farmconnect_token', response.data.token)
        localStorage.setItem('farmconnect_user', JSON.stringify(response.data.user))
      }
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  register: async (userData) => {
    // userData: { fullName, email, phoneNumber, password, role }
    try {
      const response = await apiClient.post('/auth/register', userData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  logout: () => {
    localStorage.removeItem('farmconnect_token')
    localStorage.removeItem('farmconnect_user')
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('farmconnect_user')
    return userStr ? JSON.parse(userStr) : null
  }
}

export default authService

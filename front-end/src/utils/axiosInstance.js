import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

// Request Interceptor: tự động gắn Bearer Token vào mọi request & đặt Content-Type hợp lý
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    // Chỉ đặt Content-Type cho JSON nếu dữ liệu không phải FormData
    // FormData sẽ tự động đặt multipart/form-data với boundary
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: xử lý lỗi 401 (token hết hạn)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn → xóa token, redirect về login
      localStorage.removeItem("token");
      window.location.href = "/connect";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
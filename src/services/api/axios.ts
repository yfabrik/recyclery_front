import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ||"", // your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // optional
});

// Request interceptor (optional, e.g., adding auth token)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or from context
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (optional, e.g., handle global errors)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here
    return Promise.reject(error);
  }
);

export default axiosInstance;

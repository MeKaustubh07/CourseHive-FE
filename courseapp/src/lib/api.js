import axios from "axios";

// Use same-origin in dev to leverage Vite proxy; use VITE_API_URL in prod
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "" : "");

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Attach user token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("user_token");
  if (token) {
    config.headers = config.headers || {};
    // Prefer standard Authorization header to avoid CORS issues
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default api;
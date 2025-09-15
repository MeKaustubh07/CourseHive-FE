import axios from "axios";

// Use relative URLs in development to leverage Vite proxy for both desktop and mobile
// Use VITE_API_URL in production
const baseURL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL 
  : ""; // Empty string uses relative URLs, allowing Vite proxy to work

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Attach token automatically if present (admin takes priority)
api.interceptors.request.use((config) => {
  config.headers = config.headers || {};

  // Prefer admin token if available, else fall back to user token
  const adminToken = localStorage.getItem("admin_token");
  const userToken = localStorage.getItem("user_token");

  if (adminToken) {
    config.headers["Authorization"] = `Bearer ${adminToken}`;
  } else if (userToken) {
    config.headers["Authorization"] = `Bearer ${userToken}`;
  }

  return config;
});

export default api;
import axios from "axios";

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true
});

// Attach Authorization Bearer token header if available as fallback to cookie
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Register a new user
 */
export async function registerUser({ username, email, password }) {
  try {
    const response = await API.post("/api/auth/register", {
      username,
      email,
      password
    });
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to register account";
    throw new Error(message);
  }
}

/**
 * Login user
 */
export async function loginUser({ email, password }) {
  try {
    const response = await API.post("/api/auth/login", {
      email,
      password
    });
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to log in";
    throw new Error(message);
  }
}

/**
 * Logout user
 */
export async function logoutUser() {
  try {
    const response = await API.post("/api/auth/logout");
    localStorage.removeItem("token");
    return response.data;
  } catch (error) {
    localStorage.removeItem("token");
    const message = error.response?.data?.message || "Failed to log out";
    throw new Error(message);
  }
}

/**
 * Restore authenticated session / get current user
 */
export async function getMe() {
  try {
    const response = await API.get("/api/auth/get-me");
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch user session";
    throw new Error(message);
  }
}

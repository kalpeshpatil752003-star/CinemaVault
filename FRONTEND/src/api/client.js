const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_STORAGE_KEY = "cinemaVault_token";

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

/**
 * Centralized API Client
 * Automatically handles token injection, JSON parsing, and error formatting.
 */
export const apiClient = {
  async fetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      // Parse JSON safely
      const isJson = response.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await response.json() : null;

      if (!response.ok) {
        throw new ApiError(
          data?.error || `HTTP Error ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Handle network errors
      console.error("Network Error:", error);
      throw new ApiError("Network error or server is down", 0, null);
    }
  },

  get(endpoint, options = {}) {
    return this.fetch(endpoint, { ...options, method: "GET" });
  },

  post(endpoint, body, options = {}) {
    return this.fetch(endpoint, { ...options, method: "POST", body });
  },

  put(endpoint, body, options = {}) {
    return this.fetch(endpoint, { ...options, method: "PUT", body });
  },

  patch(endpoint, body, options = {}) {
    return this.fetch(endpoint, { ...options, method: "PATCH", body });
  },

  delete(endpoint, options = {}) {
    return this.fetch(endpoint, { ...options, method: "DELETE" });
  }
};

export default apiClient;

import apiClient from "./client.js";

export function registerUser(payload) {
  return apiClient.post("/auth/register", payload);
}

export function loginUser(payload) {
  return apiClient.post("/auth/login", payload);
}

export function verifyUserToken(token) {
  // Pass token explicitly if needed, though apiClient handles it
  return apiClient.post("/auth/verify", { token });
}

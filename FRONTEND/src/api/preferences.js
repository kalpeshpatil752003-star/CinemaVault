import apiClient from "./client.js";

export function getPreferences(token) {
  return apiClient.get("/preferences");
}

export function updatePreferences(token, preferences) {
  return apiClient.put("/preferences", preferences);
}

export function resetPreferences(token) {
  return apiClient.post("/preferences/reset");
}

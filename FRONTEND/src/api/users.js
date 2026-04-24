import apiClient from "./client.js";

// Token is now handled automatically by apiClient.
// Keeping the argument for backward compatibility temporarily.
export function updateUserProfile(token, profile) {
  return apiClient.put("/users/me", profile);
}

export function changeUserPassword(token, passwordData) {
  return apiClient.put("/users/password", passwordData);
}

export function getPublicProfile(userId) {
  return apiClient.get(`/users/profile/${userId}`);
}

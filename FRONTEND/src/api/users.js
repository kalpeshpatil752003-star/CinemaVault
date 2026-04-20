const API_BASE_URL = import.meta.env.VITE_API_URL || "";

async function request(path, token, options = {}) {
  if (!token) {
    throw new Error("Please login to update your profile.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
}

export function updateUserProfile(token, profile) {
  return request("/api/users/me", token, {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

export function changeUserPassword(token, passwordData) {
  return request("/api/users/password", token, {
    method: "PUT",
    body: JSON.stringify(passwordData),
  });
}

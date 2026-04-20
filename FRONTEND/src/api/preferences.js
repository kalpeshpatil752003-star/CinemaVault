const API_BASE_URL = import.meta.env.VITE_API_URL || "";

async function request(path, token, options = {}) {
  if (!token) {
    throw new Error("Please login to manage preferences.");
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
    throw new Error(data.error || data.message || "Preferences request failed");
  }

  return data;
}

export function getPreferences(token) {
  return request("/api/preferences", token);
}

export function updatePreferences(token, preferences) {
  return request("/api/preferences", token, {
    method: "PUT",
    body: JSON.stringify(preferences),
  });
}

export function resetPreferences(token) {
  return request("/api/preferences/reset", token, {
    method: "POST",
  });
}

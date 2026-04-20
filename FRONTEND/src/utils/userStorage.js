const STORAGE_KEYS = {
  users: "cinemaVault_users",
  preferences: "cinemaVault_prefs",
  history: "cinemaVault_history",
};

function safeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
}

function buildUserKey(user, suffix) {
  const id = user?.email ? safeKey(user.email) : "guest";
  return `cinemaVault_${suffix}_${id}`;
}

export function getSavedUsers() {
  const stored = localStorage.getItem(STORAGE_KEYS.users);
  return stored ? JSON.parse(stored) : [];
}

export function getSavedUserByEmail(email) {
  return getSavedUsers().find(user => user.email === email) || null;
}

export function userExistsWithEmail(email) {
  return getSavedUsers().some(user => user.email === email);
}

export function updateSavedUserByEmail(oldEmail, updates) {
  const users = getSavedUsers();
  const index = users.findIndex(user => user.email === oldEmail);
  if (index === -1) return null;

  users[index] = {
    ...users[index],
    ...updates,
  };

  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  return users[index];
}

export function getUserPreferences(user) {
  const stored = localStorage.getItem(buildUserKey(user, STORAGE_KEYS.preferences));
  if (!stored) {
    return {
      theme: "default",
      watchlistSort: "newest",
    };
  }
  return JSON.parse(stored);
}

export function saveUserPreferences(user, preferences) {
  localStorage.setItem(buildUserKey(user, STORAGE_KEYS.preferences), JSON.stringify(preferences));
}

export function getWatchHistory(user) {
  const stored = localStorage.getItem(buildUserKey(user, STORAGE_KEYS.history));
  return stored ? JSON.parse(stored) : [];
}

export function saveWatchHistory(user, history) {
  localStorage.setItem(buildUserKey(user, STORAGE_KEYS.history), JSON.stringify(history));
}

export function addWatchHistory(user, item) {
  if (!user) return [];
  const history = getWatchHistory(user);
  const entry = {
    id: item.id,
    title: item.title || item.name || "Untitled",
    poster_path: item.poster_path,
    release_date: item.release_date || item.first_air_date || "",
    mediaType: item.mediaType || "Movie",
    lastWatched: new Date().toISOString(),
  };

  const nextHistory = [entry, ...history.filter(entry => entry.id !== item.id)].slice(0, 40);
  saveWatchHistory(user, nextHistory);
  return nextHistory;
}

export function removeWatchHistoryEntry(user, id) {
  const history = getWatchHistory(user);
  const nextHistory = history.filter(item => item.id !== id);
  saveWatchHistory(user, nextHistory);
  return nextHistory;
}

export function clearWatchHistory(user) {
  saveWatchHistory(user, []);
  return [];
}

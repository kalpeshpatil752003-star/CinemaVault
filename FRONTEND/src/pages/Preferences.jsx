import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getPreferences, resetPreferences, updatePreferences } from "../api/preferences";

const themePresets = {
  default: {
    bg: "#1a1a1a",
    fg: "#ffffff",
    accent: "#00d4ff",
    fontDisplay: "'Inter', sans-serif",
    fontBody: "'Inter', sans-serif",
    filter: "none",
    name: "CinemaVault Default",
    description: "Dark base with bright cyan highlights",
  },
  neon: {
    bg: "#07090f",
    fg: "#e7fbff",
    accent: "#3bfeff",
    fontDisplay: "'Space Mono', monospace",
    fontBody: "'Inter', sans-serif",
    filter: "drop-shadow(0 0 42px rgba(59, 254, 255, 0.3))",
    name: "Neon Glow",
    description: "High-contrast midnight with sharp cyan flare",
  },
  classic: {
    bg: "#111214",
    fg: "#f4f4f4",
    accent: "#ffb100",
    fontDisplay: "'Inter', sans-serif",
    fontBody: "'Inter', sans-serif",
    filter: "none",
    name: "Classic Cinema",
    description: "Warm gold highlights on charcoal palette",
  },
};

function Preferences() {
  const { user, token } = useAuth();
  const { applyTheme, resetTheme } = useTheme();
  const [preferences, setPreferences] = useState({
    theme: "default",
    watchlistSort: "newest",
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewTheme, setPreviewTheme] = useState("default");

  useEffect(() => {
    async function loadPreferences() {
      if (!user || !token) return;

      try {
        const saved = await getPreferences(token);
        const nextPreferences = {
          theme: saved.theme || "default",
          watchlistSort: saved.watchlistSort || "newest",
        };
        setPreferences(nextPreferences);
        setPreviewTheme(nextPreferences.theme);
        if (themePresets[nextPreferences.theme]) {
          applyTheme(themePresets[nextPreferences.theme]);
        }
      } catch (err) {
        console.error("Failed to load preferences:", err);
        setError(err.message || "Failed to load preferences.");
      }
    }

    loadPreferences();
  }, [user, token, applyTheme]);

  function handleThemeChange(theme) {
    setPreferences(prev => ({ ...prev, theme }));
    setPreviewTheme(theme);
    setStatus("");
    setError("");
  }

  function handleSortChange(e) {
    setPreferences(prev => ({ ...prev, watchlistSort: e.target.value }));
    setStatus("");
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user || !token) return;

    setLoading(true);
    setError("");

    try {
      const response = await updatePreferences(token, preferences);
      const saved = response.preferences || preferences;

      if (themePresets[saved.theme]) {
        applyTheme(themePresets[saved.theme]);
        localStorage.setItem("cinemaVault_theme", JSON.stringify(themePresets[saved.theme]));
      }

      setPreferences({
        theme: saved.theme,
        watchlistSort: saved.watchlistSort,
      });
      setPreviewTheme(saved.theme);
      setStatus("success");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error("Failed to save preferences:", err);
      setError(err.message || "Failed to save preferences.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (!user || !token) return;

    setLoading(true);
    setError("");

    try {
      const response = await resetPreferences(token);
      const defaults = {
        theme: response.preferences?.theme || "default",
        watchlistSort: response.preferences?.watchlistSort || "newest",
      };

      setPreferences(defaults);
      setPreviewTheme(defaults.theme);
      resetTheme();
      localStorage.removeItem("cinemaVault_theme");
      setStatus("reset");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error("Failed to reset preferences:", err);
      setError(err.message || "Failed to reset preferences.");
    } finally {
      setLoading(false);
    }
  }

  const preset = themePresets[previewTheme];

  return (
    <section className="pref-root">
      <div className="pref-container">
        <div className="pref-header">
          <div className="pref-header-content">
            <h1 className="pref-title">Preferences</h1>
            <p className="pref-subtitle">
              Customize how CinemaVault looks and behaves for your account
            </p>
          </div>
        </div>

        <div className="pref-grid">
          <div className="pref-card">
            <h2 className="pref-card-title"> Theme & Appearance</h2>
            <p className="pref-card-desc">Choose your preferred visual style</p>

            <div className="pref-theme-options">
              {Object.entries(themePresets).map(([key, theme]) => (
                <button
                  key={key}
                  className={`pref-theme-option ${preferences.theme === key ? "pref-theme-option--active" : ""}`}
                  onClick={() => handleThemeChange(key)}
                  type="button"
                >
                  <div className="pref-theme-preview">
                    <div className="pref-theme-bg" style={{ backgroundColor: theme.bg }} />
                    <div className="pref-theme-accent" style={{ backgroundColor: theme.accent }} />
                    <div className="pref-theme-text" style={{ backgroundColor: theme.fg }} />
                  </div>
                  <div className="pref-theme-info">
                    <h3 className="pref-theme-name">{theme.name}</h3>
                    <p className="pref-theme-desc">{theme.description}</p>
                  </div>
                  {preferences.theme === key && (
                    <div className="pref-theme-checkmark">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pref-card pref-preview-card">
            <h2 className="pref-card-title"> Live Preview</h2>
            <div
              className="pref-live-preview"
              style={{
                backgroundColor: preset.bg,
                color: preset.fg,
              }}
            >
              <div className="pref-preview-content">
                <h3 style={{ color: preset.accent }}>CinemaVault</h3>
                <p>This is how your interface will look</p>
                <button
                  className="pref-preview-btn"
                  style={{
                    borderColor: preset.accent,
                    color: preset.accent,
                  }}
                >
                  Sample Button
                </button>
              </div>
            </div>
          </div>

          <div className="pref-card">
            <h2 className="pref-card-title"> Watchlist Preferences</h2>
            <p className="pref-card-desc">How you want your watchlist organized</p>

            <div className="pref-form-group">
              <label htmlFor="sort-order" className="pref-label">
                Sort Order
              </label>
              <select
                id="sort-order"
                name="watchlistSort"
                value={preferences.watchlistSort}
                onChange={handleSortChange}
                className="pref-select"
              >
                <option value="newest"> Newest first</option>
                <option value="oldest"> Oldest first</option>
              </select>
              <p className="pref-select-hint">
                {preferences.watchlistSort === "newest"
                  ? "Your recently added movies appear first"
                  : "Your oldest added movies appear first"}
              </p>
            </div>
          </div>

          <div className="pref-card pref-info-card">
            <h2 className="pref-card-title"> About Preferences</h2>
            <div className="pref-info-list">
              <div className="pref-info-item">
                <span className="pref-info-icon">✓</span>
                <p>Theme changes apply immediately</p>
              </div>
              <div className="pref-info-item">
                <span className="pref-info-icon">✓</span>
                <p>Your preferences are saved to your account</p>
              </div>
              <div className="pref-info-item">
                <span className="pref-info-icon">✓</span>
                <p>Reset to restore default settings anytime</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pref-actions">
          {status === "success" && (
            <div className="pref-status pref-status--success">
              ✓ Preferences saved successfully!
            </div>
          )}
          {status === "reset" && (
            <div className="pref-status pref-status--info">
              Preferences reset to defaults
            </div>
          )}
          {error && (
            <div className="pref-status pref-status--info">
              {error}
            </div>
          )}

          <div className="pref-button-group">
            <button
              onClick={handleSubmit}
              className={`pref-btn pref-btn--primary ${loading ? "pref-btn--loading" : ""}`}
              disabled={loading}
              type="button"
            >
              {loading ? (
                <>
                  <span className="pref-spinner"></span>
                  Saving...
                </>
              ) : (
                "Save Preferences"
              )}
            </button>

            <button
              onClick={handleReset}
              className={`pref-btn pref-btn--secondary ${loading ? "pref-btn--loading" : ""}`}
              disabled={loading}
              type="button"
            >
              {loading ? "Resetting..." : "Reset to Defaults"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Preferences;

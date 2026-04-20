import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  clearWatchHistory,
  getWatchHistory,
  removeWatchHistoryEntry,
} from "../utils/userStorage";
import { IMAGE_BASE_URL } from "../api/tmdb";

function WatchHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user) return;
    const list = getWatchHistory(user);
    setHistory(list);
  }, [user]);

  function handleRemove(id) {
    if (!user) return;
    setHistory(removeWatchHistoryEntry(user, id));
  }

  function handleClearAll() {
    if (!user) return;
    if (window.confirm("Clear your watch history?")) {
      setHistory(clearWatchHistory(user));
    }
  }

  return (
    <section className="settings-page">
      <div className="settings-container">
        <div className="settings-panel">
          <div className="settings-header-row">
            <div>
              <h1>Watch History</h1>
              <p className="settings-description">
                See the movies and shows you have viewed recently.
              </p>
            </div>
            {history.length > 0 && (
              <button className="auth-submit" onClick={handleClearAll}>
                Clear history
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="settings-empty">No watch history yet. Open a movie detail to begin tracking what you watch.</p>
          ) : (
            <div className="history-grid">
              {history.map(item => (
                <div key={item.id} className="history-card">
                  <Link
                    to={item.mediaType === "Show" ? `/show/${item.id}` : `/movie/${item.id}`}
                    className="history-poster-link"
                  >
                    <img
                      src={IMAGE_BASE_URL + item.poster_path}
                      alt={item.title}
                    />
                  </Link>
                  <div className="history-body">
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.release_date?.split("-")[0] || item.mediaType}</p>
                      <p className="history-date">
                        Last watched {new Date(item.lastWatched).toLocaleString()}
                      </p>
                    </div>
                    <button
                      className="auth-toggle"
                      onClick={() => handleRemove(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default WatchHistory;

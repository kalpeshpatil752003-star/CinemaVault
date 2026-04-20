import { useEffect, useState } from "react";
import { clearWatchlist, getWatchlist } from "../utils/watchlist";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPreferences } from "../api/preferences";
import { IMAGE_BASE_URL } from "../api/tmdb";

function Watchlist() {
  const { user, token } = useAuth();
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    async function loadWatchlist() {
      if (!token) {
        setMovies([]);
        return;
      }

      try {
        const list = await getWatchlist(token);
        const preferences = user ? await getPreferences(token) : { watchlistSort: "newest" };

        const sorted = [...list].sort((a, b) => {
          const aDate = a.release_date ? new Date(a.release_date).getTime() : 0;
          const bDate = b.release_date ? new Date(b.release_date).getTime() : 0;
          return preferences.watchlistSort === "oldest" ? aDate - bDate : bDate - aDate;
        });

        setMovies(sorted);
      } catch (error) {
        console.error("Failed to load watchlist:", error);
        setMovies([]);
      }
    }

    loadWatchlist();
    window.addEventListener("watchlistUpdated", loadWatchlist);

    return () => {
      window.removeEventListener("watchlistUpdated", loadWatchlist);
    };
  }, [user, token]);

  async function handleClearAll() {
    if (window.confirm("Are you sure you want to clear your entire watchlist?")) {
      try {
        await clearWatchlist(token);
        setMovies([]);
      } catch (error) {
        console.error("Failed to clear watchlist:", error);
      }
    }
  }

  return (
    <section className="movies-section">
      <div className="movies-container">
        <div className="watchlist-header">
          <h2 className="section-title">
            Your Watchlist
          </h2>
          {movies.length > 0 && (
            <button
              className="clear-btn"
              onClick={handleClearAll}
            >
              🗑️ Clear All
            </button>
          )}
        </div>

        {movies.length === 0 ? (
          <p>No saved movies yet.</p>
        ) : (
          <div className="movies-grid">
            {movies.map(movie => (
              <Link
                key={movie.id}
                to={`/movie/${movie.id}`}
                className="movie-card"
              >
                <div className="movie-poster">
                  <img
                    src={
                      IMAGE_BASE_URL +
                      movie.poster_path
                    }
                    alt={movie.title}
                  />
                </div>
                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <p>
                    {movie.release_date?.split(
                      "-"
                    )[0]}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Watchlist;

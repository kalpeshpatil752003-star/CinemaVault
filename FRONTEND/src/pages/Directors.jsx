import { useEffect, useState } from "react";
import {
  fetchPopularMovies,
  fetchMovieCredits,
  searchDirectors,
  IMAGE_BASE_URL
} from "../api/tmdb";
import { Link } from "react-router-dom";

function Directors() {
  const [loading, setLoading] = useState(true);

  const [directors, setDirectors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [expanded, setExpanded] = useState(null);

  // ========================================
  // Load Popular Directors (default view)
  // ========================================
  useEffect(() => {
    loadPopularDirectors();
  }, []);

  async function loadPopularDirectors() {
  try {
    setLoading(true);

    const movies = await fetchPopularMovies();

    // 🔥 Fetch all credits in parallel
    const creditsList = await Promise.all(
      movies.map(movie =>
        fetchMovieCredits(movie.id)
      )
    );

    const map = new Map();

    movies.forEach((movie, index) => {
      const credits = creditsList[index];

      const director = credits.crew.find(
        person => person.job === "Director"
      );

      if (!director) return;

      if (!map.has(director.id)) {
        map.set(director.id, {
          id: director.id,
          name: director.name,
          movies: []
        });
      }

      map.get(director.id).movies.push(movie);
    });

    setDirectors(Array.from(map.values()));

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}


  // ========================================
  // Real TMDB Search
  // ========================================
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    async function fetchSearch() {
      try {
        const results = await searchDirectors(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      }
    }

    fetchSearch();
  }, [searchQuery]);

  // ========================================
  // Decide what to show
  // ========================================
  const displayData =
    searchQuery.trim() === ""
      ? directors
      : searchResults;

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h2>
            Explore Visionary
            <span className="accent-text"> Directors</span>
          </h2>
          <p>
            Discover the filmmakers shaping modern cinema
          </p>
        </div>
      </section>

      {/* SEARCH BAR */}
      <section className="filters">
        <div className="filters-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search directors..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>
        </div>
      </section>

      {/* DIRECTOR LIST */}
      <section className="movies-section">
        <div className="movies-container">

          {displayData.length === 0 ? (
            <p style={{ padding: "2rem" }}>
              No directors found.
            </p>
          ) : (
            displayData.map((director, index) => {

              // =========================
              // SEARCH MODE (TMDB API)
              // =========================
              if (searchQuery.trim() !== "") {
                return (
                  <Link
                    key={director.id}
                    to={`/director/${director.id}`}
                    className="director-card"
                    style={{
                      marginBottom: "2rem",
                      display: "flex",
                      gap: "2rem",
                      alignItems: "center",
                      textDecoration: "none"
                    }}
                  >
                    {director.profile_path && (
                      <img
                        src={
                          IMAGE_BASE_URL +
                          director.profile_path
                        }
                        alt={director.name}
                        style={{
                          width: "120px",
                          borderRadius: "12px"
                        }}
                      />
                    )}

                    <div>
                      <h2>{director.name}</h2>
                      <p style={{ color: "#aaa" }}>
                        Known For:
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          marginTop: "0.5rem"
                        }}
                      >
                        {director.known_for
                          ?.slice(0, 3)
                          .map(movie => (
                            <span
                              key={movie.id}
                              style={{
                                color: "#00d4ff",
                                fontSize: "0.9rem"
                              }}
                            >
                              {movie.title ||
                                movie.name}
                            </span>
                          ))}
                      </div>
                    </div>
                  </Link>
                );
              }

              // =========================
              // POPULAR MODE
              // =========================
              const isExpanded =
                expanded === director.id;

              const displayedMovies = isExpanded
                ? director.movies
                : director.movies.slice(0, 3);

              return (
                <div
                  key={director.id}
                  className="director-card"
                  style={{ marginBottom: "3rem" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      marginBottom: "1.5rem"
                    }}
                  >
                    <Link
                      to={`/director/${director.id}`}
                      style={{
                        fontSize: "1.8rem",
                        fontWeight: "700",
                        textDecoration: "none"
                      }}
                    >
                      {director.name}
                    </Link>

                    <button
                      className="btn"
                      onClick={() =>
                        setExpanded(
                          isExpanded
                            ? null
                            : director.id
                        )
                      }
                    >
                      {isExpanded
                        ? "Hide Filmography"
                        : "View Filmography"}
                    </button>
                  </div>

                  <div className="director-movies">
                    {displayedMovies.map(movie => (
                      <Link
                        key={movie.id}
                        to={`/movie/${movie.id}`}
                        className="director-movie-card"
                      >
                        <div className="director-movie-poster">
                          <img
                            src={
                              IMAGE_BASE_URL +
                              movie.poster_path
                            }
                            alt={movie.title}
                          />
                        </div>

                        <div className="director-movie-info">
                          <h4 className="director-movie-title">
                            {movie.title}
                          </h4>
                          <div className="director-movie-meta">
                            <span>
                              {movie.release_date?.split(
                                "-"
                              )[0]}
                            </span>
                            <span>
                              ⭐{" "}
                              {(
                                movie.vote_average / 2
                              ).toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}

export default Directors;

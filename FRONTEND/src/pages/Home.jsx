import { useEffect, useState } from "react";
import {
  fetchPopularMovies,
  searchMovies,
  searchShows,
  fetchGenres,
  fetchShowGenres,
  fetchShows,
} from "../api/tmdb";
import MovieCard from "../components/MovieCard";

const MEDIA_FILTERS = [
  { label: "Movies", value: "movie" },
  { label: "TV Shows", value: "show" }
];

function Home() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [genres, setGenres] = useState([]);
  const [genreMap, setGenreMap] = useState({});
  const [selectedGenres, setSelectedGenres] = useState(["All"]);
  const [selectedMediaType, setSelectedMediaType] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function dedupeMediaItems(items) {
    const seen = new Set();

    return items.filter(item => {
      const mediaType =
        item.media_type === "tv"
          ? "show"
          : item.media_type || (item.title ? "movie" : "show");
      const key = `${mediaType}-${item.id}`;

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function mapMediaItems(items, map) {
    return items.map(item => ({
      ...item,
      title: item.title || item.name,
      release_date:
        item.release_date ||
        item.first_air_date,
      media_type:
        item.media_type === "tv"
          ? "show"
          : item.media_type || (item.title ? "movie" : "show"),
      year:
        (item.release_date ||
        item.first_air_date)
          ? new Date(
              item.release_date ||
              item.first_air_date
            ).getFullYear()
          : "N/A",
      rating:
        item.vote_average / 2,
      genre_names:
        item.genre_ids
          ?.map(id => map[id])
          .filter(Boolean) || []
    }));
  }

  function sortMediaItems(items) {
    const sorted = [...items];

    switch (sortBy) {
      case "rating":
        sorted.sort((a, b) => b.vote_average - a.vote_average);
        break;
      case "year":
        sorted.sort(
          (a, b) =>
            new Date(b.release_date) - new Date(a.release_date)
        );
        break;
      case "alphabetical":
        sorted.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        break;
    }

    return sorted;
  }

  function interleaveMediaItems(items) {
    const moviesOnly = sortMediaItems(
      items.filter(item => item.media_type === "movie")
    );
    const showsOnly = sortMediaItems(
      items.filter(item => item.media_type === "show")
    );
    const mixed = [];
    const maxLength = Math.max(
      moviesOnly.length,
      showsOnly.length
    );

    for (let i = 0; i < maxLength; i += 1) {
      if (moviesOnly[i]) mixed.push(moviesOnly[i]);
      if (showsOnly[i]) mixed.push(showsOnly[i]);
    }

    return mixed;
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    setError(null);
    try {
      const pages = await Promise.all([
        fetchPopularMovies(1),
        fetchPopularMovies(2),
        fetchPopularMovies(3),
        fetchShows(1),
        fetchShows(2),
        fetchShows(3)
      ]);

      const apiMedia = dedupeMediaItems(pages.flat());

      const [movieGenres, showGenres] = await Promise.all([
        fetchGenres(),
        fetchShowGenres()
      ]);
      const allGenres = [...movieGenres, ...showGenres];
      const uniqueGenres = Array.from(
        new Map(allGenres.map(genre => [genre.id, genre])).values()
      );

      setGenres(["All", ...uniqueGenres.map(g => g.name)]);

      const map = {};
      uniqueGenres.forEach(g => {
        map[g.id] = g.name;
      });
      setGenreMap(map);

      const mapped = mapMediaItems(apiMedia, map);

      setMovies(mapped);
    } catch (err) {
      setError("Failed to load trending movies and shows.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      loadInitialData();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [movieResults, showResults] = await Promise.all([
        searchMovies(value),
        searchShows(value)
      ]);

      const mergedResults = dedupeMediaItems([
        ...movieResults,
        ...showResults
      ]);

      setMovies(mapMediaItems(mergedResults, genreMap));
    } catch (err) {
      setError("Failed to search. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleGenreClick(genre) {
    if (genre === "All") {
      setSelectedGenres(["All"]);
    } else {
      setSelectedGenres(prev => {
        const updated = prev.includes(genre)
          ? prev.filter(g => g !== genre)
          : [...prev.filter(g => g !== "All"), genre];
        
        // If no genres selected, default to "All"
        return updated.length === 0 ? ["All"] : updated;
      });
    }
  }

  function handleClearFilters() {
    setSelectedGenres(["All"]);
    setSelectedMediaType("all");
    setSortBy("rating");
    setQuery("");
  }

  function getFilteredMovies() {
    let result = [...movies];

    if (selectedMediaType !== "all") {
      result = result.filter(
        movie => movie.media_type === selectedMediaType
      );
    }

    // Only filter if genreMap is populated
    if (!selectedGenres.includes("All") && Object.keys(genreMap).length > 0) {
      result = result.filter(movie =>
        movie.genre_ids?.some(id =>
          genreMap[id] && selectedGenres.includes(genreMap[id])
        )
      );
    }

    if (selectedMediaType === "all") {
      return interleaveMediaItems(result);
    }

    return sortMediaItems(result);
  }

  const filteredMovies = getFilteredMovies();

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <h2>
            Discover Your Next
            <span className="accent-text"> Favorite Movie</span>
          </h2>
          <p>
            Explore our curated collection of movie reviews and
            ratings from critics and audiences worldwide
          </p>
        </div>
      </section>

      {/* FILTERS SECTION */}
      <section className="filters">
        <div className="filters-container">
          <div className="search-sort">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search movies and TV shows..."
                value={query}
                onChange={handleSearch}
              />
            </div>

            <div className="sort-box">
              <span className="sort-icon">⚙️</span>
              <select
                className="sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="rating">Highest Rated</option>
                <option value="year">Latest Release</option>
                <option value="alphabetical">
                  Alphabetical
                </option>
              </select>
            </div>

            <button
              className="clear-btn"
              onClick={handleClearFilters}
            >
              🗑️ Clear Filters
            </button>
          </div>

          <div className="genre-filters">
            <h3>Filter by Type</h3>
            <div className="type-filter-row">
              <button
                type="button"
                className={`type-reset-btn ${
                  selectedMediaType === "all"
                    ? "active"
                    : ""
                }`}
                onClick={() => setSelectedMediaType("all")}
              >
                All
              </button>

              <div
                className={`type-switch ${
                  selectedMediaType === "show"
                    ? "show-active"
                    : "movie-active"
                }`}
                role="tablist"
                aria-label="Filter by media type"
              >
                {MEDIA_FILTERS.map(filter => (
                  <button
                    key={filter.value}
                    type="button"
                    role="tab"
                    aria-selected={
                      selectedMediaType === filter.value
                    }
                    className={`type-switch-btn ${
                      selectedMediaType === filter.value
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedMediaType(filter.value)
                    }
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="genre-filters">
            <h3>Filter by Genre</h3>
            <div className="genre-buttons">
              {genres.map(genre => (
                <button
                  key={genre}
                  className={`genre-btn ${
                    selectedGenres.includes(genre)
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleGenreClick(genre)
                  }
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MOVIES SECTION */}
      <section className="movies-section">
        <div className="movies-container">
          <div className="movies-header">
            <p className="movies-count">
              Showing {filteredMovies.length}{" "}
              {filteredMovies.length === 1
                ? "title"
                : "titles"}
            </p>
          </div>

          {loading ? (
            <div className="loading" style={{ textAlign: "center", padding: "4rem" }}>
              <div className="spinner"></div>
              <p style={{ marginTop: "1rem", color: "var(--color-text-dim)" }}>Loading amazing titles...</p>
            </div>
          ) : error ? (
            <div className="error" style={{ textAlign: "center", padding: "4rem", color: "var(--color-error)" }}>
              {error}
            </div>
          ) : (
            <div className="movies-grid">
              {filteredMovies.map(movie => (
                <MovieCard
                  key={`${movie.media_type}-${movie.id}`}
                  movie={movie}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;

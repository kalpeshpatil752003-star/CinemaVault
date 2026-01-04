// TMDB API utility module
// NOTE: API key handling intentionally left unchanged

const TMDB_API_KEY = "f7919dfdb6ddf2bf5528aec022db0db9";

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// =======================
// Internal helper
// =======================
async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }
  return response.json();
}

// =======================
// Search movies by query
// =======================
export async function searchMovies(query) {
  const data = await fetchJson(
    `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(
      query
    )}`
  );
  return data.results;
}

// =======================
// Fetch genres
// =======================
export async function fetchGenres() {
  const data = await fetchJson(
    `${BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
  );
  return data.genres; // [{ id, name }]
}

// =======================
// Fetch TMDB reviews
// =======================
export async function fetchMovieReviews(movieId) {
  const data = await fetchJson(
    `${BASE_URL}/movie/${movieId}/reviews?api_key=${TMDB_API_KEY}&language=en-US&page=1`
  );

  return data.results.map(review => ({
    author: review.author,
    content: review.content,
    date: review.created_at,
    source: "tmdb"
  }));
}

// =======================
// Fetch popular movies
// =======================
export async function fetchPopularMovies(pages = 3) {
  let allMovies = [];

  for (let page = 1; page <= pages; page++) {
    const data = await fetchJson(
      `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
    );
    allMovies = allMovies.concat(data.results);
  }

  return allMovies;
}

// =======================
// Fetch movie details
// =======================
export async function fetchMovieDetails(movieId) {
  return fetchJson(
    `${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
  );
}

// =======================
// Fetch movie cast only
// (kept for backward compatibility)
// =======================
export async function fetchMovieCast(movieId) {
  const data = await fetchJson(
    `${BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`
  );
  return data.cast;
}

// =======================
// Fetch movie trailer
// =======================
export async function fetchMovieTrailer(movieId) {
  const data = await fetchJson(
    `${BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`
  );
  return data.results.find(v => v.type === "Trailer");
}

// =======================
// Fetch full movie credits (cast + crew)
// =======================
export async function fetchMovieCredits(movieId) {
  return fetchJson(
    `${BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`
  );
}

// =======================
// Exports
// =======================
export { IMAGE_BASE_URL };

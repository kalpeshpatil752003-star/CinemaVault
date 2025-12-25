const TMDB_API_KEY = "f7919dfdb6ddf2bf5528aec022db0db9";

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

//search movies by query
export async function searchMovies(query) {
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  return data.results;
}

//genre function
export async function fetchGenres() {
  const response = await fetch(
    `${BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
  );
  const data = await response.json();
  return data.genres; // [{id, name}]
}




// Fetch popular movies
export async function fetchPopularMovies(pages = 3) {
  let allMovies = [];

  for (let page = 1; page <= pages; page++) {
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
    );
    const data = await response.json();
    allMovies = allMovies.concat(data.results);
  }

  return allMovies;
}


// Fetch movie details
export async function fetchMovieDetails(movieId) {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
  );
  return response.json();
}


// Fetch movie cast
export async function fetchMovieCast(movieId) {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`
  );
  const data = await response.json();
  return data.cast;
}


// Fetch movie trailer
export async function fetchMovieTrailer(movieId) {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`
  );
  const data = await response.json();
  return data.results.find(v => v.type === "Trailer");
}


export { IMAGE_BASE_URL };
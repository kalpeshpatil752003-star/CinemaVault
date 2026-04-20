const TMDB_API_KEY = "f7919dfdb6ddf2bf5528aec022db0db9";
const BASE_URL = "https://api.themoviedb.org/3";
export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const cache = {
  popularMovies: null,
  directorCredits: {},
  directorDetails: {}
};


async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("API Error");
  return res.json();
}

export async function fetchPopularMovies(page = 1) {
  if (page === 1 && cache.popularMovies) {
    return cache.popularMovies;
  }

  const data = await fetchJson(
    `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`
  );

  if (page === 1) {
    cache.popularMovies = data.results;
  }

  return data.results;
}


export async function searchMovies(query) {
  const data = await fetchJson(
    `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${query}`
  );
  return data.results;
}

export async function searchShows(query) {
  const data = await fetchJson(
    `${BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${query}`
  );
  return data.results;
}

export async function fetchMovieDetails(id) {
  return fetchJson(`${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`);
}

export async function fetchMovieCredits(id) {
  return fetchJson(`${BASE_URL}/movie/${id}/credits?api_key=${TMDB_API_KEY}`);
}

export async function fetchMovieReviews(id) {
  const data = await fetchJson(
    `${BASE_URL}/movie/${id}/reviews?api_key=${TMDB_API_KEY}`
  );
  return data.results;
}

export async function fetchGenres() {
  const res = await fetch(
    `${BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
  );
  if (!res.ok) throw new Error("Failed to fetch genres");
  const data = await res.json();
  return data.genres;
}

export async function fetchShowGenres() {
  const res = await fetch(
    `${BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`
  );
  if (!res.ok) throw new Error("Failed to fetch show genres");
  const data = await res.json();
  return data.genres;
}

export async function fetchMovieTrailer(id) {
  const data = await fetchJson(
    `${BASE_URL}/movie/${id}/videos?api_key=${TMDB_API_KEY}`
  );

  return data.results.find(v => v.type === "Trailer");
}

export async function searchPeople(query) {
  const data = await fetchJson(
    `${BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
  );
  return data.results;
}

export async function searchDirectors(query) {
  const data = await fetchJson(
    `${BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
  );

  // Only return people whose main department is Directing
  return data.results.filter(
    person => person.known_for_department === "Directing"
  );
}

export async function fetchDirectorDetails(id) {
  if (cache.directorDetails[id]) {
    return cache.directorDetails[id];
  }

  const data = await fetchJson(
    `${BASE_URL}/person/${id}?api_key=${TMDB_API_KEY}`
  );

  cache.directorDetails[id] = data;
  return data;
}


export async function fetchDirectorCredits(id) {
  if (cache.directorCredits[id]) {
    return cache.directorCredits[id];
  }

  const data = await fetchJson(
    `${BASE_URL}/person/${id}/movie_credits?api_key=${TMDB_API_KEY}`
  );

  cache.directorCredits[id] = data;
  return data;
}

export async function fetchShows(page = 1) {
  const data = await fetchJson(
    `${BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${page}`
  );

  return data.results;
}

export async function fetchShowDetails(id) {
  const data = await fetchJson(
    `${BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}`
  );

  return data;
}

export async function fetchShowCredits(id) {
  const data = await fetchJson(
    `${BASE_URL}/tv/${id}/credits?api_key=${TMDB_API_KEY}`
  );
  return data;
}

export async function fetchShowReviews(id) {
  const data = await fetchJson(
    `${BASE_URL}/tv/${id}/reviews?api_key=${TMDB_API_KEY}`
  );
  return data.results;
}

export async function fetchShowTrailer(id) {
  const data = await fetchJson(
    `${BASE_URL}/tv/${id}/videos?api_key=${TMDB_API_KEY}`
  );

  return data.results.find(
    v => v.type === "Trailer"
  );
}

export async function fetchTrendingMovies(code) {
  const data = await fetchJson(
    `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&region=${code}`
  );
  return data.results?.[0] || null;
}

export async function fetchTopRatedMovies(code) {
  const data = await fetchJson(
    `${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&region=${code}`
  );
  return data.results?.[0] || null;
}

export async function fetchDiscoverMovies(code) {
  const data = await fetchJson(
    `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&region=${code}&sort_by=popularity.desc&page=1`
  );
  return data.results?.[0] || null;
}

export async function fetchMovieDetailsWithCredits(id) {
  const data = await fetchJson(
    `${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`
  );
  return data;
}

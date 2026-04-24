import apiClient from "./client.js";

export function getMovieReviews(tmdbMovieId) {
  return apiClient.get(`/reviews/movie/${tmdbMovieId}`);
}

export function createReview(token, payload) {
  return apiClient.post("/reviews", payload);
}

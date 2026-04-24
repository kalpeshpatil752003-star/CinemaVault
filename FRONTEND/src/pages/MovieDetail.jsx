import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  fetchMovieDetails,
  fetchMovieCredits,
  fetchMovieReviews,
  fetchMovieTrailer,
  fetchShowDetails,
  fetchShowCredits,
  fetchShowReviews,
  fetchShowTrailer,
  IMAGE_BASE_URL,
} from "../api/tmdb";

import {
  getWatchlist,
  toggleWatchlist,
} from "../utils/watchlist";
import { createReview, getMovieReviews } from "../api/reviews";
import { useAuth } from "../context/AuthContext";
import { addWatchHistory } from "../utils/userStorage";

function MovieDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();

  const location = window.location.pathname;
  const isShow = location.includes("/show/");

  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const [comment, setComment] = useState("");

  useEffect(() => {
    loadMovie();
  }, [id]);

  useEffect(() => {
    if (!user || !movie) return;
    addWatchHistory(user, {
      ...movie,
      mediaType: isShow ? "Show" : "Movie",
    });
  }, [user, movie, isShow]);

  async function loadMovie() {
    try {
      let movieData;
      let credits;
      let reviewData;
      let trailerData;

      if (isShow) {
        movieData = await fetchShowDetails(id);
        credits = await fetchShowCredits(id);
        reviewData = await fetchShowReviews(id);
        trailerData = await fetchShowTrailer(id);
      } else {
        movieData = await fetchMovieDetails(id);
        credits = await fetchMovieCredits(id);
        reviewData = await fetchMovieReviews(id);
        trailerData = await fetchMovieTrailer(id);
      }

      const list = token ? await getWatchlist(token) : [];
      const dbReviews = await getMovieReviews(movieData.id);

      setIsSaved(list.some(m => m.id === movieData.id));
      setMovie(movieData);
      setCast(credits.cast.slice(0, 6));
      setReviews(reviewData ? reviewData.slice(0, 5) : []);
      setTrailer(trailerData);
      setUserReviews(dbReviews?.reviews || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmitReview() {
    if (!comment.trim()) {
      alert("Please write a review before submitting.");
      return;
    }

    if (!token || !movie || !user) {
      alert("Please login to post a review");
      return;
    }

    try {
      const response = await createReview(token, {
        tmdbMovieId: movie.id,
        movieTitle: movie.title || movie.name || "Untitled",
        author: user.name,
        content: comment,
        rating: 5,
      });

      setUserReviews(prev => [response.review, ...prev]);
      setComment("");
    } catch (error) {
      console.error("Failed to post review:", error);
      alert(error.message || "Failed to post review");
    }
  }

  if (!movie) {
    return <p style={{ padding: "2rem" }}>Loading...</p>;
  }

  const title = movie.title || movie.name || "Untitled";

  const year =
    movie.release_date || movie.first_air_date
      ? (movie.release_date || movie.first_air_date).split("-")[0]
      : "N/A";

  const duration =
    movie.runtime ??
    movie.episode_run_time?.[0] ??
    movie.last_episode_to_air?.runtime ??
    "N/A";

  const seasons = movie.number_of_seasons;
  const rating = (movie.vote_average / 2).toFixed(1);

  const allReviews = [...userReviews, ...reviews];

  return (
    <>
      <section className="detail-hero">
        <div className="detail-container">
          <div className="detail-poster">
            <img src={IMAGE_BASE_URL + movie.poster_path} alt={title} />
          </div>

          <div className="detail-info">
            <div className="detail-header">
              <h1>{title}</h1>

              <div className="detail-meta">
                <div className="meta-item">
                  <span>📅</span>
                  <span>{year}</span>
                </div>

                <div className="meta-item">
                  <span>⏱️</span>
                  <span>{duration} min</span>
                </div>

                {isShow && seasons && (
                  <div className="meta-item">
                    <span>📺</span>
                    <span>
                      {seasons} Season{seasons > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="detail-genres">
              {movie.genres?.map(g => (
                <span key={g.id} className="genre-badge">
                  {g.name}
                </span>
              ))}
            </div>

            <div className="rating-box">
              <div className="rating-stars">⭐ ⭐ ⭐ ⭐ ⭐</div>

              <div className="rating-details">
                <p className="rating-value">{rating}</p>
                <p className="review-count">
                  {movie.vote_count?.toLocaleString()} reviews
                </p>
              </div>
            </div>

            <button
              className="btn"
              onClick={async () => {
                try {
                  const updated = await toggleWatchlist(movie, token);
                  setIsSaved(updated.some(m => m.id === movie.id));
                } catch (error) {
                  console.error("Failed to update watchlist:", error);
                }
              }}
            >
              {isSaved ? "✔ Remove from Watchlist" : "⭐ Add to Watchlist"}
            </button>

            <div>
              <h2 className="section-title">Synopsis</h2>
              <p className="synopsis">{movie.overview}</p>
            </div>

            <div>
              <h2 className="section-title">Cast</h2>
              <div className="cast-list">
                {cast.map(actor => (
                  <span key={actor.id} className="cast-badge">
                    {actor.name}
                  </span>
                ))}
              </div>
            </div>

            {trailer && (
              <div>
                <h2 className="section-title">Trailer</h2>
                <div className="trailer-container">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    title="Trailer"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="reviews-section">
        <div className="reviews-container">
          <h2 className="section-title">User Reviews</h2>

          {user ? (
            <div className="review-form" style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Add Your Review as {user.name}</h3>

              <textarea
                className="input"
                style={{ 
                  width: '100%', 
                  minHeight: '120px', 
                  padding: '1rem', 
                  background: 'rgba(0, 0, 0, 0.2)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '12px', 
                  color: '#fff', 
                  fontSize: '1rem', 
                  resize: 'vertical',
                  marginBottom: '1rem'
                }}
                placeholder="What did you think?"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />

              <button className="btn" onClick={handleSubmitReview}>
                Submit Review
              </button>
            </div>
          ) : (
            <div className="review-form" style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <p style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--color-text-dim)' }}>Please log in to add your review.</p>
              <Link to="/login" className="btn">Log In</Link>
            </div>
          )}

          <div className="reviews-grid">
            {allReviews.length === 0 ? (
              <p>No reviews available.</p>
            ) : (
              allReviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <h3 className="review-author">{review.author}</h3>

                    <time className="review-date">
                      {new Date(review.created_at || review.createdAt).toLocaleDateString()}
                    </time>
                  </div>

                  <p className="review-comment">{review.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default MovieDetail;

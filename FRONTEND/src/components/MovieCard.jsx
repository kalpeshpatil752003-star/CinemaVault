import { Link } from "react-router-dom";
import { IMAGE_BASE_URL } from "../api/tmdb";

/*
  Generates 5-star rating UI
*/
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  let stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <span key={i} className="star filled">
          ★
        </span>
      );
    } 
    else if (i === fullStars && hasHalfStar) {
      stars.push(
        <span
          key={i}
          className="star filled"
          style={{ opacity: 0.5 }}
        >
          ★
        </span>
      );
    } 
    else {
      stars.push(
        <span key={i} className="star">
          ★
        </span>
      );
    }
  }

  return stars;
}

function MovieCard({ movie }) {

  const rating = movie.vote_average
    ? movie.vote_average / 2
    : 0;

  const year = movie.release_date
    ? movie.release_date.split("-")[0]
    : "N/A";

  const posterUrl = movie.poster_path
    ? IMAGE_BASE_URL + movie.poster_path
    : "/no-image.png";

  return (
    <Link
      to={`/${movie.media_type}/${movie.id}`}   // ✅ Correct routing
      className="movie-card"
    >
      {/* Poster */}
      <div className="movie-poster">
        <img
          src={posterUrl}
          alt={movie.title}
          loading="lazy"
        />
      </div>

      {/* Movie Info */}
      <div className="movie-info">

        {/* Title + Year */}
        <div className="movie-title-row">
          <h3 className="movie-title">
            {movie.title}
          </h3>

          <span className="movie-year">
            {year}
          </span>
        </div>

        {/* Show badge (THIS is where it belongs) */}
        {movie.media_type === "show" && (
          <span className="genre-badge">
            📺 Show
          </span>
        )}

        {/* Rating */}
        <div className="movie-rating">

          <div className="stars">
            {generateStars(rating)}
          </div>

          <span className="rating-value">
            {rating.toFixed(1)}
          </span>

        </div>

        {/* Review Count */}
        <p className="review-count">
          {movie.vote_count
            ? movie.vote_count.toLocaleString()
            : 0
          } reviews
        </p>

        {/* Genre Badges */}
        <div className="movie-genres">

          {movie.genre_names &&
            movie.genre_names
              .filter(Boolean)
              .slice(0, 2)
              .map((genre) => (

                <span
                  key={genre}
                  className="genre-badge"
                >
                  {genre}
                </span>

              ))}

        </div>

      </div>
    </Link>
  );
}

export default MovieCard;

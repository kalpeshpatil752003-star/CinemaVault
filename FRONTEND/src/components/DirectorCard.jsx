import { Link } from "react-router-dom";
import { IMAGE_BASE_URL } from "../api/tmdb";

function DirectorCard({ director }) {
  return (
    <div className="director-card">
      <h2>{director.name}</h2>
      <p>Movies: {director.movies.length}</p>

      <div className="director-movies">
        {director.movies.map(movie => (
          <Link key={movie.id} to={`/movie/${movie.id}`}>
            <img
              src={IMAGE_BASE_URL + movie.poster_path}
              alt={movie.title}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default DirectorCard;

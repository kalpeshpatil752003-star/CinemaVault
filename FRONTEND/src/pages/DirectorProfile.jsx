import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  fetchDirectorDetails,
  fetchDirectorCredits,
  IMAGE_BASE_URL
} from "../api/tmdb";
import { Link } from "react-router-dom";

function DirectorProfile() {
  const { id } = useParams();

  const [director, setDirector] = useState(null);
  const [credits, setCredits] = useState([]);
  const [sortBy, setSortBy] = useState("year");

  useEffect(() => {
    loadDirector();
  }, [id]);

  async function loadDirector() {
    try {
      const details = await fetchDirectorDetails(id);
      const movieCredits = await fetchDirectorCredits(id);

      // Only directing credits
      const directed = movieCredits.crew.filter(
        c => c.job === "Director"
      );

      setDirector(details);
      setCredits(directed);
    } catch (err) {
      console.error(err);
    }
  }

  if (!director) return <p style={{ padding: "2rem" }}>Loading...</p>;

  const sortedCredits = [...credits].sort((a, b) => {
    if (sortBy === "rating") {
      return b.vote_average - a.vote_average;
    }
    return new Date(b.release_date) - new Date(a.release_date);
  });

  return (
    <section className="detail-hero">
      <div className="detail-container">

        {/* LEFT COLUMN */}
        <div className="detail-poster">
          {director.profile_path && (
            <img
              src={IMAGE_BASE_URL + director.profile_path}
              alt={director.name}
            />
          )}

          <div style={{ marginTop: "1.5rem" }}>
            <p><strong>Birthday:</strong> {director.birthday}</p>
            <p><strong>Place of Birth:</strong> {director.place_of_birth}</p>
            <p><strong>Known For:</strong> {director.known_for_department}</p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="detail-info">

          <h1>{director.name}</h1>

          <div>
            <h2 className="section-title">Biography</h2>
            <p className="synopsis">
              {director.biography || "No biography available."}
            </p>
          </div>

          <div style={{ marginTop: "2rem" }}>
            <h2 className="section-title">Filmography</h2>

            <div style={{ marginBottom: "1rem" }}>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="year">Sort by Year</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>

            <div className="director-movies">
              {sortedCredits.map(movie => (
                <Link
                  key={movie.id}
                  to={`/movie/${movie.id}`}
                  className="director-movie-card"
                >
                  <div className="director-movie-poster">
                    <img
                      src={IMAGE_BASE_URL + movie.poster_path}
                      alt={movie.title}
                    />
                  </div>

                  <div className="director-movie-info">
                    <h4 className="director-movie-title">
                      {movie.title}
                    </h4>
                    <div className="director-movie-meta">
                      <span>
                        {movie.release_date?.split("-")[0]}
                      </span>
                      <span>
                        ⭐ {(movie.vote_average / 2).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default DirectorProfile;

import {
  fetchMovieDetails,
  fetchMovieCast,
  fetchMovieTrailer,
  IMAGE_BASE_URL,
  fetchMovieReviews
} from "./api/tmdb.js";



// Get movie ID from URL parameters
function getMovieIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// Generate star rating HTML
function generateStars(rating = 0) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let starsHTML = '';

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      starsHTML += '<span class="star filled">★</span>';
    } else if (i === fullStars && hasHalfStar) {
      starsHTML += '<span class="star filled" style="opacity: 0.5">★</span>';
    } else {
      starsHTML += '<span class="star">★</span>';
    }
  }

  return starsHTML;
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Render movie details
function renderMovieDetail(movie) {
  const movieDetailContainer = document.getElementById('movieDetail');
  
  movieDetailContainer.innerHTML = `
    <div class="detail-poster">
      <img src="${movie.poster}" alt="${movie.title}">
    </div>
    <div class="detail-info">
      <div class="detail-header">
        <h1>${movie.title}</h1>
        <div class="detail-meta">
          <div class="meta-item">
            <span>📅</span>
            <span>${movie.year}</span>
          </div>
          <div class="meta-item">
            <span>⏱️</span>
            <span>${movie.runtime} min</span>
          </div>
          <div class="meta-item">
            <span>👤</span>
            <span>${movie.director}</span>
          </div>
        </div>
      </div>

      <div class="detail-genres">
        ${movie.genres.map(genre => 
          `<span class="genre-badge">${genre}</span>`
        ).join('')}
      </div>

      <div class="rating-box">
        <div class="rating-stars">
          ${generateStars(movie.rating)}
        </div>
        <div class="rating-details">
          <p class="rating-value">${movie.rating.toFixed(1)}</p>
          <p class="review-count">${movie.reviewCount.toLocaleString()} reviews</p>
        </div>
      </div>

      <div>
        <h2 class="section-title">Synopsis</h2>
        <p class="synopsis">${movie.synopsis}</p>
      </div>

      <div>
        <h2 class="section-title">Cast</h2>
        <div class="cast-list">
          ${movie.cast.map(actor => 
            `<span class="cast-badge">${actor}</span>`
          ).join('')}
        </div>
      </div>

      <div>
        <h2 class="section-title">Trailer</h2>
        <div class="trailer-container">
          <iframe
            src="${movie.trailer}"
            title="${movie.title} Trailer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
  `;

  // Update page title
  document.title = `${movie.title} - CinemaVault`;
}

// Render reviews
function renderReviews(reviews) {
  const reviewsGrid = document.getElementById('reviewsGrid');

  if (!reviews || reviews.length === 0) {
    reviewsGrid.innerHTML = '<p>No reviews available.</p>';
    return;
  }

  reviewsGrid.innerHTML = reviews.map(review => {
    const rating = review.rating ?? 0;
    const comment = review.comment ?? review.content ?? '';
    const date = review.date ?? review.created_at ?? new Date().toISOString();

    return `
      <div class="review-card">
        <div class="review-header">
          <div>
            <h3 class="review-author">${review.author}</h3>
            ${
              rating > 0
                ? `<div class="review-rating">
                     <div class="stars">${generateStars(rating)}</div>
                     <span class="rating-value">${rating.toFixed(1)}</span>
                   </div>`
                : ''
            }
          </div>
          <time class="review-date">${formatDate(date)}</time>
        </div>
        <p class="review-comment">${comment}</p>
      </div>
    `;
  }).join('');
}


// Show error message
function showError() {
  const movieDetailContainer = document.getElementById('movieDetail');
  movieDetailContainer.innerHTML = `
    <div style="text-align: center; padding: 4rem 2rem;">
      <h2 style="font-size: 2rem; margin-bottom: 1rem;">Movie Not Found</h2>
      <p style="color: var(--color-text-secondary); margin-bottom: 2rem;">
        The movie you're looking for doesn't exist.
      </p>
      <a href="index.html" class="btn">Back to Home</a>
    </div>
  `;
  
  const reviewsGrid = document.getElementById('reviewsGrid');
  reviewsGrid.innerHTML = '';
}

// Initialize the detail page
async function init() {
  const movieId = getMovieIdFromURL();
  if (!movieId) {
    showError();
    return;
  }

  try {
    // CORE DATA (must succeed)
    const movie = await fetchMovieDetails(movieId);
    const cast = await fetchMovieCast(movieId);
    const trailer = await fetchMovieTrailer(movieId);

    // OPTIONAL DATA (may fail)
    let tmdbReviews = [];
    try {
      tmdbReviews = await fetchMovieReviews(movieId);
    } catch (reviewError) {
      console.warn("TMDB reviews not available");
    }
    window.tmdbReviews = tmdbReviews;

    const localReviews = getLocalReviews(movieId);
    const combinedReviews = mergeReviews(localReviews, tmdbReviews);

    const formattedMovie = {
      title: movie.title,
      year: movie.release_date?.split("-")[0],
      runtime: movie.runtime,
      director: "TMDB",
      rating: movie.vote_average / 2,
      reviewCount: movie.vote_count,
      poster: IMAGE_BASE_URL + movie.poster_path,
      genres: movie.genres.map(g => g.name),
      synopsis: movie.overview,
      cast: cast.slice(0, 6).map(c => c.name),
      trailer: trailer
        ? `https://www.youtube.com/embed/${trailer.key}`
        : ""
    };

    // RENDER CORE UI
    renderMovieDetail(formattedMovie);

    // RENDER REVIEWS
    renderReviews(combinedReviews);
    setupReviewForm(movieId);

  } catch (error) {
    console.error("Movie fetch failed", error);
    showError();
  }
}




// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

//review submission handling
function setupReviewForm(movieId) {
  const btn = document.getElementById("submitReview");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const author = document.getElementById("reviewAuthor").value.trim();
    const comment = document.getElementById("reviewComment").value.trim();

    if (!author || !comment) {
      alert("Please fill all fields");
      return;
    }

    const review = {
      author,
      content: comment,
      date: new Date().toISOString(),
      source: "local"
    };

    saveLocalReview(movieId, review);

    const allReviews = mergeReviews(
      getLocalReviews(movieId),
      window.tmdbReviews || []
    );

    renderReviews(allReviews);

    document.getElementById("reviewAuthor").value = "";
    document.getElementById("reviewComment").value = "";
  });
}



function getLocalReviews(movieId) {
  const stored = localStorage.getItem(`reviews_${movieId}`);
  return stored ? JSON.parse(stored) : [];
}

function saveLocalReview(movieId, review) {
  const reviews = getLocalReviews(movieId);
  reviews.unshift(review); // newest on top
  localStorage.setItem(`reviews_${movieId}`, JSON.stringify(reviews));
}


function mergeReviews(local, tmdb) {
  return [...local, ...tmdb];
}


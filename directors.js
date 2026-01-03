// JavaScript file for directors page functionality
import { movies } from './data.js';

// State management
let currentSearchQuery = '';

// DOM elements
const searchInput = document.getElementById('searchInput');
const directorsList = document.getElementById('directorsList');
const directorsCount = document.getElementById('directorsCount');
const noResults = document.getElementById('noResults');
const clearSearchBtn = document.getElementById('clearSearch');

// Get all directors with their movies
function getDirectors() {
  const directorsMap = new Map();

  // Group movies by director
  movies.forEach(movie => {
    if (!directorsMap.has(movie.director)) {
      directorsMap.set(movie.director, []);
    }
    directorsMap.get(movie.director).push(movie);
  });

  // Convert to Director objects with statistics
  const directors = [];
  directorsMap.forEach((directorMovies, directorName) => {
    const totalMovies = directorMovies.length;
    const averageRating =
      directorMovies.reduce((sum, m) => sum + m.rating, 0) / totalMovies;
    const totalReviews =
      directorMovies.reduce((sum, m) => sum + m.reviewCount, 0);

    directors.push({
      name: directorName,
      movies: directorMovies.sort((a, b) => b.rating - a.rating),
      totalMovies,
      averageRating,
      totalReviews
    });
  });

  // Sort directors by average rating
  return directors.sort((a, b) => b.averageRating - a.averageRating);
}

// Filter directors by search query
function getFilteredDirectors() {
  const allDirectors = getDirectors();

  if (!currentSearchQuery) {
    return allDirectors;
  }

  return allDirectors.filter(director =>
    director.name.toLowerCase().includes(currentSearchQuery.toLowerCase())
  );
}

// Create director movie card HTML
function createDirectorMovieCard(movie) {
  return `
    <div class="director-movie-card" data-movie-id="${movie.id}">
      <div class="director-movie-poster">
        <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
      </div>
      <div class="director-movie-info">
        <h4 class="director-movie-title">${movie.title}</h4>
        <div class="director-movie-meta">
          <span class="director-movie-year">${movie.year}</span>
          <div class="director-movie-rating">
            <span>★</span>
            <span>${movie.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Create director card HTML
function createDirectorCard(director) {
  return `
    <div class="director-card">
      <div class="director-header">
        <div class="director-icon">🎬</div>
        <div class="director-info">
          <h2>${director.name}</h2>
          <div class="director-stats">
            <div class="stat-item">
              <span>🎥</span>
              <span>
                <span class="stat-value">${director.totalMovies}</span>
                ${director.totalMovies === 1 ? 'Movie' : 'Movies'}
              </span>
            </div>
            <div class="stat-item">
              <span>⭐</span>
              <span>
                <span class="stat-value">${director.averageRating.toFixed(1)}</span>
                Avg Rating
              </span>
            </div>
            <div class="stat-item">
              <span>💬</span>
              <span>
                <span class="stat-value">${director.totalReviews.toLocaleString()}</span>
                Total Reviews
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="director-movies">
        ${director.movies.map(movie => createDirectorMovieCard(movie)).join('')}
      </div>
    </div>
  `;
}

// Render directors
function renderDirectors() {
  const filteredDirectors = getFilteredDirectors();

  if (filteredDirectors.length === 0) {
    directorsList.style.display = 'none';
    noResults.style.display = 'block';
    directorsCount.textContent = 'No directors found';
  } else {
    directorsList.style.display = 'flex';
    noResults.style.display = 'none';
    directorsCount.textContent = `Showing ${filteredDirectors.length} ${
      filteredDirectors.length === 1 ? 'director' : 'directors'
    }`;

    directorsList.innerHTML = filteredDirectors
      .map(director => createDirectorCard(director))
      .join('');

    // Add click listeners to movie cards
    document.querySelectorAll('.director-movie-card').forEach(card => {
      card.addEventListener('click', () => {
        const movieId = card.getAttribute('data-movie-id');
        window.location.href = `detail.html?id=${movieId}`;
      });
    });
  }
}

// Handle search input
function handleSearch(query) {
  currentSearchQuery = query;
  renderDirectors();
}

// Clear search
function clearSearch() {
  currentSearchQuery = '';
  searchInput.value = '';
  renderDirectors();
}

// Attach event listeners
function attachEventListeners() {
  searchInput.addEventListener('input', e => {
    handleSearch(e.target.value);
  });

  clearSearchBtn.addEventListener('click', clearSearch);
}

// Initialize the page
function init() {
  renderDirectors();
  attachEventListeners();
}
// Mobile hamburger menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('.nav');

if (mobileMenuBtn && nav) {
  mobileMenuBtn.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  // Close menu after clicking a link (mobile UX)
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
    });
  });
}


// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

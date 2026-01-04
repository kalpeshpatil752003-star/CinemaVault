// JavaScript file for Directors page (TMDB-based, stable version)

import {
  fetchPopularMovies,
  fetchMovieCredits,
  IMAGE_BASE_URL
} from './api/tmdb.js';

// =======================
// State
// =======================
let directorsData = [];
let currentSearchQuery = '';

// =======================
// DOM Elements
// =======================
const searchInput = document.getElementById('searchInput');
const directorsList = document.getElementById('directorsList');
const directorsCount = document.getElementById('directorsCount');
const noResults = document.getElementById('noResults');
const clearSearchBtn = document.getElementById('clearSearch');

// =======================
// Filtering Logic
// =======================
function getFilteredDirectors() {
  const query = currentSearchQuery
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

  if (!query) return directorsData;

  return directorsData.filter(d =>
    d.name
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .includes(query)
  );
}


// =======================
// UI Builders
// =======================
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
        ${director.movies.map(createDirectorMovieCard).join('')}
      </div>
    </div>
  `;
}

// =======================
// Data Fetching (TMDB)
// =======================
async function fetchDirectorsFromTMDB() {
  // Limit movies to avoid TMDB rate limits
  const movies = await fetchPopularMovies(4);
  const directorsMap = new Map();

  for (const movie of movies) {
    try {
      const credits = await fetchMovieCredits(movie.id);

      // Director detection with fallback
      const director =
        credits.crew.find(p => p.job === 'Director') ||
        credits.crew.find(p => p.department === 'Directing');

      if (!director) {
        console.warn('No director found for:', movie.title);
        continue;
      }

      if (!directorsMap.has(director.name)) {
        directorsMap.set(director.name, {
          name: director.name,
          movies: [],
          totalMovies: 0,
          averageRating: 0,
          totalReviews: 0
        });
      }

      const d = directorsMap.get(director.name);

      d.movies.push({
        id: movie.id,
        title: movie.title,
        year: movie.release_date
          ? new Date(movie.release_date).getFullYear()
          : 'N/A',
        rating: movie.vote_average / 2,
        reviewCount: movie.vote_count,
        poster: movie.poster_path
          ? IMAGE_BASE_URL + movie.poster_path
          : ''
      });

    } catch (err) {
      console.warn('Credits failed for:', movie.title);
    }
  }

  // Compute stats
  directorsData = Array.from(directorsMap.values()).map(d => {
    d.totalMovies = d.movies.length;
    d.averageRating =
      d.movies.reduce((s, m) => s + m.rating, 0) / d.totalMovies;
    d.totalReviews =
      d.movies.reduce((s, m) => s + m.reviewCount, 0);
    d.movies.sort((a, b) => b.rating - a.rating);
    return d;
  });

  directorsData.sort((a, b) => b.averageRating - a.averageRating);
}

// =======================
// Rendering
// =======================
function renderDirectors() {
  const filteredDirectors = getFilteredDirectors();

  if (filteredDirectors.length === 0) {
    directorsList.style.display = 'none';
    noResults.style.display = 'block';
    directorsCount.textContent = 'No directors found';
    return;
  }

  directorsList.style.display = 'flex';
  noResults.style.display = 'none';
  directorsCount.textContent = `Showing ${filteredDirectors.length} ${
    filteredDirectors.length === 1 ? 'director' : 'directors'
  }`;

  directorsList.innerHTML = filteredDirectors
    .map(createDirectorCard)
    .join('');

  // Movie card click → detail page
  document.querySelectorAll('.director-movie-card').forEach(card => {
    card.addEventListener('click', () => {
      const movieId = card.getAttribute('data-movie-id');
      window.location.href = `detail.html?id=${movieId}`;
    });
  });
}

// =======================
// Events
// =======================
function handleSearch(query) {
  currentSearchQuery = query;
  renderDirectors();
}

function clearSearch() {
  currentSearchQuery = '';
  searchInput.value = '';
  renderDirectors();
}

function attachEventListeners() {
  searchInput.addEventListener('input', e => {
    handleSearch(e.target.value);
  });

  clearSearchBtn.addEventListener('click', clearSearch);
}

// =======================
// Init
// =======================
async function init() {
  try {
    directorsCount.textContent = 'Loading directors...';
    await fetchDirectorsFromTMDB();
    renderDirectors();
    attachEventListeners();
  } catch (err) {
    directorsCount.textContent = 'Failed to load directors';
    console.error(err);
  }
}

// =======================
// Mobile Hamburger Menu
// =======================
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('.nav');

if (mobileMenuBtn && nav) {
  mobileMenuBtn.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
    });
  });
}

// =======================
// DOM Ready
// =======================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


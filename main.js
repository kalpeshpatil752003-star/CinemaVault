
import {
  fetchPopularMovies,
  searchMovies,
  fetchGenres,
  IMAGE_BASE_URL
} from './api/tmdb.js';



let currentSearchQuery = '';
let selectedGenres = ['All'];
let currentSortBy = 'rating';
let genres = [];

const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const genreButtons = document.getElementById('genreButtons');
const moviesGrid = document.getElementById('moviesGrid');
const moviesCount = document.getElementById('moviesCount');
const noResults = document.getElementById('noResults');
const clearFiltersBtn = document.getElementById('clearFilters');
let movies = [];

function normalizeText(text = '') {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}




async function init() {
  try {
    const apiMovies = await fetchPopularMovies(3);
    const apiGenres = await fetchGenres();

    genres = ['All', ...apiGenres.map(g => g.name)];

    movies = apiMovies.map(movie => ({
      id: movie.id.toString(),
      title: movie.title,
      year: new Date(movie.release_date).getFullYear(),
      rating: movie.vote_average / 2,
      reviewCount: movie.vote_count,
      poster: IMAGE_BASE_URL + movie.poster_path,
      genres: movie.genre_ids.map(
        id => apiGenres.find(g => g.id === id)?.name
      ).filter(Boolean)
    }));

    renderGenreButtons();
    renderMovies();
    attachEventListeners();
  } catch (error) {
    console.error(error);
  }
}


function renderGenreButtons() {
    genreButtons.innerHTML = genres.map(genre => `
    <button 
      class="genre-btn ${selectedGenres.includes(genre) ? 'active' : ''}" 
      data-genre="${genre}"
    >
      ${genre}
    </button>
  `).join('');
}
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHTML = '';
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHTML += '<span class="star filled">★</span>';
        }
        else if (i === fullStars && hasHalfStar) {
            starsHTML += '<span class="star filled" style="opacity: 0.5">★</span>';
        }
        else {
            starsHTML += '<span class="star">★</span>';
        }
    }
    return starsHTML;
}
function createMovieCard(movie) {
    return `
    <div class="movie-card" data-movie-id="${movie.id}">
      <div class="movie-poster">
        <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
      </div>
      <div class="movie-info">
        <div class="movie-title-row">
          <h3 class="movie-title">${movie.title}</h3>
          <span class="movie-year">${movie.year}</span>
        </div>
        <div class="movie-rating">
          <div class="stars">
            ${generateStars(movie.rating)}
          </div>
          <span class="rating-value">${movie.rating.toFixed(1)}</span>
        </div>
        <p class="review-count">${movie.reviewCount.toLocaleString()} reviews</p>
        <div class="movie-genres">
          ${movie.genres.slice(0, 2).map(genre => `<span class="genre-badge">${genre}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
}
function getFilteredAndSortedMovies() {
    let result = [...movies];
    const query = normalizeText(currentSearchQuery);

    if (query) {
      result = result.filter(movie =>
        normalizeText(movie.title).includes(query)
      );
    }

    if (!selectedGenres.includes('All')) {
        result = result.filter(movie => movie.genres.some(genre => selectedGenres.includes(genre)));
    }
    switch (currentSortBy) {
        case 'rating':
            result.sort((a, b) => b.rating - a.rating);
            break;
        case 'year':
            result.sort((a, b) => b.year - a.year);
            break;
        case 'alphabetical':
            result.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
    return result;
}
function renderMovies() {
    const filteredMovies = getFilteredAndSortedMovies();
    if (filteredMovies.length === 0) {
        moviesGrid.style.display = 'none';
        noResults.style.display = 'block';
        moviesCount.textContent = 'No movies found';
    }
    else {
        moviesGrid.style.display = 'grid';
        noResults.style.display = 'none';
        moviesCount.textContent = `Showing ${filteredMovies.length} ${filteredMovies.length === 1 ? 'movie' : 'movies'}`;
        moviesGrid.innerHTML = filteredMovies.map(movie => createMovieCard(movie)).join('');
        const movieCards = document.querySelectorAll('.movie-card');
        movieCards.forEach(card => {
            card.addEventListener('click', () => {
                const movieId = card.getAttribute('data-movie-id');
                window.location.href = `detail.html?id=${movieId}`;
            });
        });
    }
}
function handleGenreClick(genre) {
    if (genre === 'All') {
        selectedGenres = ['All'];
    }
    else {
        selectedGenres = selectedGenres.filter(g => g !== 'All');
        if (selectedGenres.includes(genre)) {
            selectedGenres = selectedGenres.filter(g => g !== genre);
            if (selectedGenres.length === 0) {
                selectedGenres = ['All'];
            }
        }
        else {
            selectedGenres.push(genre);
        }
    }
    renderGenreButtons();
    renderMovies();
}

function mapApiMovies(apiMovies) {
  return apiMovies.map(movie => ({
    id: movie.id.toString(),
    title: movie.title,
    year: movie.release_date
      ? new Date(movie.release_date).getFullYear()
      : 'N/A',
    rating: movie.vote_average / 2,
    reviewCount: movie.vote_count,
    poster: movie.poster_path
      ? IMAGE_BASE_URL + movie.poster_path
      : 'fallback.jpg',
    genres: []
  }));
}


async function handleSearch(query) {
  currentSearchQuery = query;

  if (query.trim() === '') {
    const apiMovies = await fetchPopularMovies(3);
    movies = mapApiMovies(apiMovies);
    renderMovies();
    return;
  }

  const searchResults = await searchMovies(query);

  movies = mapApiMovies(searchResults);
  renderMovies();
}


function handleSortChange(sortBy) {
    currentSortBy = sortBy;
    renderMovies();
}
function clearFilters() {
    currentSearchQuery = '';
    selectedGenres = ['All'];
    currentSortBy = 'rating';
    searchInput.value = '';
    sortSelect.value = 'rating';
    renderGenreButtons();
    renderMovies();
}
function attachEventListeners() {
    searchInput.addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });
    sortSelect.addEventListener('change', (e) => {
        handleSortChange(e.target.value);
    });
    genreButtons.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('genre-btn')) {
            const genre = target.getAttribute('data-genre');
            if (genre) {
                handleGenreClick(genre);
            }
        }
    });
    clearFiltersBtn.addEventListener('click', clearFilters);



    // Mobile hamburger menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('.nav');

if (mobileMenuBtn && nav) {
  mobileMenuBtn.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
  });
});


}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
}
else {
    init();
}

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Globe from "react-globe.gl";
import { 
  fetchTrendingMovies, 
  fetchTopRatedMovies, 
  fetchDiscoverMovies,
  fetchMovieDetailsWithCredits,
  IMAGE_BASE_URL
} from "../api/tmdb";
import { fetchMultipleMovies } from "../api/movies";

const IMAGE_BASE = IMAGE_BASE_URL;
const IMAGE_BASE_LARGE = "https://image.tmdb.org/t/p/w500";
const TMDB_KEY = "f7919dfdb6ddf2bf5528aec022db0db9";
const TMDB_BASE = "https://api.themoviedb.org/3";



const SUPPORTED = {
  "United States of America": { code: "US", flag: "🇺🇸", color: "#e8c97a", region: "Americas" },
  "United Kingdom":           { code: "GB", flag: "🇬🇧", color: "#e87a7a", region: "Europe" },
  "Japan":                    { code: "JP", flag: "🇯🇵", color: "#7ae8c9", region: "Asia" },
  "India":                    { code: "IN", flag: "🇮🇳", color: "#e8a07a", region: "Asia" },
  "Brazil":                   { code: "BR", flag: "🇧🇷", color: "#7ac97a", region: "Americas" },
  "Germany":                  { code: "DE", flag: "🇩🇪", color: "#c97ae8", region: "Europe" },
  "Australia":                { code: "AU", flag: "🇦🇺", color: "#7ab8e8", region: "Oceania" },
  "South Korea":              { code: "KR", flag: "🇰🇷", color: "#e87ab8", region: "Asia" },
  "France":                   { code: "FR", flag: "🇫🇷", color: "#a0e87a", region: "Europe" },
  "Mexico":                   { code: "MX", flag: "🇲🇽", color: "#e8d07a", region: "Americas" },
  "China":                    { code: "CN", flag: "🇨🇳", color: "#e87a9a", region: "Asia" },
  "Nigeria":                  { code: "NG", flag: "🇳🇬", color: "#7ae8a0", region: "Africa" },
  "Canada":                   { code: "CA", flag: "🇨🇦", color: "#e8887a", region: "Americas" },
  "Spain":                    { code: "ES", flag: "🇪🇸", color: "#e8c07a", region: "Europe" },
  "Italy":                    { code: "IT", flag: "🇮🇹", color: "#7ac0e8", region: "Europe" },
  "Netherlands":              { code: "NL", flag: "🇳🇱", color: "#e89a7a", region: "Europe" },
  "Poland":                   { code: "PL", flag: "🇵🇱", color: "#7ae8d8", region: "Europe" },
  "Sweden":                   { code: "SE", flag: "🇸🇪", color: "#b8e87a", region: "Europe" },
  "Norway":                   { code: "NO", flag: "🇳🇴", color: "#7ad8e8", region: "Europe" },
  "Russia":                   { code: "RU", flag: "🇷🇺", color: "#d87ae8", region: "Europe" },
  "Thailand":                 { code: "TH", flag: "🇹🇭", color: "#e87a7a", region: "Asia" },
  "Philippines":              { code: "PH", flag: "🇵🇭", color: "#7ae87a", region: "Asia" },
  "Indonesia":                { code: "ID", flag: "🇮🇩", color: "#e8a87a", region: "Asia" },
  "Vietnam":                  { code: "VN", flag: "🇻🇳", color: "#c8e87a", region: "Asia" },
  "Turkey":                   { code: "TR", flag: "🇹🇷", color: "#7ae8a8", region: "Europe" },
  "Greece":                   { code: "GR", flag: "🇬🇷", color: "#e8d47a", region: "Europe" },
  "Portugal":                 { code: "PT", flag: "🇵🇹", color: "#7ab0e8", region: "Europe" },
  "Belgium":                  { code: "BE", flag: "🇧🇪", color: "#e89ae8", region: "Europe" },
  "Austria":                  { code: "AT", flag: "🇦🇹", color: "#7ac8e8", region: "Europe" },
  "Switzerland":              { code: "CH", flag: "🇨🇭", color: "#e8ae7a", region: "Europe" },
  "Denmark":                  { code: "DK", flag: "🇩🇰", color: "#a0e8c9", region: "Europe" },
  "Finland":                  { code: "FI", flag: "🇫🇮", color: "#e8a07a", region: "Europe" },
  "Argentina":                { code: "AR", flag: "🇦🇷", color: "#7ab8c9", region: "Americas" },
  "Chile":                    { code: "CL", flag: "🇨🇱", color: "#c9a07a", region: "Americas" },
  "Colombia":                 { code: "CO", flag: "🇨🇴", color: "#7ac97a", region: "Americas" },
  "South Africa":             { code: "ZA", flag: "🇿🇦", color: "#e8c9c9", region: "Africa" },
  "Egypt":                    { code: "EG", flag: "🇪🇬", color: "#c9e8a0", region: "Africa" },
  "Israel":                   { code: "IL", flag: "🇮🇱", color: "#e8b8a0", region: "Asia" },
  "Saudi Arabia":             { code: "SA", flag: "🇸🇦", color: "#a0c9e8", region: "Asia" },
  "United Arab Emirates":     { code: "AE", flag: "🇦🇪", color: "#e8a0c9", region: "Asia" },
  "Malaysia":                 { code: "MY", flag: "🇲🇾", color: "#c9e8c9", region: "Asia" },
  "Singapore":                { code: "SG", flag: "🇸🇬", color: "#e8c9a0", region: "Asia" },
  "Hong Kong":                { code: "HK", flag: "🇭🇰", color: "#a0e8e8", region: "Asia" },
  "Taiwan":                   { code: "TW", flag: "🇹🇼", color: "#e8a0a0", region: "Asia" },
  "New Zealand":              { code: "NZ", flag: "🇳🇿", color: "#a0e8a0", region: "Oceania" },
  "Ireland":                  { code: "IE", flag: "🇮🇪", color: "#e8c0a0", region: "Europe" },
  "Czech Republic":           { code: "CZ", flag: "🇨🇿", color: "#a0c9e8", region: "Europe" },
  "Hungary":                  { code: "HU", flag: "🇭🇺", color: "#c9a0e8", region: "Europe" },
  "Romania":                  { code: "RO", flag: "🇷🇴", color: "#e8a0c9", region: "Europe" },
};

const SIDEBAR_COUNTRIES = Object.entries(SUPPORTED)
  .map(([name, data]) => ({ name, ...data }))
  .sort((a, b) => a.name.localeCompare(b.name));

const FILTER_TYPES = [
  { id: "trending", label: "Trending Now",  icon: "🔥", desc: "Most popular this week" },
  { id: "local",    label: "Local Cinema",  icon: "🎬", desc: "Films from this country's language" },
  { id: "toprated", label: "Highly Rated",  icon: "⭐", desc: "Top rated in this region's language" },
];

function getFeatureCenter(feature) {
  const labelLat = Number(feature?.properties?.LABEL_Y);
  const labelLng = Number(feature?.properties?.LABEL_X);

  if (Number.isFinite(labelLat) && Number.isFinite(labelLng)) {
    return { lat: labelLat, lng: labelLng };
  }

  const points = [];

  function collectCoords(coords) {
    if (!Array.isArray(coords)) return;

    if (
      coords.length >= 2 &&
      typeof coords[0] === "number" &&
      typeof coords[1] === "number"
    ) {
      points.push(coords);
      return;
    }

    coords.forEach(collectCoords);
  }

  collectCoords(feature?.geometry?.coordinates);

  if (!points.length) {
    return { lat: 20, lng: 10 };
  }

  const [sumLng, sumLat] = points.reduce(
    ([lngAcc, latAcc], [lng, lat]) => [lngAcc + lng, latAcc + lat],
    [0, 0]
  );

  return {
    lat: sumLat / points.length,
    lng: sumLng / points.length,
  };
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map(char => char + char).join("")
    : normalized;

  const int = Number.parseInt(value, 16);

  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function neonColor(hex, intensity = 0) {
  const { r, g, b } = hexToRgb(hex);
  const mix = Math.min(Math.max(intensity, 0), 1);
  const brighten = channel => Math.round(channel + (255 - channel) * mix);
  const alpha = 0.7 + mix * 0.25;

  return `rgba(${brighten(r)}, ${brighten(g)}, ${brighten(b)}, ${alpha})`;
}



async function fetchFullMovieDetails(movieId) {
  try {
    const res = await fetch(
      `${TMDB_BASE}/movie/${movieId}?api_key=${TMDB_KEY}&append_to_response=credits`
    );
    return await res.json();
  } catch {
    return null;
  }
}

export default function GlobalWatchMap() {
  const globeRef = useRef();
  const wrapRef  = useRef();
  const carouselRef = useRef();
  const navigate = useNavigate();

  const [countries, setCountries] = useState({ features: [] });
  const [selected,  setSelected]  = useState(null);
  const [movies,    setMovies]    = useState([]);
  const [activeMovie, setActiveMovie] = useState(0);
  const [fullMovie, setFullMovie] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [hovered,   setHovered]   = useState(null);
  const [size,      setSize]      = useState({ w: 600, h: 480 });
  const [filter,    setFilter]    = useState("trending");
  const [selectedPulse, setSelectedPulse] = useState(0.5);

  // Load GeoJSON
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson")
      .then(r => r.json())
      .then(setCountries)
      .catch(() => {});
  }, []);

  // Responsive sizing
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const w = Math.floor(entries[0].contentRect.width);
      setSize({ w, h: Math.floor(Math.min(w * 0.72, 520)) });
    });
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  // Initial camera
  useEffect(() => {
    if (globeRef.current && countries.features.length) {
      globeRef.current.pointOfView({ lat: 20, lng: 10, altitude: 1.8 }, 0);
    }
  }, [countries]);

  useEffect(() => {
    if (!selected) {
      setSelectedPulse(0.5);
      return;
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const wave = (Math.sin(elapsed / 280) + 1) / 2;
      setSelectedPulse(wave);
    }, 80);

    return () => window.clearInterval(interval);
  }, [selected]);

  function getColor(feat) {
    const name = feat.properties.ADMIN;
    if (selected?.name === name) {
      return neonColor(SUPPORTED[name]?.color || "#00d4ff", 0.35 + selectedPulse * 0.65);
    }
    if (hovered?.properties.ADMIN === name) return "#ffffff";
    return SUPPORTED[name]
      ? SUPPORTED[name].color
      : `hsl(${Math.abs((feat.properties.ISO_N3 || 0) * 137) % 360},25%,16%)`;
  }

  function getAltitude(feat) {
    const name = feat.properties.ADMIN;
    if (selected?.name === name)            return 0.08 + selectedPulse * 0.03;
    if (hovered?.properties.ADMIN === name) return 0.04;
    return SUPPORTED[name] ? 0.02 : 0.005;
  }

  function focusCountryOnGlobe(country) {
    const feature = countries.features.find(
      feat =>
        feat.properties.ISO_A2 === country.code ||
        feat.properties.ADMIN === country.name
    );

    if (!feature) return;

    const { lat, lng } = getFeatureCenter(feature);
    globeRef.current?.pointOfView({ lat, lng, altitude: 1.1 }, 900);
  }

  async function selectCountry(c) {
    focusCountryOnGlobe(c);
    setSelected(c);
    setMovies([]);
    setFullMovie(null);
    setActiveMovie(0);
    setLoading(true);
    
    try {
      const movieList = await fetchMultipleMovies(c.code, filter);
      setMovies(movieList);
      
      // Fetch full details for first movie
      if (movieList.length > 0) {
        const full = await fetchFullMovieDetails(movieList[0].id);
        setFullMovie(full);
      }
    } catch (error) {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleFilterChange(newFilter) {
    setFilter(newFilter);
    if (selected) {
      setMovies([]);
      setFullMovie(null);
      setActiveMovie(0);
      setLoading(true);
      
      try {
        const movieList = await fetchMultipleMovies(selected.code, newFilter);
        setMovies(movieList);
        
        if (movieList.length > 0) {
          const full = await fetchFullMovieDetails(movieList[0].id);
          setFullMovie(full);
        }
      } catch (error) {
        setMovies([]);
      } finally {
        setLoading(false);
      }
    }
  }

  async function switchMovie(index) {
    if (index >= 0 && index < movies.length && index !== activeMovie) {
      setActiveMovie(index);
      const full = await fetchFullMovieDetails(movies[index].id);
      setFullMovie(full);
    }
  }

  function handleGlobeClick(feat) {
    const name = feat.properties.ADMIN;
    const info = SUPPORTED[name];
    if (!info) return;

    selectCountry({ name, ...info });
  }

  const currentMovie = movies[activeMovie];
  const movieCount = movies.length;

  return (
    <div className="gwm-root">
      <div className="gwm-header">
        <div className="gwm-header-content">
          <h1 className="gwm-title">🌍 Global Watch Map</h1>
          <p className="gwm-subtitle">Discover what's trending across the world</p>
        </div>
      </div>

      <div className="gwm-tabs">
        {FILTER_TYPES.map(f => (
          <button
            key={f.id}
            className={`gwm-tab ${filter === f.id ? "gwm-tab--active" : ""}`}
            onClick={() => handleFilterChange(f.id)}
          >
            <span className="gwm-tab-icon">{f.icon}</span>
            <span className="gwm-tab-label">{f.label}</span>
          </button>
        ))}
      </div>

      <div className="gwm-layout">
        {/* Globe Container */}
        <div ref={wrapRef} className="gwm-globe-wrap">
          <div className="gwm-globe-inner">
            <Globe
              ref={globeRef}
              width={size.w}
              height={size.h}
              backgroundColor="rgba(0,0,0,0)"
              globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg"
              atmosphereColor="#1a6699"
              atmosphereAltitude={0.2}
              hexPolygonsData={countries.features}
              hexPolygonResolution={3}
              hexPolygonMargin={0.3}
              hexPolygonUseDots={true}
              hexPolygonColor={getColor}
              hexPolygonAltitude={getAltitude}
              onHexPolygonHover={setHovered}
              onHexPolygonClick={handleGlobeClick}
              hexPolygonLabel={feat => {
                const name = feat.properties.ADMIN;
                const info = SUPPORTED[name];
                return `<div style="
                  background:rgba(8,10,18,0.95);
                  backdrop-filter:blur(8px);
                  border:1px solid ${info?.color || 'rgba(255,255,255,0.12)'};
                  border-radius:10px;
                  padding:0.6rem 1rem;
                  font-family:'Inter',sans-serif;
                  font-size:13px;
                  color:#fff;
                  box-shadow:0 8px 32px rgba(0,0,0,0.6);
                ">
                  ${info ? `<div style="font-size:18px;margin-bottom:0.3rem">${info.flag}</div>` : ''}
                  <strong style="font-size:14px;font-weight:700">${name}</strong>
                  ${info ? `<br/><span style="color:rgba(255,255,255,0.5);font-size:11px;margin-top:0.3rem;display:block">Click to explore</span>` : ''}
                </div>`;
              }}
            />
          </div>
          <div className="gwm-globe-hint">
            {!selected && <span>👆 Click a country to explore</span>}
          </div>
        </div>

        {/* Sidebar */}
        <div className="gwm-sidebar">
          {/* Countries List */}
          <div className="gwm-sidebar-section">
            <p className="gwm-sidebar-label">Select Region</p>
            <div className="gwm-countries">
              {SIDEBAR_COUNTRIES.map(c => (
                <button
                  key={c.code}
                  className={`gwm-country-btn ${selected?.code === c.code ? "gwm-country-btn--active" : ""}`}
                  style={selected?.code === c.code ? { borderColor: c.color, background: `${c.color}15` } : {}}
                  onClick={() => selectCountry(c)}
                  title={c.name}
                >
                  <span className="gwm-country-flag">{c.flag}</span>
                  <span className="gwm-country-name">{c.name}</span>
                  <span className="gwm-country-dot" style={{ background: c.color }} />
                </button>
              ))}
            </div>
          </div>

          {/* Movie Preview Card */}
          {selected && (
            <div className="gwm-preview-card" style={{ borderColor: `${selected.color}55` }}>
              <div className="gwm-preview-header" style={{ color: selected.color }}>
                <span className="gwm-preview-flag">{selected.flag}</span>
                <div>
                  <p className="gwm-preview-label">
                    {FILTER_TYPES.find(f => f.id === filter)?.icon} {FILTER_TYPES.find(f => f.id === filter)?.label}
                  </p>
                  <p className="gwm-preview-region">{selected.name}</p>
                </div>
              </div>

              {loading && (
                <div className="gwm-loading">
                  <div className="gwm-spinner" style={{ borderTopColor: selected.color }} />
                  <span>Loading cinema data…</span>
                </div>
              )}

              {!loading && currentMovie && fullMovie && (
                <div className="gwm-movie-content">
                  {/* Carousel Controls */}
                  {movieCount > 1 && (
                    <div className="gwm-carousel-nav">
                      <button 
                        className="gwm-carousel-btn gwm-carousel-prev"
                        onClick={() => switchMovie(activeMovie - 1)}
                        disabled={activeMovie === 0}
                      >
                        ‹
                      </button>
                      <span className="gwm-carousel-counter" style={{ color: selected.color }}>
                        {activeMovie + 1} of {movieCount}
                      </span>
                      <button 
                        className="gwm-carousel-btn gwm-carousel-next"
                        onClick={() => switchMovie(activeMovie + 1)}
                        disabled={activeMovie === movieCount - 1}
                      >
                        ›
                      </button>
                    </div>
                  )}

                  {/* Poster + Title */}
                  <div className="gwm-movie-hero">
                    {currentMovie.poster_path && (
                      <img 
                        src={IMAGE_BASE_LARGE + currentMovie.poster_path} 
                        alt={currentMovie.title} 
                        className="gwm-movie-poster" 
                      />
                    )}
                    <div className="gwm-movie-title-section">
                      <h3 className="gwm-movie-title">{currentMovie.title}</h3>
                      <div className="gwm-movie-meta-row">
                        <span className="gwm-meta-item">
                          📅 {currentMovie.release_date?.split("-")[0]}
                        </span>
                        <span className="gwm-meta-item">
                          ⭐ {(currentMovie.vote_average / 2).toFixed(1)}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rich Details */}
                  <div className="gwm-details">
                    {/* Genres */}
                    {fullMovie.genres && fullMovie.genres.length > 0 && (
                      <div className="gwm-detail-row">
                        <span className="gwm-detail-label">🎬 Genres</span>
                        <div className="gwm-genre-tags">
                          {fullMovie.genres.map(g => (
                            <span key={g.id} className="gwm-tag" style={{ borderColor: selected.color, color: selected.color }}>
                              {g.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Original Language */}
                    {fullMovie.original_language && (
                      <div className="gwm-detail-row">
                        <span className="gwm-detail-label">🗣️ Original Language</span>
                        <span className="gwm-detail-value">{fullMovie.original_language.toUpperCase()}</span>
                      </div>
                    )}

                    {/* Runtime */}
                    {fullMovie.runtime && (
                      <div className="gwm-detail-row">
                        <span className="gwm-detail-label">⏱️ Runtime</span>
                        <span className="gwm-detail-value">{fullMovie.runtime} minutes</span>
                      </div>
                    )}

                    {/* Budget & Revenue */}
                    {(fullMovie.budget || fullMovie.revenue) && (
                      <div className="gwm-detail-row">
                        <span className="gwm-detail-label">💰 Box Office</span>
                        <div className="gwm-budget-row">
                          {fullMovie.budget > 0 && (
                            <span>Budget: ${(fullMovie.budget / 1000000).toFixed(0)}M</span>
                          )}
                          {fullMovie.revenue > 0 && (
                            <span>Revenue: ${(fullMovie.revenue / 1000000).toFixed(0)}M</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Director & Cast */}
                    {fullMovie.credits && (
                      <>
                        {fullMovie.credits.crew?.find(c => c.job === "Director") && (
                          <div className="gwm-detail-row">
                            <span className="gwm-detail-label">🎥 Director</span>
                            <span className="gwm-detail-value">
                              {fullMovie.credits.crew.find(c => c.job === "Director")?.name}
                            </span>
                          </div>
                        )}
                        {fullMovie.credits.cast && fullMovie.credits.cast.length > 0 && (
                          <div className="gwm-detail-row">
                            <span className="gwm-detail-label">🎭 Cast</span>
                            <div className="gwm-cast">
                              {fullMovie.credits.cast.slice(0, 3).map(actor => (
                                <span key={actor.id} className="gwm-cast-name">
                                  {actor.name}
                                </span>
                              ))}
                              {fullMovie.credits.cast.length > 3 && (
                                <span className="gwm-cast-more">+{fullMovie.credits.cast.length - 3}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Overview */}
                    {currentMovie.overview && (
                      <div className="gwm-overview">
                        <p className="gwm-overview-text">{currentMovie.overview}</p>
                      </div>
                    )}

                    {/* Popularity Stats */}
                    <div className="gwm-stats">
                      <div className="gwm-stat">
                        <span className="gwm-stat-value">{currentMovie.vote_count?.toLocaleString()}</span>
                        <span className="gwm-stat-label">votes</span>
                      </div>
                      <div className="gwm-stat">
                        <span className="gwm-stat-value">{(currentMovie.popularity).toFixed(0)}</span>
                        <span className="gwm-stat-label">popularity</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    className="gwm-cta-btn"
                    style={{ borderColor: selected.color, color: selected.color }}
                    onClick={() => navigate(`/movie/${currentMovie.id}`)}
                  >
                    <span>Discover More</span>
                    <span className="gwm-cta-arrow">→</span>
                  </button>
                </div>
              )}

              {!loading && movieCount === 0 && (
                <div className="gwm-empty">
                  <p>📽️ No cinema data available for this region</p>
                </div>
              )}
            </div>
          )}

          {!selected && (
            <div className="gwm-intro-card">
              <p className="gwm-intro-icon">🌍</p>
              <p className="gwm-intro-text">Select a country to discover what's trending</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


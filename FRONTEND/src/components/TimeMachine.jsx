import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IMAGE_BASE_URL } from "../api/tmdb";

const IMAGE_BASE = IMAGE_BASE_URL;
const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

// Cinema history eras with thematic data
const ERAS = [
  {
    id: "1920s",
    label: "1920s",
    decade: "Silent Era",
    name: "The Birth of Cinema",
    tagline: "No sound. No color. Pure visual poetry.",
    desc: "The cinema was born. Silent films invented the language of storytelling through motion. Chaplin, Keaton, and Greta Garbo became immortal.",
    color: "#d4a574",
    textColor: "#f0e8d0",
    bgGradient: "linear-gradient(135deg, #0a0804 0%, #1a1410 100%)",
    keyEvents: ["First feature film", "Birth of cinematography", "Silent comedies"],
    topGenres: ["Drama", "Comedy", "Adventure"],
    avgRating: 7.2,
    directorCount: 50,
  },
  {
    id: "1930s",
    label: "1930s",
    decade: "Golden Dawn",
    name: "The Talkies Revolution",
    tagline: "Sound arrives. Cinema speaks for the first time.",
    desc: "The transition from silent to sound films transformed cinema forever. Audiences heard voices for the first time on screen. A new era of dialogue-driven storytelling began.",
    color: "#e8c97a",
    textColor: "#f8e8f0",
    bgGradient: "linear-gradient(135deg, #0c0810 0%, #1a1420 100%)",
    keyEvents: ["First talkie released", "Sound technology advances", "Hollywood boom begins"],
    topGenres: ["Drama", "Comedy", "Musical"],
    avgRating: 7.0,
    directorCount: 120,
  },
  {
    id: "1940s",
    label: "1940s",
    decade: "Wartime Cinema",
    name: "Cinema Goes to War",
    tagline: "Propaganda, drama, and escapism during WWII.",
    desc: "War shaped cinema. Studios produced propaganda films, intense dramas, and musicals for escapism. Film noir emerged from the darkness of the era.",
    color: "#c8a850",
    textColor: "#f0e0c0",
    bgGradient: "linear-gradient(135deg, #0e0a00 0%, #1a1410 100%)",
    keyEvents: ["Film noir emergence", "Wartime propaganda films", "Hollywood golden age"],
    topGenres: ["Drama", "Film-Noir", "War"],
    avgRating: 7.3,
    directorCount: 110,
  },
  {
    id: "1950s",
    label: "1950s",
    decade: "Golden Age",
    name: "Hollywood's Golden Age",
    tagline: "Technicolor. Widescreen. Glamour. Peak of the studio system.",
    desc: "Cinema reached its artistic and commercial peak. Technicolor painted vibrant worlds. Wide-screen formats made audiences gasp. Audrey Hepburn, Marlon Brando, and Grace Kelly became legends.",
    color: "#e8c97a",
    textColor: "#f8e8f0",
    bgGradient: "linear-gradient(135deg, #0c0810 0%, #1a1420 100%)",
    keyEvents: ["Technicolor dominates", "Widescreen revolution", "Epic productions"],
    topGenres: ["Drama", "Musical", "Western"],
    avgRating: 7.5,
    directorCount: 150,
  },
  {
    id: "1960s",
    label: "1960s",
    decade: "New Wave",
    name: "The Sixties Rebellion",
    tagline: "Auteurs break rules. Cinema becomes art.",
    desc: "The French New Wave changed everything. Young directors rejected studio conventions. Cinema became bold, experimental, and deeply personal. Directors became celebrities.",
    color: "#70c870",
    textColor: "#e0e8d8",
    bgGradient: "linear-gradient(135deg, #0a0c08 0%, #121810 100%)",
    keyEvents: ["French New Wave", "Auteur theory rises", "Experimental filmmaking"],
    topGenres: ["Drama", "Comedy", "Art-House"],
    avgRating: 7.4,
    directorCount: 180,
  },
  {
    id: "1970s",
    label: "1970s",
    decade: "New Hollywood",
    name: "The Director's Revolution",
    tagline: "Gritty. Raw. Morally complex. Cinema grows up.",
    desc: "The greatest decade in cinema. Directors like Scorsese, Coppola, and Spielberg revolutionized filmmaking. Jaws invented the blockbuster. The Godfather redefined drama.",
    color: "#70c870",
    textColor: "#e0e8d8",
    bgGradient: "linear-gradient(135deg, #0a0c08 0%, #121810 100%)",
    keyEvents: ["Jaws & blockbuster birth", "The Godfather trilogy", "Auteur dominance"],
    topGenres: ["Drama", "Thriller", "Crime"],
    avgRating: 7.8,
    directorCount: 220,
  },
  {
    id: "1980s",
    label: "1980s",
    decade: "VHS & Neon",
    name: "Blockbusters & Neon Dreams",
    tagline: "Synthesizers. VHS. Practical effects. Summer blockbuster era.",
    desc: "The age of spectacle. Practical effects pushed visual boundaries. Home video revolution began. John Hughes, Spielberg, and Lucas dominated. 80s pop aesthetics ruled.",
    color: "#ff40ff",
    textColor: "#e8d0ff",
    bgGradient: "linear-gradient(135deg, #080010 0%, #140820 100%)",
    keyEvents: ["VHS home video boom", "80s blockbusters", "Practical effects peak"],
    topGenres: ["Action", "Comedy", "Sci-Fi"],
    avgRating: 7.2,
    directorCount: 200,
  },
  {
    id: "1990s",
    label: "1990s",
    decade: "Indie Wave",
    name: "The Indie Revolution",
    tagline: "Sundance. Tarantino. Pulp. Slackers. Raw, uncompromising voices.",
    desc: "Independent cinema exploded. Sundance became the launchpad for new voices. Tarantino, PT Anderson, and the Coen Brothers emerged. Grunge aesthetics dominated.",
    color: "#e0a030",
    textColor: "#f0e0c0",
    bgGradient: "linear-gradient(135deg, #0e0a00 0%, #1a1410 100%)",
    keyEvents: ["Indie film explosion", "Tarantino emerges", "Digital filmmaking begins"],
    topGenres: ["Drama", "Indie", "Thriller"],
    avgRating: 7.3,
    directorCount: 280,
  },
  {
    id: "2000s",
    label: "2000s",
    decade: "Digital Age",
    name: "The CGI Revolution",
    tagline: "Digital filmmaking opens infinite possibilities. Franchises rise.",
    desc: "Digital technology transformed production. CGI made impossible things possible. Superhero franchises began their reign. Avatar changed visual effects forever.",
    color: "#4090e0",
    textColor: "#d0dff0",
    bgGradient: "linear-gradient(135deg, #080c14 0%, #101420 100%)",
    keyEvents: ["Avatar revolution", "Superhero boom begins", "Digital cinematography"],
    topGenres: ["Action", "Sci-Fi", "Fantasy"],
    avgRating: 6.9,
    directorCount: 350,
  },
  {
    id: "2010s",
    label: "2010s",
    decade: "Streaming Era",
    name: "The Streaming Wars Begin",
    tagline: "Netflix, Disney+, Amazon. Cinema democratized globally.",
    desc: "Streaming platforms disrupted traditional cinema. Global stories found audiences instantly. Black Panther, Get Out, and Parasite broke barriers. Cinema became truly global.",
    color: "#00d4ff",
    textColor: "#ffffff",
    bgGradient: "linear-gradient(135deg, #0a0e14 0%, #141820 100%)",
    keyEvents: ["Streaming platforms rise", "Global cinema emerges", "Superhero dominates"],
    topGenres: ["Action", "Drama", "Superhero"],
    avgRating: 6.8,
    directorCount: 400,
  },
  {
    id: "2020s",
    label: "2020s",
    decade: "Post-Pandemic",
    name: "Cinema Without Borders",
    tagline: "AI, VR, global voices. The future is here.",
    desc: "Cinema survived the pandemic and evolved. Global films like Parasite won Oscars. Streaming and theaters coexist. AI and new technologies emerge. Inclusivity becomes standard.",
    color: "#00d4ff",
    textColor: "#ffffff",
    bgGradient: "linear-gradient(135deg, #0a0e14 0%, #141820 100%)",
    keyEvents: ["Post-pandemic recovery", "Parasite wins Oscars", "AI in filmmaking"],
    topGenres: ["Drama", "Action", "Sci-Fi"],
    avgRating: 6.9,
    directorCount: 450,
  },
];

// Top movies per era (will fetch from TMDB in production)
const FAMOUS_MOVIES_PER_ERA = {
  "1920s": ["Nosferatu", "The General", "Metropolis", "Sunrise", "The Cabinet of Dr. Caligari"],
  "1930s": ["Frankenstein", "King Kong", "It's a Wonderful Life", "The Maltese Falcon", "City Lights"],
  "1940s": ["Citizen Kane", "It's a Wonderful Life", "Casablanca", "Singin' in the Rain", "The Third Man"],
  "1950s": ["Sunset Boulevard", "Singin' in the Rain", "Rear Window", "Ben-Hur", "Roman Holiday"],
  "1960s": ["2001: A Space Odyssey", "Psycho", "Breathless", "Mulholland Drive", "Vertigo"],
  "1970s": ["The Godfather", "Chinatown", "Taxi Driver", "Apocalypse Now", "Annie Hall"],
  "1980s": ["Blade Runner", "E.T.", "The Shining", "Back to the Future", "Scarface"],
  "1990s": ["Pulp Fiction", "The Silence of the Lambs", "Fargo", "Goodfellas", "Fight Club"],
  "2000s": ["The Matrix", "Mulholland Drive", "Eternal Sunshine", "No Country for Old Men", "Memento"],
  "2010s": ["The Social Network", "Inception", "Black Panther", "Get Out", "Parasite"],
  "2020s": ["Parasite", "Dune", "Everything Everywhere All at Once", "Oppenheimer", "The Fabelmans"],
};

export default function TimeMachine() {
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(9); // Start at 2010s
  const [posters, setPosters] = useState({});
  const [transitioning, setTransitioning] = useState(false);
  const cardRef = useRef(null);

  const era = ERAS[activeIdx];

  // Fetch posters for era movies
  useEffect(() => {
    const movies = FAMOUS_MOVIES_PER_ERA[era.label];
    
    movies.forEach(async (title) => {
      if (posters[title]) return;
      try {
        const res = await fetch(
          `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}`
        );
        const data = await res.json();
        const movie = data.results?.[0];
        if (movie?.poster_path) {
          setPosters(prev => ({
            ...prev,
            [title]: { poster: IMAGE_BASE + movie.poster_path, id: movie.id }
          }));
        }
      } catch {}
    });
  }, [activeIdx]);

  async function switchEra(idx) {
    if (idx === activeIdx) return;
    setTransitioning(true);
    await new Promise(r => setTimeout(r, 300));
    setActiveIdx(idx);
    await new Promise(r => setTimeout(r, 50));
    setTransitioning(false);
  }

  async function handlePosterClick(title) {
    const cached = posters[title];
    if (cached?.id) {
      navigate(`/movie/${cached.id}`);
      return;
    }
    try {
      const res = await fetch(
        `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}`
      );
      const data = await res.json();
      const movie = data.results?.[0];
      if (movie) navigate(`/movie/${movie.id}`);
    } catch {}
  }

  const movies = FAMOUS_MOVIES_PER_ERA[era.label];

  return (
    <div className="tm-root">
      {/* Header */}
      <div className="tm-header">
        <h1 className="tm-title" style={{ color: era.color }}>
          🎬 Film Evolution Explorer
        </h1>
        <p className="tm-subtitle">Journey through cinema history from 1920 to 2025</p>
      </div>

      {/* Decade Navigation */}
      <div className="tm-decade-nav">
        {ERAS.map((e, i) => (
          <button
            key={e.id}
            className={`tm-decade-btn ${i === activeIdx ? "tm-decade-btn--active" : ""}`}
            onClick={() => switchEra(i)}
            style={i === activeIdx ? { background: e.color, color: e.bgGradient.includes("#000") ? "#fff" : "#000" } : {}}
            title={e.name}
          >
            <span className="tm-decade-label">{e.label}</span>
            <span className="tm-decade-subtext">{e.decade}</span>
          </button>
        ))}
      </div>

      {/* Era Card */}
      <div
        ref={cardRef}
        className={`tm-era-card ${transitioning ? "tm-era-card--out" : "tm-era-card--in"}`}
        style={{
          background: era.bgGradient,
          borderColor: era.color,
          color: era.textColor,
        }}
      >
        {/* Era Header */}
        <div className="tm-era-header">
          <div>
            <h2 className="tm-era-name" style={{ color: era.color }}>
              {era.name}
            </h2>
            <p className="tm-era-tagline">{era.tagline}</p>
            <p className="tm-era-desc">{era.desc}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="tm-stats-grid">
          <div className="tm-stat-box">
            <span className="tm-stat-icon">⭐</span>
            <span className="tm-stat-label">Avg Rating</span>
            <span className="tm-stat-value" style={{ color: era.color }}>
              {era.avgRating.toFixed(1)}/10
            </span>
          </div>

          <div className="tm-stat-box">
            <span className="tm-stat-icon">🎥</span>
            <span className="tm-stat-label">Directors</span>
            <span className="tm-stat-value" style={{ color: era.color }}>
              {era.directorCount}+
            </span>
          </div>

          <div className="tm-stat-box">
            <span className="tm-stat-icon">🎬</span>
            <span className="tm-stat-label">Top Genres</span>
            <span className="tm-stat-value" style={{ color: era.color }}>
              {era.topGenres.join(", ")}
            </span>
          </div>
        </div>

        {/* Key Events */}
        <div className="tm-events">
          <h3 className="tm-events-title">Key Moments</h3>
          <div className="tm-events-list">
            {era.keyEvents.map((event, i) => (
              <div key={i} className="tm-event-item">
                <span className="tm-event-dot" style={{ background: era.color }} />
                <span className="tm-event-text">{event}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Famous Movies Carousel */}
        <div className="tm-movies-section">
          <h3 className="tm-movies-title">Iconic Films of the {era.label}</h3>
          <div className="tm-poster-grid">
            {movies.map((title) => (
              <button
                key={title}
                className="tm-poster-btn"
                onClick={() => handlePosterClick(title)}
                title={title}
              >
                {posters[title] ? (
                  <img
                    src={posters[title].poster}
                    alt={title}
                    className="tm-poster-img"
                  />
                ) : (
                  <div className="tm-poster-placeholder">
                    <span>{title}</span>
                  </div>
                )}
                <span className="tm-poster-title">{title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Evolution Arrow - Next Button */}
        {activeIdx < ERAS.length - 1 && (
          <button
            className="tm-evolution-arrow"
            onClick={() => switchEra(activeIdx + 1)}
            type="button"
          >
            <span className="tm-arrow-text">Next Era →</span>
            <span className="tm-arrow-icon">→</span>
          </button>
        )}
      </div>

      {/* Navigation Info */}
      <div className="tm-info">
        <p>Click a decade to jump through cinema history</p>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IMAGE_BASE_URL } from "../api/tmdb";

const IMAGE_BASE = IMAGE_BASE_URL;
const TMDB_KEY = "f7919dfdb6ddf2bf5528aec022db0db9";
const TMDB_BASE = "https://api.themoviedb.org/3";

// 20+ legendary directors with thematic data
const DIRECTORS = [
  {
    id: "nolan",
    name: "Christopher Nolan",
    emoji: "⏳",
    description: "The Architect of Complexity",
    style: "Non-linear narratives, mind-bending plots, epic scale",
    color: "#4a90d9",
    bgColor: "#050812",
    textColor: "#c8d4e8",
    dna: {
      palette: ["#4a90d9", "#1a3a5c", "#c8d4e8"],
      traits: ["Non-linear", "Intellectual", "Epic"],
      signature: "Circular narratives & time manipulation",
      influenced: ["Denis Villeneuve", "David Fincher"],
      influencedBy: ["Stanley Kubrick", "David Fincher"],
    },
    filmography: {
      "Mind-Bending": ["Inception", "Interstellar", "Tenet", "The Prestige"],
      "Time-Complex": ["Memento", "Dunkirk", "Oppenheimer"],
      "Crime Thriller": ["The Dark Knight", "The Dark Knight Rises", "Batman Begins"],
      "Intimate Drama": ["The Following", "Insomnia"],
    },
    sampleMovies: ["Inception", "Interstellar", "Oppenheimer"],
  },
  {
    id: "tarantino",
    name: "Quentin Tarantino",
    emoji: "🩸",
    description: "Master of Dialogue & Violence",
    style: "Non-linear storytelling, iconic dialogues, stylized violence",
    color: "#ff4500",
    bgColor: "#1a0a00",
    textColor: "#f5deb3",
    dna: {
      palette: ["#ff4500", "#1a0a00", "#f5deb3"],
      traits: ["Pulp", "Dialogue-driven", "Subversive"],
      signature: "Metanarrative & revenge tales",
      influenced: ["Robert Rodriguez", "Edgar Wright"],
      influencedBy: ["Howard Hawks", "Jean-Luc Godard"],
    },
    filmography: {
      "Revenge": ["Kill Bill Vol. 1", "Kill Bill Vol. 2", "Inglourious Basterds"],
      "Crime & Dialogue": ["Pulp Fiction", "Reservoir Dogs", "The Hateful Eight"],
      "War": ["Once Upon a Time in Hollywood", "Inglourious Basterds"],
      "Meta & Playful": ["Jackie Brown", "Four Rooms"],
    },
    sampleMovies: ["Pulp Fiction", "Kill Bill", "Inglourious Basterds"],
  },
  {
    id: "spielberg",
    name: "Steven Spielberg",
    emoji: "🎠",
    description: "Master of Emotion & Adventure",
    style: "Epic storytelling, emotional depth, blockbuster scale",
    color: "#f0a030",
    bgColor: "#0a0e18",
    textColor: "#e8eef8",
    dna: {
      palette: ["#f0a030", "#0a0e18", "#e8eef8"],
      traits: ["Epic", "Emotional", "Adventure"],
      signature: "Wonder & human drama in large scale",
      influenced: ["J.J. Abrams", "JW Abrams", "Denis Villeneuve"],
      influencedBy: ["David Lean", "Frank Capra"],
    },
    filmography: {
      "Epic Adventure": ["Indiana Jones series", "Jurassic Park", "War Horse"],
      "War Drama": ["Saving Private Ryan", "War Horse", "Lincoln"],
      "Sci-Fi Wonder": ["E.T.", "A.I.", "Minority Report"],
      "Historical": ["Schindler's List", "Lincoln"],
    },
    sampleMovies: ["Schindler's List", "Jurassic Park", "Saving Private Ryan"],
  },
  {
    id: "scorsese",
    name: "Martin Scorsese",
    emoji: "🗽",
    description: "Chronicler of the Human Condition",
    style: "Gritty realism, psychological depth, distinctive rhythm",
    color: "#cc4422",
    bgColor: "#0e0800",
    textColor: "#e8d8c0",
    dna: {
      palette: ["#cc4422", "#0e0800", "#e8d8c0"],
      traits: ["Gritty", "Rhythmic", "Psychological"],
      signature: "NYC crime & religious guilt",
      influenced: ["Paul Thomas Anderson", "David Fincher"],
      influencedBy: ["Michael Powell", "Howard Hawks"],
    },
    filmography: {
      "Organized Crime": ["Goodfellas", "Casino", "The Irishman"],
      "Urban Decay": ["Taxi Driver", "Mean Streets", "Raging Bull"],
      "Psychological": ["Shutter Island", "Taxi Driver"],
      "Religious Guilt": ["Silence", "Last Temptation of Christ"],
    },
    sampleMovies: ["Goodfellas", "Taxi Driver", "The Irishman"],
  },
  {
    id: "kubrick",
    name: "Stanley Kubrick",
    emoji: "👁️",
    description: "Perfectionist Visionary",
    style: "Clinical precision, philosophical depth, visual perfection",
    color: "#888888",
    bgColor: "#f0ece4",
    textColor: "#1a1a1a",
    dna: {
      palette: ["#888888", "#f0ece4", "#1a1a1a"],
      traits: ["Clinical", "Stark", "Philosophical"],
      signature: "Symmetry & existential dread",
      influenced: ["David Fincher", "Christopher Nolan"],
      influencedBy: ["Orson Welles", "Max Ophüls"],
    },
    filmography: {
      "Sci-Fi Epic": ["2001: A Space Odyssey", "A Clockwork Orange"],
      "War": ["Full Metal Jacket", "Dr. Strangelove", "Paths of Glory"],
      "Psychological Horror": ["The Shining", "Eyes Wide Shut"],
      "Dystopian": ["A Clockwork Orange", "Lolita"],
    },
    sampleMovies: ["2001: A Space Odyssey", "Full Metal Jacket", "The Shining"],
  },
  {
    id: "lynch",
    name: "David Lynch",
    emoji: "🌀",
    description: "Surrealist Dream Weaver",
    style: "Dreamlike logic, surrealism, psychological mystery",
    color: "#c87090",
    bgColor: "#0d0008",
    textColor: "#d4b8c8",
    dna: {
      palette: ["#c87090", "#0d0008", "#d4b8c8"],
      traits: ["Surreal", "Dreamlike", "Mysterious"],
      signature: "Red curtains & the subconscious",
      influenced: ["Ari Aster", "Denis Villeneuve"],
      influencedBy: ["Luis Buñuel", "Federico Fellini"],
    },
    filmography: {
      "Surreal": ["Mulholland Drive", "Inland Empire", "Eraserhead"],
      "Small Town Mystery": ["Twin Peaks series", "Blue Velvet"],
      "Intimate Oddity": ["The Elephant Man", "Wild at Heart"],
      "Abstract": ["Rabbits", "Inland Empire"],
    },
    sampleMovies: ["Mulholland Drive", "Blue Velvet", "Twin Peaks: The Return"],
  },
  {
    id: "fincher",
    name: "David Fincher",
    emoji: "🕵️",
    description: "Master of Psychological Thrillers",
    style: "Meticulous control, dark psychology, technical precision",
    color: "#8899aa",
    bgColor: "#060608",
    textColor: "#c0c8d0",
    dna: {
      palette: ["#8899aa", "#060608", "#c0c8d0"],
      traits: ["Meticulous", "Moody", "Methodical"],
      signature: "Obsessive protagonists & unreliable narrators",
      influenced: ["Denis Villeneuve", "Ari Aster"],
      influencedBy: ["Michael Mann", "Stanley Kubrick"],
    },
    filmography: {
      "Psychological Thriller": ["Gone Girl", "Se7en", "Zodiac"],
      "Mystery": ["Zodiac", "The Game", "Panic Room"],
      "Crime Drama": ["The Social Network", "Murder Mystery"],
      "Dark Descent": ["Fight Club", "Se7en"],
    },
    sampleMovies: ["Fight Club", "Se7en", "Gone Girl"],
  },
  {
    id: "villeneuve",
    name: "Denis Villeneuve",
    emoji: "🪐",
    description: "Master of Epic Methodicality",
    style: "Epic scale, meticulous execution, visual grandeur",
    color: "#a080e0",
    bgColor: "#08060e",
    textColor: "#d8d0e8",
    dna: {
      palette: ["#a080e0", "#08060e", "#d8d0e8"],
      traits: ["Epic", "Methodical", "Immersive"],
      signature: "Large-scale intimate dramas",
      influenced: ["Upcoming generation of sci-fi directors"],
      influencedBy: ["Stanley Kubrick", "Terrence Malick"],
    },
    filmography: {
      "Sci-Fi Epic": ["Dune", "Arrival", "Blade Runner 2049"],
      "Thriller": ["Prisoners", "Enemy", "Sicario"],
      "Intimate Epic": ["Incendies", "Enemy"],
      "Futuristic": ["Dune", "Arrival"],
    },
    sampleMovies: ["Dune", "Arrival", "Blade Runner 2049"],
  },
  {
    id: "anderson",
    name: "Paul Thomas Anderson",
    emoji: "🎭",
    description: "Poet of Complex Ensembles",
    style: "Long takes, ensemble casts, philosophical depth",
    color: "#c08030",
    bgColor: "#0e0800",
    textColor: "#e8d8b8",
    dna: {
      palette: ["#c08030", "#0e0800", "#e8d8b8"],
      traits: ["Complex", "Textured", "Philosophical"],
      signature: "Interconnected characters & ambient storytelling",
      influenced: ["Anderson-inspired indie directors"],
      influencedBy: ["Robert Altman", "Orson Welles"],
    },
    filmography: {
      "Epic Drama": ["There Will Be Blood", "Magnolia", "Inherent Vice"],
      "Character Study": ["Boogie Nights", "Hard Eight"],
      "Intimate": ["Phantom Thread", "The Master"],
      "Ensemble": ["Magnolia", "Boogie Nights"],
    },
    sampleMovies: ["There Will Be Blood", "Boogie Nights", "Phantom Thread"],
  },
  {
    id: "deltoro",
    name: "Guillermo del Toro",
    emoji: "👹",
    description: "Dark Fantasy Alchemist",
    style: "Dark fantasy, gothic atmosphere, creature design",
    color: "#8844cc",
    bgColor: "#080410",
    textColor: "#d0b8e8",
    dna: {
      palette: ["#8844cc", "#080410", "#d0b8e8"],
      traits: ["Dark Fantasy", "Gothic", "Imaginative"],
      signature: "Monsters as metaphor for human condition",
      influenced: ["Ari Aster", "Denis Villeneuve"],
      influencedBy: ["Mexican folklore", "European gothic cinema"],
    },
    filmography: {
      "Dark Fantasy": ["Pan's Labyrinth", "The Shape of Water", "Crimson Peak"],
      "Gothic Horror": ["Crimson Peak", "Hellboy"],
      "Creature Feature": ["The Shape of Water", "The Hellboy films"],
      "Supernatural": ["Pan's Labyrinth", "Orphanage"],
    },
    sampleMovies: ["Pan's Labyrinth", "The Shape of Water", "Crimson Peak"],
  },
  {
    id: "miyazaki",
    name: "Hayao Miyazaki",
    emoji: "🐉",
    description: "Master of Animated Wonder",
    style: "Hand-drawn animation, poetic fantasy, environmental themes",
    color: "#40c080",
    bgColor: "#081810",
    textColor: "#e0f0e0",
    dna: {
      palette: ["#40c080", "#081810", "#e0f0e0"],
      traits: ["Ethereal", "Handcrafted", "Whimsical"],
      signature: "Nature spirits & coming-of-age journeys",
      influenced: ["Anime & animation worldwide"],
      influencedBy: ["Japanese folklore", "European fairy tales"],
    },
    filmography: {
      "Fantasy Adventure": ["Spirited Away", "Princess Mononoke", "Howl's Moving Castle"],
      "Coming-of-Age": ["My Neighbor Totoro", "Kiki's Delivery Service"],
      "Environmental": ["Princess Mononoke", "Nausicaä"],
      "Whimsical": ["My Neighbor Totoro", "Spirited Away"],
    },
    sampleMovies: ["Spirited Away", "My Neighbor Totoro", "Princess Mononoke"],
  },
  {
    id: "kurosawa",
    name: "Akira Kurosawa",
    emoji: "⚔️",
    description: "Samurai Cinema Pioneer",
    style: "Epic action, humanistic drama, innovative cinematography",
    color: "#d4a020",
    bgColor: "#0e0c00",
    textColor: "#f0e8c0",
    dna: {
      palette: ["#d4a020", "#0e0c00", "#f0e8c0"],
      traits: ["Epic", "Theatrical", "Humanistic"],
      signature: "Samurai honor & human frailty",
      influenced: ["George Lucas", "Martin Scorsese"],
      influencedBy: ["Japanese theater", "Western cinema"],
    },
    filmography: {
      "Samurai Epic": ["Seven Samurai", "Ran", "Sanjuro"],
      "Philosophical": ["Rashomon", "Ikiru", "High and Low"],
      "Action": ["Seven Samurai", "Sanjuro"],
      "Introspective": ["Ikiru", "Scandal"],
    },
    sampleMovies: ["Seven Samurai", "Rashomon", "Ran"],
  },
  {
    id: "coens",
    name: "Coen Brothers",
    emoji: "🎲",
    description: "Masters of Darkly Comic Existentialism",
    style: "Dark comedy, literary adaptation, quirky characters",
    color: "#7899aa",
    bgColor: "#0a0c0e",
    textColor: "#d8dce0",
    dna: {
      palette: ["#7899aa", "#0a0c0e", "#d8dce0"],
      traits: ["Deadpan", "Quirky", "Darkly Comic"],
      signature: "Ordinary people in extraordinary situations",
      influenced: ["Modern indie filmmakers"],
      influencedBy: ["Film noir", "Preston Sturges"],
    },
    filmography: {
      "Crime Caper": ["Fargo", "No Country for Old Men", "The Big Lebowski"],
      "Dark Comedy": ["The Big Lebowski", "Raising Arizona"],
      "Literary": ["True Grit", "The Man Who Wasn't There"],
      "Quirky": ["The Big Lebowski", "O Brother Where Art Thou"],
    },
    sampleMovies: ["Fargo", "No Country for Old Men", "The Big Lebowski"],
  },
  {
    id: "wongkarwai",
    name: "Wong Kar-wai",
    emoji: "💫",
    description: "Visual Poet of Lost Love",
    style: "Poetic visuals, melancholic romance, vibrant cinematography",
    color: "#e05020",
    bgColor: "#100808",
    textColor: "#f0d8c8",
    dna: {
      palette: ["#e05020", "#100808", "#f0d8c8"],
      traits: ["Poetic", "Melancholic", "Stylized"],
      signature: "Neon-lit cities & impossible love",
      influenced: ["Contemporary Asian cinema"],
      influencedBy: ["Jean-Luc Godard", "Wong Kar-wai"],
    },
    filmography: {
      "Romance": ["In the Mood for Love", "Chungking Express", "2046"],
      "Melancholic": ["Fallen Angels", "My Blueberry Nights"],
      "Stylized": ["In the Mood for Love", "Ashes of Time"],
      "Poetic": ["In the Mood for Love", "Chungking Express"],
    },
    sampleMovies: ["In the Mood for Love", "Chungking Express", "2046"],
  },
  {
    id: "parkchangwook",
    name: "Park Chan-wook",
    emoji: "🩺",
    description: "Master of Elegant Violence",
    style: "Stylized violence, formal composition, psychological depth",
    color: "#cc44aa",
    bgColor: "#0c0010",
    textColor: "#e0c8e0",
    dna: {
      palette: ["#cc44aa", "#0c0010", "#e0c8e0"],
      traits: ["Elegant", "Violent", "Formal"],
      signature: "Revenge & twisted morality",
      influenced: ["International thriller directors"],
      influencedBy: ["Alfred Hitchcock", "Michael Powell"],
    },
    filmography: {
      "Revenge": ["Oldboy", "The Handmaiden", "Stoker"],
      "Crime Thriller": ["Oldboy", "Thirst"],
      "Psychological": ["The Handmaiden", "Stoker"],
      "Stylized": ["Oldboy", "The Handmaiden"],
    },
    sampleMovies: ["Oldboy", "The Handmaiden", "Stoker"],
  },
  {
    id: "bongjoonho",
    name: "Bong Joon-ho",
    emoji: "🏠",
    description: "Genre-Bending Social Commentator",
    style: "Genre fusion, social satire, technical mastery",
    color: "#88cc44",
    bgColor: "#0a0c08",
    textColor: "#dce8d0",
    dna: {
      palette: ["#88cc44", "#0a0c08", "#dce8d0"],
      traits: ["Social", "Genre-bending", "Masterful"],
      signature: "Class conflict & darkly comedic horror",
      influenced: ["Global filmmakers"],
      influencedBy: ["Orson Welles", "Akira Kurosawa"],
    },
    filmography: {
      "Class Satire": ["Parasite", "Okja", "Snowpiercer"],
      "Crime Thriller": ["Memories of Murder", "Mother"],
      "Genre Fusion": ["Parasite", "The Host"],
      "Social Commentary": ["Parasite", "Okja", "Snowpiercer"],
    },
    sampleMovies: ["Parasite", "Snowpiercer", "Memories of Murder"],
  },
  {
    id: "sofiocoppola",
    name: "Sofia Coppola",
    emoji: "🌸",
    description: "Chronicler of Loneliness & Isolation",
    style: "Intimate visuals, dreamy atmosphere, emotional restraint",
    color: "#e090c0",
    bgColor: "#1a0f18",
    textColor: "#f0e0f0",
    dna: {
      palette: ["#e090c0", "#1a0f18", "#f0e0f0"],
      traits: ["Dreamy", "Intimate", "Introspective"],
      signature: "Alienation in luxury & privilege",
      influenced: ["Contemporary indie directors"],
      influencedBy: ["Michelangelo Antonioni", "Yasujirō Ozu"],
    },
    filmography: {
      "Alienation": ["Lost in Translation", "The Bling Ring", "Somewhere"],
      "Coming-of-Age": ["The Virgin Suicides", "The Bling Ring"],
      "Period Piece": ["Marie Antoinette", "The Beguiled"],
      "Dreamy": ["Lost in Translation", "Somewhere"],
    },
    sampleMovies: ["Lost in Translation", "The Virgin Suicides", "Marie Antoinette"],
  },
  {
    id: "ariaster",
    name: "Ari Aster",
    emoji: "😱",
    description: "Master of Artistic Horror",
    style: "Psychological horror, folk horror, visual composition",
    color: "#bb2244",
    bgColor: "#0a0408",
    textColor: "#f0b8c8",
    dna: {
      palette: ["#bb2244", "#0a0408", "#f0b8c8"],
      traits: ["Artistic", "Disturbing", "Methodical"],
      signature: "Grief & familial trauma as horror",
      influenced: ["Horror & arthouse cinema"],
      influencedBy: ["Darren Aronofsky", "Lars von Trier"],
    },
    filmography: {
      "Grief Horror": ["Hereditary", "Midsommar", "Beau Is Afraid"],
      "Folk Horror": ["Midsommar", "The Killing of a Sacred Deer"],
      "Psychological": ["Hereditary", "Beau Is Afraid"],
      "Artistic": ["Hereditary", "Midsommar"],
    },
    sampleMovies: ["Hereditary", "Midsommar", "The Killing of a Sacred Deer"],
  },
  {
    id: "johnwaters",
    name: "John Waters",
    emoji: "🎪",
    description: "Transgressive Trash Auteur",
    style: "Camp, transgression, underground culture",
    color: "#ff66ff",
    bgColor: "#0f0510",
    textColor: "#f0d0f0",
    dna: {
      palette: ["#ff66ff", "#0f0510", "#f0d0f0"],
      traits: ["Transgressive", "Campy", "Underground"],
      signature: "Trash aesthetics & taboo breaking",
      influenced: ["Independent & experimental cinema"],
      influencedBy: ["William Castle", "Douglas Sirk"],
    },
    filmography: {
      "Camp Transgression": ["Pink Flamingos", "Polyester", "Cecil B. Demented"],
      "Cult Classic": ["Hairspray", "Cry-Baby"],
      "Extreme": ["Pink Flamingos", "Multiple Maniacs"],
      "Comedic": ["Hairspray", "Cry-Baby"],
    },
    sampleMovies: ["Hairspray", "Cry-Baby", "Pink Flamingos"],
  },
  {
    id: "quentintarantino2",
    name: "Edgar Wright",
    emoji: "🎬",
    description: "Master of Visual Comedy",
    style: "Kinetic editing, visual gags, British comedy",
    color: "#ff9900",
    bgColor: "#0d0a00",
    textColor: "#f5deb3",
    dna: {
      palette: ["#ff9900", "#0d0a00", "#f5deb3"],
      traits: ["Kinetic", "Comedic", "Visual"],
      signature: "Fast-paced comedy with impeccable editing",
      influenced: ["Comedy & indie directors"],
      influencedBy: ["Guy Ritchie", "Television comedies"],
    },
    filmography: {
      "Comedy": ["Shaun of the Dead", "Hot Fuzz", "The World's End"],
      "Stylized Action": ["Baby Driver", "Scott Pilgrim vs. The World"],
      "Genre Parody": ["Shaun of the Dead", "Hot Fuzz"],
      "Kinetic": ["Baby Driver", "Scott Pilgrim"],
    },
    sampleMovies: ["Shaun of the Dead", "Baby Driver", "Scott Pilgrim vs. The World"],
  },
];

export default function DirectorsCut() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState("nolan");
  const [search, setSearch] = useState("");
  const [posters, setPosters] = useState({});

  const director = DIRECTORS.find(d => d.id === selectedId);
  const filtered = DIRECTORS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase())
  );

  // Fetch posters for selected director's sample movies
  useEffect(() => {
    if (!director) return;
    
    director.sampleMovies.forEach(async (title) => {
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
  }, [selectedId]);

  function handleMovieClick(title) {
    const cached = posters[title];
    if (cached?.id) {
      navigate(`/movie/${cached.id}`);
    }
  }

  const themeNames = Object.keys(director?.filmography || {});

  return (
    <div className="dc-root">
      {/* Header */}
      <div className="dc-header">
        <h1 className="dc-title" style={{ color: director?.color }}>
          🎭 Director Worlds
        </h1>
        <p className="dc-subtitle">Step into the creative universe of cinema's greatest auteurs</p>
      </div>

      {/* Search */}
      <div className="dc-controls">
        <input
          className="dc-search"
          placeholder="Search directors…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Director Grid */}
      <div className="dc-grid">
        {filtered.map((d) => (
          <button
            key={d.id}
            className={`dc-card ${selectedId === d.id ? "dc-card--active" : ""}`}
            onClick={() => {
              setSelectedId(d.id);
              setSearch("");
            }}
            style={selectedId === d.id ? { borderColor: d.color, background: `${d.color}15` } : {}}
          >
            <div className="dc-card-emoji">{d.emoji}</div>
            <h3 className="dc-card-name">{d.name}</h3>
            <p className="dc-card-description">{d.description}</p>
            <p className="dc-card-style">{d.style}</p>
          </button>
        ))}
      </div>

      {/* Director Worlds Preview */}
      {director && (
        <div
          className="dc-world"
          style={{
            background: director.bgColor,
            color: director.textColor,
            borderColor: director.color,
          }}
        >
          {/* Director Header */}
          <div className="dc-world-header">
            <div className="dc-world-emoji">{director.emoji}</div>
            <div className="dc-world-info">
              <h2 className="dc-world-name" style={{ color: director.color }}>
                {director.name}
              </h2>
              <p className="dc-world-description">{director.description}</p>
              <p className="dc-world-style">{director.style}</p>
            </div>
          </div>

          {/* Director DNA */}
          <div className="dc-dna-section">
            <h3 className="dc-dna-title" style={{ color: director.color }}>
              Director DNA
            </h3>

            {/* Color Palette */}
            <div className="dc-dna-palette">
              <p className="dc-dna-label">Color Signature:</p>
              <div className="dc-palette-colors">
                {director.dna.palette.map((color, i) => (
                  <div
                    key={i}
                    className="dc-color-swatch"
                    style={{ background: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Traits */}
            <div className="dc-dna-traits">
              <p className="dc-dna-label">Creative Traits:</p>
              <div className="dc-traits-list">
                {director.dna.traits.map((trait, i) => (
                  <span key={i} className="dc-trait-tag" style={{ borderColor: director.color, color: director.color }}>
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Signature */}
            <div className="dc-signature">
              <p className="dc-dna-label">Directorial Signature:</p>
              <p className="dc-signature-text">{director.dna.signature}</p>
            </div>

            {/* Influences */}
            <div className="dc-influences">
              <div className="dc-influence-block">
                <p className="dc-dna-label">Influenced By:</p>
                <p className="dc-influence-names">{director.dna.influencedBy.join(", ")}</p>
              </div>
              <div className="dc-influence-block">
                <p className="dc-dna-label">Influenced:</p>
                <p className="dc-influence-names">{director.dna.influenced.join(", ")}</p>
              </div>
            </div>
          </div>

          {/* Filmography by Theme */}
          <div className="dc-filmography-section">
            <h3 className="dc-filmography-title" style={{ color: director.color }}>
              Filmography by Theme
            </h3>

            {themeNames.map((theme) => (
              <div key={theme} className="dc-theme-block">
                <h4 className="dc-theme-name" style={{ color: director.color }}>
                  {theme}
                </h4>
                <div className="dc-movies-in-theme">
                  {director.filmography[theme].map((movie) => (
                    <span key={movie} className="dc-movie-badge">
                      {movie}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sample Posters */}
          <div className="dc-posters-section">
            <h3 className="dc-posters-title" style={{ color: director.color }}>
              Essential Films
            </h3>
            <div className="dc-posters-row">
              {director.sampleMovies.map((title) => (
                <button
                  key={title}
                  className="dc-poster-btn"
                  onClick={() => handleMovieClick(title)}
                >
                  {posters[title] ? (
                    <img
                      src={posters[title].poster}
                      alt={title}
                      className="dc-poster-img"
                    />
                  ) : (
                    <div className="dc-poster-placeholder" style={{ borderColor: director.color }}>
                      <span>{title}</span>
                    </div>
                  )}
                  <span className="dc-poster-title">{title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
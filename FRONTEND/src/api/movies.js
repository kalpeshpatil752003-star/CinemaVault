const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

export const COUNTRY_LANGUAGE_MAP = {
  "US": "en", "GB": "en", "CA": "en", "AU": "en", "NZ": "en", "IE": "en",
  "JP": "ja",
  "KR": "ko",
  "IN": "hi",
  "FR": "fr", "BE": "fr",
  "DE": "de", "AT": "de", "CH": "de",
  "ES": "es", "MX": "es", "AR": "es", "CL": "es", "CO": "es",
  "BR": "pt", "PT": "pt",
  "IT": "it",
  "NL": "nl",
  "PL": "pl",
  "SE": "sv",
  "NO": "nb",
  "DK": "da",
  "FI": "fi",
  "RU": "ru",
  "TR": "tr",
  "TH": "th",
  "ID": "id",
  "VN": "vi",
  "PH": "tl",
  "MY": "ms",
  "CN": "zh", "TW": "zh", "HK": "zh",
  "SG": "en",
  "NG": "en",
  "ZA": "en",
  "EG": "ar", "SA": "ar", "AE": "ar",
  "IL": "he",
  "GR": "el",
  "HU": "hu",
  "RO": "ro",
  "CZ": "cs",
};

export async function fetchMultipleMovies(code, type) {
  const lang = COUNTRY_LANGUAGE_MAP[code] || "en";

  try {
    let url;

    if (type === "trending") {
      url = `${TMDB_BASE}/trending/movie/week?api_key=${TMDB_KEY}&region=${code}`;

    } else if (type === "local") {
      url = `${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}`
          + `&with_original_language=${lang}`
          + `&sort_by=popularity.desc`
          + `&vote_count.gte=100`
          + `&page=1`;

    } else if (type === "toprated") {
      url = `${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}`
          + `&with_original_language=${lang}`
          + `&sort_by=vote_average.desc`
          + `&vote_count.gte=500`
          + `&page=1`;
    }

    // For English countries on local filter, use region instead
    // otherwise every English country shows same Hollywood films
    if (type === "local" && lang === "en" && code !== "US") {
      const res = await fetch(
        `${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&region=${code}&page=1`
      );
      const data = await res.json();
      return data.results?.slice(0, 5) || [];
    }

    const res  = await fetch(url);
    const data = await res.json();
    return data.results?.slice(0, 5) || [];

  } catch {
    return [];
  }
}

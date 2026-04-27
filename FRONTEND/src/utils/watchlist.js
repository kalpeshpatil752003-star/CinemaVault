const API_BASE_URL = import.meta.env.VITE_API_URL || "";

async function request(path, token, options = {}) {
  if (!token) {
    throw new Error("Please login to manage your watchlist.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || "Watchlist request failed");
  }

  return data;
}

export async function getWatchlist(token) {
  const data = await request("/watchlist", token);
  return (data.items || []).map(item => ({
    id: item.tmdbMovieId,
    title: item.title,
    poster_path: item.posterPath,
    release_date: item.releaseDate,
    vote_average: item.voteAverage,
    overview: item.overview,
    addedAt: item.addedAt,
  }));
}

export async function clearWatchlist(token) {
  await request("/watchlist", token, {
    method: "DELETE",
  });

  window.dispatchEvent(new Event("watchlistUpdated"));
  return [];
}

export async function toggleWatchlist(movie, token) {
  const list = await getWatchlist(token);
  const exists = list.find(m => m.id === movie.id);

  if (exists) {
    await request(`/watchlist/${movie.id}`, token, {
      method: "DELETE",
    });
  } else {
    await request("/watchlist", token, {
      method: "POST",
      body: JSON.stringify({
        tmdbMovieId: movie.id,
        title: movie.title || movie.name,
        posterPath: movie.poster_path,
        releaseDate: movie.release_date || movie.first_air_date,
        voteAverage: movie.vote_average,
        overview: movie.overview,
      }),
    });
  }

  const updated = await getWatchlist(token);
  window.dispatchEvent(new Event("watchlistUpdated"));
  return updated;
}

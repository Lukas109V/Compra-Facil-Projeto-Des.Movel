import { TMDB_IMAGE_URL } from "./defaults.js";

function requireMovie(value) {
  if (!value || !Number.isSafeInteger(value.id) || value.id <= 0 || typeof value.title !== "string") {
    throw new Error("O serviço retornou dados de filme inválidos.");
  }
  return value;
}

export function normalizeMovie(value) {
  const movie = requireMovie(value);
  return {
    id: movie.id,
    title: movie.title,
    releaseDate: typeof movie.release_date === "string" ? movie.release_date : "",
    voteAverage: typeof movie.vote_average === "number" && Number.isFinite(movie.vote_average)
      ? movie.vote_average : null,
    posterUrl: typeof movie.poster_path === "string" && movie.poster_path
      ? `${TMDB_IMAGE_URL}${movie.poster_path}` : null,
  };
}

export function normalizeSearch(payload) {
  if (!Array.isArray(payload?.results)) throw new Error("O serviço retornou uma busca inválida.");
  return [...payload.results]
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 5)
    .map(normalizeMovie);
}

export function normalizeDetails(payload) {
  const movie = normalizeMovie(payload);
  return {
    ...movie,
    overview: typeof payload.overview === "string" ? payload.overview : "",
    runtime: Number.isFinite(payload.runtime) && payload.runtime > 0 ? payload.runtime : null,
    genres: Array.isArray(payload.genres)
      ? payload.genres.map((genre) => genre?.name).filter((name) => typeof name === "string" && name)
      : [],
  };
}

export function releaseYear(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date.slice(0, 4) : "Ano não informado";
}

export function formatReleaseDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? date.split("-").reverse().join("/") : "Data não informada";
}

export function formatRating(rating) {
  return rating === null ? "Sem nota" : `${rating.toFixed(1).replace(".", ",")} / 10`;
}

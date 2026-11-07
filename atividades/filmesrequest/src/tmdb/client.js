import axios from "axios";
import { TMDB_API_KEY, TMDB_API_URL } from "./defaults.js";
import { encodeQueryString } from "./queryString.js";
import { normalizeDetails, normalizeSearch } from "./movies.js";

export const SEARCH_ERROR = "Não foi possível buscar os filmes. Verifique sua conexão e tente novamente.";
export const DETAILS_ERROR = "Não foi possível carregar os detalhes. Verifique sua conexão e tente novamente.";
export const CONFIG_ERROR = "A busca de filmes ainda não foi configurada. Consulte as instruções de instalação.";

/** @param {{ apiKey?: string, apiUrl?: string, fetchImpl?: typeof fetch, axiosClient?: Pick<typeof axios, 'get'>, timeoutMs?: number }} [options] */
export function createMovieApi({
  apiKey = TMDB_API_KEY,
  apiUrl = TMDB_API_URL,
  fetchImpl = globalThis.fetch,
  axiosClient = axios,
  timeoutMs = 12000,
} = {}) {
  async function request(path, params, useAxios, message, signal) {
    if (!apiKey.trim()) throw new Error(CONFIG_ERROR);
    const controller = new AbortController();
    const cancel = () => controller.abort();
    signal?.addEventListener("abort", cancel, { once: true });
    if (signal?.aborted) controller.abort();
    const timer = setTimeout(cancel, timeoutMs);
    const values = { api_key: apiKey, language: "pt-BR", ...params };
    try {
      if (useAxios) {
        const response = await axiosClient.get(`${apiUrl}${path}`, {
          params: values,
          signal: controller.signal,
          timeout: timeoutMs,
        });
        if (response.status < 200 || response.status >= 300) throw new Error("HTTP inválido");
        return response.data;
      }
      const response = await fetchImpl(`${apiUrl}${path}?${encodeQueryString(values)}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("HTTP inválido");
      return await response.json();
    } catch {
      // Mensagem deliberadamente neutra: erros dos clientes podem conter URL/chave.
      throw new Error(message);
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", cancel);
    }
  }

  /** @param {{ signal?: AbortSignal }} [options] */
  async function search(queryText, useAxios, options = {}) {
    const { signal } = options;
    const query = queryText.trim();
    if (!query) return [];
    const payload = await request("/search/movie", {
      query, page: 1, include_adult: false,
    }, useAxios, SEARCH_ERROR, signal);
    try {
      return normalizeSearch(payload);
    } catch {
      throw new Error(SEARCH_ERROR);
    }
  }

  /** @param {{ signal?: AbortSignal }} [options] */
  async function details(id, useAxios, options = {}) {
    const { signal } = options;
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error(DETAILS_ERROR);
    const payload = await request(`/movie/${id}`, {}, useAxios, DETAILS_ERROR, signal);
    try {
      return normalizeDetails(payload);
    } catch {
      throw new Error(DETAILS_ERROR);
    }
  }

  return { search, details };
}

export const movieApi = createMovieApi();

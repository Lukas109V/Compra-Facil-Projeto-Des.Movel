import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CONFIG_ERROR,
  DETAILS_ERROR,
  SEARCH_ERROR,
  createMovieApi,
} from "../src/tmdb/client.js";
import {
  formatRating,
  formatReleaseDate,
  releaseYear,
} from "../src/tmdb/movies.js";

// Dados sintéticos de teste. Nenhuma chamada HTTP real nem chave de serviço.
const fixture = JSON.parse(await readFile(new URL("./fixtures/movies.json", import.meta.url), "utf8"));
const detailsFixture = {
  id: 2,
  title: "Filme sem poster",
  release_date: "2020-01-01",
  vote_average: 0,
  poster_path: null,
  overview: "Uma sinopse para conferir o detalhe retornado pelo serviço.",
  runtime: 123,
  genres: [{ id: 1, name: "Drama" }, { id: 2, name: "Aventura" }],
};
const baseOptions = { apiKey: "unit-test-key", apiUrl: "https://unit.test/3", timeoutMs: 100 };

function fetchResponse(payload, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => payload };
}

function abortable(signal, onAbort) {
  return new Promise((resolve, reject) => {
    const fail = () => {
      onAbort();
      reject(new Error("cancelamento simulado"));
    };
    if (signal.aborted) fail();
    else signal.addEventListener("abort", fail, { once: true });
  });
}

for (const mode of ["fetch", "axios"]) {
  const useAxios = mode === "axios";

  test(`${mode}: busca e detalhes fazem consultas próprias com o mesmo cliente`, async () => {
    const calls = [];
    const unexpectedClient = async () => assert.fail("O cliente HTTP não selecionado foi chamado");
    const request = async (url, options) => {
      const parsed = new URL(url);
      const params = useAxios ? options.params : Object.fromEntries(parsed.searchParams);
      calls.push({ path: parsed.pathname, params, signal: options.signal });
      const payload = parsed.pathname.endsWith("/search/movie") ? fixture : detailsFixture;
      return useAxios ? { status: 200, data: payload } : fetchResponse(payload);
    };
    const api = createMovieApi({
      ...baseOptions,
      fetchImpl: useAxios ? unexpectedClient : request,
      axiosClient: { get: useAxios ? request : unexpectedClient },
    });

    const movies = await api.search("  Ação & aventura  ", useAxios);
    assert.equal(movies.length, 5);
    assert.deepEqual(movies.map((movie) => movie.id), [2, 6, 3, 4, 5]);
    assert.deepEqual(fixture.results.map((movie) => movie.id), [1, 2, 3, 4, 5, 6], "A ordenação não altera o payload recebido");
    assert.equal(movies[0].voteAverage, 0);
    assert.equal(movies[0].posterUrl, null);
    assert.equal(movies[0].releaseDate, "2020-01-01");
    assert.equal(movies[2].posterUrl, "https://image.tmdb.org/t/p/w342/three.jpg");
    assert.equal(calls[0].path, "/3/search/movie");
    assert.equal(calls[0].params.query, "Ação & aventura");
    assert.equal(calls[0].params.language, "pt-BR");
    assert.equal(String(calls[0].params.include_adult), "false");
    assert.equal(String(calls[0].params.page), "1");
    assert.ok(calls[0].signal instanceof AbortSignal);

    const details = await api.details(movies[0].id, useAxios);
    assert.equal(calls.length, 2, "Abrir detalhes exige uma nova consulta");
    assert.equal(calls[1].path, "/3/movie/2");
    assert.equal(calls[1].params.query, undefined);
    assert.equal(details.overview, detailsFixture.overview);
    assert.equal(details.runtime, 123);
    assert.deepEqual(details.genres, ["Drama", "Aventura"]);
    assert.equal(details.releaseDate, "2020-01-01");
  });

  test(`${mode}: busca vazia é resultado válido, distinto de uma falha`, async () => {
    let count = 0;
    const request = async () => {
      count += 1;
      return useAxios ? { status: 200, data: { results: [] } } : fetchResponse({ results: [] });
    };
    const api = createMovieApi({ ...baseOptions, fetchImpl: request, axiosClient: { get: request } });
    assert.deepEqual(await api.search("não existe", useAxios), []);
    assert.equal(count, 1);
    assert.deepEqual(await api.search("   ", useAxios), []);
    assert.equal(count, 1, "Termo em branco não consulta o serviço");
  });

  test(`${mode}: falha HTTP ou de rede produz erro público, sem dados do cliente`, async () => {
    for (const operation of ["search", "details"]) {
      for (const failure of ["http", "network"]) {
        const request = async () => {
          if (failure === "network") throw new Error("Falha com unit-test-key na configuração interna");
          return useAxios ? { status: 401, data: {} } : fetchResponse({}, 401);
        };
        const api = createMovieApi({ ...baseOptions, fetchImpl: request, axiosClient: { get: request } });
        const promise = operation === "search" ? api.search("teste", useAxios) : api.details(2, useAxios);
        await assert.rejects(promise, (error) => {
          assert.equal(error.message, operation === "search" ? SEARCH_ERROR : DETAILS_ERROR);
          assert.ok(!error.message.includes(baseOptions.apiKey));
          return true;
        });
      }
    }
  });

  test(`${mode}: JSON inválido ou contrato sem dados válidos não vira lista vazia`, async () => {
    for (const operation of ["search", "details"]) {
      for (const payload of [null, "resposta que não é JSON", { results: [{}] }]) {
        const api = createMovieApi({
          ...baseOptions,
          fetchImpl: async () => fetchResponse(payload),
          axiosClient: { get: async () => ({ status: 200, data: payload }) },
        });
        await assert.rejects(
          operation === "search" ? api.search("teste", useAxios) : api.details(2, useAxios),
          { message: operation === "search" ? SEARCH_ERROR : DETAILS_ERROR },
        );
      }
    }
  });

  test(`${mode}: prazo cancela a consulta e permite uma nova busca`, async () => {
    let aborted = false;
    let count = 0;
    const request = async (url, { signal }) => {
      count += 1;
      if (count === 1) return abortable(signal, () => { aborted = true; });
      return useAxios ? { status: 200, data: { results: [] } } : fetchResponse({ results: [] });
    };
    const api = createMovieApi({ ...baseOptions, timeoutMs: 15, fetchImpl: request, axiosClient: { get: request } });
    await assert.rejects(api.search("teste", useAxios), { message: SEARCH_ERROR });
    assert.equal(aborted, true);
    assert.deepEqual(await api.search("outra busca", useAxios), []);
    assert.equal(count, 2);
  });

  test(`${mode}: cancelamento externo é propagado à busca e aos detalhes`, async () => {
    for (const operation of ["search", "details"]) {
      for (const alreadyAborted of [false, true]) {
        let aborted = false;
        const controller = new AbortController();
        if (alreadyAborted) controller.abort();
        const request = (url, { signal }) => abortable(signal, () => { aborted = true; });
        const api = createMovieApi({ ...baseOptions, fetchImpl: request, axiosClient: { get: request } });
        const promise = operation === "search"
          ? api.search("teste", useAxios, { signal: controller.signal })
          : api.details(2, useAxios, { signal: controller.signal });
        const rejected = assert.rejects(promise, { message: operation === "search" ? SEARCH_ERROR : DETAILS_ERROR });
        if (!alreadyAborted) controller.abort();
        await rejected;
        assert.equal(aborted, true);
      }
    }
  });

  test(`${mode}: configuração ausente e ID inválido não iniciam chamadas`, async () => {
    const request = async () => assert.fail("Não deveria iniciar requisição");
    const unconfigured = createMovieApi({ apiKey: "  ", fetchImpl: request, axiosClient: { get: request } });
    await assert.rejects(unconfigured.search("teste", useAxios), { message: CONFIG_ERROR });
    await assert.rejects(unconfigured.details(2, useAxios), { message: CONFIG_ERROR });
    const api = createMovieApi({ ...baseOptions, fetchImpl: request, axiosClient: { get: request } });
    for (const id of [0, -1, NaN, Infinity, "2", 1.5]) {
      await assert.rejects(api.details(id, useAxios), { message: DETAILS_ERROR });
    }
  });
}

test("fetch: falha na conversão do corpo JSON é reportada como erro de busca", async () => {
  const api = createMovieApi({
    ...baseOptions,
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError("JSON inválido"); } }),
  });
  await assert.rejects(api.search("teste", false), { message: SEARCH_ERROR });
});

test("a escolha do cliente também governa uma nova consulta de detalhes", async () => {
  const calls = [];
  const api = createMovieApi({
    ...baseOptions,
    fetchImpl: async () => { calls.push("fetch"); return fetchResponse(fixture); },
    axiosClient: { get: async (url) => {
      calls.push("axios");
      assert.equal(new URL(url).pathname, "/3/movie/2");
      return { status: 200, data: detailsFixture };
    } },
  });
  await api.search("teste", false);
  await api.details(2, true);
  assert.deepEqual(calls, ["fetch", "axios"]);
});

test("ano/data não sofrem conversão de fuso; nota zero permanece visível", () => {
  assert.equal(releaseYear("2020-01-01"), "2020");
  assert.equal(formatReleaseDate("2020-01-01"), "01/01/2020");
  assert.equal(releaseYear(""), "Ano não informado");
  assert.equal(formatReleaseDate(""), "Data não informada");
  assert.equal(formatRating(0), "0,0 / 10");
  assert.equal(formatRating(null), "Sem nota");
});

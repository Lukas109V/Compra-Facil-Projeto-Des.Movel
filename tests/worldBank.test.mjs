import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getBrazilImcStatistics, parseWorldBankStatistics } from "../src/services/worldBank.js";

const fixture = JSON.parse(await readFile(new URL("./fixtures/worldBank-bra-2022.json", import.meta.url), "utf8"));
const expected = {
  year: 2022,
  female: { overweight: 64.38, obesity: 31.88 },
  male: { overweight: 61.42, obesity: 24.16 },
};

test("interpreta a resposta real por código, mesmo com observações fora de ordem", () => {
  const payload = structuredClone(fixture);
  payload[1].reverse();
  assert.deepEqual(parseWorldBankStatistics(payload), expected);
});

test("rejeita dados ausentes, não numéricos, duplicados e de outro país ou ano", () => {
  const invalid = [null, [{ message: [{ id: "120", value: "Invalid value" }] }], [fixture[0], null]];
  for (const value of [null, "64.38", NaN, Infinity, -1, 101]) {
    const payload = structuredClone(fixture);
    payload[1][0].value = value;
    invalid.push(payload);
  }
  for (const [key, value] of [["date", "2021"], ["countryiso3code", "ARG"]]) {
    const payload = structuredClone(fixture);
    payload[1][0][key] = value;
    invalid.push(payload);
  }
  const missing = structuredClone(fixture);
  missing[1].pop();
  invalid.push(missing);
  const duplicate = structuredClone(fixture);
  duplicate[1].push(duplicate[1][0]);
  invalid.push(duplicate);
  const inconsistent = structuredClone(fixture);
  inconsistent[1][2].value = 80;
  invalid.push(inconsistent);
  for (const payload of invalid) assert.throws(() => parseWorldBankStatistics(payload));
});

test("consulta os quatro indicadores do Brasil no mesmo ano usando fetch", async (t) => {
  t.mock.method(globalThis, "fetch", async (input, options) => {
    const url = new URL(input);
    assert.equal(url.origin, "https://api.worldbank.org");
    assert.equal(url.pathname, "/v2/country/BRA/indicator/SH.STA.OWAD.FE.ZS;SH.STA.OWAD.MA.ZS;SH.STA.OB18.FE.ZS;SH.STA.OB18.MA.ZS");
    assert.equal(url.searchParams.get("source"), "14");
    assert.equal(url.searchParams.get("date"), "2022");
    assert.equal(url.searchParams.get("format"), "json");
    assert.ok(options.signal instanceof AbortSignal);
    return new Response(JSON.stringify(fixture), { status: 200 });
  });
  assert.deepEqual(await getBrazilImcStatistics(), expected);
});

test("sinaliza erro HTTP, rede ou JSON inválido em vez de produzir percentuais", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch");
  for (const response of [new Response("indisponivel", { status: 503 }), new Response("nao e JSON", { status: 200 })]) {
    fetchMock.mock.mockImplementation(async () => response);
    await assert.rejects(getBrazilImcStatistics(), /World Bank/);
  }
  fetchMock.mock.mockImplementation(async () => { throw new TypeError("Failed to fetch"); });
  await assert.rejects(getBrazilImcStatistics(), /World Bank/);
});

test("interrompe uma consulta lenta após o prazo", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  t.mock.method(globalThis, "fetch", (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
  }));
  const request = getBrazilImcStatistics();
  const rejected = assert.rejects(request, /demorou/);
  t.mock.timers.tick(12000);
  await rejected;
});

test("respeita cancelamento ao sair da tela ou mudar o cálculo", async (t) => {
  t.mock.method(globalThis, "fetch", (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
  }));
  const controller = new AbortController();
  const request = getBrazilImcStatistics({ signal: controller.signal });
  const rejected = assert.rejects(request, { name: "AbortError" });
  controller.abort();
  await rejected;
});

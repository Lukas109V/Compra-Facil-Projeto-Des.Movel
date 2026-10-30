const YEAR = 2022;
const INDICATORS = [
  "SH.STA.OWAD.FE.ZS", "SH.STA.OWAD.MA.ZS",
  "SH.STA.OB18.FE.ZS", "SH.STA.OB18.MA.ZS",
];
const URL = `https://api.worldbank.org/v2/country/BRA/indicator/${INDICATORS.join(";")}?format=json&source=14&date=${YEAR}&per_page=100`;

export function parseWorldBankStatistics(payload) {
  const observations = Array.isArray(payload) ? payload[1] : null;
  const invalid = () => new Error(`O World Bank não retornou os quatro indicadores válidos do Brasil para ${YEAR}. Tente novamente mais tarde.`);
  if (!Array.isArray(observations)) throw invalid();

  function rate(code) {
    const matches = observations.filter((row) => row?.indicator?.id === code);
    const row = matches[0];
    if (matches.length !== 1 || row.countryiso3code !== "BRA" || row.date !== String(YEAR)
      || typeof row.value !== "number" || !Number.isFinite(row.value) || row.value < 0 || row.value > 100) {
      throw invalid();
    }
    return row.value;
  }
  const female = { overweight: rate(INDICATORS[0]), obesity: rate(INDICATORS[2]) };
  const male = { overweight: rate(INDICATORS[1]), obesity: rate(INDICATORS[3]) };
  if (female.obesity > female.overweight || male.obesity > male.overweight) throw invalid();
  return { year: YEAR, female, male };
}

/** @param {{ signal?: AbortSignal }} [options] */
export async function getBrazilImcStatistics({ signal } = {}) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener("abort", cancel, { once: true });
  if (signal?.aborted) controller.abort();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 12000);
  try {
    const response = await fetch(URL, { signal: controller.signal });
    if (!response.ok) throw new Error(`O World Bank respondeu com erro HTTP ${response.status}. Tente novamente mais tarde.`);
    return parseWorldBankStatistics(await response.json());
  } catch (failure) {
    if (signal?.aborted) throw failure;
    if (timedOut) throw new Error("O World Bank demorou para responder. Tente consultar novamente.");
    if (failure?.message?.startsWith("O World Bank")) throw failure;
    throw new Error("Não foi possível consultar o World Bank. Verifique sua conexão e tente novamente.");
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", cancel);
  }
}

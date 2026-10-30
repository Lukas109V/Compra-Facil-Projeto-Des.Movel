export function getImcClassification(value) {
  if (!Number.isFinite(value) || value <= 0) throw new Error("IMC inválido.");
  if (value < 18.5) return "Baixo peso";
  if (value < 25) return "Faixa normal";
  if (value < 30) return "Sobrepeso";
  return "Obesidade";
}

export function compareImcWithPopulation(value, rates) {
  const classification = getImcClassification(value);
  const { overweight, obesity } = rates;
  if (![overweight, obesity].every(Number.isFinite) || obesity < 0 || obesity > overweight || overweight > 100) {
    throw new Error("Percentuais inválidos para comparação.");
  }
  if (value >= 30) {
    return { classification, group: "com obesidade (IMC ≥ 30)", percentage: obesity, includesUnderweight: false };
  }
  if (value >= 25) {
    return {
      classification,
      group: "com sobrepeso sem obesidade (25 ≤ IMC < 30)",
      percentage: Number((overweight - obesity).toFixed(2)),
      includesUnderweight: false,
    };
  }
  // O complemento também inclui baixo peso; a API não isola a faixa normal.
  return {
    classification,
    group: "com IMC abaixo de 25",
    percentage: Number((100 - overweight).toFixed(2)),
    includesUnderweight: true,
  };
}

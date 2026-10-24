function decimal(value) {
  const text = String(value).trim();
  return /^(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(text)
    ? Number(text.replace(",", "."))
    : NaN;
}

export function calculateImc(weightInput, heightInput) {
  const weight = decimal(weightInput);
  const height = decimal(heightInput);
  if (!Number.isFinite(weight) || weight <= 0 || weight > 1000) {
    return { error: "Informe um peso maior que zero e de até 1000 kg." };
  }
  if (!Number.isFinite(height) || height <= 0 || height > 3) {
    return { error: "Informe uma altura maior que zero e de até 3 metros. Ex.: 1,75." };
  }
  const value = Number((weight / height ** 2).toFixed(2));
  if (!Number.isFinite(value) || value <= 0) {
    return { error: "Confira o peso e a altura informados." };
  }
  return { value: { weight, height, value } };
}

export const formatImc = (value) => value.toFixed(2).replace(".", ",");

export function formatImcDate(date) {
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

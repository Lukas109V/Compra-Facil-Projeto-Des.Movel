import test from "node:test";
import assert from "node:assert/strict";
import { compareImcWithPopulation, getImcClassification } from "../src/utils/imcPopulation.js";

test("classifica os limites de IMC sem confundir sobrepeso e obesidade", () => {
  for (const [value, expected] of [
    [18.49, "Baixo peso"], [18.4975, "Baixo peso"], [18.5, "Faixa normal"],
    [24.99, "Faixa normal"], [24.9975, "Faixa normal"], [25, "Sobrepeso"],
    [29.99, "Sobrepeso"], [29.9975, "Sobrepeso"], [30, "Obesidade"], [40, "Obesidade"],
  ]) {
    assert.equal(getImcClassification(value), expected, `IMC ${value}`);
  }
  for (const value of [0, -1, NaN, Infinity]) {
    assert.throws(() => getImcClassification(value));
  }
});

test("obtém parcelas que somam 100%, sem subtrair obesidade duas vezes", () => {
  const female = { overweight: 64.38, obesity: 31.88 };
  const male = { overweight: 61.42, obesity: 24.16 };
  assert.equal(compareImcWithPopulation(22.86, female)?.percentage, 35.62);
  assert.equal(compareImcWithPopulation(25, female)?.percentage, 32.5);
  assert.equal(compareImcWithPopulation(30, female)?.percentage, 31.88);
  assert.equal(compareImcWithPopulation(22.86, male)?.percentage, 38.58);
  assert.equal(compareImcWithPopulation(25, male)?.percentage, 37.26);
  assert.equal(compareImcWithPopulation(30, male)?.percentage, 24.16);
});

test("identifica o complemento como grupo abaixo de 25, incluindo baixo peso", () => {
  const rates = { overweight: 60, obesity: 20 };
  const low = compareImcWithPopulation(17, rates);
  const normal = compareImcWithPopulation(22, rates);
  assert.equal(low?.percentage, 40);
  assert.equal(normal?.percentage, 40);
  assert.equal(low?.includesUnderweight, true);
  assert.equal(normal?.includesUnderweight, true);
  assert.match(normal?.group ?? "", /abaixo de 25/);
  assert.equal(compareImcWithPopulation(25, rates)?.includesUnderweight, false);
});

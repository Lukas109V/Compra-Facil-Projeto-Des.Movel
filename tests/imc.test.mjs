import test from "node:test";
import assert from "node:assert/strict";
import { calculateImc, formatImc, formatImcDate } from "../src/utils/imc.js";

test("calcula o IMC em kg e metros, arredondando para duas casas", () => {
  assert.deepEqual(calculateImc("70", "1.75").value, { weight: 70, height: 1.75, value: 22.86 });
  assert.equal(calculateImc(" 70,5 ", " 1,75 ").value.value, 23.02);
  assert.equal(formatImc(22.86), "22,86");
});

test("rejeita entradas inválidas e altura em centímetros", () => {
  for (const [weight, height] of [
    ["", "1.75"], [" ", "1.75"], ["0", "1.75"], ["-70", "1.75"],
    ["1001", "1.75"], ["70kg", "1.75"], ["Infinity", "1.75"],
    ["0x46", "1.75"], ["7e1", "1.75"], ["70", ""], ["70", "0"],
    ["70", "-1.75"], ["70", "175"], ["70", "1,7.5"], ["70", "abc"],
    ["0.00000001", "3"], ["70", "0." + "0".repeat(170) + "1"],
  ]) {
    assert.ok(calculateImc(weight, height).error, `${weight} / ${height}`);
  }
});

test("formata a data com dia, mês, ano e horário", () => {
  const formatted = formatImcDate(new Date(2026, 9, 23, 20, 45));
  assert.match(formatted, /23\/10\/2026/);
  assert.match(formatted, /20:45/);
});

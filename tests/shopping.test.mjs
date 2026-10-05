import test from "node:test";
import assert from "node:assert/strict";
import { parseItem, totals, updateLists } from "../src/utils/shopping.js";
test("aceita vírgula decimal e rejeita dados inválidos", () => {
  assert.equal(
    parseItem(" Café ", "2", "12,90", "Alimentos").value.price,
    12.9,
  );
  for (const args of [
    ["", "1", "1"],
    ["Arroz", "0", "2"],
    ["Arroz", "abc", "2"],
    ["Arroz", "1", "-1"],
    ["Arroz", "1", ""],
  ])
    assert.ok(parseItem(...args).error);
});
test("fluxo de compra preserva outras listas e recalcula totais", () => {
  let lists = [
    { id: "a", items: [] },
    { id: "b", items: [] },
  ];
  const original = structuredClone(lists);
  lists = updateLists(lists, {
    type: "saveItem",
    listId: "a",
    item: { id: "x", quantity: 2, price: 12.9, done: false },
  });
  assert.deepEqual(original[0].items, []);
  assert.equal(totals(lists[0].items).total, 25.8);
  lists = updateLists(lists, { type: "toggle", listId: "a", itemId: "x" });
  assert.equal(totals(lists[0].items).purchased, 25.8);
  lists = updateLists(lists, {
    type: "saveItem",
    listId: "a",
    item: { id: "x", quantity: 3, price: 10, done: true },
  });
  assert.deepEqual(totals(lists[0].items), {
    total: 30,
    purchased: 30,
    count: 1,
  });
  lists = updateLists(lists, { type: "deleteItem", listId: "a", itemId: "x" });
  assert.equal(totals(lists[0].items).total, 0);
  lists = updateLists(lists, { type: "deleteList", listId: "a" });
  assert.deepEqual(lists, original.slice(1));
});

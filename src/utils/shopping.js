// Funções puras: facilitam explicar e testar as regras sem abrir o aplicativo.
export const money = (value) => `R$ ${value.toFixed(2).replace(".", ",")}`;
export function totals(items) {
  return items.reduce(
    (sum, item) => ({
      total: sum.total + item.quantity * item.price,
      purchased: sum.purchased + (item.done ? item.quantity * item.price : 0),
      count: sum.count + (item.done ? 1 : 0),
    }),
    { total: 0, purchased: 0, count: 0 },
  );
}
export function parseItem(name, quantity, price, category) {
  const q = Number(String(quantity).trim().replace(",", "."));
  const p = Number(String(price).trim().replace(",", "."));
  if (!name.trim()) return { error: "Digite o nome do produto." };
  if (!Number.isFinite(q) || q <= 0 || q > 9999)
    return { error: "Informe uma quantidade maior que zero e de até 9999." };
  if (!String(price).trim() || !Number.isFinite(p) || p < 0 || p > 999999)
    return {
      error: "Informe um preço entre 0 e 999999. Use 0 se ainda não souber.",
    };
  return {
    value: {
      name: name.trim(),
      quantity: q,
      price: Math.round(p * 100) / 100,
      category,
    },
  };
}
export function updateLists(lists, action) {
  switch (action.type) {
    case "addList":
      return [...lists, action.list];
    case "deleteList":
      return lists.filter((list) => list.id !== action.listId);
    case "saveItem":
      return lists.map((list) =>
        list.id !== action.listId
          ? list
          : {
              ...list,
              items: list.items.some((i) => i.id === action.item.id)
                ? list.items.map((i) =>
                    i.id === action.item.id ? action.item : i,
                  )
                : [...list.items, action.item],
            },
      );
    case "toggle":
      return lists.map((list) =>
        list.id !== action.listId
          ? list
          : {
              ...list,
              items: list.items.map((i) =>
                i.id === action.itemId ? { ...i, done: !i.done } : i,
              ),
            },
      );
    case "deleteItem":
      return lists.map((list) =>
        list.id !== action.listId
          ? list
          : {
              ...list,
              items: list.items.filter((i) => i.id !== action.itemId),
            },
      );
    default:
      return lists;
  }
}
export const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

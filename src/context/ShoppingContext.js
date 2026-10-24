import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateLists } from "../utils/shopping";
const Context = createContext(null);
const KEY = "@comprafacil:lists:v1";
const example = [
  {
    id: "example",
    name: "Compras da semana",
    items: [
      {
        id: "rice",
        name: "Arroz",
        quantity: 1,
        price: 24.9,
        category: "Alimentos",
        done: false,
      },
      {
        id: "milk",
        name: "Leite",
        quantity: 2,
        price: 5.5,
        category: "Bebidas",
        done: false,
      },
      {
        id: "soap",
        name: "Sabonete",
        quantity: 3,
        price: 2.9,
        category: "Higiene",
        done: true,
      },
    ],
  },
];
export function ShoppingProvider({ children }) {
  const [lists, setLists] = useState([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const writable = useRef(true);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        const data = raw ? JSON.parse(raw) : example;
        if (
          !Array.isArray(data) ||
          data.some(
            (l) =>
              typeof l.id !== "string" ||
              typeof l.name !== "string" ||
              !Array.isArray(l.items) ||
              l.items.some(
                (i) =>
                  typeof i.name !== "string" ||
                  typeof i.id !== "string" ||
                  !Number.isFinite(i.quantity) ||
                  !Number.isFinite(i.price),
              ),
          )
        )
          throw new Error("Dados inválidos");
        setLists(data);
      } catch {
        writable.current = false;
        setStorageError(
          "Não foi possível carregar os dados. Esta sessão funcionará sem salvar; feche e abra o app para tentar novamente.",
        );
      } finally {
        setReady(true);
      }
    })();
  }, []);
  useEffect(() => {
    if (!ready || !writable.current) return;
    // Serializa gravações para uma alteração antiga não sobrescrever a mais recente.
    writes.current = writes.current
      .then(() => AsyncStorage.setItem(KEY, JSON.stringify(lists)))
      .then(() => setStorageError(""))
      .catch(() =>
        setStorageError(
          "Não foi possível salvar a última alteração no aparelho.",
        ),
      );
  }, [lists, ready]);
  const dispatch = (action) =>
    setLists((previous) => updateLists(previous, action));
  return (
    <Context.Provider value={{ lists, dispatch, ready, storageError }}>
      {children}
    </Context.Provider>
  );
}
export const useShopping = () => useContext(Context);

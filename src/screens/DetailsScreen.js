import React, { useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Page, Button, Empty } from "../components/UI";
import { styles as s, colors } from "../theme";
import { useShopping } from "../context/ShoppingContext";
import { totals, money } from "../utils/shopping";
export default function DetailsScreen() {
  const { lists, dispatch } = useShopping();
  const { listId } = useLocalSearchParams();
  const [filter, setFilter] = useState("Todos");
  const [deleting, setDeleting] = useState(false);
  const list = lists.find((l) => l.id === listId);
  if (!list)
    return (
      <Page>
        <Empty
          title="Lista indisponível"
          description="Volte para suas listas."
        />
        <Button
          title="Minhas listas"
          onPress={() => router.replace("/listas")}
        />
      </Page>
    );
  const summary = totals(list.items);
  const shown = list.items.filter(
    (i) => filter === "Todos" || (filter === "Pendentes" ? !i.done : i.done),
  );
  function remove() {
    setDeleting(false);
    dispatch({ type: "deleteList", listId });
    router.dismissTo("/listas");
  }
  return (
    <Page>
      <Text style={s.title}>{list.name}</Text>
      <View style={s.card}>
        <Text style={s.eyebrow}>TOTAL ESTIMADO</Text>
        <Text style={s.title}>{money(summary.total)}</Text>
        <Text style={s.subtitle}>Comprado: {money(summary.purchased)}</Text>
        <Text style={s.text}>
          {summary.count} de {list.items.length} produtos concluídos
        </Text>
        <View
          style={{ height: 8, backgroundColor: "#E5ECE6", borderRadius: 4 }}
        >
          <View
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.primary,
              width: `${list.items.length ? (summary.count / list.items.length) * 100 : 0}%`,
            }}
          />
        </View>
      </View>
      <Button
        title="+ Adicionar produto"
        onPress={() => router.push({ pathname: "/produto", params: { listId } })}
      />
      <View style={[s.row, { flexWrap: "wrap" }]}>
        {["Todos", "Pendentes", "Comprados"].map((f) => (
          <Pressable
            key={f}
            accessibilityRole="button"
            accessibilityState={{ selected: f === filter }}
            onPress={() => setFilter(f)}
            style={{
              padding: 12,
              borderRadius: 20,
              backgroundColor: f === filter ? colors.primary : "#E5ECE6",
            }}
          >
            <Text
              style={{
                color: f === filter ? "white" : colors.ink,
                fontWeight: "600",
              }}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </View>
      {shown.length === 0 && (
        <Empty
          title={
            list.items.length
              ? "Nenhum produto neste filtro"
              : "A lista está vazia"
          }
          description={
            list.items.length
              ? "Escolha outro filtro para ver os demais produtos."
              : "Adicione um produto para começar."
          }
        />
      )}
      {shown.map((item) => (
        <View style={s.card} key={item.id}>
          <View style={s.row}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel={`Marcar ${item.name} como ${item.done ? "pendente" : "comprado"}`}
              accessibilityState={{ checked: item.done }}
              onPress={() =>
                dispatch({ type: "toggle", listId, itemId: item.id })
              }
              style={{
                minWidth: 48,
                minHeight: 48,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: colors.primary,
                borderRadius: 12,
                backgroundColor: item.done ? colors.primary : "white",
              }}
            >
              <Text style={{ color: "white", fontSize: 24 }}>
                {item.done ? "✓" : ""}
              </Text>
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  s.heading,
                  item.done && {
                    textDecorationLine: "line-through",
                    color: colors.muted,
                  },
                ]}
              >
                {item.name}
              </Text>
              <Text style={s.subtitle}>
                {item.category} • {item.quantity} × {money(item.price)}
              </Text>
              <Text style={s.text}>{money(item.quantity * item.price)}</Text>
            </View>
          </View>
          <Button
            title={`Editar ${item.name}`}
            secondary
            onPress={() =>
              router.push({ pathname: "/produto", params: { listId, itemId: item.id } })
            }
          />
        </View>
      ))}
      <Button
        title="Excluir lista"
        secondary
        danger
        onPress={() => setDeleting(true)}
      />
      <Modal
        visible={deleting}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleting(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#0008",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View style={s.card}>
            <Text style={s.heading}>Excluir esta lista?</Text>
            <Text style={s.text}>
              Os produtos desta lista também serão removidos.
            </Text>
            <Button title="Sim, excluir lista" danger onPress={remove} />
            <Button
              title="Cancelar"
              secondary
              onPress={() => setDeleting(false)}
            />
          </View>
        </View>
      </Modal>
    </Page>
  );
}

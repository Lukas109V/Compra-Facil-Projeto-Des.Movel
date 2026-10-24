import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Page, Button, Field } from "../components/UI";
import { styles as s, colors } from "../theme";
import { useShopping } from "../context/ShoppingContext";
import { makeId, parseItem } from "../utils/shopping";
export default function ItemScreen() {
  const { listId, itemId } = useLocalSearchParams();
  const { lists, dispatch } = useShopping();
  const existing = lists
    .find((l) => l.id === listId)
    ?.items.find((i) => i.id === itemId);
  const [name, setName] = useState(existing?.name || "");
  const [quantity, setQuantity] = useState(String(existing?.quantity ?? 1));
  const [price, setPrice] = useState(String(existing?.price ?? ""));
  const [category, setCategory] = useState(existing?.category || "Alimentos");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  function save() {
    const result = parseItem(name, quantity, price, category);
    if (result.error) {
      setError(result.error);
      return;
    }
    dispatch({
      type: "saveItem",
      listId,
      item: {
        ...result.value,
        id: itemId || makeId(),
        done: existing?.done || false,
      },
    });
    router.back();
  }
  return (
    <Page>
      <Text style={s.title}>
        {existing ? "Editar produto" : "Novo produto"}
      </Text>
      <Field
        label="Nome do produto"
        placeholder="Ex.: Café"
        value={name}
        onChangeText={setName}
        maxLength={60}
      />
      <Field
        label="Quantidade"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="decimal-pad"
        maxLength={10}
      />
      <Field
        label="Preço por unidade (R$)"
        placeholder="Ex.: 12,90"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        maxLength={12}
      />
      <Text style={s.subtitle}>
        Não sabe o preço? Informe 0 e atualize depois. Para itens por peso, use
        a quantidade em kg e o preço por kg.
      </Text>
      <Text style={s.label}>Categoria</Text>
      <View style={[s.row, { flexWrap: "wrap" }]}>
        {["Alimentos", "Bebidas", "Higiene", "Limpeza", "Outros"].map((c) => (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: c === category }}
            key={c}
            onPress={() => setCategory(c)}
            style={{
              padding: 13,
              borderRadius: 12,
              backgroundColor: c === category ? colors.primary : "#E5ECE6",
            }}
          >
            <Text style={{ color: c === category ? "white" : colors.ink }}>
              {c}
            </Text>
          </Pressable>
        ))}
      </View>
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      <Button title="Salvar produto" onPress={save} />
      <Button title="Cancelar" secondary onPress={() => router.back()} />
      {!!existing && (
        <Button
          title="Excluir produto"
          secondary
          danger
          onPress={() => setConfirm(true)}
        />
      )}
      {confirm && (
        <View style={s.card}>
          <Text style={s.text}>Excluir {existing.name}?</Text>
          <Button
            title="Confirmar exclusão"
            danger
            onPress={() => {
              dispatch({ type: "deleteItem", listId, itemId });
              router.back();
            }}
          />
          <Button
            title="Manter produto"
            secondary
            onPress={() => setConfirm(false)}
          />
        </View>
      )}
    </Page>
  );
}

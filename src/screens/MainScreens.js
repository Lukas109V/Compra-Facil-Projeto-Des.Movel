import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Page, Button, Field, Empty } from "../components/UI";
import { styles as s } from "../theme";
import { useShopping } from "../context/ShoppingContext";
import { totals, money, makeId } from "../utils/shopping";
export function HomeScreen() {
  const { lists } = useShopping();
  const pending = lists.flatMap((l) => l.items).filter((i) => !i.done).length;
  return (
    <Page>
      <Text style={s.eyebrow}>MENOS ESQUECIMENTOS, MAIS ORGANIZAÇÃO</Text>
      <Text style={s.title}>Sua próxima compra começa aqui.</Text>
      <Text style={s.subtitle}>
        Organize os produtos e acompanhe cada item da sua lista.
      </Text>
      <View style={[s.card, { backgroundColor: "#176B50" }]}>
        <Text style={{ fontSize: 40, color: "white", fontWeight: "800" }}>
          {pending}
        </Text>
        <Text style={{ color: "#E1F3E8", fontSize: 17 }}>
          produtos ainda para comprar
        </Text>
        <Text style={{ color: "#E1F3E8" }}>
          {lists.length} lista(s) cadastrada(s)
        </Text>
      </View>
      <Button
        title="Ver minhas listas"
        onPress={() => router.push("/listas")}
      />
      <Button
        title="Criar nova lista"
        secondary
        onPress={() => router.push("/nova-lista")}
      />
      <View style={s.card}>
        <Text style={s.heading}>Calculadora de IMC</Text>
        <Text style={s.subtitle}>Calcule seu IMC e acompanhe os valores registrados por data.</Text>
        <Button title="Calcular IMC" onPress={() => router.push("/imc")} />
        <Button title="Histórico de IMC" secondary onPress={() => router.push("/imc/historico")} />
      </View>
      <View style={s.card}>
        <Text style={s.heading}>Do planejamento ao carrinho</Text>
        <Text style={s.subtitle}>1. Crie uma lista para cada compra.</Text>
        <Text style={s.subtitle}>
          2. Informe produtos, quantidades e preços.
        </Text>
        <Text style={s.subtitle}>3. Marque os itens conforme comprar.</Text>
      </View>
      <Button
        title="Sobre o aplicativo"
        secondary
        onPress={() => router.push("/sobre")}
      />
    </Page>
  );
}
export function ListsScreen() {
  const { lists } = useShopping();
  return (
    <Page>
      <Text style={s.title}>Minhas listas</Text>
      <Text style={s.subtitle}>Cada compra no seu lugar.</Text>
      <Button
        title="+ Nova lista"
        onPress={() => router.push("/nova-lista")}
      />
      {lists.length === 0 && (
        <Empty
          title="Sua primeira lista"
          description="Toque em Nova lista para começar a organizar suas compras."
        />
      )}
      {lists.map((list) => {
        const total = totals(list.items);
        return (
          <Pressable
            key={list.id}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${list.name}`}
            onPress={() => router.push({ pathname: "/detalhes", params: { listId: list.id } })}
            style={s.card}
          >
            <Text style={s.heading}>{list.name}</Text>
            <Text style={s.subtitle}>
              {total.count} de {list.items.length} produtos comprados
            </Text>
            <Text style={s.text}>Estimativa: {money(total.total)}</Text>
            <Text style={{ color: "#176B50", fontWeight: "700" }}>
              Abrir lista →
            </Text>
          </Pressable>
        );
      })}
    </Page>
  );
}
export function NewListScreen() {
  const { dispatch } = useShopping();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  function save() {
    if (!name.trim()) {
      setError("Digite um nome para a lista.");
      return;
    }
    const id = makeId();
    dispatch({ type: "addList", list: { id, name: name.trim(), items: [] } });
    router.replace({ pathname: "/detalhes", params: { listId: id } });
  }
  return (
    <Page>
      <Text style={s.title}>Uma nova compra</Text>
      <Text style={s.subtitle}>Escolha um nome fácil de reconhecer.</Text>
      <Field
        label="Nome da lista"
        placeholder="Ex.: Mercado do mês"
        value={name}
        onChangeText={setName}
        maxLength={60}
        autoCapitalize="sentences"
        onSubmitEditing={save}
      />
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      <Button title="Criar lista" onPress={save} />
      <Button title="Cancelar" secondary onPress={() => router.back()} />
    </Page>
  );
}
export function AboutScreen() {
  return (
    <Page>
      <Text style={s.eyebrow}>PROJETO ACADÊMICO</Text>
      <Text style={s.title}>CompraFácil</Text>
      <Text style={s.subtitle}>
        Uma forma simples de planejar as compras e acompanhar o que falta no
        carrinho.
      </Text>
      <View style={s.card}>
        <Text style={s.heading}>Integrantes</Text>
        <Text style={s.text}>Lucas Gabriel Gomes Martins</Text>
        <Text style={s.text}>Gabriel de Carvalho Souza</Text>
      </View>
      <View style={s.card}>
        <Text style={s.heading}>Como funciona</Text>
        <Text style={s.text}>
          Crie listas, organize produtos por categoria, registre quantidades e
          preços e marque o que já comprou.
        </Text>
      </View>
      <View style={s.card}>
        <Text style={s.heading}>Seus dados</Text>
        <Text style={s.text}>
          As listas ficam salvas neste dispositivo. Os cálculos de IMC ficam no
          Firebase, com data e hora, vinculados a uma identificação anônima
          persistida no aparelho. Você pode excluir registros no histórico.
          Limpar os dados do aplicativo remove as listas e a identificação que
          dá acesso ao seu histórico de IMC.
        </Text>
      </View>
      <Text style={s.subtitle}>
        Os valores são estimativas informadas por você. O aplicativo não
        consulta preços de lojas.
      </Text>
    </Page>
  );
}

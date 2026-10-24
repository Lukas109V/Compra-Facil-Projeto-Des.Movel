import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ShoppingProvider, useShopping } from "../context/ShoppingContext";
import { ImcProvider } from "../context/ImcContext";
import { colors } from "../theme";

export const unstable_settings = { initialRouteName: "index" };

function Routes() {
  const { ready, storageError } = useShopping();
  if (!ready) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text>Carregando suas listas…</Text>
  </View>;

  return <SafeAreaView edges={["bottom", "left", "right"]} style={{ flex: 1, backgroundColor: colors.background }}>
    {!!storageError && <SafeAreaView edges={["top"]}>
      <Text accessibilityRole="alert" style={{ padding: 12, color: colors.danger }}>{storageError}</Text>
    </SafeAreaView>}
    <Stack screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.primary,
      headerShadowVisible: false,
      contentStyle: { backgroundColor: colors.background },
    }}>
      <Stack.Screen name="index" options={{ title: "CompraFácil" }} />
      <Stack.Screen name="listas" options={{ title: "Minhas listas" }} />
      <Stack.Screen name="nova-lista" options={{ title: "Nova lista" }} />
      <Stack.Screen name="detalhes" options={{ title: "Minha compra" }} />
      <Stack.Screen name="produto" options={{ title: "Produto" }} />
      <Stack.Screen name="sobre" options={{ title: "Sobre" }} />
      <Stack.Screen name="imc/index" options={{ title: "Calculadora de IMC" }} />
      <Stack.Screen name="imc/historico" options={{ title: "Histórico de IMC" }} />
    </Stack>
  </SafeAreaView>;
}

export default function RootLayout() {
  return <SafeAreaProvider>
    <ShoppingProvider>
      <ImcProvider>
        <StatusBar style="dark" />
        <Routes />
      </ImcProvider>
    </ShoppingProvider>
  </SafeAreaProvider>;
}

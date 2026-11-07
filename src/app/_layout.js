import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ShoppingProvider, useShopping } from "../context/ShoppingContext";
import { ImcProvider } from "../context/ImcContext";
import { colors } from "../theme";

export const unstable_settings = { initialRouteName: "(drawer)" };

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
      <Stack.Screen name="(drawer)" options={{ headerShown: false, title: "CompraFácil" }} />
      <Stack.Screen name="nova-lista" options={{ title: "Nova lista" }} />
      <Stack.Screen name="detalhes" options={{ title: "Minha compra" }} />
      <Stack.Screen name="produto" options={{ title: "Produto" }} />
    </Stack>
  </SafeAreaView>;
}

export default function RootLayout() {
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider>
    <ShoppingProvider>
      <ImcProvider>
        <StatusBar style="dark" />
        <Routes />
      </ImcProvider>
    </ShoppingProvider>
  </SafeAreaProvider></GestureHandlerRootView>;
}

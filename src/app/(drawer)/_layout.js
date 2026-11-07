import React from "react";
import { Drawer, DrawerToggleButton } from "expo-router/drawer";
import { colors } from "../../theme";

export const unstable_settings = { initialRouteName: "index" };

export default function MainDrawer() {
  return <Drawer backBehavior="history" screenOptions={{
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.primary,
    headerShadowVisible: false,
    headerLeft: ({ tintColor }) => <DrawerToggleButton tintColor={tintColor}
      accessibilityLabel="Abrir menu de navegação" />,
    drawerActiveTintColor: colors.primary,
    drawerActiveBackgroundColor: "#EAF0EA",
    drawerInactiveTintColor: colors.ink,
    drawerStyle: { backgroundColor: colors.background },
    sceneStyle: { backgroundColor: colors.background },
  }}>
    <Drawer.Screen name="index" options={{ title: "CompraFácil", drawerLabel: "Início" }} />
    <Drawer.Screen name="listas" options={{ title: "Minhas listas" }} />
    <Drawer.Screen name="imc/index" options={{ title: "Calculadora de IMC", drawerLabel: "Calcular IMC" }} />
    <Drawer.Screen name="imc/historico" options={{ title: "Histórico de IMC" }} />
    <Drawer.Screen name="sobre" options={{ title: "Sobre o aplicativo" }} />
  </Drawer>;
}

import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ShoppingProvider, useShopping } from "./src/context/ShoppingContext";
import {
  HomeScreen,
  ListsScreen,
  NewListScreen,
  AboutScreen,
} from "./src/screens/MainScreens";
import DetailsScreen from "./src/screens/DetailsScreen";
import ItemScreen from "./src/screens/ItemScreen";
import { colors } from "./src/theme";
const Stack = createNativeStackNavigator();
function Routes() {
  const { ready, storageError } = useShopping();
  if (!ready)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Carregando suas listas…</Text>
      </View>
    );
  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      {!!storageError && (
        <SafeAreaView edges={["top"]}>
          <Text
            accessibilityRole="alert"
            style={{ padding: 12, color: colors.danger }}
          >
            {storageError}
          </Text>
        </SafeAreaView>
      )}
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.primary,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "CompraFácil" }}
          />
          <Stack.Screen
            name="Lists"
            component={ListsScreen}
            options={{ title: "Minhas listas" }}
          />
          <Stack.Screen
            name="NewList"
            component={NewListScreen}
            options={{ title: "Nova lista" }}
          />
          <Stack.Screen
            name="Details"
            component={DetailsScreen}
            options={{ title: "Minha compra" }}
          />
          <Stack.Screen
            name="Item"
            component={ItemScreen}
            options={{ title: "Produto" }}
          />
          <Stack.Screen
            name="About"
            component={AboutScreen}
            options={{ title: "Sobre" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <ShoppingProvider>
        <StatusBar style="dark" />
        <Routes />
      </ShoppingProvider>
    </SafeAreaProvider>
  );
}

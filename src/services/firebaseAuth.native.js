import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";

export function createFirebaseAuth(app) {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // Fast Refresh pode reutilizar a instância já inicializada.
    if (error.code === "auth/already-initialized") return getAuth(app);
    throw error;
  }
}

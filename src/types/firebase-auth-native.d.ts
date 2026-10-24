import "firebase/auth";
import type { Persistence } from "firebase/auth";
import type { AsyncStorageStatic } from "@react-native-async-storage/async-storage";

// O SDK exporta esta função no entrypoint React Native, mas a omite no .d.ts web.
// Assinatura conferida em @firebase/auth/dist/rn/src/platform_react_native/persistence/react_native.d.ts.
declare module "firebase/auth" {
  export function getReactNativePersistence(storage: AsyncStorageStatic): Persistence;
}

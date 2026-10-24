import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import { createFirebaseAuth } from "./firebaseAuth";

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(config).every(Boolean);

export function getFirebase() {
  if (!firebaseConfigured) {
    throw new Error("O serviço de histórico ainda não está disponível.");
  }
  const app = getApps().length ? getApp() : initializeApp(config);
  return { auth: createFirebaseAuth(app), db: getFirestore(app) };
}

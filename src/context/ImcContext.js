import React, { createContext, useContext, useEffect, useState } from "react";
import { signInAnonymously } from "firebase/auth";
import { firebaseConfigured, getFirebase } from "../services/firebase";
import { imcErrorMessage } from "../services/imc";

const Context = createContext(null);

export function ImcProvider({ children }) {
  const [user, setUser] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    async function connect() {
      if (!firebaseConfigured) {
        setError("O serviço de histórico ainda não está disponível.");
        return;
      }
      setConnecting(true);
      setError("");
      try {
        const { auth } = getFirebase();
        await auth.authStateReady();
        const current = auth.currentUser || (await signInAnonymously(auth)).user;
        if (active) setUser(current);
      } catch (failure) {
        if (active) setError(imcErrorMessage(failure));
      } finally {
        if (active) setConnecting(false);
      }
    }
    connect();
    return () => { active = false; };
  }, [attempt]);

  return (
    <Context.Provider value={{ user, connecting, error, reconnect: () => setAttempt((n) => n + 1) }}>
      {children}
    </Context.Provider>
  );
}

export const useImc = () => useContext(Context);

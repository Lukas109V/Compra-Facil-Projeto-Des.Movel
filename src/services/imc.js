import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore/lite";
import { getFirebase } from "./firebase";

function recordsFor(uid) {
  const { auth, db } = getFirebase();
  if (!uid || auth.currentUser?.uid !== uid) {
    throw new Error("Não foi possível identificar seu histórico. Tente novamente.");
  }
  return collection(db, "users", uid, "imcRecords");
}

export function createImcRecord(uid, calculation) {
  return { uid, reference: doc(recordsFor(uid)), calculation };
}

export async function saveImcRecord(record) {
  // Um retry usa o mesmo documento, mesmo quando a resposta anterior se perde.
  recordsFor(record.uid);
  await setDoc(record.reference, {
    ...record.calculation,
    calculatedAt: serverTimestamp(),
  });
}

export async function listImcRecords(uid) {
  const snapshot = await getDocs(query(recordsFor(uid), orderBy("calculatedAt", "desc")));
  return snapshot.docs.map((record) => ({
    id: record.id,
    ...record.data(),
    calculatedAt: record.data().calculatedAt.toDate(),
  }));
}

export async function deleteImcRecord(uid, recordId) {
  await deleteDoc(doc(recordsFor(uid), recordId));
}

export function imcErrorMessage(error) {
  switch (error?.code) {
    case "auth/operation-not-allowed":
    case "auth/configuration-not-found":
    case "auth/invalid-api-key":
      return "O serviço de histórico ainda não está disponível. Tente novamente mais tarde.";
    case "permission-denied":
      return "Não foi possível acessar seu histórico. Tente novamente mais tarde.";
    case "unavailable":
    case "auth/network-request-failed":
    case "deadline-exceeded":
      return "Não foi possível conectar. Verifique sua internet e tente novamente.";
    default:
      return "Não foi possível concluir a operação. Tente novamente.";
  }
}

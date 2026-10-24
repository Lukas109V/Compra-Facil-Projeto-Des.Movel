import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { deleteApp, initializeApp } from "firebase/app";
import { deleteUser, getAuth, signInAnonymously } from "firebase/auth";
import {
  collection, deleteDoc, doc, getDoc, getDocs, getFirestore, orderBy,
  query, serverTimestamp, setDoc, Timestamp,
} from "firebase/firestore/lite";
import { calculateImc } from "../src/utils/imc.js";

// Opt-in: cria contas anônimas e documentos descartáveis no projeto configurado.
// O finally remove somente os registros e contas criados por esta execução.
test("Firebase real: histórico, data, retry, exclusão e isolamento", { timeout: 90000 }, async (t) => {
  const config = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
  assert.ok(Object.values(config).every(Boolean), "Preencha .env.local antes do teste de integração.");

  const apps = ["owner", "other", "guest"].map((name) => initializeApp(config, `imc-test-${name}-${randomUUID()}`));
  const [owner, other] = apps.map((app) => getAuth(app));
  const [db, otherDb, guestDb] = apps.map((app) => getFirestore(app));
  const references = [];

  const denied = (operation) => assert.rejects(operation, (error) => error.code === "permission-denied");
  const payload = (weight, height) => ({ ...calculateImc(weight, height).value, calculatedAt: serverTimestamp() });

  try {
    await signInAnonymously(owner);
    await signInAnonymously(other);
    const uid = owner.currentUser.uid;
    const records = collection(db, "users", uid, "imcRecords");
    const first = doc(records);
    const second = doc(records);
    const invalid = doc(records);
    const foreign = doc(records);
    references.push(first, second, invalid, foreign);

    await t.test("salva o resultado e atribui timestamp no servidor", async () => {
      await setDoc(first, payload("70", "1,75"));
      const saved = (await getDoc(first)).data();
      assert.equal(saved.value, 22.86);
      assert.equal(saved.weight, 70);
      assert.equal(saved.height, 1.75);
      assert.ok(saved.calculatedAt instanceof Timestamp);
      assert.ok(Math.abs(saved.calculatedAt.toMillis() - Date.now()) < 300000);
    });

    await t.test("retry do mesmo documento não duplica o histórico", async () => {
      await setDoc(first, payload("70", "1.75"));
      assert.equal((await getDocs(records)).size, 1);
    });

    await t.test("outro cálculo cria registro próprio e aparece primeiro", async () => {
      await setDoc(second, payload("80", "1.80"));
      const history = await getDocs(query(records, orderBy("calculatedAt", "desc")));
      assert.equal(history.size, 2);
      assert.equal(history.docs[0].id, second.id);
      assert.equal(history.docs[0].data().value, 24.69);
    });

    await t.test("outro usuário não lê, lista, grava ou exclui o histórico alheio", async () => {
      await denied(() => getDoc(doc(otherDb, first.path)));
      await denied(() => getDocs(collection(otherDb, records.path)));
      await denied(() => setDoc(doc(otherDb, foreign.path), payload("70", "1.75")));
      await denied(() => deleteDoc(doc(otherDb, first.path)));
      assert.equal((await getDoc(first)).exists(), true);
    });

    await t.test("cliente sem autenticação não lê nem grava registros", async () => {
      await denied(() => getDoc(doc(guestDb, first.path)));
      await denied(() => setDoc(doc(guestDb, foreign.path), payload("70", "1.75")));
    });

    await t.test("rejeita campos extras, tipos, medidas, fórmula e data inválidos", async () => {
      const missingHeight = payload("70", "1.75");
      delete missingHeight.height;
      for (const data of [
        { ...payload("70", "1.75"), admin: true },
        missingHeight,
        { ...payload("70", "1.75"), value: "22.86" },
        { ...payload("70", "1.75"), value: NaN },
        { ...payload("70", "1.75"), weight: -70 },
        { ...payload("70", "1.75"), weight: Infinity },
        { ...payload("70", "1.75"), height: 0 },
        { ...payload("70", "1.75"), value: 99 },
        { ...payload("70", "1.75"), calculatedAt: Timestamp.fromMillis(0) },
      ]) await denied(() => setDoc(invalid, data));
      assert.equal((await getDoc(invalid)).exists(), false);
    });

    await t.test("um registro existente não pode mudar de medidas ou perder campos", async () => {
      await denied(() => setDoc(first, payload("71", "1.75")));
      await denied(() => setDoc(first, { value: 22.86, calculatedAt: serverTimestamp() }));
      assert.equal((await getDoc(first)).data().weight, 70);
    });

    await t.test("exclusão confirmada remove somente o registro escolhido", async () => {
      await deleteDoc(second);
      assert.equal((await getDoc(second)).exists(), false);
      assert.equal((await getDoc(first)).exists(), true);
      assert.equal((await getDocs(records)).size, 1);
    });
  } finally {
    const documentCleanup = await Promise.allSettled(references.map((reference) => deleteDoc(reference)));
    const userCleanup = await Promise.allSettled([owner, other].filter((auth) => auth.currentUser).map((auth) => deleteUser(auth.currentUser)));
    await Promise.all(apps.map((app) => deleteApp(app)));
    const failures = [...documentCleanup, ...userCleanup].filter((result) => result.status === "rejected");
    assert.equal(failures.length, 0, "Não foi possível limpar todos os dados descartáveis desta execução.");
  }
});

import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Button, Empty, Page } from "../components/UI";
import { useImc } from "../context/ImcContext";
import { deleteImcRecord, imcErrorMessage, listImcRecords } from "../services/imc";
import { formatImc, formatImcDate } from "../utils/imc";
import { colors, styles as s } from "../theme";

export default function ImcHistoryScreen() {
  const { user, connecting, error: connectionError, reconnect } = useImc();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const busy = useRef(false);
  const request = useRef(0);

  const load = useCallback(async () => {
    const version = ++request.current;
    setConfirmId(null);
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await listImcRecords(user.uid);
      if (request.current === version) setRecords(data);
    } catch (failure) {
      if (request.current === version) setError(imcErrorMessage(failure));
    } finally {
      if (request.current === version) setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => {
    load();
    return () => { request.current += 1; };
  }, [load]));

  async function remove() {
    if (busy.current || !confirmId || !user) return;
    busy.current = true;
    setDeleting(true);
    setError("");
    try {
      await deleteImcRecord(user.uid, confirmId);
      setRecords((previous) => previous.filter((record) => record.id !== confirmId));
      setConfirmId(null);
    } catch (failure) {
      setError(imcErrorMessage(failure));
    } finally {
      busy.current = false;
      setDeleting(false);
    }
  }

  return (
    <Page>
      <Text style={s.eyebrow}>SEUS REGISTROS</Text>
      <Text style={s.title}>Histórico de IMC</Text>
      <Text style={s.subtitle}>Seus cálculos mais recentes aparecem primeiro.</Text>
      <Button title="Novo cálculo" onPress={() => router.dismissTo("/imc")} disabled={deleting} />
      {(connecting || loading) && <ActivityIndicator accessibilityLabel="Carregando histórico" color={colors.primary} />}
      {!!connectionError && <View style={s.card}>
        <Text accessibilityRole="alert" style={s.error}>{connectionError}</Text>
        <Button title="Tentar conectar novamente" secondary onPress={reconnect} disabled={connecting} />
      </View>}
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      {!!user && <Button title="Atualizar histórico" secondary onPress={load} disabled={loading || deleting} />}
      {!loading && !connecting && !error && !connectionError && user && records.length === 0 &&
        <Empty title="Nenhum cálculo registrado" description="Faça seu primeiro cálculo para vê-lo aqui com a data e a hora." />}
      {!loading && records.map((record) => <View key={record.id} style={s.card}>
        <Text style={s.eyebrow}>IMC</Text>
        <Text style={s.title}>{formatImc(record.value)}</Text>
        <Text style={s.text}>{formatImcDate(record.calculatedAt)}</Text>
        <Text style={s.subtitle}>{record.weight} kg • {record.height} m</Text>
        {confirmId === record.id ? <>
          <Text style={s.text}>Excluir este cálculo do histórico?</Text>
          <Button title={deleting ? "Excluindo…" : "Confirmar exclusão"} danger onPress={remove} disabled={deleting} />
          <Button title="Manter registro" secondary onPress={() => setConfirmId(null)} disabled={deleting} />
        </> : <Button title="Excluir registro" secondary danger onPress={() => setConfirmId(record.id)} disabled={deleting} />}
      </View>)}
    </Page>
  );
}

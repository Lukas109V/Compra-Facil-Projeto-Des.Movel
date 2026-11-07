import React, { useCallback, useRef, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Button, Empty, ErrorText, Page } from "../components/UI";
import { ConnectionStatus, HistoryLoading, ImcHeader, ImcHistoryCard } from "../components/Imc";
import { useImc } from "../context/ImcContext";
import { deleteImcRecord, imcErrorMessage, listImcRecords } from "../services/imc";

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
      <ImcHeader history />
      <Button title="Novo cálculo" onPress={() => router.navigate("/imc")} disabled={deleting} />
      {(connecting || loading) && <HistoryLoading />}
      <ConnectionStatus error={connectionError} connecting={connecting} onReconnect={reconnect} showConnecting={false} />
      {!!error && <ErrorText>{error}</ErrorText>}
      {!!user && <Button title="Atualizar histórico" secondary onPress={load} disabled={loading || deleting} />}
      {!loading && !connecting && !error && !connectionError && user && records.length === 0 &&
        <Empty title="Nenhum cálculo registrado" description="Faça seu primeiro cálculo para vê-lo aqui com a data e a hora." />}
      {!loading && records.map((record) => <ImcHistoryCard key={record.id} record={record}
        confirming={confirmId === record.id} deleting={deleting} onConfirm={remove}
        onCancel={() => setConfirmId(null)} onRequestDelete={() => setConfirmId(record.id)} />)}
    </Page>
  );
}

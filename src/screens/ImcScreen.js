import React, { useRef, useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { Button, Field, Page } from "../components/UI";
import { useImc } from "../context/ImcContext";
import { createImcRecord, imcErrorMessage, saveImcRecord } from "../services/imc";
import { calculateImc, formatImc } from "../utils/imc";
import { styles as s } from "../theme";

export default function ImcScreen() {
  const { user, connecting, error: connectionError, reconnect } = useImc();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const pending = useRef(null);
  const busy = useRef(false);

  function edit(setter, value) {
    setter(value);
    pending.current = null;
    setResult(null);
    setError("");
  }

  async function calculate() {
    if (busy.current) return;
    const calculation = calculateImc(weight, height);
    if (calculation.error) {
      setError(calculation.error);
      return;
    }
    if (!user) {
      setError("Aguarde a conexão com seu histórico antes de calcular.");
      return;
    }
    busy.current = true;
    setSaving(true);
    setResult(null);
    setError("");
    try {
      pending.current ||= createImcRecord(user.uid, calculation.value);
      await saveImcRecord(pending.current);
      setResult(calculation.value);
      pending.current = null;
    } catch (failure) {
      setError(`${imcErrorMessage(failure)} O cálculo não foi confirmado como salvo.`);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  return (
    <Page>
      <Text style={s.eyebrow}>CALCULADORA DE IMC</Text>
      <Text style={s.title}>Registre seu cálculo.</Text>
      <Text style={s.subtitle}>
        Informe seu peso em quilos e sua altura em metros. Cada cálculo concluído fica salvo com data e hora.
      </Text>
      <Field label="Peso (kg)" placeholder="Ex.: 70" value={weight}
        onChangeText={(value) => edit(setWeight, value)} keyboardType="decimal-pad"
        maxLength={12} editable={!saving} />
      <Field label="Altura (m)" placeholder="Ex.: 1,75" value={height}
        onChangeText={(value) => edit(setHeight, value)} keyboardType="decimal-pad"
        maxLength={12} editable={!saving} />
      <Text style={s.subtitle}>IMC = peso ÷ altura². Aceita vírgula ou ponto decimal.</Text>
      {!!connectionError && <View style={s.card}>
        <Text accessibilityRole="alert" style={s.error}>{connectionError}</Text>
        <Button title="Tentar conectar novamente" secondary onPress={reconnect} disabled={connecting} />
      </View>}
      {connecting && <Text accessibilityLiveRegion="polite" style={s.subtitle}>Conectando ao seu histórico…</Text>}
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      <Button title={saving ? "Salvando cálculo…" : "Calcular e salvar"}
        onPress={calculate} disabled={saving || connecting || !user} />
      {result && <View style={s.card} accessibilityLiveRegion="polite">
        <Text style={s.eyebrow}>SEU IMC</Text>
        <Text style={s.title}>{formatImc(result.value)}</Text>
        <Text style={s.text}>Cálculo salvo no histórico.</Text>
      </View>}
      <Button title="Ver histórico de IMC" secondary onPress={() => router.push("/imc/historico")} disabled={saving} />
    </Page>
  );
}

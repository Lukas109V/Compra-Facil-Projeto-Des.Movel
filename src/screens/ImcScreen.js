import React, { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { Button, ErrorText, Field, Page, Subtitle } from "../components/UI";
import { ConnectionStatus, ImcHeader, ImcResult, PopulationComparison, SexSelector } from "../components/Imc";
import { useImc } from "../context/ImcContext";
import { createImcRecord, imcErrorMessage, saveImcRecord } from "../services/imc";
import { getBrazilImcStatistics } from "../services/worldBank";
import { calculateImc } from "../utils/imc";
import { compareImcWithPopulation, getImcClassification } from "../utils/imcPopulation";

export default function ImcScreen() {
  const { user, connecting, error: connectionError, reconnect } = useImc();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [sex, setSex] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [population, setPopulation] = useState({ loading: false, data: null, error: "" });
  const [comparisonAttempt, setComparisonAttempt] = useState(0);
  const pending = useRef(null);
  const busy = useRef(false);

  useEffect(() => {
    if (!result) return;
    const controller = new AbortController();
    let active = true;
    getBrazilImcStatistics({ signal: controller.signal }).then((data) => {
      if (active) setPopulation({ loading: false, data, error: "" });
    }).catch((failure) => {
      if (active) setPopulation({ loading: false, data: null, error: failure.message });
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, [result, comparisonAttempt]);

  function edit(setter, value) {
    setter(value);
    pending.current = null;
    setResult(null);
    setPopulation({ loading: false, data: null, error: "" });
    setError("");
  }

  async function calculate() {
    if (busy.current) return;
    const calculation = calculateImc(weight, height);
    if (calculation.error) {
      setError(calculation.error);
      return;
    }
    if (!sex) {
      setError("Selecione o sexo para comparar com a população brasileira.");
      return;
    }
    if (!user) {
      setError("Aguarde a conexão com seu histórico antes de calcular.");
      return;
    }
    busy.current = true;
    setSaving(true);
    setResult(null);
    setPopulation({ loading: false, data: null, error: "" });
    setError("");
    try {
      pending.current ||= createImcRecord(user.uid, calculation.value);
      await saveImcRecord(pending.current);
      setPopulation({ loading: true, data: null, error: "" });
      setResult({ ...calculation.value, sex });
      pending.current = null;
    } catch (failure) {
      setError(`${imcErrorMessage(failure)} O cálculo não foi confirmado como salvo.`);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  function retryPopulation() {
    setPopulation({ loading: true, data: null, error: "" });
    setComparisonAttempt((attempt) => attempt + 1);
  }

  const exactImc = result ? result.weight / result.height ** 2 : null;
  const classification = result ? getImcClassification(exactImc) : "";
  const comparison = result && population.data
    ? compareImcWithPopulation(exactImc, population.data[result.sex]) : null;

  return (
    <Page>
      <ImcHeader />
      <Field label="Peso (kg)" placeholder="Ex.: 70" value={weight}
        onChangeText={(value) => edit(setWeight, value)} keyboardType="decimal-pad"
        maxLength={12} editable={!saving} />
      <Field label="Altura (m)" placeholder="Ex.: 1,75" value={height}
        onChangeText={(value) => edit(setHeight, value)} keyboardType="decimal-pad"
        maxLength={12} editable={!saving} />
      <SexSelector value={sex} onChange={(value) => edit(setSex, value)} disabled={saving} />
      <Subtitle>IMC = peso ÷ altura². Aceita vírgula ou ponto decimal. A comparação usa dados de adultos com 18 anos ou mais.</Subtitle>
      <ConnectionStatus error={connectionError} connecting={connecting} onReconnect={reconnect} />
      {!!error && <ErrorText>{error}</ErrorText>}
      <Button title={saving ? "Salvando cálculo…" : "Calcular e salvar"}
        onPress={calculate} disabled={saving || connecting || !user} />
      {result && <ImcResult value={result.value} classification={classification}
        roundedClassification={getImcClassification(result.value)} />}
      {result && <PopulationComparison population={population} comparison={comparison}
        sex={result.sex} onRetry={retryPopulation} />}
      <Button title="Ver histórico de IMC" secondary onPress={() => router.push("/imc/historico")} disabled={saving} />
    </Page>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Button, Field, Page } from "../components/UI";
import { useImc } from "../context/ImcContext";
import { createImcRecord, imcErrorMessage, saveImcRecord } from "../services/imc";
import { getBrazilImcStatistics } from "../services/worldBank";
import { calculateImc, formatImc } from "../utils/imc";
import { compareImcWithPopulation, getImcClassification } from "../utils/imcPopulation";
import { colors, styles as s } from "../theme";

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
      <Text style={s.eyebrow}>CALCULADORA DE IMC</Text>
      <Text style={s.title}>Registre seu cálculo.</Text>
      <Text style={s.subtitle}>
        Informe suas medidas e selecione o sexo para comparar com os dados do Brasil. Cada cálculo concluído fica salvo com data e hora.
      </Text>
      <Field label="Peso (kg)" placeholder="Ex.: 70" value={weight}
        onChangeText={(value) => edit(setWeight, value)} keyboardType="decimal-pad"
        maxLength={12} editable={!saving} />
      <Field label="Altura (m)" placeholder="Ex.: 1,75" value={height}
        onChangeText={(value) => edit(setHeight, value)} keyboardType="decimal-pad"
        maxLength={12} editable={!saving} />
      <View>
        <Text style={s.label}>Sexo para comparação</Text>
        <View style={s.row} accessibilityRole="radiogroup" accessibilityLabel="Sexo para comparação">
          {[{ value: "female", label: "Feminino" }, { value: "male", label: "Masculino" }].map((option) => (
            <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label}
              aria-checked={sex === option.value}
              accessibilityState={{ checked: sex === option.value, disabled: saving }} disabled={saving}
              onPress={() => edit(setSex, option.value)}
              style={({ pressed }) => [s.input, {
                flex: 1, minHeight: 48, alignItems: "center", opacity: saving ? 0.45 : pressed ? 0.7 : 1,
                borderColor: sex === option.value ? colors.primary : colors.border,
                backgroundColor: sex === option.value ? "#EAF0EA" : colors.white,
              }]}>
              <Text style={[s.text, { fontWeight: sex === option.value ? "800" : "400" }]}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Text style={s.subtitle}>IMC = peso ÷ altura². Aceita vírgula ou ponto decimal. A comparação usa dados de adultos com 18 anos ou mais.</Text>
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
        <Text style={s.heading}>{classification}</Text>
        {classification !== getImcClassification(result.value) && <Text style={s.subtitle}>
          O valor exibido foi arredondado. A classificação considera o cálculo completo.
        </Text>}
        <Text style={s.text}>Cálculo salvo no histórico.</Text>
      </View>}
      {result && <View style={s.card} accessibilityLiveRegion="polite">
        <Text style={s.eyebrow}>VOCÊ NA POPULAÇÃO BRASILEIRA</Text>
        {population.loading && <Text style={s.subtitle}>Consultando dados do World Bank…</Text>}
        {!!population.error && <>
          <Text accessibilityRole="alert" style={s.error}>{population.error}</Text>
          <Text style={s.text}>Seu cálculo continua salvo. Você pode consultar os percentuais novamente sem criar outro registro.</Text>
          <Button title="Consultar percentuais novamente" secondary onPress={retryPopulation} />
        </>}
        {comparison && <>
          <Text style={s.title}>{formatImc(comparison.percentage)}%</Text>
          <Text style={s.text}>
            Você se encaixa no grupo de {formatImc(comparison.percentage)}% de {result.sex === "female" ? "mulheres adultas" : "homens adultos"} no Brasil {comparison.group}.
          </Text>
          {comparison.includesUnderweight && <Text style={s.subtitle}>
            Esse percentual inclui baixo peso e faixa normal. Os indicadores não permitem separar esses dois grupos.
          </Text>}
          <Text style={s.subtitle}>Fonte: World Bank / OMS · Brasil · {population.data.year} · adultos (18+).</Text>
        </>}
      </View>}
      <Button title="Ver histórico de IMC" secondary onPress={() => router.push("/imc/historico")} disabled={saving} />
    </Page>
  );
}

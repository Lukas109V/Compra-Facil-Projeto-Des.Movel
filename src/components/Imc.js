import React from "react";
import { styled } from "styled-components/native";
import {
  BodyText, Button, Card, ErrorText, Eyebrow, Heading, Label, Row, Subtitle, Title,
} from "./UI";
import { colors, styles as s } from "../theme";
import { formatImc, formatImcDate } from "../utils/imc";

const SexOption = styled.Pressable({
  ...s.input,
  flex: 1,
  minHeight: 48,
  alignItems: "center",
});
const LoadingIndicator = styled.ActivityIndicator.attrs({ color: colors.primary })``;
const Selector = styled.View``;

export function ImcHeader({ history = false }) {
  return <>
    <Eyebrow>{history ? "SEUS REGISTROS" : "CALCULADORA DE IMC"}</Eyebrow>
    <Title>{history ? "Histórico de IMC" : "Registre seu cálculo."}</Title>
    <Subtitle>{history
      ? "Seus cálculos mais recentes aparecem primeiro."
      : "Informe suas medidas e selecione o sexo para comparar com os dados do Brasil. Cada cálculo concluído fica salvo com data e hora."}
    </Subtitle>
  </>;
}

export function SexSelector({ value, onChange, disabled = false }) {
  return <Selector>
    <Label>Sexo para comparação</Label>
    <Row accessibilityRole="radiogroup" accessibilityLabel="Sexo para comparação">
      {[{ value: "female", label: "Feminino" }, { value: "male", label: "Masculino" }].map((option) => (
        <SexOption key={option.value} accessibilityRole="radio" accessibilityLabel={option.label}
          aria-checked={value === option.value}
          accessibilityState={{ checked: value === option.value, disabled }} disabled={disabled}
          onPress={() => onChange(option.value)}
          style={({ pressed }) => ({
            opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
            borderColor: value === option.value ? colors.primary : colors.border,
            backgroundColor: value === option.value ? "#EAF0EA" : colors.white,
          })}>
          <BodyText style={{ fontWeight: value === option.value ? "800" : "400" }}>{option.label}</BodyText>
        </SexOption>
      ))}
    </Row>
  </Selector>;
}

export function ConnectionStatus({ error, connecting, onReconnect, showConnecting = true }) {
  return <>
    {!!error && <Card>
      <ErrorText>{error}</ErrorText>
      <Button title="Tentar conectar novamente" secondary onPress={onReconnect} disabled={connecting} />
    </Card>}
    {connecting && showConnecting && <Subtitle accessibilityLiveRegion="polite">Conectando ao seu histórico…</Subtitle>}
  </>;
}

export function HistoryLoading() {
  return <LoadingIndicator accessibilityLabel="Carregando histórico" />;
}

export function ImcResult({ value, classification, roundedClassification }) {
  return <Card accessibilityLiveRegion="polite">
    <Eyebrow>SEU IMC</Eyebrow>
    <Title>{formatImc(value)}</Title>
    <Heading>{classification}</Heading>
    {classification !== roundedClassification && <Subtitle>
      O valor exibido foi arredondado. A classificação considera o cálculo completo.
    </Subtitle>}
    <BodyText>Cálculo salvo no histórico.</BodyText>
  </Card>;
}

export function PopulationComparison({ population, comparison, sex, onRetry }) {
  return <Card accessibilityLiveRegion="polite">
    <Eyebrow>VOCÊ NA POPULAÇÃO BRASILEIRA</Eyebrow>
    {population.loading && <Subtitle>Consultando dados do World Bank…</Subtitle>}
    {!!population.error && <>
      <ErrorText>{population.error}</ErrorText>
      <BodyText>Seu cálculo continua salvo. Você pode consultar os percentuais novamente sem criar outro registro.</BodyText>
      <Button title="Consultar percentuais novamente" secondary onPress={onRetry} />
    </>}
    {comparison && <>
      <Title>{formatImc(comparison.percentage)}%</Title>
      <BodyText>
        Você se encaixa no grupo de {formatImc(comparison.percentage)}% de {sex === "female" ? "mulheres adultas" : "homens adultos"} no Brasil {comparison.group}.
      </BodyText>
      {comparison.includesUnderweight && <Subtitle>
        Esse percentual inclui baixo peso e faixa normal. Os indicadores não permitem separar esses dois grupos.
      </Subtitle>}
      <Subtitle>Fonte: World Bank / OMS · Brasil · {population.data.year} · adultos (18+).</Subtitle>
    </>}
  </Card>;
}

export function ImcHistoryCard({ record, confirming, deleting, onConfirm, onCancel, onRequestDelete }) {
  return <Card>
    <Eyebrow>IMC</Eyebrow>
    <Title>{formatImc(record.value)}</Title>
    <BodyText>{formatImcDate(record.calculatedAt)}</BodyText>
    <Subtitle>{record.weight} kg • {record.height} m</Subtitle>
    {confirming ? <>
      <BodyText>Excluir este cálculo do histórico?</BodyText>
      <Button title={deleting ? "Excluindo…" : "Confirmar exclusão"} danger onPress={onConfirm} disabled={deleting} />
      <Button title="Manter registro" secondary onPress={onCancel} disabled={deleting} />
    </> : <Button title="Excluir registro" secondary danger onPress={onRequestDelete} disabled={deleting} />}
  </Card>;
}

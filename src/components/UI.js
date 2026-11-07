import React from "react";
import { Platform } from "react-native";
import { styled } from "styled-components/native";
import { styles as s, colors } from "../theme";

// Reaproveita os mesmos tokens das telas de compras durante a migração gradual.
const PageContainer = styled.KeyboardAvoidingView(s.page);
const PageScroll = styled.ScrollView.attrs({
  keyboardShouldPersistTaps: "handled",
  contentContainerStyle: s.content,
})``;
const FieldContainer = styled.View``;
const Input = styled.TextInput(s.input);
const ButtonPressable = styled.Pressable({
  padding: 15,
  minHeight: 48,
  borderRadius: 12,
  alignItems: "center",
});
const ButtonText = styled.Text({ fontWeight: "700", fontSize: 16 });

export const Card = styled.View(s.card);
export const Row = styled.View(s.row);
export const Eyebrow = styled.Text(s.eyebrow);
export const Title = styled.Text(s.title);
// line-height é unitless no CSS, mas a conversão para estilos nativos exige px.
export const Subtitle = styled.Text({
  ...s.subtitle,
  lineHeight: `${s.subtitle.lineHeight}px`,
});
export const Heading = styled.Text(s.heading);
export const BodyText = styled.Text(s.text);
export const Label = styled.Text(s.label);
export const ErrorText = styled.Text.attrs({ accessibilityRole: "alert" })({
  ...s.error,
  lineHeight: `${s.error.lineHeight}px`,
});

export function Page({ children }) {
  return (
    <PageContainer
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageScroll>{children}</PageScroll>
    </PageContainer>
  );
}
export function Button({
  title,
  onPress,
  secondary = false,
  danger = false,
  disabled = false,
}) {
  const tone = danger ? colors.danger : colors.primary;
  return (
    <ButtonPressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: secondary ? "#EAF0EA" : tone,
        opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
      })}
    >
      <ButtonText style={{ color: secondary ? tone : colors.white }}>
        {title}
      </ButtonText>
    </ButtonPressable>
  );
}
export function Field({ label, ...props }) {
  return (
    <FieldContainer>
      <Label>{label}</Label>
      <Input
        accessibilityLabel={label}
        placeholderTextColor="#819087"
        {...props}
      />
    </FieldContainer>
  );
}
export function Empty({ title, description }) {
  return (
    <Card>
      <Heading>{title}</Heading>
      <Subtitle>{description}</Subtitle>
    </Card>
  );
}

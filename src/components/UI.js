import React from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { styles as s, colors } from "../theme";
export function Page({ children }) {
  return (
    <KeyboardAvoidingView
      style={s.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.content}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
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
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        padding: 15,
        minHeight: 48,
        borderRadius: 12,
        alignItems: "center",
        backgroundColor: secondary ? "#EAF0EA" : tone,
        opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          color: secondary ? tone : "white",
          fontWeight: "700",
          fontSize: 16,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Field({ label, ...props }) {
  return (
    <View>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#819087"
        style={s.input}
        {...props}
      />
    </View>
  );
}
export function Empty({ title, description }) {
  return (
    <View style={s.card}>
      <Text style={s.heading}>{title}</Text>
      <Text style={s.subtitle}>{description}</Text>
    </View>
  );
}

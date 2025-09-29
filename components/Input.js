import React from "react";
import { TextInput, StyleSheet } from "react-native";

export default function Input({
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  error,
}) {
  return (
    <TextInput
      style={[styles.input, error ? styles.errorInput : styles.defaultInput]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize="characters" // harflarni avtomatik katta yozadi
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",        // ✅ tashqi container qancha bo‘lsa shuncha joy egallasin
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    fontWeight: "bold",
  },
  defaultInput: {
    borderColor: "#ccc", // normal holatda kulrang
  },
  errorInput: {
    borderColor: "red", // noto‘g‘ri format bo‘lsa qizil
  },
});

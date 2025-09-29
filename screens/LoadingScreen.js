import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";

const API_URL = Constants.expoConfig.extra.API_URL;

export default function LoadingScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const tel = await AsyncStorage.getItem("userTel");
        const parol = await AsyncStorage.getItem("userParol");

        // 🔹 Agar ma'lumot yo‘q bo‘lsa → LoginScreen
        if (!tel || !parol) {
          navigation.replace("Login");
          return;
        }

        // 🔹 Server orqali tekshirish
        const res = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tel, parol }),
        });

        const data = await res.json();

        if (res.ok) {
          // ✅ Foydalanuvchi topildi → ProfileScreen
          navigation.replace("Profile", { tel });
        } else {
          // ❌ Foydalanuvchi topilmadi → LoginScreen
          await AsyncStorage.clear();
          navigation.replace("Login");
        }
      } catch (err) {
        console.error("Loading xato:", err);
        Alert.alert("❌ Xato", "Server bilan ulanishda muammo");
        navigation.replace("Login");
      }
    };

    checkUser();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="blue" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});

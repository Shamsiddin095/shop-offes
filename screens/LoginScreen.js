import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import Input from '../components/Input';
import Button from '../components/Button';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

export default function LoginScreen() {
  const navigation = useNavigation();
  const [tel, setTel] = useState('+998');
  const [parol, setParol] = useState('');

  const handleLogin = async () => {
    if (!tel || !parol) {
      Alert.alert('❌ Xato', 'Iltimos, barcha maydonlarni to‘ldiring');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tel, parol }),
      });
      const data = await res.json();

      if (res.ok) {
        await AsyncStorage.setItem('userTel', tel);
        await AsyncStorage.setItem('userParol', parol);
        navigation.navigate('Profile', { tel });
      } else {
        Alert.alert('❌ Xato', data.message || 'Telefon yoki parol noto‘g‘ri');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('❌ Xato', 'Serverga ulanib bo‘lmadi');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kirish</Text>
      <Input
        placeholder="+998901234567"
        value={tel}
        onChangeText={setTel}
        keyboardType="phone-pad"
      />
      <Input
        placeholder="Parol"
        value={parol}
        onChangeText={setParol}
        secureTextEntry
      />
      <Button title="Kirish" onPress={handleLogin} />
      <Button
        title="Ro‘yxatdan o‘tish"
        onPress={() => navigation.navigate('Register')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
});

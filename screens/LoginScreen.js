import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import Constants from 'expo-constants';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const API_URL = Constants.expoConfig.extra.API_URL;

export default function LoginScreen({ navigation }) {
  const [telefon, setTelefon] = useState('+998');
  const [parol, setParol] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!telefon || !parol) {
      Speech.speak('Хозяин, заполните все поля!', { language: 'ru-RU' });
      Alert.alert('❌ Xato', 'Iltimos, telefon va parolni kiriting');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefon, parol }),
      });

      const data = await res.json();

      if (res.status === 200) {
        Speech.speak('Добро пожаловать, хозяин!', { language: 'ru-RU' });
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        navigation.replace('Home');
      } else {
        Speech.speak('Неверный телефон или пароль', { language: 'ru-RU' });
        Alert.alert('❌ Xato', data.message || 'Telefon yoki parol noto‘g‘ri');
      }
    } catch (error) {
      console.error(error);
      Speech.speak('Ошибка сервера. Попробуйте позже', { language: 'ru-RU' });
      Alert.alert('❌ Server bilan bog‘lanishda xatolik');
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.scrollContainer}
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Kirish</Text>

        <TextInput
          style={styles.input}
          placeholder="+998912345678"
          keyboardType="phone-pad"
          value={telefon}
          onChangeText={setTelefon}
        />

        {/* 🔑 Parol + Emoji toggle */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Parolingiz"
            secureTextEntry={!showPassword}
            value={parol}
            onChangeText={setParol}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconContainer}
          >
            <Text style={styles.icon}>{showPassword ? '🙉' : '🙈'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Kirish</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Ro‘yxatdan o‘tish</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    paddingRight: 10,
  },
  passwordInput: { flex: 1, padding: 10 },
  iconContainer: { paddingHorizontal: 5 },
  icon: { fontSize: 22 },
  button: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  link: { marginTop: 15, color: 'blue' },
});

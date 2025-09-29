import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Speech from 'expo-speech';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;
export default function RegisterScreen({ navigation }) {
  const [ism, setIsm] = useState('');
  const [familiya, setFamiliya] = useState('');
  const [dukon, setDukon] = useState('');
  const [telefon, setTelefon] = useState('+998');
  const [parol, setParol] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // xatolik ovozi 1 marta aytilishi uchun flaglar
  const [nameErrorSpoken, setNameErrorSpoken] = useState(false);
  const [phoneErrorSpoken, setPhoneErrorSpoken] = useState(false);
  const [passErrorSpoken, setPassErrorSpoken] = useState(false);

  useEffect(() => {
    const matn =
      'Здравствуйте хозяин, я рад вас видеть. Пожалуйста, представьтесь!';
    Speech.speak(matn, { language: 'ru-RU' });
  }, []);

  const handleIsmChange = (text) => {
    setIsm(text);
    const regex = /^[A-Za-z\u0400-\u04FF\s]+$/;
    if (text && !regex.test(text)) {
      if (!nameErrorSpoken) {
        Speech.speak('Хозяин, введите имя только буквами пожалуйста!', {
          language: 'ru-RU',
        });
        setNameErrorSpoken(true);
      }
    } else {
      if (nameErrorSpoken) setNameErrorSpoken(false);
    }
  };

  const handleTelefonChange = (text) => {
    let filtered = text.replace(/[^0-9+]/g, '');
    if (!filtered.startsWith('+')) {
      if (filtered.startsWith('998')) {
        filtered = '+' + filtered;
      }
    }
    if (filtered === '+') {
      filtered = '+998';
    }
    if (filtered.startsWith('+998')) {
      const rest = filtered.slice(4).replace(/[^0-9]/g, '');
      const limited = rest.slice(0, 9);
      filtered = '+998' + limited;
    } else {
      filtered = filtered.slice(0, 13);
    }

    setTelefon(filtered);

    const fullRegex = /^\+998[0-9]{9}$/;
    if (!fullRegex.test(filtered)) {
      if (!phoneErrorSpoken) {
        Speech.speak(
          'Хозяин, введите номер телефона в формате: +998912345678 пожалуйста!',
          { language: 'ru-RU' },
        );
        setPhoneErrorSpoken(true);
      }
    } else {
      if (phoneErrorSpoken) setPhoneErrorSpoken(false);
    }
  };

  const handleParolChange = (text) => {
    setParol(text);
    if (text && text.length < 6) {
      if (!passErrorSpoken) {
        Speech.speak(
          'Хозяин, пароль должен содержать минимум шесть символов!',
          { language: 'ru-RU' },
        );
        setPassErrorSpoken(true);
      }
    } else {
      if (passErrorSpoken) setPassErrorSpoken(false);
    }
  };

  const handleRegister = async () => {
    const fullPhoneRegex = /^\+998[0-9]{9}$/;
    const nameRegex = /^[A-Za-z\u0400-\u04FF\s]+$/;

    if (!ism || !familiya || !dukon || !telefon || !parol) {
      Speech.speak('Пожалуйста, заполните все поля!', { language: 'ru-RU' });
      return;
    }
    if (!nameRegex.test(ism)) {
      Speech.speak('Хозяин, введите имя только буквами пожалуйста!', {
        language: 'ru-RU',
      });
      return;
    }
    if (!fullPhoneRegex.test(telefon)) {
      Speech.speak('Хозяин, телефон должен быть в формате +998912345678', {
        language: 'ru-RU',
      });
      return;
    }
    if (parol.length < 6) {
      Speech.speak('Хозяин, пароль слишком короткий, минимум 6 символов', {
        language: 'ru-RU',
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ism, familiya, dukon, telefon, parol }),
      });

      const data = await res.json();

      if (res.status === 201) {
        Speech.speak('Регистрация прошла успешно!', { language: 'ru-RU' });
        Alert.alert('✅ Muvaffaqiyatli', data.message);
        navigation.replace('Home');
      } else {
        Speech.speak('Ошибка при регистрации', { language: 'ru-RU' });
        Alert.alert('❌ Xato', data.message);
      }
    } catch (error) {
      console.error(error);
      Speech.speak('Ошибка сервера. Попробуйте позже', { language: 'ru-RU' });
      Alert.alert('❌ Server bilan bog‘lanishda xatolik');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Salom hujayin 👋</Text>
      <Text style={styles.subtitle}>Sizni ko‘rganimdan hursandman!</Text>
      <Text style={styles.subtitle}>Iltimos, o‘zingizni tanishtiring</Text>

      <TextInput
        style={styles.input}
        placeholder="Ismingiz"
        value={ism}
        onChangeText={handleIsmChange}
      />
      <TextInput
        style={styles.input}
        placeholder="Familiyangiz"
        value={familiya}
        onChangeText={setFamiliya}
      />
      <TextInput
        style={styles.input}
        placeholder="Dukon nomi"
        value={dukon}
        onChangeText={setDukon}
      />
      <TextInput
        style={styles.input}
        placeholder="+998912345678"
        keyboardType="phone-pad"
        value={telefon}
        onChangeText={handleTelefonChange}
        maxLength={13}
      />

      {/* 🔑 Parol + Emoji toggle */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Parolingiz (kamida 6 belgi)"
          secureTextEntry={!showPassword}
          value={parol}
          onChangeText={handleParolChange}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.iconContainer}
        >
          <Text style={styles.icon}>{showPassword ? '🙉' : '🙈'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Ro‘yxatdan o‘tish</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 5 },
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
  passwordInput: {
    flex: 1,
    padding: 10,
  },
  iconContainer: {
    paddingHorizontal: 5,
  },
  icon: {
    fontSize: 22,
  },
  button: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});

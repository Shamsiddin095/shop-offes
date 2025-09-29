import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Speech from 'expo-speech'; // 🔊 ovoz uchun

export default function RegisterScreen({ navigation }) {
  const [ism, setIsm] = useState('');
  const [familiya, setFamiliya] = useState('');
  const [dukon, setDukon] = useState('');
  const [telefon, setTelefon] = useState('');
  const [parol, setParol] = useState('');

  // 🔊 Sahifa ochilganda ovoz chiqarish
  useEffect(() => {
    const matn =
      "Salom hujayin, sizni ko'rganimdan hursandman. Iltimos, o'zingizni tanishtiring!";
    Speech.speak(matn, { language: 'uz-UZ' });
  }, []);

  // 🔊 Ismni tekshirish (faqat harflar)
  const handleIsmChange = (text) => {
    setIsm(text);
    const regex = /^[A-Za-z\u0400-\u04FF\s]+$/;
    if (text && !regex.test(text)) {
      Speech.speak('Hujayin, ismingizni harflarda kiriting iltimos!', {
        language: 'uz-UZ',
      });
    }
  };

  // 🔊 Telefonni tekshirish (faqat raqamlar)
  const handleTelefonChange = (text) => {
    setTelefon(text);
    const regex = /^[0-9]+$/;
    if (text && !regex.test(text)) {
      Speech.speak(
        'Hujayin, telefon raqamingizni faqat raqamlarda kiriting iltimos!',
        { language: 'uz-UZ' },
      );
    }
  };

  // 🔊 Parolni tekshirish (kamida 6 belgi)
  const handleParolChange = (text) => {
    setParol(text);
    if (text && text.length < 6) {
      Speech.speak(
        "Hujayin, parolingiz kamida olti belgidan iborat bo'lishi kerak!",
        { language: 'uz-UZ' },
      );
    }
  };

  // Ro‘yxatdan o‘tish
  const handleRegister = async () => {
    if (!ism || !familiya || !dukon || !telefon || !parol) {
      Speech.speak("Hujayin, barcha maydonlarni to'ldiring iltimos!", {
        language: 'uz-UZ',
      });
      return;
    }

    try {
      const res = await fetch('https://shop-offes.vercel.app/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ism, familiya, dukon, telefon, parol }),
      });

      const data = await res.json();

      if (res.status === 201) {
        Speech.speak("Ro'yxatdan o'tish muvaffaqiyatli!", {
          language: 'uz-UZ',
        });
        Alert.alert('✅ Muvaffaqiyatli', data.message);
        navigation.replace('Home');
      } else {
        Speech.speak("Ro'yxatdan o'tishda xatolik yuz berdi", {
          language: 'uz-UZ',
        });
        Alert.alert('❌ Xato', data.message);
      }
    } catch (error) {
      console.error(error);
      Speech.speak("Server bilan bog'lanishda xatolik", { language: 'uz-UZ' });
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
        placeholder="Telefon raqamingiz"
        keyboardType="phone-pad"
        value={telefon}
        onChangeText={handleTelefonChange}
      />
      <TextInput
        style={styles.input}
        placeholder="Parolingiz"
        secureTextEntry
        value={parol}
        onChangeText={handleParolChange}
      />

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
  button: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});

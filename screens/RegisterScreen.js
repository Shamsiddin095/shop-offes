import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

export default function RegisterScreen({ navigation }) {
  const [ism, setIsm] = useState('');
  const [familiya, setFamiliya] = useState('');
  const [dukon, setDukon] = useState('');
  const [telefon, setTelefon] = useState('');
  const [parol, setParol] = useState('');

  const handleRegister = async () => {
    try {
      const res = await fetch('https://shop-offes.vercel.app/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ism, familiya, dukon, telefon, parol }),
      });

      const data = await res.json();

      if (res.status === 201) {
        Alert.alert('✅ Muvaffaqiyatli', data.message);
        navigation.replace('Home'); // asosiy UI ga o‘tish
      } else {
        Alert.alert('❌ Xato', data.message);
      }
    } catch (error) {
      console.error(error);
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
        onChangeText={setIsm}
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
        onChangeText={setTelefon}
      />
      <TextInput
        style={styles.input}
        placeholder="Parolingiz"
        secureTextEntry
        value={parol}
        onChangeText={setParol}
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

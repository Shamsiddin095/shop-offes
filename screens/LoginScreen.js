import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

export default function LoginScreen({ navigation }) {
  const [telefon, setTelefon] = useState('');
  const [parol, setParol] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch('https://shop-offes.vercel.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefon, parol }),
      });

      const data = await res.json();

      if (res.status === 200) {
        Alert.alert('✅ Muvaffaqiyatli', data.message);
        navigation.replace('Home', { user: data.user }); // foydalanuvchi ma’lumotlari bilan
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
      <Text style={styles.title}>🔑 Kirish</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Kirish</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Ro‘yxatdan o‘tish</Text>
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
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  button: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  link: { color: 'blue', marginTop: 15 },
});

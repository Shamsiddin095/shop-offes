import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Input from '../components/Input';
import Button from '../components/Button';

const API_URL = Constants.expoConfig.extra.API_URL;

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [ism, setIsm] = useState('');
  const [tel, setTel] = useState('+998');
  const [parol, setParol] = useState('');
  const [telError, setTelError] = useState(false);
  const [mashina, setMashina] = useState('');
  const [mashinaError, setMashinaError] = useState(false);
  const [texpasport, setTexpasport] = useState('');
  const [texpasportError, setTexpasportError] = useState(false);
  const [yoqilgi, setYoqilgi] = useState('Benzin');
  const [rang, setRang] = useState('Qizil');
  const [rusum, setRusum] = useState('Nexia');
  const [isAdmin, setIsAdmin] = useState(false); // Adminlik flag
  const [adminPassword, setAdminPassword] = useState(''); // Admin paroli

  const handleTelChange = (text) => {
    if (!text.startsWith('+998'))
      text = '+998' + text.replace(/\D/g, '').slice(0, 9);
    setTel(text);
    const regex = /^\+998\d{9}$/;
    setTelError(!regex.test(text));
  };

  const handleMashinaChange = (text) => {
    const formatted = text.toUpperCase();
    setMashina(formatted);
    const regex = /^[0-9]{2}[A-Z]{1}[0-9]{3}[A-Z]{2}$/;
    setMashinaError(!regex.test(formatted));
  };

  const handleTexpasportChange = (text) => {
    const formatted = text.toUpperCase();
    setTexpasport(formatted);
    const regex = /^[A-Z]{2}[0-9]{7}$/;
    setTexpasportError(!regex.test(formatted));
  };

  const handleRegister = async () => {
    if (!ism || !tel || !parol || (isAdmin && !adminPassword)) {
      Alert.alert('❌ Xato', 'Iltimos, barcha maydonlarni to‘ldiring');
      return;
    }
    if (telError || mashinaError || texpasportError) {
      Alert.alert('❌ Xato', 'Ma’lumotlar formati noto‘g‘ri');
      return;
    }

    try {
      const checkRes = await fetch(`${API_URL}/check-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tel, mashina, texpasport }),
      });
      const checkData = await checkRes.json();

      if (checkData.exists) {
        Alert.alert('❌ Xato', checkData.message);
        return;
      }

      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ism,
          tel,
          parol,
          mashina: isAdmin ? '' : mashina, // Admin uchun mashina bo‘sh qoldiriladi
          texpasport: isAdmin ? '' : texpasport, // Admin uchun texpasport bo‘sh qoldiriladi
          yoqilgi,
          rusum,
          rang,
          role: isAdmin ? 'admin' : 'user', // Admin bo'lsa role 'admin'
          adminPassword: isAdmin ? adminPassword : undefined, // Admin parol faqat admin uchun
        }),
      });
      const data = await res.json();

      if (res.ok) {
        await AsyncStorage.setItem('userTel', tel);
        await AsyncStorage.setItem('userParol', parol);
        Alert.alert('✅ Muvaffaqiyatli', 'Ro‘yxatdan o‘tdingiz!');
        navigation.navigate('Profile', { tel });
      } else {
        Alert.alert('❌ Xato', data.message || 'Server xatosi');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('❌ Xato', 'Serverga ulanib bo‘lmadi');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Ro‘yxatdan o‘tish</Text>

      <Input placeholder="Ismingiz" value={ism} onChangeText={setIsm} />
      <Input
        placeholder="+998901234567"
        value={tel}
        onChangeText={handleTelChange}
        keyboardType="phone-pad"
        error={telError}
      />
      <Input
        placeholder="Parol"
        value={parol}
        onChangeText={setParol}
        secureTextEntry
      />

      {/* Admin bo'lmaganlar uchun mashina va texpasport kiritish */}
      {!isAdmin && (
        <>
          <Input
            placeholder="Mashina raqami"
            value={mashina}
            onChangeText={handleMashinaChange}
            error={mashinaError}
          />
          <Input
            placeholder="Texpasport raqami"
            value={texpasport}
            onChangeText={handleTexpasportChange}
            error={texpasportError}
          />
        </>
      )}

      {/* Admin bo'lganda selectlarni yashirish */}
      {!isAdmin && (
        <>
          <Picker selectedValue={rusum} onValueChange={setRusum}>
            <Picker.Item label="Nexia" value="Nexia" />
            <Picker.Item label="Matiz" value="Matiz" />
          </Picker>

          <Picker selectedValue={rang} onValueChange={setRang}>
            <Picker.Item label="Qizil" value="Qizil" />
            <Picker.Item label="Oq" value="Oq" />
            <Picker.Item label="Qora" value="Qora" />
          </Picker>

          <Picker selectedValue={yoqilgi} onValueChange={setYoqilgi}>
            <Picker.Item label="Benzin" value="Benzin" />
            <Picker.Item label="Metan" value="Metan" />
            <Picker.Item label="Propan" value="Propan" />
            <Picker.Item label="Dezil" value="Dezil" />
          </Picker>
        </>
      )}

      {/* Admin bo'lish uchun maxsus input */}
      {isAdmin && (
        <Input
          placeholder="Admin parol"
          value={adminPassword}
          onChangeText={setAdminPassword}
          secureTextEntry
        />
      )}

      <Button title="Ro‘yxatdan o‘tish" onPress={handleRegister} />

      {/* Admin bo'lish uchun checkbox */}
      <View style={styles.adminContainer}>
        <Text>Admin sifatida ro'yxatdan o'tish</Text>
        <Switch value={isAdmin} onValueChange={setIsAdmin} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, padding: 20, paddingTop: 40 },
  title: { fontSize: 24, marginBottom: 10, textAlign: 'center' },
  adminContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});

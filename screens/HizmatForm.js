import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

export default function HizmatForm({ onClose, onCreate, user }) {
  const [nomi, setNomi] = useState('');
  const [manzil, setManzil] = useState('');
  const [xizmatTuri, setXizmatTuri] = useState('Metan');
  const [narx, setNarx] = useState('');
  const [kalonkalarSoni, setKalonkalarSoni] = useState('6'); // default 6

  const handleSubmit = async () => {
    if (!nomi || !manzil || !narx || !kalonkalarSoni) {
      Alert.alert('❌ Xato', 'Iltimos barcha maydonlarni to‘ldiring');
      return;
    }

    const kalonkalar = Array.from(
      { length: parseInt(kalonkalarSoni) },
      (_, i) => ({
        kalonka_id: i + 1,
        kalonka_nomi: `Kalonka ${i + 1}`,
        navbat: [],
      }),
    );

    const newZaprafka = {
      nomi,
      manzil,
      xizmat_nomi: xizmatTuri,
      narx_1kub: Number(narx),
      kalonkalar,
      createdBy: user._id, // 👈 admin id
      adminName: user.ism, // 👈 admin ismi
    };

    try {
      const res = await fetch(`${API_URL}/put-serves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newZaprafka),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Xizmat yaratilmadi');

      Alert.alert(data.message || '✅ Hizmat yaratildi');
      if (onCreate) onCreate(newZaprafka);
      onClose();
    } catch (err) {
      console.error(err);
      Alert.alert('❌ Xatolik', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nomi</Text>
      <TextInput value={nomi} onChangeText={setNomi} style={styles.input} />

      <Text style={styles.label}>Manzil</Text>
      <TextInput value={manzil} onChangeText={setManzil} style={styles.input} />

      <Text style={styles.label}>Xizmat turi</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={xizmatTuri} onValueChange={setXizmatTuri}>
          <Picker.Item label="Metan" value="Metan" />
          <Picker.Item label="Propan" value="Propan" />
          <Picker.Item label="Benzin" value="Benzin" />
        </Picker>
      </View>

      <Text style={styles.label}>Narx (1 kub)</Text>
      <TextInput
        value={narx}
        onChangeText={setNarx}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Kalonka soni</Text>
      <TextInput
        value={kalonkalarSoni}
        onChangeText={setKalonkalarSoni}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button title="Yaratish" onPress={handleSubmit} />
      <View style={{ height: 10 }} />
      <Button title="Yopish" onPress={onClose} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    padding: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
});

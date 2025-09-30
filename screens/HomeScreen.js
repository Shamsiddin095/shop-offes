import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

export default function HomeScreen() {
  const [recording, setRecording] = useState(null);
  const [result, setResult] = useState('');

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Xatolik', 'Mikrofon uchun ruxsat berilmadi!');
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
      );
      await rec.startAsync();
      setRecording(rec);
    } catch (err) {
      console.error(err);
      Alert.alert('Xatolik', 'Ovoz yozishni boshlashda xatolik yuz berdi');
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      // FormData yaratish
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'record.wav',
        type: 'audio/wav',
      });

      const res = await fetch(`${API_URL}/speech`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = await res.json();
      if (res.status === 200) {
        setResult(data.text);
      } else {
        Alert.alert('Xatolik', data.error || 'Server xatosi');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Xatolik', 'Ovoz tanib olishda xatolik');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎤 Ovoz orqali matn</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={startRecording}
        disabled={recording !== null}
      >
        <Text style={styles.buttonText}>Yozishni boshlash</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={stopRecording}
        disabled={recording === null}
      >
        <Text style={styles.buttonText}>Yozishni to‘xtatish</Text>
      </TouchableOpacity>

      <Text style={styles.result}>{result}</Text>
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
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  result: { marginTop: 30, fontSize: 16, textAlign: 'center' },
});

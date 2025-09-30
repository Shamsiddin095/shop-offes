import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

export default function HomeScreen() {
  const [recording, setRecording] = useState(null);
  const [result, setResult] = useState('');

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Xatolik', 'Iltimos, mikrofon ruxsatini bering');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

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
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      // Backendga audio yuborish
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'record.wav',
        type: 'audio/wav',
      });

      const speechRes = await fetch(`${API_URL}/speech`, {
        method: 'POST',
        body: formData,
      });

      const speechData = await speechRes.json();
      if (speechRes.ok) {
        const text = speechData.text;

        // Backendga matn yuborish (GPT)
        const analyzeRes = await fetch(`${API_URL}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        const analyzeData = await analyzeRes.json();
        setResult(analyzeData.output);
      } else {
        Alert.alert('Xatolik', speechData.error || 'Server javobi xato');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Xatolik', 'Ovoz tanib olish yoki tahlil qilishda xatolik');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎤 Ovoz orqali zamon aniqlash va tarjima</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={startRecording}
        disabled={recording !== null}
      >
        <Text style={styles.buttonText}>Ovoz yozishni boshlash</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={stopRecording}
        disabled={recording === null}
      >
        <Text style={styles.buttonText}>Ovoz yozishni to‘xtatish</Text>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
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

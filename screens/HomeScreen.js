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
      // Microphone permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Xatolik', 'Ilovaga mikrofon ruxsati kerak');
        return;
      }

      // Audio mode
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

      if (!uri) {
        Alert.alert('Xatolik', 'Audio fayl olinmadi');
        return;
      }

      // Backendga audio yuborish
      const formData = new FormData();
      formData.append('file', { uri, name: 'record.wav', type: 'audio/wav' });

      const speechRes = await fetch(`${API_URL}/speech`, {
        method: 'POST',
        body: formData,
      });

      if (!speechRes.ok) {
        Alert.alert('Xatolik', 'Audio serverga yuborilmadi');
        return;
      }

      const speechData = await speechRes.json();
      const text = speechData.text || '';

      // Backendga matn yuborish (GPT)
      const analyzeRes = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!analyzeRes.ok) {
        Alert.alert('Xatolik', 'Matn serverga yuborilmadi');
        return;
      }

      const analyzeData = await analyzeRes.json();
      setResult(analyzeData.output || 'Natija topilmadi');
    } catch (err) {
      console.error(err);
      Alert.alert('Xatolik', 'Ovoz tanib olish yoki tahlil qilishda xatolik');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎤 Ovoz orqali zamon aniqlash va tarjima</Text>

      <TouchableOpacity
        style={[styles.button, recording ? styles.buttonDisabled : {}]}
        onPress={startRecording}
        disabled={recording !== null}
      >
        <Text style={styles.buttonText}>Ovoz yozishni boshlash</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !recording ? styles.buttonDisabled : {}]}
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
    backgroundColor: '#fff',
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
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  result: {
    marginTop: 30,
    fontSize: 16,
    textAlign: 'center',
  },
});

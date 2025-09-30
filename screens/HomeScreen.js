import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import * as Audio from 'expo-av';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL; // Vercel API url

export default function HomeScreen() {
  const [recording, setRecording] = useState(null);
  const [result, setResult] = useState('');

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Ruxsat kerak', 'Iltimos, mikrofon ruxsatini bering');
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
    } catch (error) {
      console.error(error);
      Alert.alert('Xatolik', 'Ovoz yozishni boshlashda xatolik yuz berdi');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      // Audio faylni FormData bilan yuborish
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'record.wav',
        type: 'audio/wav',
      });

      const response = await fetch(`${API_URL}/speech`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.text);
      } else {
        Alert.alert('Server xatoligi', data.error || 'Audio serverda xatolik');
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Xatolik',
        'Ovoz yuborishda yoki tahlil qilishda xatolik yuz berdi',
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎤 Ovoz orqali tanib olish</Text>

      <TouchableOpacity
        style={[styles.button, recording && { backgroundColor: 'gray' }]}
        onPress={startRecording}
        disabled={!!recording}
      >
        <Text style={styles.buttonText}>Ovoz yozishni boshlash</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !recording && { backgroundColor: 'gray' }]}
        onPress={stopRecording}
        disabled={!recording}
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

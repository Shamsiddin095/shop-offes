import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import Constants from 'expo-constants';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Voice from '@react-native-community/voice';

const API_URL = Constants.expoConfig.extra.API_URL;

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [mijoz, setMijoz] = useState('');
  const [telefon, setTelefon] = useState('+998');
  const [summa, setSumma] = useState('');
  const [qarzlar, setQarzlar] = useState([]);
  const [voiceStep, setVoiceStep] = useState(null);

  // Инициализация пользователя
  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        setUser(u);
        Speech.speak(`Привет, ${u.ism}! Добро пожаловать в приложение!`, {
          language: 'ru-RU',
        });
      }
    };
    fetchUser();
    fetchQarzlar();

    // Настройка событий Voice
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      Speech.speak('Вы вышли из системы', { language: 'ru-RU' });
      navigation.replace('Login');
    } catch (error) {
      console.error(error);
      Alert.alert('❌ Ошибка', 'Не удалось выйти из системы');
    }
  };

  const fetchQarzlar = async () => {
    try {
      const res = await fetch(`${API_URL}/qarz/all`);
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('JSON parse error:', text);
        return;
      }
      if (res.status === 200) setQarzlar(data);
    } catch (error) {
      console.error(error);
      Alert.alert('❌ Не удалось получить список долгов');
    }
  };

  const handleAddQarz = async (m = mijoz, t = telefon, s = summa) => {
    if (!m || !t || !s) {
      Speech.speak('Пожалуйста, введите имя клиента, телефон и сумму!', {
        language: 'ru-RU',
      });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/qarz/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mijoz: m, telefon: t, summa: Number(s) }),
      });
      const data = await res.json();
      if (res.status === 200) {
        Speech.speak(`Долг ${s} руб. добавлен клиенту ${m}`, {
          language: 'ru-RU',
        });
        setMijoz('');
        setTelefon('+998');
        setSumma('');
        fetchQarzlar();
      } else {
        Speech.speak('Произошла ошибка', { language: 'ru-RU' });
        Alert.alert('❌ Ошибка', data.message);
      }
    } catch (error) {
      console.error(error);
      Speech.speak('Ошибка сервера. Попробуйте позже', { language: 'ru-RU' });
    }
  };

  const handlePayQarz = async (mijozName) => {
    try {
      const res = await fetch(`${API_URL}/qarz/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mijoz: mijozName }),
      });
      const data = await res.json();
      if (res.status === 200) {
        Speech.speak(`Долг клиента ${mijozName} оплачен`, {
          language: 'ru-RU',
        });
        fetchQarzlar();
      } else {
        Speech.speak('Произошла ошибка', { language: 'ru-RU' });
      }
    } catch (error) {
      console.error(error);
      Speech.speak('Ошибка сервера', { language: 'ru-RU' });
    }
  };

  // ОВОЗОВОЕ УПРАВЛЕНИЕ
  const startVoiceCommand = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Голосовое управление доступно только на мобильных устройствах',
      );
      return;
    }
    try {
      await Voice.start('ru-RU');
    } catch (e) {
      console.error('Voice start error:', e);
      Speech.speak('Не удалось запустить голосовое управление', {
        language: 'ru-RU',
      });
    }
  };

  const onSpeechResults = (event) => {
    const command = event.value[0].toLowerCase();
    console.log('Voice command:', command);

    if (voiceStep === 'ism') {
      setMijoz(command);
      setVoiceStep('telefon');
      Speech.speak('Пожалуйста, произнесите номер телефона', {
        language: 'ru-RU',
      });
      return;
    }
    if (voiceStep === 'telefon') {
      setTelefon(command.startsWith('+') ? command : '+998' + command);
      setVoiceStep('summa');
      Speech.speak('Пожалуйста, произнесите сумму долга', {
        language: 'ru-RU',
      });
      return;
    }
    if (voiceStep === 'summa') {
      const cleanSum = command.replace(/\D/g, '');
      setSumma(cleanSum);
      handleAddQarz(mijoz, telefon, cleanSum);
      setVoiceStep(null);
      return;
    }

    // Основные команды
    if (command.includes('новый долг') || command.includes('добавить долг')) {
      setVoiceStep('ism');
      Speech.speak('Пожалуйста, произнесите имя клиента', {
        language: 'ru-RU',
      });
    } else if (command.includes('долги')) {
      fetchQarzlar();
      Speech.speak('Список текущих долгов:', { language: 'ru-RU' });
      qarzlar.forEach((q) =>
        Speech.speak(`${q.mijoz} ${q.summa} руб.`, { language: 'ru-RU' }),
      );
    } else if (command.includes('оплатить')) {
      const match = qarzlar.find((q) =>
        command.includes(q.mijoz.toLowerCase()),
      );
      if (match) handlePayQarz(match.mijoz);
      else if (qarzlar.length === 1) handlePayQarz(qarzlar[0].mijoz);
      else
        Speech.speak('Какого клиента вы хотите оплатить?', {
          language: 'ru-RU',
        });
    } else if (command.includes('выход') || command.includes('logout')) {
      handleLogout();
    } else {
      Speech.speak('Команду не распознано, повторите', { language: 'ru-RU' });
    }
  };

  const onSpeechError = (e) => {
    console.error('Speech error:', e);
    Speech.speak('Произошла ошибка распознавания', { language: 'ru-RU' });
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid={true}
    >
      <Text style={styles.title}>🏠 Главная</Text>
      <Text style={styles.subtitle}>
        Привет {user?.ism || 'Хозяин'}! Вы вошли в систему 🎉
      </Text>

      <TouchableOpacity style={styles.voiceButton} onPress={startVoiceCommand}>
        <Text style={styles.buttonText}>🎤 Голосовое управление</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Выход</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Добавить новый долг</Text>
        <TextInput
          style={styles.input}
          placeholder="Имя клиента"
          value={mijoz}
          onChangeText={setMijoz}
        />
        <TextInput
          style={styles.input}
          placeholder="+998912345678"
          value={telefon}
          onChangeText={setTelefon}
        />
        <TextInput
          style={styles.input}
          placeholder="Сумма долга"
          value={summa}
          onChangeText={setSumma}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={() => handleAddQarz()}>
          <Text style={styles.buttonText}>Добавить долг</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Список долгов</Text>
        <FlatList
          data={qarzlar}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.qarzItem}>
              <Text style={styles.qarzText}>
                {item.mijoz} ({item.telefon}) - {item.summa} руб.
              </Text>
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => handlePayQarz(item.mijoz)}
              >
                <Text style={styles.buttonText}>Оплатить</Text>
              </TouchableOpacity>
            </View>
          )}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        />
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: 'red',
    padding: 12,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  voiceButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: 'green',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  payButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  qarzItem: {
    backgroundColor: '#e0f7fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  qarzText: { fontSize: 16 },
});

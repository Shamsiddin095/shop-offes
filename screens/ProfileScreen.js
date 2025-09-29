import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Audio } from 'expo-av';
import HizmatForm from './HizmatForm';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = Constants.expoConfig.extra.API_URL;

const carImages = {
  Matiz: {
    Oq: require('../assets/cars/matiz_white.png'),
    Qora: require('../assets/cars/matiz_black.png'),
    Qizil: require('../assets/cars/matiz_red.png'),
  },
  Nexia: {
    Oq: require('../assets/cars/nexia_white.png'),
    Qora: require('../assets/cars/nexia_black.png'),
    Kok: require('../assets/cars/nexia_red.png'),
  },
};

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zaprafkalar, setZaprafkalar] = useState([]);
  const [showHizmatModal, setShowHizmatModal] = useState(false);
  const [expandedZaprafka, setExpandedZaprafka] = useState(null);
  const [expandedKalonka, setExpandedKalonka] = useState(null);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  const [carNumber, setCarNumber] = useState('');
  const [carImage, setCarImage] = useState(
    require('../assets/cars/default.png'),
  );
  const ding = useRef(new Audio.Sound());

  useEffect(() => {
    const loadSound = async () => {
      try {
        await ding.current.loadAsync(require('../assets/notification.mp3'));
      } catch (e) {
        console.log('Ovoz yuklanmadi', e);
      }
    };
    loadSound();
    return () => {
      ding.current.unloadAsync();
    };
  }, []);

  const startSpin = () => {
    spinAnim.setValue(0);
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  };

  const stopSpin = () => {
    spinAnim.stopAnimation();
    spinAnim.setValue(0);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchUser();
      await fetchZaprafkalar();
      setLoading(false);
    };
    fetchData();
    const interval = setInterval(fetchZaprafkalar, 2000);
    return () => clearInterval(interval);
  }, [showHizmatModal]);

  const fetchUser = async () => {
    try {
      setRefreshing(true);
      startSpin();
      const tel = await AsyncStorage.getItem('userTel');
      if (!tel) {
        navigation.replace('Login');
        return;
      }

      const resUser = await fetch(`${API_URL}/get-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tel }),
      });

      const dataUser = await resUser.json();
      if (!resUser.ok)
        throw new Error(dataUser.message || 'Foydalanuvchi topilmadi');

      setUser(dataUser);
    } catch (err) {
      console.error('Xatolik:', err);
      Alert.alert('❌ Xatolik', err.message);
    } finally {
      setRefreshing(false);
      stopSpin();
    }
  };

  const handleShowHizmatModal = () => {
    if (user?.role === 'admin') {
      setShowHizmatModal(true);
    } else {
      Alert.alert(
        '❌ Xatolik',
        'Siz admin emassiz, modalni ochish mumkin emas.',
      );
    }
  };

  const fetchZaprafkalar = async () => {
    try {
      const res = await fetch(`${API_URL}/get-serves`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Zaprafkalar topilmadi');
      setZaprafkalar(data);
    } catch (err) {
      console.error(err);
      Alert.alert('❌ Xatolik', err.message);
    }
  };

  useEffect(() => {
    if (expandedZaprafka && expandedKalonka) {
      const zaprafka = zaprafkalar.find((z) => z._id === expandedZaprafka);
      const kalonka = zaprafka?.kalonkalar.find(
        (k) => k.kalonka_id === expandedKalonka,
      );
      if (kalonka && kalonka.navbat.length > 0) {
        const firstCar = kalonka.navbat[0];
        if (
          firstCar.rusum &&
          firstCar.rang &&
          carImages[firstCar.rusum] &&
          carImages[firstCar.rusum][firstCar.rang]
        ) {
          setCarImage(carImages[firstCar.rusum][firstCar.rang]);
          setCarNumber(firstCar.mashina);
          return;
        }
      }
    }
    setCarImage(require('../assets/cars/default.png'));
    setCarNumber('');
  }, [expandedZaprafka, expandedKalonka, zaprafkalar]);

  const getUserQueue = () => {
    for (const z of zaprafkalar) {
      for (const k of z.kalonkalar) {
        for (const n of k.navbat) {
          if (n.userId === user?._id)
            return {
              zaprafkaId: z._id,
              kalonkaId: k.kalonka_id,
              index: k.navbat.indexOf(n),
            };
        }
      }
    }
    return null;
  };

  const handleTakeQueue = async (zaprafkaId, kalonkaId) => {
    try {
      const res = await fetch(`${API_URL}/queue?type=take`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          ism: user.ism,
          mashina: user.mashina,
          rusum: user.rusum,
          rang: user.rang,
          zaprafkaId,
          kalonkaId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Navbat olishda xatolik');
      Alert.alert(
        '✅ Muvaffaqiyatli',
        `Navbatga qo‘shildingiz: ${data.navbatRaqami}`,
      );
    } catch (err) {
      console.error(err);
      Alert.alert('❌ Xatolik', err.message);
    }
  };

  const handleLeaveQueue = async (zaprafkaId, kalonkaId) => {
    try {
      const res = await fetch(`${API_URL}/queue?type=leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, zaprafkaId, kalonkaId }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || 'Navbatdan chiqishda xatolik');
      Alert.alert('✅ Muvaffaqiyatli', 'Sizning navbatingiz o‘chirildi!');
    } catch (err) {
      console.error(err);
      Alert.alert('❌ Xatolik', err.message);
    }
  };

  const handleNextQueue = async () => {
    if (!expandedZaprafka || !expandedKalonka) {
      Alert.alert('❌ Xatolik', 'Iltimos, kalonkani tanlang!');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/queue?type=next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zaprafkaId: expandedZaprafka,
          kalonkaId: expandedKalonka,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Keyingi navbat o'tkazilmadi");

      setZaprafkalar((prev) =>
        prev.map((z) =>
          z._id === expandedZaprafka
            ? {
                ...z,
                kalonkalar: z.kalonkalar.map((k) =>
                  k.kalonka_id === expandedKalonka
                    ? { ...k, navbat: k.navbat.slice(1) }
                    : k,
                ),
              }
            : z,
        ),
      );

      Alert.alert('✅ Muvaffaqiyatli', "Keyingi navbatga o'tildi");
    } catch (err) {
      console.error(err);
      Alert.alert('❌ Xatolik', err.message);
    }
  };

  const isNextQueueButtonVisible = () => {
    if (!expandedZaprafka || !expandedKalonka) return false;
    if (user?.role !== 'admin') return false;

    const zaprafka = zaprafkalar.find((z) => z._id === expandedZaprafka);
    const kalonka = zaprafka?.kalonkalar.find(
      (k) => k.kalonka_id === expandedKalonka,
    );
    return kalonka?.navbat && kalonka.navbat.length > 0;
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userTel');
    navigation.replace('Login');
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2bb619" />
      </View>
    );
  if (!user)
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>❌ Foydalanuvchi topilmadi</Text>
      </View>
    );

  const myQueue = getUserQueue();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Chiqish</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.text}> {user.ism}</Text>
      <Text style={styles.carNumber}>{user.mashina}</Text>
      <View style={styles.balanceRow}>
        <Text style={styles.text}>💳 {user.balance} so‘m</Text>
        <TouchableOpacity onPress={fetchUser} style={{ marginLeft: 8 }}>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: spinAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            }}
          >
            <MaterialIcons
              name="refresh"
              size={22}
              color={refreshing ? 'green' : 'blue'}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
      <View style={styles.carContainer}>
        <Image source={carImage} style={styles.carImage} />
        <Text style={styles.carNumberText}>{carNumber || 'Mashina yo‘q'}</Text>
      </View>
      {isNextQueueButtonVisible() && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNextQueue}>
          <Text style={styles.nextButtonText}>➡️ Keyingi navbat</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.subTitle}>⛽ Zaprafkalar:</Text>
      {user?.role === 'admin' &&
        !zaprafkalar.find((z) => z.createdBy === user._id) && (
          <TouchableOpacity
            style={styles.button}
            onPress={handleShowHizmatModal}
          >
            <Text style={styles.buttonText}>➕ Yangi Hizmat yaratish</Text>
          </TouchableOpacity>
        )}
      <Modal visible={showHizmatModal} animationType="slide">
        <HizmatForm user={user} onClose={() => setShowHizmatModal(false)} />
      </Modal>

      {zaprafkalar.map((z) => (
        <View key={z._id} style={styles.zaprafkaContainer}>
          <TouchableOpacity
            onPress={() =>
              setExpandedZaprafka(expandedZaprafka === z._id ? null : z._id)
            }
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={styles.zaprafkaText}>
              {z.nomi} (Admin: {z.adminName || 'Noma’lum'})
            </Text>
          </TouchableOpacity>

          {expandedZaprafka === z._id &&
            z.kalonkalar.map((k) => {
              const myIndex = k.navbat.findIndex((n) => n.userId === user._id);
              const isMyQueue =
                myQueue &&
                myQueue.zaprafkaId === z._id &&
                myQueue.kalonkaId === k.kalonka_id;

              return (
                <View key={k.kalonka_id} style={styles.kalonkaContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      setExpandedKalonka(
                        expandedKalonka === k.kalonka_id ? null : k.kalonka_id,
                      )
                    }
                  >
                    <Text style={styles.kalonkaTitle}>
                      {k.kalonka_nomi} ({k.navbat.length} ta mashina)
                    </Text>
                  </TouchableOpacity>

                  {expandedKalonka === k.kalonka_id && (
                    <View style={{ paddingLeft: 15 }}>
                      {isMyQueue ? (
                        <>
                          <Text style={{ marginBottom: 5, fontSize: 14 }}>
                            🔢 Siz {myIndex + 1}-chi navbatdasiz
                          </Text>
                          <TouchableOpacity
                            style={styles.leaveButton}
                            onPress={() =>
                              handleLeaveQueue(z._id, k.kalonka_id)
                            }
                          >
                            <Text style={styles.leaveButtonText}>
                              ❌ Navbatdan chiqish
                            </Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        user?.role !== 'admin' && (
                          <TouchableOpacity
                            style={styles.takeButton}
                            onPress={() => handleTakeQueue(z._id, k.kalonka_id)}
                          >
                            <Text style={styles.takeButtonText}>
                              ➕ Navbatga qo‘shish
                            </Text>
                          </TouchableOpacity>
                        )
                      )}

                      {k.navbat.map((n, idx) => (
                        <Text key={idx} style={styles.queueText}>
                          {idx + 1}. {n.ism} ({n.mashina})
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  header: { flexDirection: 'row', justifyContent: 'flex-end' },
  logoutButton: { padding: 5 },
  logoutText: { color: 'red', fontWeight: 'bold' },
  text: { fontSize: 18, marginVertical: 4 },
  carNumber: { fontSize: 16, fontWeight: 'bold' },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  carContainer: { alignItems: 'center', marginVertical: 10 },
  carImage: { width: 120, height: 80, resizeMode: 'contain' },
  carNumberText: { fontSize: 16, marginTop: 5 },
  nextButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
  },
  nextButtonText: { color: '#fff', fontWeight: 'bold' },
  subTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  zaprafkaContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  zaprafkaText: { fontSize: 18, fontWeight: 'bold' },
  kalonkaContainer: { marginTop: 5 },
  kalonkaTitle: { fontSize: 16, fontWeight: '600' },
  leaveButton: {
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 5,
    marginVertical: 5,
  },
  leaveButtonText: { color: '#fff', textAlign: 'center' },
  takeButton: {
    backgroundColor: 'green',
    padding: 8,
    borderRadius: 5,
    marginVertical: 5,
  },
  takeButtonText: { color: '#fff', textAlign: 'center' },
  queueText: { fontSize: 14, marginVertical: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', fontSize: 16 },
});

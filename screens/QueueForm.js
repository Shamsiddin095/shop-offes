import React, { useState, useEffect } from "react"
import { View, Text, Button, Alert, StyleSheet } from "react-native"
import { Picker } from "@react-native-picker/picker"
import Constants from "expo-constants"

const API_URL = Constants.expoConfig.extra.API_URL

export default function QueueForm({ zaprafkalar, user, onClose }) {
  const [selectedZaprafka, setSelectedZaprafka] = useState("")
  const [selectedKalonka, setSelectedKalonka] = useState("")
  const [currentKalonkalar, setCurrentKalonkalar] = useState([])

  useEffect(() => {
    if (zaprafkalar.length > 0) {
      setSelectedZaprafka(zaprafkalar[0]._id)
      setCurrentKalonkalar(zaprafkalar[0].kalonkalar || [])
      setSelectedKalonka(zaprafkalar[0].kalonkalar?.[0]?.kalonka_id || "")
    }
  }, [zaprafkalar])

  const handleZaprafkaChange = (zaprafkaId) => {
    setSelectedZaprafka(zaprafkaId)
    const zaprafka = zaprafkalar.find((z) => z._id === zaprafkaId)
    const kalonkalar = zaprafka?.kalonkalar || []
    setCurrentKalonkalar(kalonkalar)
    setSelectedKalonka(kalonkalar[0]?.kalonka_id || "")
  }

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("❌ Xatolik", "Foydalanuvchi ma'lumotlari mavjud emas")
      return
    }

    try {
      const res = await fetch(`${API_URL}/join-queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zaprafkaId: selectedZaprafka,
          kalonkaId: selectedKalonka,
          ism: user.ism,
          mashina: user.mashina,
        }),
      })
      const data = await res.json()
      Alert.alert(data.message)
      onClose()
    } catch (err) {
      console.error(err)
      Alert.alert("❌ Xatolik yuz berdi")
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Zaprafka tanlang:</Text>
      <Picker
        selectedValue={selectedZaprafka}
        onValueChange={handleZaprafkaChange}
        style={styles.picker}
      >
        {zaprafkalar.map((z) => (
          <Picker.Item key={z._id} label={z.nomi} value={z._id} />
        ))}
      </Picker>

      <Text style={styles.label}>Kalonka tanlang:</Text>
      <Picker
        selectedValue={selectedKalonka}
        onValueChange={setSelectedKalonka}
        style={styles.picker}
      >
        {currentKalonkalar.map((k) => (
          <Picker.Item
            key={k.kalonka_id}
            label={k.kalonka_nomi}
            value={k.kalonka_id}
          />
        ))}
      </Picker>

      <Button title="Navbat olish" onPress={handleSubmit} />
      <View style={{ marginTop: 10 }}>
        <Button title="Yopish" color="red" onPress={onClose} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  label: { fontSize: 16, marginBottom: 5, fontWeight: "bold" },
  picker: { marginBottom: 15, backgroundColor: "#f0f0f0" },
})

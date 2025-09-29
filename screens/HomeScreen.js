import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 Home Screen</Text>
      <Text style={styles.subtitle}>Tabriklaymiz! Siz login qildingiz 🎉</Text>

      <Button
        title="Profilega o'tish"
        onPress={() => navigation.navigate('Profile')}
      />

      <Button
        title="Logout"
        color="red"
        onPress={() => Alert.alert('Logout bosildi!')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
});

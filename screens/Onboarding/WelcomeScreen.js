// screens/Onboarding/WelcomeScreen.js

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Logo image
const logo = require('../../assets/safenoteslogo.png');

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Welcome to SafeNotes</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('PinSetup')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Begin Setup</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  title: {
    color: '#fff',
    fontSize: 45,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#4181D4',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
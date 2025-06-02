import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../constants/colors';

const logo = require('../../assets/safenoteslogo.png');

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 10 : 0 },
      ]}
    >
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 0,
  },
  title: {
    color: theme.text,
    fontSize: 36,
    fontFamily: 'Inter',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 48,
  },
  button: {
    backgroundColor: theme.accent,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
    minWidth: 220,
    alignItems: 'center',

    // 3D effect
    elevation: 6, // Android shadow
    shadowColor: '#325480',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,

    // Extra lift illusion
    transform: [{ translateY: -2 }],
  },
  buttonText: {
    color: theme.text,
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: '700',
  },
});

// screens/Onboarding/SetupCompleteScreen.js

import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { OnboardingContext } from '../../contexts/OnboardingContext';

export default function SetupCompleteScreen({ navigation /* no onFinish prop needed */ }) {
  // Grab every single piece from context
  const {
    pin,
    confirmPin,
    sosMessage,
    emergencyName,
    emergencyNumber,
    emergencyRelationship,
    shareLocationByDefault,
    autoWipeChoice,
    locationEnabled,
    cameraEnabled,
    micEnabled,
    galleryEnabled,
    setOnboardingDone, // we won’t actually use it
  } = useContext(OnboardingContext);

  const handleLaunch = () => {
    console.log('🔐 Collected onboarding data:');
    console.log({ pin, confirmPin });
    console.log({
      sosMessage,
      emergencyName,
      emergencyNumber,
      emergencyRelationship,
      shareLocationByDefault,
    });
    console.log({
      autoWipeChoice,
      locationEnabled,
      cameraEnabled,
      micEnabled,
      galleryEnabled,
    });
    console.log('--- End of onboarding mock data ---');

    // Expand here later if/when you want to hand off to main app
    // For now, do nothing else. The user stays on this screen.
  };

  return (
    <KeyboardAvoidingView
      style={styles.outerContainer}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.heading}>You’re All Set</Text>

        {/* Shield Icon */}
        <Image
          source={require('../../assets/shield.png')} // or whatever your asset is named
          style={styles.iconImage}
          resizeMode="contain"
        />

        <Text style={styles.subText}>
          Your disguise is now live.{'\n\n'}
          SafeNotes will appear as a normal notes app on your device, until unlocked.
        </Text>

        <TouchableOpacity
          style={styles.launchButton}
          onPress={handleLaunch}
          activeOpacity={0.8}
        >
          <Text style={styles.launchButtonText}>Launch App</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#000' },
  innerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  heading: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  iconImage: { width: 100, height: 100, marginBottom: 24 },
  subText: {
    color: '#ddd',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  launchButton: {
    width: '80%',
    height: 50,
    backgroundColor: '#4181D4',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  launchButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
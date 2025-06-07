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
import { SettingsContext } from '../../contexts/SettingsContext';

import { theme } from '../../constants/colors'; // Make sure this is at the top

import { ShieldUser } from 'lucide-react-native';

export default function SetupCompleteScreen({ navigation /* no onFinish prop needed */ }) {
  // Grab every single piece from context
  const onboarding = useContext(OnboardingContext);
  const settings = useContext(SettingsContext);

  const handleLaunch = () => {
    console.log('⛓ Syncing onboarding to settings:', onboarding);

    // Copy values from onboarding into settings
    settings.setAccessPin(onboarding.pin);
    settings.setEmergencyMessage(onboarding.sosMessage);
    settings.setEmergencyContact({
      name: onboarding.emergencyName,
      number: onboarding.emergencyNumber,
      relationship: onboarding.emergencyRelationship,
    });
    settings.setAutoWipeTTL(onboarding.autoWipeChoice);
    settings.setLocationEnabled(onboarding.locationEnabled);
    settings.setCameraEnabled(onboarding.cameraEnabled);
    settings.setMicEnabled(onboarding.micEnabled);
    settings.setGalleryEnabled(onboarding.galleryEnabled);
    settings.setBiometricEnabled(onboarding.biometricEnabled);

    settings.setHasCompletedOnboarding(true);

    setTimeout(() => {
      console.log('✅ accessPin:', settings.accessPin);
    }, 500);

  };

  return (
    <KeyboardAvoidingView
      style={styles.outerContainer}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.heading}>You’re All Set</Text>

        {/* Shield Icon */}
        <ShieldUser color={theme.text} size={150} strokeWidth={1.5}/>

        <Text style={styles.liveText}>
          {'\n'}Your disguise is now live.{'\n'}
        </Text>
        <Text style={styles.subText}>
          SafeNotes will appear as a normal notes app on your device, until unlocked.
        </Text>

        <TouchableOpacity
          style={styles.launchButton}
          onPress={handleLaunch}
          activeOpacity={0.8}
        >
          <Text style={styles.launchButtonText}>Launch App</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.goBackText}>Go back</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  heading: {
    color: theme.text,
    fontSize: 32,
    fontFamily: 'Inter',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  iconImage: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  liveText: {
    color: theme.text,
    fontSize: 1,
    fontFamily: 'Inter',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  subText: {
    color: theme.muted,
    fontSize: 1,
    fontFamily: 'Inter',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  launchButton: {
    width: 200,
    height: 50,
    borderRadius: 10,
    backgroundColor: theme.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  launchButtonText: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  goBackText: {
    color: theme.accent,
    fontSize: 18,
    fontFamily: 'Inter',
    textAlign: 'center',
    marginTop: 20,  },
});

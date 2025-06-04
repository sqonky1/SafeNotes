// screens/Onboarding/TutorialScreen.js

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { theme } from '../../constants/colors';
import { FileHeart } from 'lucide-react-native';

export default function TutorialScreen({ navigation, onFinish }) {
  const handleFinish = () => {
    // Simply go to SetupCompleteScreen
    navigation.navigate('SetupComplete');
    onFinish && onFinish();
  };

  return (
    <KeyboardAvoidingView
      style={styles.outerContainer}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Using SafeNotes</Text>

        <View style={styles.headingRow}>
          <FileHeart size={32} color={theme.accent} style={{ marginRight: 8 }} />
          <Text style={styles.quickGuideHeading}>SafeNotes Quick Guide</Text>
        </View>
        <Text style={styles.textBlock}>
          Welcome to SafeNotes, a disguised notes app that helps you stay safe, collect evidence, and send SOS alerts without drawing attention.
          {'\n\n'}You can always find this tutorial under the Information tab as “SafeNotes Guide.”
        </Text>

        <View style={styles.headingRow}>
          <FileHeart size={32} color={theme.accent} style={{ marginRight: 8 }} />
          <Text style={styles.quickGuideHeading}>Essentials</Text>
        </View>

        <Text style={styles.sectionHeading}>Disguised Entry</Text>
        <Text style={styles.textBlock}>
          To open SafeNotes, tap the calculator icon inside the Notes homepage or any note screen. Enter your PIN and press '=' to unlock.
        </Text>

        <Text style={styles.sectionHeading}>Exit Safely</Text>
        <Text style={styles.textBlock}>
          Triple-tap quickly anywhere to return instantly to the disguised Notes homepage.
        </Text>

        <Text style={styles.sectionHeading}>Tools Inside</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Send SOS messages with your location and selected media</Text>
          <Text style={styles.bulletItem}>• Access helpful Information pages</Text>
          <Text style={styles.bulletItem}>• Talk to our AI Chatbot for emotional support</Text>
          <Text style={styles.bulletItem}>• Record private media logs (audio, photo, video)</Text>
          <Text style={styles.bulletItem}>
            • Control privacy and safety features in Settings
          </Text>
        </View>

        <Text style={styles.sectionHeading}>You're in Control</Text>
        <Text style={styles.textBlock}>
          No login. No tracking. Your content stays on your device unless you choose to share it.
        </Text>

        <View style={{ height: 14 }} />

        <View style={styles.headingRow}>
          <FileHeart size={32} color={theme.accent} style={{ marginRight: 8 }} />
          <Text style={styles.additionalTipsHeading}>Additional Tips</Text>
        </View>

        <Text style={styles.sectionHeading}>Forgot Your PIN?</Text>
        <Text style={styles.textBlock}>
          Long-press '=' in the calculator for 3 seconds to unlock with biometric authentication if enabled.
          For your safety, if biometric is disabled, you have no way to recover your PIN. 
          To continue using SafeNotes, you have to reinstall the app, and all data will be erased.
          Please remember it carefully. You can enable biometrics under Settings → Privacy.
        </Text>

        <Text style={styles.sectionHeading}>Hiding the App on Your Device</Text>
        <Text style={styles.textBlock}>
          <Text style={styles.bold}>iOS: </Text>
          Tap and hold the app icon → Remove from Home Screen (App remains accessible via Search)
          {'\n\n'}
          <Text style={styles.bold}>Android: </Text>
          Use your device’s Secure Folder (e.g. Samsung Secure Folder) to rename or hide SafeNotes.
        </Text>

        <Text style={styles.sectionHeading}>Media Journal</Text>
        <Text style={styles.textBlock}>
          SafeNotes can automatically delete your media after a set time. Configure
          this under Settings → Privacy → Auto-Wipe. 
          To record photos, videos or audio, make sure camera and microphone access are enabled under Settings.
          To upload media from your phone gallery, enable gallery access under Settings.
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.finishButton]}
            onPress={handleFinish}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 48,
  },
  heading: {
    color: theme.text,
    fontSize: 32,
    fontFamily: 'Inter',
    fontWeight: '700',
    marginBottom: 0,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 8,
  },
  sectionHeading: {
    color: theme.text,
    fontSize: 20,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  quickGuideHeading: {
    color: theme.text,
    fontSize: 28,
    fontFamily: 'Inter',
    fontWeight: '600',
    marginBottom: 0,
  },
  sectionHeading: {
    color: theme.text,
    fontSize: 20,
    fontFamily: 'Inter',
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 6,
  },
  additionalTipsHeading: {
    color: theme.text,
    fontSize: 28,
    fontFamily: 'Inter',
    fontWeight: '600',
    marginBottom: 0,
  },
  textBlock: {
    color: theme.text,
    fontSize: 14,
    fontFamily: 'Inter',
    lineHeight: 22,
    marginBottom: 4,
  },
  bulletList: {
    marginLeft: 12,
    marginVertical: 8,
  },
  bulletItem: {
    color: theme.text,
    fontSize: 14,
    fontFamily: 'Inter',
    lineHeight: 22,
    marginBottom: 4,
  },
  bold: {
    color: theme.text,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    width: 328,
    marginTop: 24,
  },
  button: {
    width: 150,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: theme.highlight,
  },
  finishButton: {
    backgroundColor: theme.accent,
  },
  buttonText: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});

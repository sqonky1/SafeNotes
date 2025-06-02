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

export default function TutorialScreen({ navigation, onFinish }) {
  const handleFinish = () => {
    // Simply go to SetupCompleteScreen
    navigation.replace('SetupComplete');
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

        <Text style={styles.quickGuideHeading}>SafeNotes Quick Guide</Text>
        <Text style={styles.textBlock}>
          You can always find this tutorial under the Information tab as “SafeNotes Guide.”
        </Text>

        <Text style={styles.sectionHeading}>Disguised Entry</Text>
        <Text style={styles.textBlock}>
          To open SafeNotes, tap the calculator icon inside the Notes screen and enter your PIN.
        </Text>

        <Text style={styles.sectionHeading}>Exit Safely</Text>
        <Text style={styles.textBlock}>
          Triple-tap anywhere to return instantly to the disguised Notes screen.
        </Text>

        <Text style={styles.sectionHeading}>Tools Inside</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Send SOS messages with your location</Text>
          <Text style={styles.bulletItem}>• Access helpful Information pages</Text>
          <Text style={styles.bulletItem}>• Talk to our AI Chatbot for emotional support</Text>
          <Text style={styles.bulletItem}>• Record private media logs (audio, photo, video)</Text>
          <Text style={styles.bulletItem}>
            • Control safety features and auto-deletion in Settings
          </Text>
        </View>

        <Text style={styles.sectionHeading}>You're in Control</Text>
        <Text style={styles.textBlock}>
          No login. No tracking. Your content stays on your device unless you choose to share it.
        </Text>

        <View style={{ height: 24 }} />

        <Text style={styles.additionalTipsHeading}>Additional Tips</Text>

        <Text style={styles.sectionHeading}>Forgot Your PIN?</Text>
        <Text style={styles.textBlock}>
          Long-press anywhere on the real UI for 3 seconds to unlock with biometric authentication.
        </Text>

        <Text style={styles.sectionHeading}>Hiding the App on Your Device</Text>
        <Text style={styles.textBlock}>
          <Text style={styles.bold}>iOS: </Text>
          Tap and hold the app icon → Remove from Home Screen (App remains accessible via Search)
          {'\n\n'}
          <Text style={styles.bold}>Android: </Text>
          Use your device’s Secure Folder (e.g. Samsung Secure Folder) to rename or hide SafeNotes.
        </Text>

        <Text style={styles.sectionHeading}>Auto-Wipe Option</Text>
        <Text style={styles.textBlock}>
          SafeNotes can automatically delete your logs and media after a set time. Configure
          this under Settings → Auto-Wipe.
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
  outerContainer: { flex: 1, backgroundColor: '#000' },
  scrollView: { flex: 1 },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  heading: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
  },
  quickGuideHeading: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionHeading: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 6,
  },
  additionalTipsHeading: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  textBlock: { color: '#ddd', fontSize: 14, lineHeight: 22 },
  bulletList: { marginLeft: 12, marginVertical: 8 },
  bulletItem: { color: '#ddd', fontSize: 14, lineHeight: 22 },
  bold: { fontWeight: '700', color: '#fff' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  button: { width: 150, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  backButton: { backgroundColor: '#4a4a4a' },
  finishButton: { backgroundColor: '#4181D4' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
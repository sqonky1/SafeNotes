// screens/Onboarding/ConfigureSOSScreen.js

import React, { useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// ─── IMPORT YOUR ONBOARDING CONTEXT ─────────────────────
import { OnboardingContext } from '../../contexts/OnboardingContext';

export default function ConfigureSOSScreen({ navigation, onFinish }) {
  // ─── PULL FIELDS + SETTER FROM CONTEXT ─────────────────
  const {
    sosMessage,
    emergencyName,
    emergencyNumber,
    emergencyRelationship,
    shareLocationByDefault,
    setField,
  } = useContext(OnboardingContext);

  // Called when “Save” is tapped
  const handleSaveSOS = () => {
    // (Optional) console.log the values here:
    console.log('Collected SOS data:', {
      sosMessage,
      emergencyName,
      emergencyNumber,
      emergencyRelationship,
      shareLocationByDefault,
    });

    // Navigate to the next onboarding screen:
    navigation.replace('SetPreferences');
    onFinish && onFinish();
  };

  return (
    <KeyboardAvoidingView
      style={styles.outerContainer}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── HEADING */}
        <Text style={styles.heading}>Configure SOS Message</Text>

        {/* ─── “Message” Input */}
        <Text style={styles.sectionHeading}>Message</Text>
        <TextInput
          style={styles.textInputMulti}
          multiline
          value={sosMessage}
          onChangeText={(text) => setField('sosMessage', text)}
          placeholder="eg. Please send help. I may be in danger and unable to speak up. Please check on me."
          placeholderTextColor="#666"
        />

        {/* ─── Emergency Contact (Name / Number / Relationship) */}
        <Text style={styles.sectionHeading}>Emergency Contact (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Add Name..."
          placeholderTextColor="#666"
          value={emergencyName}
          onChangeText={(text) => setField('emergencyName', text)}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Add Number..."
          placeholderTextColor="#666"
          keyboardType="phone-pad"
          value={emergencyNumber}
          onChangeText={(text) => setField('emergencyNumber', text)}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Add Relationship..."
          placeholderTextColor="#666"
          value={emergencyRelationship}
          onChangeText={(text) => setField('emergencyRelationship', text)}
        />

        {/* ─── “Share Location by Default” Toggle */}
        <Text style={styles.sectionHeading}>Share Location in SOS</Text>
        <Text style={styles.sectionText}>
          Your device’s location is shared via a link. If location tracking is disabled, location will not be sent.
        </Text>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setField('shareLocationByDefault', !shareLocationByDefault)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkboxBase,
              shareLocationByDefault && styles.checkboxBaseChecked,
            ]}
          >
            {shareLocationByDefault && <Text style={styles.checkboxMark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Share my location by default</Text>
        </TouchableOpacity>

        {/* ─── Back & Save Buttons ───────────────────────── */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSaveSOS}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ───────────────────────────────────────────────────────────────────
// ─── THIS STYLESHEET IS EXACTLY AS YOU PREVIOUSLY HAD IT ───────────
// ─── (No visual changes from your original “Configure SOS” styling) ───
// ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  heading: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 24,
  },

  sectionHeading: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  sectionText: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 8,
  },

  textInputMulti: {
    backgroundColor: '#1A1A1A',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#1A1A1A',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  checkboxBase: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#888',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBaseChecked: {
    backgroundColor: '#4181D4',
    borderColor: '#4181D4',
  },
  checkboxMark: {
    color: '#fff',
    fontSize: 16,
  },
  checkboxLabel: {
    color: '#fff',
    fontSize: 16,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  button: {
    width: 150,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#4a4a4a',
  },
  saveButton: {
    backgroundColor: '#4181D4',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
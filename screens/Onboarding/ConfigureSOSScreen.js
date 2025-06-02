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
import { theme } from '../../constants/colors';
import { OnboardingContext } from '../../contexts/OnboardingContext';

export default function ConfigureSOSScreen({ navigation, onFinish }) {
  const {
    sosMessage,
    emergencyName,
    emergencyNumber,
    emergencyRelationship,
    setField,
  } = useContext(OnboardingContext);

  const handleSaveSOS = () => {
    const digitsOnly = emergencyNumber.replace(/\D/g, '');

    if (digitsOnly && (!/^[89]/.test(digitsOnly) || digitsOnly.length !== 8)) {
      alert('Emergency contact number must be 8 digits and start with 8 or 9.');
      setField('emergencyNumber', '');
      return;
    }

    console.log('Collected SOS Data:', {
      sosMessage,
      emergencyName,
      emergencyNumber: digitsOnly,
      emergencyRelationship,
    });

    navigation.navigate('SetPreferences');
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
        <Text style={styles.heading}>Configure SOS</Text>

        <Text style={styles.sectionHeading}>Message</Text>
        <TextInput
          style={styles.textInputMulti}
          multiline
          value={sosMessage}
          onChangeText={(text) => setField('sosMessage', text)}
          placeholder="eg. Please send help. I may be in danger and unable to speak up. Please check on me."
          placeholderTextColor="#666"
        />

        <Text style={styles.sectionHeading}>Emergency Contact (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Add Name..."
          placeholderTextColor="#666"
          value={emergencyName}
          onChangeText={(text) => setField('emergencyName', text)}
        />

        <View style={styles.phoneRow}>
          <View style={styles.prefixBox}>
            <Text style={styles.prefixText}>+65</Text>
          </View>

          <TextInput
            style={styles.phoneInput}
            placeholder="Add Number..."
            placeholderTextColor="#666"
            keyboardType="phone-pad"
            value={emergencyNumber}
            onChangeText={(text) => {
              const digitsOnly = text.replace(/\D/g, '');
              if (digitsOnly.length === 8 && !/^[89]/.test(digitsOnly)) {
                alert('Phone number must start with 8 or 9 and be 8 digits long.');
                setField('emergencyNumber', '');
              } else if (digitsOnly.length <= 8) {
                setField('emergencyNumber', digitsOnly);
              }
            }}
          />
        </View>

        <TextInput
          style={styles.textInput}
          placeholder="Add Relationship..."
          placeholderTextColor="#666"
          value={emergencyRelationship}
          onChangeText={(text) => setField('emergencyRelationship', text)}
        />

        {/* Back & Save Buttons (in flow, not floating) */}
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

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 36,
  },
  heading: {
    color: theme.text,
    fontSize: 36,
    fontFamily: 'Inter',
    fontWeight: '700',
    marginBottom: 0,
    textAlign: 'left',
  },
  sectionHeading: {
    color: theme.text,
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: '600',
    marginBottom: 20,
    marginTop: 24,
  },
  sectionText: {
    color: theme.muted,
    fontSize: 14,
    fontFamily: 'Inter',
    marginBottom: 8,
    lineHeight: 20,
  },
  textInputMulti: {
    backgroundColor: theme.card,
    color: theme.text,
    fontFamily: 'Inter',
    fontSize: 16,
    borderRadius: 8,
    padding: 12,
    height: 70,
    textAlignVertical: 'top',
    marginBottom: 0,
    borderColor: theme.input,
    borderWidth: 1,
    lineHeight: 20,
  },
  textInput: {
    backgroundColor: theme.card,
    color: theme.text,
    fontFamily: 'Inter',
    fontSize: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderColor: theme.input,
    borderWidth: 1,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  prefixBox: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: theme.card,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderRightWidth: 1,
    borderColor: theme.border,
  },
  prefixText: {
    color: theme.text,
    fontSize: 16,
    fontFamily: 'Inter',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: theme.card,
    color: theme.text,
    fontFamily: 'Inter',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  buttonRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    width: 328,
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
  saveButton: {
    backgroundColor: theme.accent,
  },
  buttonText: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});

// screens/Onboarding/PinSetupScreen.js

import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { OnboardingContext } from '../../contexts/OnboardingContext';
import { theme } from '../../constants/colors';
import { Feather } from '@expo/vector-icons'; // or use Ionicons

const BackspaceIcon = () => (
  <Text style={{ color: '#fff', fontSize: 24, fontWeight: '600' }}>⌫</Text>
);

export default function PinSetupScreen({ navigation, onFinish }) {
  const { pin, confirmPin, setField } = useContext(OnboardingContext);

  const [isMatching, setIsMatching] = useState(false);
  const [activeField, setActiveField] = useState('pin');

  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  useEffect(() => {
    if (
      pin.length === 4 &&
      confirmPin.length === 4 &&
      pin === confirmPin
    ) {
      setIsMatching(true);
    } else {
      setIsMatching(false);
    }
  }, [pin, confirmPin]);

  const handleDigitPress = (digit) => {
    if (activeField === 'pin') {
      if (pin.length < 4) {
        setField('pin', pin + digit);
      }
    } else {
      if (confirmPin.length < 4) {
        setField('confirmPin', confirmPin + digit);
      }
    }
  };

  const handleBackspace = () => {
    if (activeField === 'pin') {
      setField('pin', pin.slice(0, -1));
    } else {
      setField('confirmPin', confirmPin.slice(0, -1));
    }
  };

  const handleSave = () => {
    console.log('Collected PIN:', pin);
    navigation.navigate('ConfigureSOS');
    onFinish && onFinish();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ 
        flexGrow: 1,
        paddingBottom: 120,
      }}
      overScrollMode="never"
      keyboardShouldPersistTaps="handled"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <Text style={styles.heading}>
          Set Your 4-Digit{"\n"}
          Unlock PIN
        </Text>

        <Text style={styles.sectionText}>
          This PIN will be entered in the calculator to unlock the real SafeNotes interface.
        </Text>

        <Text style={styles.sectionText}>
          Choose something you can remember, but others won’t guess.
        </Text>

        <View style={styles.fieldsContainer}>
          {/* PIN field */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveField('pin')}
            style={[
              styles.pinField,
              activeField === 'pin' && styles.fieldFocused,
            ]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={pin ? styles.pinFieldText : styles.placeholderText}>
                {pin ? (showPin ? pin : '•'.repeat(pin.length)) : 'Enter 4-Digit PIN'}
              </Text>
              {pin.length > 0 && (
                <TouchableOpacity onPress={() => setShowPin(!showPin)}>
                  <Feather
                    name={showPin ? 'eye' : 'eye-off'}
                    size={20}
                    color={theme.muted}
                  />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>

          {/* Confirm PIN field */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveField('confirm')}
            style={[
              styles.pinField,
              activeField === 'confirm' && styles.fieldFocused,
            ]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={confirmPin ? styles.pinFieldText : styles.placeholderText}>
                {confirmPin
                  ? (showConfirmPin ? confirmPin : '•'.repeat(confirmPin.length))
                  : 'Confirm 4-Digit PIN'}
              </Text>
              {confirmPin.length > 0 && (
                <TouchableOpacity onPress={() => setShowConfirmPin(!showConfirmPin)}>
                  <Feather
                    name={showConfirmPin ? 'eye' : 'eye-off'}
                    size={20}
                    color={theme.muted}
                  />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.keypadWrapper}>
          {[
            ['7', '8', '9'],
            ['4', '5', '6'],
            ['1', '2', '3'],
          ].map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.keypadRow}>
              {row.map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.keyButton}
                  onPress={() => handleDigitPress(key)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <View style={styles.keypadRow}>
            <TouchableOpacity
              style={{
                flex: 2,
                aspectRatio: 2.4,
                backgroundColor: theme.card,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 6,
              }}
              onPress={() => handleDigitPress('0')}
              activeOpacity={0.6}
            >
              <Text style={styles.keyText}>0</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                aspectRatio: 1.2,
                backgroundColor: theme.card,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 6,
              }}
              onPress={handleBackspace}
              activeOpacity={0.6}
            >
              <BackspaceIcon />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              isMatching ? styles.saveButtonEnabled : styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!isMatching}
            activeOpacity={isMatching ? 0.8 : 1}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 24,
  },

  heading: {
    color: theme.text,
    fontSize: 32,
    fontFamily: 'Inter',
    fontWeight: '700',
    marginBottom: 8,
  },

  subtitle: {
    color: theme.text,
    fontSize: 20,
    fontFamily: 'Inter',
    fontWeight: '400',
    marginBottom: 6,
  },
  sectionText: {
    color: theme.muted,
    fontSize: 16,
    fontFamily: 'Inter',
    marginBottom: 12,
  },
  helperText: {
    color: theme.muted,
    fontSize: 14,
    fontFamily: 'Inter',
    marginBottom: 14,
  },

  fieldsContainer: {
    marginBottom: 24,
  },

  pinField: {
    width: '100%',
    height: 54,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.input,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  fieldFocused: {
    borderColor: theme.accent,
  },

  pinFieldText: {
    color: theme.text,
    fontSize: 20,
    fontFamily: 'Inter',
    letterSpacing: 8,
  },

  placeholderText: {
    color: theme.muted,
    fontSize: 16,
    fontFamily: 'Inter',
  },

  keypadWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 16, // prevent edge clipping
  },

  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    marginVertical: 6,
  },

  keyButton: {
    backgroundColor: theme.card,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    aspectRatio: 1.2, // square-ish
    marginHorizontal: 6,
  },

  keyText: {
    color: theme.text,
    fontSize: 32,
    fontFamily: 'Inter',
    fontWeight: '600',
  },

  buttonContainer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    width: 328,
  },

  button: {
    width: '48%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backButton: {
    backgroundColor: theme.highlight,
  },

  saveButtonEnabled: {
    backgroundColor: theme.accent,
  },

  saveButtonDisabled: {
    backgroundColor: theme.highlight,
  },

  buttonText: {
    color: theme.text,
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: '700',
  },
});

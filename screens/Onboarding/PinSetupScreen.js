// screens/Onboarding/PinSetupScreen.js

import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// ← Make sure you point this to your onboarding context:
import { OnboardingContext } from '../../contexts/OnboardingContext';

// A simple backspace icon (Unicode)
const BackspaceIcon = () => (
  <Text style={{ color: '#fff', fontSize: 24, fontWeight: '600' }}>⌫</Text>
);

export default function PinSetupScreen({ navigation, onFinish }) {
  // Pull pin & confirmPin out of context:
  const { pin, confirmPin, setField } = useContext(OnboardingContext);

  const [isMatching, setIsMatching] = useState(false);
  const [activeField, setActiveField] = useState('pin'); // either 'pin' or 'confirm'

  // Whenever pin or confirmPin change, check if they're both length 4 and match
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

  // Called when you tap a digit (0–9); appends to whichever field is active
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

  // Called when you tap the backspace (“⌫”) key
  const handleBackspace = () => {
    if (activeField === 'pin') {
      setField('pin', pin.slice(0, -1));
    } else {
      setField('confirmPin', confirmPin.slice(0, -1));
    }
  };

  // Called when “Save” is tapped (only enabled if isMatching === true)
  const handleSave = () => {
    // You could store PIN in SecureStore here if you want.
    // For now, simply navigate onward and call onFinish()
    navigation.replace('ConfigureSOS');
    onFinish && onFinish();
  };

  //
  // CONSTANTS FOR EXACT KEYPAD SIZE (328 × 358)
  //
  const KEY_WIDTH = 104;   // each key’s width
  const KEY_HEIGHT = 85;   // each key’s height
  const H_GAP = 8;         // horizontal gap between keys

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      {/* ───────── Heading ───────── */}
      <Text style={styles.heading}>Set Your 4-Digit Unlock PIN</Text>

      {/* ───────── Subtitle ───────── */}
      <Text style={styles.subtitle}>
        This PIN will be entered into the calculator to unlock SafeNotes.
      </Text>

      {/* ───────── Helper text ───────── */}
      <Text style={styles.helperText}>
        Make sure it’s easy for you to remember, but hard for others to guess.
      </Text>

      {/* ───────── PIN fields (stacked) ───────── */}
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
          <Text style={pin ? styles.pinFieldText : styles.placeholderText}>
            {pin ? '•'.repeat(pin.length) : 'Enter 4-Digit PIN'}
          </Text>
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
          <Text
            style={confirmPin ? styles.pinFieldText : styles.placeholderText}
          >
            {confirmPin
              ? '•'.repeat(confirmPin.length)
              : 'Confirm 4-Digit PIN'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ───────── Number Pad (exactly 328 × 358) ───────── */}
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
                style={[
                  styles.keyButton,
                  {
                    width: KEY_WIDTH,
                    height: KEY_HEIGHT,
                    marginHorizontal: H_GAP / 2,
                  },
                ]}
                onPress={() => handleDigitPress(key)}
                activeOpacity={0.6}
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Bottom row: “0” spans two columns, “⌫” under the “3” */}
        <View style={styles.keypadRow}>
          {/* “0” button: (2 × KEY_WIDTH) + one H_GAP */}
          <TouchableOpacity
            style={{
              width: KEY_WIDTH * 2 + H_GAP,
              height: KEY_HEIGHT,
              backgroundColor: '#1A1A1A',
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: H_GAP / 2,
            }}
            onPress={() => handleDigitPress('0')}
            activeOpacity={0.6}
          >
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>

          {/* “⌫” key */}
          <TouchableOpacity
            style={[
              styles.keyButton,
              {
                width: KEY_WIDTH,
                height: KEY_HEIGHT,
                marginHorizontal: H_GAP / 2,
              },
            ]}
            onPress={handleBackspace}
            activeOpacity={0.6}
          >
            <BackspaceIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* ───────── Back & Save Buttons (150 × 50) ───────── */}
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
  );
}

// ───────────────────────────────────────────────────────────────────
// ───────────── Stylesheet (no more V_GAP here!) ─────────────
// ───────────────────────────────────────────────────────────────────
const BLUE = '#4181D4';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20, // ensures the Back/Save buttons aren’t flush to bottom
  },

  // Heading (40px, weight 700)
  heading: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },

  // Subtitle (28px, weight 300)
  subtitle: {
    color: '#ddd',
    fontSize: 28,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 4,
  },

  // Helper text (16px, weight 300, 60% white)
  helperText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 24,
  },

  // Container for the two PIN fields
  fieldsContainer: {
    marginBottom: 16,
  },
  pinField: {
    width: '100%',
    height: 56,
    borderWidth: 1.5,
    borderColor: '#444',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  fieldFocused: {
    borderColor: BLUE,
  },
  pinFieldText: {
    color: '#fff',
    fontSize: 22,
    letterSpacing: 8,
  },
  placeholderText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '300',
  },

  // Keypad wrapper forced to 328 × 358
  keypadWrapper: {
    width: 328,
    height: 358,
    alignSelf: 'center',
    marginBottom: 16,
    justifyContent: 'center',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3, // ← previously you wrote “V_GAP/2” (6/2=3), but use literal 3
  },
  keyButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    // width & height are set inline in JSX
  },
  keyText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },

  // The Back & Save row, each button is 150 × 50
  buttonContainer: {
    width: 328,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  button: {
    width: 150,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: BLUE,
  },
  saveButtonEnabled: {
    backgroundColor: BLUE,
  },
  saveButtonDisabled: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
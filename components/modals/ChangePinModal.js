import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { theme } from '../../constants/colors';
import * as SecureStore from 'expo-secure-store';

export default function ChangePinModal({ visible, onClose, onSave }) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  useEffect(() => {
    if (visible) {
      setPin('');
      setConfirmPin('');
    }
  }, [visible]);

  const handleSave = async () => {
    if (pin.length !== 4 || confirmPin.length !== 4 || isNaN(pin) || isNaN(confirmPin)) {
      Alert.alert('Invalid PIN', 'PIN must be a 4-digit number.');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('Mismatch', 'PINs do not match.');
      return;
    }

    try {
      await SecureStore.setItemAsync('accessPin', pin);
      onSave(pin);
      Alert.alert('Saved', 'Access PIN updated.');
      onClose();
    } catch (e) {
      console.error('Failed to save PIN:', e);
      Alert.alert('Error', 'Could not save PIN. Try again.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Change Access PIN</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter new 4-digit PIN"
            placeholderTextColor={theme.muted}
            keyboardType="number-pad"
            secureTextEntry
            value={pin}
            onChangeText={setPin}
            maxLength={4}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm new PIN"
            placeholderTextColor={theme.muted}
            keyboardType="number-pad"
            secureTextEntry
            value={confirmPin}
            onChangeText={setConfirmPin}
            maxLength={4}
          />

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 20,
    color: theme.text,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    backgroundColor: theme.input,
    color: theme.text,
    fontFamily: 'Inter',
    fontSize: 15,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelBtn: {
    marginRight: 16,
    paddingTop: 8,
  },
  cancelText: {
    color: theme.muted,
    fontFamily: 'Inter',
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: theme.accent,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Inter',
    fontSize: 16,
  },
});

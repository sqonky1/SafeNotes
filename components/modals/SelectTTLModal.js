import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { theme } from '../../constants/colors';
import * as SecureStore from 'expo-secure-store';

const OPTIONS = ['24h', '48h', 'never'];

export default function SelectTTLModal({ visible, onClose, currentTTL, onSave }) {
  const handleSelect = async (option) => {
    try {
      await SecureStore.setItemAsync('autoWipeTTL', option);
      onSave(option);
      Alert.alert('Saved', `Auto-wipe set to ${option}`);
      onClose();
    } catch (e) {
      console.error('Failed to save TTL:', e);
      Alert.alert('Error', 'Could not save setting.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Select Auto-Wipe Duration</Text>
          {OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                option === currentTTL && styles.selectedOption,
              ]}
              onPress={() => handleSelect(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  option === currentTTL && styles.selectedText,
                ]}
              >
                {option === 'never' ? 'Never auto-delete' : option}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
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
    marginBottom: 16,
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: theme.border,
  },
  selectedOption: {
    backgroundColor: theme.card,
    borderColor: theme.muted,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  optionText: {
    fontSize: 15,
    fontFamily: 'Inter',
    color: theme.text,
  },
  selectedText: {
    fontWeight: 'bold',
    color: theme.accent,
  },
  cancel: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  cancelText: {
    color: theme.muted,
    fontFamily: 'Inter',
    fontSize: 16,
  },
});
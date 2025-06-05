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

export default function EditMessageModal({
  visible,
  onClose,
  currentMessage,
  onSave,
}) {
  const [message, setMessage] = useState(currentMessage);

  useEffect(() => {
    if (visible) setMessage(currentMessage); // Reset on open
  }, [visible]);

  const handleSave = async () => {
    try {
      await SecureStore.setItemAsync('emergencyMessage', message);
      onSave(message); // Update context
      Alert.alert('Saved', 'Emergency message updated.');
      onClose();
    } catch (e) {
      console.error('Failed to save message:', e);
      Alert.alert('Error', 'Could not save message. Try again.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Edit Emergency Message</Text>
          <TextInput
            style={styles.input}
            multiline
            value={message}
            onChangeText={setMessage}
            placeholder="Enter your message..."
            placeholderTextColor={theme.muted}
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
    fontSize: 18,
    color: theme.text,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    backgroundColor: theme.input,
    color: theme.text,
    fontFamily: 'Inter',
    fontSize: 14,
    padding: 12,
    borderRadius: 8,
    height: 100,
    textAlignVertical: 'top',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelBtn: {
    marginRight: 16,
  },
  cancelText: {
    color: theme.muted,
    fontFamily: 'Inter',
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
  },
});

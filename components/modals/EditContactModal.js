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

export default function EditContactModal({
  visible,
  onClose,
  currentContact,
  onSave,
}) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [relationship, setRelationship] = useState('');

  useEffect(() => {
    if (visible && currentContact) {
    setName(currentContact.name);
    setNumber(currentContact.number);
    setRelationship(currentContact.relationship || '');
    }
  }, [visible]);

  const handleSave = async () => {
    if (!name || !number) {
      Alert.alert('Incomplete', 'Please enter both name and number.');
      return;
    }

    try {
        const contact = { name, number, relationship };
        await SecureStore.setItemAsync('emergencyContact', JSON.stringify(contact));
        onSave(contact);
      Alert.alert('Saved', 'Emergency contact updated.');
      onClose();
    } catch (e) {
      console.error('Failed to save contact:', e);
      Alert.alert('Error', 'Could not save contact. Try again.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Edit Emergency Contact</Text>

          <TextInput
            style={styles.input}
            placeholder="Contact name"
            placeholderTextColor={theme.muted}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor={theme.muted}
            keyboardType="phone-pad"
            value={number}
            onChangeText={setNumber}
          />

            <TextInput
            style={styles.input}
            placeholder="Relationship (e.g. Mum, Cousin)"
            placeholderTextColor={theme.muted}
            value={relationship}
            onChangeText={setRelationship}
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
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
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

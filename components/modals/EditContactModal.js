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
    const trimmedName = name.trim();
    const trimmedNumber = number.trim().replace(/^(\+65|\s)*/, ''); // remove +65 if present
    const trimmedRelationship = relationship.trim();

    if (!trimmedName || !trimmedNumber) {
      Alert.alert(
        'Fields Missing',
        'You are saving an empty emergency contact. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save Anyway',
            onPress: async () => {
              const contact = {
                name: trimmedName,
                number: '',
                relationship: trimmedRelationship,
              };
              try {
                await SecureStore.setItemAsync('emergencyContact', JSON.stringify(contact));
                onSave(contact);
                Alert.alert('Saved', 'Empty emergency contact saved.');
                onClose();
              } catch (e) {
                console.error('Failed to save contact:', e);
                Alert.alert('Error', 'Could not save contact. Try again.');
              }
            },
          },
        ]
      );
      return;
    }

    if (!/^[89]\d{7}$/.test(trimmedNumber)) {
      Alert.alert(
        'Invalid Number',
        'Please enter a valid 8-digit Singapore number starting with 8 or 9.'
      );
      return;
    }

    const contact = {
      name: trimmedName,
      number: trimmedNumber,
      relationship: trimmedRelationship,
    };

    try {
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

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{
              backgroundColor: theme.input,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 8,
              marginRight: 8,
            }}>
              <Text style={{ color: theme.text, fontSize: 14, fontFamily: 'Inter' }}>+65</Text>
            </View>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="8-digit number"
              placeholderTextColor={theme.muted}
              keyboardType="number-pad"
              maxLength={8}
              value={number}
              onChangeText={setNumber}
            />
          </View>

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
    fontSize: 20,
    color: theme.text,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 4,
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
  },
  cancelText: {
    color: theme.muted,
    fontFamily: 'Inter',
    paddingTop: 8,
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

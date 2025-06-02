// screens/Onboarding/SetPreferences.js

import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

// ← Import your OnboardingContext
import { OnboardingContext } from '../../contexts/OnboardingContext';

// ─── “Radio” helper subcomponents (unchanged) ──────────────────────
const RadioUnchecked = () => (
  <View style={styles.radioOuter}>
    <View style={styles.radioInnerUnselected} />
  </View>
);
const RadioChecked = () => (
  <View style={styles.radioOuter}>
    <View style={styles.radioInnerSelected} />
  </View>
);

// ─── “Checkbox” helper subcomponents (unchanged) ──────────────────
const CheckboxUnchecked = () => <View style={styles.checkboxBase} />;
const CheckboxChecked = () => (
  <View style={[styles.checkboxBase, styles.checkboxBaseChecked]}>
    <Text style={styles.checkboxMark}>✓</Text>
  </View>
);

export default function SetPreferencesScreen({ navigation, onFinish }) {
  // ─── Local state only for showing/hiding the Auto‐Wipe modal
  const [modalVisible, setModalVisible] = useState(false);

  // ─── Pull everything from OnboardingContext (no local useState for these)
  const {
    autoWipeChoice,
    locationEnabled,
    cameraEnabled,
    micEnabled,
    galleryEnabled,
    setField,
  } = useContext(OnboardingContext);

  // ─── Called when “Save” is tapped
  const handleSaveAll = () => {
    console.log('Collected preferences data:', {
      autoWipeChoice,
      locationEnabled,
      cameraEnabled,
      micEnabled,
      galleryEnabled,
    });
    navigation.replace('Tutorial');
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
        {/* ─── HEADING + SUBHEADING ───────────────────────────── */}
        <Text style={styles.heading}>Set Preferences</Text>
        <Text style={styles.subheading}>
          Customise optional features to match your safety needs. All can be changed later.
        </Text>

        {/* ─── MANAGE AUTO‐WIPE ───────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Manage Auto-wipe</Text>
          <Text style={styles.sectionText}>
            Automatically deletes media journal logs after a time you choose.
          </Text>

          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownText}>Select auto-wipe type</Text>
            <Text style={styles.dropdownValue}>{autoWipeChoice}</Text>
          </TouchableOpacity>
        </View>

        {/* ─── PRIVACY TOGGLES ───────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Privacy</Text>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setField('locationEnabled', !locationEnabled)}
            activeOpacity={0.7}
          >
            {locationEnabled ? <CheckboxChecked /> : <CheckboxUnchecked />}
            <Text style={styles.checkboxLabel}>Enable location tracking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setField('cameraEnabled', !cameraEnabled)}
            activeOpacity={0.7}
          >
            {cameraEnabled ? <CheckboxChecked /> : <CheckboxUnchecked />}
            <Text style={styles.checkboxLabel}>Enable camera access</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setField('micEnabled', !micEnabled)}
            activeOpacity={0.7}
          >
            {micEnabled ? <CheckboxChecked /> : <CheckboxUnchecked />}
            <Text style={styles.checkboxLabel}>Enable microphone access</Text>
          </TouchableOpacity>

          {/* ─── NEW: “Enable media gallery access” toggle ───────────────── */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setField('galleryEnabled', !galleryEnabled)}
            activeOpacity={0.7}
          >
            {galleryEnabled ? <CheckboxChecked /> : <CheckboxUnchecked />}
            <Text style={styles.checkboxLabel}>Enable media gallery access</Text>
          </TouchableOpacity>
        </View>

        {/* ─── BACK & SAVE BUTTONS ─────────────────────────── */}
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
            onPress={handleSaveAll}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ─── AUTO‐WIPE MODAL (unchanged styling) ───────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          <Text style={styles.modalHeading}>Auto-Wipe Settings</Text>
          <Text style={styles.modalHelpText}>
            Journal entries will automatically be deleted:
          </Text>

          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setField('autoWipeChoice', '24h')}
            activeOpacity={0.7}
          >
            {autoWipeChoice === '24h' ? <RadioChecked /> : <RadioUnchecked />}
            <Text style={styles.radioLabel}>Every 24h</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setField('autoWipeChoice', '48h')}
            activeOpacity={0.7}
          >
            {autoWipeChoice === '48h' ? <RadioChecked /> : <RadioUnchecked />}
            <Text style={styles.radioLabel}>Every 48h</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setField('autoWipeChoice', 'never')}
            activeOpacity={0.7}
          >
            {autoWipeChoice === 'never' ? <RadioChecked /> : <RadioUnchecked />}
            <Text style={styles.radioLabel}>Never</Text>
          </TouchableOpacity>

          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalDiscard]}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalDiscardText}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalSave]}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ───────────────────────────────────────────────────────────────────
// ─── STYLESHEET IS EXACTLY AS YOU PROVIDED EARLIER ─────────────────
// ─── (All style definitions unchanged, so the layout/colours match) ──
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
    marginBottom: 8,
  },
  subheading: {
    color: '#ddd',
    fontSize: 16,
    marginBottom: 24,
  },

  section: {
    marginBottom: 32,
  },
  sectionHeading: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionText: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 12,
  },

  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownValue: {
    color: '#aaa',
    fontSize: 16,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    marginTop: 24,
  },
  button: {
    width: 150,
    height: 50,
    backgroundColor: '#4181D4',
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  modalHeading: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalHelpText: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#888',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInnerUnselected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  radioInnerSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4181D4',
  },
  radioLabel: {
    color: '#fff',
    fontSize: 16,
  },

  modalButtonRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalDiscard: {
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  modalDiscardText: {
    color: '#E04C4C',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSave: {},
  modalSaveText: {
    color: '#4181D4',
    fontSize: 16,
    fontWeight: '600',
  },
});
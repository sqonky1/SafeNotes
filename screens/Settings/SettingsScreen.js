import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { theme } from '../../constants/colors';
import BackButton from '../../components/UI/BackButton';
import { SettingsContext } from '../../contexts/SettingsContext';
import { ChevronRight } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';

//modals
import EditMessageModal from '../../components/modals/EditMessageModal';
import EditContactModal from '../../components/modals/EditContactModal';
import ChangePinModal from '../../components/modals/ChangePinModal';
import SelectTTLModal from '../../components/modals/SelectTTLModal';

export default function SettingsScreen() {
  const {
    locationEnabled,
    setLocationEnabled,
    cameraEnabled,
    setCameraEnabled,
    micEnabled,
    setMicEnabled,
    galleryEnabled,
    setGalleryEnabled,
    emergencyMessage,
    setEmergencyMessage,
    emergencyContact,
    setEmergencyContact,
    accessPin,
    setAccessPin,
    autoWipeTTL,
    setAutoWipeTTL,
    isUnlocked,
    setIsUnlocked,
  } = useContext(SettingsContext);

  // Access PIN
  const [showPinModal, setShowPinModal] = useState(false);

  // Emergency message
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Emergency contact
  const [showContactModal, setShowContactModal] = useState(false);

  // Auto-wipe TTL
  const [showTTLModal, setShowTTLModal] = useState(false);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 10 : StatusBar.currentHeight,
        backgroundColor: theme.background,
      }}
    >
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <BackButton style={styles.backButton} />
            <Text style={styles.title}>Settings</Text>
          </View>

          {/* PRIVACY */}
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.group}>
            <SettingRow label="Update access PIN" onPress={() => setShowPinModal(true)} />
            <ValueRow
              label="Auto-wipe settings"
              value={autoWipeTTL === 'never' ? 'Never' : autoWipeTTL}
              onPress={() => setShowTTLModal(true)}
            />
            <ToggleRow
              label="Enable location tracking"
              value={locationEnabled}
              onValueChange={(val) => {
                setLocationEnabled(val);
                SecureStore.setItemAsync('locationEnabled', val.toString());
              }}
            />
            <ToggleRow
              label="Enable camera access"
              value={cameraEnabled}
              onValueChange={(val) => {
                setCameraEnabled(val);
                SecureStore.setItemAsync('cameraEnabled', val.toString());
              }}
            />
            <ToggleRow
              label="Enable microphone access"
              value={micEnabled}
              onValueChange={(val) => {
                setMicEnabled(val);
                SecureStore.setItemAsync('micEnabled', val.toString());
              }}
            />
            <ToggleRow
              label="Enable media gallery access"
              value={galleryEnabled}
              onValueChange={(val) => {
                setGalleryEnabled(val);
                SecureStore.setItemAsync('galleryEnabled', val.toString());
              }}
              last
            />
          </View>

          {/* SAFETY */}
          <Text style={styles.sectionTitle}>Safety</Text>
          <View style={styles.group}>
            <SettingRow
              label="Edit emergency message"
              onPress={() => setShowMessageModal(true)}
            />
            <SettingRow 
              label="Change emergency contact" 
              onPress={() => setShowContactModal(true)} 
              last
            />
          </View>
        </ScrollView>

        <EditMessageModal
          visible={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          currentMessage={emergencyMessage}
          onSave={setEmergencyMessage}
        />

        <EditContactModal
          visible={showContactModal}
          onClose={() => setShowContactModal(false)}
          currentContact={emergencyContact}
          onSave={setEmergencyContact}
        />

        <ChangePinModal
          visible={showPinModal}
          onClose={() => setShowPinModal(false)}
          onSave={setAccessPin}
        />

        <SelectTTLModal
          visible={showTTLModal}
          onClose={() => setShowTTLModal(false)}
          currentTTL={autoWipeTTL}
          onSave={setAutoWipeTTL}
        />
      </View>
    </SafeAreaView>
  );
}

  function SettingRow({ label, onPress, last = false }) {
    return (
      <TouchableOpacity
        style={[styles.row, last && styles.lastRow]}
        onPress={onPress}
      >
        <Text style={styles.rowText}>{label}</Text>
        <ChevronRight color={theme.muted} size={20} />
      </TouchableOpacity>
    );
  }

  function ToggleRow({ label, value, onValueChange, last = false }) {
    return (
      <View style={[styles.row, last && styles.lastRow]}>
        <Text style={styles.rowText}>{label}</Text>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#555', true: '#4181D4' }}
          thumbColor="#fff"
        />
      </View>
    );
  }

  function ValueRow({ label, value, onPress, last = false }) {
    return (
      <TouchableOpacity style={[styles.row, last && styles.lastRow]} onPress={onPress}>
        <Text style={styles.rowText}>{label}</Text>
        <Text style={styles.valueText}>{value}</Text>
      </TouchableOpacity>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,   // simulate status bar height + spacing
    paddingBottom: 0,
    position: 'relative',
  },
  title: {
    fontSize: 45,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    color: theme.text,
    marginLeft: 0, // pushes it slightly right of back button
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    marginTop: 11,
    marginBottom: 11,
  },
  group: {
    backgroundColor: theme.card,
    borderRadius: 12,
    paddingVertical: 5,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 54,
    borderBottomWidth: 1,
    borderColor: theme.border,
  },
  rowText: {
    color: theme.text,
    fontFamily: 'Inter',
    fontSize: 16,
  },
  lastRow: {
    borderBottomWidth: 0,
    paddingBottom: 10,       
  },
  backButton: {
    position: 'absolute',
    left: -25,
    top: -40,
  },
  valueText: {
    fontSize: 17,
    paddingRight: 3,
    color: theme.muted,
    fontFamily: 'Inter',
  },
});

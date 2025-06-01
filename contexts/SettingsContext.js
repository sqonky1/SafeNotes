import React, { createContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Privacy toggles
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [galleryEnabled, setGalleryEnabled] = useState(true);

  // Safety settings
  const [emergencyMessage, setEmergencyMessage] = useState('Help me, I am in danger. Please respond quickly.');
  const [emergencyContact, setEmergencyContact] = useState({
    name: 'Trusted Contact',
    number: '+6591234567',
    relationship: 'Friend',
  });

  // App config
  const [autoWipeTTL, setAutoWipeTTL] = useState('24h'); // '24h', '48h', 'never'
  const [accessPin, setAccessPin] = useState('1234'); // default pin

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedTTL = await SecureStore.getItemAsync('autoWipeTTL');
        if (storedTTL) setAutoWipeTTL(storedTTL);

        const storedMsg = await SecureStore.getItemAsync('emergencyMessage');
        if (storedMsg) setEmergencyMessage(storedMsg);

        const storedContact = await SecureStore.getItemAsync('emergencyContact');
        if (storedContact) setEmergencyContact(JSON.parse(storedContact));

        const storedPin = await SecureStore.getItemAsync('accessPin');
        if (storedPin) setAccessPin(storedPin);

        // ✅ NEW: Load privacy toggles
        const loc = await SecureStore.getItemAsync('locationEnabled');
        if (loc !== null) setLocationEnabled(loc === 'true');

        const cam = await SecureStore.getItemAsync('cameraEnabled');
        if (cam !== null) setCameraEnabled(cam === 'true');

        const mic = await SecureStore.getItemAsync('micEnabled');
        if (mic !== null) setMicEnabled(mic === 'true');

        const gal = await SecureStore.getItemAsync('galleryEnabled');
        if (gal !== null) setGalleryEnabled(gal === 'true');
      } catch (e) {
        console.warn('Failed to load settings:', e);
      }
    };

    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        isUnlocked,
        setIsUnlocked,

        // Toggles
        locationEnabled,
        setLocationEnabled,
        cameraEnabled,
        setCameraEnabled,
        micEnabled,
        setMicEnabled,
        galleryEnabled,
        setGalleryEnabled,

        // Config
        autoWipeTTL,
        setAutoWipeTTL,
        accessPin,
        setAccessPin,

        // Emergency
        emergencyMessage,
        setEmergencyMessage,
        emergencyContact,
        setEmergencyContact,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

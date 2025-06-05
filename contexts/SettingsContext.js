import React, { createContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import debounce from 'lodash.debounce';

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
  const [autoWipeTTL, setAutoWipeTTL] = useState('24h');
  const [accessPin, setAccessPin] = useState('1234');

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

  const debouncedSaveMessage = debounce(async (val) => {
    await SecureStore.setItemAsync('emergencyMessage', val);
  }, 500);

  const debouncedSaveAccessPin = debounce(async (val) => {
    await SecureStore.setItemAsync('accessPin', val);
  }, 500);

  const debouncedSaveAutoWipeTTL = debounce(async (val) => {
    await SecureStore.setItemAsync('autoWipeTTL', val);
  }, 500);

  return (
    <SettingsContext.Provider
      value={{
        isUnlocked,
        setIsUnlocked,

        locationEnabled,
        setLocationEnabled: async (val) => {
          setLocationEnabled(val);
          await SecureStore.setItemAsync('locationEnabled', JSON.stringify(val));
        },

        cameraEnabled,
        setCameraEnabled: async (val) => {
          setCameraEnabled(val);
          await SecureStore.setItemAsync('cameraEnabled', JSON.stringify(val));
        },

        micEnabled,
        setMicEnabled: async (val) => {
          setMicEnabled(val);
          await SecureStore.setItemAsync('micEnabled', JSON.stringify(val));
        },

        galleryEnabled,
        setGalleryEnabled: async (val) => {
          setGalleryEnabled(val);
          await SecureStore.setItemAsync('galleryEnabled', JSON.stringify(val));
        },

        autoWipeTTL,
        setAutoWipeTTL: (val) => {
          setAutoWipeTTL(val);
          debouncedSaveAutoWipeTTL(val);
        },

        accessPin,
        setAccessPin: (val) => {
          setAccessPin(val);
          debouncedSaveAccessPin(val);
        },

        emergencyMessage,
        setEmergencyMessage: (val) => {
          setEmergencyMessage(val);
          debouncedSaveMessage(val);
        },

        emergencyContact,
        setEmergencyContact: async (val) => {
          setEmergencyContact(val);
          await SecureStore.setItemAsync('emergencyContact', JSON.stringify(val));
        },
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

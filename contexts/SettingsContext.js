import React, { createContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import debounce from 'lodash.debounce';

export const SettingsContext = createContext();
export let _internalSetHasCompletedOnboarding = null;

export const SettingsProvider = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Privacy toggles
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [galleryEnabled, setGalleryEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false); // default off

  // Safety settings
  const [emergencyMessage, setEmergencyMessage] = useState('Help me, I am in danger. Please respond quickly.');
  const [emergencyContact, setEmergencyContact] = useState({
    name: 'Trusted Contact',
    number: '+6591234567',
    relationship: 'Friend',
  });

  // App config
  const [autoWipeTTL, setAutoWipeTTL] = useState('never');
  const [accessPin, setAccessPin] = useState('1234');

  //Onboarding state
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

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

        const onboard = await SecureStore.getItemAsync('hasCompletedOnboarding');
        if (onboard === 'true') setHasCompletedOnboarding(true);

        const bio = await SecureStore.getItemAsync('biometricEnabled');
        if (bio !== null) setBiometricEnabled(bio === 'true');
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

  _internalSetHasCompletedOnboarding = (val) => {
    setHasCompletedOnboarding(val);
  };

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

        hasCompletedOnboarding,
        setHasCompletedOnboarding: async (val) => {
          setHasCompletedOnboarding(val);
          await SecureStore.setItemAsync('hasCompletedOnboarding', JSON.stringify(val));
        },

        biometricEnabled,
        setBiometricEnabled: async (val) => {
          setBiometricEnabled(val);
          await SecureStore.setItemAsync('biometricEnabled', JSON.stringify(val));
        },
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

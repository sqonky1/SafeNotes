// contexts/OnboardingContext.js

import React, { createContext, useState } from 'react';

export const OnboardingContext = createContext({
  /* default shape: */
  pin: '',
  confirmPin: '',
  sosMessage: '',
  emergencyName: '',
  emergencyNumber: '',
  emergencyRelationship: '',
  shareLocationByDefault: true,
  autoWipeChoice: '24h',
  locationEnabled: true,
  cameraEnabled: true,
  micEnabled: true,
  galleryEnabled: true,
  setField: (key, value) => {},
});

export function OnboardingProvider({ children }) {
  // 1) PIN fields
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // 2) SOS screen fields
  const [sosMessage, setSosMessage] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyNumber, setEmergencyNumber] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  //const [shareLocationByDefault, setShareLocationByDefault] = useState(true);

  // 3) Preferences toggles
  const [autoWipeChoice, setAutoWipeChoice] = useState('never');
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [galleryEnabled, setGalleryEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // A generic setter so we can call context.setField('pin', '1234'), etc.
  const setField = (key, value) => {
    switch (key) {
      case 'pin':
        return setPin(value);
      case 'confirmPin':
        return setConfirmPin(value);
      case 'sosMessage':
        return setSosMessage(value);
      case 'emergencyName':
        return setEmergencyName(value);
      case 'emergencyNumber':
        return setEmergencyNumber(value);
      case 'emergencyRelationship':
        return setEmergencyRelationship(value);
      //case 'shareLocationByDefault':
        //return setShareLocationByDefault(value);
      case 'autoWipeChoice':
        return setAutoWipeChoice(value);
      case 'locationEnabled':
        return setLocationEnabled(value);
      case 'cameraEnabled':
        return setCameraEnabled(value);
      case 'micEnabled':
        return setMicEnabled(value);
      case 'galleryEnabled':
        return setGalleryEnabled(value);
      case 'biometricEnabled':
        return setBiometricEnabled(value);
      default:
        console.warn(`OnboardingContext: unknown key "${key}"`);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        pin,
        confirmPin,
        sosMessage,
        emergencyName,
        emergencyNumber,
        emergencyRelationship,
        //shareLocationByDefault,
        autoWipeChoice,
        locationEnabled,
        cameraEnabled,
        micEnabled,
        galleryEnabled,
        setField,
        biometricEnabled,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}
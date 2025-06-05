import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { _internalSetHasCompletedOnboarding } from '../contexts/SettingsContext';

export const resetAppDataAndRestartOnboarding = async () => {
  try {
    // 1. Wipe SecureStore
    const secureKeys = [
      'accessPin',
      'emergencyMessage',
      'emergencyContact',
      'autoWipeTTL',
      'locationEnabled',
      'cameraEnabled',
      'micEnabled',
      'galleryEnabled',
      'hasCompletedOnboarding',
    ];
    await Promise.all(secureKeys.map(key => SecureStore.deleteItemAsync(key)));

    // 2. Wipe AsyncStorage EXCEPT chatbot limit keys
    const allKeys = await AsyncStorage.getAllKeys();
    const keysToPreserve = ['@ChatbotExchangeCount-SG', '@ChatbotLastResetDate-SG'];
    const keysToDelete = allKeys.filter(k => !keysToPreserve.includes(k));
    await AsyncStorage.multiRemove(keysToDelete);

    // 3. Delete Journal media folder
    const mediaPath = FileSystem.documentDirectory + 'journal/';
    const folder = await FileSystem.getInfoAsync(mediaPath);
    if (folder.exists) {
      await FileSystem.deleteAsync(mediaPath, { idempotent: true });
    }

    const settingsContext = require('../contexts/SettingsContext');
    settingsContext._internalSetHasCompletedOnboarding?.(false);

    _internalSetHasCompletedOnboarding(false);
    alert('App has been fully reset.');
  } catch (e) {
    console.warn('❌ Reset failed:', e);
    alert('Reset failed. Please try again.');
  }
};

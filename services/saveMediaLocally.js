import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { generateUUID } from '../utils/generateUUID';
import { Platform } from 'react-native';

/**
 * Saves selected media to SafeNotes' local storage.
 * Handles ph:// (iOS) and content:// (Android) URIs.
 * Returns the internal file path.
 */
export async function saveMediaLocally(uri) {
  let actualUri = uri;

  // iOS fix: Convert ph:// → file:// using MediaLibrary
  if (Platform.OS === 'ios' && uri.startsWith('ph://')) {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      actualUri = asset.localUri;
    } catch (e) {
      console.error('❌ iOS asset conversion failed:', e);
      throw new Error('Failed to process iOS media');
    }
  }

  // Android fix: convert content:// using FileSystem
  if (Platform.OS === 'android' && uri.startsWith('content://')) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) throw new Error('Android URI file does not exist');
      
      console.log('Android file info:', fileInfo);
    } catch (e) {
      console.error('❌ Android file access failed:', e);
      throw new Error('Failed to process Android media');
    }
  }

  const ext = actualUri.split('.').pop().split('?')[0]; // remove query param if any
  const fileName = `${await generateUUID()}.${ext}`;
  const destPath = `${FileSystem.documentDirectory}${fileName}`;

  try {
    await FileSystem.copyAsync({
      from: actualUri,
      to: destPath,
    });
    return destPath;
  } catch (e) {
    console.error('❌ Failed to save media locally:', e);
    throw new Error('Copy failed');
  }
}

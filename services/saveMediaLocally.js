import * as FileSystem from 'expo-file-system';
import { generateUUID } from '../utils/generateUUID';

/**
 * Saves selected media to SafeNotes' local storage.
 * Returns the internal file path.
 */
export async function saveMediaLocally(uri) {
  const ext = uri.split('.').pop();
  const fileName = `${await generateUUID()}.${ext}`;
  const destPath = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.copyAsync({
    from: uri,
    to: destPath,
  });

  return destPath;
}

import * as FileSystem from 'expo-file-system';
import { generateUUID } from '../utils/generateUUID';
import Constants from 'expo-constants';

const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_HTML_BUCKET_NAME
} = Constants.expoConfig.extra;

export async function uploadHtmlToSupabase(htmlString) {
  const uuid = await generateUUID();
  const fileName = `sos_${uuid}.html`;
  const localPath = `${FileSystem.cacheDirectory}${fileName}`;

  // Write HTML string to local file
  await FileSystem.writeAsStringAsync(localPath, htmlString, { encoding: FileSystem.EncodingType.UTF8 });

  const formData = new FormData();
  formData.append('file', {
    uri: localPath,
    name: fileName,
    type: 'text/html'
  });

  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${SUPABASE_HTML_BUCKET_NAME}/${fileName}`;

  const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_HTML_BUCKET_NAME}/${fileName}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'text/html'
    },
    body: htmlString
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Upload failed: ${err}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_HTML_BUCKET_NAME}/${fileName}`;
}

// services/uploadMediaAndGetSignedUrl.js
import { generateUUID } from '../utils/generateUUID';
import Constants from 'expo-constants';

const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_BUCKET_NAME
} = Constants.expoConfig.extra;

console.log({ SUPABASE_URL, SUPABASE_BUCKET_NAME });

export async function uploadMediaAndGetPublicUrl(uri, mimeType = 'application/octet-stream') {
  // 1. Unique filename
  const ext      = uri.split('.').pop();
  const fileName = `${await generateUUID()}.${ext}`;

  // 2. Correct upload endpoint
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET_NAME}/${fileName}`;
  console.log('UPLOAD URL:', uploadUrl);

  // 3. Build multipart form
  const formData = new FormData();
  formData.append('file', { uri, name: fileName, type: mimeType });

  // 4. POST it
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    body: formData,
  });
  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Upload failed: ${err}`);
  }

  // 5. Return the PUBLIC URL
  const publicUrl = 
    `${SUPABASE_URL}/storage/v1/object/public/` +
    `${SUPABASE_BUCKET_NAME}/${fileName}`;
  console.log('PUBLIC URL:', publicUrl);
  return publicUrl;
 }

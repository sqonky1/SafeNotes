import { generateUUID } from '../utils/generateUUID';
import Constants from 'expo-constants';

const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_BUCKET_NAME
} = Constants.expoConfig.extra;

/**
 * Uploads media from local SafeNotes storage to Supabase,
 * stores public metadata, and returns public URL.
 */
export async function uploadMediaFromLocal(uri, mimeType = 'application/octet-stream') {
  const ext = uri.split('.').pop();
  const uuid = await generateUUID();
  const fileName = `${uuid}.${ext}`;
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET_NAME}/${fileName}`;

  const formData = new FormData();
  formData.append('file', { uri, name: fileName, type: mimeType });

  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    body: formData,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Upload failed: ${err}`);
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET_NAME}/${fileName}`;

  const metaRes = await fetch(`${SUPABASE_URL}/rest/v1/sos_media_temp`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
    },
    body: JSON.stringify({
        id: uuid,
        public_url: publicUrl,
        uploaded_at: new Date().toISOString(),
        mime_type: mimeType,
        tags: [mimeType.startsWith('image') ? 'image' : 'video']
    })
    });

    const roleRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/debug_current_role`, {
    method: 'POST',
    headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
    });

    const roleInfo = await roleRes.json();
    console.log('Role info:', roleInfo);

    const result = await metaRes.text();
    if (!metaRes.ok) {
    throw new Error(`Insert failed: ${result}`);
    }
    console.log('Metadata insert result:', result);

    return publicUrl;
}

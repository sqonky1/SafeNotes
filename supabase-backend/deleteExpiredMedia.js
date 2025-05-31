import dotenv from 'dotenv';
dotenv.config();

// deleteExpiredMedia.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

  const { data: expired, error: fetchError } = await supabase
    .from('sos_media_temp')
    .select('*')
    .lte('uploaded_at', cutoff);

  if (fetchError) {
    console.error('Error fetching expired media:', fetchError);
    return res.status(500).json({ error: 'Fetch failed' });
  }

  for (const item of expired) {
    const path = item.public_url.split('/').pop();

    const { error: storageError } = await supabase
      .storage
      .from('safenotes-media')
      .remove([path]);

    if (storageError) {
      console.error(`Error deleting file ${path}:`, storageError);
    }

    const { error: deleteError } = await supabase
      .from('sos_media_temp')
      .delete()
      .eq('id', item.id);

    if (deleteError) {
      console.error(`Error deleting DB row for ${item.id}:`, deleteError);
    }
  }

  return res.status(200).json({ message: 'Expired media cleaned up.' });
}

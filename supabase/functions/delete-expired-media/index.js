import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  )

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: expired, error: fetchError } = await supabase
    .from('sos_media_temp')
    .select('*')
    .lte('uploaded_at', cutoff)

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 })
  }

  for (const item of expired) {
    const path = item.public_url.split('/').pop()

    await supabase.storage.from('safenotes-media').remove([path])
    await supabase.from('sos_media_temp').delete().eq('id', item.id)
  }

  return new Response(JSON.stringify({ message: 'Expired media deleted.' }), { status: 200 })
})

const token = req.headers.get('x-cron-token')
if (token !== Deno.env.get('CRON_SECRET')) {
  return new Response('Unauthorized', { status: 401 })
}

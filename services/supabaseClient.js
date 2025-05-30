import { createClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'; // required for React Native env

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
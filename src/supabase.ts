import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xyrylvauphftxiktektf.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY

if (!supabaseKey) {
   throw new Error('Please specify a Supabase key in the .env file')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

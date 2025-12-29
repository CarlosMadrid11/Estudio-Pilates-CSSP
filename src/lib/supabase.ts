import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// DEBUG: Ver qué valores tiene
console.log('🔍 DEBUG - supabaseUrl:', supabaseUrl)
console.log('🔍 DEBUG - supabaseAnonKey:', supabaseAnonKey)
console.log('🔍 DEBUG - Todas las env:', import.meta.env)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables faltantes!')
  throw new Error('Faltan las variables de entorno de Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
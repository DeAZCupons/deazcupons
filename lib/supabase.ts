import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// createBrowserClient (em vez do createClient puro) guarda a sessão em
// cookies, não em localStorage — é isso que permite o middleware.ts
// (que roda no servidor) ler a mesma sessão que o navegador tem.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

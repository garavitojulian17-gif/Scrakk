// =========================================
// SUPABASE MAIN DATABASE CONFIGURATION
// Compatible con Netlify Environment Variables
// =========================================

// Obtener configuración desde window.ENV_CONFIG (generado por config.js o Netlify)
const SUPABASE_URL = window.ENV_CONFIG?.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.ENV_CONFIG?.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[Supabase] Error: Variables de entorno no configuradas. Verifica tu configuración en Netlify o ejecuta: npm run config');
  throw new Error('Supabase configuration missing');
}

// Inicializar cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exportar cliente global
window.supabaseClient = supabase;

console.log('[Supabase] Cliente de base de datos principal inicializado');

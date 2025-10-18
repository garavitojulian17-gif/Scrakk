// =========================================
// SUPABASE MAIN DATABASE CONFIGURATION
// Variables inyectadas inline durante build
// =========================================

if (!window.ENV_CONFIG || !window.ENV_CONFIG.SUPABASE_URL || !window.ENV_CONFIG.SUPABASE_ANON_KEY) {
  console.error('[Supabase] Error: Variables de entorno no configuradas');
  throw new Error('Supabase configuration missing');
}

// Inicializar cliente de Supabase
const supabase = window.supabase.createClient(
  window.ENV_CONFIG.SUPABASE_URL,
  window.ENV_CONFIG.SUPABASE_ANON_KEY
);

// Exportar cliente global
window.supabaseClient = supabase;

console.log('[Supabase] Cliente inicializado');

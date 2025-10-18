// =========================================
// SUPABASE MAIN DATABASE CONFIGURATION
// Configuración principal usando variables de entorno
// =========================================

// Verificar que config.js esté cargado
if (!window.ENV_CONFIG) {
  console.error('[Supabase] Error: config.js no está cargado. Asegúrate de incluirlo en el HTML antes de este script.');
  throw new Error('Config not loaded');
}

// Obtener configuración desde variables de entorno
const SUPABASE_URL = window.ENV_CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.ENV_CONFIG.SUPABASE_ANON_KEY;

// Validar que las variables estén configuradas
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[Supabase] Error: Configuración incompleta. Verifica tu archivo .env');
  throw new Error('Missing Supabase configuration');
}

// Inicializar cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exportar cliente global
window.supabaseClient = supabase;

console.log('[Supabase] Cliente de base de datos principal inicializado');

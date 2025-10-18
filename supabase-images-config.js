// =========================================
// SUPABASE IMAGES DATABASE CONFIGURATION
// Variables inyectadas inline durante build
// =========================================

if (!window.ENV_CONFIG || !window.ENV_CONFIG.SUPABASE_IMAGES_URL || !window.ENV_CONFIG.SUPABASE_IMAGES_ANON_KEY) {
  console.error('[Supabase Images] Error: Variables de entorno no configuradas');
  throw new Error('Supabase Images configuration missing');
}

// Inicializar cliente de Supabase para imágenes
const supabaseImages = window.supabase.createClient(
  window.ENV_CONFIG.SUPABASE_IMAGES_URL,
  window.ENV_CONFIG.SUPABASE_IMAGES_ANON_KEY
);

// Exportar cliente global
window.supabaseImagesClient = supabaseImages;

console.log('[Supabase Images] Cliente inicializado');

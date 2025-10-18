// =========================================
// SUPABASE IMAGES DATABASE CONFIGURATION
// Base de datos separada para almacenar imágenes en base64
// Configuración usando variables de entorno
// =========================================

// Verificar que config.js esté cargado
if (!window.ENV_CONFIG) {
  console.error('[Supabase Images] Error: config.js no está cargado. Asegúrate de incluirlo en el HTML antes de este script.');
  throw new Error('Config not loaded');
}

// Obtener configuración desde variables de entorno
const SUPABASE_IMAGES_URL = window.ENV_CONFIG.SUPABASE_IMAGES_URL;
const SUPABASE_IMAGES_ANON_KEY = window.ENV_CONFIG.SUPABASE_IMAGES_ANON_KEY;

// Validar que las variables estén configuradas
if (!SUPABASE_IMAGES_URL || !SUPABASE_IMAGES_ANON_KEY) {
  console.error('[Supabase Images] Error: Configuración incompleta. Verifica tu archivo .env');
  throw new Error('Missing Supabase Images configuration');
}

// Inicializar cliente de Supabase para imágenes
const supabaseImages = window.supabase.createClient(SUPABASE_IMAGES_URL, SUPABASE_IMAGES_ANON_KEY);

// Exportar cliente global
window.supabaseImagesClient = supabaseImages;

console.log('[Supabase Images] Cliente de base de datos de imágenes inicializado');

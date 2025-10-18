// =========================================
// SUPABASE IMAGES DATABASE CONFIGURATION
// Base de datos separada para almacenar imágenes en base64
// Compatible con Netlify Environment Variables
// =========================================

// Obtener configuración desde window.ENV_CONFIG (generado por config.js o Netlify)
const SUPABASE_IMAGES_URL = window.ENV_CONFIG?.SUPABASE_IMAGES_URL || '';
const SUPABASE_IMAGES_ANON_KEY = window.ENV_CONFIG?.SUPABASE_IMAGES_ANON_KEY || '';

if (!SUPABASE_IMAGES_URL || !SUPABASE_IMAGES_ANON_KEY) {
  console.error('[Supabase Images] Error: Variables de entorno no configuradas. Verifica tu configuración en Netlify o ejecuta: npm run config');
  throw new Error('Supabase Images configuration missing');
}

// Inicializar cliente de Supabase para imágenes
const supabaseImages = window.supabase.createClient(SUPABASE_IMAGES_URL, SUPABASE_IMAGES_ANON_KEY);

// Exportar cliente global
window.supabaseImagesClient = supabaseImages;

console.log('[Supabase Images] Cliente de base de datos de imágenes inicializado');

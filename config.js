// =========================================
// CONFIGURACIÓN DE SUPABASE - PRODUCCIÓN
// SOLO USA KEYS PÚBLICAS (anon) - NUNCA SERVICE KEYS
// =========================================

window.ENV_CONFIG = {
  // Supabase Main Database
  SUPABASE_URL: 'https://unfftdyijijoyqoiinlb.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZmZ0ZHlpamlqb3lxb2lpbmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjYxMDYsImV4cCI6MjA3NjA0MjEwNn0.xDcPDYNzZR8sRy_sKUzEBXLgDC4osA0r5x6a89Ax6qU',
  
  // Supabase Images Database
  SUPABASE_IMAGES_URL: 'https://pozftvedupursetfpkec.supabase.co',
  SUPABASE_IMAGES_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvemZ0dmVkdXB1cnNldGZwa2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjYzNjQsImV4cCI6MjA3NjE0MjM2NH0.cSbW7HT4465DBnc67DO8FcvOck3esj4iF5ZX35cxvPE',
};

console.log('[Config] ✅ Configuración cargada correctamente');

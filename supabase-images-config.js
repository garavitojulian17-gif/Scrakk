// =========================================
// SUPABASE IMAGES DATABASE CONFIGURATION
// Base de datos separada para almacenar imágenes en base64
// Configuración directa sin dependencias
// =========================================

// Configuración de Supabase Images Database
const SUPABASE_IMAGES_URL = 'https://pozftvedupursetfpkec.supabase.co';
const SUPABASE_IMAGES_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvemZ0dmVkdXB1cnNldGZwa2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjYzNjQsImV4cCI6MjA3NjE0MjM2NH0.cSbW7HT4465DBnc67DO8FcvOck3esj4iF5ZX35cxvPE';

// Inicializar cliente de Supabase para imágenes
const supabaseImages = window.supabase.createClient(SUPABASE_IMAGES_URL, SUPABASE_IMAGES_ANON_KEY);

// Exportar cliente global
window.supabaseImagesClient = supabaseImages;

console.log('[Supabase Images] Cliente de base de datos de imágenes inicializado');

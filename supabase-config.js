// =========================================
// SUPABASE MAIN DATABASE CONFIGURATION
// Configuración directa sin dependencias
// =========================================

// Configuración de Supabase Main Database
const SUPABASE_URL = 'https://unfftdyijijoyqoiinlb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZmZ0ZHlpamlqb3lxb2lpbmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjYxMDYsImV4cCI6MjA3NjA0MjEwNn0.xDcPDYNzZR8sRy_sKUzEBXLgDC4osA0r5x6a89Ax6qU';

// Inicializar cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exportar cliente global
window.supabaseClient = supabase;

console.log('[Supabase] Cliente de base de datos principal inicializado');

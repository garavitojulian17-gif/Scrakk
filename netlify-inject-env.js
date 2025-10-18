// =========================================
// NETLIFY ENVIRONMENT VARIABLES INJECTOR
// Este script inyecta las variables de entorno en tiempo de build
// =========================================

// Obtener variables de entorno de Netlify
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const SUPABASE_IMAGES_URL = process.env.SUPABASE_IMAGES_URL || '';
const SUPABASE_IMAGES_ANON_KEY = process.env.SUPABASE_IMAGES_ANON_KEY || '';

// Generar el contenido del archivo config.js
const configContent = `// =========================================
// CONFIGURACIÓN GENERADA AUTOMÁTICAMENTE
// Generado desde variables de entorno de Netlify
// =========================================

window.ENV_CONFIG = {
  SUPABASE_URL: '${SUPABASE_URL}',
  SUPABASE_ANON_KEY: '${SUPABASE_ANON_KEY}',
  SUPABASE_SERVICE_KEY: '${SUPABASE_SERVICE_KEY}',
  SUPABASE_IMAGES_URL: '${SUPABASE_IMAGES_URL}',
  SUPABASE_IMAGES_ANON_KEY: '${SUPABASE_IMAGES_ANON_KEY}'
};

console.log('[Config] Configuración cargada desde variables de entorno');
`;

// Escribir el archivo
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.js');
fs.writeFileSync(configPath, configContent, 'utf-8');

console.log('✅ config.js generado desde variables de entorno de Netlify');

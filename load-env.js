// =========================================
// LOAD ENV - Script para generar config desde .env
// =========================================
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  
  // Si no existe .env, copiar desde .env.example
  if (!fs.existsSync(envPath)) {
    const examplePath = path.join(__dirname, '.env.example');
    if (fs.existsSync(examplePath)) {
      console.log('⚠️  No se encontró .env, copiando desde .env.example...');
      fs.copyFileSync(examplePath, envPath);
      console.log('✅ Archivo .env creado. Por favor, configura tus API keys.');
    } else {
      console.error('❌ Error: No se encontró .env ni .env.example');
      process.exit(1);
    }
  }

  // Leer .env
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  // Generar config.js
  const configContent = `// =========================================
// CONFIGURACIÓN GENERADA AUTOMÁTICAMENTE
// Este archivo es generado desde .env - NO EDITAR MANUALMENTE
// =========================================

// Configuración de entorno
window.ENV_CONFIG = {
  // Supabase Main Database
  SUPABASE_URL: '${envVars.SUPABASE_URL || ''}',
  SUPABASE_ANON_KEY: '${envVars.SUPABASE_ANON_KEY || ''}',
  SUPABASE_SERVICE_KEY: '${envVars.SUPABASE_SERVICE_KEY || ''}',
  
  // Supabase Images Database
  SUPABASE_IMAGES_URL: '${envVars.SUPABASE_IMAGES_URL || ''}',
  SUPABASE_IMAGES_ANON_KEY: '${envVars.SUPABASE_IMAGES_ANON_KEY || ''}',
};

console.log('[Config] Configuración cargada desde .env');
`;

  const configPath = path.join(__dirname, 'config.js');
  fs.writeFileSync(configPath, configContent, 'utf-8');
  console.log('✅ Archivo config.js generado exitosamente');
}

// Ejecutar
try {
  loadEnv();
} catch (error) {
  console.error('❌ Error al cargar variables de entorno:', error.message);
  process.exit(1);
}

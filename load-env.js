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

  // Script inline para inyectar en HTML (desarrollo local)
  const inlineScript = `<script>window.ENV_CONFIG={SUPABASE_URL:'${envVars.SUPABASE_URL || ''}',SUPABASE_ANON_KEY:'${envVars.SUPABASE_ANON_KEY || ''}',SUPABASE_SERVICE_KEY:'${envVars.SUPABASE_SERVICE_KEY || ''}',SUPABASE_IMAGES_URL:'${envVars.SUPABASE_IMAGES_URL || ''}',SUPABASE_IMAGES_ANON_KEY:'${envVars.SUPABASE_IMAGES_ANON_KEY || ''}'}</script>`;

  // Archivos HTML a procesar
  const htmlFiles = ['proyectos.html', 'login.html', 'producto.html'];

  htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      // Reemplazar la línea que carga config.js con el script inline
      content = content.replace(
        /<script src="config\.js"><\/script>/g,
        inlineScript
      );
      
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Variables inyectadas en ${file}`);
    }
  });

  console.log('✅ Variables de entorno inyectadas directamente en HTML');
}

// Ejecutar
try {
  loadEnv();
} catch (error) {
  console.error('❌ Error al cargar variables de entorno:', error.message);
  process.exit(1);
}

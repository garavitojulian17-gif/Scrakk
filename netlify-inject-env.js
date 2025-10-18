// =========================================
// NETLIFY ENVIRONMENT VARIABLES INJECTOR
// Inyecta variables directamente en HTML sin crear config.js
// =========================================

const fs = require('fs');
const path = require('path');

// Obtener variables de entorno de Netlify
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const SUPABASE_IMAGES_URL = process.env.SUPABASE_IMAGES_URL || '';
const SUPABASE_IMAGES_ANON_KEY = process.env.SUPABASE_IMAGES_ANON_KEY || '';

// Script inline que se inyectará en el HTML
const inlineScript = `<script>window.ENV_CONFIG={SUPABASE_URL:'${SUPABASE_URL}',SUPABASE_ANON_KEY:'${SUPABASE_ANON_KEY}',SUPABASE_SERVICE_KEY:'${SUPABASE_SERVICE_KEY}',SUPABASE_IMAGES_URL:'${SUPABASE_IMAGES_URL}',SUPABASE_IMAGES_ANON_KEY:'${SUPABASE_IMAGES_ANON_KEY}'}</script>`;

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

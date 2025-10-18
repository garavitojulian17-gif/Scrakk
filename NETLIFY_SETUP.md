# Configuración de Variables de Entorno en Netlify

## Variables requeridas

En **Netlify Dashboard** → **Site settings** → **Environment variables**, agrega las siguientes variables:

### Base de datos principal (Supabase Main)
```
SUPABASE_URL=https://unfftdyijijoyqoiinlb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZmZ0ZHlpamlqb3lxb2lpbmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjYxMDYsImV4cCI6MjA3NjA0MjEwNn0.xDcPDYNzZR8sRy_sKUzEBXLgDC4osA0r5x6a89Ax6qU
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZmZ0ZHlpamlqb3lxb2lpbmxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ2NjEwNiwiZXhwIjoyMDc2MDQyMTA2fQ.RwheHES3yEPcDf-fxxHV6TR-KsWsjsKMs-OLcCGvGQ4
```

### Base de datos de imágenes (Supabase Images)
```
SUPABASE_IMAGES_URL=https://pozftvedupursetfpkec.supabase.co
SUPABASE_IMAGES_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvemZ0dmVkdXB1cnNldGZwa2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjYzNjQsImV4cCI6MjA3NjE0MjM2NH0.cSbW7HT4465DBnc67DO8FcvOck3esj4iF5ZX35cxvPE
```

## ¿Cómo funciona?

1. **En desarrollo local**: Ejecuta `npm run config` para generar `config.js` desde tu archivo `.env`
2. **En Netlify**: El script `netlify-inject-env.js` se ejecuta automáticamente durante el build y genera `config.js` desde las variables de entorno de Netlify

## Seguridad

✅ **Las API keys NO están hardcodeadas en el código**
✅ Las variables de entorno están protegidas en Netlify
✅ El archivo `config.js` generado NO se sube al repositorio (está en `.gitignore`)
✅ Las claves solo se inyectan en tiempo de build

## Build Command

El `netlify.toml` ya está configurado con:
```toml
[build]
  publish = "."
  command = "node netlify-inject-env.js"
```

Esto ejecuta automáticamente el script de inyección antes del deployment.

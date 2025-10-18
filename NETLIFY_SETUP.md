# Configuración de Variables de Entorno en Netlify

## Variables requeridas

En **Netlify Dashboard** → **Site settings** → **Environment variables**, agrega estas variables:

```
SUPABASE_URL=https://unfftdyijijoyqoiinlb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZmZ0ZHlpamlqb3lxb2lpbmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjYxMDYsImV4cCI6MjA3NjA0MjEwNn0.xDcPDYNzZR8sRy_sKUzEBXLgDC4osA0r5x6a89Ax6qU
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZmZ0ZHlpamlqb3lxb2lpbmxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ2NjEwNiwiZXhwIjoyMDc2MDQyMTA2fQ.RwheHES3yEPcDf-fxxHV6TR-KsWsjsKMs-OLcCGvGQ4
SUPABASE_IMAGES_URL=https://pozftvedupursetfpkec.supabase.co
SUPABASE_IMAGES_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvemZ0dmVkdXB1cnNldGZwa2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjYzNjQsImV4cCI6MjA3NjE0MjM2NH0.cSbW7HT4465DBnc67DO8FcvOck3esj4iF5ZX35cxvPE
```

## Arquitectura

**🔒 API keys NUNCA llegan al navegador**

```
Cliente (navegador)  →  Netlify Functions (servidor)  →  Supabase
                         ↑ Las API keys solo existen aquí
```

### Netlify Functions creadas:
- `/.netlify/functions/get-projects` - Lista proyectos
- `/.netlify/functions/get-project` - Detalle de proyecto
- `/.netlify/functions/login` - Autenticación
- `/.netlify/functions/increment-downloads` - Incrementar descargas

Las API keys solo existen en las **Netlify Functions** (server-side), nunca en el cliente.

## Configuración

1. Pega las variables en Netlify Dashboard
2. Deploy automático
3. Las functions se ejecutan server-side con acceso a las variables de entorno

✅ **100% seguro** - Las API keys están solo en el servidor
✅ **Sin archivos config.js** - No hay nada que exponer
✅ **Serverless** - Netlify Functions maneja todo

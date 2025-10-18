# 🚀 Setup Rápido - Scrakk Code Editor Web

## ✅ Configuración Completada

Tu proyecto ya está configurado con el sistema de variables de entorno. Aquí está lo que se hizo:

### 📁 Archivos Creados/Modificados

1. **`.env`** - Contiene tus credenciales de Supabase (ya configurado)
2. **`config.js`** - Archivo generado automáticamente con las variables de entorno
3. **`.env.example`** - Template de ejemplo para otros desarrolladores
4. **`load-env.js`** - Script que genera `config.js` desde `.env`
5. **`.gitignore`** - Actualizado para proteger archivos sensibles

### 🔧 Archivos Actualizados

- ✅ `supabase-config.js` - Ahora usa variables de entorno
- ✅ `supabase-images-config.js` - Ahora usa variables de entorno
- ✅ `package.json` - Scripts actualizados con `predev`, `build`, `config`
- ✅ `home.html` - (requiere actualización manual si usa Supabase)
- ✅ `proyectos.html` - Incluye `config.js`
- ✅ `login.html` - Incluye `config.js`

## 🎯 Cómo Funciona

### Flujo de Carga de Configuración

```
1. .env (variables de entorno)
   ↓
2. load-env.js (lee .env)
   ↓
3. config.js (generado automáticamente)
   ↓
4. supabase-config.js / supabase-images-config.js (leen config.js)
   ↓
5. Tu aplicación usa los clientes de Supabase
```

### Orden de Scripts en HTML

**IMPORTANTE:** El orden correcto es:

```html
<!-- 1. CDN de Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- 2. Configuración de entorno (PRIMERO) -->
<script src="config.js"></script>

<!-- 3. Configuración de Supabase (SEGUNDO) -->
<script src="supabase-config.js"></script>

<!-- 4. (Opcional) Configuración de Supabase Images -->
<script src="supabase-images-config.js"></script>

<!-- 5. Tu código JavaScript -->
<script src="tu-codigo.js"></script>
```

## 🏃 Comandos Disponibles

### Desarrollo
```bash
npm run dev
```
- Genera `config.js` automáticamente
- Inicia servidor en `http://localhost:5173`

### Regenerar Config
```bash
npm run config
```
- Regenera `config.js` desde `.env`
- Útil después de cambiar credenciales

### Build para Producción
```bash
npm run build
```
- Genera `config.js` para producción

## 🔐 Seguridad

### ⚠️ NUNCA subir a Git:
- ❌ `.env` - Contiene credenciales reales
- ❌ `config.js` - Generado automáticamente con credenciales

### ✅ Sí subir a Git:
- ✅ `.env.example` - Template sin credenciales
- ✅ `load-env.js` - Script de generación
- ✅ `supabase-config.js` - Solo código de inicialización
- ✅ `.gitignore` - Protección de archivos sensibles

## 📊 Estructura de Base de Datos

Tu proyecto usa **2 bases de datos de Supabase**:

### 1️⃣ Main Database
- **Propósito:** Datos principales (usuarios, proyectos, extensiones, etc.)
- **URL:** `SUPABASE_URL`
- **Keys:** 
  - `SUPABASE_ANON_KEY` - Para cliente web
  - `SUPABASE_SERVICE_KEY` - Solo para admin (NO usar en cliente)

### 2️⃣ Images Database
- **Propósito:** Almacenamiento de imágenes en base64
- **URL:** `SUPABASE_IMAGES_URL`
- **Key:** `SUPABASE_IMAGES_ANON_KEY`

## 🛠️ Solución de Problemas

### Error: "config.js no está cargado"
```bash
npm run config
```

### Error: "Missing Supabase configuration"
1. Verifica que `.env` existe
2. Verifica que todas las variables estén configuradas
3. Ejecuta `npm run config`

### Las credenciales no funcionan
1. Verifica en Supabase Dashboard que las keys sean correctas
2. Actualiza `.env` con las credenciales correctas
3. Ejecuta `npm run config`
4. Recarga la página

## 📝 Notas Importantes

### ⚡ API de Gemini
**NO incluida:** Este proyecto no tiene configuración de Gemini API. Si necesitas IA:
1. Agrega `GEMINI_API_KEY` a `.env`
2. Actualiza `load-env.js` para incluirla
3. Usa la key en tu código según necesites

### 🔒 RLS (Row Level Security)
- **Estado actual:** DESHABILITADO
- **Recomendación:** Habilitar RLS en producción para mayor seguridad

### 🔑 Service Role Key
- Solo para scripts de administración
- NO usar en código del cliente
- Para enviar notificaciones push

## 🎉 ¡Listo para Usar!

Tu proyecto está completamente configurado. Para empezar:

```bash
npm run dev
```

El navegador abrirá automáticamente en `http://localhost:5173/home.html`

---

**¿Problemas?** Revisa `README.md` para documentación completa.

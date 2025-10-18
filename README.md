# Scrakk Code Editor - Web

Sitio web estático para Scrakk Code Editor con integración a Supabase.

## 📋 Requisitos Previos

- Node.js 14+ instalado
- npm o yarn
- Cuentas de Supabase configuradas (main database + images database)

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd "Synix Editor Code Web"
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   El proyecto incluye un archivo `.env.example` con las configuraciones por defecto. 
   
   - Si es la **primera vez**, el script creará automáticamente el archivo `.env` desde `.env.example`
   - Si necesitas **cambiar las API keys**, crea manualmente un archivo `.env` o edita el existente:

   ```bash
   # Copiar template (opcional si no existe .env)
   cp .env.example .env
   ```

   Luego edita `.env` con tus credenciales:
   ```env
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_ANON_KEY=tu_anon_key
   SUPABASE_SERVICE_KEY=tu_service_key
   SUPABASE_IMAGES_URL=tu_url_de_imagenes
   SUPABASE_IMAGES_ANON_KEY=tu_anon_key_imagenes
   ```

4. **Generar archivo de configuración**
   ```bash
   npm run config
   ```
   
   Esto generará el archivo `config.js` con las variables de entorno cargadas.

## 🛠️ Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

Esto ejecutará automáticamente:
1. `node load-env.js` - Genera `config.js` desde `.env`
2. Inicia `live-server` en `http://localhost:5173`

El navegador se abrirá automáticamente en `home.html`.

## 📂 Estructura del Proyecto

```
.
├── .env                        # Variables de entorno (NO incluir en git)
├── .env.example                # Template de variables de entorno
├── config.js                   # Configuración generada (NO incluir en git)
├── load-env.js                 # Script para generar config.js
├── supabase-config.js          # Cliente de Supabase (main database)
├── supabase-images-config.js   # Cliente de Supabase (images database)
├── home.html                   # Página principal
├── proyectos.html              # Página de proyectos públicos
├── login.html                  # Página de login
└── styles.css                  # Estilos globales
```

## 🔐 Seguridad

**IMPORTANTE:**
- El archivo `.env` contiene credenciales sensibles y **NO debe incluirse en el control de versiones**
- El archivo `config.js` es generado automáticamente y **NO debe editarse manualmente**
- Ambos archivos están en `.gitignore` por seguridad
- **NO uses la `SUPABASE_SERVICE_KEY` en el cliente** - solo para scripts de administración

## 🗄️ Base de Datos

Este proyecto usa **dos bases de datos de Supabase**:

### 1. Main Database (Datos principales)
- **URL:** `SUPABASE_URL`
- **Key:** `SUPABASE_ANON_KEY`
- **Contenido:** Usuarios, proyectos, extensiones, notificaciones, etc.
- **SQL:** Ver archivo SQL proporcionado para la estructura completa

### 2. Images Database (Imágenes en Base64)
- **URL:** `SUPABASE_IMAGES_URL`
- **Key:** `SUPABASE_IMAGES_ANON_KEY`
- **Contenido:** Avatares de usuarios e imágenes de proyectos
- **SQL:** Ver archivo SQL de imágenes para la estructura

## 📝 Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo (genera config.js automáticamente)
- `npm run build` - Genera config.js para producción
- `npm run config` - Regenera config.js desde .env

## 🌐 Despliegue

### Netlify (Recomendado)

1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno en Netlify Dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `SUPABASE_IMAGES_URL`
   - `SUPABASE_IMAGES_ANON_KEY`

3. Build command: `npm run build`
4. Publish directory: `.`

### Otros Servicios

Para otros servicios de hosting estático:
1. Genera `config.js` localmente: `npm run config`
2. Sube todos los archivos excepto `.env` y `node_modules`

## ⚠️ Notas Importantes

- **Gemini API**: Este proyecto NO incluye la configuración de Gemini API. Si necesitas integración con IA, configúrala por separado.
- **RLS Deshabilitado**: Las tablas de Supabase tienen Row Level Security deshabilitado para acceso público. Considera habilitar RLS para mayor seguridad en producción.
- **Service Role**: La `SUPABASE_SERVICE_KEY` solo debe usarse para scripts de administración, NO en el cliente web.

## 🆘 Solución de Problemas

### Error: "config.js no está cargado"
**Solución:** Ejecuta `npm run config` para generar el archivo de configuración.

### Error: "No se encontró .env"
**Solución:** El script creará `.env` desde `.env.example` automáticamente. Si necesitas credenciales diferentes, edita `.env` manualmente.

### Error: "Missing Supabase configuration"
**Solución:** Verifica que todas las variables en `.env` estén correctamente configuradas y ejecuta `npm run config`.

## 📧 Soporte

Para más información, consulta la documentación de:
- [Supabase](https://supabase.com/docs)
- [Live Server](https://www.npmjs.com/package/live-server)

---

**Versión:** 1.0.0  
**Licencia:** Privada

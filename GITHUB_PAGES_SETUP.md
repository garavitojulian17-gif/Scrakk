# 🚀 Configuración para GitHub Pages

## Arquitectura

**GitHub Pages = Hosting estático (solo HTML, CSS, JS)**

```
Cliente (navegador)  →  Supabase (directo)
                        ↑ API keys públicas (anon keys)
```

⚠️ **IMPORTANTE**: Como GitHub Pages solo soporta sitios estáticos (sin backend), las API keys de Supabase estarán en el código del cliente. Asegúrate de usar **Row Level Security (RLS)** en Supabase para proteger tus datos.

## ✨ Este proyecto es 100% estático

- ❌ No usa Node.js
- ❌ No usa npm
- ❌ No tiene build process
- ✅ Solo archivos HTML, CSS y JavaScript
- ✅ Carga directamente en el navegador

## 📋 Pasos para desplegar

### 1. Configurar las API keys

Renombra `config-local.js.example` a `config-local.js` y agrega tus keys:

```javascript
window.ENV_CONFIG = {
  SUPABASE_URL: 'https://tu-proyecto.supabase.co',
  SUPABASE_ANON_KEY: 'tu-anon-key-publica',
  SUPABASE_IMAGES_URL: 'https://tu-proyecto-imagenes.supabase.co',
  SUPABASE_IMAGES_ANON_KEY: 'tu-anon-key-imagenes-publica'
};
```

⚠️ **IMPORTANTE**: `config-local.js` está en `.gitignore`. Para producción, crea `config.js` con las mismas keys.

### 2. Preparar el repositorio

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

### 2. Configurar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Pages**
3. En **Source**, selecciona la rama `main`
4. En **Folder**, selecciona `/ (root)`
5. Click en **Save**

### 3. Configurar página de inicio (opcional)

Crea un archivo `index.html` que redirija a `home.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0; url=home.html">
</head>
<body>
  <p>Redirigiendo...</p>
</body>
</html>
```

## 🔒 Seguridad en Supabase

Como las keys están en el cliente, **DEBES** configurar Row Level Security (RLS):

### Para tabla `users`:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Permitir lectura solo del propio usuario
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);
```

### Para tabla `public_projects`:
```sql
ALTER TABLE public_projects ENABLE ROW LEVEL SECURITY;

-- Permitir lectura de proyectos públicos
CREATE POLICY "Anyone can read public projects"
  ON public_projects FOR SELECT
  USING (is_public = true);

-- Solo el autor puede modificar
CREATE POLICY "Authors can update own projects"
  ON public_projects FOR UPDATE
  USING (user_id = auth.uid());
```

### Para tabla `user_avatars`:
```sql
ALTER TABLE user_avatars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read avatars"
  ON user_avatars FOR SELECT
  USING (true);

CREATE POLICY "Users can update own avatar"
  ON user_avatars FOR UPDATE
  USING (user_id = auth.uid());
```

## 🌐 Acceso a tu sitio

Tu sitio estará disponible en:
```
https://TU_USUARIO.github.io/TU_REPO/home.html
```

O si configuraste un dominio custom:
```
https://tudominio.com/home.html
```

## 📝 Notas

- GitHub Pages **NO soporta serverless functions**
- Todas las llamadas a Supabase son directas desde el navegador
- El código JavaScript es visible para todos
- Usa RLS en Supabase para proteger tus datos
- Las API keys `anon` son seguras de exponer si RLS está bien configurado

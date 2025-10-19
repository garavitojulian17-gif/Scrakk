# 🚀 Configuración para GitHub Pages

## Arquitectura

**GitHub Pages = Hosting estático**

```
Cliente (navegador)  →  Supabase (directo)
                        ↑ API keys visibles en código
```

⚠️ **IMPORTANTE**: Como GitHub Pages solo soporta sitios estáticos (sin backend), las API keys de Supabase estarán en el código del cliente. Asegúrate de usar **Row Level Security (RLS)** en Supabase para proteger tus datos.

## 📋 Pasos para desplegar

### 1. Preparar el repositorio

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

### 3. Archivo de configuración

Renombra `config-local.js` a `config.js` y asegúrate de que contenga:

```javascript
window.ENV_CONFIG = {
  SUPABASE_URL: 'https://tu-proyecto.supabase.co',
  SUPABASE_ANON_KEY: 'tu-anon-key',
  SUPABASE_IMAGES_URL: 'https://tu-proyecto-imagenes.supabase.co',
  SUPABASE_IMAGES_ANON_KEY: 'tu-anon-key-imagenes'
};
```

**⚠️ NO USES SERVICE KEYS**, solo las `anon` keys públicas.

### 4. Actualizar referencias en HTML

Cambia todas las referencias de `config-local.js` a `config.js`:

```html
<script src="config.js"></script>
```

### 5. Configurar página de inicio

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

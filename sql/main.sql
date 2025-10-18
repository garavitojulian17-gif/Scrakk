-- =========================================
-- SCRAKK EDITOR - PROYECTOS PÚBLICOS
-- Base de datos Supabase
-- =========================================

-- ELIMINAR TODO LO EXISTENTE
DROP TABLE IF EXISTS extension_ratings CASCADE;
DROP TABLE IF EXISTS user_extensions CASCADE;
DROP TABLE IF EXISTS extensions CASCADE;
DROP TABLE IF EXISTS extension_authors CASCADE;
DROP TABLE IF EXISTS user_notifications CASCADE;
DROP TABLE IF EXISTS push_notifications CASCADE;
DROP TABLE IF EXISTS project_comments CASCADE;
DROP TABLE IF EXISTS project_likes CASCADE;
DROP TABLE IF EXISTS project_images CASCADE;
DROP TABLE IF EXISTS public_projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_project_likes_count() CASCADE;
DROP FUNCTION IF EXISTS generate_scrakk_id() CASCADE;
DROP FUNCTION IF EXISTS search_projects(TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS increment_project_views(UUID) CASCADE;
DROP FUNCTION IF EXISTS increment_project_downloads(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_extension_rating() CASCADE;
DROP FUNCTION IF EXISTS increment_extension_downloads(UUID) CASCADE;
DROP FUNCTION IF EXISTS search_extensions(TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_user_notifications(UUID) CASCADE;
DROP FUNCTION IF EXISTS mark_notification_read(UUID, UUID) CASCADE;

DROP VIEW IF EXISTS projects_full_view CASCADE;
DROP VIEW IF EXISTS extensions_full_view CASCADE;

-- Tabla de usuarios
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    scrakk_id VARCHAR(30) UNIQUE NOT NULL, -- Formato: scrakk-id-0000-0000-0000
    email VARCHAR(255) UNIQUE, -- Email opcional
    display_name VARCHAR(100),
    -- avatar_url removido: ahora se almacena en DB de imágenes separada
    verified BOOLEAN DEFAULT FALSE, -- Usuario verificado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Función para generar Scrakk ID único
CREATE OR REPLACE FUNCTION generate_scrakk_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    exists_check INTEGER;
BEGIN
    LOOP
        -- Generar ID con formato scrakk-id-0000-0000-0000
        new_id := 'scrakk-id-' || 
                  LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || '-' ||
                  LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || '-' ||
                  LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Verificar si ya existe
        SELECT COUNT(*) INTO exists_check 
        FROM users 
        WHERE scrakk_id = new_id;
        
        -- Si no existe, salir del loop
        EXIT WHEN exists_check = 0;
    END LOOP;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Tabla de proyectos públicos
CREATE TABLE public_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Opcional
    author_name VARCHAR(100) NOT NULL, -- Nombre del desarrollador
    author_email VARCHAR(255), -- Email opcional
    title VARCHAR(255) NOT NULL,
    description TEXT,
    markdown_content TEXT,
    download_link TEXT NOT NULL,
    project_type VARCHAR(50), -- web, desktop, mobile, library, etc.
    tags TEXT[], -- Array de tags para búsqueda
    views_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NOTA: La tabla project_images ahora existe en la DB de imágenes separada
-- Esta tabla en la DB principal solo mantiene referencias
CREATE TABLE project_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Opcional
    -- image_base64 removido: ahora se almacena en DB de imágenes separada
    image_name VARCHAR(255),
    image_order INTEGER DEFAULT 0, -- Orden de visualización
    is_thumbnail BOOLEAN DEFAULT FALSE, -- Si es la imagen principal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de likes/favoritos
CREATE TABLE project_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id) -- Un usuario solo puede dar like una vez
);

-- Tabla de comentarios
CREATE TABLE project_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    parent_comment_id UUID REFERENCES project_comments(id) ON DELETE CASCADE, -- Para respuestas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX idx_projects_user_id ON public_projects(user_id);
CREATE INDEX idx_projects_author_name ON public_projects(author_name);
CREATE INDEX idx_projects_created_at ON public_projects(created_at DESC);
CREATE INDEX idx_projects_views ON public_projects(views_count DESC);
CREATE INDEX idx_projects_downloads ON public_projects(downloads_count DESC);
CREATE INDEX idx_projects_likes ON public_projects(likes_count DESC);
CREATE INDEX idx_projects_tags ON public_projects USING GIN(tags);
CREATE INDEX idx_images_project_id ON project_images(project_id);
CREATE INDEX idx_likes_project_id ON project_likes(project_id);
CREATE INDEX idx_comments_project_id ON project_comments(project_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON project_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar contador de likes
CREATE OR REPLACE FUNCTION update_project_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public_projects 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.project_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public_projects 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.project_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_likes_count
    AFTER INSERT OR DELETE ON project_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_project_likes_count();

-- DESHABILITAR Row Level Security (RLS) - Acceso total sin restricciones
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments DISABLE ROW LEVEL SECURITY;

-- Vista para proyectos con información completa
-- NOTA: thumbnail ya no se obtiene aquí, debe obtenerse de la DB de imágenes
CREATE OR REPLACE VIEW projects_full_view AS
SELECT 
    p.*,
    (SELECT COUNT(*) FROM project_comments WHERE project_id = p.id) as comments_count
FROM public_projects p
WHERE p.is_public = true
ORDER BY p.created_at DESC;

-- Función para buscar proyectos (prioriza usuarios verificados)
CREATE OR REPLACE FUNCTION search_projects(search_query TEXT, search_limit INTEGER DEFAULT 20)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    author_name VARCHAR(100),
    tags TEXT[],
    views_count INTEGER,
    downloads_count INTEGER,
    likes_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.description,
        p.author_name,
        p.tags,
        p.views_count,
        p.downloads_count,
        p.likes_count,
        p.created_at
    FROM public_projects p
    LEFT JOIN users u ON p.user_id = u.id
    WHERE 
        p.is_public = true AND
        (
            p.title ILIKE '%' || search_query || '%' OR
            p.description ILIKE '%' || search_query || '%' OR
            p.author_name ILIKE '%' || search_query || '%' OR
            EXISTS (SELECT 1 FROM unnest(p.tags) tag WHERE tag ILIKE '%' || search_query || '%')
        )
    ORDER BY 
        COALESCE(u.verified, false) DESC,  -- Usuarios verificados primero
        p.created_at DESC                  -- Luego por fecha
    LIMIT search_limit;
END;
$$ LANGUAGE plpgsql;

-- Función para incrementar vistas
CREATE OR REPLACE FUNCTION increment_project_views(project_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public_projects 
    SET views_count = views_count + 1 
    WHERE id = project_uuid;
END;
$$ LANGUAGE plpgsql;

-- Función para incrementar descargas
CREATE OR REPLACE FUNCTION increment_project_downloads(project_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public_projects 
    SET downloads_count = downloads_count + 1 
    WHERE id = project_uuid;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- SISTEMA DE NOTIFICACIONES PUSH
-- =========================================

-- Tabla de notificaciones push (enviadas por admin)
CREATE TABLE push_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL, -- Soporte para Markdown
    -- image_base64 removido: si se necesitan imágenes en notificaciones, usar URLs externas
    target_audience VARCHAR(20) NOT NULL CHECK (target_audience IN ('all', 'verified')), -- 'all' o 'verified'
    is_active BOOLEAN DEFAULT TRUE, -- Para desactivar notificaciones antiguas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE -- Fecha de expiración opcional
);

-- Tabla de notificaciones leídas por usuario
CREATE TABLE user_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES push_notifications(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, notification_id) -- Un usuario solo recibe cada notificación una vez
);

-- Índices para notificaciones
CREATE INDEX idx_push_notifications_active ON push_notifications(is_active, created_at DESC);
CREATE INDEX idx_push_notifications_audience ON push_notifications(target_audience);
CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_read ON user_notifications(is_read);

-- Deshabilitar RLS para notificaciones
ALTER TABLE push_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications DISABLE ROW LEVEL SECURITY;

-- Función para obtener notificaciones no leídas de un usuario
CREATE OR REPLACE FUNCTION get_user_notifications(user_uuid UUID)
RETURNS TABLE (
    notification_id UUID,
    title VARCHAR(255),
    description TEXT,
    is_read BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pn.id,
        pn.title,
        pn.description,
        COALESCE(un.is_read, false) as is_read,
        pn.created_at
    FROM push_notifications pn
    LEFT JOIN user_notifications un ON pn.id = un.notification_id AND un.user_id = user_uuid
    LEFT JOIN users u ON u.id = user_uuid
    WHERE 
        pn.is_active = true AND
        (pn.expires_at IS NULL OR pn.expires_at > CURRENT_TIMESTAMP) AND
        (
            pn.target_audience = 'all' OR 
            (pn.target_audience = 'verified' AND COALESCE(u.verified, false) = true)
        )
    ORDER BY pn.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para marcar notificación como leída
CREATE OR REPLACE FUNCTION mark_notification_read(user_uuid UUID, notification_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_notifications (user_id, notification_id, is_read, read_at)
    VALUES (user_uuid, notification_uuid, true, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, notification_id) 
    DO UPDATE SET is_read = true, read_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- SISTEMA DE EXTENSIONES (.SES)
-- Scrakk Extension System
-- =========================================

-- Tabla de autores de extensiones (nombres únicos)
CREATE TABLE extension_authors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_name VARCHAR(100) UNIQUE NOT NULL, -- Nombre único del autor
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Opcional: vincular a usuario
    email VARCHAR(255),
    website_url TEXT,
    verified BOOLEAN DEFAULT FALSE, -- Autores verificados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de extensiones en marketplace
CREATE TABLE extensions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES extension_authors(id) ON DELETE CASCADE,
    extension_name VARCHAR(100) NOT NULL, -- Nombre de la extensión
    display_name VARCHAR(255) NOT NULL, -- Nombre a mostrar
    description TEXT,
    version VARCHAR(20) NOT NULL, -- Ej: "1.0.0"
    
    -- Contenido de la extensión (.ses)
    ses_content TEXT NOT NULL, -- Contenido completo del archivo .ses (JSON)
    
    -- Metadata visual
    icon_url TEXT, -- URL del ícono de la extensión
    image_url TEXT, -- URL de imagen de preview
    
    -- Estadísticas
    downloads_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0.00, -- Rating promedio (0.00 - 5.00)
    rating_count INTEGER DEFAULT 0,
    
    -- Categorización
    category VARCHAR(50), -- ui, theme, language, snippet, tool, etc.
    tags TEXT[], -- Array de tags para búsqueda
    
    -- Control de versión
    changelog TEXT, -- Registro de cambios
    min_editor_version VARCHAR(20), -- Versión mínima del editor requerida
    
    -- Estado
    is_published BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: combinación única de autor y nombre de extensión
    UNIQUE(author_id, extension_name)
);

-- Tabla de extensiones instaladas por usuario
CREATE TABLE user_extensions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Permitir NULL para usuarios no registrados
    extension_id UUID REFERENCES extensions(id) ON DELETE CASCADE,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_enabled BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}' -- Configuración personalizada por usuario
);

-- Tabla de ratings/reseñas de extensiones
CREATE TABLE extension_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    extension_id UUID REFERENCES extensions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(extension_id, user_id)
);

-- Índices para optimización
CREATE INDEX idx_extensions_author_id ON extensions(author_id);
CREATE INDEX idx_extensions_category ON extensions(category);
CREATE INDEX idx_extensions_tags ON extensions USING GIN(tags);
CREATE INDEX idx_extensions_downloads ON extensions(downloads_count DESC);
CREATE INDEX idx_extensions_rating ON extensions(rating_average DESC);
CREATE INDEX idx_user_extensions_user_id ON user_extensions(user_id);
CREATE INDEX idx_extension_ratings_extension_id ON extension_ratings(extension_id);
CREATE INDEX idx_extension_authors_name ON extension_authors(author_name);

-- Índice único parcial: solo aplica restricción UNIQUE cuando user_id no es NULL
CREATE UNIQUE INDEX idx_user_extensions_unique ON user_extensions(user_id, extension_id) WHERE user_id IS NOT NULL;

-- Trigger para actualizar updated_at en extensiones
CREATE TRIGGER update_extensions_updated_at
    BEFORE UPDATE ON extensions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_extension_authors_updated_at
    BEFORE UPDATE ON extension_authors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_extension_ratings_updated_at
    BEFORE UPDATE ON extension_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Deshabilitar RLS para extensiones
ALTER TABLE extension_authors DISABLE ROW LEVEL SECURITY;
ALTER TABLE extensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_extensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE extension_ratings DISABLE ROW LEVEL SECURITY;

-- Función para actualizar rating promedio de extensión
CREATE OR REPLACE FUNCTION update_extension_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE extensions 
    SET 
        rating_average = (
            SELECT COALESCE(AVG(rating), 0.00) 
            FROM extension_ratings 
            WHERE extension_id = COALESCE(NEW.extension_id, OLD.extension_id)
        ),
        rating_count = (
            SELECT COUNT(*) 
            FROM extension_ratings 
            WHERE extension_id = COALESCE(NEW.extension_id, OLD.extension_id)
        )
    WHERE id = COALESCE(NEW.extension_id, OLD.extension_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_extension_rating
    AFTER INSERT OR UPDATE OR DELETE ON extension_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_extension_rating();

-- Función para incrementar descargas de extensión
CREATE OR REPLACE FUNCTION increment_extension_downloads(extension_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE extensions 
    SET downloads_count = downloads_count + 1 
    WHERE id = extension_uuid;
END;
$$ LANGUAGE plpgsql;

-- Función para buscar extensiones
CREATE OR REPLACE FUNCTION search_extensions(search_query TEXT, search_limit INTEGER DEFAULT 20)
RETURNS TABLE (
    id UUID,
    extension_name VARCHAR(100),
    display_name VARCHAR(255),
    description TEXT,
    author_name VARCHAR(100),
    version VARCHAR(20),
    icon_url TEXT,
    image_url TEXT,
    downloads_count INTEGER,
    rating_average DECIMAL(3,2),
    rating_count INTEGER,
    category VARCHAR(50),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.extension_name,
        e.display_name,
        e.description,
        a.author_name,
        e.version,
        e.icon_url,
        e.image_url,
        e.downloads_count,
        e.rating_average,
        e.rating_count,
        e.category,
        e.tags,
        e.created_at
    FROM extensions e
    LEFT JOIN extension_authors a ON e.author_id = a.id
    WHERE 
        e.is_published = true AND
        (
            e.display_name ILIKE '%' || search_query || '%' OR
            e.description ILIKE '%' || search_query || '%' OR
            e.extension_name ILIKE '%' || search_query || '%' OR
            a.author_name ILIKE '%' || search_query || '%' OR
            EXISTS (SELECT 1 FROM unnest(e.tags) tag WHERE tag ILIKE '%' || search_query || '%')
        )
    ORDER BY 
        COALESCE(a.verified, false) DESC,  -- Autores verificados primero
        e.rating_average DESC,              -- Mejor rating
        e.downloads_count DESC              -- Más descargas
    LIMIT search_limit;
END;
$$ LANGUAGE plpgsql;

-- Vista para extensiones con información completa
CREATE OR REPLACE VIEW extensions_full_view AS
SELECT 
    e.*,
    a.author_name,
    a.verified as author_verified,
    a.website_url as author_website
FROM extensions e
LEFT JOIN extension_authors a ON e.author_id = a.id
WHERE e.is_published = true
ORDER BY e.created_at DESC;

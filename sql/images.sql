-- =========================================
-- SCRAKK EDITOR - IMAGES DATABASE
-- Base de datos separada para almacenar imágenes en base64
-- URL: https://pozftvedupursetfpkec.supabase.co
-- =========================================

-- ELIMINAR TODO LO EXISTENTE
DROP TABLE IF EXISTS project_images CASCADE;
DROP TABLE IF EXISTS user_avatars CASCADE;

-- =========================================
-- TABLA DE AVATARES DE USUARIO
-- =========================================
CREATE TABLE user_avatars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL, -- Referencia al ID del usuario en la DB principal
    avatar_base64 TEXT NOT NULL, -- Imagen del avatar en base64
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id) -- Un usuario solo puede tener un avatar
);

-- =========================================
-- TABLA DE IMÁGENES DE PROYECTOS PÚBLICOS
-- =========================================
CREATE TABLE project_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL, -- Referencia al ID del proyecto en la DB principal
    user_id UUID, -- Referencia opcional al ID del usuario
    image_base64 TEXT NOT NULL, -- Imagen del proyecto en base64
    image_name VARCHAR(255),
    image_order INTEGER DEFAULT 0, -- Orden de visualización
    is_thumbnail BOOLEAN DEFAULT FALSE, -- Si es la imagen principal/miniatura
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =========================================
CREATE INDEX idx_user_avatars_user_id ON user_avatars(user_id);
CREATE INDEX idx_project_images_project_id ON project_images(project_id);
CREATE INDEX idx_project_images_user_id ON project_images(user_id);
CREATE INDEX idx_project_images_thumbnail ON project_images(project_id, is_thumbnail) WHERE is_thumbnail = true;

-- =========================================
-- TRIGGER PARA ACTUALIZAR updated_at
-- =========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_avatars_updated_at
    BEFORE UPDATE ON user_avatars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- DESHABILITAR ROW LEVEL SECURITY (RLS)
-- Acceso total sin restricciones
-- =========================================
ALTER TABLE user_avatars DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_images DISABLE ROW LEVEL SECURITY;

-- =========================================
-- FUNCIONES AUXILIARES
-- =========================================

-- Función para obtener avatar de usuario
CREATE OR REPLACE FUNCTION get_user_avatar(user_uuid UUID)
RETURNS TABLE (
    avatar_base64 TEXT,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ua.avatar_base64,
        ua.updated_at
    FROM user_avatars ua
    WHERE ua.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Función para guardar/actualizar avatar de usuario
CREATE OR REPLACE FUNCTION upsert_user_avatar(user_uuid UUID, avatar_data TEXT)
RETURNS UUID AS $$
DECLARE
    avatar_id UUID;
BEGIN
    INSERT INTO user_avatars (user_id, avatar_base64)
    VALUES (user_uuid, avatar_data)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        avatar_base64 = avatar_data,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO avatar_id;
    
    RETURN avatar_id;
END;
$$ LANGUAGE plpgsql;

-- Función para eliminar avatar de usuario
CREATE OR REPLACE FUNCTION delete_user_avatar(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM user_avatars WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener imágenes de un proyecto
CREATE OR REPLACE FUNCTION get_project_images(project_uuid UUID)
RETURNS TABLE (
    id UUID,
    image_base64 TEXT,
    image_name VARCHAR(255),
    image_order INTEGER,
    is_thumbnail BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pi.id,
        pi.image_base64,
        pi.image_name,
        pi.image_order,
        pi.is_thumbnail,
        pi.created_at
    FROM project_images pi
    WHERE pi.project_id = project_uuid
    ORDER BY pi.image_order ASC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener thumbnail de un proyecto
CREATE OR REPLACE FUNCTION get_project_thumbnail(project_uuid UUID)
RETURNS TABLE (
    image_base64 TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pi.image_base64
    FROM project_images pi
    WHERE pi.project_id = project_uuid AND pi.is_thumbnail = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

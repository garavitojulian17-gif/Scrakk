// =========================================
// API CLIENT - Funciona en desarrollo y producción
// =========================================

// Detectar si estamos en desarrollo local o producción
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// En desarrollo, usar Supabase directamente (solo para testing)
let supabase, supabaseImages;

if (isDev) {
  // Cargar desde .env local
  console.log('[API] Modo desarrollo - usando Supabase directo');
  
  // Estas se cargarán desde config.js generado localmente
  const initSupabase = () => {
    if (!window.ENV_CONFIG) {
      console.error('[API] ENV_CONFIG no encontrado. Ejecuta: npm run config');
      return false;
    }
    
    supabase = window.supabase.createClient(
      window.ENV_CONFIG.SUPABASE_URL,
      window.ENV_CONFIG.SUPABASE_ANON_KEY
    );
    
    supabaseImages = window.supabase.createClient(
      window.ENV_CONFIG.SUPABASE_IMAGES_URL,
      window.ENV_CONFIG.SUPABASE_IMAGES_ANON_KEY
    );
    
    return true;
  };
  
  // Esperar a que se cargue ENV_CONFIG
  if (typeof window.supabase !== 'undefined') {
    setTimeout(initSupabase, 100);
  }
}

// API unificada
window.API = {
  async getProjects(view, userId) {
    if (isDev) {
      // Desarrollo: consulta directa
      let query = supabase
        .from('public_projects')
        .select(`
          id, title, description, author_name, user_id, tags,
          views_count, downloads_count, likes_count,
          download_link, project_type, markdown_content, created_at
        `);
      
      if (view === 'my' && userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('is_public', true);
      }
      
      const { data: projects } = await query.order('created_at', { ascending: false });
      
      // Cargar imágenes Y datos del usuario
      const projectsWithImages = await Promise.all(projects.map(async (project) => {
        // Thumbnail
        const { data: thumbs } = await supabaseImages
          .from('project_images')
          .select('image_base64')
          .eq('project_id', project.id)
          .eq('is_thumbnail', true)
          .limit(1);
        
        let avatar = null;
        let verified = false;
        
        // Si hay user_id, obtener avatar Y verificación
        if (project.user_id) {
          // Avatar desde DB de imágenes
          const { data: avatarData } = await supabaseImages
            .from('user_avatars')
            .select('avatar_base64')
            .eq('user_id', project.user_id)
            .limit(1);
          
          if (avatarData && avatarData.length > 0) {
            avatar = avatarData[0].avatar_base64;
          }
          
          // Verificación desde DB principal
          const { data: userData } = await supabase
            .from('users')
            .select('verified')
            .eq('id', project.user_id)
            .single();
          
          if (userData) {
            verified = userData.verified || false;
          }
        }
        
        return {
          ...project,
          thumbnail: thumbs && thumbs.length > 0 ? thumbs[0].image_base64 : null,
          avatar,
          verified
        };
      }));
      
      return projectsWithImages;
    } else {
      // Producción: Netlify Function
      const response = await fetch('/.netlify/functions/get-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ view, userId })
      });
      
      const { projects } = await response.json();
      return projects;
    }
  },
  
  async getProject(id) {
    if (isDev) {
      const { data: project } = await supabase
        .from('public_projects')
        .select(`
          id, title, description, markdown_content, author_name, user_id,
          tags, views_count, downloads_count, likes_count,
          download_link, project_type, created_at
        `)
        .eq('id', id)
        .single();
      
      const { data: images } = await supabaseImages
        .from('project_images')
        .select('*')
        .eq('project_id', id)
        .order('image_order', { ascending: true});
      
      let avatar = null;
      let verified = false;
      
      if (project.user_id) {
        // Avatar
        const { data: avatarData } = await supabaseImages
          .from('user_avatars')
          .select('avatar_base64')
          .eq('user_id', project.user_id)
          .limit(1);
        
        if (avatarData && avatarData.length > 0) {
          avatar = avatarData[0].avatar_base64;
        }
        
        // Verificación
        const { data: userData } = await supabase
          .from('users')
          .select('verified')
          .eq('id', project.user_id)
          .single();
        
        if (userData) {
          verified = userData.verified || false;
        }
      }
      
      await supabase.rpc('increment_project_views', { project_uuid: id });
      
      return { project: { ...project, verified }, images: images || [], avatar };
    } else {
      const response = await fetch(`/.netlify/functions/get-project?id=${id}`);
      return await response.json();
    }
  },
  
  async login(scrakkId, username) {
    if (isDev) {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, scrakk_id, display_name, verified, created_at')
        .eq('scrakk_id', scrakkId)
        .eq('username', username)
        .single();
      
      if (error || !user) {
        throw new Error('Invalid credentials');
      }
      
      return user;
    } else {
      const response = await fetch('/.netlify/functions/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scrakkId, username })
      });
      
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error('Invalid credentials');
      }
      
      return data.user;
    }
  },
  
  async incrementDownloads(projectId) {
    if (isDev) {
      await supabase.rpc('increment_project_downloads', { project_uuid: projectId });
    } else {
      await fetch('/.netlify/functions/increment-downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
    }
  },
  
  async getUserStats(userId) {
    if (isDev) {
      // Obtener proyectos del usuario
      const { data: projects } = await supabase
        .from('public_projects')
        .select('id, views_count, downloads_count, likes_count, created_at')
        .eq('user_id', userId)
        .eq('is_public', true);
      
      // Obtener author_id del usuario
      const { data: author } = await supabase
        .from('extension_authors')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      let extensions = [];
      if (author) {
        const { data: exts } = await supabase
          .from('extensions')
          .select('id, downloads_count, rating_average, rating_count, created_at')
          .eq('author_id', author.id);
        extensions = exts || [];
      }
      
      return { projects: projects || [], extensions: extensions };
    } else {
      const response = await fetch(`/.netlify/functions/get-user-stats?userId=${userId}`);
      return await response.json();
    }
  }
};

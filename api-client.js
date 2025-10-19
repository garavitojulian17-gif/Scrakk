// =========================================
// API CLIENT - Cliente directo a Supabase (GitHub Pages)
// =========================================

console.log('[API] Inicializando cliente Supabase...');

let supabase, supabaseImages;

// Inicializar Supabase
const initSupabase = () => {
  if (!window.ENV_CONFIG) {
    console.error('[API] ENV_CONFIG no encontrado. Asegúrate de que config-local.js esté cargado.');
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
  
  console.log('[API] Supabase cliente inicializado correctamente');
  return true;
};

// Esperar a que se cargue ENV_CONFIG
if (typeof window.supabase !== 'undefined') {
  setTimeout(initSupabase, 100);
}

// API unificada
window.API = {
  async getProjects(view, scrakkId) {
    // Consulta directa a Supabase
      let query = supabase
        .from('public_projects')
        .select(`
          id, title, description, author_name, user_id, tags,
          views_count, downloads_count, likes_count,
          download_link, project_type, markdown_content, created_at
        `);
      
      if (view === 'my' && scrakkId) {
        query = query.eq('author_name', scrakkId);
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
        
        // Buscar usuario por author_name (scrakk_id)
        if (project.author_name) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, verified, username')
            .eq('scrakk_id', project.author_name)
            .single();
          
          if (userError) {
            console.log(`[API] Usuario no encontrado para scrakk_id: ${project.author_name}`, userError);
          }
          
          if (userData) {
            verified = userData.verified || false;
            console.log(`[API] Usuario encontrado: ${userData.username}, verificado: ${verified}`);
            
            // Buscar avatar usando el user_id obtenido
            const { data: avatarData, error: avatarError } = await supabaseImages
              .from('user_avatars')
              .select('avatar_base64')
              .eq('user_id', userData.id)
              .limit(1);
            
            if (avatarError) {
              console.log(`[API] Error buscando avatar para user_id: ${userData.id}`, avatarError);
            }
            
            if (avatarData && avatarData.length > 0) {
              avatar = avatarData[0].avatar_base64;
              console.log(`[API] Avatar encontrado para ${userData.username}`);
            } else {
              console.log(`[API] No se encontró avatar para user_id: ${userData.id}`);
            }
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
  },
  
  async getProject(id) {
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
      
      // Buscar usuario por author_name (scrakk_id)
      if (project.author_name) {
        const { data: userData } = await supabase
          .from('users')
          .select('id, verified, username')
          .eq('scrakk_id', project.author_name)
          .single();
        
        if (userData) {
          verified = userData.verified || false;
          
          // Buscar avatar usando el user_id obtenido
          const { data: avatarData } = await supabaseImages
            .from('user_avatars')
            .select('avatar_base64')
            .eq('user_id', userData.id)
            .limit(1);
          
          if (avatarData && avatarData.length > 0) {
            avatar = avatarData[0].avatar_base64;
          }
        }
      }
      
      await supabase.rpc('increment_project_views', { project_uuid: id });
      
      return { project: { ...project, verified }, images: images || [], avatar };
  },
  
  async login(scrakkId, username) {
    const { data: user, error } = await supabase
        .from('users')
        .select('id, username, scrakk_id, display_name, verified, created_at')
        .eq('scrakk_id', scrakkId)
        .eq('username', username)
        .single();
      
      if (error || !user) throw new Error('Usuario no encontrado');
      
      return user;
  },
  
  async incrementDownloads(projectId) {
    await supabase.rpc('increment_project_downloads', { project_uuid: projectId });
  },
  
  async getUserStats(userId) {
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
  }
};

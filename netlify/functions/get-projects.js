const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Variables de entorno (solo disponibles en el servidor)
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const supabaseImages = createClient(
    process.env.SUPABASE_IMAGES_URL,
    process.env.SUPABASE_IMAGES_ANON_KEY
  );

  try {
    const { view, scrakkId } = JSON.parse(event.body || '{}');

    // Construir query
    let query = supabase
      .from('public_projects')
      .select(`
        id,
        title,
        description,
        author_name,
        user_id,
        tags,
        views_count,
        downloads_count,
        likes_count,
        download_link,
        project_type,
        markdown_content,
        created_at
      `);

    if (view === 'my' && scrakkId) {
      query = query.eq('author_name', scrakkId);
    } else {
      query = query.eq('is_public', true);
    }

    const { data: projects, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Cargar imágenes para cada proyecto
    const projectsWithImages = await Promise.all(projects.map(async (project) => {
      let thumbnail = null;
      let avatar = null;
      let verified = false;

      // Obtener thumbnail
      const { data: thumbs } = await supabaseImages
        .from('project_images')
        .select('image_base64')
        .eq('project_id', project.id)
        .eq('is_thumbnail', true)
        .limit(1);

      if (thumbs && thumbs.length > 0) {
        thumbnail = thumbs[0].image_base64;
      }

      // Obtener avatar del autor Y verificación usando author_name (scrakk_id)
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

      return { ...project, thumbnail, avatar, verified };
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ projects: projectsWithImages })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

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
    const { view, userId } = JSON.parse(event.body || '{}');

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
        created_at,
        users (username, verified)
      `);

    // Filtrar según vista
    if (view === 'my' && userId) {
      query = query.eq('user_id', userId);
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

      // Obtener avatar del autor Y verificación
      if (project.user_id) {
        const { data: avatarData } = await supabaseImages
          .from('user_avatars')
          .select('avatar_base64')
          .eq('user_id', project.user_id)
          .limit(1);

        if (avatarData && avatarData.length > 0) {
          avatar = avatarData[0].avatar_base64;
        }
        
        // Obtener verificación
        const { data: userData } = await supabase
          .from('users')
          .select('verified')
          .eq('id', project.user_id)
          .single();
        
        if (userData) {
          verified = userData.verified || false;
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

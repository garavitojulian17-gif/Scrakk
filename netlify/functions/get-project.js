const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const supabaseImages = createClient(
    process.env.SUPABASE_IMAGES_URL,
    process.env.SUPABASE_IMAGES_ANON_KEY
  );

  try {
    const { id } = event.queryStringParameters;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Project ID required' })
      };
    }

    // Obtener proyecto
    const { data: project, error } = await supabase
      .from('public_projects')
      .select(`
        id,
        title,
        description,
        markdown_content,
        author_name,
        user_id,
        tags,
        views_count,
        downloads_count,
        likes_count,
        download_link,
        project_type,
        created_at,
        users (username, verified)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Obtener imágenes del proyecto
    const { data: images } = await supabaseImages
      .from('project_images')
      .select('*')
      .eq('project_id', id)
      .order('image_order', { ascending: true });

    // Obtener avatar del autor Y verificación usando author_name (scrakk_id)
    let avatar = null;
    let verified = false;
    
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

    // Incrementar vistas
    await supabase.rpc('increment_project_views', { project_uuid: id });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ project: { ...project, verified }, images: images || [], avatar })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

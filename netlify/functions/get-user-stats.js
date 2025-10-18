const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  try {
    const { userId } = event.queryStringParameters;

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User ID required' })
      };
    }

    // Obtener proyectos del usuario
    const { data: projects } = await supabase
      .from('public_projects')
      .select('id, views_count, downloads_count, likes_count, created_at')
      .eq('user_id', userId)
      .eq('is_public', true);

    // Obtener extensiones del usuario
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ projects: projects || [], extensions })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

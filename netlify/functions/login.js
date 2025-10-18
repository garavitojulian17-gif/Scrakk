const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  try {
    const { scrakkId, username } = JSON.parse(event.body);

    // Buscar usuario
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, scrakk_id, display_name')
      .eq('scrakk_id', scrakkId)
      .eq('username', username)
      .single();

    if (error || !user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ user })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

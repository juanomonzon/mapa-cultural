const { createClient } = require('@supabase/supabase-js');

// Netlify automáticamente usará las variables que cargaste recién
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const idPunto = event.queryStringParameters.id;

  if (!idPunto) {
    return { 
      statusCode: 400, 
      body: "Error: No se encontró el ID del punto en el enlace." 
    };
  }

  // Actualizamos la base de datos poniendo aprobado en TRUE
  const { error } = await supabase
    .from('puntos_mapa')
    .update({ aprobado: true })
    .eq('id', idPunto);

  if (error) {
    return { 
      statusCode: 500, 
      body: "Error al aprobar en Supabase: " + error.message 
    };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
    body: "¡Punto aprobado con éxito! Ya podés cerrar esta pestaña y refrescar el mapa."
  };
};
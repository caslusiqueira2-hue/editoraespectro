const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve((request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  return Response.json(
    { error: "O envio automático da newsletter ainda não está configurado." },
    { status: 503, headers: corsHeaders },
  );
});

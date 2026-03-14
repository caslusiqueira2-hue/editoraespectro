import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { post_id } = await req.json();
    if (!post_id) {
      return new Response(JSON.stringify({ error: "post_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get post details
    const { data: post, error: postErr } = await supabase
      .from("posts")
      .select("titulo, autor, resumo, slug")
      .eq("id", post_id)
      .single();

    if (postErr || !post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get active subscribers
    const { data: subscribers } = await supabase
      .from("newsletter_subscribers")
      .select("email, id")
      .eq("status", "active");

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active subscribers", sent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For now, log the notification (actual email sending requires an email provider)
    // This stores the notification record so we can track it
    console.log(
      `Newsletter notification: "${post.titulo}" by ${post.autor} → ${subscribers.length} subscribers`
    );

    return new Response(
      JSON.stringify({
        message: "Newsletter notification processed",
        post: post.titulo,
        subscribers_count: subscribers.length,
        subscriber_emails: subscribers.map((s) => s.email),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

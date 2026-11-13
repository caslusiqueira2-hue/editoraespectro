import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submission_id } = await req.json();

    if (!submission_id) {
      return new Response(
        JSON.stringify({ error: "submission_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: submission, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", submission_id)
      .single();

    if (error || !submission) {
      return new Response(
        JSON.stringify({ error: "Submission not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const siteUrl = Deno.env.get("SITE_URL");
    const adminUrl = siteUrl ? new URL("/admin", siteUrl).href : null;

    const destinoLabel = submission.destino === "revista" ? "Revista" : "Site";

    // Send email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);

    const htmlBody = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="border-bottom: 2px solid #333; padding-bottom: 10px;">Nova Submissão Recebida</h2>
        <div style="background: #f0f0f0; border-left: 4px solid #333; padding: 12px 16px; margin: 16px 0; font-size: 15px;">
          <strong>Destino:</strong> ${destinoLabel}
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555; width: 120px;">Autor</td>
            <td style="padding: 8px 12px;">${escapeHtml(submission.nome)}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">E-mail</td>
            <td style="padding: 8px 12px;"><a href="mailto:${escapeHtml(submission.email)}">${escapeHtml(submission.email)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Gênero</td>
            <td style="padding: 8px 12px;">${escapeHtml(submission.genero)}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Título</td>
            <td style="padding: 8px 12px;">${escapeHtml(submission.titulo)}</td>
          </tr>
          ${submission.mensagem ? `
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Mensagem</td>
            <td style="padding: 8px 12px;">${escapeHtml(submission.mensagem)}</td>
          </tr>
          ` : ""}
        </table>
        <div style="margin: 20px 0;">
          <p>O texto e os anexos estão disponíveis no painel editorial.</p>
          ${adminUrl ? `<p><a href="${escapeHtml(adminUrl)}">Abrir painel editorial</a></p>` : ""}
        </div>
        <p style="color: #888; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
          Enviado em ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    `;

    const { error: emailError } = await resend.emails.send({
      from: Deno.env.get("SUBMISSIONS_FROM_EMAIL") ?? "onboarding@resend.dev",
      to: "espekeditora@gmail.com",
      subject: `[${destinoLabel}] Nova submissão: "${submission.titulo}" (${submission.nome})`,
      html: htmlBody,
    }, { idempotencyKey: `submission-${submission_id}` });

    if (emailError) {
      console.error("Resend error:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error processing submission:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

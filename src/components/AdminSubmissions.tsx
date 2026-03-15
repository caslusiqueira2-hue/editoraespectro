import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Download, ExternalLink, Mail, Calendar, FileText, Image } from "lucide-react";

interface Submission {
  id: string;
  nome: string;
  email: string;
  genero: string;
  titulo: string;
  mensagem: string | null;
  texto_url: string;
  foto_url: string | null;
  destino: string;
  created_at: string;
}

const AdminSubmissions = () => {
  const queryClient = useQueryClient();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["admin-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Submission[];
    },
  });

  const deleteSubmission = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("submissions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      toast.success("Submissão removida");
    },
    onError: () => toast.error("Erro ao remover submissão"),
  });

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from("submissions").getPublicUrl(path);
    return data.publicUrl;
  };

  if (isLoading) return <p className="text-muted-foreground">Carregando submissões…</p>;

  if (!submissions?.length) {
    return <p className="text-muted-foreground text-center py-12">Nenhuma submissão recebida ainda.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{submissions.length} submissão(ões)</p>
      {submissions.map((s) => (
        <div key={s.id} className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-[family-name:var(--font-display)] text-base sm:text-lg font-bold truncate">
                {s.titulo}
              </h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{s.nome}</span>
                <span className="flex items-center gap-1"><Mail size={12} /> {s.email}</span>
                <span className="text-accent text-xs font-bold uppercase">{s.genero}</span>
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                  s.destino === "revista" ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent"
                }`}>
                  {s.destino === "revista" ? "Revista" : "Site"}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <Calendar size={12} />
                  {new Date(s.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm("Remover esta submissão?")) deleteSubmission.mutate(s.id);
              }}
              className="p-2 hover:bg-destructive/20 text-destructive rounded-lg transition-colors shrink-0 self-end sm:self-start"
              aria-label="Deletar"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {s.mensagem && (
            <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3 italic">
              {s.mensagem}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <a
              href={getPublicUrl(s.texto_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent hover:underline bg-accent/10 px-3 py-1.5 rounded-full"
            >
              <FileText size={14} /> Baixar texto <ExternalLink size={12} />
            </a>
            {s.foto_url && (
              <a
                href={getPublicUrl(s.foto_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent hover:underline bg-accent/10 px-3 py-1.5 rounded-full"
              >
                <Image size={14} /> Ver foto <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminSubmissions;

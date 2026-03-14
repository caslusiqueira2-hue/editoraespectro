import { useState } from "react";
import { useVolumes, useDeleteVolume, useVolumeArticles, useDeleteMagazineArticle } from "@/hooks/useMagazine";
import type { MagazineVolume, MagazineArticle } from "@/hooks/useMagazine";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Eye, EyeOff, ChevronRight, ArrowLeft } from "lucide-react";
import MagazineVolumeEditor from "./MagazineVolumeEditor";
import MagazineArticleEditor from "./MagazineArticleEditor";

const SECTION_LABELS: Record<string, string> = {
  conto: "Conto",
  poesia: "Poesia",
  ensaio: "Ensaio",
  resenha: "Resenha",
};

const toRoman = (n: number) => {
  const numerals = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ] as const;
  let result = "";
  let num = n;
  for (const [value, symbol] of numerals) {
    while (num >= value) { result += symbol; num -= value; }
  }
  return result;
};

const AdminMagazine = () => {
  const { data: volumes, isLoading } = useVolumes();
  const deleteVolume = useDeleteVolume();
  const [editingVolume, setEditingVolume] = useState<MagazineVolume | null>(null);
  const [creatingVolume, setCreatingVolume] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState<MagazineVolume | null>(null);

  if (editingVolume || creatingVolume) {
    return (
      <MagazineVolumeEditor
        volume={editingVolume}
        onClose={() => { setEditingVolume(null); setCreatingVolume(false); }}
      />
    );
  }

  if (selectedVolume) {
    return (
      <VolumeArticlesView
        volume={selectedVolume}
        onBack={() => setSelectedVolume(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-black uppercase">
          Revista — Volumes
        </h2>
        <button
          onClick={() => setCreatingVolume(true)}
          className="flex items-center gap-2 bg-accent text-accent-foreground px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Novo volume
        </button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : (
        <div className="space-y-3">
          {volumes?.map((vol) => (
            <div
              key={vol.id}
              className="bg-card border border-border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedVolume(vol)}>
                <div className="flex items-center gap-2 mb-1">
                  {vol.published ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-1"><Eye size={12} /> Publicado</span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><EyeOff size={12} /> Rascunho</span>
                  )}
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-base sm:text-lg font-bold flex items-center gap-2">
                  Volume {toRoman(vol.numero)} — {vol.titulo}
                  <ChevronRight size={16} className="text-muted-foreground" />
                </h3>
                <p className="text-sm text-muted-foreground">{vol.ano}</p>
              </div>
              <div className="flex gap-2 shrink-0 self-end sm:self-center">
                <button onClick={() => setEditingVolume(vol)} className="p-2 hover:bg-secondary rounded-lg transition-colors" aria-label="Editar">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Deletar este volume e todos os seus artigos?")) {
                      await deleteVolume.mutateAsync(vol.id);
                      toast.success("Volume deletado");
                    }
                  }}
                  className="p-2 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
                  aria-label="Deletar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {volumes?.length === 0 && (
            <p className="text-muted-foreground text-center py-12">
              Nenhum volume criado. Clique em "Novo volume" para começar.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

function VolumeArticlesView({ volume, onBack }: { volume: MagazineVolume; onBack: () => void }) {
  const { data: articles, isLoading } = useVolumeArticles(volume.id);
  const deleteArticle = useDeleteMagazineArticle();
  const [editingArticle, setEditingArticle] = useState<MagazineArticle | null>(null);
  const [creatingArticle, setCreatingArticle] = useState(false);

  if (editingArticle || creatingArticle) {
    return (
      <MagazineArticleEditor
        article={editingArticle}
        volumeId={volume.id}
        onClose={() => { setEditingArticle(null); setCreatingArticle(false); }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-black uppercase flex-1">
          Vol. {toRoman(volume.numero)} — {volume.titulo}
        </h2>
        <button
          onClick={() => setCreatingArticle(true)}
          className="flex items-center gap-2 bg-accent text-accent-foreground px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Novo artigo
        </button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : (
        <div className="space-y-3">
          {articles?.map((art) => (
            <div
              key={art.id}
              className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {art.published ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-1"><Eye size={12} /> Publicado</span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><EyeOff size={12} /> Rascunho</span>
                  )}
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    · {SECTION_LABELS[art.secao] || art.secao}
                  </span>
                  <span className="text-[10px] text-muted-foreground">· Ordem: {art.ordem}</span>
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-base font-bold">{art.titulo}</h3>
                <p className="text-sm text-muted-foreground">por {art.autor}</p>
              </div>
              <div className="flex gap-2 shrink-0 self-end sm:self-center">
                <button onClick={() => setEditingArticle(art)} className="p-2 hover:bg-secondary rounded-lg transition-colors" aria-label="Editar">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Deletar este artigo?")) {
                      await deleteArticle.mutateAsync(art.id);
                      toast.success("Artigo deletado");
                    }
                  }}
                  className="p-2 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
                  aria-label="Deletar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {articles?.length === 0 && (
            <p className="text-muted-foreground text-center py-12">
              Nenhum artigo neste volume. Clique em "Novo artigo" para começar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminMagazine;

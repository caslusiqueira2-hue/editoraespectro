import { useState } from "react";
import { useCreateMagazineArticle, useUpdateMagazineArticle, uploadMagazineImage } from "@/hooks/useMagazine";
import type { MagazineArticle } from "@/hooks/useMagazine";
import { toast } from "sonner";
import { X, Upload } from "lucide-react";
import RichEditor from "./RichEditor";

const SECTIONS = [
  { value: "conto", label: "Conto" },
  { value: "poesia", label: "Poesia" },
  { value: "ensaio", label: "Ensaio" },
  { value: "resenha", label: "Resenha" },
];

interface Props {
  article: MagazineArticle | null;
  volumeId: string;
  onClose: () => void;
}

const MagazineArticleEditor = ({ article, volumeId, onClose }: Props) => {
  const createArticle = useCreateMagazineArticle();
  const updateArticle = useUpdateMagazineArticle();
  const isEditing = !!article;

  const [titulo, setTitulo] = useState(article?.titulo || "");
  const [autor, setAutor] = useState(article?.autor || "");
  const [secao, setSecao] = useState(article?.secao || "conto");
  const [slug, setSlug] = useState(article?.slug || "");
  const [imagemUrl, setImagemUrl] = useState(article?.imagem_url || "");
  const [conteudo, setConteudo] = useState(article?.conteudo || "");
  const [ordem, setOrdem] = useState(article?.ordem || 0);
  const [published, setPublished] = useState(article?.published || false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const generateSlug = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMagazineImage(file);
      setImagemUrl(url);
      toast.success("Imagem enviada");
    } catch (err: any) {
      toast.error("Erro: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!titulo || !slug || !autor) {
      toast.error("Preencha título, autor e slug");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        titulo, autor, secao, slug,
        imagem_url: imagemUrl || null,
        conteudo,
        ordem,
        published,
        volume_id: volumeId,
      };
      if (isEditing) {
        await updateArticle.mutateAsync({ id: article!.id, ...payload });
        toast.success("Artigo atualizado");
      } else {
        await createArticle.mutateAsync(payload);
        toast.success("Artigo criado");
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-border accent-accent" />
              Publicar
            </label>
            <button onClick={handleSave} disabled={saving}
              className="bg-accent text-accent-foreground px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50">
              {saving ? "Salvando…" : isEditing ? "Atualizar" : "Criar artigo"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        {/* Featured image */}
        <div className="mb-6">
          {imagemUrl ? (
            <div className="relative group">
              <img src={imagemUrl} alt="Ilustração" className="w-full aspect-[16/9] object-cover rounded-xl" />
              <button onClick={() => setImagemUrl("")}
                className="absolute top-3 right-3 bg-background/80 text-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-8 cursor-pointer text-muted-foreground hover:border-accent hover:text-accent transition-colors text-sm">
              <Upload size={18} /> {uploading ? "Enviando…" : "Adicionar ilustração"}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Title */}
        <input
          value={titulo}
          onChange={(e) => { setTitulo(e.target.value); if (!isEditing) setSlug(generateSlug(e.target.value)); }}
          placeholder="Título do artigo"
          className="w-full text-2xl sm:text-4xl font-black font-[family-name:var(--font-display)] bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40 leading-tight"
        />

        {/* Author */}
        <div className="mt-4">
          <input
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            placeholder="Nome do autor"
            className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/40 border-b border-border pb-2 focus:border-accent transition-colors"
          />
        </div>

        {/* Meta */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[3px] text-muted-foreground block mb-2">Seção</label>
            <select value={secao} onChange={(e) => setSecao(e.target.value)}
              className="w-full bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border outline-none focus:ring-1 focus:ring-accent">
              {SECTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[3px] text-muted-foreground block mb-2">Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border outline-none focus:ring-1 focus:ring-accent" placeholder="slug-do-artigo" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[3px] text-muted-foreground block mb-2">Ordem</label>
            <input type="number" value={ordem} onChange={(e) => setOrdem(Number(e.target.value))}
              className="w-full bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border outline-none focus:ring-1 focus:ring-accent" />
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">
          <RichEditor content={conteudo} onChange={setConteudo} />
        </div>
      </div>
    </div>
  );
};

export default MagazineArticleEditor;

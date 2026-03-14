import { useState } from "react";
import { useCreateVolume, useUpdateVolume, uploadMagazineImage } from "@/hooks/useMagazine";
import type { MagazineVolume } from "@/hooks/useMagazine";
import { toast } from "sonner";
import { X, Upload } from "lucide-react";
import RichEditor from "./RichEditor";

interface Props {
  volume: MagazineVolume | null;
  onClose: () => void;
}

const MagazineVolumeEditor = ({ volume, onClose }: Props) => {
  const createVolume = useCreateVolume();
  const updateVolume = useUpdateVolume();
  const isEditing = !!volume;

  const [titulo, setTitulo] = useState(volume?.titulo || "");
  const [numero, setNumero] = useState(volume?.numero || 1);
  const [ano, setAno] = useState(volume?.ano || new Date().getFullYear());
  const [slug, setSlug] = useState(volume?.slug || "");
  const [capaUrl, setCapaUrl] = useState(volume?.capa_url || "");
  const [editorial, setEditorial] = useState(volume?.editorial || "");
  const [published, setPublished] = useState(volume?.published || false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const generateSlug = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMagazineImage(file);
      setCapaUrl(url);
      toast.success("Capa enviada");
    } catch (err: any) {
      toast.error("Erro: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!titulo || !slug) {
      toast.error("Preencha título e slug");
      return;
    }
    setSaving(true);
    try {
      const payload = { titulo, numero, ano, slug, capa_url: capaUrl || null, editorial: editorial || null, published };
      if (isEditing) {
        await updateVolume.mutateAsync({ id: volume!.id, ...payload });
        toast.success("Volume atualizado");
      } else {
        await createVolume.mutateAsync(payload);
        toast.success("Volume criado");
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
              {saving ? "Salvando…" : isEditing ? "Atualizar" : "Criar volume"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        {/* Cover */}
        <div className="mb-6">
          {capaUrl ? (
            <div className="relative group">
              <img src={capaUrl} alt="Capa" className="w-full aspect-[3/4] max-w-xs object-cover rounded-xl" />
              <button onClick={() => setCapaUrl("")}
                className="absolute top-3 right-3 bg-background/80 text-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-8 cursor-pointer text-muted-foreground hover:border-accent hover:text-accent transition-colors text-sm max-w-xs">
              <Upload size={18} /> {uploading ? "Enviando…" : "Adicionar capa"}
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Title */}
        <input
          value={titulo}
          onChange={(e) => { setTitulo(e.target.value); if (!isEditing) setSlug(generateSlug(e.target.value)); }}
          placeholder="Título do volume"
          className="w-full text-2xl sm:text-4xl font-black font-[family-name:var(--font-display)] bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40 uppercase leading-tight"
        />

        {/* Meta */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[3px] text-muted-foreground block mb-2">Número</label>
            <input type="number" value={numero} onChange={(e) => setNumero(Number(e.target.value))}
              className="w-full bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[3px] text-muted-foreground block mb-2">Ano</label>
            <input type="number" value={ano} onChange={(e) => setAno(Number(e.target.value))}
              className="w-full bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[3px] text-muted-foreground block mb-2">Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border outline-none focus:ring-1 focus:ring-accent" placeholder="slug-do-volume" />
          </div>
        </div>

        {/* Editorial */}
        <div className="mt-8">
          <label className="text-[10px] font-bold uppercase tracking-[3px] text-muted-foreground block mb-2">Editorial</label>
          <RichEditor content={editorial} onChange={setEditorial} />
        </div>
      </div>
    </div>
  );
};

export default MagazineVolumeEditor;

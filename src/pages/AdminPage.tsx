import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePosts, useCategories, useCreatePost, useUpdatePost, useDeletePost, uploadPostImage } from "@/hooks/usePosts";
import { useSiteSetting, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import type { Post } from "@/hooks/usePosts";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, LogOut, Eye, EyeOff, Star, Upload, X, FileText } from "lucide-react";
import RichEditor from "@/components/RichEditor";

const ADMIN_EMAIL = "christianlucas12@gmail.com";

const AdminPage = () => {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Carregando…</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-black text-foreground uppercase text-center">Admin</h1>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setAuthError("");
              const { error } = await signIn(email, password);
              if (error) setAuthError(error.message);
            }}
            className="space-y-4"
          >
            <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-secondary text-foreground px-4 py-3 rounded-lg border border-border outline-none focus:ring-2 focus:ring-accent" />
            <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-secondary text-foreground px-4 py-3 rounded-lg border border-border outline-none focus:ring-2 focus:ring-accent" />
            {authError && <p className="text-destructive text-sm">{authError}</p>}
            <button type="submit" className="w-full bg-accent text-accent-foreground py-3 rounded-lg font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Only allow admin email
  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-black text-foreground uppercase">Acesso negado</h1>
          <p className="text-muted-foreground text-sm">Você não tem permissão para acessar esta área.</p>
          <button onClick={signOut} className="text-accent hover:underline text-sm">Sair</button>
        </div>
      </div>
    );
  }

  return <AdminDashboard onSignOut={signOut} />;
};

function AdminDashboard({ onSignOut }: { onSignOut: () => void }) {
  const { data: posts, isLoading } = usePosts();
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);
  const deletePost = useDeletePost();
  const { data: envioVisible } = useSiteSetting("envio_page_visible");
  const updateSetting = useUpdateSiteSetting();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 md:px-8 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-black uppercase">Admin — Espectro</h1>
        <div className="flex gap-3">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-border text-foreground px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-secondary transition-colors">
            <Eye size={16} /> Ver site
          </a>
          <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">
            <Plus size={16} /> Novo post
          </button>
          <button onClick={onSignOut} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Sair">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Settings bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <FileText size={16} className="text-muted-foreground" />
          <span className="text-sm text-foreground font-medium">Página "Envio de Originais"</span>
          <button
            onClick={() => {
              const newVal = !envioVisible;
              updateSetting.mutate({ key: "envio_page_visible", value: newVal });
              toast.success(newVal ? "Página de envio visível" : "Página de envio oculta");
            }}
            className={`ml-auto text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all ${
              envioVisible !== false
                ? "bg-accent/15 text-accent border border-accent/30"
                : "bg-secondary text-muted-foreground border border-border"
            }`}
          >
            {envioVisible !== false ? "Visível" : "Oculta"}
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando posts…</p>
        ) : (
          <div className="space-y-3">
            {posts?.map((post) => (
              <div key={post.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {post.destaque && <Star size={14} className="text-accent" />}
                    {post.published ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 flex items-center gap-1"><Eye size={12} /> Publicado</span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><EyeOff size={12} /> Rascunho</span>
                    )}
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">· {post.categories?.nome}</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold truncate">{post.titulo}</h3>
                  <p className="text-sm text-muted-foreground truncate">{post.resumo}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setEditing(post)} className="p-2 hover:bg-secondary rounded-lg transition-colors" aria-label="Editar">
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm("Deletar este post?")) {
                        await deletePost.mutateAsync(post.id);
                        toast.success("Post deletado");
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
            {posts?.length === 0 && <p className="text-muted-foreground text-center py-12">Nenhum post ainda. Clique em "Novo post" para começar.</p>}
          </div>
        )}
      </main>

      {(creating || editing) && (
        <PostEditor
          post={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
        />
      )}
    </div>
  );
}

function PostEditor({ post, onClose }: { post: Post | null; onClose: () => void }) {
  const { data: categories } = useCategories();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const isEditing = !!post;

  // Convert old array content to HTML if needed
  const initialHtml = (() => {
    if (!post?.conteudo) return "";
    if (typeof post.conteudo === "string") return post.conteudo;
    if (Array.isArray(post.conteudo)) {
      return (post.conteudo as string[]).map(block => {
        if (typeof block === "string" && block.startsWith("[IMG]")) {
          const url = block.replace("[IMG]", "").replace("[/IMG]", "");
          return `<img src="${url}" />`;
        }
        if (typeof block === "string" && block.startsWith("**") && block.endsWith("**")) {
          return `<p><strong>${block.replace(/\*\*/g, "")}</strong></p>`;
        }
        return `<p>${block}</p>`;
      }).join("");
    }
    return "";
  })();

  const [titulo, setTitulo] = useState(post?.titulo || "");
  const [subtitulo, setSubtitulo] = useState(post?.subtitulo || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [autor, setAutor] = useState(post?.autor || "");
  const [categoriaId, setCategoriaId] = useState(post?.categoria_id || "");
  const [resumo, setResumo] = useState(post?.resumo || "");
  const [conteudoHtml, setConteudoHtml] = useState(initialHtml);
  const [imagemUrl, setImagemUrl] = useState(post?.imagem_url || "");
  const [published, setPublished] = useState(post?.published || false);
  const [destaque, setDestaque] = useState(post?.destaque || false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const generateSlug = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPostImage(file);
      setImagemUrl(url);
      toast.success("Imagem enviada");
    } catch (err: any) {
      toast.error("Erro ao enviar imagem: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!titulo || !slug || !autor || !categoriaId || !resumo) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        titulo, subtitulo: subtitulo || null, slug, autor, categoria_id: categoriaId,
        resumo, conteudo: conteudoHtml as any, imagem_url: imagemUrl || null, published, destaque,
      };
      if (isEditing) {
        await updatePost.mutateAsync({ id: post!.id, ...payload });
        toast.success("Post atualizado");
      } else {
        await createPost.mutateAsync(payload);
        toast.success("Post criado");
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
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-border accent-accent" />
              Publicar
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
              <input type="checkbox" checked={destaque} onChange={(e) => setDestaque(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-border accent-accent" />
              Destaque
            </label>
            <button onClick={handleSave} disabled={saving}
              className="bg-accent text-accent-foreground px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? "Salvando…" : isEditing ? "Atualizar" : "Publicar"}
            </button>
          </div>
        </div>
      </div>

      {/* Substack-style editor body */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Cover image */}
        <div className="mb-8">
          {imagemUrl ? (
            <div className="relative group">
              <img src={imagemUrl} alt="Capa" className="w-full aspect-[16/9] object-cover rounded-xl" />
              <button onClick={() => setImagemUrl("")}
                className="absolute top-3 right-3 bg-background/80 text-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-10 cursor-pointer text-muted-foreground hover:border-accent hover:text-accent transition-colors text-sm">
              <Upload size={18} /> {uploading ? "Enviando…" : "Adicionar imagem de capa"}
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Title — Substack style */}
        <input
          value={titulo}
          onChange={(e) => { setTitulo(e.target.value); if (!isEditing) setSlug(generateSlug(e.target.value)); }}
          placeholder="Título"
          className="w-full text-4xl md:text-5xl font-black font-[family-name:var(--font-display)] bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40 uppercase leading-tight"
        />

        {/* Subtitle */}
        <input
          value={subtitulo}
          onChange={(e) => setSubtitulo(e.target.value)}
          placeholder="Adicione um subtítulo…"
          className="w-full mt-3 text-lg font-[family-name:var(--font-display)] bg-transparent outline-none text-muted-foreground placeholder:text-muted-foreground/40"
        />

        {/* Author chip */}
        <div className="mt-5 flex items-center gap-2 flex-wrap">
          {autor && (
            <span className="inline-flex items-center gap-1.5 bg-secondary text-foreground text-sm px-3 py-1.5 rounded-full">
              {autor}
              <button onClick={() => setAutor("")} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
            </span>
          )}
          {!autor && (
            <input
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              placeholder="Nome do autor"
              className="bg-transparent outline-none text-sm text-muted-foreground placeholder:text-muted-foreground/40"
            />
          )}
        </div>

        {/* Meta row */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[3px] text-muted-foreground block mb-2">Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border outline-none focus:ring-1 focus:ring-accent" placeholder="slug-do-post" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[3px] text-muted-foreground block mb-2">Categoria</label>
            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border outline-none focus:ring-1 focus:ring-accent">
              <option value="">Selecione…</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
        </div>

        {/* Resumo */}
        <div className="mt-4">
          <label className="text-[10px] font-bold uppercase tracking-[3px] text-muted-foreground block mb-2">Resumo</label>
          <textarea value={resumo} onChange={(e) => setResumo(e.target.value)}
            className="w-full bg-secondary text-foreground text-sm px-3 py-2 rounded-lg border border-border outline-none focus:ring-1 focus:ring-accent min-h-[60px]" placeholder="Resumo do post…" />
        </div>

        {/* Rich editor */}
        <div className="mt-8">
          <RichEditor content={conteudoHtml} onChange={setConteudoHtml} />
        </div>
      </div>
    </div>
  );
}

export default AdminPage;

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePosts, useCategories, useCreatePost, useUpdatePost, useDeletePost, uploadPostImage } from "@/hooks/usePosts";
import type { Post } from "@/hooks/usePosts";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, LogOut, Eye, EyeOff, Star, Upload, Image as ImageIcon } from "lucide-react";

const ADMIN_EMAIL = "christianlucas12@gmail.com";

const AdminPage = () => {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 md:px-8 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-black uppercase">Admin — Espectro</h1>
        <div className="flex gap-3">
          <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">
            <Plus size={16} /> Novo post
          </button>
          <button onClick={onSignOut} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Sair">
            <LogOut size={20} />
          </button>
        </div>
      </header>

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

  const [titulo, setTitulo] = useState(post?.titulo || "");
  const [subtitulo, setSubtitulo] = useState(post?.subtitulo || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [autor, setAutor] = useState(post?.autor || "");
  const [categoriaId, setCategoriaId] = useState(post?.categoria_id || "");
  const [resumo, setResumo] = useState(post?.resumo || "");
  const [conteudo, setConteudo] = useState<string[]>(
    Array.isArray(post?.conteudo) ? (post.conteudo as string[]) : []
  );
  const [imagemUrl, setImagemUrl] = useState(post?.imagem_url || "");
  const [published, setPublished] = useState(post?.published || false);
  const [destaque, setDestaque] = useState(post?.destaque || false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const generateSlug = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleContentImageInsert = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPostImage(file);
      const updated = [...conteudo];
      updated.splice(index + 1, 0, `[IMG]${url}[/IMG]`);
      setConteudo(updated);
      toast.success("Imagem inserida no conteúdo");
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
        resumo, conteudo: conteudo as any, imagem_url: imagemUrl || null, published, destaque,
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

  const inputClass = "w-full bg-secondary text-foreground px-4 py-3 rounded-lg border border-border outline-none focus:ring-2 focus:ring-accent text-sm";
  const labelClass = "text-[10px] font-bold uppercase tracking-[3px] text-muted-foreground block mb-2";

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-black uppercase">
            {isEditing ? "Editar post" : "Novo post"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm uppercase tracking-wider">
            Cancelar
          </button>
        </div>

        <div className="space-y-6">
          {/* Title & Slug */}
          <div>
            <label className={labelClass}>Título *</label>
            <input value={titulo} onChange={(e) => { setTitulo(e.target.value); if (!isEditing) setSlug(generateSlug(e.target.value)); }}
              className={inputClass} placeholder="Título do post" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Slug *</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} placeholder="slug-do-post" />
            </div>
            <div>
              <label className={labelClass}>Autor *</label>
              <input value={autor} onChange={(e) => setAutor(e.target.value)} className={inputClass} placeholder="Nome do autor" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Subtítulo</label>
            <input value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} className={inputClass} placeholder="Subtítulo (opcional)" />
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>Categoria *</label>
            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className={inputClass}>
              <option value="">Selecione…</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>

          {/* Cover Image */}
          <div>
            <label className={labelClass}>Imagem de capa</label>
            <div className="flex items-center gap-4">
              {imagemUrl && <img src={imagemUrl} alt="Capa" className="h-24 w-36 object-cover rounded-lg border border-border" />}
              <label className="flex items-center gap-2 bg-secondary px-4 py-3 rounded-lg cursor-pointer hover:bg-muted transition-colors text-sm">
                <Upload size={16} /> {uploading ? "Enviando…" : "Enviar imagem"}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className={labelClass}>Resumo *</label>
            <textarea value={resumo} onChange={(e) => setResumo(e.target.value)} className={inputClass + " min-h-[80px]"} placeholder="Resumo do post" />
          </div>

          {/* Content blocks */}
          <div>
            <label className={labelClass}>Conteúdo</label>
            <div className="space-y-3">
              {conteudo.map((block, i) => (
                <div key={i} className="relative group">
                  {block.startsWith("[IMG]") ? (
                    <div className="relative">
                      <img src={block.replace("[IMG]", "").replace("[/IMG]", "")} alt="" className="w-full rounded-lg border border-border" />
                      <button onClick={() => setConteudo(conteudo.filter((_, j) => j !== i))}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <textarea value={block} onChange={(e) => { const u = [...conteudo]; u[i] = e.target.value; setConteudo(u); }}
                        className={inputClass + " min-h-[80px] flex-1"} />
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={() => setConteudo(conteudo.filter((_, j) => j !== i))}
                          className="p-2 text-destructive hover:bg-destructive/20 rounded-lg transition-colors" aria-label="Remover">
                          <Trash2 size={14} />
                        </button>
                        <label className="p-2 text-muted-foreground hover:text-accent cursor-pointer rounded-lg hover:bg-secondary transition-colors" aria-label="Inserir imagem">
                          <ImageIcon size={14} />
                          <input type="file" accept="image/*" onChange={(e) => handleContentImageInsert(e, i)} className="hidden" />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={() => setConteudo([...conteudo, ""])}
                className="w-full border-2 border-dashed border-border text-muted-foreground py-3 rounded-lg hover:border-accent hover:text-accent transition-colors text-sm uppercase tracking-wider">
                + Adicionar parágrafo
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-accent" />
              <span className="text-sm">Publicado</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={destaque} onChange={(e) => setDestaque(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-accent" />
              <span className="text-sm">Destaque (hero)</span>
            </label>
          </div>

          {/* Save */}
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-accent text-accent-foreground py-4 rounded-lg font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? "Salvando…" : isEditing ? "Atualizar post" : "Criar post"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;

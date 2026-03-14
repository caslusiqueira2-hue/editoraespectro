import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteBar from "@/components/QuoteBar";
import { usePost } from "@/hooks/usePosts";
import { useTrackPageView } from "@/hooks/usePageTracking";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { sanitizeHtml } from "@/lib/sanitize";
import MaisLidos from "@/components/MaisLidos";

const ArtigoPage = () => {
  const { slug } = useParams();
  const { data: artigo, isLoading } = usePost(slug || "");
  useTrackPageView(`/artigo/${slug}`, "post", artigo?.id);
  useDocumentTitle(artigo?.titulo);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Carregando…</div>
        <Footer />
      </div>
    );
  }

  if (!artigo) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)] uppercase">Artigo não encontrado</h1>
            <Link to="/" className="mt-4 inline-block text-accent hover:underline">← Voltar ao início</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const contentHtml = typeof artigo.conteudo === "string"
    ? artigo.conteudo
    : Array.isArray(artigo.conteudo)
      ? (artigo.conteudo as string[]).map(block => {
          if (typeof block === "string" && block.startsWith("[IMG]")) {
            const url = block.replace("[IMG]", "").replace("[/IMG]", "");
            return `<img src="${encodeURI(url)}" loading="lazy" />`;
          }
          if (typeof block === "string" && block.startsWith("**") && block.endsWith("**")) {
            return `<p><strong>${block.replace(/\*\*/g, "")}</strong></p>`;
          }
          return `<p>${block}</p>`;
        }).join("")
      : "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {artigo.imagem_url && (
        <div className="relative h-[35vh] sm:h-[50vh] min-h-[250px] sm:min-h-[350px] overflow-hidden">
          <img src={artigo.imagem_url} alt={artigo.titulo} className="absolute inset-0 w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-4xl mx-auto px-4 md:px-8 ${artigo.imagem_url ? "-mt-16 sm:-mt-20" : "mt-8 sm:mt-12"} relative z-10`}
      >
        <span className="inline-block text-[10px] font-bold uppercase tracking-[4px] text-accent mb-3">
          {artigo.categories?.nome}
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-5xl font-bold leading-tight text-foreground">
          {artigo.titulo}
        </h1>
        {artigo.subtitulo && (
          <p className="mt-3 text-base sm:text-lg text-muted-foreground font-[family-name:var(--font-display)]">
            {artigo.subtitulo}
          </p>
        )}
      </motion.div>

      {/* Breadcrumb */}
      <nav className="max-w-4xl mx-auto px-4 md:px-8 mt-4 sm:mt-6 text-xs text-muted-foreground uppercase tracking-wider overflow-x-auto whitespace-nowrap" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-accent transition-colors">Início</Link>
        <span className="mx-2">›</span>
        <Link to={`/categoria/${artigo.categories?.slug}`} className="hover:text-accent transition-colors">{artigo.categories?.nome}</Link>
        <span className="mx-2">›</span>
        <span className="text-foreground">{artigo.titulo}</span>
      </nav>

      <main className="max-w-4xl mx-auto px-4 md:px-8 mt-8 sm:mt-10 mb-16 sm:mb-20">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Mobile meta */}
          <aside className="md:hidden flex flex-wrap gap-6 pb-6 border-b border-border">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[3px] text-muted-foreground block">Escrito por</span>
              <span className="text-sm font-bold mt-1 block text-foreground">{artigo.autor}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[3px] text-muted-foreground block">Publicado em</span>
              <span className="text-sm font-bold mt-1 block text-foreground">
                {new Date(artigo.created_at).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[3px] text-muted-foreground block">Editoria</span>
              <span className="text-sm font-bold mt-1 block text-foreground">{artigo.categories?.nome}</span>
            </div>
          </aside>
          {/* Mobile "Mais Lidos" */}
          <div className="md:hidden border-t border-border pt-6">
            <MaisLidos />
          </div>

          <article className="flex-1 prose-editor text-foreground/85 overflow-hidden"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentHtml) }}
          />

          {/* Desktop sidebar */}
          <aside className="hidden md:block md:w-56 shrink-0 space-y-8 md:border-l md:border-border md:pl-8">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[3px] text-muted-foreground block">Escrito por</span>
              <span className="text-sm font-bold mt-1 block text-foreground">{artigo.autor}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[3px] text-muted-foreground block">Publicado em</span>
              <span className="text-sm font-bold mt-1 block text-foreground">
                {new Date(artigo.created_at).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[3px] text-muted-foreground block">Editoria</span>
              <span className="text-sm font-bold mt-1 block text-foreground">{artigo.categories?.nome}</span>
            </div>

            <div className="border-t border-border pt-6">
              <MaisLidos />
            </div>
          </aside>
        </div>
      </main>

      <QuoteBar />
      <Footer />
    </div>
  );
};

export default ArtigoPage;

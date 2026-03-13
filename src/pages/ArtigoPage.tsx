import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteBar from "@/components/QuoteBar";
import { usePost } from "@/hooks/usePosts";

const ArtigoPage = () => {
  const { slug } = useParams();
  const { data: artigo, isLoading } = usePost(slug || "");

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
          <div className="text-center">
            <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] uppercase">Artigo não encontrado</h1>
            <Link to="/" className="mt-4 inline-block text-accent hover:underline">← Voltar ao início</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const conteudo = Array.isArray(artigo.conteudo) ? (artigo.conteudo as string[]) : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero banner */}
      {artigo.imagem_url && (
        <div className="relative h-[50vh] min-h-[350px] overflow-hidden">
          <img src={artigo.imagem_url} alt={artigo.titulo} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-4xl mx-auto px-4 md:px-8 ${artigo.imagem_url ? "-mt-20" : "mt-12"} relative z-10`}
      >
        <span className="inline-block text-[10px] font-bold uppercase tracking-[4px] text-accent mb-3">
          {artigo.categories?.nome}
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-5xl font-black leading-tight text-foreground uppercase">
          {artigo.titulo}
        </h1>
        {artigo.subtitulo && (
          <p className="mt-3 text-lg text-muted-foreground font-[family-name:var(--font-display)]">
            {artigo.subtitulo}
          </p>
        )}
      </motion.div>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 mt-6 text-xs text-muted-foreground uppercase tracking-wider">
        <Link to="/" className="hover:text-accent transition-colors">Início</Link>
        <span className="mx-2">›</span>
        <Link to={`/categoria/${artigo.categories?.slug}`} className="hover:text-accent transition-colors">{artigo.categories?.nome}</Link>
        <span className="mx-2">›</span>
        <span className="text-foreground">{artigo.titulo}</span>
      </div>

      {/* Content + Meta */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 mt-10 mb-20">
        <div className="flex flex-col md:flex-row gap-12">
          <article className="flex-1 space-y-5">
            {conteudo.map((p, i) => {
              if (typeof p === "string" && p.startsWith("[IMG]") && p.endsWith("[/IMG]")) {
                const url = p.replace("[IMG]", "").replace("[/IMG]", "");
                return <img key={i} src={url} alt="" className="w-full rounded-lg my-4" />;
              }
              if (typeof p === "string" && p.startsWith("**") && p.endsWith("**")) {
                return <p key={i} className="text-base leading-relaxed"><strong className="text-accent">{p.replace(/\*\*/g, "")}</strong></p>;
              }
              return (
                <p key={i} className="text-base leading-[1.8] text-foreground/85">
                  {i === 0 && <span className="drop-cap">{String(p).charAt(0)}</span>}
                  {i === 0 ? String(p).slice(1) : p}
                </p>
              );
            })}
          </article>

          <aside className="md:w-52 shrink-0 space-y-6 md:border-l md:border-border md:pl-8">
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
        </div>
      </main>

      <QuoteBar />
      <Footer />
    </div>
  );
};

export default ArtigoPage;

import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteBar from "@/components/QuoteBar";
import { ARTIGOS } from "@/data/artigos";

const ArtigoPage = () => {
  const { slug } = useParams();
  const artigo = ARTIGOS.find((a) => a.slug === slug);

  if (!artigo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-[family-name:var(--font-display)]">Artigo não encontrado</h1>
            <Link to="/" className="mt-4 inline-block text-accent hover:underline">← Voltar ao início</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Cover Image */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <img
          src={artigo.imagem}
          alt={artigo.titulo}
          className="w-full max-h-[500px] object-cover rounded-sm"
        />
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-4 mt-8"
      >
        <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-black leading-tight">
          {artigo.titulo}
        </h1>
        {artigo.subtitulo && (
          <p className="mt-2 text-lg text-muted-foreground italic font-[family-name:var(--font-display)]">
            {artigo.subtitulo}
          </p>
        )}
      </motion.div>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 mt-4 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-accent transition-colors">Início</Link>
        <span className="mx-1">›</span>
        <Link to={`/categoria/${artigo.categoriaSlug}`} className="hover:text-accent transition-colors">{artigo.categoria}</Link>
        <span className="mx-1">›</span>
        <span className="text-foreground">{artigo.titulo}</span>
      </div>

      {/* Content + Meta */}
      <main className="max-w-4xl mx-auto px-4 mt-8 mb-16">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Article body */}
          <article className="flex-1 prose prose-lg max-w-none">
            {artigo.conteudo?.map((p, i) => {
              if (p.startsWith("**") && p.endsWith("**")) {
                return <p key={i} className="text-base leading-relaxed mt-4"><strong>{p.replace(/\*\*/g, "")}</strong></p>;
              }
              return (
                <p key={i} className="text-base leading-relaxed mt-4">
                  {i === 0 && <span className="drop-cap">{p.charAt(0)}</span>}
                  {i === 0 ? p.slice(1) : p}
                </p>
              );
            })}
          </article>

          {/* Sidebar meta */}
          <aside className="md:w-56 shrink-0 space-y-6 md:border-l md:border-border md:pl-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground block">Escrito por</span>
              <span className="text-sm font-semibold mt-1 block">{artigo.autor}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground block">Publicado em</span>
              <span className="text-sm font-semibold mt-1 block">{artigo.data}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground block">Editoria</span>
              <span className="text-sm font-semibold mt-1 block">{artigo.categoria}</span>
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

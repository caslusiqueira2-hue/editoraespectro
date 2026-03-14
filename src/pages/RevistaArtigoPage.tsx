import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteBar from "@/components/QuoteBar";
import { useMagazineArticle, useVolumeArticles, useVolume } from "@/hooks/useMagazine";
import { useTrackPageView } from "@/hooks/usePageTracking";

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

const RevistaArtigoPage = () => {
  const { volumeSlug, artigoSlug } = useParams();
  const { data: article, isLoading } = useMagazineArticle(volumeSlug || "", artigoSlug || "");
  const volume = article?.magazine_volumes;
  const { data: siblingArticles } = useVolumeArticles(volume?.id, true);
  useTrackPageView(`/revista/${volumeSlug}/${artigoSlug}`, "revista-artigo", article?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Carregando…</div>
        <Footer />
      </div>
    );
  }

  if (!article || !volume) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] uppercase">Artigo não encontrado</h1>
            <Link to="/revista" className="mt-4 inline-block text-accent hover:underline">← Voltar à revista</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Find prev/next articles
  const currentIdx = siblingArticles?.findIndex((a) => a.id === article.id) ?? -1;
  const prevArticle = currentIdx > 0 ? siblingArticles?.[currentIdx - 1] : null;
  const nextArticle = currentIdx >= 0 && siblingArticles ? siblingArticles[currentIdx + 1] : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {article.imagem_url && (
        <div className="relative h-[35vh] sm:h-[50vh] min-h-[250px] overflow-hidden">
          <img src={article.imagem_url} alt={article.titulo} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-4xl mx-auto px-4 md:px-8 ${article.imagem_url ? "-mt-16 sm:-mt-20" : "mt-8 sm:mt-12"} relative z-10`}
      >
        <span className="inline-block text-[10px] font-bold uppercase tracking-[4px] text-accent mb-3 font-[family-name:var(--font-ui)]">
          {SECTION_LABELS[article.secao] || article.secao}
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-5xl font-bold leading-tight text-foreground">
          {article.titulo}
        </h1>
      </motion.div>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 mt-4 sm:mt-6 text-xs text-muted-foreground uppercase tracking-wider overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-accent transition-colors">Início</Link>
        <span className="mx-2">›</span>
        <Link to="/revista" className="hover:text-accent transition-colors">Revista</Link>
        <span className="mx-2">›</span>
        <Link to={`/revista/${volumeSlug}`} className="hover:text-accent transition-colors">
          Volume {toRoman(volume.numero)}
        </Link>
        <span className="mx-2">›</span>
        <span className="text-foreground">{article.titulo}</span>
      </div>

      {/* Back to Sumário */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 mt-3">
        <Link
          to={`/revista/${volumeSlug}`}
          className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-[family-name:var(--font-ui)] uppercase tracking-wider"
        >
          ← Voltar para Sumário
        </Link>
      </div>

      <main className="max-w-4xl mx-auto px-4 md:px-8 mt-8 sm:mt-10 mb-16 sm:mb-20">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Mobile meta */}
          <aside className="md:hidden flex flex-wrap gap-6 pb-6 border-b border-border">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[3px] text-muted-foreground block">Escrito por</span>
              <span className="text-sm font-bold mt-1 block text-foreground">{article.autor}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[3px] text-muted-foreground block">Seção</span>
              <span className="text-sm font-bold mt-1 block text-foreground">{SECTION_LABELS[article.secao] || article.secao}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[3px] text-muted-foreground block">Volume</span>
              <span className="text-sm font-bold mt-1 block text-foreground">
                Vol. {toRoman(volume.numero)} — {volume.titulo}
              </span>
            </div>
          </aside>

          {/* Article content */}
          <article
            className="flex-1 prose-editor text-foreground/85 overflow-hidden"
            dangerouslySetInnerHTML={{ __html: article.conteudo }}
          />

          {/* Desktop sidebar */}
          <aside className="hidden md:block md:w-56 shrink-0 space-y-8 md:border-l md:border-border md:pl-8">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[3px] text-muted-foreground block">Escrito por</span>
              <span className="text-sm font-bold mt-1 block text-foreground">{article.autor}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[3px] text-muted-foreground block">Seção</span>
              <span className="text-sm font-bold mt-1 block text-foreground">{SECTION_LABELS[article.secao] || article.secao}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[3px] text-muted-foreground block">Volume</span>
              <Link to={`/revista/${volumeSlug}`} className="text-sm font-bold mt-1 block text-accent hover:underline">
                Vol. {toRoman(volume.numero)} — {volume.titulo}
              </Link>
            </div>

            {/* Other articles in this volume */}
            {siblingArticles && siblingArticles.length > 1 && (
              <div className="border-t border-border pt-6">
                <span className="text-[9px] font-bold uppercase tracking-[3px] text-muted-foreground block mb-3">
                  Neste volume
                </span>
                <div className="space-y-2">
                  {siblingArticles.filter(a => a.id !== article.id).slice(0, 6).map((a) => (
                    <Link
                      key={a.id}
                      to={`/revista/${volumeSlug}/${a.slug}`}
                      className="block text-sm text-muted-foreground hover:text-accent transition-colors leading-snug"
                    >
                      {a.titulo}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Prev/Next navigation */}
        {(prevArticle || nextArticle) && (
          <div className="mt-14 pt-8 border-t border-border flex justify-between gap-4">
            {prevArticle ? (
              <Link to={`/revista/${volumeSlug}/${prevArticle.slug}`} className="group text-left">
                <span className="text-[9px] font-bold uppercase tracking-[3px] text-muted-foreground">← Anterior</span>
                <span className="block mt-1 text-sm font-[family-name:var(--font-display)] font-semibold text-foreground group-hover:text-accent transition-colors">
                  {prevArticle.titulo}
                </span>
              </Link>
            ) : <div />}
            {nextArticle ? (
              <Link to={`/revista/${volumeSlug}/${nextArticle.slug}`} className="group text-right">
                <span className="text-[9px] font-bold uppercase tracking-[3px] text-muted-foreground">Próximo →</span>
                <span className="block mt-1 text-sm font-[family-name:var(--font-display)] font-semibold text-foreground group-hover:text-accent transition-colors">
                  {nextArticle.titulo}
                </span>
              </Link>
            ) : <div />}
          </div>
        )}
      </main>

      <QuoteBar />
      <Footer />
    </div>
  );
};

export default RevistaArtigoPage;

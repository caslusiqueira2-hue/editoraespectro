import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteBar from "@/components/QuoteBar";
import AnimatedSection from "@/components/AnimatedSection";
import { useVolume, useVolumeArticles } from "@/hooks/useMagazine";
import { useTrackPageView } from "@/hooks/usePageTracking";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { sanitizeHtml } from "@/lib/sanitize";

const SECTION_ORDER = ["conto", "poesia", "ensaio", "resenha"];
const SECTION_LABELS: Record<string, string> = {
  conto: "Contos",
  poesia: "Poesia",
  ensaio: "Ensaios",
  resenha: "Resenhas",
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

const VolumePage = () => {
  const { volumeSlug } = useParams();
  const navigate = useNavigate();
  const { data: volume, isLoading: volLoading } = useVolume(volumeSlug || "");
  const { data: articles } = useVolumeArticles(volume?.id, true);
  useTrackPageView(`/revista/${volumeSlug}`, "revista-volume", volume?.id);
  useDocumentTitle(volume ? `${volume.titulo} — Revista Espectro` : undefined);

  if (volLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Carregando…</div>
        <Footer />
      </div>
    );
  }

  if (!volume) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] uppercase">Volume não encontrado</h1>
            <Link to="/revista" className="mt-4 inline-block text-accent hover:underline">← Voltar à revista</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const grouped = SECTION_ORDER.reduce<Record<string, typeof articles>>((acc, sec) => {
    const items = articles?.filter((a) => a.secao === sec) || [];
    if (items.length > 0) acc[sec] = items;
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Cover + Hero */}
      {volume.capa_url && (
        <div className="relative h-[40vh] sm:h-[55vh] min-h-[280px] overflow-hidden">
          <img src={volume.capa_url} alt={volume.titulo} className="absolute inset-0 w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-4xl mx-auto px-4 md:px-8 ${volume.capa_url ? "-mt-16 sm:-mt-24" : "mt-12"} relative z-10`}
      >
        <span className="text-[10px] font-bold uppercase tracking-[4px] text-accent font-[family-name:var(--font-ui)]">
          Volume {toRoman(volume.numero)} · {volume.ano}
        </span>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl sm:text-5xl md:text-6xl font-bold text-foreground italic">
          {volume.titulo}
        </h1>
      </motion.div>

      {/* Breadcrumb */}
      <nav className="max-w-4xl mx-auto px-4 md:px-8 mt-4 text-xs text-muted-foreground uppercase tracking-wider" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-accent transition-colors">Início</Link>
        <span className="mx-2">›</span>
        <Link to="/revista" className="hover:text-accent transition-colors">Revista</Link>
        <span className="mx-2">›</span>
        <span className="text-foreground">{volume.titulo}</span>
      </nav>

      {/* Back link */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 mt-3">
        <Link
          to="/revista"
          className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-[family-name:var(--font-ui)] uppercase tracking-wider"
        >
          ← Voltar para Revista
        </Link>
      </div>

      <main className="max-w-4xl mx-auto px-4 md:px-8 mt-10 mb-16 sm:mb-20">
        {/* Editorial */}
        {volume.editorial && (
          <AnimatedSection>
            <div className="mb-14">
              <h2 className="text-[10px] font-bold uppercase tracking-[4px] text-muted-foreground mb-4 font-[family-name:var(--font-ui)]">
                Editorial
              </h2>
              <div
                className="prose-editor text-foreground/85"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(volume.editorial) }}
              />
            </div>
          </AnimatedSection>
        )}

        {/* Sumário */}
        <AnimatedSection delay={0.1}>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold mb-8 text-foreground uppercase tracking-wider">
              Sumário
            </h2>

            {Object.keys(grouped).length === 0 ? (
              <p className="text-muted-foreground font-[family-name:var(--font-body)] italic">
                Nenhum artigo publicado neste volume.
              </p>
            ) : (
              <div className="space-y-10">
                {Object.entries(grouped).map(([secao, items]) => (
                  <div key={secao}>
                    <h3 className="text-[10px] font-bold uppercase tracking-[4px] text-accent mb-4 font-[family-name:var(--font-ui)]">
                      {SECTION_LABELS[secao] || secao}
                    </h3>
                    <div className="space-y-1">
                      {items?.map((art) => (
                        <Link
                          key={art.id}
                          to={`/revista/${volumeSlug}/${art.slug}`}
                          className="group flex items-baseline gap-3 py-3 border-b border-border/50 hover:border-accent/30 transition-colors"
                        >
                          <span className="font-[family-name:var(--font-display)] text-base sm:text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                            {art.titulo}
                          </span>
                          <span className="flex-1 border-b border-dotted border-muted-foreground/30 min-w-[2rem] hidden sm:block" />
                          <span className="text-xs text-muted-foreground font-[family-name:var(--font-ui)] shrink-0">
                            {art.autor}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AnimatedSection>

        {/* Section filter (genres) */}
        <AnimatedSection delay={0.2}>
          <div className="mt-14 mb-10">
            <div className="flex flex-wrap items-center gap-3 justify-center">
              {SECTION_ORDER.map((key) => (
                <Link
                  key={key}
                  to={`/revista/secao/${key}`}
                  className="text-[10px] font-bold uppercase tracking-[3px] text-muted-foreground hover:text-accent transition-colors font-[family-name:var(--font-ui)] border border-border rounded-full px-4 py-1.5 hover:border-accent/30"
                >
                  {SECTION_LABELS[key] || key}
                </Link>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Read full edition button */}
        {articles && articles.length > 0 && (
          <div className="mt-4 text-center">
            <button
              className="border border-accent/30 text-accent px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-all font-[family-name:var(--font-ui)]"
              onClick={() => {
                const firstArticle = articles[0];
                if (firstArticle) {
                  navigate(`/revista/${volumeSlug}/${firstArticle.slug}`);
                }
              }}
            >
              Ler edição completa
            </button>
          </div>
        )}
      </main>

      <QuoteBar />
      <Footer />
    </div>
  );
};

export default VolumePage;

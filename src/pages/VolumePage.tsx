import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteBar from "@/components/QuoteBar";
import AnimatedSection from "@/components/AnimatedSection";
import OptimizedImage from "@/components/OptimizedImage";
import { useVolume, useVolumeArticles } from "@/hooks/useMagazine";
import { useTrackPageView } from "@/hooks/usePageTracking";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { sanitizeHtml } from "@/lib/sanitize";

import EditorialStatus from "@/components/EditorialStatus";
import { MAGAZINE_SECTIONS, volumeNumber } from "@/lib/editorial";

const VolumePage = () => {
  const { volumeSlug } = useParams();
  const volumeQuery = useVolume(volumeSlug || "");
  const { data: volume, isLoading: volLoading } = volumeQuery;
  const articlesQuery = useVolumeArticles(volume?.id, true);
  const { data: articles } = articlesQuery;
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

  if (!volume && volumeQuery.isError) {
    return <div className="flex min-h-screen flex-col"><Header /><main className="editorial-wrap flex-1 py-10"><EditorialStatus retry={() => volumeQuery.refetch()}>Não foi possível carregar este volume.</EditorialStatus></main><Footer /></div>;
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

  const sections = [...new Set([...Object.keys(MAGAZINE_SECTIONS), ...(articles ?? []).map((article) => article.secao)])];
  const grouped = sections.map((section) => ({
    section,
    items: (articles ?? []).filter((article) => article.secao === section),
  })).filter(({ items }) => items.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="editorial-wrap pt-6 sm:pt-10">
        <div className="grid items-center gap-7 border-y border-foreground py-6 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] sm:gap-10">
          {volume.capa_url && (
            <OptimizedImage src={volume.capa_url} alt="" aspectRatio="3/4" priority containerClassName="max-w-[16rem]" className="object-contain" />
          )}
          <div className={volume.capa_url ? "min-w-0" : "min-w-0 sm:col-span-2"}>
            <p className="editorial-label">Revista Espectro · Volume {volumeNumber(volume.numero)} · {volume.ano}</p>
            <h1 className="editorial-headline mt-4">{volume.titulo}</h1>
          </div>
        </div>
      </div>

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
                className="prose-editor editorial-reading text-foreground/90"
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

            {articlesQuery.isLoading ? (
              <EditorialStatus>Carregando o sumário…</EditorialStatus>
            ) : articlesQuery.isError && !articles ? (
              <EditorialStatus retry={() => articlesQuery.refetch()}>Não foi possível carregar o sumário.</EditorialStatus>
            ) : grouped.length === 0 ? (
              <p className="text-muted-foreground font-[family-name:var(--font-body)] italic">
                Nenhum artigo publicado neste volume.
              </p>
            ) : (
              <div className="space-y-10">
                {grouped.map(({ section: secao, items }) => (
                  <div key={secao}>
                    <h3 className="text-[10px] font-bold uppercase tracking-[4px] text-accent mb-4 font-[family-name:var(--font-ui)]">
                      {MAGAZINE_SECTIONS[secao as keyof typeof MAGAZINE_SECTIONS] || secao}
                    </h3>
                    <div className="space-y-1">
                      {items?.map((art) => (
                        <Link
                          key={art.id}
                          to={`/revista/${volumeSlug}/${art.slug}`}
                          className="group flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3 border-b border-border/50 hover:border-accent/30 transition-colors"
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
              {Object.entries(MAGAZINE_SECTIONS).map(([key, label]) => (
                <Link
                  key={key}
                  to={`/revista/secao/${key}`}
                  className="text-[10px] font-bold uppercase tracking-[3px] text-muted-foreground hover:text-accent transition-colors font-[family-name:var(--font-ui)] border border-border rounded-full px-4 py-1.5 hover:border-accent/30"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Read full edition button */}
        {articles && articles.length > 0 && (
          <div className="mt-4 text-center">
            <Link to={`/revista/${volumeSlug}/${articles[0].slug}`} className="editorial-link">
              Começar a leitura
            </Link>
          </div>
        )}
      </main>

      <QuoteBar />
      <Footer />
    </div>
  );
};

export default VolumePage;

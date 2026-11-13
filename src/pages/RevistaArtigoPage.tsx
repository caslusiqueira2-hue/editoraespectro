import { useParams, Link } from "react-router-dom";
import ReadingLayout from "@/components/ReadingLayout";
import { ArrowLeft, ArrowRight } from "lucide-react";
import EditorialStatus from "@/components/EditorialStatus";
import { volumeNumber } from "@/lib/editorial";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteBar from "@/components/QuoteBar";
import { useMagazineArticle, useVolumeArticles } from "@/hooks/useMagazine";
import { useTrackPageView } from "@/hooks/usePageTracking";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const SECTION_LABELS: Record<string, string> = {
  conto: "Conto",
  poesia: "Poesia",
  ensaio: "Ensaio",
  resenha: "Resenha",
};

const RevistaArtigoPage = () => {
  const { volumeSlug, artigoSlug } = useParams();
  const query = useMagazineArticle(volumeSlug || "", artigoSlug || "");
  const { data: article, isLoading } = query;
  const volume = article?.magazine_volumes;
  const { data: siblingArticles } = useVolumeArticles(volume?.id, true);
  useTrackPageView(`/revista/${volumeSlug}/${artigoSlug}`, "revista-artigo", article?.id);
  useDocumentTitle(article ? `${article.titulo} — Revista Espectro` : undefined);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Carregando…</div>
        <Footer />
      </div>
    );
  }

  if (!article && query.isError) {
    return <div className="flex min-h-screen flex-col"><Header /><main className="editorial-wrap flex-1 py-10"><EditorialStatus retry={() => query.refetch()}>Não foi possível carregar este texto da revista.</EditorialStatus></main><Footer /></div>;
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

  const currentIdx = siblingArticles?.findIndex((a) => a.id === article.id) ?? -1;
  const prevArticle = currentIdx > 0 ? siblingArticles?.[currentIdx - 1] : null;
  const nextArticle = currentIdx >= 0 && siblingArticles ? siblingArticles[currentIdx + 1] : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <ReadingLayout
        breadcrumbs={<>
          <Link to="/revista">Revista</Link>
          <span aria-hidden="true">/</span>
          <Link to={`/revista/${volume.slug}`}>Volume {volumeNumber(volume.numero)} · {volume.titulo}</Link>
        </>}
        section={SECTION_LABELS[article.secao] || article.secao}
        title={article.titulo}
        author={article.autor}
        image={article.imagem_url}
        poetry={article.secao === "poesia"}
        content={article.conteudo}
      >
        <nav aria-label="Continuar a leitura">
          <Link to={`/revista/${volume.slug}`} className="editorial-link">
            Voltar ao sumário
          </Link>
          {(prevArticle || nextArticle) && (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:gap-8">
              {prevArticle && (
                <Link to={`/revista/${volume.slug}/${prevArticle.slug}`} className="reading-next group">
                  <span className="editorial-byline flex items-center gap-2"><ArrowLeft size={14} aria-hidden="true" /> Anterior</span>
                  <span className="mt-2 block text-xl leading-tight group-hover:text-accent sm:text-2xl">{prevArticle.titulo}</span>
                </Link>
              )}
              {nextArticle && (
                <Link to={`/revista/${volume.slug}/${nextArticle.slug}`} className="reading-next group col-start-2 text-right">
                  <span className="editorial-byline flex items-center justify-end gap-2">Próximo <ArrowRight size={14} aria-hidden="true" /></span>
                  <span className="mt-2 block text-xl leading-tight group-hover:text-accent sm:text-2xl">{nextArticle.titulo}</span>
                </Link>
              )}
            </div>
          )}
        </nav>
      </ReadingLayout>
      <QuoteBar />
      <Footer />
    </div>
  );
};

export default RevistaArtigoPage;

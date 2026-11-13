import { useParams, Link } from "react-router-dom";
import ReadingLayout from "@/components/ReadingLayout";
import { ARTIGOS } from "@/data/artigos";
import EditorialStatus from "@/components/EditorialStatus";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteBar from "@/components/QuoteBar";
import { usePost } from "@/hooks/usePosts";
import { useTrackPageView } from "@/hooks/usePageTracking";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MaisLidos from "@/components/MaisLidos";

const ArtigoPage = () => {
  const { slug } = useParams();
  const query = usePost(slug || "");
  const manifesto = ARTIGOS.find((item) => item.slug === slug);
  const artigo = query.data ?? (manifesto ? {
    titulo: manifesto.titulo, subtitulo: manifesto.subtitulo, autor: manifesto.autor,
    imagem_url: manifesto.imagem, conteudo: manifesto.conteudo,
    created_at: "2026-02-21T12:00:00Z", categories: null,
  } : undefined);
  useTrackPageView(`/artigo/${slug}`, "post", query.data?.id);
  useDocumentTitle(artigo?.titulo);

  if (query.isLoading && !artigo) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Carregando…</div>
        <Footer />
      </div>
    );
  }

  if (!artigo && query.isError) {
    return <div className="flex min-h-screen flex-col"><Header /><main className="editorial-wrap flex-1 py-10"><EditorialStatus retry={() => query.refetch()}>Não foi possível carregar este texto.</EditorialStatus></main><Footer /></div>;
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
            return `<img src="${encodeURI(url).replace(/"/g, "&quot;")}" alt="" loading="lazy" />`;
          }
          if (typeof block === "string" && block.startsWith("**") && block.endsWith("**")) {
            return `<p><strong>${block.replace(/\*\*/g, "")}</strong></p>`;
          }
          return typeof block === "string" ? `<p>${block}</p>` : "";
        }).join("")
      : "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <ReadingLayout
        breadcrumbs={<>
          <Link to="/">Início</Link>
          {artigo.categories?.slug && (
            <><span aria-hidden="true">/</span><Link to={`/categoria/${artigo.categories.slug}`}>{artigo.categories.nome}</Link></>
          )}
        </>}
        section={artigo.categories?.nome || (manifesto ? "Manifesto" : "Editora Espectro")}
        title={artigo.titulo}
        subtitle={artigo.subtitulo}
        author={artigo.autor}
        date={artigo.created_at}
        image={artigo.imagem_url}
        poetry={artigo.categories?.slug === "poesia"}
        content={contentHtml}
      >
        <MaisLidos />
      </ReadingLayout>
      <QuoteBar />
      <Footer />
    </div>
  );
};

export default ArtigoPage;

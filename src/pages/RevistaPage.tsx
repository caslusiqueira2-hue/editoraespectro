import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EditorialStatus from "@/components/EditorialStatus";
import MagazineCover from "@/components/MagazineCover";
import artSeries from "@/assets/espectro-cover-art.jpg";
import { useVolumes } from "@/hooks/useMagazine";
import { useTrackPageView } from "@/hooks/usePageTracking";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { MAGAZINE_SECTIONS, plainText, volumeNumber } from "@/lib/editorial";

export default function RevistaPage() {
  const volumesQuery = useVolumes(true);
  const [current, ...archive] = volumesQuery.data ?? [];
  useTrackPageView("/revista", "revista");
  useDocumentTitle("Revista Espectro");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="editorial-wrap flex-1 pb-16">
        <div className="editorial-masthead magazine-masthead">
          <div>
            <p className="editorial-label">Publicação da Editora Espectro</p>
            <h1>Revista Espectro</h1>
            <p className="magazine-masthead-tagline">Literatura, pensamento e ecos do invisível.</p>
          </div>
          <div className="magazine-masthead-image" style={{ backgroundImage: `url("${artSeries}")` }} aria-hidden="true" />
        </div>

        <nav aria-label="Seções da revista" className="flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-foreground py-4">
          {Object.entries(MAGAZINE_SECTIONS).map(([slug, title]) => (
            <Link key={slug} to={`/revista/secao/${slug}`} className="editorial-link">
              {title} <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <section aria-labelledby="issue-title" className="py-10 sm:py-14">
          <h2 id="issue-title" className="editorial-section-title mb-7">Edição atual</h2>
          {volumesQuery.isLoading && <EditorialStatus>Carregando edições…</EditorialStatus>}
          {volumesQuery.isError && !volumesQuery.data && (
            <EditorialStatus retry={() => volumesQuery.refetch()}>Não foi possível carregar as edições.</EditorialStatus>
          )}
          {volumesQuery.isSuccess && !current && (
            <div className="grid items-center gap-6 border-y border-border py-6 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] sm:gap-10">
              <div className="magazine-empty-art" aria-hidden="true" />
              <div>
                <p className="text-3xl leading-tight [font-family:var(--font-display)]">Nenhum volume publicado ainda.</p>
                <Link to="/artigo/boas-vindas" className="editorial-link mt-5">
                  Ler o manifesto <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
          {current && (
            <article className="grid items-center gap-7 border-y border-border py-6 sm:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] sm:gap-10 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:gap-16">
              <Link to={`/revista/${current.slug}`} className="group block w-full max-w-[23rem]" aria-label={`Abrir edição: ${current.titulo}`}>
                <MagazineCover volume={current} priority decorative />
              </Link>
              <div>
                <p className="editorial-label">Volume {volumeNumber(current.numero)} · {current.ano}</p>
                <h3 className="editorial-headline mt-3">
                  <Link to={`/revista/${current.slug}`} className="hover:text-accent">{current.titulo}</Link>
                </h3>
                {current.editorial && (
                  <p className="mt-4 line-clamp-4 max-w-[48ch] text-xl leading-snug text-muted-foreground [font-family:var(--font-body)]">{plainText(current.editorial)}</p>
                )}
                <Link to={`/revista/${current.slug}`} className="editorial-link mt-6">Abrir edição <ArrowRight size={16} aria-hidden="true" /></Link>
              </div>
            </article>
          )}
        </section>

        {archive.length > 0 && (
          <section aria-labelledby="archive-title">
            <h2 id="archive-title" className="editorial-section-title mb-6">Edições anteriores</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4">
              {archive.map((volume) => (
                <article key={volume.id} className="border-t border-border pt-3">
                  <Link to={`/revista/${volume.slug}`} className="group block">
                    <MagazineCover volume={volume} decorative />
                    <p className="editorial-label mt-4">Vol. {volumeNumber(volume.numero)} · {volume.ano}</p>
                    <h3 className="mt-2 text-xl leading-tight group-hover:text-accent sm:text-2xl">{volume.titulo}</h3>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

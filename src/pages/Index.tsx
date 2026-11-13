import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteBar from "@/components/QuoteBar";
import ArticleCard from "@/components/ArticleCard";
import EditorialCover from "@/components/EditorialCover";
import EditorialStatus from "@/components/EditorialStatus";
import MaisLidos from "@/components/MaisLidos";
import NewsletterBox from "@/components/NewsletterBox";
import { usePosts } from "@/hooks/usePosts";
import { useVolumes } from "@/hooks/useMagazine";
import { useTrackPageView } from "@/hooks/usePageTracking";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSiteSetting } from "@/hooks/useSiteSettings";

export default function Index() {
  const postsQuery = usePosts(true);
  const [visibleCount, setVisibleCount] = useState(6);
  useTrackPageView("/", "home");
  useDocumentTitle();
  const { data: heroVisible } = useSiteSetting("home_hero_visible");
  const { data: recentVisible } = useSiteSetting("home_recentes_visible");
  const { data: mostReadVisible } = useSiteSetting("home_maislidos_visible");
  const { data: newsletterVisible } = useSiteSetting("home_newsletter_visible");
  const { data: quoteVisible } = useSiteSetting("home_quotebar_visible");
  const { data: volumes } = useVolumes(true, heroVisible !== false);

  const posts = postsQuery.data ?? [];
  const featured = posts.find((post) => post.destaque) ?? posts[0];
  const recent = posts.filter((post) => post.id !== featured?.id);
  const companionPosts = posts.length > 3 ? recent.slice(0, 2) : [];
  const remainingPosts = recent.slice(companionPosts.length);
  const recentPosts = heroVisible === false || remainingPosts.length === 0 ? posts : remainingPosts;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {heroVisible !== false ? (
          <EditorialCover featured={featured} companionPosts={companionPosts} issue={volumes?.[0]} />
        ) : (
          <h1 className="editorial-wrap pt-10 text-5xl sm:text-7xl">Editora Espectro</h1>
        )}

        {(recentVisible !== false || mostReadVisible !== false) && (
          <div className="editorial-wrap py-12 sm:py-16">
            {recentVisible !== false && (
              <section aria-labelledby="recent-title">
                <h2 id="recent-title" className="editorial-section-title mb-6">Publicações recentes</h2>
                {postsQuery.isLoading && <EditorialStatus>Carregando publicações…</EditorialStatus>}
                {postsQuery.isError && !postsQuery.data && (
                  <EditorialStatus retry={() => postsQuery.refetch()}>
                    Não foi possível carregar as publicações.
                  </EditorialStatus>
                )}
                {postsQuery.isSuccess && recentPosts.length === 0 && (
                  <EditorialStatus>Nenhum texto publicado ainda.</EditorialStatus>
                )}
                {recentPosts.length > 0 && (
                  <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                    {recentPosts.slice(0, visibleCount).map((post) => (
                      <ArticleCard key={post.id} artigo={{
                        slug: post.slug,
                        titulo: post.titulo,
                        resumo: post.resumo,
                        categoria: post.categories?.nome ?? "",
                        imagem: post.imagem_url,
                        autor: post.autor,
                      }} />
                    ))}
                  </div>
                )}
                {recentPosts.length > visibleCount && (
                  <button type="button" className="editorial-link mt-8" onClick={() => setVisibleCount((count) => count + 6)}>
                    Ver mais publicações
                  </button>
                )}
              </section>
            )}
            {mostReadVisible !== false && (
              <aside className={recentVisible !== false ? "mt-12" : undefined}>
                <MaisLidos />
              </aside>
            )}
          </div>
        )}
        {newsletterVisible !== false && <div className="editorial-wrap pb-14"><NewsletterBox /></div>}
        {quoteVisible !== false && <QuoteBar />}
      </main>
      <Footer />
    </div>
  );
}

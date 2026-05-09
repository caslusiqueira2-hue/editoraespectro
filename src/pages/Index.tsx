import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteBar from "@/components/QuoteBar";
import ArticleCard from "@/components/ArticleCard";
import OptimizedImage from "@/components/OptimizedImage";
import HeroCarousel from "@/components/HeroCarousel";
import MaisLidos from "@/components/MaisLidos";
import NewsletterBox from "@/components/NewsletterBox";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { usePosts } from "@/hooks/usePosts";
import { useTrackPageView } from "@/hooks/usePageTracking";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import capaBV from "@/assets/capa-boas-vindas.jpg";
import { useSiteSetting } from "@/hooks/useSiteSettings";

const Index = () => {
  const { data: posts, isLoading } = usePosts(true);
  const [visibleCount, setVisibleCount] = useState(6);
  useTrackPageView("/", "home");
  useDocumentTitle();
  const { data: heroVisible } = useSiteSetting("home_hero_visible");
  const { data: recentesVisible } = useSiteSetting("home_recentes_visible");
  const { data: maislidosVisible } = useSiteSetting("home_maislidos_visible");
  const { data: newsletterVisible } = useSiteSetting("home_newsletter_visible");
  const { data: quotebarVisible } = useSiteSetting("home_quotebar_visible");

  const heroPosts = posts?.slice(0, 5) || [];
  const recentPosts = (heroVisible !== false && heroPosts.length > 0) 
    ? posts?.slice(5) || []
    : posts || [];
  const displayedPosts = recentPosts.slice(0, visibleCount);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      {heroVisible !== false && (
        <HeroCarousel posts={posts || []} isLoading={isLoading} />
      )}

      {/* Articles Grid */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 sm:py-20">
          {recentesVisible !== false && (
            <div className="flex items-end justify-between mb-8 sm:mb-12">
              <AnimatedSection>
                <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                  Publicações<br />recentes
                </h2>
              </AnimatedSection>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
            {recentesVisible !== false && (
            <div className="flex-1">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-20">Carregando…</p>
              ) : (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {displayedPosts?.map((artigo, i) => (
                      <AnimatedSection key={artigo.id} delay={i * 0.08}>
                        <ArticleCard artigo={{
                          slug: artigo.slug,
                          titulo: artigo.titulo,
                          resumo: artigo.resumo,
                          categoria: artigo.categories?.nome || "",
                          imagem: artigo.imagem_url || capaBV,
                          autor: artigo.autor,
                        }} />
                      </AnimatedSection>
                    ))}
                  </div>

                  {recentPosts.length > visibleCount && (
                    <div className="flex justify-center mt-12">
                      <Button 
                        variant="outline" 
                        onClick={() => setVisibleCount(prev => prev + 6)}
                        className="rounded-full px-8 py-6 uppercase tracking-widest text-xs font-bold border-muted-foreground/30 hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        Ver mais antigos
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {!isLoading && posts?.length === 0 && (
                <p className="text-center text-muted-foreground py-20">
                  Nenhum artigo publicado ainda.
                </p>
              )}
            </div>
            )}

            {maislidosVisible !== false && (
            <aside className="lg:w-64 shrink-0 lg:border-l lg:border-border lg:pl-10">
              <div className="lg:sticky lg:top-24">
                <MaisLidos />
              </div>
            </aside>
            )}
          </div>
        </section>

        {newsletterVisible !== false && (
        <AnimatedSection>
          <section className="max-w-3xl mx-auto px-4 md:px-8 pb-12 sm:pb-20">
            <NewsletterBox />
          </section>
        </AnimatedSection>
        )}

        {quotebarVisible !== false && (
        <QuoteBar />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;

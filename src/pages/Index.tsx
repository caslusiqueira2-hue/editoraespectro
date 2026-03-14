import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteBar from "@/components/QuoteBar";
import ArticleCard from "@/components/ArticleCard";
import MaisLidos from "@/components/MaisLidos";
import NewsletterBox from "@/components/NewsletterBox";
import AnimatedSection from "@/components/AnimatedSection";
import { usePosts } from "@/hooks/usePosts";
import { useTrackPageView } from "@/hooks/usePageTracking";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import capaBV from "@/assets/capa-boas-vindas.jpg";

const Index = () => {
  const { data: posts, isLoading } = usePosts(true);
  useTrackPageView("/", "home");
  useDocumentTitle();
  const heroArticle = posts?.find((a) => a.destaque) || posts?.[0];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      {heroArticle && (
        <section className="relative min-h-[60vh] sm:min-h-[75vh] md:min-h-[85vh] overflow-hidden flex items-end sm:items-center">
          <img
            src={heroArticle.imagem_url || capaBV}
            alt={heroArticle.titulo}
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />

          <div className="relative z-10 w-full pb-10 sm:pb-0">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-7xl mx-auto px-4 md:px-8"
            >
              <span className="inline-block text-[10px] font-semibold uppercase tracking-[4px] text-accent mb-3 sm:mb-4 font-[family-name:var(--font-ui)]">
                {heroArticle.categories?.nome}
              </span>
              <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[0.95] max-w-3xl italic">
                {heroArticle.titulo}
              </h1>
              <p className="mt-4 sm:mt-6 text-muted-foreground text-sm sm:text-base max-w-lg leading-relaxed">
                {heroArticle.resumo}
              </p>
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to={`/artigo/${heroArticle.slug}`}
                  className="bg-accent text-accent-foreground px-6 sm:px-8 py-3 text-sm font-bold uppercase tracking-wider rounded-full hover:opacity-90 transition-opacity font-[family-name:var(--font-ui)]"
                >
                  Explorar
                </Link>
                <span className="text-xs text-muted-foreground tracking-widest font-[family-name:var(--font-ui)]">
                  por {heroArticle.autor}
                </span>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 sm:py-20">
          <div className="flex items-end justify-between mb-8 sm:mb-12">
            <AnimatedSection>
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                Publicações<br />recentes
              </h2>
            </AnimatedSection>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
            <div className="flex-1">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-20">Carregando…</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {posts?.map((artigo, i) => (
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
              )}

              {!isLoading && posts?.length === 0 && (
                <p className="text-center text-muted-foreground py-20">
                  Nenhum artigo publicado ainda.
                </p>
              )}
            </div>

            <aside className="lg:w-64 shrink-0 lg:border-l lg:border-border lg:pl-10">
              <div className="lg:sticky lg:top-24">
                <MaisLidos />
              </div>
            </aside>
          </div>
        </section>

        <AnimatedSection>
          <section className="max-w-3xl mx-auto px-4 md:px-8 pb-12 sm:pb-20">
            <NewsletterBox />
          </section>
        </AnimatedSection>

        <QuoteBar />
      </main>

      <Footer />
    </div>
  );
};

export default Index;

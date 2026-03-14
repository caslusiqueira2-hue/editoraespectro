import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteBar from "@/components/QuoteBar";
import ArticleCard from "@/components/ArticleCard";
import MaisLidos from "@/components/MaisLidos";
import NewsletterBox from "@/components/NewsletterBox";
import { usePosts } from "@/hooks/usePosts";
import { useTrackPageView } from "@/hooks/usePageTracking";
import capaBV from "@/assets/capa-boas-vindas.jpg";

const Index = () => {
  const { data: posts, isLoading } = usePosts(true);
  useTrackPageView("/", "home");
  const heroArticle = posts?.find((a) => a.destaque) || posts?.[0];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      {heroArticle && (
        <section className="relative min-h-[60vh] sm:min-h-[75vh] md:min-h-[85vh] overflow-hidden flex items-end sm:items-center">
          <img
            src={heroArticle.imagem_url || capaBV}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-105"
            aria-hidden="true"
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
              <span className="inline-block text-[10px] font-bold uppercase tracking-[4px] text-accent mb-3 sm:mb-4">
                {heroArticle.categories?.nome}
              </span>
              <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-foreground leading-[0.95] max-w-3xl uppercase">
                {heroArticle.titulo}
              </h1>
              <p className="mt-4 sm:mt-6 text-muted-foreground text-sm sm:text-base max-w-lg leading-relaxed">
                {heroArticle.resumo}
              </p>
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to={`/artigo/${heroArticle.slug}`}
                  className="bg-accent text-accent-foreground px-6 sm:px-8 py-3 text-sm font-bold uppercase tracking-wider rounded-full hover:opacity-90 transition-opacity"
                >
                  Explorar
                </Link>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">
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
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight"
            >
              Últimas<br />publicações
            </motion.h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
            {/* Articles grid */}
            <div className="flex-1">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-20">Carregando…</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {posts?.map((artigo, i) => (
                    <motion.div
                      key={artigo.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    >
                      <ArticleCard artigo={{
                        slug: artigo.slug,
                        titulo: artigo.titulo,
                        resumo: artigo.resumo,
                        categoria: artigo.categories?.nome || "",
                        imagem: artigo.imagem_url || capaBV,
                        autor: artigo.autor,
                      }} />
                    </motion.div>
                  ))}
                </div>
              )}

              {!isLoading && posts?.length === 0 && (
                <p className="text-center text-muted-foreground py-20">
                  Nenhum artigo publicado ainda.
                </p>
              )}
            </div>

            {/* Sidebar — Mais Lidos */}
            <aside className="lg:w-64 shrink-0 lg:border-l lg:border-border lg:pl-10">
              <div className="lg:sticky lg:top-24">
                <MaisLidos />
              </div>
            </aside>
          </div>
        </section>

        {/* Newsletter */}
        <section className="max-w-3xl mx-auto px-4 md:px-8 pb-12 sm:pb-20">
          <NewsletterBox />
        </section>

        <QuoteBar />
      </main>

      <Footer />
    </div>
  );
};

export default Index;

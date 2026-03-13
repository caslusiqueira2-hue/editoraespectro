import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteBar from "@/components/QuoteBar";
import ArticleCard from "@/components/ArticleCard";
import { usePosts } from "@/hooks/usePosts";
import capaBV from "@/assets/capa-boas-vindas.jpg";

const Index = () => {
  const { data: posts, isLoading } = usePosts(true);
  const heroArticle = posts?.find((a) => a.destaque) || posts?.[0];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      {heroArticle && (
        <section className="relative min-h-[85vh] overflow-hidden flex items-center">
          <img
            src={heroArticle.imagem_url || capaBV}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-105"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />

          <div className="relative z-10 w-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-7xl mx-auto px-4 md:px-8"
            >
              <span className="inline-block text-[10px] font-bold uppercase tracking-[4px] text-accent mb-4">
                {heroArticle.categories?.nome}
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground leading-[0.95] max-w-3xl uppercase">
                {heroArticle.titulo}
              </h1>
              <p className="mt-6 text-muted-foreground text-base max-w-lg leading-relaxed">
                {heroArticle.resumo}
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Link
                  to={`/artigo/${heroArticle.slug}`}
                  className="bg-accent text-accent-foreground px-8 py-3 text-sm font-bold uppercase tracking-wider rounded-full hover:opacity-90 transition-opacity"
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
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="flex items-end justify-between mb-12">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black uppercase leading-tight"
            >
              Últimas<br />publicações
            </motion.h2>
          </div>

          {isLoading ? (
            <p className="text-center text-muted-foreground py-20">Carregando…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </section>

        <QuoteBar />
      </main>

      <Footer />
    </div>
  );
};

export default Index;

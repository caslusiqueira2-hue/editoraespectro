import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteBar from "@/components/QuoteBar";
import ArticleCard from "@/components/ArticleCard";
import { ARTIGOS } from "@/data/artigos";
import capaBV from "@/assets/capa-boas-vindas.jpg";

const heroArticle = ARTIGOS.find((a) => a.destaque) || ARTIGOS[0];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[420px] overflow-hidden">
        <img
          src={heroArticle?.imagem || capaBV}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 h-full flex items-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-6xl mx-auto px-4 pb-12 w-full"
          >
            <span className="inline-block text-[10px] font-bold uppercase tracking-[3px] text-accent bg-accent/20 px-2 py-0.5 rounded-sm">
              {heroArticle?.categoria}
            </span>
            <h1 className="mt-3 text-3xl md:text-5xl font-black text-white leading-tight max-w-2xl">
              {heroArticle?.titulo}
            </h1>
            <p className="mt-2 text-white/70 text-sm">
              por {heroArticle?.autor}
            </p>
            <Link
              to={`/artigo/${heroArticle?.slug}`}
              className="inline-block mt-5 bg-white/10 backdrop-blur-sm text-white border border-white/30 px-6 py-2.5 text-sm font-semibold rounded-sm hover:bg-white/20 transition-colors"
            >
              Leia o Artigo
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Articles Grid */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-10">
            Últimas postagens
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {ARTIGOS.map((artigo) => (
              <ArticleCard key={artigo.id} artigo={artigo} />
            ))}
          </div>
          {ARTIGOS.length === 0 && (
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

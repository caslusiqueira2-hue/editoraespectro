import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import AnimatedSection from "@/components/AnimatedSection";
import { usePosts, useCategories } from "@/hooks/usePosts";
import { useTrackPageView } from "@/hooks/usePageTracking";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import capaBV from "@/assets/capa-boas-vindas.jpg";

const CategoriaPage = () => {
  const { slug } = useParams();
  const { data: categories } = useCategories();
  const { data: allPosts, isLoading } = usePosts(true);

  const categoria = categories?.find((c) => c.slug === slug);
  useTrackPageView(`/categoria/${slug}`, "category", categoria?.id);
  useDocumentTitle(categoria?.nome);
  const artigos = allPosts?.filter((a) => a.categories?.slug === slug) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="bg-secondary py-10 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <span className="text-[10px] font-bold uppercase tracking-[4px] text-accent block mb-3">categoria</span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground font-[family-name:var(--font-display)]">
            {categoria?.nome || "Categoria"}
          </h1>
          <p className="text-muted-foreground text-sm mt-3 uppercase tracking-wider">
            {artigos.length} {artigos.length === 1 ? "texto" : "textos"}
          </p>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 md:px-8 mt-6 text-xs text-muted-foreground uppercase tracking-wider" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-accent transition-colors">Início</Link>
        <span className="mx-2">›</span>
        <span className="text-foreground">{categoria?.nome}</span>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-8 sm:py-12">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-20">Carregando…</p>
        ) : artigos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {artigos.map((a, i) => (
              <AnimatedSection key={a.id} delay={i * 0.06}>
                <ArticleCard artigo={{
                  slug: a.slug,
                  titulo: a.titulo,
                  resumo: a.resumo,
                  categoria: a.categories?.nome || "",
                  imagem: a.imagem_url || capaBV,
                  autor: a.autor,
                }} />
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-6">Nenhum texto encontrado nesta categoria ainda.</p>
            <Link to="/" className="bg-accent text-accent-foreground px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider">← Voltar ao início</Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CategoriaPage;

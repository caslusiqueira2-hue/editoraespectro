import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import { ARTIGOS, CATEGORIAS } from "@/data/artigos";

const CategoriaPage = () => {
  const { slug } = useParams();
  const categoria = CATEGORIAS.find((c) => c.slug === slug);
  const artigos = ARTIGOS.filter((a) => a.categoriaSlug === slug);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Banner */}
      <div className="bg-primary py-12 border-b-4 border-accent">
        <div className="max-w-6xl mx-auto px-4">
          <span className="text-[10px] font-bold uppercase tracking-[3px] text-accent block">
            categoria
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-primary-foreground font-[family-name:var(--font-display)] mt-2">
            {categoria?.nome || "Categoria"}
          </h1>
          <p className="text-primary-foreground/60 text-sm mt-2">
            {artigos.length} {artigos.length === 1 ? "texto" : "textos"}
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 mt-4 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-accent transition-colors">Início</Link>
        <span className="mx-1">›</span>
        <span className="text-foreground">{categoria?.nome}</span>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-12">
        {artigos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {artigos.map((a) => (
              <ArticleCard key={a.id} artigo={a} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">Nenhum texto encontrado nesta categoria ainda.</p>
            <Link to="/" className="bg-accent text-accent-foreground px-4 py-2 rounded-sm text-sm font-semibold">
              ← Voltar ao início
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CategoriaPage;

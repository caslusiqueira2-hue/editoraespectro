import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteBar from "@/components/QuoteBar";
import AnimatedSection from "@/components/AnimatedSection";
import { useAllMagazineArticlesBySection } from "@/hooks/useMagazine";
import type { MagazineArticle } from "@/hooks/useMagazine";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const SECTION_LABELS: Record<string, string> = {
  conto: "Contos",
  poesia: "Poesia",
  ensaio: "Ensaios",
  resenha: "Resenhas",
};

const toRoman = (n: number) => {
  const numerals = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ] as const;
  let result = "";
  let num = n;
  for (const [value, symbol] of numerals) {
    while (num >= value) { result += symbol; num -= value; }
  }
  return result;
};

const RevistaSecaoPage = () => {
  const { secao } = useParams();
  const { data: articles, isLoading } = useAllMagazineArticlesBySection(secao || "");
  const label = SECTION_LABELS[secao || ""] || secao;
  useDocumentTitle(label ? `${label} — Revista Espectro` : undefined);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <section className="max-w-4xl mx-auto px-4 md:px-8 py-12 sm:py-20">
        <nav className="mb-4 text-xs text-muted-foreground uppercase tracking-wider" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-accent transition-colors">Início</Link>
          <span className="mx-2">›</span>
          <Link to="/revista" className="hover:text-accent transition-colors">Revista</Link>
          <span className="mx-2">›</span>
          <span className="text-foreground">{label}</span>
        </nav>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-bold italic text-foreground mb-10"
        >
          {label}
        </motion.h1>

        {isLoading ? (
          <p className="text-muted-foreground">Carregando…</p>
        ) : articles?.length === 0 ? (
          <p className="text-muted-foreground font-[family-name:var(--font-body)] italic">
            Nenhum texto publicado nesta seção.
          </p>
        ) : (
          <div className="space-y-4">
            {articles?.map((art: MagazineArticle, i: number) => {
              const vol = art.magazine_volumes;
              return (
                <AnimatedSection key={art.id} delay={i * 0.06}>
                  <Link
                    to={`/revista/${vol?.slug}/${art.slug}`}
                    className="group block p-5 border border-border rounded-xl hover:border-accent/30 transition-colors bg-card"
                  >
                    <div className="flex items-start gap-4">
                      {art.imagem_url && (
                        <img src={art.imagem_url} alt="" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg shrink-0" loading="lazy" />
                      )}
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-[3px] text-accent font-[family-name:var(--font-ui)]">
                          {vol ? `Volume ${toRoman(vol.numero)} — ${vol.titulo}` : ""}
                        </span>
                        <h3 className="mt-1 font-[family-name:var(--font-display)] text-base sm:text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                          {art.titulo}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">por {art.autor}</p>
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        )}
      </section>

      <QuoteBar />
      <Footer />
    </div>
  );
};

export default RevistaSecaoPage;

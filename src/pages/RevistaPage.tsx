import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteBar from "@/components/QuoteBar";
import { useVolumes } from "@/hooks/useMagazine";
import { useTrackPageView } from "@/hooks/usePageTracking";

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

const RevistaPage = () => {
  const { data: volumes, isLoading } = useVolumes(true);
  useTrackPageView("/revista", "revista");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[6px] text-accent font-[family-name:var(--font-ui)]">
              Revista
            </span>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-6xl md:text-7xl font-bold italic leading-[0.95] text-foreground">
              Revista Espectro
            </h1>
            <p className="mt-6 text-muted-foreground text-sm sm:text-base max-w-md mx-auto font-[family-name:var(--font-body)] italic">
              Literatura, pensamento e ecos do invisível.
            </p>
          </motion.div>
        </div>
      </section>


      {/* Volumes grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-12 sm:py-16">
        <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold mb-10 text-center">
          Volumes
        </h2>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-20">Carregando…</p>
        ) : volumes?.length === 0 ? (
          <p className="text-center text-muted-foreground py-20 font-[family-name:var(--font-body)] italic">
            Nenhum volume publicado ainda.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {volumes?.map((vol, i) => (
              <motion.div
                key={vol.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link
                  to={`/revista/${vol.slug}`}
                  className="group block bg-card border border-border rounded-xl overflow-hidden hover:border-accent/30 transition-all duration-300"
                >
                  {vol.capa_url ? (
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={vol.capa_url}
                        alt={vol.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] bg-secondary flex items-center justify-center">
                      <span className="font-[family-name:var(--font-display)] text-6xl font-bold text-muted-foreground/20 italic">
                        {toRoman(vol.numero)}
                      </span>
                    </div>
                  )}
                  <div className="p-5">
                    <span className="text-[10px] font-bold uppercase tracking-[3px] text-accent font-[family-name:var(--font-ui)]">
                      Volume {toRoman(vol.numero)}
                    </span>
                    <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                      {vol.titulo}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground font-[family-name:var(--font-ui)]">
                      {vol.ano}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <QuoteBar />
      <Footer />
    </div>
  );
};

export default RevistaPage;

import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-7xl sm:text-9xl font-black font-[family-name:var(--font-display)] text-accent">404</h1>
          <p className="mt-4 text-lg sm:text-xl text-muted-foreground">Página não encontrada</p>
          <Link to="/" className="mt-6 inline-block bg-accent text-accent-foreground px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">
            ← Voltar ao início
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;

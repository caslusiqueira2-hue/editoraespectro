import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, Menu } from "lucide-react";
import { usePosts, useCategories } from "@/hooks/usePosts";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import logoEspectro from "@/assets/logo-espectro.png";

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { data: posts } = usePosts(true);
  const { data: categories } = useCategories();
  const { data: envioVisible } = useSiteSetting("envio_page_visible");

  const navCategories = categories?.filter(c => c.slug !== "") || [];

  const results = searchQuery.length > 1
    ? (posts || []).filter(
        (a) =>
          a.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.resumo.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-background/98 backdrop-blur-xl flex flex-col items-center pt-16 sm:pt-24 px-4">
          <button
            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fechar busca"
          >
            <X size={28} />
          </button>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar artigos…"
            autoFocus
            className="w-full max-w-xl text-xl sm:text-3xl bg-transparent border-b-2 border-accent pb-4 outline-none font-[family-name:var(--font-display)] placeholder:text-muted-foreground text-foreground"
          />
          <div className="w-full max-w-xl mt-6 sm:mt-8 space-y-2 overflow-y-auto flex-1 pb-8">
            {results.map((a) => (
              <button
                key={a.id}
                onClick={() => { navigate(`/artigo/${a.slug}`); setSearchOpen(false); setSearchQuery(""); }}
                className="block w-full text-left p-4 sm:p-5 rounded-lg hover:bg-secondary transition-colors"
              >
                <span className="text-[10px] font-bold uppercase tracking-[3px] text-accent">{a.categories?.nome}</span>
                <h3 className="font-[family-name:var(--font-display)] text-base sm:text-lg font-bold mt-1 text-foreground">{a.titulo}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.resumo}</p>
              </button>
            ))}
            {searchQuery.length > 1 && results.length === 0 && (
              <p className="text-muted-foreground text-center py-8">Nenhum resultado encontrado.</p>
            )}
          </div>
        </div>
      )}

      <header className="bg-background/80 backdrop-blur-md sticky top-0 z-40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 z-10">
              <img src={logoEspectro} alt="Espectro" className="h-10 sm:h-12 w-auto" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/categoria/${cat.slug}`}
                  className="px-3 py-1.5 text-xs font-semibold uppercase tracking-[2px] text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap font-[family-name:var(--font-ui)]"
                >
                  {cat.nome}
                </Link>
              ))}
            </nav>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3 z-10">
              <button onClick={() => setSearchOpen(true)} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Buscar">
                <Search size={18} />
              </button>
              {envioVisible !== false && (
                <Link to="/envio" className="bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap">
                  Enviar texto
                </Link>
              )}
            </div>

            {/* Mobile actions */}
            <div className="flex md:hidden items-center gap-1 z-10">
              <button onClick={() => setSearchOpen(true)} className="p-2 text-foreground" aria-label="Buscar">
                <Search size={20} />
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-foreground" aria-label="Menu">
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background p-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors">
              Início
            </Link>
            {navCategories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/categoria/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors"
              >
                {cat.nome}
              </Link>
            ))}
            {envioVisible !== false && (
              <Link to="/envio" onClick={() => setMenuOpen(false)}
                className="block mt-4 bg-accent text-accent-foreground text-sm font-bold px-4 py-3 rounded-full text-center uppercase tracking-wider">
                Enviar texto
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
};

export default Header;

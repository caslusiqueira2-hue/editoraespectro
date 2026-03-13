import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, Menu } from "lucide-react";
import { CATEGORIAS, ARTIGOS } from "@/data/artigos";

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const results = searchQuery.length > 1
    ? ARTIGOS.filter(
        (a) =>
          a.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.resumo.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center pt-20 px-4">
          <button
            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
            className="absolute top-6 right-6 text-foreground/60 hover:text-foreground"
            aria-label="Fechar busca"
          >
            <X size={24} />
          </button>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar artigos…"
            autoFocus
            className="w-full max-w-xl text-2xl bg-transparent border-b-2 border-accent pb-3 outline-none font-[family-name:var(--font-display)] placeholder:text-muted-foreground"
          />
          <div className="w-full max-w-xl mt-6 space-y-4">
            {results.map((a) => (
              <button
                key={a.id}
                onClick={() => { navigate(`/artigo/${a.slug}`); setSearchOpen(false); setSearchQuery(""); }}
                className="block w-full text-left p-4 rounded-sm hover:bg-muted transition-colors"
              >
                <span className="text-xs font-semibold uppercase tracking-widest text-accent">{a.categoria}</span>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-bold mt-1">{a.titulo}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.resumo}</p>
              </button>
            ))}
            {searchQuery.length > 1 && results.length === 0 && (
              <p className="text-muted-foreground text-center">Nenhum resultado encontrado.</p>
            )}
          </div>
        </div>
      )}

      <header className="border-b border-border bg-background sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-[3px] text-muted-foreground leading-none">
                  revista
                </span>
                <span className="block text-2xl font-black font-[family-name:var(--font-display)] leading-none tracking-tight text-foreground">
                  subverso
                </span>
              </div>
            </Link>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-sm px-3 py-1.5 transition-colors"
              >
                <Search size={14} />
                <span>Buscar…</span>
              </button>
              <Link
                to="/envio"
                className="bg-accent text-accent-foreground text-sm font-semibold px-4 py-2 rounded-sm hover:opacity-90 transition-opacity"
              >
                Envio de originais
              </Link>
            </div>

            {/* Mobile actions */}
            <div className="flex md:hidden items-center gap-2">
              <button onClick={() => setSearchOpen(true)} className="p-2 text-foreground" aria-label="Buscar">
                <Search size={20} />
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-foreground" aria-label="Menu">
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Nav */}
        <nav className="bg-primary text-primary-foreground overflow-x-auto">
          <div className="max-w-6xl mx-auto px-4">
            <ul className="flex items-center gap-0 text-sm">
              {CATEGORIAS.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={cat.slug === "" ? "/" : cat.slug === "envio" ? "/envio" : `/categoria/${cat.slug}`}
                    className="block px-4 py-3 whitespace-nowrap hover:bg-accent/20 transition-colors font-medium tracking-wide"
                  >
                    {cat.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background p-4 space-y-2">
            {CATEGORIAS.map((cat) => (
              <Link
                key={cat.slug}
                to={cat.slug === "" ? "/" : cat.slug === "envio" ? "/envio" : `/categoria/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                {cat.nome}
              </Link>
            ))}
            <Link
              to="/envio"
              onClick={() => setMenuOpen(false)}
              className="block mt-2 bg-accent text-accent-foreground text-sm font-semibold px-4 py-2 rounded-sm text-center"
            >
              Envio de originais
            </Link>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;

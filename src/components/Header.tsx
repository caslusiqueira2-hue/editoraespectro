import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, Moon, Search, Sun, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { usePublishedMagazineArticles } from "@/hooks/useMagazine";
import { useCategories, usePosts } from "@/hooks/usePosts";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { useTheme } from "@/hooks/useTheme";
import { ARTIGOS } from "@/data/artigos";
import { MAGAZINE_SECTIONS, plainText, searchTerms } from "@/lib/editorial";

const manifesto = ARTIGOS[0];

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchButton = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  const { data: categories } = useCategories();
  const { data: envioVisible } = useSiteSetting("envio_page_visible");
  const { data: navVisible } = useSiteSetting("home_nav_visible");
  const { theme, toggleTheme } = useTheme();

  const normalizedQuery = searchTerms(query);
  const terms = normalizedQuery.split(/\s+/);
  const canSearch = searchOpen && normalizedQuery.length > 1;
  const site = usePosts(true, canSearch);
  const magazine = usePublishedMagazineArticles(undefined, canSearch);
  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setQuery("");
  }, [pathname]);

  const matches = (fields: (string | null | undefined)[]) => {
    const text = searchTerms(fields.filter(Boolean).join(" "));
    return terms.every((term) => text.includes(term));
  };

  const results = canSearch ? [
    ...(site.data ?? []).filter((post) => matches([
      post.titulo, post.autor, post.resumo, post.categories?.nome,
      plainText(typeof post.conteudo === "string" ? post.conteudo : Array.isArray(post.conteudo) ? post.conteudo.join(" ") : ""),
    ])).map((post) => ({
      to: `/artigo/${post.slug}`, title: post.titulo, detail: post.categories?.nome || "Editora Espectro", author: post.autor,
    })),
    ...(site.data?.some((post) => post.slug === manifesto.slug) || !matches([
      manifesto.titulo, manifesto.autor, manifesto.resumo, "Manifesto", manifesto.conteudo?.join(" "),
    ]) ? [] : [{
      to: `/artigo/${manifesto.slug}`, title: manifesto.titulo, detail: "Manifesto", author: manifesto.autor,
    }]),
    ...(magazine.data ?? []).flatMap((article) => {
      const volume = article.magazine_volumes;
      const section = MAGAZINE_SECTIONS[article.secao as keyof typeof MAGAZINE_SECTIONS] || article.secao;
      return volume && matches([article.titulo, article.autor, article.secao, section, volume.titulo, "Revista", plainText(article.conteudo)])
        ? [{ to: `/revista/${volume.slug}/${article.slug}`, title: article.titulo, detail: `Revista · ${section}`, author: article.autor }]
        : [];
    }),
  ] : [];

  return (
    <>
      <header className="editorial-header relative z-40 border-b border-border bg-background">
        <div className="editorial-wrap flex min-h-16 items-center justify-between gap-2 py-2">
          <Link to="/" aria-label="Espectro, início" className="text-2xl font-semibold tracking-tight [font-family:var(--font-display)] sm:text-3xl">
            Espectro<span className="text-accent">.</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-3">
            <NavLink to="/revista" className="editorial-nav-link px-2 sm:px-3">Revista</NavLink>
            {envioVisible !== false && (
              <NavLink to="/envio" className="editorial-nav-link hidden items-center gap-1 border-l border-border pl-4 pr-2 sm:inline-flex">
                Enviar originais <ArrowUpRight aria-hidden="true" size={14} />
              </NavLink>
            )}
            <button ref={searchButton} type="button" className="editorial-icon" aria-label="Buscar" aria-haspopup="dialog" onClick={() => setSearchOpen(true)}>
              <Search size={19} aria-hidden="true" />
            </button>
            <button type="button" className="editorial-icon" aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"} onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
            </button>
            <button type="button" className="editorial-icon lg:hidden" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="editorial-nav" onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
            </button>
          </div>
        </div>
        <div id="editorial-nav" className={`${menuOpen ? "block" : "hidden"} ${navVisible !== false ? "lg:block" : ""} border-t border-border`}>
          <nav aria-label="Editorias" className="editorial-wrap flex flex-wrap gap-x-6 gap-y-1 py-2 lg:items-center">
            <NavLink to="/" end className="editorial-nav-link py-2" onClick={() => setMenuOpen(false)}>Início</NavLink>
            {navVisible !== false && categories?.filter((category) => category.slug).map((category) => (
              <NavLink key={category.id} to={`/categoria/${category.slug}`} className="editorial-nav-link py-2" onClick={() => setMenuOpen(false)}>
                {category.nome}
              </NavLink>
            ))}
            <NavLink to={`/artigo/${manifesto.slug}`} className="editorial-nav-link py-2" onClick={() => setMenuOpen(false)}>Manifesto</NavLink>
            {envioVisible !== false && (
              <NavLink to="/envio" className="editorial-nav-link py-2 sm:hidden" onClick={() => setMenuOpen(false)}>Enviar originais</NavLink>
            )}
          </nav>
        </div>
      </header>

      <Dialog open={searchOpen} onOpenChange={(open) => open ? setSearchOpen(true) : closeSearch()}>
        <DialogContent
          className="w-[calc(100%_-_2rem)] max-w-2xl gap-3 p-5 sm:p-8"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            searchButton.current?.focus();
          }}
        >
          <DialogTitle className="text-3xl font-normal">Buscar na Espectro</DialogTitle>
          <DialogDescription>Textos da editora e da revista por título, autoria ou assunto.</DialogDescription>
          <input
            type="search"
            aria-label="Buscar textos"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Digite pelo menos dois caracteres"
            className="min-w-0 border-b border-accent bg-transparent py-3 text-lg" autoFocus
          />
          {canSearch && (
            <div className="max-h-[50dvh] overflow-y-auto" aria-live="polite">
              {(site.isLoading || magazine.isLoading) && <p className="py-4 text-muted-foreground">Buscando textos…</p>}
              {(site.isError || magazine.isError) && <p className="py-4 text-muted-foreground">Parte do acervo está indisponível no momento.</p>}
              {site.isSuccess && magazine.isSuccess && results.length === 0 && <p className="py-4 text-muted-foreground">Nenhum texto encontrado.</p>}
              <ul className="divide-y divide-border">
                {results.map((result) => (
                  <li key={result.to}>
                    <Link to={result.to} onClick={closeSearch} className="block px-1 py-3 hover:text-accent">
                      <span className="editorial-label block">{result.detail}</span>
                      <span className="mt-1 block text-2xl leading-tight [font-family:var(--font-display)]">{result.title}</span>
                      <span className="text-sm text-muted-foreground">{result.author}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

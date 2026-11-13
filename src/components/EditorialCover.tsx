import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import OptimizedImage from "./OptimizedImage";
import type { Post } from "@/hooks/usePosts";
import { ARTIGOS } from "@/data/artigos";
import capaBoasVindas from "@/assets/capa-boas-vindas.jpg";

interface EditorialCoverProps {
  featured?: Post;
  companionPosts: Post[];
  issue?: { slug: string; titulo: string };
}

export default function EditorialCover({ featured, companionPosts, issue }: EditorialCoverProps) {
  const manifesto = ARTIGOS[0];
  const lead = featured ?? {
    slug: manifesto.slug,
    titulo: manifesto.titulo,
    resumo: manifesto.resumo,
    autor: manifesto.autor,
    categories: { nome: "Manifesto" },
    imagem_url: manifesto.imagem,
  };

  return (
    <section aria-labelledby="espectro-title" className="editorial-wrap">
      <div className="editorial-masthead">
        <p className="editorial-label">Editora independente</p>
        <h1 id="espectro-title">Espectro</h1>
        <p>Literatura, pensamento e ecos do invisível.</p>
      </div>
      <div className="grid gap-7 border-y border-foreground py-5 sm:py-7 lg:grid-cols-[minmax(0,1fr)_15rem] xl:grid-cols-[minmax(0,1fr)_17rem]">
        <article className="grid items-center gap-5 sm:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] sm:gap-7">
          <Link to={`/artigo/${lead.slug}`} tabIndex={-1} aria-hidden="true" className="group block">
            <OptimizedImage
              src={lead.imagem_url || capaBoasVindas}
              alt=""
              aspectRatio="4/3"
              priority
              className="motion-safe:transition-transform motion-safe:duration-700 group-hover:scale-[1.035]"
            />
          </Link>
          <div className="min-w-0 pb-2">
            <p className="editorial-label">{lead.categories?.nome || "Em destaque"}</p>
            <h2 className="editorial-headline mt-3">
              <Link to={`/artigo/${lead.slug}`} className="hover:text-accent">{lead.titulo}</Link>
            </h2>
            {lead.resumo && <p className="mt-4 line-clamp-4 text-xl leading-snug text-muted-foreground">{lead.resumo}</p>}
            <p className="editorial-byline mt-5">{lead.autor}</p>
            <Link to={`/artigo/${lead.slug}`} className="editorial-link mt-5">
              Ler texto <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </article>
        <aside className="border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-1">
          <h2 className="editorial-label">Revista Espectro</h2>
          <Link to={issue ? `/revista/${issue.slug}` : "/revista"} className="group mt-3 flex items-start justify-between gap-3 text-2xl leading-tight hover:text-accent [font-family:var(--font-display)]">
            <span>{issue?.titulo || "Conheça a revista"}</span>
            <ArrowUpRight size={18} aria-hidden="true" className="mt-1 shrink-0 text-accent" />
          </Link>
          {companionPosts.length > 0 && (
            <ul className="mt-5 divide-y divide-border border-y border-border">
              {companionPosts.map((post) => (
                <li key={post.id}>
                  <Link to={`/artigo/${post.slug}`} className="block py-3 hover:text-accent">
                    <span className="editorial-byline block">{post.categories?.nome}</span>
                    <span className="mt-1 block text-xl leading-tight [font-family:var(--font-display)]">{post.titulo}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {lead.slug !== manifesto.slug && (
            <Link to={`/artigo/${manifesto.slug}`} className="editorial-link mt-5">
              Manifesto <ArrowRight size={15} aria-hidden="true" />
            </Link>
          )}
        </aside>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import OptimizedImage from "./OptimizedImage";

interface ArticleCardProps {
  artigo: {
    slug: string;
    titulo: string;
    resumo: string | null;
    categoria: string;
    imagem: string | null;
    autor: string;
  };
}

export default function ArticleCard({ artigo }: ArticleCardProps) {
  return (
    <article className="border-t border-border pt-4">
      <Link to={`/artigo/${artigo.slug}`} className="group block">
        {artigo.imagem && (
          <OptimizedImage
            src={artigo.imagem}
            alt=""
            aspectRatio="4/3"
            className="motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
          />
        )}
        {artigo.categoria && <p className="editorial-label mt-4">{artigo.categoria}</p>}
        <h3 className="mt-2 flex items-start justify-between gap-3 text-2xl leading-tight [overflow-wrap:anywhere] group-hover:text-accent sm:text-3xl">
          {artigo.titulo}
          <ArrowUpRight aria-hidden="true" className="mt-1 shrink-0 text-accent" size={18} />
        </h3>
        {artigo.resumo && (
          <p className="mt-2 line-clamp-3 text-lg leading-snug text-muted-foreground">{artigo.resumo}</p>
        )}
        <p className="editorial-byline mt-4">{artigo.autor}</p>
      </Link>
    </article>
  );
}

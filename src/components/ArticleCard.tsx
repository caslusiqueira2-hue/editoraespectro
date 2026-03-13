import { Link } from "react-router-dom";
import { type Artigo } from "@/data/artigos";

const ArticleCard = ({ artigo }: { artigo: Artigo }) => (
  <article className="group">
    <Link to={`/artigo/${artigo.slug}`} className="block">
      <div className="aspect-[4/3] overflow-hidden rounded-sm bg-muted">
        <img
          src={artigo.imagem}
          alt={artigo.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="mt-3">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[2px] text-accent bg-accent/10 px-2 py-0.5 rounded-sm">
          {artigo.categoria}
        </span>
        <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg font-bold leading-snug group-hover:text-accent transition-colors">
          {artigo.titulo}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {artigo.resumo}
        </p>
        <span className="inline-block mt-2 text-xs font-semibold uppercase tracking-widest text-accent">
          Leia mais →
        </span>
        <div className="mt-2 text-xs text-muted-foreground">
          {artigo.autor} · {artigo.data}
        </div>
      </div>
    </Link>
  </article>
);

export default ArticleCard;

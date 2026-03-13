import { Link } from "react-router-dom";
import { type Artigo } from "@/data/artigos";

const ArticleCard = ({ artigo }: { artigo: Artigo }) => (
  <article className="group">
    <Link to={`/artigo/${artigo.slug}`} className="block">
      <div className="aspect-[3/4] overflow-hidden rounded-xl bg-secondary relative">
        <img
          src={artigo.imagem}
          alt={artigo.titulo}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="inline-block text-[9px] font-bold uppercase tracking-[2px] text-accent mb-2">
            {artigo.categoria}
          </span>
          <h3 className="font-[family-name:var(--font-display)] text-sm font-bold leading-snug text-foreground uppercase">
            {artigo.titulo}
          </h3>
          <div className="mt-2 text-[10px] text-muted-foreground uppercase tracking-wider">
            {artigo.autor}
          </div>
        </div>
      </div>
    </Link>
  </article>
);

export default ArticleCard;

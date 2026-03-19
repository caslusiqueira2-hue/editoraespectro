import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, BookOpen } from "lucide-react";
import { useMostRead } from "@/hooks/useMostRead";

export default function MaisLidos() {
  const { data: posts, isLoading } = useMostRead(5);

  if (isLoading || !posts || posts.length === 0) return null;

  // Group by category for editorial feel
  const byCategory: Record<string, typeof posts> = {};
  posts.forEach((p) => {
    const cat = p.categoria || "Geral";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
  });

  const categories = Object.keys(byCategory);
  const hasMultipleCategories = categories.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Flame size={16} className="text-accent" />
        <h3 className="text-[10px] font-bold uppercase tracking-[4px] text-accent">
          Mais Lidos
        </h3>
      </div>

      {hasMultipleCategories ? (
        /* Grouped by category */
        categories.map((cat) => (
          <div key={cat} className="space-y-2.5">
            <div className="flex items-center gap-1.5">
              <BookOpen size={12} className="text-muted-foreground" />
              <span className="text-[9px] font-bold uppercase tracking-[3px] text-muted-foreground">
                {cat}
              </span>
            </div>
            <ol className="space-y-2">
              {byCategory[cat].map((post, i) => (
                <MaisLidosItem key={post.id} post={post} index={i} />
              ))}
            </ol>
          </div>
        ))
      ) : (
        /* Simple list */
        <ol className="space-y-2">
          {posts.map((post, i) => (
            <MaisLidosItem key={post.id} post={post} index={i} />
          ))}
        </ol>
      )}
    </motion.div>
  );
}

function MaisLidosItem({
  post,
  index,
}: {
  post: { slug: string; titulo: string; views: number };
  index: number;
}) {
  return (
    <li className="group">
      <Link
        to={`/artigo/${post.slug}`}
        className="flex items-start gap-2.5 py-1 transition-colors"
      >
        <span className="text-accent font-black text-sm leading-5 shrink-0 min-w-[1.5rem] text-right">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <span className="text-sm text-foreground font-medium leading-5 group-hover:text-accent transition-colors line-clamp-2">
            {post.titulo}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-0.5">
            {post.views.toLocaleString("pt-BR")} {post.views === 1 ? "leitura" : "leituras"}
          </span>
        </div>
      </Link>
    </li>
  );
}

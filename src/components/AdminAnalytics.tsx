import { useAnalytics } from "@/hooks/useAnalytics";
import { BarChart3, Users, Eye, TrendingUp } from "lucide-react";

export default function AdminAnalytics() {
  const { data, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="text-muted-foreground text-sm py-8 text-center">Carregando analytics…</div>
    );
  }

  if (!data) return null;

  const topPost = data.postViews[0];
  const topCategory = data.categoryViews[0];

  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-black uppercase flex items-center gap-2">
        <BarChart3 size={20} className="text-accent" />
        Analytics
      </h2>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={<Eye size={18} />} label="Total de visitas" value={data.totalViews} />
        <StatCard icon={<Users size={18} />} label="Visitantes únicos" value={data.uniqueVisitors} />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Post mais lido"
          value={topPost ? topPost.titulo : "—"}
          sub={topPost ? `${topPost.views.toLocaleString("pt-BR")} views` : undefined}
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Categoria mais vista"
          value={topCategory ? topCategory.nome : "—"}
          sub={topCategory ? `${topCategory.views.toLocaleString("pt-BR")} views` : undefined}
        />
      </div>

      {/* Most visited pages */}
      {data.mostVisitedPages.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <h3 className="text-xs font-bold uppercase tracking-[3px] text-muted-foreground mb-4">Páginas mais visitadas</h3>
          <div className="space-y-2">
            {data.mostVisitedPages.map((page, i) => (
              <div key={page.page_path} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                  <span className="text-sm text-foreground truncate">{page.page_path}</span>
                </div>
                <span className="text-xs font-bold text-accent shrink-0">{page.views.toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post views breakdown */}
      {data.postViews.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <h3 className="text-xs font-bold uppercase tracking-[3px] text-muted-foreground mb-4">Views por post</h3>
          <div className="space-y-2">
            {data.postViews.map((post, i) => (
              <div key={post.content_id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                  <span className="text-sm text-foreground truncate">{post.titulo}</span>
                </div>
                <span className="text-xs font-bold text-accent shrink-0">{post.views.toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[2px]">{label}</span>
      </div>
      <p className="text-lg sm:text-xl font-black text-foreground truncate">
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
      </p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

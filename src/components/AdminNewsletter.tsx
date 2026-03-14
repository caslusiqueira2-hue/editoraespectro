import { useState } from "react";
import { useSubscribers } from "@/hooks/useNewsletter";
import { Mail, Download, Users } from "lucide-react";

export default function AdminNewsletter() {
  const { data: subscribers, isLoading } = useSubscribers();
  const [showAll, setShowAll] = useState(false);

  const active = subscribers?.filter((s) => s.status === "active") || [];
  const unsubscribed = subscribers?.filter((s) => s.status === "unsubscribed") || [];
  const displayed = showAll ? subscribers : subscribers?.slice(0, 10);

  const exportCSV = () => {
    if (!subscribers) return;
    const header = "email,status,subscribed_at,unsubscribed_at";
    const rows = subscribers.map(
      (s) => `${s.email},${s.status},${s.subscribed_at},${s.unsubscribed_at || ""}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `frequencia-espectro-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <p className="text-muted-foreground text-sm">Carregando…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Mail size={16} className="text-accent" />
        <h3 className="text-[10px] font-bold uppercase tracking-[4px] text-accent">
          Frequência Espectro — Newsletter
        </h3>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Users size={16} className="mx-auto text-accent mb-1" />
          <p className="text-2xl font-black text-foreground">{active.length}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ativos</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-foreground">{unsubscribed.length}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Desinscritos</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center col-span-2 sm:col-span-1">
          <p className="text-2xl font-black text-foreground">{subscribers?.length || 0}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
        </div>
      </div>

      {/* Export */}
      <button
        onClick={exportCSV}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent hover:underline"
      >
        <Download size={14} /> Exportar CSV
      </button>

      {/* Subscriber list */}
      {displayed && displayed.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">E-mail</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Status</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Data</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 text-foreground truncate max-w-[200px]">{s.email}</td>
                  <td className="px-4 py-2.5 hidden sm:table-cell">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${s.status === "active" ? "text-accent" : "text-muted-foreground"}`}>
                      {s.status === "active" ? "Ativo" : "Desinscrito"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs hidden md:table-cell">
                    {new Date(s.subscribed_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subscribers && subscribers.length > 10 && !showAll && (
        <button onClick={() => setShowAll(true)} className="text-xs text-accent hover:underline">
          Ver todos ({subscribers.length})
        </button>
      )}

      {(!subscribers || subscribers.length === 0) && (
        <p className="text-muted-foreground text-sm text-center py-4">Nenhum inscrito ainda.</p>
      )}
    </div>
  );
}

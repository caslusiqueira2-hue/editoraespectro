import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, UserPlus, Shield, ShieldCheck } from "lucide-react";

export default function AdminUsersManagement() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("role", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar administradores");
    } else {
      setAdmins(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setIsAdding(true);

    const { error } = await supabase
      .from("user_roles")
      .insert([{ email: newEmail.toLowerCase(), role: "admin" }]);

    if (error) {
      if (error.code === "23505") {
        toast.error("Este e-mail já é um administrador");
      } else {
        toast.error("Erro ao adicionar administrador");
      }
    } else {
      toast.success("Administrador adicionado com sucesso");
      setNewEmail("");
      fetchAdmins();
    }
    setIsAdding(false);
  };

  const handleDeleteAdmin = async (id: string, email: string) => {
    if (!confirm(`Tem certeza que deseja remover ${email} como administrador?`)) return;

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao remover administrador");
    } else {
      toast.success("Administrador removido");
      fetchAdmins();
    }
  };

  if (loading) return <p className="text-muted-foreground">Carregando administradores...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-black uppercase">Gerenciar Administradores</h2>
      </div>

      <form onSubmit={handleAddAdmin} className="flex gap-2 max-w-md">
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="E-mail do novo admin"
          className="flex-1 bg-secondary text-foreground px-4 py-2 rounded-lg border border-border outline-none focus:ring-2 focus:ring-accent text-sm"
          required
        />
        <button
          type="submit"
          disabled={isAdding}
          className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <UserPlus size={16} />
          {isAdding ? "Adicionando..." : "Adicionar"}
        </button>
      </form>

      <div className="space-y-3">
        {admins.map((admin) => (
          <div key={admin.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${admin.role === "main_admin" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                {admin.role === "main_admin" ? <ShieldCheck size={20} /> : <Shield size={20} />}
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">{admin.email}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {admin.role === "main_admin" ? "Admin Principal" : "Administrador"}
                </p>
              </div>
            </div>
            {admin.role !== "main_admin" && (
              <button
                onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                className="p-2 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
                title="Remover acesso"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

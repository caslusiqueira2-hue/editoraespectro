import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type UserRole = "main_admin" | "admin" | null;

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await (supabase as any).rpc("get_current_admin_role");

        if (error) throw error;

        setRole(data === "main_admin" || data === "admin" ? data : null);
      } catch (err) {
        console.error("Unexpected error fetching role:", err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [user]);

  return { role, loading };
}

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
        // First try by user_id
        const { data: idData, error: idError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!idError && idData) {
          setRole(idData.role as UserRole);
          setLoading(false);
          return;
        }

        // Fallback to email if user_id link isn't established yet
        if (user.email) {
          const { data: emailData, error: emailError } = await supabase
            .from("user_roles")
            .select("role")
            .ilike("email", user.email.trim())
            .maybeSingle();

          if (!emailError && emailData) {
            setRole(emailData.role as UserRole);
            setLoading(false);
            return;
          }
        }

        setRole(null);
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

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
        console.log("Fetching role for user ID:", user.id);
        const { data: idData, error: idError } = await supabase
          .from("user_roles")
          .select("role, email")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!idError && idData) {
          console.log("Found role by ID:", idData.role);
          setRole(idData.role as UserRole);
          setLoading(false);
          return;
        }

        if (idError) console.error("Error fetching role by ID:", idError);

        // Fallback to email if user_id link isn't established yet
        if (user.email) {
          console.log("Fetching role for email:", user.email);
          const { data: emailData, error: emailError } = await supabase
            .from("user_roles")
            .select("role, id")
            .ilike("email", user.email.trim())
            .maybeSingle();

          if (!emailError && emailData) {
            console.log("Found role by email:", emailData.role);
            setRole(emailData.role as UserRole);
            
            // Link the user_id if it's missing
            await supabase
              .from("user_roles")
              .update({ user_id: user.id })
              .eq("id", emailData.id);
              
            setLoading(false);
            return;
          }
          if (emailError) console.error("Error fetching role by email:", emailError);
        }

        console.log("No role found for user");
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

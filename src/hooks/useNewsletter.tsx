import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Subscriber {
  id: string;
  email: string;
  status: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export function useSubscribers() {
  return useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });
      if (error) throw error;
      return data as Subscriber[];
    },
  });
}

export function useSubscribe() {
  return useMutation({
    mutationFn: async (email: string) => {
      // Try to upsert — if already exists and unsubscribed, reactivate
      const { data: existing } = await supabase
        .from("newsletter_subscribers")
        .select("id, status")
        .eq("email", email.toLowerCase().trim())
        .maybeSingle();

      if (existing) {
        if (existing.status === "active") {
          throw new Error("Este e-mail já está inscrito.");
        }
        // Reactivate
        const { error } = await supabase
          .from("newsletter_subscribers")
          .update({ status: "active", unsubscribed_at: null })
          .eq("id", existing.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.toLowerCase().trim() });
      if (error) throw error;
    },
  });
}

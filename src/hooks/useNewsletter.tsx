import { useQuery, useMutation } from "@tanstack/react-query";
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
      const { error } = await supabase.rpc("subscribe_newsletter", { email_address: email });
      if (error) throw error;
    },
  });
}

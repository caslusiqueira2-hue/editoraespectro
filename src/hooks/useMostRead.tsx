import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MostReadPost {
  id: string;
  titulo: string;
  slug: string;
  categoria: string;
  views: number;
}

export function useMostRead(limit = 5) {
  return useQuery({
    queryKey: ["most-read", limit],
    queryFn: async (): Promise<MostReadPost[]> => {
      const { data, error } = await supabase.rpc("most_read_posts", { result_limit: limit });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60000,
  });
}

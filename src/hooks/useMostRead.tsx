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
      // Get post view counts
      const { data: viewRows, error } = await supabase
        .from("page_views")
        .select("content_id")
        .eq("page_type", "post")
        .not("content_id", "is", null);

      if (error) throw error;

      // Count views per content_id
      const countMap: Record<string, number> = {};
      (viewRows || []).forEach((r) => {
        if (r.content_id) {
          countMap[r.content_id] = (countMap[r.content_id] || 0) + 1;
        }
      });

      const topIds = Object.entries(countMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => id);

      if (topIds.length === 0) return [];

      // Fetch post details
      const { data: posts } = await supabase
        .from("posts")
        .select("id, titulo, slug, categoria_id, categories(nome)")
        .in("id", topIds)
        .eq("published", true);

      if (!posts) return [];

      return topIds
        .map((id) => {
          const p = posts.find((post) => post.id === id);
          if (!p) return null;
          return {
            id: p.id,
            titulo: p.titulo,
            slug: p.slug,
            categoria: (p.categories as any)?.nome || "",
            views: countMap[id] || 0,
          };
        })
        .filter(Boolean) as MostReadPost[];
    },
    staleTime: 60000,
  });
}

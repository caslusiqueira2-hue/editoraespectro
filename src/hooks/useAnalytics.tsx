import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  mostVisitedPages: { page_path: string; views: number }[];
  postViews: { content_id: string; titulo: string; views: number }[];
  categoryViews: { content_id: string; nome: string; views: number }[];
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async (): Promise<AnalyticsData> => {
      // Fetch all page views
      const { data: allViews, error } = await supabase
        .from("page_views")
        .select("id, page_path, page_type, content_id, visitor_id");

      if (error) throw error;

      const views = allViews || [];
      const totalViews = views.length;
      const uniqueVisitors = new Set(views.map((v) => v.visitor_id)).size;

      // Most visited pages
      const pageCounts: Record<string, number> = {};
      views.forEach((v) => {
        pageCounts[v.page_path] = (pageCounts[v.page_path] || 0) + 1;
      });
      const mostVisitedPages = Object.entries(pageCounts)
        .map(([page_path, count]) => ({ page_path, views: count }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Post views
      const postViewsMap: Record<string, number> = {};
      views
        .filter((v) => v.page_type === "post" && v.content_id)
        .forEach((v) => {
          postViewsMap[v.content_id!] = (postViewsMap[v.content_id!] || 0) + 1;
        });

      // Fetch post titles
      const postIds = Object.keys(postViewsMap);
      let postViews: AnalyticsData["postViews"] = [];
      if (postIds.length > 0) {
        const { data: posts } = await supabase
          .from("posts")
          .select("id, titulo")
          .in("id", postIds);

        postViews = (posts || [])
          .map((p) => ({
            content_id: p.id,
            titulo: p.titulo,
            views: postViewsMap[p.id] || 0,
          }))
          .sort((a, b) => b.views - a.views);
      }

      // Category views
      const catViewsMap: Record<string, number> = {};
      views
        .filter((v) => v.page_type === "category" && v.content_id)
        .forEach((v) => {
          catViewsMap[v.content_id!] = (catViewsMap[v.content_id!] || 0) + 1;
        });

      const catIds = Object.keys(catViewsMap);
      let categoryViews: AnalyticsData["categoryViews"] = [];
      if (catIds.length > 0) {
        const { data: cats } = await supabase
          .from("categories")
          .select("id, nome")
          .in("id", catIds);

        categoryViews = (cats || [])
          .map((c) => ({
            content_id: c.id,
            nome: c.nome,
            views: catViewsMap[c.id] || 0,
          }))
          .sort((a, b) => b.views - a.views);
      }

      return { totalViews, uniqueVisitors, mostVisitedPages, postViews, categoryViews };
    },
    staleTime: 30000,
  });
}

export function usePostViewCount(postId: string) {
  return useQuery({
    queryKey: ["post-views", postId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("page_views")
        .select("id", { count: "exact", head: true })
        .eq("content_id", postId)
        .eq("page_type", "post");

      if (error) throw error;
      return count || 0;
    },
    enabled: !!postId,
  });
}

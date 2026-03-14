import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

function getVisitorId(): string {
  const key = "espectro_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function useTrackPageView(
  pagePath: string,
  pageType: "home" | "post" | "category" | "page" = "page",
  contentId?: string
) {
  useEffect(() => {
    if (!pagePath) return;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) return; // Admin — don't track

      const visitorId = getVisitorId();

      const { error } = await supabase.from("page_views").insert({
        page_path: pagePath,
        page_type: pageType,
        content_id: contentId || null,
        visitor_id: visitorId,
      });
      if (error) console.error("Failed to track page view:", error.message);
    })();
  }, [pagePath, pageType, contentId]);
}

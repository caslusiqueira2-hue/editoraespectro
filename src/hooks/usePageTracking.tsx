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

    const visitorId = getVisitorId();

    supabase
      .from("page_views")
      .insert({
        page_path: pagePath,
        page_type: pageType,
        content_id: contentId || null,
        visitor_id: visitorId,
      })
      .then(({ error }) => {
        if (error) console.error("Failed to track page view:", error.message);
      });
  }, [pagePath, pageType, contentId]);
}

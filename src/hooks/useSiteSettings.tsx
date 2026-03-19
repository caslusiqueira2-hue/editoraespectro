import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSiteSetting(key: string) {
  return useQuery({
    queryKey: ["site_settings", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (error || !data) return true; // default visible
      return data.value as boolean;
    },
  });
}

export function useUpdateSiteSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: boolean }) => {
      const { error } = await supabase
        .from("site_settings")
        .upsert(
          { key, value: value as any, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
      if (error) throw error;
    },
    onSuccess: (_, { key }) => qc.invalidateQueries({ queryKey: ["site_settings", key] }),
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Post = Tables<"posts"> & { categories: Tables<"categories"> | null };

export function usePosts(publishedOnly = false) {
  return useQuery({
    queryKey: ["posts", publishedOnly],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select("*, categories(*)")
        .order("created_at", { ascending: false });

      if (publishedOnly) {
        query = query.eq("published", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Post[];
    },
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, categories(*)")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Post;
    },
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (post: TablesInsert<"posts">) => {
      const { data, error } = await supabase.from("posts").insert(post).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"posts"> & { id: string }) => {
      const { data, error } = await supabase.from("posts").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export async function uploadPostImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("post-images").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("post-images").getPublicUrl(path);
  return data.publicUrl;
}

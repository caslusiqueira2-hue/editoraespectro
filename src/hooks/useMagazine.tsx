import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MagazineVolume = {
  id: string;
  titulo: string;
  numero: number;
  ano: number;
  slug: string;
  capa_url: string | null;
  editorial: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type MagazineArticle = {
  id: string;
  volume_id: string;
  titulo: string;
  autor: string;
  secao: string;
  slug: string;
  imagem_url: string | null;
  conteudo: string;
  ordem: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  magazine_volumes?: MagazineVolume | null;
};

export function useVolumes(publishedOnly = false) {
  return useQuery({
    queryKey: ["magazine-volumes", publishedOnly],
    queryFn: async () => {
      let query = supabase
        .from("magazine_volumes")
        .select("*")
        .order("numero", { ascending: false });
      if (publishedOnly) query = query.eq("published", true);
      const { data, error } = await query;
      if (error) throw error;
      return data as MagazineVolume[];
    },
  });
}

export function useVolume(slug: string) {
  return useQuery({
    queryKey: ["magazine-volume", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("magazine_volumes")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as MagazineVolume;
    },
    enabled: !!slug,
  });
}

export function useVolumeArticles(volumeId: string | undefined, publishedOnly = false) {
  return useQuery({
    queryKey: ["magazine-articles", volumeId, publishedOnly],
    queryFn: async () => {
      let query = supabase
        .from("magazine_articles")
        .select("*")
        .eq("volume_id", volumeId!)
        .order("ordem");
      if (publishedOnly) query = query.eq("published", true);
      const { data, error } = await query;
      if (error) throw error;
      return data as MagazineArticle[];
    },
    enabled: !!volumeId,
  });
}

export function useMagazineArticle(volumeSlug: string, articleSlug: string) {
  return useQuery({
    queryKey: ["magazine-article", volumeSlug, articleSlug],
    queryFn: async () => {
      // First get the volume
      const { data: volume, error: vErr } = await supabase
        .from("magazine_volumes")
        .select("*")
        .eq("slug", volumeSlug)
        .single();
      if (vErr) throw vErr;

      const { data: article, error: aErr } = await supabase
        .from("magazine_articles")
        .select("*")
        .eq("volume_id", volume.id)
        .eq("slug", articleSlug)
        .single();
      if (aErr) throw aErr;

      return { ...article, magazine_volumes: volume } as MagazineArticle;
    },
    enabled: !!volumeSlug && !!articleSlug,
  });
}

export function useAllMagazineArticlesBySection(secao: string) {
  return useQuery({
    queryKey: ["magazine-articles-section", secao],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("magazine_articles")
        .select("*, magazine_volumes(*)")
        .eq("secao", secao)
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MagazineArticle[];
    },
    enabled: !!secao,
  });
}

// Mutations
export function useCreateVolume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vol: Omit<MagazineVolume, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("magazine_volumes").insert(vol).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["magazine-volumes"] }),
  });
}

export function useUpdateVolume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MagazineVolume> & { id: string }) => {
      const { data, error } = await supabase.from("magazine_volumes").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["magazine-volumes"] }),
  });
}

export function useDeleteVolume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("magazine_volumes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["magazine-volumes"] }),
  });
}

export function useCreateMagazineArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (art: Omit<MagazineArticle, "id" | "created_at" | "updated_at" | "magazine_volumes">) => {
      const { data, error } = await supabase.from("magazine_articles").insert(art).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["magazine-articles"] }),
  });
}

export function useUpdateMagazineArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MagazineArticle> & { id: string }) => {
      const { magazine_volumes, ...clean } = updates as any;
      const { data, error } = await supabase.from("magazine_articles").update(clean).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["magazine-articles"] }),
  });
}

export function useDeleteMagazineArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("magazine_articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["magazine-articles"] }),
  });
}

export async function uploadMagazineImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `magazine/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("post-images").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("post-images").getPublicUrl(path);
  return data.publicUrl;
}

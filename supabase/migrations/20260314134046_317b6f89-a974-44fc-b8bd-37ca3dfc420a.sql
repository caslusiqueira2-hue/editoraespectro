
-- Magazine Volumes
CREATE TABLE public.magazine_volumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  numero integer NOT NULL,
  ano integer NOT NULL,
  slug text NOT NULL UNIQUE,
  capa_url text,
  editorial text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Magazine Articles
CREATE TABLE public.magazine_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volume_id uuid NOT NULL REFERENCES public.magazine_volumes(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  autor text NOT NULL,
  secao text NOT NULL DEFAULT 'conto',
  slug text NOT NULL,
  imagem_url text,
  conteudo text NOT NULL DEFAULT '',
  ordem integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(volume_id, slug)
);

-- Triggers for updated_at
CREATE TRIGGER update_magazine_volumes_updated_at
  BEFORE UPDATE ON public.magazine_volumes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_magazine_articles_updated_at
  BEFORE UPDATE ON public.magazine_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for magazine_volumes
ALTER TABLE public.magazine_volumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published volumes viewable by everyone"
  ON public.magazine_volumes FOR SELECT TO public
  USING (published = true);

CREATE POLICY "Authenticated can view all volumes"
  ON public.magazine_volumes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated can create volumes"
  ON public.magazine_volumes FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update volumes"
  ON public.magazine_volumes FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated can delete volumes"
  ON public.magazine_volumes FOR DELETE TO authenticated
  USING (true);

-- RLS for magazine_articles
ALTER TABLE public.magazine_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published articles viewable by everyone"
  ON public.magazine_articles FOR SELECT TO public
  USING (published = true);

CREATE POLICY "Authenticated can view all articles"
  ON public.magazine_articles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated can create articles"
  ON public.magazine_articles FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update articles"
  ON public.magazine_articles FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated can delete articles"
  ON public.magazine_articles FOR DELETE TO authenticated
  USING (true);

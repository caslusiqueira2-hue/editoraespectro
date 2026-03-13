-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.categories (nome, slug) VALUES
  ('Ensaios & Artigos', 'ensaios'),
  ('Poesia', 'poesia'),
  ('Conto', 'conto'),
  ('Resenhas', 'resenhas');

-- Enable RLS on categories (public read)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Create posts table
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  autor TEXT NOT NULL,
  categoria_id UUID NOT NULL REFERENCES public.categories(id),
  destaque BOOLEAN NOT NULL DEFAULT false,
  imagem_url TEXT,
  resumo TEXT NOT NULL,
  conteudo JSONB NOT NULL DEFAULT '[]'::jsonb,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Published posts are viewable by everyone" ON public.posts FOR SELECT USING (published = true);

-- Authenticated users can manage posts (admin)
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update posts" ON public.posts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete posts" ON public.posts FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can view all posts" ON public.posts FOR SELECT TO authenticated USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for post images
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);

CREATE POLICY "Post images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'post-images');
CREATE POLICY "Authenticated users can upload post images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'post-images');
CREATE POLICY "Authenticated users can update post images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'post-images');
CREATE POLICY "Authenticated users can delete post images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'post-images');
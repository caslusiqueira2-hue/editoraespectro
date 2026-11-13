BEGIN;

-- Keep editorial access in sync with the role already used by the panel.
CREATE OR REPLACE FUNCTION public.is_editorial_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT coalesce(public.get_current_admin_role() IN ('main_admin', 'admin'), false)
$$;

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can update posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can delete posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON public.posts;
CREATE POLICY "Editorial admins manage posts" ON public.posts
  FOR ALL TO authenticated USING (public.is_editorial_admin()) WITH CHECK (public.is_editorial_admin());

DROP POLICY IF EXISTS "Authenticated can view all volumes" ON public.magazine_volumes;
DROP POLICY IF EXISTS "Authenticated can create volumes" ON public.magazine_volumes;
DROP POLICY IF EXISTS "Authenticated can update volumes" ON public.magazine_volumes;
DROP POLICY IF EXISTS "Authenticated can delete volumes" ON public.magazine_volumes;
CREATE POLICY "Editorial admins manage volumes" ON public.magazine_volumes
  FOR ALL TO authenticated USING (public.is_editorial_admin()) WITH CHECK (public.is_editorial_admin());

DROP POLICY IF EXISTS "Authenticated can view all articles" ON public.magazine_articles;
DROP POLICY IF EXISTS "Authenticated can create articles" ON public.magazine_articles;
DROP POLICY IF EXISTS "Authenticated can update articles" ON public.magazine_articles;
DROP POLICY IF EXISTS "Authenticated can delete articles" ON public.magazine_articles;
DROP POLICY IF EXISTS "Published articles viewable by everyone" ON public.magazine_articles;
CREATE POLICY "Editorial admins manage magazine articles" ON public.magazine_articles
  FOR ALL TO authenticated USING (public.is_editorial_admin()) WITH CHECK (public.is_editorial_admin());
CREATE POLICY "Public reads published articles in published volumes" ON public.magazine_articles
  FOR SELECT USING (published AND EXISTS (
    SELECT 1 FROM public.magazine_volumes AS volume
    WHERE volume.id = volume_id AND volume.published
  ));

DROP POLICY IF EXISTS "Authenticated users can update settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated users can insert settings" ON public.site_settings;
CREATE POLICY "Editorial admins manage settings" ON public.site_settings
  FOR ALL TO authenticated USING (public.is_editorial_admin()) WITH CHECK (public.is_editorial_admin());

DROP POLICY IF EXISTS "Authenticated can view submissions" ON public.submissions;
DROP POLICY IF EXISTS "Authenticated can delete submissions" ON public.submissions;
CREATE POLICY "Editorial admins read submissions" ON public.submissions
  FOR SELECT TO authenticated USING (public.is_editorial_admin());
CREATE POLICY "Editorial admins delete submissions" ON public.submissions
  FOR DELETE TO authenticated USING (public.is_editorial_admin());

UPDATE storage.buckets SET public = false WHERE id = 'submissions';
DROP POLICY IF EXISTS "Anyone can read submissions files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete submission files" ON storage.objects;
CREATE POLICY "Editorial admins read submission files" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'submissions' AND public.is_editorial_admin());
CREATE POLICY "Editorial admins delete submission files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'submissions' AND public.is_editorial_admin());

DROP POLICY IF EXISTS "Authenticated users can upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update post images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete post images" ON storage.objects;
CREATE POLICY "Editorial admins upload post images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'post-images' AND public.is_editorial_admin());
CREATE POLICY "Editorial admins update post images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'post-images' AND public.is_editorial_admin())
  WITH CHECK (bucket_id = 'post-images' AND public.is_editorial_admin());
CREATE POLICY "Editorial admins delete post images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'post-images' AND public.is_editorial_admin());

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated can view subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can update subscription" ON public.newsletter_subscribers;
CREATE POLICY "Editorial admins read newsletter subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (public.is_editorial_admin());

CREATE OR REPLACE FUNCTION public.subscribe_newsletter(email_address text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  normalized_email text := lower(btrim(email_address));
BEGIN
  IF normalized_email IS NULL OR length(normalized_email) > 254
     OR normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' THEN
    RAISE EXCEPTION 'E-mail inválido' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.newsletter_subscribers (email)
  VALUES (normalized_email)
  ON CONFLICT (email) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.subscribe_newsletter(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.subscribe_newsletter(text) TO anon, authenticated;

DROP POLICY IF EXISTS "Authenticated users can read page views" ON public.page_views;
DROP POLICY IF EXISTS "Anyone can read page views" ON public.page_views;
CREATE POLICY "Editorial admins read page views" ON public.page_views
  FOR SELECT TO authenticated USING (public.is_editorial_admin());

CREATE INDEX IF NOT EXISTS page_views_post_content_idx ON public.page_views (content_id)
  WHERE page_type = 'post' AND content_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.most_read_posts(result_limit integer DEFAULT 5)
RETURNS TABLE (id uuid, titulo text, slug text, categoria text, views bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT post.id, post.titulo, post.slug, category.nome, count(*) AS views
  FROM public.page_views AS page_view
  JOIN public.posts AS post ON post.id = page_view.content_id AND post.published
  JOIN public.categories AS category ON category.id = post.categoria_id
  WHERE page_view.page_type = 'post'
  GROUP BY post.id, post.titulo, post.slug, category.nome
  ORDER BY views DESC, post.titulo, post.id
  LIMIT greatest(1, least(coalesce(result_limit, 5), 20))
$$;

REVOKE ALL ON FUNCTION public.most_read_posts(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.most_read_posts(integer) TO anon, authenticated;

COMMIT;

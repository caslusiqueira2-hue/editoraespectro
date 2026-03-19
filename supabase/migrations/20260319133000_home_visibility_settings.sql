-- Insert default visibility settings for home page sections
-- Using ON CONFLICT DO NOTHING so existing rows are not overwritten
INSERT INTO public.site_settings (key, value)
VALUES
  ('home_nav_visible',        true),
  ('home_hero_visible',       true),
  ('home_recentes_visible',   true),
  ('home_maislidos_visible',  true),
  ('home_newsletter_visible', true),
  ('home_quotebar_visible',   true)
ON CONFLICT (key) DO NOTHING;

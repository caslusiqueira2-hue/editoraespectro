-- Allow anyone to read page views to enable the "Most Read" section
CREATE POLICY "Anyone can read page views"
ON public.page_views
FOR SELECT
USING (true);

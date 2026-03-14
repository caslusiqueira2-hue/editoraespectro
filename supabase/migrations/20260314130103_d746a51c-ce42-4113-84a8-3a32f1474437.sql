
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  subscribed_at timestamp with time zone NOT NULL DEFAULT now(),
  unsubscribed_at timestamp with time zone
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT TO public WITH CHECK (true);

-- Authenticated can view all
CREATE POLICY "Authenticated can view subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (true);

-- Anyone can update (for unsubscribe)
CREATE POLICY "Anyone can update subscription" ON public.newsletter_subscribers
  FOR UPDATE TO public USING (true) WITH CHECK (true);

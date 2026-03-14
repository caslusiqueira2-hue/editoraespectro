
-- Create submissions table
CREATE TABLE public.submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  email text NOT NULL,
  genero text NOT NULL,
  titulo text NOT NULL,
  mensagem text,
  texto_url text NOT NULL,
  foto_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit
CREATE POLICY "Anyone can insert submissions"
  ON public.submissions FOR INSERT
  TO public
  WITH CHECK (true);

-- Authenticated can view
CREATE POLICY "Authenticated can view submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated can delete
CREATE POLICY "Authenticated can delete submissions"
  ON public.submissions FOR DELETE
  TO authenticated
  USING (true);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', true);

-- Storage: anyone can upload
CREATE POLICY "Anyone can upload submissions"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'submissions');

-- Storage: anyone can read (public bucket)
CREATE POLICY "Anyone can read submissions files"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'submissions');

-- Storage: authenticated can delete
CREATE POLICY "Authenticated can delete submission files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'submissions');

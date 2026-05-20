CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('main_admin', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Política para leitura: administradores podem ler
CREATE POLICY "Admins can view roles" 
ON public.user_roles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Política para gerenciamento: apenas o main_admin pode inserir/atualizar/deletar
CREATE POLICY "Main admin can manage roles" 
ON public.user_roles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE email = auth.jwt() ->> 'email' AND role = 'main_admin'
  )
);

-- Inserir os administradores iniciais
INSERT INTO public.user_roles (email, role) 
VALUES 
  ('christianlucas12@gmail.com', 'main_admin'),
  ('lealmariafernanda808@gmail.com', 'admin');

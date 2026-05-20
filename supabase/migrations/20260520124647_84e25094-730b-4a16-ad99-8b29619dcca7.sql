-- Permitir que qualquer um verifique se um e-mail existe na tabela (necessário para o fluxo de cadastro)
DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;
CREATE POLICY "Public can view roles" 
ON public.user_roles 
FOR SELECT 
USING (true);

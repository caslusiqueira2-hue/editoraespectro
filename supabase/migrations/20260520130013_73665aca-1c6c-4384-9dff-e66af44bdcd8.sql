-- Update RLS policies to be case-insensitive
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR 
  lower(email) = lower(auth.jwt() ->> 'email')
);

DROP POLICY IF EXISTS "Main admin can manage all roles" ON public.user_roles;
CREATE POLICY "Main admin can manage all roles" 
ON public.user_roles 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE (user_id = auth.uid() OR lower(email) = lower(auth.jwt() ->> 'email'))
    AND role = 'main_admin'
  )
);

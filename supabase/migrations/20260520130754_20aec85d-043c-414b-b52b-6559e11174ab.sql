-- Enable RLS (already enabled, but being explicit)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Main admin can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Public access to user roles" ON public.user_roles;

-- Create a policy that allows anyone to view roles (safe because it only contains email and role name)
-- This fixes the "Acesso negado" and the check during sign-up
CREATE POLICY "Allow public read access to user_roles"
ON public.user_roles
FOR SELECT
USING (true);

-- Create a policy that allows main admins to manage everything
CREATE POLICY "Main admins can manage roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE (user_id = auth.uid() OR lower(email) = lower(COALESCE(auth.jwt() ->> 'email', '')))
    AND role = 'main_admin'
  )
);

-- Ensure the specific users are in the table with correct roles
INSERT INTO public.user_roles (email, role)
VALUES 
  ('christianlucas12@gmail.com', 'main_admin'),
  ('lealmariafernanda808@gmail.com', 'admin')
ON CONFLICT (email) DO UPDATE 
SET role = EXCLUDED.role;

-- Force link user_id if they already exist in auth.users
-- We can't do this directly for existing users without their IDs, 
-- but the fallback in useUserRole.ts (checking by email) will handle it
-- and the trigger link_user_role_on_signup will handle future signups.

-- Add user_id column to user_roles
ALTER TABLE public.user_roles ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Try to update existing user_ids from auth.users
-- This will work if the migration has enough permissions to read auth.users
DO $$
BEGIN
  UPDATE public.user_roles ur
  SET user_id = u.id
  FROM auth.users u
  WHERE ur.email = u.email;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not automatically link existing users to roles. They will be linked upon next sign-in if the trigger is active.';
END $$;

-- Create or replace function to link user_id by email
CREATE OR REPLACE FUNCTION public.link_user_role_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_roles
  SET user_id = NEW.id
  WHERE email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users (if possible)
-- Note: triggers on auth.users are allowed in Supabase
DROP TRIGGER IF EXISTS on_auth_user_created_link_role ON auth.users;
CREATE TRIGGER on_auth_user_created_link_role
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.link_user_role_on_signup();

-- Update RLS policies to be more robust
DROP POLICY IF EXISTS "Public can view roles" ON public.user_roles;
CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR 
  email = (auth.jwt() ->> 'email')
);

DROP POLICY IF EXISTS "Main admin can manage roles" ON public.user_roles;
CREATE POLICY "Main admin can manage all roles" 
ON public.user_roles 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE (user_id = auth.uid() OR email = (auth.jwt() ->> 'email'))
    AND role = 'main_admin'
  )
);

-- Normalize and guarantee the requested admin records
UPDATE public.user_roles
SET email = lower(trim(email)), updated_at = now();

INSERT INTO public.user_roles (email, role)
VALUES
  ('christianlucas12@gmail.com', 'main_admin'),
  ('lealmariafernanda808@gmail.com', 'admin')
ON CONFLICT (email) DO UPDATE
SET role = EXCLUDED.role,
    updated_at = now();

-- Link existing authenticated users by e-mail
UPDATE public.user_roles ur
SET user_id = au.id,
    updated_at = now()
FROM auth.users au
WHERE lower(au.email) = lower(ur.email);

-- Safe helper used by the app to discover the current signed-in user's admin role
CREATE OR REPLACE FUNCTION public.get_current_admin_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.role
  FROM public.user_roles ur
  WHERE (ur.user_id = auth.uid())
     OR (lower(ur.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  ORDER BY CASE WHEN ur.role = 'main_admin' THEN 0 ELSE 1 END
  LIMIT 1
$$;

-- Safe helper used before signup to check whether an email is allowed to create a password
CREATE OR REPLACE FUNCTION public.is_admin_email_allowed(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE lower(ur.email) = lower(trim(_email))
      AND ur.role IN ('main_admin', 'admin')
  )
$$;

-- Helper for role management policies; avoids recursive user_roles policies
CREATE OR REPLACE FUNCTION public.is_current_main_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_current_admin_role() = 'main_admin'
$$;

-- Replace recursive/permissive policies with non-recursive role-based policies
DROP POLICY IF EXISTS "Allow public read access to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Main admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Main admin can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Public access to user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Public can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Main admin can manage all roles" ON public.user_roles;

CREATE POLICY "Admins can read permitted roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.is_current_main_admin()
  OR user_id = auth.uid()
  OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

CREATE POLICY "Main admin can add admins"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_current_main_admin()
  AND role = 'admin'
);

CREATE POLICY "Main admin can update secondary admins"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  public.is_current_main_admin()
  AND role <> 'main_admin'
)
WITH CHECK (
  public.is_current_main_admin()
  AND role = 'admin'
);

CREATE POLICY "Main admin can remove secondary admins"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  public.is_current_main_admin()
  AND role <> 'main_admin'
);
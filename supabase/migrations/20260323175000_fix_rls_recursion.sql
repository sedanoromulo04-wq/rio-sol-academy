-- Create a SECURITY DEFINER function to check admin status
-- This bypasses RLS and prevents infinite recursion when evaluating admin policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_admin boolean;
BEGIN
  SELECT is_admin INTO _is_admin FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(_is_admin, false);
END;
$$;

-- Update policies for profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin());

-- Update policies for activities
DROP POLICY IF EXISTS "Admins can read all activities" ON public.activities;
CREATE POLICY "Admins can read all activities" ON public.activities FOR SELECT TO authenticated USING (public.is_admin());

-- Update policies for content
DROP POLICY IF EXISTS "Admins can manage content" ON public.content;
CREATE POLICY "Admins can manage content" ON public.content FOR ALL TO authenticated USING (public.is_admin());

-- Update policies for system_settings
DROP POLICY IF EXISTS "Admins can manage system settings" ON public.system_settings;
CREATE POLICY "Admins can manage system settings" ON public.system_settings FOR ALL TO authenticated USING (public.is_admin());

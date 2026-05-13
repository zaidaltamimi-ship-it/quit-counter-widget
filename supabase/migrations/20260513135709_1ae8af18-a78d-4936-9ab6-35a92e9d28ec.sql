
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- User roles table (separate from profiles to prevent privilege escalation)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;

-- Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Premium grants: admin can give free premium to specific users
CREATE TABLE public.premium_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.premium_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own grants"
  ON public.premium_grants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all grants"
  ON public.premium_grants FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage grants"
  ON public.premium_grants FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

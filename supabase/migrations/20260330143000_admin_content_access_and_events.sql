CREATE TABLE IF NOT EXISTS public.user_content_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  is_allowed boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_id)
);

CREATE TABLE IF NOT EXISTS public.backend_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  content_id uuid REFERENCES public.content(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_content_access_user_id ON public.user_content_access (user_id);
CREATE INDEX IF NOT EXISTS idx_user_content_access_content_id ON public.user_content_access (content_id);
CREATE INDEX IF NOT EXISTS idx_backend_events_user_id ON public.backend_events (user_id);
CREATE INDEX IF NOT EXISTS idx_backend_events_actor_id ON public.backend_events (actor_id);
CREATE INDEX IF NOT EXISTS idx_backend_events_content_id ON public.backend_events (content_id);
CREATE INDEX IF NOT EXISTS idx_backend_events_created_at ON public.backend_events (created_at DESC);

CREATE OR REPLACE FUNCTION public.set_user_content_access_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_content_access_updated_at ON public.user_content_access;
CREATE TRIGGER trg_user_content_access_updated_at
BEFORE UPDATE ON public.user_content_access
FOR EACH ROW
EXECUTE FUNCTION public.set_user_content_access_updated_at();

ALTER TABLE public.user_content_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backend_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own content access" ON public.user_content_access;
CREATE POLICY "Users can read own content access"
ON public.user_content_access
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage content access" ON public.user_content_access;
CREATE POLICY "Admins can manage content access"
ON public.user_content_access
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can read own backend events" ON public.backend_events;
CREATE POLICY "Users can read own backend events"
ON public.backend_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own backend events" ON public.backend_events;
CREATE POLICY "Users can insert own backend events"
ON public.backend_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND auth.uid() = actor_id);

DROP POLICY IF EXISTS "Admins can read all backend events" ON public.backend_events;
CREATE POLICY "Admins can read all backend events"
ON public.backend_events
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert backend events" ON public.backend_events;
CREATE POLICY "Admins can insert backend events"
ON public.backend_events
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

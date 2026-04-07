ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS specialty text;

ALTER TABLE public.content
ADD COLUMN IF NOT EXISTS audience_scope text NOT NULL DEFAULT 'all',
ADD COLUMN IF NOT EXISTS target_specialties text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.content
DROP CONSTRAINT IF EXISTS content_audience_scope_check;

ALTER TABLE public.content
ADD CONSTRAINT content_audience_scope_check CHECK (
  audience_scope = ANY (ARRAY['all'::text, 'specialty'::text])
);

ALTER TABLE public.content
DROP CONSTRAINT IF EXISTS content_target_specialties_required_check;

ALTER TABLE public.content
ADD CONSTRAINT content_target_specialties_required_check CHECK (
  audience_scope = 'all' OR cardinality(target_specialties) > 0
);

CREATE INDEX IF NOT EXISTS idx_profiles_specialty ON public.profiles (specialty);
CREATE INDEX IF NOT EXISTS idx_content_audience_scope ON public.content (audience_scope);
CREATE INDEX IF NOT EXISTS idx_content_target_specialties ON public.content USING gin (target_specialties);

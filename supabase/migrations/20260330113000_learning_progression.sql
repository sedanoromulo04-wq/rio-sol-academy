ALTER TABLE public.content
ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS video_count integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS material_count integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS assessment_question_count integer NOT NULL DEFAULT 5,
ADD COLUMN IF NOT EXISTS passing_score integer NOT NULL DEFAULT 70,
ADD COLUMN IF NOT EXISTS estimated_minutes_override integer;

ALTER TABLE public.content
DROP CONSTRAINT IF EXISTS content_passing_score_check;

ALTER TABLE public.content
ADD CONSTRAINT content_passing_score_check CHECK (passing_score BETWEEN 1 AND 100);

ALTER TABLE public.content
DROP CONSTRAINT IF EXISTS content_position_check;

ALTER TABLE public.content
ADD CONSTRAINT content_position_check CHECK (position >= 1);

ALTER TABLE public.content
DROP CONSTRAINT IF EXISTS content_video_count_check;

ALTER TABLE public.content
ADD CONSTRAINT content_video_count_check CHECK (video_count >= 1);

ALTER TABLE public.content
DROP CONSTRAINT IF EXISTS content_material_count_check;

ALTER TABLE public.content
ADD CONSTRAINT content_material_count_check CHECK (material_count >= 0);

ALTER TABLE public.content
DROP CONSTRAINT IF EXISTS content_assessment_question_count_check;

ALTER TABLE public.content
ADD CONSTRAINT content_assessment_question_count_check CHECK (assessment_question_count >= 1);

WITH ranked_content AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY COALESCE(category, 'Geral')
      ORDER BY created_at NULLS LAST, title, id
    ) AS ordered_position
  FROM public.content
)
UPDATE public.content AS content
SET position = ranked_content.ordered_position
FROM ranked_content
WHERE content.id = ranked_content.id
  AND content.position = 1;

CREATE TABLE IF NOT EXISTS public.learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  started_at timestamp with time zone,
  due_at timestamp with time zone,
  watched_at timestamp with time zone,
  completed_at timestamp with time zone,
  assessment_score integer,
  assessment_status text NOT NULL DEFAULT 'pending' CHECK (
    assessment_status = ANY (ARRAY['pending'::text, 'passed'::text, 'failed'::text])
  ),
  attempts_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_id)
);

ALTER TABLE public.learning_progress
DROP CONSTRAINT IF EXISTS learning_progress_assessment_score_check;

ALTER TABLE public.learning_progress
ADD CONSTRAINT learning_progress_assessment_score_check CHECK (
  assessment_score IS NULL OR assessment_score BETWEEN 0 AND 100
);

ALTER TABLE public.learning_progress
DROP CONSTRAINT IF EXISTS learning_progress_attempts_count_check;

ALTER TABLE public.learning_progress
ADD CONSTRAINT learning_progress_attempts_count_check CHECK (attempts_count >= 0);

CREATE INDEX IF NOT EXISTS idx_content_category_position ON public.content (category, position);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON public.learning_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_content_id ON public.learning_progress (content_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_due_at ON public.learning_progress (due_at);

CREATE OR REPLACE FUNCTION public.set_learning_progress_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_learning_progress_updated_at ON public.learning_progress;
CREATE TRIGGER trg_learning_progress_updated_at
BEFORE UPDATE ON public.learning_progress
FOR EACH ROW
EXECUTE FUNCTION public.set_learning_progress_updated_at();

ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own learning progress" ON public.learning_progress;
CREATE POLICY "Users can read own learning progress"
ON public.learning_progress
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own learning progress" ON public.learning_progress;
CREATE POLICY "Users can insert own learning progress"
ON public.learning_progress
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own learning progress" ON public.learning_progress;
CREATE POLICY "Users can update own learning progress"
ON public.learning_progress
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all learning progress" ON public.learning_progress;
CREATE POLICY "Admins can read all learning progress"
ON public.learning_progress
FOR SELECT
TO authenticated
USING (public.is_admin());

ALTER TABLE public.content
ADD COLUMN IF NOT EXISTS source_platform text NOT NULL DEFAULT 'youtube',
ADD COLUMN IF NOT EXISTS youtube_video_id text,
ADD COLUMN IF NOT EXISTS automation_status text NOT NULL DEFAULT 'not_configured',
ADD COLUMN IF NOT EXISTS transcript_status text NOT NULL DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS transcript_text text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS summary_status text NOT NULL DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS summary_text text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS mind_map_status text NOT NULL DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS mind_map_markdown text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS assessment_suggestions text[] NOT NULL DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS automation_requested_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS automation_processed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS automation_error text;

ALTER TABLE public.content
DROP CONSTRAINT IF EXISTS content_source_platform_check,
DROP CONSTRAINT IF EXISTS content_automation_status_check,
DROP CONSTRAINT IF EXISTS content_transcript_status_check,
DROP CONSTRAINT IF EXISTS content_summary_status_check,
DROP CONSTRAINT IF EXISTS content_mind_map_status_check;

ALTER TABLE public.content
ADD CONSTRAINT content_source_platform_check
  CHECK (source_platform = ANY (ARRAY['youtube'::text, 'external'::text])),
ADD CONSTRAINT content_automation_status_check
  CHECK (automation_status = ANY (ARRAY[
    'not_configured'::text,
    'idle'::text,
    'queued'::text,
    'processing'::text,
    'ready'::text,
    'error'::text
  ])),
ADD CONSTRAINT content_transcript_status_check
  CHECK (transcript_status = ANY (ARRAY[
    'idle'::text,
    'queued'::text,
    'processing'::text,
    'ready'::text,
    'error'::text
  ])),
ADD CONSTRAINT content_summary_status_check
  CHECK (summary_status = ANY (ARRAY[
    'idle'::text,
    'queued'::text,
    'processing'::text,
    'ready'::text,
    'error'::text
  ])),
ADD CONSTRAINT content_mind_map_status_check
  CHECK (mind_map_status = ANY (ARRAY[
    'idle'::text,
    'queued'::text,
    'processing'::text,
    'ready'::text,
    'error'::text
  ]));

CREATE INDEX IF NOT EXISTS idx_content_source_platform
  ON public.content USING btree (source_platform);

CREATE INDEX IF NOT EXISTS idx_content_youtube_video_id
  ON public.content USING btree (youtube_video_id);

CREATE INDEX IF NOT EXISTS idx_content_automation_status
  ON public.content USING btree (automation_status);

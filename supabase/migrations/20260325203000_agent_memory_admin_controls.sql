ALTER TABLE public.agent_memories
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'global'
    CHECK (visibility IN ('global', 'private')),
  ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'conversation'
    CHECK (source_type IN ('conversation', 'admin_text', 'admin_upload')),
  ADD COLUMN IF NOT EXISTS source_name TEXT,
  ADD COLUMN IF NOT EXISTS chunk_index INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS document_id UUID NOT NULL DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS idx_agent_memories_visibility
  ON public.agent_memories USING btree (visibility);

CREATE INDEX IF NOT EXISTS idx_agent_memories_document_id
  ON public.agent_memories USING btree (document_id);

DROP POLICY IF EXISTS "Admins can read all agent memories" ON public.agent_memories;
CREATE POLICY "Admins can read all agent memories"
  ON public.agent_memories
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert all agent memories" ON public.agent_memories;
CREATE POLICY "Admins can insert all agent memories"
  ON public.agent_memories
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all agent memories" ON public.agent_memories;
CREATE POLICY "Admins can update all agent memories"
  ON public.agent_memories
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete all agent memories" ON public.agent_memories;
CREATE POLICY "Admins can delete all agent memories"
  ON public.agent_memories
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

DROP FUNCTION IF EXISTS public.match_agent_memories(extensions.vector, INT, TEXT);

CREATE OR REPLACE FUNCTION public.match_agent_memories(
  query_embedding extensions.vector(768),
  match_count INT DEFAULT 6,
  filter_agent_kind TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  agent_kind TEXT,
  title TEXT,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  similarity DOUBLE PRECISION,
  visibility TEXT,
  source_type TEXT,
  source_name TEXT,
  chunk_index INTEGER,
  document_id UUID
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    am.id,
    am.user_id,
    am.agent_kind,
    am.title,
    am.content,
    am.metadata,
    am.created_at,
    1 - (am.embedding <=> query_embedding) AS similarity,
    am.visibility,
    am.source_type,
    am.source_name,
    am.chunk_index,
    am.document_id
  FROM public.agent_memories am
  WHERE
    (am.visibility = 'global' OR am.user_id = auth.uid())
    AND (filter_agent_kind IS NULL OR am.agent_kind = filter_agent_kind)
  ORDER BY am.embedding <=> query_embedding
  LIMIT GREATEST(match_count, 1);
$$;

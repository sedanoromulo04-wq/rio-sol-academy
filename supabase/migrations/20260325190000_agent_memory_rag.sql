CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  agent_kind TEXT NOT NULL CHECK (agent_kind IN ('mentor', 'roleplay', 'mentor_feedback')),
  title TEXT,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding extensions.vector(768) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_memories_user_id
  ON public.agent_memories USING btree (user_id);

CREATE INDEX IF NOT EXISTS idx_agent_memories_agent_kind
  ON public.agent_memories USING btree (agent_kind);

CREATE INDEX IF NOT EXISTS idx_agent_memories_created_at
  ON public.agent_memories USING btree (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_memories_embedding
  ON public.agent_memories
  USING hnsw (embedding extensions.vector_cosine_ops);

CREATE OR REPLACE FUNCTION public.set_agent_memory_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_agent_memories_updated_at ON public.agent_memories;
CREATE TRIGGER trg_agent_memories_updated_at
  BEFORE UPDATE ON public.agent_memories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_agent_memory_updated_at();

ALTER TABLE public.agent_memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own agent memories" ON public.agent_memories;
CREATE POLICY "Users can read own agent memories"
  ON public.agent_memories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own agent memories" ON public.agent_memories;
CREATE POLICY "Users can insert own agent memories"
  ON public.agent_memories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own agent memories" ON public.agent_memories;
CREATE POLICY "Users can update own agent memories"
  ON public.agent_memories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own agent memories" ON public.agent_memories;
CREATE POLICY "Users can delete own agent memories"
  ON public.agent_memories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

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
  similarity DOUBLE PRECISION
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
    1 - (am.embedding <=> query_embedding) AS similarity
  FROM public.agent_memories am
  WHERE am.user_id = auth.uid()
    AND (filter_agent_kind IS NULL OR am.agent_kind = filter_agent_kind)
  ORDER BY am.embedding <=> query_embedding
  LIMIT GREATEST(match_count, 1);
$$;

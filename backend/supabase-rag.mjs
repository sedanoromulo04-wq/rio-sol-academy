import { createClient } from '@supabase/supabase-js'

const getSupabaseUrl = () => process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''

const getSupabaseAnonKey = () =>
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  ''

export const defaultAgentPromptConfig = {
  shared: '',
  mentor: '',
  roleplay: '',
  mentorFeedback: '',
}

export const supportedRagUploadExtensions = ['.pdf', '.txt', '.md', '.docx']

export const ragUploadGuidance = {
  maxFilesPerBatch: 5,
  maxFileSizeMb: 10,
  recommendedPdfPages: 150,
  hardPdfPages: 250,
  recommendedCharactersPerText: 120000,
  supportedExtensions: supportedRagUploadExtensions,
}

const buildSupabaseClient = (accessToken = '') => {
  const supabaseUrl = getSupabaseUrl()
  const supabaseAnonKey = getSupabaseAnonKey()

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase RAG nao configurado no backend local.')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  })
}

export function getSupabaseRagRuntimeConfig() {
  return {
    enabled: Boolean(getSupabaseUrl() && getSupabaseAnonKey()),
    supabaseUrl: getSupabaseUrl(),
    guidance: ragUploadGuidance,
  }
}

export async function getAuthenticatedSupabaseContext(accessToken) {
  if (!accessToken) {
    throw new Error('Acesso autenticado obrigatorio para operar o Supabase RAG.')
  }

  const supabase = buildSupabaseClient(accessToken)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error(userError?.message || 'Sessao Supabase invalida.')
  }

  return {
    supabase,
    user,
  }
}

export async function assertAdminAccess(accessToken) {
  const { supabase, user } = await getAuthenticatedSupabaseContext(accessToken)
  const { data, error } = await supabase
    .from('profiles')
    .select('id, is_admin, full_name')
    .eq('id', user.id)
    .single()

  if (error) {
    throw new Error(`Falha ao validar admin: ${error.message}`)
  }

  if (!data?.is_admin) {
    throw new Error('Acesso restrito ao admin.')
  }

  return {
    supabase,
    user,
    profile: data,
  }
}

export async function loadAgentPromptConfig(accessToken) {
  if (!accessToken) return defaultAgentPromptConfig

  try {
    const { supabase } = await getAuthenticatedSupabaseContext(accessToken)
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'agent_prompt_config')
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data?.value) return defaultAgentPromptConfig

    const parsed = JSON.parse(data.value)
    return {
      ...defaultAgentPromptConfig,
      ...parsed,
    }
  } catch (error) {
    console.warn('Prompt config fallback:', error)
    return defaultAgentPromptConfig
  }
}

export async function saveAgentPromptConfig(accessToken, config) {
  const { supabase } = await assertAdminAccess(accessToken)
  const nextConfig = {
    ...defaultAgentPromptConfig,
    ...config,
  }

  const { error } = await supabase.from('system_settings').upsert({
    key: 'agent_prompt_config',
    value: JSON.stringify(nextConfig),
  })

  if (error) {
    throw new Error(`Falha ao salvar prompts: ${error.message}`)
  }

  return nextConfig
}

export async function searchAgentMemories({
  accessToken,
  queryEmbedding,
  agentKind,
  matchCount = 6,
}) {
  if (!accessToken || !Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
    return []
  }

  const supabase = buildSupabaseClient(accessToken)
  const { data, error } = await supabase.rpc('match_agent_memories', {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    filter_agent_kind: agentKind || null,
  })

  if (error) {
    throw new Error(`Supabase RAG search failed: ${error.message}`)
  }

  return data || []
}

export async function storeAgentMemory({
  accessToken,
  agentKind,
  title,
  content,
  metadata = {},
  embedding,
  visibility = 'private',
  sourceType = 'conversation',
  sourceName = null,
  documentId = null,
  chunkIndex = 0,
}) {
  if (!accessToken || !`${content || ''}`.trim() || !Array.isArray(embedding) || embedding.length === 0) {
    return {
      stored: false,
      reason: 'Missing access token, content or embedding.',
    }
  }

  const supabase = buildSupabaseClient(accessToken)
  const { data, error } = await supabase
    .from('agent_memories')
    .insert({
      agent_kind: agentKind,
      title: `${title || ''}`.trim() || null,
      content: `${content}`.trim(),
      metadata,
      embedding,
      visibility,
      source_type: sourceType,
      source_name: sourceName,
      document_id: documentId || undefined,
      chunk_index: chunkIndex,
    })
    .select('id, created_at, document_id')
    .single()

  if (error) {
    throw new Error(`Supabase RAG insert failed: ${error.message}`)
  }

  return {
    stored: true,
    memory: data,
  }
}

export async function listAgentMemories({
  accessToken,
  limit = 100,
  search = '',
  agentKind = '',
  visibility = '',
}) {
  const { supabase } = await assertAdminAccess(accessToken)
  let query = supabase
    .from('agent_memories')
    .select(
      'id, user_id, agent_kind, title, content, metadata, created_at, updated_at, visibility, source_type, source_name, chunk_index, document_id',
    )
    .order('created_at', { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 250))

  if (agentKind) query = query.eq('agent_kind', agentKind)
  if (visibility) query = query.eq('visibility', visibility)
  if (search.trim()) query = query.or(`title.ilike.%${search.trim()}%,content.ilike.%${search.trim()}%`)

  const { data, error } = await query
  if (error) {
    throw new Error(`Falha ao listar memorias: ${error.message}`)
  }

  return data || []
}

export async function deleteAgentMemoryById({ accessToken, id }) {
  const { supabase } = await assertAdminAccess(accessToken)
  const { error } = await supabase.from('agent_memories').delete().eq('id', id)
  if (error) {
    throw new Error(`Falha ao excluir memoria: ${error.message}`)
  }
  return { deleted: true }
}

export async function clearAgentMemories({ accessToken, agentKind = '', visibility = '', sourceType = '' }) {
  const { supabase } = await assertAdminAccess(accessToken)
  let query = supabase.from('agent_memories').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (agentKind) query = query.eq('agent_kind', agentKind)
  if (visibility) query = query.eq('visibility', visibility)
  if (sourceType) query = query.eq('source_type', sourceType)
  const { error, count } = await query.select('id', { count: 'exact', head: true })
  if (error) {
    throw new Error(`Falha ao limpar memorias: ${error.message}`)
  }
  return { deleted: count || 0 }
}

export async function loadMemoriesForReindex({ accessToken, ids = [], documentId = '', agentKind = '', sourceType = '' }) {
  const { supabase } = await assertAdminAccess(accessToken)
  let query = supabase
    .from('agent_memories')
    .select('id, title, content, metadata, agent_kind, source_name, source_type, visibility, document_id, chunk_index')

  if (ids.length > 0) query = query.in('id', ids)
  if (documentId) query = query.eq('document_id', documentId)
  if (agentKind) query = query.eq('agent_kind', agentKind)
  if (sourceType) query = query.eq('source_type', sourceType)

  const { data, error } = await query
  if (error) {
    throw new Error(`Falha ao carregar memorias para reindexacao: ${error.message}`)
  }

  return data || []
}

export async function updateAgentMemoryEmbedding({ accessToken, id, embedding, metadata = null }) {
  const { supabase } = await assertAdminAccess(accessToken)
  const payload = {
    embedding,
  }
  if (metadata) payload.metadata = metadata

  const { error } = await supabase.from('agent_memories').update(payload).eq('id', id)
  if (error) {
    throw new Error(`Falha ao atualizar embedding: ${error.message}`)
  }
}

import mammoth from 'mammoth'
import { supabase } from '@/lib/supabase/client'

export type AgentPromptConfig = {
  shared: string
  mentor: string
  roleplay: string
  mentorFeedback: string
}

export type AgentMemoryGuidance = {
  maxFilesPerBatch: number
  maxFileSizeMb: number
  recommendedPdfPages: number
  hardPdfPages: number
  recommendedCharactersPerText: number
  supportedExtensions: string[]
}

export type AgentMemoryRecord = {
  id: string
  user_id: string
  agent_kind: 'mentor' | 'roleplay' | 'mentor_feedback'
  title: string | null
  content: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  visibility: 'global' | 'private'
  source_type: 'conversation' | 'admin_text' | 'admin_upload'
  source_name: string | null
  chunk_index: number
  document_id: string
}

export type AgentPromptTarget = 'shared' | 'mentor' | 'roleplay' | 'mentorFeedback'
export type AgentKind = 'mentor' | 'roleplay' | 'mentor_feedback'

export type AgentInteractionRecord = {
  id: string
  user_id: string
  agent_kind: 'mentor' | 'roleplay' | 'mentor_feedback'
  title: string | null
  content: string
  metadata: Record<string, unknown>
  created_at: string
  document_id: string
  profile: {
    id: string
    full_name: string
    email: string
    avatar_url?: string | null
  } | null
}

const defaultPrompts: AgentPromptConfig = {
  shared: '',
  mentor: '',
  roleplay: '',
  mentorFeedback: '',
}

const hostedGuidance: AgentMemoryGuidance = {
  maxFilesPerBatch: 5,
  maxFileSizeMb: 10,
  recommendedPdfPages: 0,
  hardPdfPages: 0,
  recommendedCharactersPerText: 120000,
  supportedExtensions: ['.txt', '.md', '.docx'],
}

const normalizeWhitespace = (text = '') =>
  `${text || ''}`
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

const loadPromptConfig = async () => {
  const { data, error } = await supabase
    .from('system_settings' as any)
    .select('value')
    .eq('key', 'agent_prompt_config')
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data?.value) return defaultPrompts

  try {
    return {
      ...defaultPrompts,
      ...JSON.parse(data.value),
    } as AgentPromptConfig
  } catch {
    return defaultPrompts
  }
}

const savePromptConfig = async (prompts: AgentPromptConfig) => {
  const nextConfig = {
    ...defaultPrompts,
    ...prompts,
  }

  const { error } = await supabase.from('system_settings' as any).upsert({
    key: 'agent_prompt_config',
    value: JSON.stringify(nextConfig),
  })

  if (error) throw new Error(error.message)
  return nextConfig
}

const parseMemoryFile = async (file: File) => {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    return normalizeWhitespace(await file.text())
  }

  if (fileName.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return normalizeWhitespace(result.value)
  }

  throw new Error(
    'No modo Vercel com Supabase, o upload direto aceita .txt, .md e .docx. PDFs ficaram desativados com a remocao do backend local.',
  )
}

const invokeEdgeFunction = async <T>(name: string, body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke(name, {
    body,
  })

  if (error) {
    throw new Error(error.message || 'Erro na Edge Function do Supabase.')
  }

  return data as T
}

export const agentsAdminApi = {
  getConfig: async () => ({
    prompts: await loadPromptConfig(),
    guidance: hostedGuidance,
  }),
  saveConfig: async (prompts: AgentPromptConfig) => ({
    prompts: await savePromptConfig(prompts),
  }),
  getPromptField: async (target: AgentPromptTarget) => {
    const prompts = await loadPromptConfig()
    return {
      target,
      value: prompts[target] || '',
      prompts,
      guidance: hostedGuidance,
    }
  },
  savePromptField: async (target: AgentPromptTarget, value: string) => {
    const currentConfig = await loadPromptConfig()
    const prompts = await savePromptConfig({
      ...currentConfig,
      [target]: `${value || ''}`,
    })

    return {
      target,
      value: prompts[target] || '',
      prompts,
    }
  },
  listInteractions: async (params?: { search?: string; agentKind?: string; limit?: number }) => {
    let query = supabase
      .from('agent_memories' as any)
      .select('id, user_id, agent_kind, title, content, metadata, created_at, document_id')
      .eq('source_type', 'conversation')
      .order('created_at', { ascending: false })
      .limit(Math.min(Math.max(params?.limit || 60, 1), 200))

    if (params?.agentKind) query = query.eq('agent_kind', params.agentKind)
    if (params?.search?.trim()) {
      const search = params.search.trim()
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)

    const rows = (data || []) as Omit<AgentInteractionRecord, 'profile'>[]
    const userIds = [...new Set(rows.map((row) => row.user_id).filter(Boolean))]

    let profilesById: Record<string, AgentInteractionRecord['profile']> = {}
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles' as any)
        .select('id, full_name, email, avatar_url')
        .in('id', userIds)

      if (profilesError) throw new Error(profilesError.message)
      profilesById = Object.fromEntries((profiles || []).map((profile: any) => [profile.id, profile]))
    }

    return {
      interactions: rows.map((row) => ({
        ...row,
        profile: profilesById[row.user_id] || null,
      })),
    }
  },
  listMemories: async (params?: {
    search?: string
    agentKind?: string
    visibility?: string
    limit?: number
  }) => {
    let query = supabase
      .from('agent_memories' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Math.min(Math.max(params?.limit || 100, 1), 500))

    if (params?.agentKind) query = query.eq('agent_kind', params.agentKind)
    if (params?.visibility) query = query.eq('visibility', params.visibility)
    if (params?.search?.trim()) {
      const search = params.search.trim()
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)

    return {
      memories: (data || []) as AgentMemoryRecord[],
      guidance: hostedGuidance,
    }
  },
  deleteMemory: async (id: string) => {
    const { error } = await supabase.from('agent_memories' as any).delete().eq('id', id)
    if (error) throw new Error(error.message)
    return { deleted: true }
  },
  clearMemories: async (payload: { agentKind?: string; visibility?: string; sourceType?: string }) => {
    let query = supabase.from('agent_memories' as any).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (payload.agentKind) query = query.eq('agent_kind', payload.agentKind)
    if (payload.visibility) query = query.eq('visibility', payload.visibility)
    if (payload.sourceType) query = query.eq('source_type', payload.sourceType)
    const { error } = await query
    if (error) throw new Error(error.message)
    return { deleted: 0 }
  },
  reindexMemories: async () => {
    return { message: 'No modo Supabase, os embeddings sao gerados automaticamente ao importar memorias. Reindexacao manual nao e necessaria.' }
  },
  importTextMemory: (payload: {
    title: string
    content: string
    visibility: 'global' | 'private'
    agentKinds: AgentKind[]
  }) =>
    invokeEdgeFunction<{
      documentId: string
      storedChunks: number
      chunkCount: number
      agentKinds: AgentKind[]
      warnings: string[]
      stats: { charCount: number; pageCount: number | null; sizeMb: number | null; chunkCount: number }
      guidance: AgentMemoryGuidance
    }>('agent-memory-import', payload),
  importFileMemory: async (payload: {
    file: File
    title?: string
    visibility: 'global' | 'private'
    agentKinds: AgentKind[]
  }) => {
    const content = await parseMemoryFile(payload.file)
    return invokeEdgeFunction<{
      documentId: string
      storedChunks: number
      chunkCount: number
      agentKinds: AgentKind[]
      warnings: string[]
      stats: { charCount: number; pageCount: number | null; sizeMb: number | null; chunkCount: number }
      guidance: AgentMemoryGuidance
    }>('agent-memory-import', {
      title: payload.title || payload.file.name,
      content,
      visibility: payload.visibility,
      agentKinds: payload.agentKinds,
    })
  },
}

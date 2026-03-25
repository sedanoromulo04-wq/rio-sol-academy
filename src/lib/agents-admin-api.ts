import { supabase } from '@/lib/supabase/client'

const API_BASE = (import.meta.env.VITE_NOTEBOOKLM_API_URL || 'http://127.0.0.1:3002').replace(
  /\/$/,
  '',
)

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

type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string } }

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Falha ao converter o arquivo para base64.'))
        return
      }
      resolve(result.split(',')[1] || '')
    }
    reader.onerror = () => reject(reader.error || new Error('Falha ao ler o arquivo.'))
    reader.readAsDataURL(file)
  })

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token
        ? {
            Authorization: `Bearer ${session.access_token}`,
          }
        : {}),
      ...(init?.headers || {}),
    },
    ...init,
  })

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null
  if (!response.ok || !payload?.ok) {
    throw new Error(payload && 'error' in payload ? payload.error.message : 'Erro no backend dos agentes.')
  }

  return payload.data
}

export const agentsAdminApi = {
  getConfig: () =>
    request<{ prompts: AgentPromptConfig; guidance: AgentMemoryGuidance }>('/api/agents/config'),
  saveConfig: (prompts: AgentPromptConfig) =>
    request<{ prompts: AgentPromptConfig }>('/api/agents/config', {
      method: 'POST',
      body: JSON.stringify({ prompts }),
    }),
  listMemories: (params?: { search?: string; agentKind?: string; visibility?: string; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set('search', params.search)
    if (params?.agentKind) searchParams.set('agentKind', params.agentKind)
    if (params?.visibility) searchParams.set('visibility', params.visibility)
    if (params?.limit) searchParams.set('limit', String(params.limit))
    return request<{ memories: AgentMemoryRecord[]; guidance: AgentMemoryGuidance }>(
      `/api/agents/memories${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
    )
  },
  deleteMemory: (id: string) =>
    request<{ deleted: boolean }>(`/api/agents/memories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
  clearMemories: (payload: { agentKind?: string; visibility?: string; sourceType?: string }) =>
    request<{ deleted: number }>('/api/agents/memories/clear', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  reindexMemories: (payload: { ids?: string[]; documentId?: string; agentKind?: string; sourceType?: string }) =>
    request<{ reindexed: number }>('/api/agents/memories/reindex', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  importTextMemory: (payload: {
    title: string
    content: string
    visibility: 'global' | 'private'
    agentKinds: Array<'mentor' | 'roleplay' | 'mentor_feedback'>
  }) =>
    request<{
      documentId: string
      storedChunks: number
      chunkCount: number
      warnings: string[]
      stats: { charCount: number; pageCount: number | null; sizeMb: number | null; chunkCount: number }
      guidance: AgentMemoryGuidance
    }>('/api/agents/memories/import', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        sourceType: 'text',
      }),
    }),
  importFileMemory: async (payload: {
    file: File
    title?: string
    visibility: 'global' | 'private'
    agentKinds: Array<'mentor' | 'roleplay' | 'mentor_feedback'>
  }) => {
    const base64 = await fileToBase64(payload.file)
    return request<{
      documentId: string
      storedChunks: number
      chunkCount: number
      warnings: string[]
      stats: { charCount: number; pageCount: number | null; sizeMb: number | null; chunkCount: number }
      guidance: AgentMemoryGuidance
    }>('/api/agents/memories/import', {
      method: 'POST',
      body: JSON.stringify({
        sourceType: 'file',
        fileName: payload.file.name,
        title: payload.title || payload.file.name,
        base64,
        visibility: payload.visibility,
        agentKinds: payload.agentKinds,
      }),
    })
  },
}

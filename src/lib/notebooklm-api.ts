import { buildApiUrl, NOTEBOOKLM_ENABLED } from '@/lib/api-base'

const ensureNotebooklmEnabled = () => {
  if (!NOTEBOOKLM_ENABLED) {
    throw new Error('NotebookLM não está disponível em produção. Use o backend local para testar.')
  }
}

export type NotebookLMStatus = {
  authenticated: boolean
  storagePath: string
  notebookCount: number
  error?: {
    message: string
    requiresLogin?: boolean
  } | null
  gemini?: {
    hasApiKey: boolean
    embeddingModel: string
    embeddingDimension: number
    agentModel: string
  }
}

export type NotebookLMLiveNotebook = {
  id: string
  title: string
  createdAt: string | null
  sourceCount: number
  isOwner: boolean
}

export type NotebookLMLiveSource = {
  id: string
  title: string | null
  url: string | null
  kind: string
  status: number
  isReady: boolean
  createdAt?: string | null
  youtubeVideoId?: string | null
}

export type NotebookLMNotebookDetail = {
  notebook: NotebookLMLiveNotebook
  summary: string
  suggestedTopics: Array<{ question: string; prompt: string }>
  sources: NotebookLMLiveSource[]
  audioArtifacts: Array<{
    id: string
    title: string
    kind: string
    status: number
    url: string | null
    createdAt: string | null
  }>
}

export type NotebookLMPodcastResponse = {
  taskId: string
  status: string
  artifact: {
    id: string
    title: string
    kind: string
    status: number
    url: string | null
    createdAt: string | null
  } | null
}

export type NotebookLMSessionActionResult = {
  launched?: boolean
  pid?: number | null
  action?: string
  instructions?: string
}

export type NotebookLMPodcastJob = {
  id: string
  kind: string
  status: 'queued' | 'in_progress' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
  result: NotebookLMPodcastResponse | NotebookLMSessionActionResult | null
  error: { message: string } | null
}

export type NotebookLMChatReference = {
  sourceId: string
  sourceTitle: string | null
  citationNumber: number | null
  citedText: string | null
  startChar: number | null
  endChar: number | null
  chunkId: string | null
  url?: string | null
  kind?: string | null
  notebookTitle?: string | null
  score?: number | null
}

export type NotebookLMAskResponse = {
  answer: string
  conversationId: string
  turnNumber: number
  isFollowUp: boolean
  references: NotebookLMChatReference[]
  engine?: string
  fallbackReason?: string
}

type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string; type?: string } }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  })

  const payload = (await response.json()) as ApiEnvelope<T>
  if (!response.ok || !payload.ok) {
    const errorMsg = payload.ok ? 'NotebookLM backend unavailable.' : (payload as any).error?.message || 'NotebookLM error.'
    throw new Error(errorMsg)
  }

  return payload.data
}

export const notebooklmApi = {
  getStatus: () => {
    ensureNotebooklmEnabled()
    return request<NotebookLMStatus>('/api/notebooklm/status')
  },
  listNotebooks: async () => {
    ensureNotebooklmEnabled()
    const data = await request<{ notebooks: NotebookLMLiveNotebook[] }>('/api/notebooklm/notebooks')
    return data.notebooks
  },
  refreshSession: () => {
    ensureNotebooklmEnabled()
    return request<NotebookLMStatus>('/api/notebooklm/session/refresh', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },
  launchLoginSession: () => {
    ensureNotebooklmEnabled()
    return request<NotebookLMPodcastJob>('/api/notebooklm/session/login', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },
  getNotebook: (notebookId: string) => {
    ensureNotebooklmEnabled()
    return request<NotebookLMNotebookDetail>(
      `/api/notebooklm/notebooks/${encodeURIComponent(notebookId)}`,
    )
  },
  createPodcastJob: (payload: {
    notebookId: string
    title: string
    brief: string
    language?: string
  }) => {
    ensureNotebooklmEnabled()
    return request<NotebookLMPodcastJob>('/api/notebooklm/podcast', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  getJob: (jobId: string) => {
    ensureNotebooklmEnabled()
    return request<NotebookLMPodcastJob>(`/api/notebooklm/jobs/${encodeURIComponent(jobId)}`)
  },
  askNotebook: (payload: {
    notebookId: string
    question: string
    conversationId?: string
    sourceIds?: string[]
  }) => {
    ensureNotebooklmEnabled()
    return request<NotebookLMAskResponse>('/api/notebooklm/ask', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

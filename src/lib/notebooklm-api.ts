const API_BASE = (import.meta.env.VITE_NOTEBOOKLM_API_URL || 'http://127.0.0.1:3002').replace(
  /\/$/,
  '',
)

export type NotebookLMStatus = {
  authenticated: boolean
  storagePath: string
  notebookCount: number
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

export type NotebookLMPodcastJob = {
  id: string
  kind: string
  status: 'queued' | 'in_progress' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
  result: NotebookLMPodcastResponse | null
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
}

export type NotebookLMAskResponse = {
  answer: string
  conversationId: string
  turnNumber: number
  isFollowUp: boolean
  references: NotebookLMChatReference[]
}

type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string; type?: string } }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  })

  const payload = (await response.json()) as ApiEnvelope<T>
  if (!response.ok || !payload.ok) {
    throw new Error(
      payload.ok ? 'NotebookLM backend unavailable.' : payload.error.message || 'NotebookLM error.',
    )
  }

  return payload.data
}

export const notebooklmApi = {
  getStatus: () => request<NotebookLMStatus>('/api/notebooklm/status'),
  listNotebooks: async () => {
    const data = await request<{ notebooks: NotebookLMLiveNotebook[] }>('/api/notebooklm/notebooks')
    return data.notebooks
  },
  getNotebook: (notebookId: string) =>
    request<NotebookLMNotebookDetail>(`/api/notebooklm/notebooks/${encodeURIComponent(notebookId)}`),
  createPodcastJob: (payload: {
    notebookId: string
    title: string
    brief: string
    language?: string
  }) =>
    request<NotebookLMPodcastJob>('/api/notebooklm/podcast', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getJob: (jobId: string) =>
    request<NotebookLMPodcastJob>(`/api/notebooklm/jobs/${encodeURIComponent(jobId)}`),
  askNotebook: (payload: {
    notebookId: string
    question: string
    conversationId?: string
    sourceIds?: string[]
  }) =>
    request<NotebookLMAskResponse>('/api/notebooklm/ask', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}

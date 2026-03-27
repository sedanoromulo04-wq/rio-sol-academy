import { supabase } from '@/lib/supabase/client'
import { userStore } from '@/stores/useUserStore'

export type Message = {
  id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at?: string
}

type ChatRow = Message & {
  session_id: string
}

export type RoleplayEvaluation = {
  feedback: string
  score: number
  scores: {
    persuasao: number
    clareza: number
    empatia: number
    aderencia: number
  }
  nextAction: string
}

export type RoleplaySessionSummary = {
  sessionId: string
  personaId: string | null
  startedAt: string | null
  lastMessageAt: string | null
  preview: string
  messageCount: number
  feedbackCount: number
  averageScore: number
  lastScore: number | null
}

const ROLEPLAY_FEEDBACK_PREFIX = '__roleplay_feedback__:'

export const buildSimulatorSessionId = (personaId: string) => `simulator:${personaId}:${Date.now()}`

const parseRoleplayEvaluation = (content: string): RoleplayEvaluation | null => {
  if (!content.startsWith(ROLEPLAY_FEEDBACK_PREFIX)) return null
  try {
    return JSON.parse(content.slice(ROLEPLAY_FEEDBACK_PREFIX.length)) as RoleplayEvaluation
  } catch {
    return null
  }
}

const extractPersonaIdFromSession = (sessionId: string) => {
  if (sessionId.startsWith('simulator:')) {
    return sessionId.split(':')[1] || null
  }

  if (sessionId.startsWith('simulator-')) {
    return sessionId.replace('simulator-', '') || null
  }

  return null
}

const average = (values: number[]) => {
  if (!values.length) return 0
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

const postAgentRequest = async <T>(fn: string, body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke(fn, {
    body,
  })

  if (error) {
    throw new Error(error.message || 'Falha ao consultar o backend dos agentes no Supabase.')
  }

  return data as T
}

export const loadChatHistory = async (userId: string, sessionId: string) => {
  const { data, error } = await supabase
    .from('chats' as any)
    .select('*')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error loading chat history:', error)
    return []
  }
  return (data || []) as unknown as ChatRow[] as unknown as Message[]
}

export const loadSimulatorSessions = async (userId: string) => {
  const { data, error } = await supabase
    .from('chats' as any)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(600)

  if (error) {
    console.error('Error loading simulator sessions:', error)
    return [] as RoleplaySessionSummary[]
  }

  const grouped = new Map<string, ChatRow[]>()

  for (const row of (data || []) as unknown as ChatRow[]) {
    if (!row.session_id.startsWith('simulator')) continue
    const current = grouped.get(row.session_id) || []
    current.push(row)
    grouped.set(row.session_id, current)
  }

  return [...grouped.entries()]
    .map(([sessionId, rows]) => {
      const ordered = [...rows].sort(
        (left, right) =>
          new Date(left.created_at || 0).getTime() - new Date(right.created_at || 0).getTime(),
      )
      const visibleMessages = ordered.filter((message) => message.role !== 'system')
      const feedbacks = ordered
        .filter((message) => message.role === 'system')
        .map((message) => parseRoleplayEvaluation(message.content))
        .filter(Boolean) as RoleplayEvaluation[]

      return {
        sessionId,
        personaId: extractPersonaIdFromSession(sessionId),
        startedAt: ordered[0]?.created_at || null,
        lastMessageAt: ordered[ordered.length - 1]?.created_at || null,
        preview: visibleMessages.find((message) => message.role === 'assistant')?.content || '',
        messageCount: visibleMessages.length,
        feedbackCount: feedbacks.length,
        averageScore: average(feedbacks.map((item) => item.score)),
        lastScore: feedbacks[feedbacks.length - 1]?.score ?? null,
      } satisfies RoleplaySessionSummary
    })
    .sort(
      (left, right) =>
        new Date(right.lastMessageAt || 0).getTime() - new Date(left.lastMessageAt || 0).getTime(),
    )
}

export const loadLatestSimulatorSessionId = async (userId: string, personaId: string) => {
  const sessions = await loadSimulatorSessions(userId)
  return sessions.find((session) => session.personaId === personaId)?.sessionId || null
}

export const saveChatMessage = async (userId: string, sessionId: string, message: Message) => {
  const { data, error } = await supabase
    .from('chats' as any)
    .insert([
      { user_id: userId, session_id: sessionId, role: message.role, content: message.content },
    ])
    .select()
    .single()

  if (error) {
    console.error('Failed to save chat message:', error)
    return message
  }
  return data as unknown as Message
}

export const saveRoleplayEvaluationMessage = async (
  userId: string,
  sessionId: string,
  evaluation: RoleplayEvaluation,
) =>
  saveChatMessage(userId, sessionId, {
    role: 'system',
    content: `${ROLEPLAY_FEEDBACK_PREFIX}${JSON.stringify(evaluation)}`,
  })

export const saveRoleplayActivity = async (
  userId: string,
  sessionId: string,
  personaId: string,
  evaluation: RoleplayEvaluation,
) => {
  const { error } = await supabase.from('activities' as any).insert([
    {
      user_id: userId,
      activity_type: 'roleplay_feedback',
      score: evaluation.score,
      metadata: {
        sessionId,
        personaId,
        scores: evaluation.scores,
        nextAction: evaluation.nextAction,
      },
    },
  ])

  if (error) {
    console.error('Failed to save roleplay activity:', error)
  }
}

export const getVisibleChatMessages = (messages: Message[]) =>
  messages.filter((message) => message.role === 'user' || message.role === 'assistant')

export const getRoleplayEvaluationsFromMessages = (messages: Message[]) =>
  messages
    .filter((message) => message.role === 'system')
    .map((message) => parseRoleplayEvaluation(message.content))
    .filter(Boolean) as RoleplayEvaluation[]



export const sendMessageToMentor = async (messages: Message[]) => {
  const { profile, activities } = userStore.getSnapshot()
  const data = await postAgentRequest<{ reply: string }>('zenith-mentor', {
    messages,
    profile,
    activities,
  })

  return data.reply
}

export const simulateRoleplay = async (messages: Message[], persona: any) => {
  const data = await postAgentRequest<{ reply: string }>('simulator-roleplay', {
    messages,
    persona,
  })

  return data.reply
}

export const getMentorFeedback = async (messages: Message[], persona: any) => {
  const data = await postAgentRequest<{ reply: string; evaluation: RoleplayEvaluation }>(
    'mentor-feedback',
    {
      messages,
      userMessage: [...messages].reverse().find((message) => message.role === 'user')?.content || '',
      persona,
    },
  )

  return data
}

import { supabase } from '@/lib/supabase/client'
import { userStore } from '@/stores/useUserStore'

const API_BASE = (import.meta.env.VITE_NOTEBOOKLM_API_URL || 'http://127.0.0.1:3002').replace(
  /\/$/,
  '',
)

export type Message = {
  id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at?: string
}

const postAgentRequest = async <T>(path: string, body: Record<string, unknown>) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token
        ? {
            Authorization: `Bearer ${session.access_token}`,
          }
        : {}),
    },
    body: JSON.stringify({
      ...body,
      accessToken: session?.access_token || undefined,
    }),
  })

  const payload = (await response.json().catch(() => null)) as
    | { ok: true; data: T }
    | { ok: false; error: { message: string } }
    | null

  if (!response.ok || !payload?.ok) {
    throw new Error(payload && 'error' in payload ? payload.error.message : 'Falha ao consultar o backend local.')
  }

  return payload.data
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
  return (data || []) as Message[]
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
  return data as Message
}

export const sendMessageToMentor = async (messages: Message[]) => {
  const { profile, activities } = userStore.getSnapshot()
  const data = await postAgentRequest<{ reply: string }>('/api/agents/mentor', {
    messages,
    profile,
    activities,
  })

  return data.reply
}

export const simulateRoleplay = async (messages: Message[], persona: any) => {
  const data = await postAgentRequest<{ reply: string }>('/api/agents/roleplay', {
    messages,
    persona,
  })

  return data.reply
}

export const getMentorFeedback = async (userMessage: string, persona: any) => {
  const data = await postAgentRequest<{ reply: string }>('/api/agents/mentor-feedback', {
    userMessage,
    persona,
  })

  return data.reply
}

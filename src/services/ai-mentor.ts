import { supabase } from '@/lib/supabase/client'

export type Message = {
  id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at?: string
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
  const { data, error } = await supabase.functions.invoke('zenith-mentor', {
    body: { messages },
  })

  if (error) {
    console.error('Error invoking mentor function:', error)
    throw error
  }

  return data.reply
}

export const simulateRoleplay = async (messages: Message[], persona: any) => {
  const { data, error } = await supabase.functions.invoke('simulator-roleplay', {
    body: { messages, persona },
  })
  if (error) throw error
  return data.reply
}

export const getMentorFeedback = async (userMessage: string, persona: any) => {
  const prompt = `O aluno está simulando uma venda para o perfil: ${persona.name} (${persona.type}).\nA última mensagem do aluno na negociação foi: "${userMessage}".\nAtue como o Mentor Zenith e forneça um feedback pedagógico ultra rápido, direto e em um único parágrafo sobre essa abordagem. Se foi boa, valide a técnica. Se foi ruim ou ingênua, corrija de forma assertiva e dê uma sugestão de fala ("Tente dizer..."). Não responda a saudação, vá direto ao feedback.`

  const { data, error } = await supabase.functions.invoke('zenith-mentor', {
    body: { messages: [{ role: 'user', content: prompt }] },
  })
  if (error) throw error
  return data.reply
}

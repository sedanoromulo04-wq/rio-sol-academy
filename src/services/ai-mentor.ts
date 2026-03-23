import { supabase } from '@/lib/supabase/client'

export type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
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

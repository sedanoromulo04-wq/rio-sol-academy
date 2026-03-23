import { useSyncExternalStore } from 'react'
import { supabase } from '@/lib/supabase'

export type ContentItem = {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  category: string
}

const mockContent: ContentItem[] = [
  {
    id: 'c1',
    title: 'Filosofia & Ética Solar',
    description:
      'Mergulhe nas raízes filosóficas da transição energética. Entenda como a ética solar molda nossas interações comerciais e fortalece o propósito por trás de cada sistema.',
    video_url: 'https://youtube.com',
    thumbnail_url:
      'https://img.usecurling.com/p/600/400?q=solar%20architecture%20modern&color=blue',
    category: 'Cultura',
  },
  {
    id: 'c2',
    title: 'Engenharia Fotovoltaica Essencial',
    description:
      'Domine os princípios físicos e elétricos dos sistemas solares. De inversores string a microinversores, construa a base técnica necessária para dimensionar soluções.',
    video_url: 'https://youtube.com',
    thumbnail_url: 'https://img.usecurling.com/p/600/400?q=solar%20panels%20roof&color=black',
    category: 'Técnico',
  },
  {
    id: 'c3',
    title: 'A Arquitetura da Persuasão',
    description:
      'Desvende os gatilhos mentais e as heurísticas de decisão dos clientes. Aprenda a estruturar narrativas comerciais irrefutáveis e dominar a escuta ativa.',
    video_url: 'https://youtube.com',
    thumbnail_url:
      'https://img.usecurling.com/p/600/400?q=business%20meeting%20strategy&color=blue',
    category: 'Psicologia',
  },
]

let state = {
  content: mockContent,
}

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const adminStore = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  init: async () => {
    try {
      const { data } = await supabase.from('content').select('*')
      if (data && data.length > 0) {
        state.content = data
      } else {
        await supabase
          .from('content')
          .upsert(mockContent)
          .catch(() => {})
      }
      emit()
    } catch (e) {
      console.warn('Fallback to mock content data')
    }
  },
  saveContent: async (item: ContentItem) => {
    const isExisting = state.content.find((c) => c.id === item.id)
    if (isExisting) {
      state.content = state.content.map((c) => (c.id === item.id ? item : c))
    } else {
      state.content = [...state.content, item]
    }
    emit()
    try {
      await supabase.from('content').upsert([item])
    } catch (e) {}
  },
  deleteContent: async (id: string) => {
    state.content = state.content.filter((c) => c.id !== id)
    emit()
    try {
      await supabase.from('content').delete().eq('id', id)
    } catch (e) {}
  },
}

export default function useAdminStore() {
  return { ...useSyncExternalStore(adminStore.subscribe, adminStore.getSnapshot), ...adminStore }
}

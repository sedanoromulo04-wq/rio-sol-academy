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

export type Seller = {
  id: string
  name: string
  email: string
  avatar: string
}

export type UserProgress = {
  sellerId: string
  streakCount: number
  level: number
  totalXp: number
  overallProgress: number
  activities: Array<{ id: string; title: string; type: string; date: string; score: number }>
}

let state = {
  content: [] as ContentItem[],
  sellers: [] as Seller[],
  progress: [] as UserProgress[],
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
      const { data: contentData } = await supabase.from('content').select('*')
      if (contentData) state.content = contentData

      const { data: profiles } = await supabase.from('profiles').select('*')
      const { data: acts } = await supabase.from('activities').select('*')

      if (profiles) {
        state.sellers = profiles.map((p) => ({
          id: p.id,
          name: p.full_name || 'Usuário',
          email: p.email || '',
          avatar: `https://img.usecurling.com/ppl/medium?seed=${p.id}`,
        }))

        state.progress = profiles.map((p) => {
          const userActs = (acts || []).filter((a) => a.user_id === p.id)
          return {
            sellerId: p.id,
            streakCount: p.current_streak || 0,
            level: Math.floor((p.xp_total || 0) / 1000) + 1,
            totalXp: p.xp_total || 0,
            overallProgress: Math.min(100, Math.floor((p.xp_total || 0) / 100)),
            activities: userActs.map((a) => ({
              id: a.id,
              title: `Atividade: ${a.activity_type}`,
              type: a.activity_type,
              date: new Date(a.created_at).toLocaleDateString(),
              score: a.score || 0,
            })),
          }
        })
      }

      emit()
    } catch (e) {
      console.warn('Failed to load admin data', e)
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
    } catch (e) {
      console.warn('Failed to save content', e)
    }
  },
  deleteContent: async (id: string) => {
    state.content = state.content.filter((c) => c.id !== id)
    emit()
    try {
      await supabase.from('content').delete().eq('id', id)
    } catch (e) {
      console.warn('Failed to delete content', e)
    }
  },
}

export default function useAdminStore() {
  return { ...useSyncExternalStore(adminStore.subscribe, adminStore.getSnapshot), ...adminStore }
}

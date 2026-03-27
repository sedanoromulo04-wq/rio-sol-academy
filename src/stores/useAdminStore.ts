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
  loading: false,
  initialized: false,
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
    if (state.initialized || state.loading) return
    
    state = { ...state, loading: true }
    emit()

    try {
      const [{ data: contentData }, { data: profiles }, { data: acts }] = await Promise.all([
        supabase.from('content').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('activities').select('*'),
      ])

      let sellers: Seller[] = []
      let progress: UserProgress[] = []

      if (profiles) {
        sellers = profiles.map((p) => ({
          id: p.id,
          name: p.full_name || 'Usuário',
          email: p.email || '',
          avatar: `https://img.usecurling.com/ppl/medium?seed=${p.id}`,
        }))

        progress = profiles.map((p) => {
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

      state = {
        ...state,
        content: contentData || [],
        sellers,
        progress,
        loading: false,
        initialized: true
      }
      emit()
    } catch (e) {
      console.warn('Failed to load admin data', e)
      state = { ...state, loading: false }
      emit()
    }
  },
  saveContent: async (item: ContentItem) => {
    const isExisting = state.content.find((c) => c.id === item.id)
    state = {
      ...state,
      content: isExisting
        ? state.content.map((c) => (c.id === item.id ? item : c))
        : [...state.content, item]
    }
    emit()
    try {
      await supabase.from('content').upsert([item])
    } catch (e) {
      console.warn('Failed to save content', e)
    }
  },
  deleteContent: async (id: string) => {
    state = {
      ...state,
      content: state.content.filter((c) => c.id !== id)
    }
    emit()
    try {
      await supabase.from('content').delete().eq('id', id)
    } catch (e) {
      console.warn('Failed to delete content', e)
    }
  },
}

export default function useAdminStore() {
  const current = useSyncExternalStore(adminStore.subscribe, adminStore.getSnapshot)
  return { ...current, ...adminStore }
}

import { useSyncExternalStore } from 'react'
import { supabase } from '@/lib/supabase'

export type Profile = {
  id: string
  full_name: string
  email: string
  avatar_url?: string | null
  xp_total: number
  current_streak: number
  last_activity_date: string
  is_admin: boolean
}

export type Activity = {
  id: string
  user_id: string
  activity_type: string
  score: number | null
  created_at: string
  metadata?: any
}

let state = {
  profile: null as Profile | null,
  activities: [] as Activity[],
  loading: false,
  initialized: false,
}

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const userStore = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  init: async (userId: string) => {
    if (state.initialized || state.loading) return
    
    state = { ...state, loading: true }
    emit()

    try {
      const [{ data: p }, { data: a }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase
          .from('activities')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
      ])
      
      state = {
        ...state,
        profile: (p as Profile) || null,
        activities: (a as Activity[]) || [],
        loading: false,
        initialized: true
      }
      emit()
    } catch (e) {
      console.warn('Failed to load user profile data', e)
      state = { ...state, loading: false }
      emit()
    }
  },
  updateProfile: async (payload: Partial<Profile>) => {
    if (!state.profile) return

    const nextProfile = {
      ...state.profile,
      ...payload,
    }

    state = {
      ...state,
      profile: nextProfile,
    }
    emit()

    try {
      await supabase
        .from('profiles')
        .update({
          full_name: nextProfile.full_name,
        })
        .eq('id', nextProfile.id)
    } catch (error) {
      console.warn('Failed to update profile', error)
      await userStore.init(nextProfile.id)
    }
  },
  logActivity: async (type: string, score: number = 100) => {
    if (!state.profile) return
    const act: Activity = {
      id: crypto.randomUUID(),
      user_id: state.profile.id,
      activity_type: type,
      score,
      created_at: new Date().toISOString(),
    }

    const nextProfile = { ...state.profile }
    nextProfile.xp_total += score
    nextProfile.current_streak += 1
    nextProfile.last_activity_date = act.created_at

    state = { ...state, profile: nextProfile, activities: [act, ...state.activities] }
    emit()

    try {
      await supabase.from('activities').insert([act])
      await supabase
        .from('profiles')
        .update({
          xp_total: nextProfile.xp_total,
          current_streak: nextProfile.current_streak,
          last_activity_date: nextProfile.last_activity_date,
        })
        .eq('id', nextProfile.id)
    } catch (e) {
      console.warn('Failed to log activity', e)
    }
  },
}

export default function useUserStore() {
  const current = useSyncExternalStore(userStore.subscribe, userStore.getSnapshot)
  return { ...current, ...userStore }
}

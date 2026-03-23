import { useSyncExternalStore } from 'react'
import { supabase } from '@/lib/supabase'

export type Profile = {
  id: string
  full_name: string
  email: string
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
}

let state = {
  profile: null as Profile | null,
  activities: [] as Activity[],
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
    try {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (p) state.profile = p

      const { data: a } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (a) state.activities = a
      emit()
    } catch (e) {
      console.warn('Failed to load user profile data', e)
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
  return { ...useSyncExternalStore(userStore.subscribe, userStore.getSnapshot), ...userStore }
}

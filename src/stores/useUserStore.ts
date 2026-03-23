import { useSyncExternalStore } from 'react'
import { supabase } from '@/lib/supabase'

export type Profile = {
  id: string
  full_name: string
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

const mockProfile: Profile = {
  id: 'zenith-user-1',
  full_name: 'Zenith (Você)',
  xp_total: 12400,
  current_streak: 12,
  last_activity_date: new Date().toISOString(),
  is_admin: true,
}

let state = {
  profile: mockProfile,
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
  init: async () => {
    try {
      const { data: p } = await supabase.from('profiles').select('*').limit(1).single()
      if (p) state.profile = p
      else await supabase.from('profiles').upsert([mockProfile])

      const { data: a } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
      if (a) state.activities = a
      emit()
    } catch (e) {
      console.warn('Fallback to mock user profile data')
    }
  },
  logActivity: async (type: string, score: number = 100) => {
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
      await supabase.from('profiles').upsert([nextProfile])
    } catch (e) {}
  },
}

export default function useUserStore() {
  return { ...useSyncExternalStore(userStore.subscribe, userStore.getSnapshot), ...userStore }
}

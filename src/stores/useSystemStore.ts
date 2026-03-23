import { useSyncExternalStore } from 'react'
import { supabase } from '@/lib/supabase'

type SystemState = {
  isStreakModeGlobal: boolean
  weeklyFocus: string
}

let state: SystemState = {
  isStreakModeGlobal: true,
  weeklyFocus: 'Foco em resiliência e objeções financeiras. Apresentar o Payback corretamente.',
}

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const systemStore = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  init: async () => {
    try {
      const { data } = await supabase.from('system_settings').select('*')
      if (data && data.length > 0) {
        const streak = data.find((d) => d.key === 'streak_enabled')
        const focus = data.find((d) => d.key === 'weekly_focus')
        if (streak) state.isStreakModeGlobal = streak.value === 'true'
        if (focus) state.weeklyFocus = focus.value
        emit()
      }
    } catch (e) {
      console.warn('Fallback to local system settings due to Supabase connection error.')
    }
  },
  setStreakModeGlobal: async (val: boolean) => {
    state = { ...state, isStreakModeGlobal: val }
    emit()
    try {
      await supabase
        .from('system_settings')
        .upsert({ key: 'streak_enabled', value: val ? 'true' : 'false' })
    } catch (e) {}
  },
  setWeeklyFocus: async (val: string) => {
    state = { ...state, weeklyFocus: val }
    emit()
    try {
      await supabase.from('system_settings').upsert({ key: 'weekly_focus', value: val })
    } catch (e) {}
  },
}

export default function useSystemStore() {
  const current = useSyncExternalStore(systemStore.subscribe, systemStore.getSnapshot)
  return { ...current, ...systemStore }
}

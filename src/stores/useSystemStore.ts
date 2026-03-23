import { useSyncExternalStore } from 'react'

type SystemState = {
  isStreakModeGlobal: boolean
  weeklyFocus: string
  globalAlert: string
}

let state: SystemState = {
  isStreakModeGlobal: true,
  weeklyFocus:
    'Nesta semana, o foco principal é a resiliência em objeções financeiras e a correta apresentação do Payback de longo prazo.',
  globalAlert: '',
}

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const systemStore = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  setStreakModeGlobal: (val: boolean) => {
    state = { ...state, isStreakModeGlobal: val }
    emit()
  },
  setWeeklyFocus: (val: string) => {
    state = { ...state, weeklyFocus: val }
    emit()
  },
  setGlobalAlert: (val: string) => {
    state = { ...state, globalAlert: val }
    emit()
  },
}

export default function useSystemStore() {
  const current = useSyncExternalStore(systemStore.subscribe, systemStore.getSnapshot)
  return { ...current, ...systemStore }
}

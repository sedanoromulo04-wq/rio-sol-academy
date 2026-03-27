import { useSyncExternalStore } from 'react'
import { supabase } from '@/lib/supabase'

export type NotebookLMSilo = {
  id: string
  notebookId?: string | null
  title: string
  description: string
  sourceCount: number
  lane: string
  isVisible: boolean
}

export type NotebookLMSettings = {
  enabled: boolean
  userCanCreatePodcast: boolean
  silos: NotebookLMSilo[]
}

type SystemState = {
  isStreakModeGlobal: boolean
  weeklyFocus: string
  notebookLM: NotebookLMSettings
  loading: boolean
  initialized: boolean
}

const defaultNotebookLM: NotebookLMSettings = {
  enabled: true,
  userCanCreatePodcast: true,
  silos: [
    {
      id: 'silo-objections',
      notebookId: null,
      title: 'Objeções de venda solar',
      description: 'Argumentos e respostas aprovadas para conversas comerciais complexas.',
      sourceCount: 18,
      lane: 'Comercial',
      isVisible: true,
    },
    {
      id: 'silo-finance',
      notebookId: null,
      title: 'ROI, payback e financiamento',
      description: 'Base oficial para defender retorno financeiro e construção de proposta.',
      sourceCount: 11,
      lane: 'Financeiro',
      isVisible: true,
    },
    {
      id: 'silo-onboarding',
      notebookId: null,
      title: 'Onboarding técnico interno',
      description: 'Rotinas operacionais e procedimentos reservados para uso interno.',
      sourceCount: 9,
      lane: 'Operação',
      isVisible: false,
    },
  ],
}

let state: SystemState = {
  isStreakModeGlobal: true,
  weeklyFocus: 'Foco em resiliência e objeções financeiras. Apresentar o Payback corretamente.',
  notebookLM: defaultNotebookLM,
  loading: false,
  initialized: false,
}

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

const mergeNotebookLM = (raw?: Partial<NotebookLMSettings> | null): NotebookLMSettings => ({
  enabled: raw?.enabled ?? defaultNotebookLM.enabled,
  userCanCreatePodcast: raw?.userCanCreatePodcast ?? defaultNotebookLM.userCanCreatePodcast,
  silos:
    raw?.silos?.map((silo, index) => ({
      id: silo.id || `silo-${index + 1}`,
      notebookId: silo.notebookId || null,
      title: silo.title || 'Silo sem nome',
      description: silo.description || 'Base de conhecimento sem descrição.',
      sourceCount: Number.isFinite(silo.sourceCount) ? silo.sourceCount : 0,
      lane: silo.lane || 'Geral',
      isVisible: silo.isVisible ?? false,
    })) || defaultNotebookLM.silos,
})

const persistSetting = async (key: string, value: string) => {
  await supabase.from('system_settings').upsert({ key, value })
}

const persistNotebookLM = async () => {
  await persistSetting('notebooklm_config', JSON.stringify(state.notebookLM))
}

export const systemStore = {
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
      const { data } = await supabase.from('system_settings').select('*')
      let nextState = { ...state, loading: false, initialized: true }

      if (data && data.length > 0) {
        const streak = data.find((item) => item.key === 'streak_enabled')
        const focus = data.find((item) => item.key === 'weekly_focus')
        const notebookLM = data.find((item) => item.key === 'notebooklm_config')

        if (streak) nextState.isStreakModeGlobal = streak.value === 'true'
        if (focus) nextState.weeklyFocus = focus.value
        if (notebookLM?.value) {
          try {
            nextState.notebookLM = mergeNotebookLM(JSON.parse(notebookLM.value))
          } catch (error) {
            console.warn('Failed to parse NotebookLM settings, using defaults.', error)
          }
        }
      }
      state = nextState
      emit()
    } catch (error) {
      console.warn('Fallback to local system settings due to Supabase connection error.', error)
      state = { ...state, loading: false }
      emit()
    }
  },
  setStreakModeGlobal: async (value: boolean) => {
    state = { ...state, isStreakModeGlobal: value }
    emit()
    try {
      await persistSetting('streak_enabled', value ? 'true' : 'false')
    } catch (error) {
      console.warn('Failed to update streak settings', error)
    }
  },
  setWeeklyFocus: async (value: string) => {
    state = { ...state, weeklyFocus: value }
    emit()
    try {
      await persistSetting('weekly_focus', value)
    } catch (error) {
      console.warn('Failed to update weekly focus', error)
    }
  },
  setNotebookLMEnabled: async (value: boolean) => {
    state = { ...state, notebookLM: { ...state.notebookLM, enabled: value } }
    emit()
    try {
      await persistNotebookLM()
    } catch (error) {
      console.warn('Failed to update NotebookLM access settings', error)
    }
  },
  setNotebookLMPodcastEnabled: async (value: boolean) => {
    state = {
      ...state,
      notebookLM: { ...state.notebookLM, userCanCreatePodcast: value },
    }
    emit()
    try {
      await persistNotebookLM()
    } catch (error) {
      console.warn('Failed to update NotebookLM podcast settings', error)
    }
  },
  addNotebookLMSilo: async (payload: Omit<NotebookLMSilo, 'id'>) => {
    const silo: NotebookLMSilo = { id: crypto.randomUUID(), ...payload }
    state = {
      ...state,
      notebookLM: {
        ...state.notebookLM,
        silos: [silo, ...state.notebookLM.silos],
      },
    }
    emit()
    try {
      await persistNotebookLM()
    } catch (error) {
      console.warn('Failed to add NotebookLM silo', error)
    }
  },
  upsertNotebookLMSilo: async (payload: Omit<NotebookLMSilo, 'id'> & { id?: string }) => {
    const currentSilo = state.notebookLM.silos.find(
      (silo) =>
        (payload.id && silo.id === payload.id) ||
        (payload.notebookId && silo.notebookId === payload.notebookId),
    )
    const silo: NotebookLMSilo = {
      id: currentSilo?.id || payload.id || crypto.randomUUID(),
      notebookId: payload.notebookId || null,
      title: payload.title,
      description: payload.description,
      sourceCount: payload.sourceCount,
      lane: payload.lane,
      isVisible: payload.isVisible,
    }
    state = {
      ...state,
      notebookLM: {
        ...state.notebookLM,
        silos: currentSilo
          ? state.notebookLM.silos.map((item) => (item.id === currentSilo.id ? silo : item))
          : [silo, ...state.notebookLM.silos],
      },
    }
    emit()
    try {
      await persistNotebookLM()
    } catch (error) {
      console.warn('Failed to upsert NotebookLM silo', error)
    }
  },
  setNotebookLMSiloVisibility: async (id: string, isVisible: boolean) => {
    state = {
      ...state,
      notebookLM: {
        ...state.notebookLM,
        silos: state.notebookLM.silos.map((silo) =>
          silo.id === id ? { ...silo, isVisible } : silo,
        ),
      },
    }
    emit()
    try {
      await persistNotebookLM()
    } catch (error) {
      console.warn('Failed to update NotebookLM silo visibility', error)
    }
  },
  deleteNotebookLMSilo: async (id: string) => {
    state = {
      ...state,
      notebookLM: {
        ...state.notebookLM,
        silos: state.notebookLM.silos.filter((silo) => silo.id !== id),
      },
    }
    emit()
    try {
      await persistNotebookLM()
    } catch (error) {
      console.warn('Failed to delete NotebookLM silo', error)
    }
  },
  deleteNotebookLMSiloByNotebookId: async (notebookId: string) => {
    state = {
      ...state,
      notebookLM: {
        ...state.notebookLM,
        silos: state.notebookLM.silos.filter((silo) => silo.notebookId !== notebookId),
      },
    }
    emit()
    try {
      await persistNotebookLM()
    } catch (error) {
      console.warn('Failed to delete NotebookLM silo by notebook id', error)
    }
  },
}

export default function useSystemStore() {
  const current = useSyncExternalStore(systemStore.subscribe, systemStore.getSnapshot)
  return { ...current, ...systemStore }
}

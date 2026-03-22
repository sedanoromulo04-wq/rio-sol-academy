import { useSyncExternalStore } from 'react'

export type Resource = { id: string; name: string; type: 'pdf' | 'video' | 'link'; url: string }
export type Lesson = {
  id: string
  title: string
  description: string
  videoUrl: string
  resources: Resource[]
}
export type Module = { id: string; title: string; lessons: Lesson[] }
export type Track = {
  id: string
  title: string
  description: string
  image: string
  status: 'active' | 'draft'
  modules: Module[]
}

const initialData: Track[] = [
  {
    id: 't1',
    title: 'Filosofia & Ética Solar',
    description: 'Mergulhe nas raízes filosóficas da transição energética.',
    image: 'https://img.usecurling.com/p/600/400?q=solar%20architecture%20modern&color=blue',
    status: 'active',
    modules: [
      {
        id: 'm1',
        title: 'Módulo 1: Introdução',
        lessons: [
          {
            id: 'l1',
            title: 'Visão Geral',
            description: 'Bem vindo à academia.',
            videoUrl: 'https://youtube.com/...',
            resources: [],
          },
        ],
      },
    ],
  },
  {
    id: 't2',
    title: 'Engenharia Fotovoltaica',
    description: 'Domine os princípios físicos e elétricos dos sistemas solares.',
    image: 'https://img.usecurling.com/p/600/400?q=solar%20panels%20roof&color=black',
    status: 'draft',
    modules: [],
  },
]

let state = { tracks: initialData }
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())

export const adminStore = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  addTrack: (track: Track) => {
    state = { tracks: [...state.tracks, track] }
    emit()
  },
  updateTrack: (id: string, data: Partial<Track>) => {
    state = { tracks: state.tracks.map((t) => (t.id === id ? { ...t, ...data } : t)) }
    emit()
  },
  deleteTrack: (id: string) => {
    state = { tracks: state.tracks.filter((t) => t.id !== id) }
    emit()
  },
  addModule: (trackId: string, module: Module) => {
    state = {
      tracks: state.tracks.map((t) =>
        t.id === trackId ? { ...t, modules: [...t.modules, module] } : t,
      ),
    }
    emit()
  },
  updateModule: (trackId: string, moduleId: string, data: Partial<Module>) => {
    state = {
      tracks: state.tracks.map((t) =>
        t.id === trackId
          ? { ...t, modules: t.modules.map((m) => (m.id === moduleId ? { ...m, ...data } : m)) }
          : t,
      ),
    }
    emit()
  },
  deleteModule: (trackId: string, moduleId: string) => {
    state = {
      tracks: state.tracks.map((t) =>
        t.id === trackId ? { ...t, modules: t.modules.filter((m) => m.id !== moduleId) } : t,
      ),
    }
    emit()
  },
}

export default function useAdminStore() {
  const current = useSyncExternalStore(adminStore.subscribe, adminStore.getSnapshot)
  return { ...current, ...adminStore }
}

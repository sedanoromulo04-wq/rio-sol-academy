import { useSyncExternalStore } from 'react'

export type Resource = { id: string; name: string; type: 'pdf' | 'video' | 'link'; url: string }
export type Lesson = {
  id: string
  title: string
  description: string
  videoUrl: string
  category?: string
  difficulty?: string
  coverImage?: string
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

export type Seller = {
  id: string
  name: string
  email: string
  avatar: string
}

export type SellerTrackProgress = {
  trackId: string
  progress: number
  completedModules: string[]
  assessmentScore: number | null
  lastAccessed: string
}

export type CompletedActivity = {
  id: string
  type: 'Pílula de Conhecimento' | 'Exercício Prático' | 'Simulação de Roleplay'
  title: string
  date: string
  score: number
}

export type SellerProgressData = {
  sellerId: string
  overallProgress: number
  lastActivity: string
  streakCount: number
  level: number
  totalXp: number
  activities: CompletedActivity[]
  tracks: SellerTrackProgress[]
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
            category: 'Cultura',
            difficulty: 'Iniciante',
            coverImage: 'https://img.usecurling.com/p/600/400?q=solar%20panel&color=yellow',
            resources: [],
          },
        ],
      },
      {
        id: 'm2',
        title: 'Módulo 2: O Cliente',
        lessons: [],
      },
    ],
  },
  {
    id: 't2',
    title: 'Engenharia Fotovoltaica',
    description: 'Domine os princípios físicos e elétricos dos sistemas solares.',
    image: 'https://img.usecurling.com/p/600/400?q=solar%20panels%20roof&color=black',
    status: 'active',
    modules: [
      {
        id: 'm3',
        title: 'Módulo 1: Inversores',
        lessons: [],
      },
    ],
  },
]

const initialSellers: Seller[] = [
  {
    id: 's1',
    name: 'Julian Vesper',
    email: 'julian.v@riosol.com',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=44',
  },
  {
    id: 's2',
    name: 'Lara Kross',
    email: 'lara.k@riosol.com',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=55',
  },
  {
    id: 's3',
    name: 'Marcus Thorne',
    email: 'marcus.t@riosol.com',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=12',
  },
  {
    id: 's4',
    name: 'Elena Vance',
    email: 'elena.v@riosol.com',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=22',
  },
]

const initialProgress: SellerProgressData[] = [
  {
    sellerId: 's1',
    overallProgress: 65,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    streakCount: 15,
    level: 40,
    totalXp: 19800,
    activities: [
      {
        id: 'a1',
        type: 'Simulação de Roleplay',
        title: 'Negociação B2B',
        date: 'Hoje, 10:00',
        score: 95,
      },
      {
        id: 'a2',
        type: 'Exercício Prático',
        title: 'Cálculo de Demanda',
        date: 'Ontem, 15:30',
        score: 88,
      },
    ],
    tracks: [
      {
        trackId: 't1',
        progress: 100,
        completedModules: ['m1', 'm2'],
        assessmentScore: 92,
        lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
      {
        trackId: 't2',
        progress: 30,
        completedModules: [],
        assessmentScore: null,
        lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
    ],
  },
  {
    sellerId: 's2',
    overallProgress: 12,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    streakCount: 2,
    level: 39,
    totalXp: 18250,
    activities: [
      {
        id: 'a3',
        type: 'Pílula de Conhecimento',
        title: 'Microinversores',
        date: 'Semana Passada',
        score: 100,
      },
    ],
    tracks: [
      {
        trackId: 't1',
        progress: 24,
        completedModules: ['m1'],
        assessmentScore: null,
        lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
    ],
  },
  {
    sellerId: 's3',
    overallProgress: 90,
    lastActivity: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    streakCount: 42,
    level: 58,
    totalXp: 31200,
    activities: [
      {
        id: 'a4',
        type: 'Pílula de Conhecimento',
        title: 'Ética Solar',
        date: 'Hoje, 09:30',
        score: 100,
      },
      {
        id: 'a5',
        type: 'Simulação de Roleplay',
        title: 'Fechamento Rápido',
        date: 'Ontem, 14:00',
        score: 98,
      },
      {
        id: 'a6',
        type: 'Exercício Prático',
        title: 'Análise de Sombra',
        date: 'Ontem, 08:15',
        score: 94,
      },
    ],
    tracks: [
      {
        trackId: 't1',
        progress: 100,
        completedModules: ['m1', 'm2'],
        assessmentScore: 98,
        lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      },
      {
        trackId: 't2',
        progress: 80,
        completedModules: ['m3'],
        assessmentScore: 85,
        lastAccessed: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
    ],
  },
  {
    sellerId: 's4',
    overallProgress: 0,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    streakCount: 0,
    level: 42,
    totalXp: 24800,
    activities: [],
    tracks: [],
  },
]

let state = { tracks: initialData, sellers: initialSellers, progress: initialProgress }
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())

export const adminStore = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  addTrack: (track: Track) => {
    state = { ...state, tracks: [...state.tracks, track] }
    emit()
  },
  updateTrack: (id: string, data: Partial<Track>) => {
    state = { ...state, tracks: state.tracks.map((t) => (t.id === id ? { ...t, ...data } : t)) }
    emit()
  },
  deleteTrack: (id: string) => {
    state = { ...state, tracks: state.tracks.filter((t) => t.id !== id) }
    emit()
  },
  addModule: (trackId: string, module: Module) => {
    state = {
      ...state,
      tracks: state.tracks.map((t) =>
        t.id === trackId ? { ...t, modules: [...t.modules, module] } : t,
      ),
    }
    emit()
  },
  updateModule: (trackId: string, moduleId: string, data: Partial<Module>) => {
    state = {
      ...state,
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
      ...state,
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

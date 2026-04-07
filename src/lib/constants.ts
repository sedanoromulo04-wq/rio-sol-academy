import { Award, Zap, Settings2, Leaf, BrainCircuit } from 'lucide-react'

export const LEVEL_NAMES = [
  'Iniciante',
  'Consultor Júnior',
  'Consultor Pleno',
  'Consultor Sênior',
  'Arquiteto Solar',
] as const

export type LevelName = typeof LEVEL_NAMES[number]

export function getLevelNameByXp(xpTotal: number): LevelName {
  const levelIndex = Math.min(Math.floor(xpTotal / 1000), LEVEL_NAMES.length - 1)
  return LEVEL_NAMES[levelIndex]
}

export const FALLBACK_TRAILS = [
  {
    title: 'Cultura',
    desc: 'Ethos Solar & Valores de Engenharia',
    modules: '8/10 Módulos',
    progress: 75,
    tag: '',
  },
  {
    title: 'Técnico',
    desc: 'Sistemas Fotovoltaicos Avançados',
    modules: '15/36 Módulos',
    progress: 42,
    tag: '',
  },
  {
    title: 'Psicologia',
    desc: 'Protocolos de Liderança sob Alto Estresse',
    modules: 'Nível Mestre',
    progress: 90,
    tag: 'bg-slate-100 text-slate-600',
  },
  {
    title: 'Prática',
    desc: 'Implementação de Campo On-site',
    modules: 'Novo Desbloqueio',
    progress: 12,
    tag: 'bg-blue-50 text-blue-600',
  },
]

export const ACHIEVEMENTS = [
  { id: 'arquiteto_ouro', icon: Award, label: 'ARQUITETO OURO', bg: 'bg-[#EAB308]', color: 'text-white' },
  { id: 'prata_eco', icon: Zap, label: 'PRATA ECO', bg: 'bg-slate-700', color: 'text-white' },
  { id: 'mestre_bronze', icon: Settings2, label: 'MESTRE BRONZE', bg: 'bg-slate-300', color: 'text-slate-500' },
  { id: 'corredor_solar', icon: Leaf, label: 'CORREDOR SOLAR', bg: 'bg-[#061B3B]', color: 'text-[#EAB308]' },
  { id: 'link_neural_ia', icon: BrainCircuit, label: 'LINK NEURAL IA', bg: 'bg-[#061B3B]', color: 'text-cyan-400' },
]

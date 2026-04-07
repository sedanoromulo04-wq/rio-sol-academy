import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import useAdminStore from '@/stores/useAdminStore'
import useUserStore from '@/stores/useUserStore'
import {
  buildLearningProgressMap,
  buildContentAccessMap,
  filterContentForUser,
  formatDeadline,
  formatMinutes,
  getEstimatedMinutes,
  getModuleStatus,
  getTrackModules,
  getTrackProgressPercent,
} from '@/lib/learning'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Lock,
  Play,
  Sparkles,
  UserCircle,
  Cpu,
} from 'lucide-react'

const statusConfig = {
  locked: {
    label: 'Bloqueado',
    className: 'bg-slate-200 text-slate-600',
    description: 'Conclua e seja aprovado no modulo anterior para liberar este passo.',
  },
  available: {
    label: 'Disponivel',
    className: 'bg-blue-100 text-blue-700',
    description: 'Pronto para iniciar.',
  },
  in_progress: {
    label: 'Em andamento',
    className: 'bg-amber-100 text-amber-700',
    description: 'Modulo iniciado. O prazo ja esta correndo.',
  },
  awaiting_assessment: {
    label: 'Aguardando prova',
    className: 'bg-violet-100 text-violet-700',
    description: 'Conteudo assistido. Falta registrar a prova de conclusao.',
  },
  failed: {
    label: 'Reprovado',
    className: 'bg-rose-100 text-rose-700',
    description: 'Reforce o conteudo e tente novamente para desbloquear o proximo modulo.',
  },
  approved: {
    label: 'Aprovado',
    className: 'bg-emerald-100 text-emerald-700',
    description: 'Modulo concluido com aprovacao.',
  },
  overdue: {
    label: 'Atrasado',
    className: 'bg-red-100 text-red-700',
    description: 'O prazo estourou. Retome este modulo antes de seguir.',
  },
} as const

export default function Paths() {
  const { content } = useAdminStore()
  const { learningProgress, profile, userContentAccess } = useUserStore()
  const [searchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') || ''
  const searchQuery = (searchParams.get('q') || '').toLowerCase()

  const accessMap = useMemo(
    () => buildContentAccessMap(userContentAccess),
    [userContentAccess],
  )
  const filters = useMemo(() => {
    const scopedContent = filterContentForUser(content, profile?.specialty, accessMap)
    const categories = [...new Set(scopedContent.map((item) => item.category).filter(Boolean))]
    return ['Todas as Trilhas', ...categories]
  }, [accessMap, content, profile?.specialty])

  const [activeFilter, setActiveFilter] = useState(categoryParam || 'Todas as Trilhas')

  useEffect(() => {
    if (!categoryParam) {
      setActiveFilter('Todas as Trilhas')
      return
    }

    setActiveFilter(categoryParam)
  }, [categoryParam])

  const progressMap = useMemo(
    () => buildLearningProgressMap(learningProgress),
    [learningProgress],
  )

  const groupedTracks = useMemo(() => {
    const visibleContent = filterContentForUser(content, profile?.specialty, accessMap)
    const filteredContent = visibleContent.filter((item) => {
      if (activeFilter !== 'Todas as Trilhas' && item.category !== activeFilter) return false
      if (!searchQuery) return true

      const haystack = `${item.title} ${item.category} ${item.description || ''}`.toLowerCase()
      return haystack.includes(searchQuery)
    })

    const categories = [...new Set(filteredContent.map((item) => item.category))]
    return categories.map((category) => {
      const modules = getTrackModules(filteredContent, category)
      return {
        category,
        modules,
        progressPercent: getTrackProgressPercent(modules, progressMap),
      }
    })
  }, [accessMap, activeFilter, content, profile?.specialty, progressMap, searchQuery])

  const getIcon = (category: string) => {
    if (category === 'Cultura') return Sparkles
    if (category === 'Psicologia') return UserCircle
    return Cpu
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Badge className="bg-[#EAB308] text-[#061B3B] hover:bg-[#EAB308]/90 rounded-sm text-[9px] font-black px-2 py-0.5 tracking-widest border-none uppercase shadow-sm">
            Governanca de aprendizagem
          </Badge>
          <h1 className="text-3xl md:text-4xl font-black text-[#061B3B] tracking-tight font-display">
            Trilhas com progresso controlado
          </h1>
        </div>
        <p className="text-slate-500 text-sm md:text-base max-w-3xl leading-relaxed">
          Cada vendedor avanca em ordem. O proximo modulo so libera apos assistir o atual e
          atingir a nota minima da prova final.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
              Regra de liberacao
            </p>
            <p className="mt-2 text-sm text-[#061B3B] font-bold">
              Assistiu + foi aprovado = libera o proximo
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
              Prazo automatico
            </p>
            <p className="mt-2 text-sm text-[#061B3B] font-bold">
              Calculado pelo volume de videos, materiais e prova
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
              Criterio de desempenho
            </p>
            <p className="mt-2 text-sm text-[#061B3B] font-bold">
              Aprovado se nota final atingir o minimo definido no modulo
            </p>
          </div>
        </div>
      </div>

      {!profile?.specialty && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <p className="font-bold">Seu perfil ainda nao tem especialidade definida.</p>
          <p className="text-sm mt-1">
            Por enquanto voce ve apenas os conteudos gerais. Defina sua especialidade no perfil
            para liberar os modulos especificos da sua area.
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/50 p-2 rounded-2xl backdrop-blur-sm border border-slate-100">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={cn(
                'rounded-xl px-4 font-semibold transition-all text-xs',
                activeFilter === filter
                  ? 'bg-[#061B3B] hover:bg-[#0a2955] text-white border-none shadow-md'
                  : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-[#061B3B] bg-white',
              )}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {groupedTracks.length === 0 && (
        <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white p-10 text-center text-slate-500">
          Nenhum conteudo encontrado para esse filtro.
        </Card>
      )}

      <div className="space-y-8">
        {groupedTracks.map((track) => {
          const Icon = getIcon(track.category)

          return (
            <section key={track.category} className="space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#061B3B] text-[#EAB308] flex items-center justify-center shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#061B3B] font-display">
                      {track.category}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {track.modules.length} modulo{track.modules.length > 1 ? 's' : ''} nesta
                      trilha.
                    </p>
                  </div>
                </div>
                <div className="w-full lg:w-[320px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                    <span>Conclusao da trilha</span>
                    <span className="text-[#061B3B]">{track.progressPercent}%</span>
                  </div>
                  <Progress value={track.progressPercent} className="mt-3 h-2 bg-slate-100 [&>div]:bg-[#061B3B]" />
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {track.modules.map((item, index) => {
                  const status = getModuleStatus(item, track.modules, index, progressMap)
                  const statusInfo = statusConfig[status]
                  const progressRecord = progressMap.get(item.id)
                  const estimatedMinutes = getEstimatedMinutes(item)
                  const deadlineDays = Math.max(1, Math.ceil(estimatedMinutes / 40))
                  const isLocked = status === 'locked'
                  const isCompleted = status === 'approved'

                  return (
                    <Card
                      key={item.id}
                      className={cn(
                        'rounded-3xl border shadow-sm bg-white overflow-hidden',
                        isLocked && 'opacity-80',
                      )}
                    >
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={item.thumbnail_url}
                          className="absolute inset-0 h-full w-full object-cover"
                          alt={item.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#061B3B] via-[#061B3B]/60 to-transparent" />
                        <div className="absolute left-5 right-5 bottom-5 flex items-end justify-between gap-4">
                          <div>
                            <Badge className="mb-2 bg-white/10 border border-white/15 text-white">
                              Modulo {item.position}
                            </Badge>
                            <h3 className="text-xl font-black text-white font-display leading-tight">
                              {item.title}
                            </h3>
                          </div>
                          {isLocked ? (
                            <Lock className="w-5 h-5 text-white shrink-0" />
                          ) : isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                          ) : (
                            <Play className="w-5 h-5 text-[#EAB308] shrink-0" fill="currentColor" />
                          )}
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge className={cn('border-none', statusInfo.className)}>
                            {statusInfo.label}
                          </Badge>
                          <Badge variant="outline" className="border-slate-200 text-slate-600">
                            {item.audience_scope === 'all'
                              ? 'Conteudo geral'
                              : `Especialidade: ${item.target_specialties.join(', ')}`}
                          </Badge>
                          <Badge variant="outline" className="border-slate-200 text-slate-600">
                            {formatMinutes(estimatedMinutes)}
                          </Badge>
                          <Badge variant="outline" className="border-slate-200 text-slate-600">
                            {formatDeadline(deadlineDays)}
                          </Badge>
                          <Badge variant="outline" className="border-slate-200 text-slate-600">
                            Nota minima {item.passing_score}%
                          </Badge>
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                        <p className="text-xs text-slate-500">{statusInfo.description}</p>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-slate-400 uppercase tracking-widest font-black text-[10px]">
                              Estrutura
                            </p>
                            <p className="mt-1 text-[#061B3B] font-bold">
                              {item.video_count} videos e {item.material_count} materiais
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-slate-400 uppercase tracking-widest font-black text-[10px]">
                              Prova
                            </p>
                            <p className="mt-1 text-[#061B3B] font-bold">
                              {item.assessment_question_count} questoes objetivas
                            </p>
                          </div>
                        </div>

                        {progressRecord?.due_at && !progressRecord.completed_at && (
                          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                            <div className="flex items-center gap-2 font-semibold">
                              <Clock3 className="w-4 h-4" />
                              Prazo atual: {new Date(progressRecord.due_at).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        )}

                        {status === 'failed' && (
                          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                            <div className="flex items-center gap-2 font-semibold">
                              <AlertTriangle className="w-4 h-4" />
                              Revise o conteudo e refaca a prova. O proximo modulo segue bloqueado.
                            </div>
                          </div>
                        )}

                        {isLocked ? (
                          <Button
                            disabled
                            className="w-full rounded-xl bg-slate-200 text-slate-500 hover:bg-slate-200"
                          >
                            Liberacao progressiva ativa
                          </Button>
                        ) : (
                          <Button
                            asChild
                            className="w-full bg-[#061B3B] hover:bg-[#0a2955] text-white h-11 text-sm rounded-xl font-bold tracking-wide shadow-md"
                          >
                            <Link to={`/trilhas/${item.id}/lesson/${item.position}`}>
                              {isCompleted ? 'Revisar modulo' : 'Abrir modulo'}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

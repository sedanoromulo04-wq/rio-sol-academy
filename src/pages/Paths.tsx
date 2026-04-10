import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import useAdminStore from '@/stores/useAdminStore'
import useUserStore from '@/stores/useUserStore'
import {
  buildContentAccessMap,
  buildLearningProgressMap,
  filterContentForUser,
  getModuleStatus,
  getTrackModules,
} from '@/lib/learning'
import { buildYouTubeThumbnailUrl, extractYouTubeVideoId } from '@/lib/youtube'
import { Cpu, Lock, Play, Sparkles, UserCircle } from 'lucide-react'

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
  const progressMap = useMemo(
    () => buildLearningProgressMap(learningProgress),
    [learningProgress],
  )
  const visibleContent = useMemo(
    () => filterContentForUser(content, profile?.specialty, accessMap),
    [accessMap, content, profile?.specialty],
  )
  const filters = useMemo(() => {
    const categories = [...new Set(visibleContent.map((item) => item.category).filter(Boolean))]
    return ['Todas as Trilhas', ...categories]
  }, [visibleContent])

  const [activeFilter, setActiveFilter] = useState(categoryParam || 'Todas as Trilhas')

  useEffect(() => {
    if (!categoryParam) {
      setActiveFilter('Todas as Trilhas')
      return
    }

    setActiveFilter(categoryParam)
  }, [categoryParam])

  const trackModulesMap = useMemo(() => {
    const entries = filters
      .filter((filter) => filter !== 'Todas as Trilhas')
      .map((category) => [category, getTrackModules(visibleContent, category)] as const)

    return new Map(entries)
  }, [filters, visibleContent])

  const filteredContent = useMemo(
    () =>
      visibleContent.filter((item) => {
        if (activeFilter !== 'Todas as Trilhas' && item.category !== activeFilter) return false
        if (!searchQuery) return true

        const haystack = `${item.title} ${item.category} ${item.description || ''}`.toLowerCase()
        return haystack.includes(searchQuery)
      }),
    [activeFilter, searchQuery, visibleContent],
  )

  const getIcon = (category: string) => {
    if (category === 'Cultura') return Sparkles
    if (category === 'Psicologia') return UserCircle
    return Cpu
  }

  const getStatusLabel = (status: ReturnType<typeof getModuleStatus>) => {
    if (status === 'locked') return 'Bloqueado'
    if (status === 'approved') return 'Concluido'
    if (status === 'in_progress') return 'Em andamento'
    if (status === 'awaiting_assessment') return 'Aguardando prova'
    if (status === 'failed') return 'Refazer prova'
    if (status === 'overdue') return 'Atrasado'
    return 'Disponivel'
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Badge className="bg-[#EAB308] text-[#061B3B] hover:bg-[#EAB308]/90 rounded-sm text-[9px] font-black px-2 py-0.5 tracking-widest border-none uppercase shadow-sm">
            Sistema de Biblioteca
          </Badge>
          <h1 className="text-3xl md:text-4xl font-black text-[#061B3B] tracking-tight font-display">
            Painel de conteúdos
          </h1>
        </div>
        <p className="text-slate-500 text-sm md:text-base max-w-2xl leading-relaxed">
          Acesse os módulos da RIO SOL em um formato mais direto, visual e fácil de navegar.
        </p>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {filteredContent.length === 0 && (
          <p className="text-slate-500 col-span-full py-10 text-center">
            Nenhum conteúdo encontrado.
          </p>
        )}

        {filteredContent.map((item) => {
          const Icon = getIcon(item.category)
          const trackModules = trackModulesMap.get(item.category) || []
          const currentIndex = trackModules.findIndex((trackItem) => trackItem.id === item.id)
          const status =
            currentIndex >= 0
              ? getModuleStatus(item, trackModules, currentIndex, progressMap)
              : 'available'
          const isLocked = status === 'locked'
          const imageSrc =
            item.thumbnail_url ||
            buildYouTubeThumbnailUrl(item.youtube_video_id || extractYouTubeVideoId(item.video_url))

          return (
            <Card
              key={item.id}
              className="rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col bg-white overflow-hidden group h-[420px]"
            >
              <div className="relative h-48 w-full overflow-hidden shrink-0">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={item.title}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#061B3B] via-[#061B3B]/60 to-transparent" />
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-[#EAB308] flex items-center justify-center shadow-lg">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="bg-black/30 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {item.category}
                  </span>
                </div>
                <div className="absolute bottom-4 left-5 right-5 z-10">
                  <h3 className="text-xl font-black text-white leading-tight font-display drop-shadow-md">
                    {item.title}
                  </h3>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between bg-white relative">
                <div className="space-y-3">
                  <p className="text-slate-600 text-sm leading-relaxed font-medium line-clamp-3">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'border-slate-200',
                        isLocked ? 'text-slate-500' : 'text-[#061B3B]',
                      )}
                    >
                      Modulo {item.position}
                    </Badge>
                    <Badge
                      className={cn(
                        'border-none',
                        isLocked
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-[#061B3B]/10 text-[#061B3B]',
                      )}
                    >
                      {getStatusLabel(status)}
                    </Badge>
                  </div>
                </div>

                {isLocked ? (
                  <Button
                    disabled
                    className="w-full bg-slate-200 text-slate-500 h-11 text-sm rounded-xl font-bold tracking-wide mt-4"
                  >
                    <Lock className="w-4 h-4 mr-2" /> Módulo bloqueado
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="w-full bg-[#061B3B] hover:bg-[#0a2955] text-white h-11 text-sm rounded-xl font-bold tracking-wide shadow-md transition-all hover:shadow-lg mt-4"
                  >
                    <Link to={`/trilhas/${item.id}/lesson/${item.position}`}>
                      <Play className="w-4 h-4 mr-2" fill="currentColor" />
                      {status === 'approved' ? 'Revisar Conteúdo' : 'Acessar Conteúdo'}
                    </Link>
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

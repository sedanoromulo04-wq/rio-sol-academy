import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import useAdminStore from '@/stores/useAdminStore'
import useUserStore from '@/stores/useUserStore'
import { cn } from '@/lib/utils'
import {
  buildContentAccessMap,
  buildLearningProgressMap,
  filterContentForUser,
  formatMinutes,
  getAssessmentQuestionCount,
  getEstimatedMinutes,
  getModuleStatus,
  getTrackModules,
  isModuleApproved,
} from '@/lib/learning'
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  MessageSquare,
  Play,
  Sparkles,
  Target,
} from 'lucide-react'
import { buildYouTubeThumbnailUrl, extractYouTubeVideoId } from '@/lib/youtube'

export default function Lesson() {
  const { id, lessonId } = useParams()
  const { content } = useAdminStore()
  const {
    learningProgress,
    profile,
    userContentAccess,
    startModule,
    markModuleWatched,
    submitAssessment,
  } = useUserStore()
  const { toast } = useToast()
  const [correctAnswers, setCorrectAnswers] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)

  const accessMap = useMemo(
    () => buildContentAccessMap(userContentAccess),
    [userContentAccess],
  )
  const visibleContent = useMemo(
    () => filterContentForUser(content, profile?.specialty, accessMap),
    [accessMap, content, profile?.specialty],
  )

  const module = visibleContent.find((item) => item.id === id)
  const progressMap = useMemo(
    () => buildLearningProgressMap(learningProgress),
    [learningProgress],
  )
  const trackModules = useMemo(
    () => (module ? getTrackModules(visibleContent, module.category) : []),
    [module, visibleContent],
  )
  const currentIndex = useMemo(
    () => trackModules.findIndex((item) => item.id === module?.id),
    [module, trackModules],
  )

  const progressRecord = module ? progressMap.get(module.id) : null
  const status =
    module && currentIndex >= 0
      ? getModuleStatus(module, trackModules, currentIndex, progressMap)
      : 'locked'
  const assessmentQuestionCount = module ? getAssessmentQuestionCount(module) : 0
  const estimatedMinutes = module ? getEstimatedMinutes(module) : 0
  const activeYouTubeId = useMemo(
    () => module?.youtube_video_id || (module?.video_url ? extractYouTubeVideoId(module.video_url) : null),
    [module],
  )
  const coverImage = useMemo(
    () =>
      module?.thumbnail_url ||
      buildYouTubeThumbnailUrl(activeYouTubeId) ||
      '',
    [activeYouTubeId, module?.thumbnail_url],
  )

  const groupedCourseContent = useMemo(() => {
    const categories = [...new Set(visibleContent.map((item) => item.category).filter(Boolean))]
    return categories.map((category) => ({
      category,
      modules: getTrackModules(visibleContent, category),
    }))
  }, [visibleContent])

  const approvedModulesCount = useMemo(
    () => visibleContent.filter((item) => isModuleApproved(item, progressMap.get(item.id))).length,
    [progressMap, visibleContent],
  )
  const totalModulesCount = visibleContent.length
  const progressPercent = totalModulesCount
    ? Math.round((approvedModulesCount / totalModulesCount) * 100)
    : 0

  const overviewText = module?.summary_text?.trim() || module?.description?.trim() || ''
  const transcriptText = module?.transcript_text?.trim() || ''
  const mindMapText = module?.mind_map_markdown?.trim() || ''
  const hasMaterials = Boolean(transcriptText || mindMapText)
  const hasAssessmentSuggestions = Boolean(module?.assessment_suggestions?.length)

  useEffect(() => {
    if (!module || status === 'locked' || progressRecord?.started_at) return
    startModule(module)
  }, [module, progressRecord?.started_at, startModule, status])

  useEffect(() => {
    setIsPlaying(false)
  }, [module?.id])

  useEffect(() => {
    if (!module) return
    if (progressRecord?.assessment_score === null || progressRecord?.assessment_score === undefined) {
      return
    }

    const equivalentHits = Math.round(
      (progressRecord.assessment_score / 100) * getAssessmentQuestionCount(module),
    )
    setCorrectAnswers(String(equivalentHits))
  }, [module, progressRecord?.assessment_score])

  if (!module) return <Navigate to="/trilhas" replace />

  if (status === 'locked') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up pb-16">
        <Link
          to="/trilhas"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Voltar para Trilhas
        </Link>

        <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-[#061B3B] font-display">
              Módulo bloqueado pela progressão
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto">
              Conclua e seja aprovado no módulo anterior para liberar este conteúdo.
            </p>
            <Button asChild className="bg-[#061B3B] hover:bg-[#0a2955] text-white rounded-xl">
              <Link to="/trilhas">Ver trilhas liberadas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handlePlay = () => {
    if (activeYouTubeId) {
      setIsPlaying(true)
      return
    }

    if (module.video_url) {
      window.open(module.video_url, '_blank', 'noopener,noreferrer')
      return
    }

    toast({
      variant: 'destructive',
      title: 'Vídeo indisponível',
      description: 'Não encontramos um link de vídeo válido para este módulo.',
    })
  }

  const handleMarkWatched = async () => {
    const result = await markModuleWatched(module)
    if (!result) {
      toast({
        variant: 'destructive',
        title: 'Falha ao registrar',
        description: 'Não foi possível confirmar o conteúdo como assistido.',
      })
      return
    }

    toast({
      title: 'Conteúdo registrado',
      description: 'A prova de conclusão foi liberada para este módulo.',
    })
  }

  const handleSubmitAssessment = async () => {
    const parsedCorrectAnswers = Number(correctAnswers)
    if (Number.isNaN(parsedCorrectAnswers) || parsedCorrectAnswers < 0) {
      toast({
        variant: 'destructive',
        title: 'Valor inválido',
        description: 'Informe quantos acertos você teve na prova final.',
      })
      return
    }

    if (!progressRecord?.watched_at) {
      toast({
        variant: 'destructive',
        title: 'Conteúdo ainda não concluído',
        description: 'Marque o módulo como concluído antes de registrar a prova.',
      })
      return
    }

    const result = await submitAssessment(
      module,
      Math.min(assessmentQuestionCount, parsedCorrectAnswers),
    )

    if (!result) {
      toast({
        variant: 'destructive',
        title: 'Falha na prova',
        description: 'Não foi possível registrar o resultado da prova.',
      })
      return
    }

    toast({
      title: result.assessment_status === 'passed' ? 'Módulo aprovado' : 'Módulo reprovado',
      description:
        result.assessment_status === 'passed'
          ? 'O próximo conteúdo liberado já pode ser acessado.'
          : 'Revise o conteúdo e tente novamente.',
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up pb-16">
      <Link
        to="/trilhas"
        className="inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Voltar para Trilhas
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-[#061B3B] font-display leading-tight">
              {module.title?.trim() || 'Aula sem título'}
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Trilhas</span>
              <span>&gt;</span>
              <span>{module.category}</span>
            </div>
          </div>

          <div className="rounded-[2rem] overflow-hidden border border-slate-200 bg-white shadow-sm">
            <AspectRatio ratio={16 / 9} className="relative bg-[#061B3B]">
              {isPlaying && activeYouTubeId ? (
                <iframe
                  title={`Vídeo da aula ${module.title}`}
                  src={`https://www.youtube-nocookie.com/embed/${activeYouTubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="absolute inset-0 w-full h-full border-0"
                />
              ) : (
                <>
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={module.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0d274f] via-[#123767] to-[#1b4c88]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061B3B]/75 via-[#061B3B]/25 to-transparent" />
                  <button
                    onClick={handlePlay}
                    className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#F4C20D] text-[#061B3B] shadow-xl transition-transform hover:scale-105"
                  >
                    <Play className="ml-1 h-7 w-7" fill="currentColor" />
                  </button>
                </>
              )}
            </AspectRatio>
          </div>

          <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Badge className="w-fit rounded-full bg-slate-100 text-[#061B3B] border-none px-4 py-1.5 text-xs font-black uppercase tracking-wide">
                Aula {lessonId || module.position}
              </Badge>

              <Button
                onClick={handleMarkWatched}
                variant={progressRecord?.watched_at ? 'outline' : 'default'}
                className={
                  progressRecord?.watched_at
                    ? 'rounded-xl border-slate-200 text-[#061B3B]'
                    : 'rounded-xl bg-[#061B3B] hover:bg-[#0a2955] text-white'
                }
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {progressRecord?.watched_at ? 'Marcar como Concluída' : 'Marcar como Concluída'}
              </Button>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full flex flex-wrap justify-start rounded-[1.5rem] border border-slate-200 bg-white p-2 h-auto shadow-sm">
              <TabsTrigger value="overview" className="rounded-xl px-4 py-2 data-[state=active]:bg-[#061B3B] data-[state=active]:text-white">
                <FileText className="w-4 h-4 mr-2" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="materials" className="rounded-xl px-4 py-2 data-[state=active]:bg-[#061B3B] data-[state=active]:text-white">
                Materiais
              </TabsTrigger>
              <TabsTrigger value="comments" className="rounded-xl px-4 py-2 data-[state=active]:bg-[#061B3B] data-[state=active]:text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                Comentários
              </TabsTrigger>
              <TabsTrigger value="quiz" className="rounded-xl px-4 py-2 data-[state=active]:bg-[#061B3B] data-[state=active]:text-white">
                Quiz
              </TabsTrigger>
              <TabsTrigger value="practice" className="rounded-xl px-4 py-2 data-[state=active]:bg-[#061B3B] data-[state=active]:text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                Prática IA
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <CardContent className="p-8 space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-slate-200 text-slate-600">
                      {formatMinutes(estimatedMinutes)}
                    </Badge>
                    <Badge variant="outline" className="border-slate-200 text-slate-600">
                      {module.video_count} vídeo{module.video_count > 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="outline" className="border-slate-200 text-slate-600">
                      {module.material_count} material{module.material_count > 1 ? 'is' : ''}
                    </Badge>
                    <Badge variant="outline" className="border-slate-200 text-slate-600">
                      Nota mínima {module.passing_score}%
                    </Badge>
                  </div>

                  <div className="space-y-3 text-slate-600 leading-relaxed">
                    {overviewText ? (
                      <p>{overviewText}</p>
                    ) : (
                      <p>Nenhum resumo cadastrado para esta aula.</p>
                    )}
                  </div>

                  {!activeYouTubeId && module.video_url && (
                    <>
                      <Separator />
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        Este conteúdo usa um link externo. O botão de play abre o vídeo em uma nova aba.
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materials" className="mt-6">
              <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <CardContent className="p-8 space-y-6">
                  {hasMaterials ? (
                    <>
                      {transcriptText && (
                        <div className="space-y-2">
                          <h3 className="text-lg font-black text-[#061B3B]">Transcrição</h3>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                            {transcriptText}
                          </p>
                        </div>
                      )}

                      {mindMapText && (
                        <div className="space-y-2">
                          <h3 className="text-lg font-black text-[#061B3B]">Mapa mental</h3>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                            {mindMapText}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-slate-500">Nenhum material complementar cadastrado para esta aula.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
              <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <CardContent className="p-8">
                  <p className="text-slate-500">
                    A área de comentários ainda não foi ativada nesta versão. Posso integrar isso depois sem mexer no layout.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quiz" className="mt-6">
              <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-[#061B3B] font-display">
                      Quiz de conclusão
                    </h3>
                    <p className="text-slate-600">
                      Informe quantos acertos você teve para que o sistema registre sua aprovação.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#061B3B]">
                        Acertos na prova ({assessmentQuestionCount} questões)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={assessmentQuestionCount}
                        value={correctAnswers}
                        onChange={(event) => setCorrectAnswers(event.target.value)}
                        className="bg-slate-50 border-slate-200 text-[#061B3B]"
                      />
                    </div>

                    <Button
                      onClick={handleSubmitAssessment}
                      className="bg-[#061B3B] hover:bg-[#0a2955] text-white rounded-xl h-11 px-6"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Registrar Quiz
                    </Button>
                  </div>

                  {progressRecord?.assessment_score !== null &&
                    progressRecord?.assessment_score !== undefined && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-[#061B3B]">Resultado atual</p>
                          <p className="text-sm text-slate-500">
                            Tentativas: {progressRecord.attempts_count}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-black text-[#061B3B]">
                            {progressRecord.assessment_score}%
                          </p>
                          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                            {progressRecord.assessment_status === 'passed' ? 'Aprovado' : 'Reprovado'}
                          </p>
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="practice" className="mt-6">
              <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-[#061B3B] font-display">
                      Prática IA
                    </h3>
                    <p className="text-slate-600">
                      Use o laboratório de roleplay para treinar objeções e argumentação com o conteúdo desta aula.
                    </p>
                  </div>

                  {hasAssessmentSuggestions && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-[#061B3B]">
                        Sugestões geradas para revisão
                      </p>
                      <div className="space-y-2">
                        {module.assessment_suggestions.map((suggestion, index) => (
                          <div
                            key={`${index}-${suggestion}`}
                            className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600"
                          >
                            {index + 1}. {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button asChild className="rounded-xl bg-[#061B3B] hover:bg-[#0a2955] text-white">
                    <Link to="/simulador">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Abrir laboratório de roleplay
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-8 border-slate-100">
                <div className="absolute inset-0 rounded-full border-[6px] border-[#061B3B]/10 border-t-[#061B3B]" />
                <span className="text-sm font-black text-[#061B3B]">{progressPercent}%</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#061B3B] font-display">Meu Progresso</h3>
                <p className="text-slate-500">
                  {approvedModulesCount} de {totalModulesCount} aulas concluídas
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="px-6 py-5 border-b border-slate-200">
                <h3 className="text-2xl font-black text-[#061B3B] font-display">Conteúdo do Curso</h3>
              </div>

              <div className="divide-y divide-slate-200">
                {groupedCourseContent.map((group) => (
                  <div key={group.category} className="px-6 py-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-black text-[#061B3B]">{group.category}</h4>
                      <span className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                        {group.modules.length} aulas
                      </span>
                    </div>

                    <div className="space-y-2">
                      {group.modules.map((item, index) => {
                        const moduleStatus = getModuleStatus(item, group.modules, index, progressMap)
                        const isCurrent = item.id === module.id
                        const isLocked = moduleStatus === 'locked'

                        const itemContent = (
                          <div
                            className={
                              isCurrent
                                ? 'rounded-xl border border-[#061B3B]/10 bg-[#061B3B]/5 px-3 py-2'
                                : 'rounded-xl px-3 py-2'
                            }
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={cn(
                                  'mt-1 h-4 w-4 rounded-full border',
                                  isCurrent
                                    ? 'border-[#061B3B] bg-[#061B3B]'
                                    : isLocked
                                      ? 'border-slate-300 bg-white'
                                      : 'border-slate-300 bg-white',
                                )}
                              />
                              <div className="min-w-0">
                                <p
                                  className={cn(
                                    'text-sm leading-relaxed',
                                    isCurrent ? 'font-bold text-[#061B3B]' : 'text-slate-600',
                                    isLocked && 'opacity-60',
                                  )}
                                >
                                  {item.title}
                                </p>
                                <p className="text-xs text-slate-400">
                                  Aula {item.position}
                                </p>
                              </div>
                            </div>
                          </div>
                        )

                        if (isLocked) {
                          return <div key={item.id}>{itemContent}</div>
                        }

                        return (
                          <Link key={item.id} to={`/trilhas/${item.id}/lesson/${item.position}`}>
                            {itemContent}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                    Vídeo
                  </p>
                  <h3 className="text-xl font-black text-[#061B3B] font-display">
                    Acesso rápido
                  </h3>
                </div>
                {!activeYouTubeId && module.video_url && (
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                )}
              </div>

              <Button
                onClick={handlePlay}
                className="w-full rounded-xl bg-[#061B3B] hover:bg-[#0a2955] text-white"
              >
                <Play className="w-4 h-4 mr-2" fill="currentColor" />
                {activeYouTubeId ? 'Assistir vídeo agora' : 'Abrir vídeo externo'}
              </Button>

              <div className="space-y-2">
                <p className="text-sm text-slate-500">
                  Estrutura: {module.video_count} vídeo{module.video_count > 1 ? 's' : ''} e{' '}
                  {module.material_count} material{module.material_count > 1 ? 'is' : ''}
                </p>
                <Progress value={progressRecord?.watched_at ? 100 : isPlaying ? 50 : 10} className="h-2 bg-slate-100 [&>div]:bg-[#061B3B]" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

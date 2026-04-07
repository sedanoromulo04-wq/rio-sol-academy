import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import useAdminStore from '@/stores/useAdminStore'
import useUserStore from '@/stores/useUserStore'
import {
  buildLearningProgressMap,
  buildContentAccessMap,
  filterContentForUser,
  formatDeadline,
  formatMinutes,
  getAssessmentQuestionCount,
  getEstimatedMinutes,
  getModuleStatus,
  getTrackModules,
} from '@/lib/learning'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Lock,
  Play,
  Target,
} from 'lucide-react'

export default function Lesson() {
  const { id } = useParams()
  const { content } = useAdminStore()
  const {
    learningProgress,
    profile,
    userContentAccess,
    startModule,
    markModuleWatched,
    submitAssessment,
  } =
    useUserStore()
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
  const nextModule = currentIndex >= 0 ? trackModules[currentIndex + 1] : null
  const assessmentQuestionCount = module ? getAssessmentQuestionCount(module) : 0
  const estimatedMinutes = module ? getEstimatedMinutes(module) : 0

  useEffect(() => {
    if (!module || status === 'locked' || progressRecord?.started_at) return
    startModule(module)
  }, [module, progressRecord?.started_at, startModule, status])

  // Reset isPlaying when module changes
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
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-[#061B3B] font-display">
              Modulo bloqueado pela progressao
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto">
              Para acessar este conteudo, conclua o modulo anterior e atinja a nota minima da prova
              final. O sistema considera somente os modulos aplicaveis ao seu perfil.
            </p>
            <Button asChild className="bg-[#061B3B] hover:bg-[#0a2955] text-white rounded-xl">
              <Link to="/trilhas">Ver trilhas liberadas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleMarkWatched = async () => {
    const result = await markModuleWatched(module)
    if (!result) {
      toast({
        variant: 'destructive',
        title: 'Falha ao registrar',
        description: 'Nao foi possivel confirmar o conteudo como assistido.',
      })
      return
    }

    toast({
      title: 'Conteudo registrado',
      description: 'Agora a prova de conclusao foi liberada para este modulo.',
    })
  }

  const handleSubmitAssessment = async () => {
    const parsedCorrectAnswers = Number(correctAnswers)
    if (Number.isNaN(parsedCorrectAnswers) || parsedCorrectAnswers < 0) {
      toast({
        variant: 'destructive',
        title: 'Valor invalido',
        description: 'Informe quantos acertos voce teve na prova final.',
      })
      return
    }

    if (!progressRecord?.watched_at) {
      toast({
        variant: 'destructive',
        title: 'Conteudo ainda nao concluido',
        description: 'Marque o modulo como assistido antes de registrar a prova.',
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
        description: 'Nao foi possivel registrar o resultado da prova.',
      })
      return
    }

    toast({
      title: result.assessment_status === 'passed' ? 'Modulo aprovado' : 'Modulo reprovado',
      description:
        result.assessment_status === 'passed'
          ? 'O proximo modulo aplicavel ao seu perfil foi liberado.'
          : 'Revise o conteudo e tente novamente para continuar na trilha.',
    })
  }

  const stepProgress =
    progressRecord?.assessment_status === 'passed'
      ? 100
      : progressRecord?.watched_at
        ? 66
        : progressRecord?.started_at
          ? 33
          : 0

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up pb-16">
      <Link
        to="/trilhas"
        className="inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Voltar para Trilhas
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="space-y-6">
          <div className="rounded-[2rem] overflow-hidden border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-video bg-black group rounded-t-[2rem]">
              {isPlaying && module.youtube_video_id ? (
                <iframe
                  src={`https://www.youtube.com/embed/${module.youtube_video_id}?autoplay=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              ) : (
                <>
                  <img
                    src={module.thumbnail_url}
                    alt={module.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061B3B] via-[#061B3B]/55 to-transparent" />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="w-20 h-20 bg-[#EAB308]/90 hover:bg-[#EAB308] text-[#061B3B] rounded-full flex items-center justify-center transform transition-all shadow-xl hover:scale-105"
                    >
                      <Play className="w-8 h-8 ml-2" fill="currentColor" />
                    </button>
                  </div>

                  <div className="absolute top-5 left-5 right-5 flex justify-between items-start gap-4">
                    <Badge className="bg-white/10 text-white border border-white/10">
                      {module.category} - Modulo {module.position}
                    </Badge>
                    <Badge className="bg-[#EAB308] text-[#061B3B] border-none">
                      Minimo {module.passing_score}%
                    </Badge>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h1 className="text-3xl font-black text-white font-display leading-tight">
                      {module.title}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm text-slate-200 leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                    Carga prevista
                  </p>
                  <p className="mt-2 text-lg font-black text-[#061B3B]">
                    {formatMinutes(estimatedMinutes)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                    Estrutura
                  </p>
                  <p className="mt-2 text-lg font-black text-[#061B3B]">
                    {module.video_count} videos
                  </p>
                  <p className="text-sm text-slate-500">{module.material_count} materiais</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                    Publico
                  </p>
                  <p className="mt-2 text-lg font-black text-[#061B3B]">
                    {module.audience_scope === 'all' ? 'Geral' : profile?.specialty || 'Segmentado'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {module.audience_scope === 'all'
                      ? 'Todos assistem'
                      : `Destinado a: ${module.target_specialties.join(', ')}`}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                    Prova final
                  </p>
                  <p className="mt-2 text-lg font-black text-[#061B3B]">
                    {assessmentQuestionCount} questoes
                  </p>
                  <p className="text-sm text-slate-500">
                    Aprovado se atingir {module.passing_score}%
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                  <span>Fluxo do modulo</span>
                  <span className="text-[#061B3B]">{stepProgress}%</span>
                </div>
                <Progress
                  value={stepProgress}
                  className="mt-3 h-2 bg-slate-100 [&>div]:bg-[#061B3B]"
                />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="font-semibold text-[#061B3B]">1. Inicio registrado</p>
                    <p className="text-slate-500">
                      O prazo comeca quando o colaborador entra no modulo.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="font-semibold text-[#061B3B]">2. Conteudo assistido</p>
                    <p className="text-slate-500">
                      A prova so pode ser registrada depois dessa etapa.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="font-semibold text-[#061B3B]">3. Prova e liberacao</p>
                    <p className="text-slate-500">
                      O proximo modulo aplicavel so abre quando houver aprovacao.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                    Conteudo principal
                  </p>
                  <h2 className="text-xl font-black text-[#061B3B] font-display">
                    Assistir e registrar conclusao
                  </h2>
                </div>
                {module.youtube_video_id || module.video_url ? (
                  !isPlaying ? (
                    <Button 
                      onClick={() => module.youtube_video_id ? setIsPlaying(true) : window.open(module.video_url, '_blank')} 
                      className="bg-[#061B3B] hover:bg-[#0a2955] text-white rounded-xl"
                    >
                      <Play className="w-4 h-4 mr-2" fill="currentColor" /> {module.youtube_video_id ? 'Iniciar Aula' : 'Abrir video externo'}
                    </Button>
                  ) : (
                    <Button disabled className="bg-emerald-600 text-white rounded-xl">
                      <Play className="w-4 h-4 mr-2" fill="currentColor" /> Assistindo Agora
                    </Button>
                  )
                ) : null}
              </div>

              <Separator />

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-600">
                    Depois de estudar o modulo, registre a conclusao para liberar a prova final.
                  </p>
                  {progressRecord?.watched_at && (
                    <p className="mt-2 text-sm text-emerald-700 font-semibold">
                      Conteudo registrado em{' '}
                      {new Date(progressRecord.watched_at).toLocaleString('pt-BR')}.
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleMarkWatched}
                  className="bg-[#EAB308] hover:bg-[#d97706] text-[#061B3B] rounded-xl font-bold"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {progressRecord?.watched_at
                    ? 'Atualizar registro de estudo'
                    : 'Marcar como assistido'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                  Prazo da etapa
                </p>
                <h2 className="text-xl font-black text-[#061B3B] font-display">
                  Janela de conclusao
                </h2>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 space-y-2">
                <p className="text-sm text-slate-500">Prazo calculado pelo volume do modulo:</p>
                <p className="text-2xl font-black text-[#061B3B]">
                  {formatDeadline(Math.max(1, Math.ceil(estimatedMinutes / 40)))}
                </p>
                {progressRecord?.due_at ? (
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <Clock3 className="w-4 h-4" />
                    Vence em {new Date(progressRecord.due_at).toLocaleDateString('pt-BR')}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    O prazo e aberto automaticamente ao iniciar o modulo.
                  </p>
                )}
              </div>

              {status === 'overdue' && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>Este modulo esta atrasado e precisa ser regularizado antes de seguir.</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                  Prova de conclusao
                </p>
                <h2 className="text-xl font-black text-[#061B3B] font-display">
                  Logica objetiva de aprovacao
                </h2>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Informe quantos acertos voce teve na prova final deste modulo. O sistema converte
                  em percentual e decide automaticamente:
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 border-none">
                    Aprovado se nota {`>= ${module.passing_score}%`}
                  </Badge>
                  <Badge className="bg-rose-100 text-rose-700 border-none">
                    Reprovado se nota {`< ${module.passing_score}%`}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#061B3B]">
                  Acertos na prova ({assessmentQuestionCount} questoes)
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
                className="w-full bg-[#061B3B] hover:bg-[#0a2955] text-white rounded-xl h-11"
              >
                <Target className="w-4 h-4 mr-2" />
                Registrar resultado da prova
              </Button>

              {progressRecord?.assessment_score !== null &&
                progressRecord?.assessment_score !== undefined && (
                  <div
                    className={`rounded-2xl border p-4 ${
                      progressRecord.assessment_status === 'passed'
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-rose-200 bg-rose-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#061B3B]">
                          Resultado atual da prova
                        </p>
                        <p className="text-sm text-slate-600">
                          Tentativas: {progressRecord.attempts_count}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-[#061B3B]">
                          {progressRecord.assessment_score}%
                        </p>
                        <p
                          className={`text-xs font-black uppercase tracking-[0.24em] ${
                            progressRecord.assessment_status === 'passed'
                              ? 'text-emerald-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {progressRecord.assessment_status === 'passed' ? 'Aprovado' : 'Reprovado'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                  Proximo passo
                </p>
                <h2 className="text-xl font-black text-[#061B3B] font-display">
                  Navegacao progressiva
                </h2>
              </div>

              {progressRecord?.assessment_status === 'passed' && nextModule ? (
                <Button
                  asChild
                  className="w-full bg-[#EAB308] hover:bg-[#d97706] text-[#061B3B] rounded-xl h-11 font-bold"
                >
                  <Link to={`/trilhas/${nextModule.id}/lesson/${nextModule.position}`}>
                    Abrir proximo modulo
                  </Link>
                </Button>
              ) : progressRecord?.assessment_status === 'passed' ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  Toda a trilha aplicavel ao seu perfil foi concluida com aprovacao.
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  O proximo modulo permanece bloqueado ate a aprovacao desta etapa.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

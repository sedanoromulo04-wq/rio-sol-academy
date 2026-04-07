import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useAdminStore from '@/stores/useAdminStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import {
  buildContentAccessMap,
  canUserAccessContent,
  isContentAvailableForSpecialty,
} from '@/lib/learning'
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock3,
  Shield,
  Target,
} from 'lucide-react'

const assessmentStatusConfig = {
  pending: {
    label: 'Sem prova',
    className: 'bg-slate-700 text-slate-200',
  },
  passed: {
    label: 'Aprovado',
    className: 'bg-emerald-500/20 text-emerald-300',
  },
  failed: {
    label: 'Reprovado',
    className: 'bg-rose-500/20 text-rose-300',
  },
} as const

const eventLabelMap: Record<string, string> = {
  profile_updated: 'Perfil atualizado',
  module_started: 'Modulo iniciado',
  module_watched: 'Conteudo concluido',
  assessment_submitted: 'Prova registrada',
  module_approved: 'Modulo aprovado',
  module_failed: 'Modulo reprovado',
  admin_specialty_updated: 'Especialidade ajustada pelo admin',
  admin_content_access_updated: 'Permissao alterada pelo admin',
  admin_content_access_reset: 'Permissao voltou para regra automatica',
}

const eventToneMap: Record<string, string> = {
  module_approved: 'text-emerald-300',
  module_failed: 'text-rose-300',
  admin_content_access_updated: 'text-[#EAB308]',
  admin_content_access_reset: 'text-sky-300',
  admin_specialty_updated: 'text-sky-300',
}

const formatEventLabel = (actionType: string) =>
  eventLabelMap[actionType] || actionType.replace(/_/g, ' ')

const formatEventDescription = (event: {
  action_type: string
  metadata?: Record<string, any>
}) => {
  const title = typeof event.metadata?.title === 'string' ? event.metadata.title : null
  const score =
    typeof event.metadata?.score === 'number' ? `${event.metadata.score}%` : null
  const specialty =
    typeof event.metadata?.specialty === 'string' ? event.metadata.specialty : null

  if (event.action_type === 'admin_content_access_updated') {
    return event.metadata?.is_allowed
      ? `Liberado manualmente${title ? `: ${title}` : ''}.`
      : `Bloqueado manualmente${title ? `: ${title}` : ''}.`
  }

  if (event.action_type === 'admin_content_access_reset') {
    return title
      ? `O conteudo ${title} voltou a obedecer a regra automatica da jornada.`
      : 'A permissao voltou a obedecer a regra automatica da jornada.'
  }

  if (event.action_type === 'admin_specialty_updated') {
    return specialty
      ? `Nova especialidade definida: ${specialty}.`
      : 'A especialidade foi removida.'
  }

  if (event.action_type === 'assessment_submitted') {
    return title
      ? `Resultado enviado para ${title}${score ? ` com nota ${score}` : ''}.`
      : `Resultado de prova enviado${score ? ` com nota ${score}` : ''}.`
  }

  if (event.action_type === 'module_approved' || event.action_type === 'module_failed') {
    return title
      ? `${title}${score ? ` com nota ${score}` : ''}.`
      : score
        ? `Resultado com nota ${score}.`
        : 'Resultado registrado.'
  }

  if (event.action_type === 'module_started' || event.action_type === 'module_watched') {
    return title ? `${title}.` : 'Acao registrada no modulo.'
  }

  return title || 'Evento registrado no backend.'
}

export default function AdminUserDetail() {
  const { id } = useParams()
  const {
    sellers,
    progress,
    content,
    learningProgress,
    userContentAccess,
    backendEvents,
    updateSellerSpecialty,
    setUserContentAccess,
    clearUserContentAccess,
  } = useAdminStore()
  const { toast } = useToast()
  const [specialtyInput, setSpecialtyInput] = useState('')

  const user = sellers.find((seller) => seller.id === id)
  const userData = progress.find((item) => item.sellerId === id)

  useEffect(() => {
    setSpecialtyInput(user?.specialty || '')
  }, [user?.specialty])

  const sortedContent = useMemo(
    () =>
      [...content].sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category)
        if (a.position !== b.position) return a.position - b.position
        return a.title.localeCompare(b.title)
      }),
    [content],
  )

  const userProgressRecords = useMemo(
    () => learningProgress.filter((record) => record.user_id === id),
    [id, learningProgress],
  )
  const progressMap = useMemo(
    () => new Map(userProgressRecords.map((record) => [record.content_id, record])),
    [userProgressRecords],
  )
  const accessMap = useMemo(
    () =>
      buildContentAccessMap(userContentAccess.filter((record) => record.user_id === id)),
    [id, userContentAccess],
  )
  const userEvents = useMemo(
    () =>
      backendEvents
        .filter((event) => event.user_id === id)
        .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)),
    [backendEvents, id],
  )

  const assessmentRows = useMemo(
    () =>
      sortedContent.filter(
        (item) => progressMap.has(item.id) || canUserAccessContent(item, user?.specialty, accessMap),
      ),
    [accessMap, progressMap, sortedContent, user?.specialty],
  )

  const manuallyAllowedCount = useMemo(
    () =>
      userContentAccess.filter((record) => record.user_id === id && record.is_allowed).length,
    [id, userContentAccess],
  )
  const manuallyBlockedCount = useMemo(
    () =>
      userContentAccess.filter((record) => record.user_id === id && !record.is_allowed).length,
    [id, userContentAccess],
  )
  const effectiveAllowedCount = useMemo(
    () =>
      sortedContent.filter((item) => canUserAccessContent(item, user?.specialty, accessMap)).length,
    [accessMap, sortedContent, user?.specialty],
  )

  if (!user || !userData) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center text-slate-400 animate-fade-in">
        Usuario nao encontrado ou sem dados de progresso.
      </div>
    )
  }

  const handleSaveSpecialty = async () => {
    await updateSellerSpecialty(user.id, specialtyInput.trim())
    toast({
      title: 'Especialidade atualizada',
      description: 'A segmentacao da jornada foi recalculada para este colaborador.',
    })
  }

  const handleToggleAccess = async (contentId: string, isAllowed: boolean) => {
    await setUserContentAccess(user.id, contentId, isAllowed)
    toast({
      title: isAllowed ? 'Conteudo liberado' : 'Conteudo bloqueado',
      description: 'A permissao manual foi registrada e ja entrou na governanca do usuario.',
    })
  }

  const handleResetAccess = async (contentId: string) => {
    await clearUserContentAccess(user.id, contentId)
    toast({
      title: 'Regra automatica restaurada',
      description: 'O conteudo voltou a obedecer a segmentacao padrao do sistema.',
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-slate-400 hover:text-white rounded-full shrink-0"
          >
            <Link to="/admin">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <Avatar className="w-16 h-16 border-2 border-[#EAB308] shadow-lg">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-slate-800 text-lg">U</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white font-display tracking-tight">
              {user.name}
            </h1>
            <p className="text-slate-400 text-sm">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className="bg-white/10 text-slate-200 border border-white/10">
                Especialidade: {user.specialty || 'Nao definida'}
              </Badge>
              <Badge className="bg-[#EAB308] text-[#061B3B] border-none">
                {effectiveAllowedCount} conteudos visiveis
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-[#111827] border-white/10 text-white shadow-xl">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="p-3.5 bg-blue-500/20 rounded-2xl text-blue-300 shrink-0">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Jornada concluida
              </p>
              <p className="text-3xl font-black font-display leading-none">
                {userData.overallProgress}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-white/10 text-white shadow-xl">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="p-3.5 bg-emerald-500/20 rounded-2xl text-emerald-300 shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Modulos aprovados
              </p>
              <p className="text-3xl font-black font-display leading-none">
                {userData.approvedModules}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-white/10 text-white shadow-xl">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="p-3.5 bg-violet-500/20 rounded-2xl text-violet-300 shrink-0">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Media das provas
              </p>
              <p className="text-3xl font-black font-display leading-none">
                {userData.averageAssessmentScore}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-white/10 text-white shadow-xl">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="p-3.5 bg-amber-500/20 rounded-2xl text-amber-300 shrink-0">
              <Clock3 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Etapas em atraso
              </p>
              <p className="text-3xl font-black font-display leading-none">
                {userData.overdueModules}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="space-y-6">
          <Card className="bg-[#111827] border-white/10 text-white shadow-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Target className="w-5 h-5 text-[#EAB308]" /> Resultados de prova e aprovacao
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {assessmentRows.length === 0 ? (
                <p className="text-slate-400 text-sm py-4 text-center">
                  Nenhum modulo aplicavel ou tentativa registrada para este usuario.
                </p>
              ) : (
                <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                  {assessmentRows.map((item) => {
                    const record = progressMap.get(item.id)
                    const effectiveAccess = canUserAccessContent(item, user.specialty, accessMap)
                    const status = record?.assessment_status || 'pending'

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-3"
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge className="bg-white/10 text-slate-200 border border-white/10">
                                {item.category}
                              </Badge>
                              <Badge className="bg-white/10 text-slate-200 border border-white/10">
                                Modulo {item.position}
                              </Badge>
                              <Badge
                                className={
                                  effectiveAccess
                                    ? 'bg-sky-500/20 text-sky-300 border-none'
                                    : 'bg-slate-700 text-slate-300 border-none'
                                }
                              >
                                {effectiveAccess ? 'Na jornada atual' : 'Fora da jornada atual'}
                              </Badge>
                            </div>
                            <h3 className="text-lg font-black text-white">{item.title}</h3>
                            <p className="text-xs text-slate-400 mt-1">
                              Minimo exigido: {item.passing_score}% na prova final.
                            </p>
                          </div>

                          <div className="text-left lg:text-right">
                            <Badge className={assessmentStatusConfig[status].className}>
                              {assessmentStatusConfig[status].label}
                            </Badge>
                            <p className="mt-2 text-2xl font-black text-white">
                              {record?.assessment_score ?? '--'}
                              <span className="text-sm text-slate-400 ml-1">%</span>
                            </p>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-bold">
                              {record ? `${record.attempts_count} tentativa(s)` : 'Sem tentativa'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="rounded-xl bg-black/20 p-3">
                            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-bold">
                              Inicio
                            </p>
                            <p className="mt-2 text-slate-200">
                              {record?.started_at
                                ? new Date(record.started_at).toLocaleString('pt-BR')
                                : 'Nao iniciado'}
                            </p>
                          </div>
                          <div className="rounded-xl bg-black/20 p-3">
                            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-bold">
                              Conteudo assistido
                            </p>
                            <p className="mt-2 text-slate-200">
                              {record?.watched_at
                                ? new Date(record.watched_at).toLocaleString('pt-BR')
                                : 'Pendente'}
                            </p>
                          </div>
                          <div className="rounded-xl bg-black/20 p-3">
                            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-bold">
                              Conclusao
                            </p>
                            <p className="mt-2 text-slate-200">
                              {record?.completed_at
                                ? new Date(record.completed_at).toLocaleString('pt-BR')
                                : 'Aguardando aprovacao'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#111827] border-white/10 text-white shadow-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#EAB308]" /> Eventos registrados no backend
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {userEvents.length === 0 ? (
                <p className="text-slate-400 text-sm py-4 text-center">
                  Nenhuma acao registrada ainda para este usuario.
                </p>
              ) : (
                <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                  {userEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p
                            className={`font-bold ${
                              eventToneMap[event.action_type] || 'text-slate-100'
                            }`}
                          >
                            {formatEventLabel(event.action_type)}
                          </p>
                          <p className="mt-1 text-sm text-slate-400 leading-relaxed">
                            {formatEventDescription(event)}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 shrink-0">
                          {new Date(event.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#111827] border-white/10 text-white shadow-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg font-display">Governanca do usuario</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                  Especialidade atual
                </p>
                <p className="mt-2 text-xl font-black text-white">
                  {user.specialty || 'Nao definida'}
                </p>
              </div>

              <Input
                value={specialtyInput}
                onChange={(event) => setSpecialtyInput(event.target.value)}
                placeholder="Ex: logistica, aplicacao tecnica, vendas"
                className="bg-[#1F2937] border-white/10 text-white"
              />
              <Button
                type="button"
                onClick={handleSaveSpecialty}
                className="w-full bg-[#EAB308] hover:bg-[#d97706] text-[#061B3B] font-bold"
              >
                Salvar especialidade
              </Button>

              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                    Conteudos liberados agora
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">{effectiveAllowedCount}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                      Liberacoes manuais
                    </p>
                    <p className="mt-2 text-2xl font-black text-white">{manuallyAllowedCount}</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                      Bloqueios manuais
                    </p>
                    <p className="mt-2 text-2xl font-black text-white">{manuallyBlockedCount}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111827] border-white/10 text-white shadow-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg font-display">Controle de acesso por conteudo</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
                {sortedContent.map((item) => {
                  const defaultAccess = isContentAvailableForSpecialty(item, user.specialty)
                  const manualAccess = accessMap.get(item.id)
                  const effectiveAccess = canUserAccessContent(item, user.specialty, accessMap)

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge className="bg-white/10 text-slate-200 border border-white/10">
                              {item.category}
                            </Badge>
                            <Badge className="bg-white/10 text-slate-200 border border-white/10">
                              Modulo {item.position}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-white">{item.title}</h3>
                          <p className="text-xs text-slate-400 mt-1">
                            Regra base:{' '}
                            {item.audience_scope === 'all'
                              ? 'conteudo geral'
                              : `segmentado para ${item.target_specialties.join(', ')}`}
                          </p>
                        </div>

                        <Switch
                          checked={effectiveAccess}
                          onCheckedChange={(checked) => handleToggleAccess(item.id, checked)}
                          className="data-[state=checked]:bg-[#EAB308] data-[state=unchecked]:bg-slate-700"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge
                          className={
                            defaultAccess
                              ? 'bg-sky-500/20 text-sky-300 border-none'
                              : 'bg-slate-700 text-slate-300 border-none'
                          }
                        >
                          Regra automatica: {defaultAccess ? 'liberado' : 'bloqueado'}
                        </Badge>
                        <Badge
                          className={
                            effectiveAccess
                              ? 'bg-emerald-500/20 text-emerald-300 border-none'
                              : 'bg-rose-500/20 text-rose-300 border-none'
                          }
                        >
                          Estado atual: {effectiveAccess ? 'acesso liberado' : 'acesso bloqueado'}
                        </Badge>
                        <Badge className="bg-white/10 text-slate-300 border border-white/10">
                          {manualAccess === undefined
                            ? 'Sem excecao manual'
                            : manualAccess
                              ? 'Liberado manualmente'
                              : 'Bloqueado manualmente'}
                        </Badge>
                      </div>

                      {manualAccess !== undefined && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleResetAccess(item.id)}
                          className="w-full border-white/10 bg-transparent text-slate-200 hover:bg-white/5 hover:text-white"
                        >
                          Voltar para a regra automatica
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {userData.overdueModules > 0 && (
            <Card className="bg-red-500/10 border-red-500/20 text-white shadow-xl">
              <CardContent className="p-5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-300 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-red-100">Acompanhamento recomendado</p>
                  <p className="text-sm text-red-100/80 mt-1">
                    Este colaborador possui modulos fora do prazo. O admin ja consegue agir
                    direto por aqui com especialidade, acessos e leitura do historico de eventos.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

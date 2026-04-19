import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import useAdminStore from '@/stores/useAdminStore'
import useSystemStore from '@/stores/useSystemStore'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Cpu,
  GraduationCap,
  Medal,
  Send,
  ShieldCheck,
  Users,
  XCircle,
  Zap,
} from 'lucide-react'

// ─── Event helpers ────────────────────────────────────────────────────────────

const eventLabels: Record<string, string> = {
  profile_updated: 'Perfil atualizado',
  module_started: 'Modulo iniciado',
  module_watched: 'Conteudo concluido',
  assessment_submitted: 'Prova registrada',
  module_approved: 'Modulo aprovado',
  module_failed: 'Modulo reprovado',
  admin_specialty_updated: 'Especialidade ajustada',
  admin_content_access_updated: 'Permissao alterada',
  admin_content_access_reset: 'Regra restaurada',
}

const formatEventLabel = (actionType: string) =>
  eventLabels[actionType] || actionType.replace(/_/g, ' ')

const formatEventDescription = (
  event: { action_type: string; metadata?: Record<string, any> },
  userName: string,
) => {
  const title = typeof event.metadata?.title === 'string' ? event.metadata.title : null
  const score = typeof event.metadata?.score === 'number' ? `${event.metadata.score}%` : null
  if (event.action_type === 'admin_content_access_updated') {
    return `${userName} recebeu ${event.metadata?.is_allowed ? 'liberacao' : 'bloqueio'} manual${title ? ` em "${title}"` : ''}.`
  }
  if (event.action_type === 'assessment_submitted') {
    return `${userName} enviou prova${title ? ` em "${title}"` : ''}${score ? ` — nota ${score}` : ''}.`
  }
  if (event.action_type === 'module_approved' || event.action_type === 'module_failed') {
    return `${userName} concluiu${title ? ` "${title}"` : ''}${score ? ` com ${score}` : ''}.`
  }
  return `${userName}${title ? ` atuou em "${title}"` : ' gerou uma acao'}.`
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  sub,
  color = 'text-white',
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  return (
    <Card className="flex flex-col gap-2 rounded-2xl border-white/10 bg-white/5 p-4 text-white">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <span className="opacity-70">{icon}</span>
      </div>
      <p className={`text-3xl font-black leading-none ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </Card>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { toast } = useToast()
  const { isStreakModeGlobal, setStreakModeGlobal, weeklyFocus, setWeeklyFocus } = useSystemStore()
  const { sellers, content, progress, learningProgress, userContentAccess, backendEvents } = useAdminStore()
  const [focusInput, setFocusInput] = useState(weeklyFocus)

  const sellerMap = useMemo(() => new Map(sellers.map((s) => [s.id, s])), [sellers])

  const metrics = useMemo(() => {
    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 7)

    const activeUsers = new Set(
      backendEvents
        .filter((e) => new Date(e.created_at) >= sevenDaysAgo)
        .map((e) => e.user_id),
    )

    return {
      team: sellers.length,
      active: activeUsers.size,
      activeRate: sellers.length ? Math.round((activeUsers.size / sellers.length) * 100) : 0,
      approvals: learningProgress.filter((r) => r.assessment_status === 'passed').length,
      failures: learningProgress.filter((r) => r.assessment_status === 'failed').length,
      awaiting: learningProgress.filter((r) => r.watched_at && r.assessment_status === 'pending').length,
      overdue: learningProgress.filter((r) => r.due_at && !r.completed_at && new Date(r.due_at) < now).length,
      averageProgress: progress.length
        ? Math.round(progress.reduce((s, i) => s + i.overallProgress, 0) / progress.length)
        : 0,
      manualOverrides: userContentAccess.length,
    }
  }, [backendEvents, learningProgress, progress, sellers.length, userContentAccess.length])

  const chartData = useMemo(() => {
    const today = new Date()
    const base = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (6 - i))
      return {
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        eventos: 0,
        aprovacoes: 0,
        reprovacoes: 0,
      }
    })
    const map = new Map(base.map((b) => [b.key, b]))
    backendEvents.forEach((e) => {
      const bucket = map.get(new Date(e.created_at).toISOString().slice(0, 10))
      if (!bucket) return
      bucket.eventos += 1
      if (e.action_type === 'module_approved') bucket.aprovacoes += 1
      if (e.action_type === 'module_failed') bucket.reprovacoes += 1
    })
    return base
  }, [backendEvents])

  const topPerformers = useMemo(
    () =>
      [...progress]
        .sort((a, b) =>
          b.overallProgress !== a.overallProgress
            ? b.overallProgress - a.overallProgress
            : b.averageAssessmentScore - a.averageAssessmentScore,
        )
        .slice(0, 5),
    [progress],
  )

  const overdueUsers = useMemo(
    () =>
      [...progress]
        .filter((p) => p.overdueModules > 0)
        .sort((a, b) => b.overdueModules - a.overdueModules)
        .slice(0, 5),
    [progress],
  )

  const liveFeed = useMemo(() => backendEvents.slice(0, 15), [backendEvents])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 max-w-[1600px] mx-auto animate-fade-in-up pb-12">

      {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
      <div className="space-y-5">

        {/* Header */}
        <section className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#040b15_0%,#0b1830_54%,#050914_100%)] px-6 py-5">
          <div className="flex items-center gap-3 mb-1">
            <Badge className="border-0 bg-[#EAB308] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#061B3B]">
              Painel ao vivo
            </Badge>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Operacao global da academia</h1>
        </section>

        {/* KPI row — 6 cards */}
        <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard icon={<Users className="h-4 w-4 text-sky-300" />} label="Time" value={`${metrics.active}/${metrics.team}`} sub={`${metrics.activeRate}% ativos`} />
          <KpiCard icon={<CheckCircle2 className="h-4 w-4 text-emerald-300" />} label="Aprovacoes" value={metrics.approvals} color="text-emerald-300" />
          <KpiCard icon={<XCircle className="h-4 w-4 text-rose-300" />} label="Reprovacoes" value={metrics.failures} color="text-rose-300" />
          <KpiCard icon={<Clock3 className="h-4 w-4 text-amber-300" />} label="Ag. prova" value={metrics.awaiting} color="text-amber-200" />
          <KpiCard icon={<AlertTriangle className="h-4 w-4 text-rose-400" />} label="Em atraso" value={metrics.overdue} color="text-rose-300" />
          <KpiCard icon={<ShieldCheck className="h-4 w-4 text-sky-300" />} label="Excecoes" value={metrics.manualOverrides} />
        </section>

        {/* Tabs: Movimento + Saúde */}
        <Tabs defaultValue="operacao" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-xs rounded-2xl bg-white/5 border border-white/10 p-1 mb-4">
            <TabsTrigger value="operacao" className="rounded-xl data-[state=active]:bg-[#061B3B] data-[state=active]:text-white text-slate-400 text-xs font-bold">
              Operacao
            </TabsTrigger>
            <TabsTrigger value="equipe" className="rounded-xl data-[state=active]:bg-[#061B3B] data-[state=active]:text-white text-slate-400 text-xs font-bold">
              Equipe
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: OPERAÇÃO ─────────────────────────── */}
          <TabsContent value="operacao" className="space-y-5 mt-0">

            {/* Chart + Leitura executiva */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-5">

              {/* Chart */}
              <Card className="rounded-2xl border-white/10 bg-white/[0.03] p-5 text-white">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ultimos 7 dias</p>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-0.5 bg-[#EAB308] rounded" /> Eventos</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-0.5 bg-emerald-400 rounded" /> Aprovados</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-0.5 bg-rose-400 rounded" /> Reprovados</span>
                  </div>
                </div>
                <h2 className="text-lg font-black mb-4">Movimento operacional</h2>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="label" stroke="#64748B" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748B" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: '#0b1830', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                        labelStyle={{ color: '#94A3B8' }}
                      />
                      <Line type="monotone" dataKey="eventos" stroke="#EAB308" strokeWidth={2.5} dot={{ r: 2.5 }} />
                      <Line type="monotone" dataKey="aprovacoes" stroke="#34D399" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="reprovacoes" stroke="#FB7185" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Leitura executiva */}
              <Card className="rounded-2xl border-white/10 bg-white/[0.03] p-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Saude da operacao</p>
                <h2 className="text-lg font-black mb-5">Leitura executiva</h2>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-slate-400">Progresso medio</span>
                      <span className="font-bold text-white">{metrics.averageProgress}%</span>
                    </div>
                    <Progress value={metrics.averageProgress} className="h-1.5 bg-white/10 [&>div]:bg-[#EAB308]" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-slate-400">Ativos esta semana</span>
                      <span className="font-bold text-white">{metrics.active}/{metrics.team}</span>
                    </div>
                    <Progress value={metrics.activeRate} className="h-1.5 bg-white/10 [&>div]:bg-sky-400" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {[
                      { label: 'Atrasos abertos', value: metrics.overdue, accent: 'text-rose-300' },
                      { label: 'Modulos ativos', value: content.length, accent: 'text-sky-300' },
                      { label: 'Excecoes manuais', value: metrics.manualOverrides, accent: 'text-amber-300' },
                      { label: 'Aguardando prova', value: metrics.awaiting, accent: 'text-slate-200' },
                    ].map(({ label, value, accent }) => (
                      <div key={label} className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">{label}</p>
                        <p className={`text-xl font-black ${accent}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* ── TAB 2: EQUIPE ─────────────────────────────── */}
          <TabsContent value="equipe" className="space-y-5 mt-0">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

              {/* Ranking */}
              <Card className="rounded-2xl border-white/10 bg-white/[0.03] p-5 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Ranking</p>
                    <h2 className="text-lg font-black">Melhor desempenho</h2>
                  </div>
                  <Medal className="h-5 w-5 text-[#EAB308]" />
                </div>
                <div className="space-y-2">
                  {topPerformers.length === 0 && (
                    <p className="text-sm text-slate-500 py-4 text-center">Nenhum dado disponivel.</p>
                  )}
                  {topPerformers.map((item, index) => {
                    const seller = sellerMap.get(item.sellerId)
                    return (
                      <Link
                        key={item.sellerId}
                        to={`/admin/users/${item.sellerId}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAB308]/15 text-[#EAB308] text-xs font-black shrink-0">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-white leading-tight">{seller?.name || 'Usuario'}</p>
                            <p className="text-xs text-slate-500">{seller?.specialty || '—'}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-white">{item.overallProgress}%</p>
                          <p className="text-xs text-slate-500">prova {item.averageAssessmentScore}%</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </Card>

              {/* Usuarios em atraso */}
              <Card className="rounded-2xl border-white/10 bg-white/[0.03] p-5 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Atencao</p>
                    <h2 className="text-lg font-black">Usuarios em atraso</h2>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-rose-300" />
                </div>
                <div className="space-y-2">
                  {overdueUsers.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 py-6 text-center text-sm text-slate-500">
                      Nenhum usuario em atraso.
                    </div>
                  ) : (
                    overdueUsers.map((item) => {
                      const seller = sellerMap.get(item.sellerId)
                      return (
                        <Link
                          key={item.sellerId}
                          to={`/admin/users/${item.sellerId}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 hover:bg-white/5 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-bold text-white">{seller?.name || 'Usuario'}</p>
                            <p className="text-xs text-slate-500">{item.overdueModules} etapa(s) em atraso</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-rose-300">{item.overdueModules} atrasos</p>
                            <p className="text-xs text-slate-500">media {item.averageAssessmentScore}%</p>
                          </div>
                        </Link>
                      )
                    })
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────────── */}
      <div className="space-y-5">

        {/* Sidebar card */}
        <Card className="rounded-2xl border-white/10 bg-white/[0.03] text-white overflow-hidden sticky top-24">
          <div className="px-5 py-4 border-b border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Gestao</p>
            <h2 className="text-lg font-black">Painel lateral</h2>
          </div>

          <Tabs defaultValue="feed" className="w-full">
            <div className="px-5 pt-4">
              <TabsList className="grid grid-cols-3 w-full rounded-xl bg-white/5 border border-white/10 p-1">
                <TabsTrigger value="feed" className="rounded-lg data-[state=active]:bg-[#061B3B] data-[state=active]:text-white text-slate-400 text-[11px] font-bold">Feed</TabsTrigger>
                <TabsTrigger value="alerts" className="rounded-lg data-[state=active]:bg-[#061B3B] data-[state=active]:text-white text-slate-400 text-[11px] font-bold">Alertas</TabsTrigger>
                <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-[#061B3B] data-[state=active]:text-white text-slate-400 text-[11px] font-bold">Sistema</TabsTrigger>
              </TabsList>
            </div>

            {/* Feed */}
            <TabsContent value="feed" className="mt-0 px-5 py-4 space-y-2 max-h-[520px] overflow-y-auto">
              {liveFeed.length === 0 && (
                <p className="text-sm text-slate-500 py-4 text-center">Nenhum evento registrado.</p>
              )}
              {liveFeed.map((event) => {
                const seller = sellerMap.get(event.user_id)
                const userName = seller?.name || 'Usuario'
                return (
                  <Link
                    key={event.id}
                    to={`/admin/users/${event.user_id}`}
                    className="flex items-start justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white leading-tight">{formatEventLabel(event.action_type)}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-400 truncate">{formatEventDescription(event, userName)}</p>
                      <p className="mt-1 text-[10px] text-slate-600 font-medium">
                        {new Date(event.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-600 shrink-0 mt-0.5" />
                  </Link>
                )
              })}
            </TabsContent>

            {/* Alertas */}
            <TabsContent value="alerts" className="mt-0 px-5 py-4 space-y-2">
              {[
                { icon: <AlertTriangle className="h-4 w-4 text-rose-300" />, label: 'Atrasos atuais', value: `${metrics.overdue} etapa(s) fora do prazo.` },
                { icon: <GraduationCap className="h-4 w-4 text-amber-300" />, label: 'Reprovacoes', value: `${metrics.failures} resultados exigindo reforco.` },
                { icon: <ShieldCheck className="h-4 w-4 text-sky-300" />, label: 'Controle manual', value: `${metrics.manualOverrides} override(s) ativo(s).` },
                { icon: <BookOpen className="h-4 w-4 text-slate-300" />, label: 'Aguardando prova', value: `${metrics.awaiting} colaborador(es) prontos.` },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                  <span className="mt-0.5 shrink-0">{icon}</span>
                  <div>
                    <p className="text-xs font-bold text-white">{label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Sistema */}
            <TabsContent value="system" className="mt-0 px-5 py-4 space-y-3">
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white">Modo ofensiva</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Gamificacao global da academia.</p>
                  </div>
                  <Switch
                    checked={isStreakModeGlobal}
                    onCheckedChange={(v) => {
                      setStreakModeGlobal(v)
                      toast({ title: `Modo ofensiva ${v ? 'ativado' : 'desativado'}` })
                    }}
                    className="data-[state=checked]:bg-[#EAB308] data-[state=unchecked]:bg-slate-700 shrink-0"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 space-y-3">
                <p className="text-xs font-bold text-white flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-[#EAB308]" /> Foco da semana</p>
                <Textarea
                  value={focusInput}
                  onChange={(e) => setFocusInput(e.target.value)}
                  placeholder="Mensagem de foco para a equipe..."
                  className="min-h-[100px] border-white/10 bg-white/5 text-white placeholder:text-slate-600 text-sm resize-none"
                />
                <Button
                  onClick={() => {
                    setWeeklyFocus(focusInput)
                    toast({ title: 'Foco publicado para a equipe.' })
                  }}
                  className="w-full bg-[#EAB308] hover:bg-[#d97706] text-[#061B3B] font-bold text-sm"
                >
                  <Send className="mr-2 h-3.5 w-3.5" /> Publicar
                </Button>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                <p className="text-xs font-bold text-white flex items-center gap-2 mb-2"><BrainCircuit className="h-3.5 w-3.5 text-sky-300" /> IA e agentes</p>
                <Button asChild variant="outline" className="w-full border-white/10 bg-transparent text-white hover:bg-white/5 text-sm">
                  <Link to="/admin/agents"><Cpu className="mr-2 h-3.5 w-3.5" /> Central de agentes</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

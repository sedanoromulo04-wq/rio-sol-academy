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
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import {
  AlertTriangle,
  ArrowUpRight,
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
} from 'lucide-react'

const eventLabels: Record<string, string> = {
  profile_updated: 'Perfil atualizado',
  module_started: 'Modulo iniciado',
  module_watched: 'Conteudo concluido',
  assessment_submitted: 'Prova registrada',
  module_approved: 'Modulo aprovado',
  module_failed: 'Modulo reprovado',
  admin_specialty_updated: 'Especialidade ajustada',
  admin_content_access_updated: 'Permissao alterada',
  admin_content_access_reset: 'Regra automatica restaurada',
}

const formatEventLabel = (actionType: string) =>
  eventLabels[actionType] || actionType.replace(/_/g, ' ')

const formatEventDescription = (event: { action_type: string; metadata?: Record<string, any> }, userName: string) => {
  const title = typeof event.metadata?.title === 'string' ? event.metadata.title : null
  const score = typeof event.metadata?.score === 'number' ? `${event.metadata.score}%` : null

  if (event.action_type === 'admin_content_access_updated') {
    return event.metadata?.is_allowed
      ? `${userName} recebeu liberacao manual${title ? ` para ${title}` : ''}.`
      : `${userName} recebeu bloqueio manual${title ? ` para ${title}` : ''}.`
  }
  if (event.action_type === 'assessment_submitted') {
    return `${userName} registrou uma prova${title ? ` em ${title}` : ''}${score ? ` com nota ${score}` : ''}.`
  }
  if (event.action_type === 'module_approved' || event.action_type === 'module_failed') {
    return `${userName} teve resultado${title ? ` em ${title}` : ''}${score ? ` com nota ${score}` : ''}.`
  }
  return `${userName}${title ? ` atuou em ${title}` : ' gerou uma acao operacional'}.`
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const { isStreakModeGlobal, setStreakModeGlobal, weeklyFocus, setWeeklyFocus } = useSystemStore()
  const { sellers, content, progress, learningProgress, userContentAccess, backendEvents } = useAdminStore()
  const [focusInput, setFocusInput] = useState(weeklyFocus)

  const sellerMap = useMemo(() => new Map(sellers.map((seller) => [seller.id, seller])), [sellers])

  const metrics = useMemo(() => {
    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 7)

    const activeUsers = new Set(
      backendEvents.filter((event) => new Date(event.created_at) >= sevenDaysAgo).map((event) => event.user_id),
    )

    return {
      team: sellers.length,
      active: activeUsers.size,
      activeRate: sellers.length ? Math.round((activeUsers.size / sellers.length) * 100) : 0,
      approvals: learningProgress.filter((record) => record.assessment_status === 'passed').length,
      failures: learningProgress.filter((record) => record.assessment_status === 'failed').length,
      awaiting: learningProgress.filter((record) => record.watched_at && record.assessment_status === 'pending').length,
      overdue: learningProgress.filter((record) => record.due_at && !record.completed_at && new Date(record.due_at) < now).length,
      averageProgress: progress.length ? Math.round(progress.reduce((sum, item) => sum + item.overallProgress, 0) / progress.length) : 0,
      manualOverrides: userContentAccess.length,
    }
  }, [backendEvents, learningProgress, progress, sellers.length, userContentAccess.length])

  const chartData = useMemo(() => {
    const today = new Date()
    const base = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (6 - index))
      return {
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        eventos: 0,
        aprovacoes: 0,
        reprovacoes: 0,
      }
    })

    const map = new Map(base.map((item) => [item.key, item]))
    backendEvents.forEach((event) => {
      const bucket = map.get(new Date(event.created_at).toISOString().slice(0, 10))
      if (!bucket) return
      bucket.eventos += 1
      if (event.action_type === 'module_approved') bucket.aprovacoes += 1
      if (event.action_type === 'module_failed') bucket.reprovacoes += 1
    })

    return base
  }, [backendEvents])

  const topPerformers = useMemo(
    () =>
      [...progress]
        .sort((a, b) => {
          if (b.overallProgress !== a.overallProgress) return b.overallProgress - a.overallProgress
          return b.averageAssessmentScore - a.averageAssessmentScore
        })
        .slice(0, 5),
    [progress],
  )

  const overdueUsers = useMemo(
    () => [...progress].filter((item) => item.overdueModules > 0).sort((a, b) => b.overdueModules - a.overdueModules).slice(0, 5),
    [progress],
  )

  const liveFeed = useMemo(() => backendEvents.slice(0, 12), [backendEvents])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 xl:gap-8 max-w-[1600px] mx-auto animate-fade-in-up pb-10">
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_18%),linear-gradient(135deg,#040b15_0%,#0b1830_54%,#050914_100%)] p-6 shadow-2xl">
          <Badge className="border-0 bg-[#EAB308] px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#061B3B]">
            Painel ao vivo
          </Badge>
          <h1 className="mt-4 text-3xl md:text-4xl font-black tracking-tight text-white font-display">
            Operacao global da academia
          </h1>
          <p className="mt-3 max-w-3xl text-sm md:text-base leading-7 text-slate-300">
            O dashboard principal agora nasce dos eventos reais do backend: progresso, prova,
            aprovacao, reprovacao, atraso e controle manual do admin.
          </p>

          <div className="mt-6 grid grid-cols-2 xl:grid-cols-5 gap-4">
            <Card className="rounded-3xl border-white/10 bg-white/5 p-4 text-white"><Users className="h-5 w-5 text-sky-300" /><p className="mt-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Time ativo</p><p className="mt-1 text-3xl font-black">{metrics.active}</p><p className="text-xs text-slate-500">{metrics.activeRate}% da base</p></Card>
            <Card className="rounded-3xl border-white/10 bg-white/5 p-4 text-white"><CheckCircle2 className="h-5 w-5 text-emerald-300" /><p className="mt-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Aprovacoes</p><p className="mt-1 text-3xl font-black">{metrics.approvals}</p></Card>
            <Card className="rounded-3xl border-white/10 bg-white/5 p-4 text-white"><XCircle className="h-5 w-5 text-rose-300" /><p className="mt-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Reprovacoes</p><p className="mt-1 text-3xl font-black">{metrics.failures}</p></Card>
            <Card className="rounded-3xl border-white/10 bg-white/5 p-4 text-white"><Clock3 className="h-5 w-5 text-amber-300" /><p className="mt-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Aguardando prova</p><p className="mt-1 text-3xl font-black">{metrics.awaiting}</p></Card>
            <Card className="rounded-3xl border-white/10 bg-white/5 p-4 text-white"><ShieldCheck className="h-5 w-5 text-amber-300" /><p className="mt-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Excecoes manuais</p><p className="mt-1 text-3xl font-black">{metrics.manualOverrides}</p></Card>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <Card className="rounded-[2rem] border-white/10 bg-white/[0.03] p-6 text-white shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Ultimos 7 dias</p>
            <h2 className="mt-2 text-2xl font-black font-display">Movimento operacional</h2>
            <div className="mt-6 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="label" stroke="#94A3B8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
                  <Line type="monotone" dataKey="eventos" stroke="#EAB308" strokeWidth={3} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="aprovacoes" stroke="#34D399" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="reprovacoes" stroke="#FB7185" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="rounded-[2rem] border-white/10 bg-white/[0.03] p-6 text-white shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Saude da operacao</p>
            <h2 className="mt-2 text-2xl font-black font-display">Leitura executiva</h2>
            <div className="mt-6 space-y-5">
              <div><div className="flex items-center justify-between text-sm"><span className="text-slate-300">Progresso medio da base</span><span className="font-bold text-white">{metrics.averageProgress}%</span></div><Progress value={metrics.averageProgress} className="mt-2 h-2 bg-white/10 [&>div]:bg-[#EAB308]" /></div>
              <div><div className="flex items-center justify-between text-sm"><span className="text-slate-300">Colaboradores com atividade recente</span><span className="font-bold text-white">{metrics.active}/{metrics.team}</span></div><Progress value={metrics.activeRate} className="mt-2 h-2 bg-white/10 [&>div]:bg-sky-400" /></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                <p className="font-bold text-white">Atrasos em aberto</p>
                <p className="mt-1">{metrics.overdue} etapa(s) fora do prazo atual.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                <p className="font-bold text-white">Biblioteca ativa</p>
                <p className="mt-1">{content.length} modulos governados e visiveis para a operacao.</p>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="rounded-[2rem] border-white/10 bg-white/[0.03] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Ranking</p><h2 className="mt-2 text-2xl font-black font-display">Melhor desempenho</h2></div><Medal className="h-5 w-5 text-[#EAB308]" /></div>
            <div className="mt-6 space-y-3">
              {topPerformers.map((item, index) => {
                const seller = sellerMap.get(item.sellerId)
                return <Link key={item.sellerId} to={`/admin/users/${item.sellerId}`} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-white/5 transition-colors"><div className="flex items-center gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAB308]/15 text-[#EAB308] font-black">{index + 1}</div><div><p className="font-bold text-white">{seller?.name || 'Usuario'}</p><p className="text-xs text-slate-400">{seller?.specialty || 'Sem especialidade'}</p></div></div><div className="text-right"><p className="font-black text-white">{item.overallProgress}%</p><p className="text-xs text-slate-400">prova {item.averageAssessmentScore}%</p></div></Link>
              })}
            </div>
          </Card>

          <Card className="rounded-[2rem] border-white/10 bg-white/[0.03] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Atencao imediata</p><h2 className="mt-2 text-2xl font-black font-display">Usuarios em atraso</h2></div><AlertTriangle className="h-5 w-5 text-rose-300" /></div>
            <div className="mt-6 space-y-3">
              {overdueUsers.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-slate-400">Nenhum usuario em atraso no momento.</div> : overdueUsers.map((item) => {
                const seller = sellerMap.get(item.sellerId)
                return <Link key={item.sellerId} to={`/admin/users/${item.sellerId}`} className="block rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-white/5 transition-colors"><p className="font-bold text-white">{seller?.name || 'Usuario'}</p><p className="mt-1 text-sm text-slate-400">{item.overdueModules} etapa(s) em atraso • media {item.averageAssessmentScore}%</p></Link>
              })}
            </div>
          </Card>
        </section>
      </div>

      <Card className="rounded-[2rem] border-white/10 bg-white/[0.03] text-white shadow-2xl sticky top-28 h-fit overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Gestao</p>
          <h2 className="mt-2 text-2xl font-black font-display">Painel lateral</h2>
          <p className="mt-2 text-sm text-slate-400">Feed global, alertas e controles centrais.</p>
        </div>

        <Tabs defaultValue="feed" className="w-full">
          <div className="px-5 pt-5">
            <TabsList className="grid grid-cols-3 w-full rounded-2xl bg-white/5 border border-white/10 p-1">
              <TabsTrigger value="feed" className="rounded-xl data-[state=active]:bg-[#061B3B] data-[state=active]:text-white text-slate-400 text-xs font-bold">Feed</TabsTrigger>
              <TabsTrigger value="alerts" className="rounded-xl data-[state=active]:bg-[#061B3B] data-[state=active]:text-white text-slate-400 text-xs font-bold">Alertas</TabsTrigger>
              <TabsTrigger value="system" className="rounded-xl data-[state=active]:bg-[#061B3B] data-[state=active]:text-white text-slate-400 text-xs font-bold">Sistema</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="feed" className="mt-0 p-5 space-y-4">
            {liveFeed.map((event) => {
              const seller = sellerMap.get(event.user_id)
              const userName = seller?.name || 'Usuario'
              return <Link key={event.id} to={`/admin/users/${event.user_id}`} className="block rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-white/5 transition-colors"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-white">{formatEventLabel(event.action_type)}</p><p className="mt-1 text-sm leading-6 text-slate-400">{formatEventDescription(event, userName)}</p></div><ArrowUpRight className="h-4 w-4 text-slate-500 shrink-0" /></div><p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-slate-500 font-bold">{new Date(event.created_at).toLocaleString('pt-BR')}</p></Link>
            })}
            {liveFeed.length === 0 && <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400">Nenhum evento registrado ainda.</div>}
          </TabsContent>

          <TabsContent value="alerts" className="mt-0 p-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-300" /><p className="font-bold text-white">Atrasos atuais</p></div><p className="mt-2 text-sm text-slate-400">{metrics.overdue} etapa(s) fora do prazo no ecossistema.</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-amber-300" /><p className="font-bold text-white">Reprovacoes</p></div><p className="mt-2 text-sm text-slate-400">{metrics.failures} resultados exigindo reforco de conteudo.</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-sky-300" /><p className="font-bold text-white">Controle manual</p></div><p className="mt-2 text-sm text-slate-400">{metrics.manualOverrides} override(s) ativos definidos pelo admin.</p></div>
          </TabsContent>

          <TabsContent value="system" className="mt-0 p-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-bold text-white">Modo ofensiva</p><p className="mt-1 text-sm text-slate-400">Liga ou desliga a camada global de gamificacao.</p></div><Switch checked={isStreakModeGlobal} onCheckedChange={(value) => { setStreakModeGlobal(value); toast({ title: 'Configuracao atualizada', description: `Modo ofensiva ${value ? 'ativado' : 'desativado'} globalmente.` }) }} className="data-[state=checked]:bg-[#EAB308] data-[state=unchecked]:bg-slate-700" /></div></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-4"><p className="font-bold text-white">Foco da semana</p><Textarea value={focusInput} onChange={(event) => setFocusInput(event.target.value)} placeholder="Escreva a mensagem de foco da semana..." className="min-h-[140px] border-white/10 bg-white/5 text-white placeholder:text-slate-500" /><Button onClick={() => { setWeeklyFocus(focusInput); toast({ title: 'Foco atualizado', description: 'O foco da semana foi publicado para a equipe.' }) }} className="w-full bg-[#EAB308] hover:bg-[#d97706] text-[#061B3B] font-bold"><Send className="mr-2 h-4 w-4" />Publicar foco</Button></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-center gap-2"><BrainCircuit className="h-4 w-4 text-sky-300" /><p className="font-bold text-white">IA e agentes</p></div><p className="mt-2 text-sm text-slate-400">Prompts, memoria e operacao dos agentes ficam na central dedicada.</p><Button asChild variant="outline" className="mt-4 w-full border-white/10 bg-transparent text-white hover:bg-white/5"><Link to="/admin/agents"><Cpu className="mr-2 h-4 w-4" />Abrir secao de agentes</Link></Button></div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

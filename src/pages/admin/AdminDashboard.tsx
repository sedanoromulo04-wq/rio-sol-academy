import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import useSystemStore from '@/stores/useSystemStore'
import { LineChart, Line, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Play,
  Settings,
  Maximize,
  Activity,
  Server,
  Database,
  Send,
  MoreVertical,
  Wifi,
  Cpu,
  Medal,
  Clock,
} from 'lucide-react'

const chartData = [
  { time: '06:00', value: 12 },
  { time: '09:00', value: 45 },
  { time: '12:00', value: 68 },
  { time: '15:00', value: 85 },
  { time: '18:00', value: 55 },
  { time: '21:00', value: 28 },
]

const topXpEarners = [
  {
    id: 's3',
    name: 'Marcus Thorne',
    role: 'Arquiteto Principal',
    xp: '31.2k',
    img: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=12',
  },
  {
    id: 's4',
    name: 'Elena Vance',
    role: 'Especialista de Grid',
    xp: '24.8k',
    img: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=22',
  },
  {
    id: 's1',
    name: 'Julian Vesper',
    role: 'Analista de Sistemas',
    xp: '19.8k',
    img: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=44',
  },
]

const topContentWatched = [
  {
    name: 'Módulo 1: Introdução ao ROI',
    type: 'Vídeo Aula',
    views: '1.245 acessos',
    img: 'https://img.usecurling.com/p/100/100?q=solar%20panel&color=blue',
  },
  {
    name: 'Fechamento de Vendas',
    type: 'Simulador',
    views: '980 acessos',
    img: 'https://img.usecurling.com/p/100/100?q=handshake&color=yellow',
  },
  {
    name: 'Ficha Técnica: Inversores',
    type: 'Documento',
    views: '856 acessos',
    img: 'https://img.usecurling.com/p/100/100?q=document&color=gray',
  },
]

export default function AdminDashboard() {
  const { isStreakModeGlobal, setStreakModeGlobal, weeklyFocus, setWeeklyFocus } = useSystemStore()
  const { toast } = useToast()
  const [focusInput, setFocusInput] = useState(weeklyFocus)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 xl:gap-8 max-w-[1600px] mx-auto animate-fade-in-up pb-10">
      {/* Left Column - Main Content */}
      <div className="space-y-6 lg:space-y-8 flex flex-col min-w-0">
        {/* Central Analytics View */}
        <div className="bg-[#020b18]/40 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative aspect-[16/9] md:aspect-[21/9] flex flex-col">
          <img
            src="https://img.usecurling.com/p/1200/600?q=solar%20farm%20abstract&color=blue"
            alt="Platform Visual"
            className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020b18] via-[#020b18]/60 to-transparent" />

          <div className="relative z-10 flex-1 flex flex-col justify-end p-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2 font-display tracking-tight">
                Centro de Comando Zenith
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6 font-medium">
                Visão executiva do engajamento de aprendizado global e saúde do treinamento em todos
                os 14 setores operacionais. Sincronização de sistema em estado ótimo.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 mt-auto shadow-lg">
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  className="bg-[#EAB308] hover:bg-[#d97706] text-[#061B3B] h-10 w-10 rounded-full shadow-lg shadow-[#EAB308]/20"
                >
                  <Play className="h-4 w-4 ml-1" fill="currentColor" />
                </Button>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Sincronização de Dados
                  </span>
                  <span className="text-sm font-bold text-white">45% Sincronizado</span>
                </div>
              </div>
              <div className="flex-1 w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative sm:mx-4">
                <div className="absolute left-0 top-0 bottom-0 w-[45%] bg-[#EAB308] shadow-[0_0_15px_rgba(234,179,8,0.8)]"></div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-300 hover:text-white hover:bg-white/10 h-9 w-9 rounded-xl"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-300 hover:text-white hover:bg-white/10 h-9 w-9 rounded-xl"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Global KPI Dashboard (Live Resources) */}
        <div>
          <h3 className="text-xl font-bold text-white mb-5 font-display flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#EAB308]" /> Painel de KPIs Estratégicos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {/* Card 1: Engajamento Geral */}
            <Card className="bg-white/[0.02] border-white/10 backdrop-blur-xl p-5 shadow-lg flex flex-col relative overflow-hidden rounded-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <h4 className="text-sm font-bold text-white">Engajamento Geral</h4>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Ao
                  Vivo
                </div>
              </div>
              <div className="flex items-end gap-3 mb-2 z-10">
                <h5 className="text-4xl font-black text-white font-display leading-none">84%</h5>
                <span className="text-sm text-slate-400 font-medium pb-1">Ativos vs Total</span>
              </div>
              <div className="flex-1 h-[60px] w-full -ml-3 mt-auto">
                <ChartContainer config={{ value: { color: '#EAB308' } }} className="h-full w-full">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-value)"
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent hideLabel />}
                      cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </Card>

            {/* Card 2: Progresso dos Vendedores */}
            <Card className="bg-white/[0.02] border-white/10 backdrop-blur-xl p-5 shadow-lg flex flex-col relative overflow-hidden rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-bold text-white">Progresso dos Vendedores</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-400 hover:text-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center relative">
                <div className="relative w-40 h-20 overflow-hidden mb-2">
                  <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#EAB308"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={125.6}
                      strokeDashoffset={125.6 - 125.6 * 0.65}
                      className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                    />
                  </svg>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 origin-bottom rotate-[45deg] transition-all duration-1000">
                    <div className="w-1 h-14 bg-white rounded-full -translate-y-2 relative shadow-md">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-[#020b18]"></div>
                    </div>
                  </div>
                </div>
                <h5 className="text-2xl font-black text-white">65%</h5>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-center">
                  Taxa de Conclusão Média
                </p>
              </div>
            </Card>

            {/* Card 3: Volume de Conteúdo */}
            <Card className="bg-white/[0.02] border-white/10 backdrop-blur-xl p-5 shadow-lg rounded-2xl flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-sm font-bold text-white">Volume de Conteúdo</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-400 hover:text-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-end gap-3 mb-2">
                  <h5 className="text-5xl font-black text-white font-display leading-none">145</h5>
                  <span className="text-sm text-[#EAB308] font-medium pb-1">Módulos</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">Total de 1.2k horas disponíveis.</p>
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Capacidade da Biblioteca</span>
                    <span className="text-white">85%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-[#EAB308]/50 to-[#EAB308] w-[85%] rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Card 4: Estabilidade da Academia */}
            <Card className="bg-white/[0.02] border-white/10 backdrop-blur-xl p-5 shadow-lg flex flex-col rounded-2xl">
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-sm font-bold text-white">Estabilidade da Academia</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-400 hover:text-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-between items-center flex-1 pb-2">
                <div className="flex flex-col items-center gap-2.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
                    <Server className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                      Uptime
                    </span>
                    <span className="text-xs font-bold text-white">99.9%</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2.5">
                  <div className="w-12 h-12 rounded-xl bg-[#EAB308]/10 border border-[#EAB308]/20 flex items-center justify-center shadow-inner relative">
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EAB308] animate-pulse"></div>
                    <Database className="w-5 h-5 text-[#EAB308]" />
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                      Servidor
                    </span>
                    <span className="text-xs font-bold text-white">Ativo</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                    <Wifi className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                      Latência
                    </span>
                    <span className="text-xs font-bold text-white">12ms</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2.5">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-inner">
                    <Cpu className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                      Motor IA
                    </span>
                    <span className="text-xs font-bold text-white">Estável</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Top Performers Leaderboard */}
        <div>
          <h3 className="text-xl font-bold text-white mb-5 font-display flex items-center gap-2">
            <Medal className="w-5 h-5 text-[#EAB308]" /> Métricas de Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {/* Top XP Earners */}
            <Card className="bg-white/[0.02] border-white/10 backdrop-blur-xl p-5 shadow-lg flex flex-col rounded-2xl">
              <div className="flex justify-between items-start mb-5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#EAB308]" /> Ranking de XP
                </h4>
              </div>
              <div className="space-y-3 flex-1">
                {topXpEarners.map((user, idx) => (
                  <Link
                    to={`/admin/users/${user.id}`}
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group"
                  >
                    <span className="font-black text-xs w-4 text-center text-slate-500 group-hover:text-slate-300">
                      {idx + 1}
                    </span>
                    <Avatar className="h-9 w-9 border border-white/10">
                      <AvatarImage src={user.img} />
                      <AvatarFallback className="bg-slate-800 text-xs">U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white truncate group-hover:text-[#EAB308] transition-colors">
                        {user.name}
                      </p>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 truncate mt-0.5">
                        {user.role}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#EAB308] shrink-0 bg-[#EAB308]/10 px-2 py-1 rounded-md border border-[#EAB308]/20">
                      {user.xp} XP
                    </span>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Most Content Watched */}
            <Card className="bg-white/[0.02] border-white/10 backdrop-blur-xl p-5 shadow-lg flex flex-col rounded-2xl">
              <div className="flex justify-between items-start mb-5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" /> Conteúdos Mais Vistos
                </h4>
              </div>
              <div className="space-y-3 flex-1">
                {topContentWatched.map((content, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="font-black text-xs w-4 text-center text-slate-500">
                      {idx + 1}
                    </span>
                    <Avatar className="h-9 w-9 border border-white/10 rounded-md">
                      <AvatarImage src={content.img} />
                      <AvatarFallback className="bg-slate-800 text-xs rounded-md">C</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white truncate">{content.name}</p>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 truncate mt-0.5">
                        {content.type}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-blue-400 shrink-0 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
                      {content.views}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Right Column - Management Intelligence Panel */}
      <Card className="bg-white/[0.02] border-white/10 backdrop-blur-xl shadow-2xl h-full flex flex-col overflow-hidden max-h-[85vh] lg:max-h-[calc(100vh-8rem)] sticky top-28 rounded-3xl">
        <div className="p-6 pb-2 shrink-0">
          <h3 className="text-xl font-bold text-white font-display mb-1 tracking-tight">
            Inteligência de Gestão
          </h3>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            Painel Executivo Zenith
          </p>
        </div>

        <Tabs defaultValue="feed" className="flex-1 flex flex-col min-h-0 mt-3">
          <div className="px-5 shrink-0">
            <TabsList className="bg-white/[0.05] border border-white/10 w-full h-11 p-1 rounded-xl grid grid-cols-3">
              <TabsTrigger
                value="feed"
                className="rounded-lg data-[state=active]:bg-[#061b3b] data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 text-[10px] sm:text-xs font-bold"
              >
                Feed
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="rounded-lg data-[state=active]:bg-[#061b3b] data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 text-[10px] sm:text-xs font-bold"
              >
                Avisos
              </TabsTrigger>
              <TabsTrigger
                value="system"
                className="rounded-lg data-[state=active]:bg-[#061b3b] data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 text-[10px] sm:text-xs font-bold"
              >
                Sistema
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Feed Tab */}
          <TabsContent value="feed" className="flex-1 flex flex-col min-h-0 mt-0 outline-none">
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <Link
                to="/admin/users/s2"
                className="flex flex-col gap-1.5 max-w-[90%] hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors group"
              >
                <div className="bg-white/10 border border-white/10 p-3.5 rounded-2xl rounded-tl-sm text-sm text-slate-200 leading-relaxed shadow-sm group-hover:border-white/20">
                  <span className="text-[#EAB308] font-bold group-hover:underline">Lara Kross</span>{' '}
                  completou a aula "Integração de Grid Inteligente" e ganhou{' '}
                  <span className="font-bold text-emerald-400">+150 XP</span>.
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Ao Vivo • Agora
                </span>
              </Link>

              <Link
                to="/admin/users/s3"
                className="flex flex-col gap-1.5 max-w-[90%] hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors group"
              >
                <div className="bg-white/10 border border-white/10 p-3.5 rounded-2xl rounded-tl-sm text-sm text-slate-200 leading-relaxed shadow-sm group-hover:border-white/20">
                  <span className="text-[#EAB308] font-bold group-hover:underline">
                    Marcus Thorne
                  </span>{' '}
                  iniciou o simulador "Lidando com Objeções de Preço".
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Ao Vivo • 2m atrás
                </span>
              </Link>

              <Link
                to="/admin/users/s1"
                className="flex flex-col gap-1.5 max-w-[90%] hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors group"
              >
                <div className="bg-white/[0.05] border border-white/5 p-3.5 rounded-2xl rounded-tl-sm text-sm text-slate-400 leading-relaxed group-hover:border-white/10">
                  Alerta do Sistema:{' '}
                  <span className="text-slate-300 group-hover:text-white">Julian Vesper</span>{' '}
                  alcançou o Nível Zenith. Acesso estratégico liberado.
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Sistema • 15m atrás
                </span>
              </Link>

              <Link
                to="/admin/users/s4"
                className="flex flex-col gap-1.5 max-w-[90%] hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors group"
              >
                <div className="bg-white/10 border border-white/10 p-3.5 rounded-2xl rounded-tl-sm text-sm text-slate-200 leading-relaxed shadow-sm group-hover:border-white/20">
                  <span className="text-[#EAB308] font-bold group-hover:underline">
                    Elena Vance
                  </span>{' '}
                  iniciou a trilha "Filosofia & Ética Solar".
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  30m atrás
                </span>
              </Link>
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="flex-1 flex flex-col min-h-0 mt-0 outline-none">
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Editar Foco da Semana</h4>
                <textarea
                  value={focusInput}
                  onChange={(e) => setFocusInput(e.target.value)}
                  placeholder="Escreva a mensagem de foco da semana..."
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-xl p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#EAB308] resize-none h-32"
                />
                <Button
                  onClick={() => {
                    setWeeklyFocus(focusInput)
                    toast({
                      title: 'Foco Atualizado',
                      description: 'O foco da semana foi atualizado e está visível para a equipe.',
                    })
                  }}
                  className="w-full bg-[#EAB308] hover:bg-[#d97706] text-[#061b3b] font-bold"
                >
                  <Send className="w-4 h-4 mr-2" /> Publicar Foco da Semana
                </Button>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10">
                <h4 className="text-sm font-bold text-slate-300">Avisos Anteriores</h4>
                <div className="bg-[#EAB308]/10 border border-[#EAB308]/20 p-4 rounded-xl">
                  <h4 className="text-sm font-bold text-[#EAB308] mb-2">Nota Executiva - Q3</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Focar no treinamento de resiliência e objeções financeiras. A taxa de conversão
                    está caindo em orçamentos acima de 50k.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <h4 className="text-sm font-bold text-white mb-2">Reunião de Alinhamento</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Revisar as novas políticas de desconto na sexta-feira com os líderes de
                    esquadrão.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="flex-1 flex flex-col min-h-0 mt-0 outline-none">
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-start justify-between bg-white/5 p-4 rounded-xl border border-white/10 gap-4">
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm">Ativar Modo Ofensiva</h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Controla o sistema de gamificação, missões diárias e interface de "Streak" para
                    todos os vendedores.
                  </p>
                </div>
                <Switch
                  checked={isStreakModeGlobal}
                  onCheckedChange={(val) => {
                    setStreakModeGlobal(val)
                    toast({
                      title: 'Configuração Atualizada',
                      description: `Modo Ofensiva ${val ? 'ativado' : 'desativado'} globalmente.`,
                    })
                  }}
                  className="data-[state=checked]:bg-[#EAB308] data-[state=unchecked]:bg-slate-700 mt-1"
                />
              </div>

              <div className="flex items-start justify-between bg-white/5 p-4 rounded-xl border border-white/10 gap-4 opacity-50">
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm">Bloqueio de Simulador</h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Desativa o uso da IA de roleplay para manutenção.
                  </p>
                </div>
                <Switch disabled checked={false} className="mt-1 bg-slate-700" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

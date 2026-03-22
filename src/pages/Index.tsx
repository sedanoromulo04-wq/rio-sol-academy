import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Play, Award, Zap, BrainCircuit, Leaf, Settings2, Target, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

const CircularProgress = ({ value, label }: { value: number; label: string }) => {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="transform -rotate-90 w-12 h-12">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-slate-100"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-[#061B3B] transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-xs font-bold text-[#061B3B]">{value}%</span>
    </div>
  )
}

const trails = [
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

const achievements = [
  { icon: Award, label: 'ARQUITETO OURO', bg: 'bg-[#EAB308]', color: 'text-white' },
  { icon: Zap, label: 'PRATA ECO', bg: 'bg-slate-700', color: 'text-white' },
  { icon: Settings2, label: 'MESTRE BRONZE', bg: 'bg-slate-300', color: 'text-slate-500' },
  { icon: Leaf, label: 'CORREDOR SOLAR', bg: 'bg-[#061B3B]', color: 'text-[#EAB308]' },
  { icon: BrainCircuit, label: 'LINK NEURAL IA', bg: 'bg-[#061B3B]', color: 'text-cyan-400' },
]

export default function Index() {
  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in-up space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#061B3B] font-display uppercase tracking-tight">
            RIO SOL ACADEMY
          </h1>
          <p className="text-xs font-bold text-[#061B3B] tracking-widest uppercase mt-1">
            Comando de Operações
          </p>
        </div>
        <div className="flex items-center gap-6 bg-white py-2 px-4 rounded-xl shadow-sm border border-slate-100">
          <div className="w-40 space-y-1.5">
            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              <span>Progresso Nível Zenith</span>
              <span className="text-[#EAB308]">84%</span>
            </div>
            <Progress value={84} className="h-1 bg-slate-100 [&>div]:bg-[#EAB308]" />
          </div>
          <div className="hidden md:block w-px h-6 bg-slate-100"></div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-[#061B3B]">Arquiteto Solar</p>
              <p className="text-xs text-slate-500">Posição #12 Global</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Hero */}
          <div className="relative rounded-3xl overflow-hidden h-[300px] shadow-sm border border-slate-200 group">
            <img
              src="https://img.usecurling.com/p/1200/600?q=modern%20solar%20building&color=gray"
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#061B3B]/95 via-[#061B3B]/80 to-transparent" />
            <div className="relative z-10 p-8 flex flex-col h-full justify-between">
              <Badge className="w-fit bg-[#EAB308] text-[#422006] hover:bg-[#EAB308] font-bold text-[9px] tracking-widest uppercase border-none px-2.5 py-1">
                Missão Atual: Tier 4
              </Badge>
              <div className="max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 font-display leading-tight">
                  Fase de Maestria
                  <br />
                  em Integração de Grid
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
                  Execute os protocolos avançados de sincronização para o Hub PV Atacama. Esta
                  simulação exige 99,8% de estabilidade.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                <Button className="bg-[#EAB308] hover:bg-[#d97706] text-[#422006] font-bold h-10 px-5 rounded-lg border-none shadow-sm text-sm">
                  Iniciar Simulação
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white font-medium h-10 px-5 rounded-lg backdrop-blur-sm text-sm"
                >
                  Resumo da Missão
                </Button>
              </div>
            </div>
          </div>

          {/* Knowledge Trails */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-xl font-bold text-[#061B3B] font-display">
                  Trilhas de Conhecimento
                </h3>
                <p className="text-sm text-slate-500">
                  Caminhos direcionados para sua especialização.
                </p>
              </div>
              <Link
                to="/trilhas"
                className="text-sm font-semibold text-[#061B3B] hover:text-[#EAB308] transition-colors"
              >
                Ver Todas
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trails.map((trail, idx) => (
                <Card
                  key={idx}
                  className="border-none shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-5 flex items-center gap-5">
                    <CircularProgress value={trail.progress} label={trail.title} />
                    <div className="flex-1">
                      <h4 className="font-bold text-base text-[#061B3B]">{trail.title}</h4>
                      <p className="text-xs text-slate-500 mb-2 truncate">{trail.desc}</p>
                      <span
                        className={cn(
                          'text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-500 inline-block',
                          trail.tag,
                        )}
                      >
                        {trail.modules}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Achievement Vault */}
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#061B3B] font-display flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#EAB308]" /> Cofre de Conquistas
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  24/50 Desbloqueadas
                </span>
              </div>
              <div className="flex flex-wrap gap-5">
                {achievements.map((ach, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 w-20">
                    <div
                      className={cn(
                        'w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner',
                        ach.bg,
                        ach.color,
                      )}
                    >
                      <ach.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center leading-tight">
                      {ach.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* AI Brain Card */}
          <Card className="border-none shadow-sm rounded-3xl bg-[#061B3B] overflow-hidden relative flex flex-col h-[400px]">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <BrainCircuit className="w-32 h-32 text-white" />
            </div>
            <CardContent className="p-5 relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#EAB308] rounded-lg text-[#061B3B]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm tracking-wide">RIO SOL AI</h4>
                  <p className="text-[9px] text-[#EAB308] font-bold tracking-widest uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308] animate-pulse"></span>{' '}
                    Ativa
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-4 flex-1 overflow-y-auto pr-1">
                <div className="bg-white/10 text-slate-200 text-xs p-3 rounded-xl rounded-tl-sm border border-white/5 leading-relaxed backdrop-blur-sm">
                  Zenith, analisei sua última simulação. Sua eficiência máxima foi às 08:45 UTC.
                  Foco na dissipação térmica para a próxima rodada.
                </div>
                <div className="bg-[#EAB308]/10 text-white text-xs p-3 rounded-xl rounded-tr-sm border border-[#EAB308]/20 leading-relaxed ml-6 text-right">
                  Entendido. Mostre-me os pontos de calor dessa sessão.
                </div>
              </div>

              <div className="relative mt-auto shrink-0">
                <Input
                  placeholder="Pergunte à IA..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-lg h-10 pl-3 pr-10 text-sm focus-visible:ring-[#EAB308]"
                />
                <Button
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8 bg-[#EAB308] hover:bg-[#d97706] text-[#061B3B] rounded-md"
                >
                  <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rankings Mini */}
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-[#061B3B] font-display">Ranking Global</h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Semana 42
                </span>
              </div>
              <div className="space-y-2">
                {[
                  {
                    rank: '01',
                    name: 'Sarah Flux',
                    role: 'Especialista em Alta Densidade',
                    xp: '12.8k XP',
                    active: false,
                  },
                  {
                    rank: '02',
                    name: 'Marcus Watt',
                    role: 'Gerente de Grid',
                    xp: '11.4k XP',
                    active: false,
                  },
                  {
                    rank: '12',
                    name: 'Você (Zenith)',
                    role: 'Arquiteto Solar',
                    xp: '9.2k XP',
                    active: true,
                  },
                ].map((user, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center gap-3 p-2.5 rounded-xl border transition-colors',
                      user.active
                        ? 'bg-[#061B3B] border-[#061B3B] text-white'
                        : 'bg-white border-slate-100 hover:border-slate-200',
                    )}
                  >
                    <span
                      className={cn(
                        'font-black text-xs w-4 text-center',
                        user.active ? 'text-white' : 'text-slate-400',
                      )}
                    >
                      {user.rank}
                    </span>
                    <div
                      className={cn(
                        'w-8 h-8 rounded-md shrink-0',
                        user.active ? 'bg-[#EAB308]' : 'bg-[#F4F6F8]',
                      )}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'font-bold text-xs truncate',
                          user.active ? 'text-white' : 'text-[#061B3B]',
                        )}
                      >
                        {user.name}
                      </p>
                      <p
                        className={cn(
                          'text-[9px] uppercase tracking-wider truncate',
                          user.active ? 'text-slate-300' : 'text-slate-500',
                        )}
                      >
                        {user.role}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'text-[11px] font-bold shrink-0',
                        user.active ? 'text-[#EAB308]' : 'text-slate-500',
                      )}
                    >
                      {user.xp}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                className="w-full mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-[#061B3B] h-8"
              >
                Ver Ranking Completo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

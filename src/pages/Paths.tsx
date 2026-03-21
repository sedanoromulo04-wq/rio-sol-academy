import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Sparkles, Cpu, UserCircle, Wrench, Clock, BarChart2, Play } from 'lucide-react'

const basicTracks = [
  {
    id: 'cultura',
    category: 'Cultura',
    title: 'Filosofia\n& Ética\nSolar',
    searchTitle: 'Filosofia & Ética Solar',
    modules: 12,
    progress: 85,
    duration: '6h 30m',
    level: 'Avançado',
    icon: Sparkles,
    link: '/trilhas/cultura/lesson/1',
    btnText: 'Continuar Trilha',
  },
  {
    id: 'tecnico',
    category: 'Técnico',
    title: 'Engenharia\nFotovoltaica\nEssencial',
    searchTitle: 'Engenharia Fotovoltaica Essencial',
    modules: 24,
    progress: 32,
    duration: '18h 45m',
    level: 'Especialista',
    icon: Cpu,
    link: '/trilhas/tecnico/lesson/1',
    btnText: 'Continuar Trilha',
  },
  {
    id: 'psicologia',
    category: 'Psicologia',
    title: 'A\nArquitetura\nda Persuasão',
    searchTitle: 'A Arquitetura da Persuasão',
    modules: 8,
    progress: 0,
    duration: '4h 20m',
    level: 'Intermediário',
    icon: UserCircle,
    link: '/trilhas/psicologia/lesson/1',
    btnText: 'Iniciar Trilha',
  },
]

const filters = ['Todas as Trilhas', 'Cultura', 'Técnico', 'Psicologia', 'Prática']

export default function Paths() {
  const [activeFilter, setActiveFilter] = useState('Todas as Trilhas')
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const searchQuery = (searchParams.get('q') || '').toLowerCase()

  const isMatch = (category: string, title: string) => {
    if (activeFilter !== 'Todas as Trilhas' && category !== activeFilter) return false
    if (
      searchQuery &&
      !title.toLowerCase().includes(searchQuery) &&
      !category.toLowerCase().includes(searchQuery)
    )
      return false
    return true
  }

  return (
    <div className="max-w-6xl space-y-10 animate-fade-in-up">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Badge className="bg-[#EAB308] text-[#422006] hover:bg-[#EAB308] rounded-sm text-[10px] font-black px-2.5 py-0.5 tracking-wider border-none uppercase">
            Sistema de Biblioteca
          </Badge>
          <h1 className="text-4xl md:text-[56px] font-black text-[#061B3B] tracking-tight font-display">
            Cérebro de Conhecimento
          </h1>
        </div>
        <p className="text-slate-500 text-lg max-w-3xl leading-relaxed">
          Acesse a lógica fundamental do ecossistema RIO SOL. Aprofunde-se em trilhas desenhadas
          para evolução profissional.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                'rounded-full px-6 font-semibold transition-colors',
                activeFilter === filter
                  ? 'bg-[#061B3B] hover:bg-[#0a2955] text-white border-none'
                  : 'text-slate-600 border border-slate-300 hover:bg-white bg-transparent',
              )}
            >
              {filter}
            </Button>
          ))}
        </div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest shrink-0">
          Ordenar por: <span className="text-[#061B3B] ml-2">Mais Recentes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {basicTracks.map(
          (track) =>
            isMatch(track.category, track.searchTitle) && (
              <Card
                key={track.id}
                className="rounded-3xl border-none shadow-sm shadow-slate-200/50 flex flex-col bg-white"
              >
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-[#061B3B] text-[#EAB308] flex items-center justify-center shadow-inner">
                      <track.icon className="w-7 h-7" />
                    </div>
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                      {track.category}
                    </span>
                  </div>
                  <h3 className="text-[28px] font-bold text-[#061B3B] mb-8 leading-[1.1] font-display whitespace-pre-line">
                    {track.title}
                  </h3>
                  <div className="mt-auto">
                    <Separator className="mb-6 bg-slate-100 h-0.5" />
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
                      <span>{track.modules} Módulos</span>
                      <span className={track.progress > 0 ? 'text-[#9B751D]' : 'text-slate-400'}>
                        {track.progress}% Concluído
                      </span>
                    </div>
                    <Progress
                      value={track.progress}
                      className="h-1.5 mb-6 bg-slate-100 [&>div]:bg-[#D97706]"
                    />
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-6">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" /> {track.duration}
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-slate-400" /> {track.level}
                      </div>
                    </div>
                    <Button asChild className="w-full bg-[#061B3B] hover:bg-[#0a2955] text-white">
                      <Link to={track.link}>{track.btnText}</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ),
        )}

        {isMatch('Prática', 'Maestria em Implantação de Campo') && (
          <Card className="rounded-3xl border-none shadow-sm shadow-slate-200/50 lg:col-span-2 overflow-hidden flex flex-col md:flex-row p-2.5 bg-white">
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-[#061B3B] text-[#EAB308] flex items-center justify-center shadow-inner">
                    <Wrench className="w-7 h-7" />
                  </div>
                  <span className="bg-[#9B751D]/10 text-[#9B751D] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    Prática
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-[#061B3B] mb-4 font-display">
                  Maestria
                  <br />
                  em Implantação
                  <br />
                  de Campo
                </h3>
                <p className="text-slate-500 text-[15px] leading-relaxed mb-8 max-w-sm font-medium">
                  Módulos de simulação avançados para integração de hardware no mundo real e
                  sincronização de grid solar.
                </p>
              </div>
              <div>
                <Separator className="mb-6 bg-slate-100 h-0.5" />
                <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
                  <span>32 Módulos</span>
                  <span className="text-[#9B751D]">55% Concluído</span>
                </div>
                <Progress value={55} className="h-1.5 mb-6 bg-slate-100 [&>div]:bg-[#D97706]" />
                <Button asChild className="w-full bg-[#061B3B] hover:bg-[#0a2955] text-white">
                  <Link to="/simulador">Iniciar Simulação</Link>
                </Button>
              </div>
            </div>
            <div className="relative md:w-[45%] bg-slate-100 rounded-[20px] overflow-hidden min-h-[300px] m-2 md:m-0">
              <img
                src="https://img.usecurling.com/p/800/600?q=tree%20grass"
                className="absolute inset-0 w-full h-full object-cover"
                alt="Video Preview"
              />
              <Link
                to="/simulador"
                className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-all flex items-center justify-center group cursor-pointer"
              >
                <button className="w-16 h-12 bg-[#9B751D] group-hover:bg-[#b48a27] group-hover:scale-105 transition-all rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/20">
                  <Play className="w-6 h-6 fill-current" />
                </button>
              </Link>
            </div>
          </Card>
        )}

        {isMatch('Em Breve', 'Redes de Grid Quântico') && (
          <Card className="rounded-3xl border-none shadow-xl shadow-[#061B3B]/10 bg-[#061B3B] text-white p-8 flex flex-col justify-between">
            <div>
              <span className="bg-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mb-8 inline-block">
                Em Breve
              </span>
              <h3 className="text-3xl md:text-4xl font-bold mb-4 font-display leading-[1.1]">
                Redes de
                <br />
                Grid Quântico
              </h3>
              <p className="text-slate-300/80 text-[15px] leading-relaxed mb-8 font-medium pr-4">
                O futuro da distribuição de energia é descentralizado. Aprenda os protocolos da
                próxima geração.
              </p>
            </div>
            <Button
              onClick={() =>
                toast({
                  title: 'Notificação Configurada',
                  description: 'Você será notificado quando esta trilha estiver disponível.',
                })
              }
              className="w-full bg-[#9B751D] hover:bg-[#7c5d17] text-white font-bold h-14 rounded-xl text-xs tracking-widest uppercase shadow-md shadow-black/20 transition-all"
            >
              Notifique-me
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}

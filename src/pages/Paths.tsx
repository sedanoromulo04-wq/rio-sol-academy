import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  Sparkles,
  Cpu,
  UserCircle,
  Wrench,
  Clock,
  BarChart2,
  Play,
  ChevronDown,
} from 'lucide-react'

const basicTracks = [
  {
    id: 'cultura',
    category: 'Cultura',
    title: 'Filosofia\n& Ética\nSolar',
    searchTitle: 'Filosofia & Ética Solar',
    description:
      'Mergulhe nas raízes filosóficas da transição energética. Entenda como a ética solar molda nossas interações comerciais e fortalece o propósito por trás de cada sistema fotovoltaico implantado, garantindo vendas com significado e impacto sustentável.',
    image: 'https://img.usecurling.com/p/600/400?q=solar%20architecture%20modern&color=blue',
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
    description:
      'Domine os princípios físicos e elétricos dos sistemas solares. De inversores string a microinversores, construa a base técnica necessária para dimensionar corretamente e defender soluções de alto desempenho perante clientes exigentes.',
    image: 'https://img.usecurling.com/p/600/400?q=solar%20panels%20roof&color=black',
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
    description:
      'Desvende os gatilhos mentais e as heurísticas de decisão dos clientes. Aprenda a estruturar narrativas comerciais irrefutáveis, dominar a escuta ativa e contornar objeções complexas específicas do mercado de energia solar.',
    image: 'https://img.usecurling.com/p/600/400?q=business%20meeting%20strategy&color=blue',
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

  const isMatch = (category: string, title: string, description?: string) => {
    if (activeFilter !== 'Todas as Trilhas' && category !== activeFilter) {
      // Especial case for "Prática" mock element which isn't in basicTracks
      if (activeFilter === 'Prática' && category !== 'Prática') return false
      if (activeFilter !== 'Prática') return false
    }

    if (searchQuery) {
      const matchesTitle = title.toLowerCase().includes(searchQuery)
      const matchesCategory = category.toLowerCase().includes(searchQuery)
      const matchesDesc = description ? description.toLowerCase().includes(searchQuery) : false
      if (!matchesTitle && !matchesCategory && !matchesDesc) return false
    }
    return true
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
          Acesse a lógica fundamental do ecossistema RIO SOL. Aprofunde-se em trilhas desenhadas
          para evolução profissional e maestria técnica.
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
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0 px-4">
          Ordenar por: <span className="text-[#061B3B] ml-1">Mais Recentes</span>
        </div>
      </div>

      {/* Grid container with items-start to allow independent collapsible heights without stretching neighbors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {basicTracks.map(
          (track) =>
            isMatch(track.category, track.searchTitle, track.description) && (
              <Card
                key={track.id}
                className="rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col bg-white overflow-hidden group"
              >
                {/* Header Image Area */}
                <div className="relative h-48 w-full overflow-hidden shrink-0">
                  <img
                    src={track.image}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={track.searchTitle}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061B3B] via-[#061B3B]/60 to-transparent" />

                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-[#EAB308] flex items-center justify-center shadow-lg">
                      <track.icon className="w-6 h-6" />
                    </div>
                    <span className="bg-black/30 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {track.category}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-5 right-5 z-10">
                    <h3 className="text-2xl font-black text-white leading-tight font-display whitespace-pre-line drop-shadow-md">
                      {track.title}
                    </h3>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 flex-1 flex flex-col relative bg-white">
                  <Collapsible className="mb-6">
                    <CollapsibleTrigger className="flex items-center gap-2 text-[11px] font-black text-[#9B751D] uppercase tracking-wider hover:text-[#7c5d17] transition-colors [&[data-state=open]>svg]:rotate-180 group/trigger cursor-pointer outline-none">
                      <span>Explorar Contexto Total</span>
                      <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2 overflow-hidden">
                      <div className="mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-slate-600 text-sm leading-relaxed font-medium">
                          {track.description}
                        </p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="mt-auto">
                    <Separator className="mb-5 bg-slate-100 h-px" />
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2.5 uppercase tracking-wider">
                      <span>{track.modules} Módulos</span>
                      <span className={track.progress > 0 ? 'text-[#9B751D]' : 'text-slate-400'}>
                        {track.progress}% Concluído
                      </span>
                    </div>
                    <Progress
                      value={track.progress}
                      className="h-1.5 mb-5 bg-slate-100 [&>div]:bg-[#D97706]"
                    />
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-6 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" /> {track.duration}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <BarChart2 className="w-4 h-4 text-slate-400" /> {track.level}
                      </div>
                    </div>
                    <Button
                      asChild
                      className="w-full bg-[#061B3B] hover:bg-[#0a2955] text-white h-11 text-sm rounded-xl font-bold tracking-wide shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <Link to={track.link}>{track.btnText}</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ),
        )}

        {/* Wide Card - Practical Implementation */}
        {isMatch('Prática', 'Maestria em Implantação de Campo') && (
          <Card className="rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 lg:col-span-2 overflow-hidden flex flex-col md:flex-row bg-white">
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between order-2 md:order-1">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#061B3B] text-[#EAB308] flex items-center justify-center shadow-lg">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <span className="bg-[#9B751D]/10 text-[#9B751D] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#9B751D]/20">
                    Prática
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-[#061B3B] mb-5 font-display leading-tight tracking-tight">
                  Maestria em Implantação de Campo
                </h3>

                <Collapsible className="mb-6">
                  <CollapsibleTrigger className="flex items-center gap-2 text-[11px] font-black text-[#9B751D] uppercase tracking-wider hover:text-[#7c5d17] transition-colors [&[data-state=open]>svg]:rotate-180 group/trigger cursor-pointer outline-none">
                    <span>Detalhes da Simulação</span>
                    <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2 overflow-hidden">
                    <div className="mt-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        Módulos de simulação avançados para integração de hardware no mundo real e
                        sincronização de grid solar. Pratique em ambientes controlados que replicam
                        os desafios diários dos instaladores e engenheiros de campo, elevando seu
                        nível técnico.
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              <div className="mt-4">
                <Separator className="mb-5 bg-slate-100 h-px" />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2.5 uppercase tracking-wider">
                  <span>32 Módulos Práticos</span>
                  <span className="text-[#9B751D]">55% Concluído</span>
                </div>
                <Progress value={55} className="h-1.5 mb-6 bg-slate-100 [&>div]:bg-[#D97706]" />
                <Button
                  asChild
                  className="w-full md:w-auto px-10 bg-[#061B3B] hover:bg-[#0a2955] text-white h-11 text-sm rounded-xl font-bold tracking-wide shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  <Link to="/simulador">Acessar Ambiente</Link>
                </Button>
              </div>
            </div>

            <div className="relative md:w-[45%] bg-slate-900 overflow-hidden min-h-[280px] order-1 md:order-2 group">
              <img
                src="https://img.usecurling.com/p/800/600?q=solar%20panel%20installation&color=blue"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                alt="Simulação Prática"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#061B3B]/90 to-transparent mix-blend-multiply" />
              <Link
                to="/simulador"
                className="absolute inset-0 flex items-center justify-center cursor-pointer group-hover:bg-white/5 transition-colors"
              >
                <div className="w-16 h-16 bg-[#EAB308] hover:bg-[#FDE047] hover:scale-110 transition-all duration-300 rounded-full flex items-center justify-center text-[#061B3B] shadow-2xl shadow-black/40 backdrop-blur-sm relative">
                  <div className="absolute inset-0 rounded-full bg-[#EAB308] animate-ping opacity-20"></div>
                  <Play className="w-6 h-6 fill-current ml-1" />
                </div>
              </Link>
              <div className="absolute bottom-6 right-6 z-10">
                <Badge className="bg-black/50 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-lg">
                  Ambiente Virtual 3D
                </Badge>
              </div>
            </div>
          </Card>
        )}

        {/* Coming Soon Card */}
        {isMatch('Em Breve', 'Redes de Grid Quântico') && (
          <Card className="rounded-3xl border-none shadow-md overflow-hidden relative flex flex-col justify-between group h-[400px]">
            <img
              src="https://img.usecurling.com/p/600/400?q=quantum%20energy%20grid&color=black"
              className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
              alt="Grid Quântico"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061B3B] via-[#061B3B]/90 to-[#061B3B]/40" />

            <div className="relative p-8 flex flex-col h-full z-10">
              <div>
                <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-6 inline-block shadow-sm">
                  Em Breve
                </span>
                <h3 className="text-3xl font-black mb-4 font-display leading-tight text-white drop-shadow-md">
                  Redes de
                  <br />
                  Grid Quântico
                </h3>
                <p className="text-slate-300/90 text-sm leading-relaxed mb-6 font-medium max-w-sm">
                  O futuro da distribuição de energia é descentralizado. Prepare-se para aprender os
                  protocolos da próxima geração de inteligência energética.
                </p>
              </div>
              <div className="mt-auto">
                <Button
                  onClick={() =>
                    toast({
                      title: 'Alerta Ativado',
                      description:
                        'Você será notificado assim que o módulo de Redes Quânticas for liberado.',
                    })
                  }
                  className="w-full bg-[#EAB308] hover:bg-[#FDE047] text-[#061B3B] font-black h-12 rounded-xl text-xs tracking-widest uppercase shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5"
                >
                  Notifique-me
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

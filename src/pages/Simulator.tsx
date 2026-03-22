import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Mic,
  Send,
  History,
  Play,
  CheckCircle2,
  Circle,
  Sparkles,
  Bot,
  User,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const persona = {
  name: 'O Fazendeiro Cético',
  type: 'Persona: Alta Resistência, Alta Lógica',
  img: 'https://img.usecurling.com/ppl/large?gender=male&seed=42',
  stats: [
    { label: 'Paciência', val: 24 },
    { label: 'Conhecimento Técnico', val: 88 },
    { label: 'Sensibilidade ao Orçamento', val: 95 },
  ],
}

export default function Simulator() {
  const [input, setInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="max-w-[1500px] mx-auto h-[calc(100vh-7rem)] flex flex-col animate-fade-in-up">
      {/* Header */}
      <div
        className={cn(
          'flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 transition-all duration-500 ease-in-out overflow-hidden',
          isExpanded ? 'max-h-0 opacity-0 mb-0' : 'max-h-[200px] opacity-100 mb-5 gap-4',
        )}
      >
        <div>
          <p className="text-[9px] font-bold text-[#EAB308] tracking-widest uppercase mb-1">
            Ambiente de Engenharia: Simulação Ativa
          </p>
          <h1 className="text-3xl font-black text-[#061B3B] font-display tracking-tight">
            Laboratório de Roleplay
          </h1>
        </div>
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            className="bg-white border-slate-200 text-[#061B3B] font-semibold h-10 px-4 rounded-lg shadow-sm text-sm"
          >
            <History className="w-3.5 h-3.5 mr-2 text-slate-400" /> Ver Histórico
          </Button>
          <Button className="bg-[#061B3B] hover:bg-[#0a2955] text-white font-semibold h-10 px-4 rounded-lg shadow-sm text-sm">
            <Play className="w-3.5 h-3.5 mr-2 text-[#EAB308]" fill="currentColor" /> Iniciar
            Simulação
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'flex-1 flex flex-col lg:flex-row min-h-0 pb-4 transition-all duration-500',
          isExpanded ? 'gap-0' : 'gap-5',
        )}
      >
        {/* Left Panel Wrapper */}
        <div
          className={cn(
            'transition-all duration-500 ease-in-out overflow-hidden shrink-0 flex flex-col',
            isExpanded
              ? 'max-h-0 lg:max-h-none lg:max-w-0 opacity-0 m-0 p-0'
              : 'max-h-[1200px] lg:max-h-none lg:max-w-[280px] w-full lg:w-[280px] opacity-100',
          )}
        >
          {/* Left Panel: Persona */}
          <div className="flex flex-col gap-4 overflow-y-auto pr-1 h-full w-full lg:w-[280px] shrink-0">
            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden shrink-0">
              <div className="h-48 overflow-hidden relative">
                <img
                  src={persona.img}
                  alt={persona.name}
                  className="w-full h-full object-cover grayscale opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <Badge className="bg-white/20 text-white border-none backdrop-blur-md font-medium px-2 py-0.5 text-[10px]">
                    Alta Lógica
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5">
                <h2 className="text-xl font-bold text-[#061B3B] font-display mb-1 leading-tight">
                  {persona.name}
                </h2>
                <p className="text-[11px] text-slate-500 mb-5">{persona.type}</p>

                <div className="space-y-3.5">
                  {persona.stats.map((s) => (
                    <div key={s.label} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-[#061B3B] uppercase tracking-wider">
                        <span>{s.label}</span>
                        <span className="text-slate-400">{s.val}%</span>
                      </div>
                      <Progress value={s.val} className="h-1 bg-slate-100 [&>div]:bg-[#061B3B]" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl bg-[#061B3B] text-white shrink-0">
              <CardContent className="p-5">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 border-b border-white/10 pb-3">
                  Objetivos Táticos
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300 font-medium leading-snug">
                      Validar ROI em 5 anos
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300 font-medium leading-snug">
                      Abordar medos de manutenção
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300 font-medium leading-snug">
                      Espelhar dialeto regional
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Center Panel Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 h-full transition-all duration-500">
          <Card className="border-none shadow-sm rounded-2xl bg-white flex flex-col overflow-hidden h-full w-full">
            <div className="flex justify-between items-center px-4 sm:px-6 py-3 border-b border-slate-100 bg-slate-50/50 shrink-0 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#061B3B] uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                Simulação ao Vivo {isExpanded && ' (Expandido)'}
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:flex gap-4">
                  <span>
                    Decorrido: <span className="text-[#061B3B]">04:12</span>
                  </span>
                  <span>
                    Tokens: <span className="text-[#061B3B]">1.402</span>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-7 w-7 text-slate-400 hover:text-[#061B3B] hover:bg-slate-200/50 transition-colors"
                  title={isExpanded ? 'Reduzir' : 'Expandir'}
                >
                  {isExpanded ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 sm:p-6">
              <div className="space-y-6 pb-2">
                {/* AI Message */}
                <div className="flex gap-3 max-w-[95%] sm:max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 mt-1">
                    <Bot className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 text-slate-700 text-sm leading-relaxed shadow-sm">
                      <p>
                        Olha, filho. Já tive três empresas de energia solar diferentes passando por
                        aqui na última década. Todas prometem mundos e fundos, mas quando o granizo
                        começa a cair em abril, nenhuma delas sabe me dizer se meus painéis ainda
                        estarão gerando o suficiente para rodar o sistema de irrigação. Por que
                        vocês são diferentes?
                      </p>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 ml-2 block">
                      O Fazendeiro Cético • 2m atrás
                    </span>
                  </div>
                </div>

                {/* User Message */}
                <div className="flex gap-3 max-w-[95%] sm:max-w-[85%] ml-auto flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-[#061B3B] flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="bg-[#061B3B] p-4 rounded-2xl rounded-tr-none text-white text-sm leading-relaxed shadow-sm">
                      <p>
                        Eu entendo completamente essa hesitação. A maioria das empresas foca na
                        'tecnologia', mas esquece da resiliência. Nossos painéis RIO SOL 'Blindados'
                        são testados contra impacto de granizo de 5 cm a 130 km/h. Se eles falharem,
                        nosso seguro Zenith cobre a produção perdida, não apenas o hardware. Aqui
                        está a especificação técnica...
                      </p>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 mr-2 block text-right">
                      Você • 1m atrás
                    </span>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
              <div className="relative flex items-center">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EAB308] rounded-l-lg z-10" />
                <Input
                  placeholder="Sua resposta..."
                  className="bg-slate-50 border-slate-200 shadow-inner h-12 pl-5 pr-20 rounded-lg text-sm focus-visible:ring-[#061B3B] focus-visible:border-[#061B3B] w-full"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <div className="absolute right-1.5 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-[#061B3B] h-9 w-9"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    className="bg-[#061B3B] hover:bg-[#0a2955] text-white rounded-md h-9 w-9 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5 ml-0.5" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel Wrapper */}
        <div
          className={cn(
            'transition-all duration-500 ease-in-out overflow-hidden shrink-0 flex flex-col',
            isExpanded
              ? 'max-h-0 lg:max-h-none lg:max-w-0 opacity-0 m-0 p-0'
              : 'max-h-[1200px] lg:max-h-none lg:max-w-[280px] w-full lg:w-[280px] opacity-100',
          )}
        >
          {/* Right Panel: Feedback */}
          <div className="flex flex-col gap-4 overflow-y-auto pl-1 h-full w-full lg:w-[280px] shrink-0">
            <Card className="border-none shadow-sm rounded-2xl bg-white shrink-0">
              <CardContent className="p-5">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Feedback em Tempo Real
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Persuasão', val: 72, color: 'bg-[#EAB308]' },
                    { label: 'Aderência ao Framework', val: 89, color: 'bg-[#061B3B]' },
                    { label: 'Tom (Empatia)', val: 54, color: 'bg-slate-300' },
                  ].map((s) => (
                    <div key={s.label} className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold text-[#061B3B]">
                        <span>{s.label}</span>
                        <span>{s.val}%</span>
                      </div>
                      <Progress
                        value={s.val}
                        className="h-1.5 bg-slate-100 [&>div]:transition-all"
                        style={{ '--progress-background': s.color } as any}
                      >
                        <div
                          className={`h-full w-full flex-1 transition-all ${s.color}`}
                          style={{ transform: `translateX(-${100 - (s.val || 0)}%)` }}
                        />
                      </Progress>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl bg-white relative overflow-hidden shrink-0">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#061B3B]" />
              <CardContent className="p-5 pl-6">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#061B3B]" /> Insights do Mentor
                </h3>
                <p className="text-xs text-[#061B3B] font-medium italic leading-relaxed mb-4">
                  "Excelente mudança para a durabilidade. No entanto, seu tom mudou muito rápido
                  para vendas. Tente usar mais 'nós' em vez de 'eu'."
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Tente esta frase:
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium leading-snug">
                    "Nossa turma por aqui ainda não viu uma tempestade que conseguisse rachar
                    esses..."
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3 shrink-0">
              <Card className="border-none shadow-sm rounded-xl bg-white text-center py-4">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Objeções
                </p>
                <p className="text-2xl font-black text-[#061B3B] font-display leading-none">
                  3<span className="text-sm text-slate-300">/12</span>
                </p>
              </Card>
              <Card className="border-none shadow-sm rounded-xl bg-white text-center py-4">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Clareza
                </p>
                <p className="text-xl font-black text-[#061B3B] font-display leading-none mt-1">
                  Alta
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

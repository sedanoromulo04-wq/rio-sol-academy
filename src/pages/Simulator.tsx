import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Mic, Send, History, Play, CheckCircle2, Circle, Sparkles, Bot, User } from 'lucide-react'

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

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-8rem)] flex flex-col animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <p className="text-[10px] font-bold text-[#EAB308] tracking-widest uppercase mb-1">
            Ambiente de Engenharia: Simulação Ativa
          </p>
          <h1 className="text-4xl font-black text-[#061B3B] font-display tracking-tight">
            Laboratório de Roleplay
          </h1>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-white border-slate-200 text-[#061B3B] font-semibold h-11 px-6 rounded-xl shadow-sm"
          >
            <History className="w-4 h-4 mr-2 text-slate-400" /> Ver Histórico
          </Button>
          <Button className="bg-[#061B3B] hover:bg-[#0a2955] text-white font-semibold h-11 px-6 rounded-xl shadow-md">
            <Play className="w-4 h-4 mr-2 text-[#EAB308]" fill="currentColor" /> Iniciar Simulação
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] gap-6 min-h-0">
        {/* Left Panel: Persona */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
          <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden shrink-0">
            <div className="h-64 overflow-hidden relative">
              <img
                src={persona.img}
                alt={persona.name}
                className="w-full h-full object-cover grayscale opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <Badge className="bg-white/20 text-white border-none backdrop-blur-sm font-medium px-2 py-0.5 mb-2">
                  Alta Lógica
                </Badge>
              </div>
            </div>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-[#061B3B] font-display mb-1">
                {persona.name}
              </h2>
              <p className="text-xs text-slate-500 mb-6">{persona.type}</p>

              <div className="space-y-4">
                {persona.stats.map((s) => (
                  <div key={s.label} className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-[#061B3B] uppercase tracking-wider">
                      <span>{s.label}</span>
                      <span className="text-slate-400">{s.val}%</span>
                    </div>
                    <Progress value={s.val} className="h-1.5 bg-slate-100 [&>div]:bg-[#061B3B]" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md rounded-3xl bg-[#061B3B] text-white shrink-0">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                Objetivos Táticos
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#EAB308] shrink-0" />
                  <span className="text-sm text-slate-300 font-medium">Validar ROI em 5 anos</span>
                </li>
                <li className="flex items-start gap-3">
                  <Circle className="w-5 h-5 text-slate-500 shrink-0" />
                  <span className="text-sm text-slate-300 font-medium">
                    Abordar medos de manutenção
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Circle className="w-5 h-5 text-slate-500 shrink-0" />
                  <span className="text-sm text-slate-300 font-medium">
                    Espelhar dialeto regional
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Center Panel: Chat */}
        <Card className="border-none shadow-sm rounded-3xl bg-white flex flex-col overflow-hidden">
          <div className="flex justify-between items-center px-8 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 text-xs font-bold text-[#061B3B] uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Simulação ao Vivo
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex gap-4">
              <span>
                Decorrido: <span className="text-[#061B3B]">04:12</span>
              </span>
              <span>
                Tokens: <span className="text-[#061B3B]">1.402</span>
              </span>
            </div>
          </div>

          <ScrollArea className="flex-1 p-8">
            <div className="space-y-8 pb-4">
              {/* AI Message */}
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                  <Bot className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <div className="bg-slate-50 p-5 rounded-2xl rounded-tl-none border border-slate-100 text-slate-700 leading-relaxed shadow-sm">
                    <p>
                      Olha, filho. Já tive três empresas de energia solar diferentes passando por
                      aqui na última década. Todas prometem mundos e fundos, mas quando o granizo
                      começa a cair em abril, nenhuma delas sabe me dizer se meus painéis ainda
                      estarão gerando o suficiente para rodar o sistema de irrigação. Por que vocês
                      são diferentes?
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-2 block">
                    O Fazendeiro Cético • 2m atrás
                  </span>
                </div>
              </div>

              {/* User Message */}
              <div className="flex gap-4 max-w-[85%] ml-auto flex-row-reverse">
                <div className="w-10 h-10 rounded-full bg-[#061B3B] flex items-center justify-center shrink-0 shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="bg-[#061B3B] p-5 rounded-2xl rounded-tr-none text-white leading-relaxed shadow-md">
                    <p>
                      Eu entendo completamente essa hesitação. A maioria das empresas foca na
                      'tecnologia', mas esquece da resiliência. Nossos painéis RIO SOL 'Blindados'
                      são testados contra impacto de granizo de 5 cm a 130 km/h. Se eles falharem,
                      nosso seguro Zenith cobre a produção perdida, não apenas o hardware. Aqui está
                      a especificação técnica...
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 mr-2 block text-right">
                    Você • 1m atrás
                  </span>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 bg-white border-t border-slate-100">
            <div className="relative flex items-center">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EAB308] rounded-l-xl z-10" />
              <Input
                placeholder="Digite sua mensagem para o Fazendeiro..."
                className="bg-slate-50 border-slate-200 shadow-inner h-14 pl-6 pr-24 rounded-xl text-base focus-visible:ring-[#061B3B] focus-visible:border-[#061B3B] w-full"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="absolute right-2 flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#061B3B]">
                  <Mic className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  className="bg-[#061B3B] hover:bg-[#0a2955] text-white rounded-lg h-10 w-10 shadow-md"
                >
                  <Send className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Panel: Feedback */}
        <div className="flex flex-col gap-6 overflow-y-auto pl-2 pb-4">
          <Card className="border-none shadow-sm rounded-3xl bg-white shrink-0">
            <CardContent className="p-6">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                Feedback em Tempo Real
              </h3>
              <div className="space-y-5">
                {[
                  { label: 'Persuasão', val: 72, color: 'bg-[#EAB308]' },
                  { label: 'Aderência ao Framework', val: 89, color: 'bg-[#061B3B]' },
                  { label: 'Tom (Empatia)', val: 54, color: 'bg-slate-300' },
                ].map((s) => (
                  <div key={s.label} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-[#061B3B]">
                      <span>{s.label}</span>
                      <span>{s.val}%</span>
                    </div>
                    <Progress
                      value={s.val}
                      className="h-2 bg-slate-100 [&>div]:transition-all"
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

          <Card className="border-none shadow-sm rounded-3xl bg-white relative overflow-hidden shrink-0">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#061B3B]" />
            <CardContent className="p-6 pl-8">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#061B3B]" /> Insights do Mentor IA
              </h3>
              <p className="text-sm text-[#061B3B] font-medium italic leading-relaxed mb-6">
                "Excelente mudança para a durabilidade. No entanto, seu tom mudou muito rápido para
                uma linguagem de vendas. O fazendeiro valoriza a solidariedade regional — tente usar
                mais 'nós' em vez de 'eu'."
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Tente esta frase:
                </p>
                <p className="text-sm text-slate-600 font-medium">
                  "Nossa turma por aqui ainda não viu uma tempestade que conseguisse rachar
                  esses..."
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4 shrink-0">
            <Card className="border-none shadow-sm rounded-2xl bg-white text-center py-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Objeções
              </p>
              <p className="text-3xl font-black text-[#061B3B] font-display">
                3<span className="text-xl text-slate-300">/12</span>
              </p>
            </Card>
            <Card className="border-none shadow-sm rounded-2xl bg-white text-center py-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Clareza
              </p>
              <p className="text-2xl font-black text-[#061B3B] font-display mt-1">Alta</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

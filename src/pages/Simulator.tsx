import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import useUserStore from '@/stores/useUserStore'
import {
  simulateRoleplay,
  getMentorFeedback,
  loadChatHistory,
  saveChatMessage,
  Message,
} from '@/services/ai-mentor'

const personas = [
  {
    id: '1',
    name: 'O Fazendeiro Cético',
    type: 'Alta Resistência, Alta Lógica',
    img: 'https://img.usecurling.com/ppl/large?gender=male&seed=42',
    stats: [
      { label: 'Paciência', val: 24 },
      { label: 'Conhec. Técnico', val: 88 },
      { label: 'Foco no Orçamento', val: 95 },
    ],
    objectives: [
      'Validar ROI em 5 anos',
      'Abordar medos de manutenção',
      'Espelhar dialeto regional',
    ],
    initialMessage:
      'Olha, filho. Já tive três empresas de energia solar diferentes passando por aqui na última década. Todas prometem mundos e fundos, mas quando o granizo começa a cair em abril, nenhuma delas sabe me dizer se meus painéis ainda estarão gerando o suficiente para rodar o sistema de irrigação. Por que vocês são diferentes?',
  },
  {
    id: '2',
    name: 'A CEO Impaciente',
    type: 'Baixa Paciência, Foco em ROI Rápido',
    img: 'https://img.usecurling.com/ppl/large?gender=female&seed=15',
    stats: [
      { label: 'Paciência', val: 10 },
      { label: 'Conhec. Técnico', val: 40 },
      { label: 'Foco no Orçamento', val: 80 },
    ],
    objectives: ['Ir direto ao ponto', 'Mostrar Payback de 3 anos', 'Focar na operação'],
    initialMessage:
      'Tenho 5 minutos antes da minha próxima call. Me diga rápido: em quanto tempo essa usina se paga e como garantem que não vão parar a minha linha de produção?',
  },
  {
    id: '3',
    name: 'O Engenheiro Detalhista',
    type: 'Alta Lógica, Foco Técnico',
    img: 'https://img.usecurling.com/ppl/large?gender=male&seed=88',
    stats: [
      { label: 'Paciência', val: 60 },
      { label: 'Conhec. Técnico', val: 98 },
      { label: 'Foco no Orçamento', val: 50 },
    ],
    objectives: ['Explicar inversor', 'Discutir perdas', 'Demonstrar autoridade'],
    initialMessage:
      'Eu li a proposta de vocês. Notei que sugerem inversores string, mas para o nível de sombreamento do nosso telhado, não seria mais eficiente usar microinversores? Qual a taxa de derating calculada?',
  },
  {
    id: '4',
    name: 'O Dono de Padaria',
    type: 'Baixo Orçamento, Crédito',
    img: 'https://img.usecurling.com/ppl/large?gender=male&seed=12',
    stats: [
      { label: 'Paciência', val: 70 },
      { label: 'Conhec. Técnico', val: 15 },
      { label: 'Foco no Orçamento', val: 100 },
    ],
    objectives: ['Ancorar parcela', 'Troca de despesa', 'Gerar empatia'],
    initialMessage:
      'Rapaz, a conta de luz tá quase 8 mil por mês! Mas eu não tenho 150 mil reais pra comprar essas placas agora. Padeiro vive do fluxo de caixa diário, sabe como é...',
  },
  {
    id: '5',
    name: 'A Síndica Sustentável',
    type: 'Foco Ecológico, Média Resistência',
    img: 'https://img.usecurling.com/ppl/large?gender=female&seed=99',
    stats: [
      { label: 'Paciência', val: 80 },
      { label: 'Conhec. Técnico', val: 30 },
      { label: 'Foco no Orçamento', val: 60 },
    ],
    objectives: ['Marketing verde', 'Assembleia', 'Rateio de energia'],
    initialMessage:
      'Os condôminos aprovaram buscar orçamentos. Queremos o prédio mais "verde" do bairro. Mas como funciona a divisão dessa energia gerada entre os apartamentos e a área comum?',
  },
  {
    id: '6',
    name: 'O Investidor Calculista',
    type: 'Foco Exclusivo em Payback',
    img: 'https://img.usecurling.com/ppl/large?gender=male&seed=55',
    stats: [
      { label: 'Paciência', val: 40 },
      { label: 'Conhec. Técnico', val: 50 },
      { label: 'Foco no Orçamento', val: 100 },
    ],
    objectives: ['Apresentar VPL e TIR', 'Comparar com CDI', 'Sem tecniquês'],
    initialMessage:
      'Não me fale de sustentabilidade. Eu olho pros números. Se a TIR for menor que deixar o dinheiro rendendo no CDI a 10.5%, eu não faço negócio. O que você me entrega?',
  },
  {
    id: '7',
    name: 'O Empresário Desconfiado',
    type: 'Medo de Golpes, Requer Provas',
    img: 'https://img.usecurling.com/ppl/large?gender=male&seed=33',
    stats: [
      { label: 'Paciência', val: 30 },
      { label: 'Conhec. Técnico', val: 20 },
      { label: 'Foco no Orçamento', val: 70 },
    ],
    objectives: ['Apresentar portfólio', 'Seguro e garantias', 'Credibilidade'],
    initialMessage:
      'Meu cunhado comprou solar de uma empresinha ano passado, pagou adiantado e os caras sumiram. Quem me garante que a RIO SOL não vai fazer a mesma coisa? Vocês tem seguro?',
  },
  {
    id: '8',
    name: 'O Gestor de Galpão',
    type: 'Foco em Escala e Manutenção',
    img: 'https://img.usecurling.com/ppl/large?gender=male&seed=77',
    stats: [
      { label: 'Paciência', val: 50 },
      { label: 'Conhec. Técnico', val: 60 },
      { label: 'Foco no Orçamento', val: 85 },
    ],
    objectives: ['Plano de O&M', 'Sobrecarga no telhado', 'Durabilidade'],
    initialMessage:
      'Temos 10 mil m2 de telhado. Minha preocupação: se eu colocar toneladas de painéis lá, não vai dar goteira? E quem vai limpar essa imensidão toda depois?',
  },
  {
    id: '9',
    name: 'A Diretora de Hospital',
    type: 'Segurança e Baixo Risco',
    img: 'https://img.usecurling.com/ppl/large?gender=female&seed=22',
    stats: [
      { label: 'Paciência', val: 65 },
      { label: 'Conhec. Técnico', val: 40 },
      { label: 'Foco no Orçamento', val: 55 },
    ],
    objectives: ['Compatibilidade c/ gerador', 'Certificações', 'Confiabilidade'],
    initialMessage:
      'Trabalhamos com vidas humanas aqui. Precisamos de energia barata, mas não posso arriscar nenhum milissegundo de oscilação nas UTIs. Como o sistema lida com nossos geradores a diesel?',
  },
  {
    id: '10',
    name: 'O Comerciante Pechincheiro',
    type: 'Relacional, Busca Desconto',
    img: 'https://img.usecurling.com/ppl/large?gender=male&seed=8',
    stats: [
      { label: 'Paciência', val: 90 },
      { label: 'Conhec. Técnico', val: 10 },
      { label: 'Foco no Orçamento', val: 100 },
    ],
    objectives: ['Valor vs preço', 'Rapport', 'Defender margem'],
    initialMessage:
      'Meu amigo, gostei muito de você! Mas a concorrência ali da esquina fez o mesmo projeto por 10 mil reais a menos. Se você cobrir o preço deles, a gente fecha agora!',
  },
]

export default function Simulator() {
  const { profile } = useUserStore()
  const [activePersonaId, setActivePersonaId] = useState<string>('1')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [mentorFeedback, setMentorFeedback] = useState<string>(
    'Inicie a conversa para receber insights em tempo real.',
  )
  const scrollRef = useRef<HTMLDivElement>(null)

  const activePersona = personas.find((p) => p.id === activePersonaId) || personas[0]

  useEffect(() => {
    if (!profile) return
    let isMounted = true
    const fetchHistory = async () => {
      try {
        const history = await loadChatHistory(profile.id, `simulator-${activePersonaId}`)
        if (!isMounted) return
        if (history.length > 0) {
          setMessages(history)
        } else {
          const initialMsg: Message = { role: 'assistant', content: activePersona.initialMessage }
          await saveChatMessage(profile.id, `simulator-${activePersonaId}`, initialMsg)
          if (isMounted) setMessages([initialMsg])
        }
        if (isMounted) setMentorFeedback('Inicie a conversa para receber insights em tempo real.')
      } catch (err) {
        console.error(err)
      }
    }
    fetchHistory()
    return () => {
      isMounted = false
    }
  }, [profile, activePersonaId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping || !profile) return
    const userMsgContent = input.trim()
    setInput('')

    const tempUserMsg: Message = { role: 'user', content: userMsgContent }
    setMessages((prev) => [...prev, tempUserMsg])
    setIsTyping(true)
    setMentorFeedback('Analisando sua resposta...')

    try {
      await saveChatMessage(profile.id, `simulator-${activePersonaId}`, tempUserMsg)

      const [reply, feedback] = await Promise.all([
        simulateRoleplay([...messages, tempUserMsg], activePersona),
        getMentorFeedback(userMsgContent, activePersona),
      ])

      const assistantMsg: Message = { role: 'assistant', content: reply }
      await saveChatMessage(profile.id, `simulator-${activePersonaId}`, assistantMsg)

      setMessages((prev) => [...prev, assistantMsg])
      setMentorFeedback(feedback)
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Desculpe, a conexão caiu no meio da frase. Pode repetir?' },
      ])
      setMentorFeedback('Erro ao conectar com a IA. Verifique sua conexão e tente novamente.')
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="max-w-[1500px] mx-auto h-[calc(100vh-7rem)] flex flex-col animate-fade-in-up">
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
            <Play className="w-3.5 h-3.5 mr-2 text-[#EAB308]" fill="currentColor" /> Nova Simulação
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'flex-1 flex flex-col lg:flex-row min-h-0 pb-4 transition-all duration-500',
          isExpanded ? 'gap-0' : 'gap-5',
        )}
      >
        <div
          className={cn(
            'transition-all duration-500 ease-in-out overflow-hidden shrink-0 flex flex-col',
            isExpanded
              ? 'max-h-0 lg:max-h-none lg:max-w-0 opacity-0 m-0 p-0'
              : 'max-h-[1200px] lg:max-h-none lg:max-w-[280px] w-full lg:w-[280px] opacity-100',
          )}
        >
          <div className="flex flex-col gap-4 overflow-y-auto pr-1 h-full w-full lg:w-[280px] shrink-0">
            <div className="shrink-0">
              <Select value={activePersonaId} onValueChange={setActivePersonaId}>
                <SelectTrigger className="bg-white border-slate-200 shadow-sm text-[#061B3B] font-bold h-12 rounded-xl w-full">
                  <SelectValue placeholder="Selecione um perfil..." />
                </SelectTrigger>
                <SelectContent>
                  {personas.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="font-medium text-xs">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden shrink-0">
              <div className="h-48 overflow-hidden relative">
                <img
                  src={activePersona.img}
                  alt={activePersona.name}
                  className="w-full h-full object-cover grayscale opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <Badge className="bg-white/20 text-white border-none backdrop-blur-md font-medium px-2 py-0.5 text-[10px]">
                    {activePersona.type.split(',')[0]}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5">
                <h2 className="text-xl font-bold text-[#061B3B] font-display mb-1 leading-tight">
                  {activePersona.name}
                </h2>
                <p className="text-[11px] text-slate-500 mb-5">{activePersona.type}</p>

                <div className="space-y-3.5">
                  {activePersona.stats.map((s) => (
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
                  {activePersona.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Circle className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-300 font-medium leading-snug">{obj}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

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

            <div className="flex-1 overflow-y-auto p-4 sm:p-6" ref={scrollRef}>
              <div className="space-y-6 pb-2">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex gap-3 max-w-[95%] sm:max-w-[85%]',
                      msg.role === 'user' ? 'ml-auto flex-row-reverse' : '',
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1',
                        msg.role === 'user'
                          ? 'bg-[#061B3B] shadow-sm'
                          : 'bg-slate-100 border border-slate-200',
                      )}
                    >
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <div
                        className={cn(
                          'p-4 rounded-2xl text-sm leading-relaxed shadow-sm',
                          msg.role === 'user'
                            ? 'bg-[#061B3B] text-white rounded-tr-none'
                            : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none',
                        )}
                      >
                        <p>{msg.content}</p>
                      </div>
                      <span
                        className={cn(
                          'text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 block',
                          msg.role === 'user' ? 'mr-2 text-right' : 'ml-2',
                        )}
                      >
                        {msg.role === 'user' ? 'Você' : activePersona.name}
                      </span>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3 max-w-[95%] sm:max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 mt-1">
                      <Bot className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 text-slate-700 text-sm leading-relaxed shadow-sm flex items-center gap-1 h-12">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
              <div className="relative flex items-center">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EAB308] rounded-l-lg z-10" />
                <Input
                  placeholder="Sua resposta..."
                  className="bg-slate-50 border-slate-200 shadow-inner h-12 pl-5 pr-20 rounded-lg text-sm focus-visible:ring-[#061B3B] focus-visible:border-[#061B3B] w-full"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isTyping}
                />
                <div className="absolute right-1.5 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-[#061B3B] h-9 w-9"
                    disabled={isTyping}
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isTyping}
                    className="bg-[#061B3B] hover:bg-[#0a2955] text-white rounded-md h-9 w-9 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5 ml-0.5" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div
          className={cn(
            'transition-all duration-500 ease-in-out overflow-hidden shrink-0 flex flex-col',
            isExpanded
              ? 'max-h-0 lg:max-h-none lg:max-w-0 opacity-0 m-0 p-0'
              : 'max-h-[1200px] lg:max-h-none lg:max-w-[280px] w-full lg:w-[280px] opacity-100',
          )}
        >
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
                <p className="text-xs text-[#061B3B] font-medium italic leading-relaxed mb-0">
                  {mentorFeedback}
                </p>
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

import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import useUserStore from '@/stores/useUserStore'
import {
  buildSimulatorSessionId,
  getMentorFeedback,
  getRoleplayEvaluationsFromMessages,
  getVisibleChatMessages,
  loadChatHistory,
  loadLatestSimulatorSessionId,
  loadSimulatorSessions,
  saveChatMessage,
  saveRoleplayActivity,
  saveRoleplayEvaluationMessage,
  simulateRoleplay,
  type Message,
  type RoleplayEvaluation,
  type RoleplaySessionSummary,
} from '@/services/ai-mentor'
import { Bot, Circle, Clock3, History, Maximize2, Medal, Mic, Minimize2, Play, Send, Sparkles, User } from 'lucide-react'

const personas = [
  { id: '1', name: 'O Fazendeiro Cetico', type: 'Alta Resistencia, Alta Logica', img: 'https://img.usecurling.com/ppl/large?gender=male&seed=42', stats: [{ label: 'Paciencia', val: 24 }, { label: 'Conhec. Tecnico', val: 88 }, { label: 'Foco no Orcamento', val: 95 }], objectives: ['Validar ROI', 'Abordar manutencao', 'Espelhar dialeto'], openingLines: ['Ja ouvi muita promessa em energia solar. O que a RIO SOL faz de diferente para eu confiar e manter minha irrigacao segura?', 'Se eu colocar isso na fazenda e der problema na safra, quem vai responder? Me explique por que eu deveria confiar em voces.', 'Nao quero discurso bonito. Quero saber como esse projeto protege minha operacao de irrigacao na pratica.'] },
  { id: '2', name: 'A CEO Impaciente', type: 'Baixa Paciencia, ROI Rapido', img: 'https://img.usecurling.com/ppl/large?gender=female&seed=15', stats: [{ label: 'Paciencia', val: 10 }, { label: 'Conhec. Tecnico', val: 40 }, { label: 'Foco no Orcamento', val: 80 }], objectives: ['Ir ao ponto', 'Mostrar payback', 'Proteger operacao'], openingLines: ['Tenho cinco minutos. Em quanto tempo isso se paga e como voce garante que minha producao nao para?', 'Vou direto ao ponto: qual o payback real e qual o risco operacional durante a implantacao?', 'Se eu tirar verba de outro projeto para solar, qual retorno objetivo voce me entrega e em quanto tempo?'] },
  { id: '3', name: 'O Engenheiro Detalhista', type: 'Alta Logica, Foco Tecnico', img: 'https://img.usecurling.com/ppl/large?gender=male&seed=88', stats: [{ label: 'Paciencia', val: 60 }, { label: 'Conhec. Tecnico', val: 98 }, { label: 'Foco no Orcamento', val: 50 }], objectives: ['Explicar inversor', 'Discutir perdas', 'Demonstrar autoridade'], openingLines: ['Por que voces sugerem inversor string nesse telhado com sombreamento? Qual o derating estimado?', 'Antes de falarmos de proposta, me diga como voces trataram perdas por temperatura, mismatch e sombreamento parcial.', 'Quero entender o racional tecnico do arranjo. Voces modelaram geracao com qual premissa de degradacao e indisponibilidade?'] },
  { id: '4', name: 'O Dono de Padaria', type: 'Baixo Orcamento, Credito', img: 'https://img.usecurling.com/ppl/large?gender=male&seed=12', stats: [{ label: 'Paciencia', val: 70 }, { label: 'Conhec. Tecnico', val: 15 }, { label: 'Foco no Orcamento', val: 100 }], objectives: ['Ancorar parcela', 'Troca de despesa', 'Gerar empatia'], openingLines: ['Minha conta de luz passou de 8 mil por mes, mas eu nao tenho caixa para comprar tudo agora. Como voce resolve isso?', 'Se eu tiver que colocar dinheiro alto de entrada, nao consigo. Como isso cabe no meu fluxo de caixa sem me apertar?', 'Eu topo ouvir, mas preciso entender em parcela, economia e quando isso comeca a aliviar meu caixa.'] },
  { id: '5', name: 'A Sindica Sustentavel', type: 'Foco Ecologico, Media Resistencia', img: 'https://img.usecurling.com/ppl/large?gender=female&seed=99', stats: [{ label: 'Paciencia', val: 80 }, { label: 'Conhec. Tecnico', val: 30 }, { label: 'Foco no Orcamento', val: 60 }], objectives: ['Marketing verde', 'Assembleia', 'Rateio'], openingLines: ['Queremos o predio mais verde do bairro. Como a energia gerada pode ser distribuida entre apartamentos e area comum?', 'A assembleia vai cobrar clareza. Como eu explico rateio, beneficio coletivo e retorno para os moradores?', 'Sustentabilidade ajuda, mas eu preciso convencer o condominio. Como isso vira argumento pratico para aprovacao em assembleia?'] },
  { id: '6', name: 'O Investidor Calculista', type: 'Foco Exclusivo em Payback', img: 'https://img.usecurling.com/ppl/large?gender=male&seed=55', stats: [{ label: 'Paciencia', val: 40 }, { label: 'Conhec. Tecnico', val: 50 }, { label: 'Foco no Orcamento', val: 100 }], objectives: ['Apresentar VPL', 'Comparar com CDI', 'Sem floreio'], openingLines: ['Se a TIR for menor que o CDI, eu nao faco negocio. O que voce me entrega de numero real?', 'Nao me venda sustentabilidade. Compare esse projeto com o retorno financeiro que eu teria deixando o capital investido.', 'Quero numero, nao entusiasmo. Qual VPL, qual TIR e qual sensibilidade se a tarifa variar menos do que voces projetam?'] },
  { id: '7', name: 'O Empresario Desconfiado', type: 'Medo de Golpes, Requer Provas', img: 'https://img.usecurling.com/ppl/large?gender=male&seed=33', stats: [{ label: 'Paciencia', val: 30 }, { label: 'Conhec. Tecnico', val: 20 }, { label: 'Foco no Orcamento', val: 70 }], objectives: ['Apresentar portfolio', 'Seguro', 'Credibilidade'], openingLines: ['Ja vi empresa vender, sumir e deixar cliente na mao. Que prova voce me da de que isso nao vai acontecer aqui?', 'Todo mundo fala bonito antes de fechar. O que voces mostram de concreto para eu nao cair numa promessa vazia?', 'Se der problema depois da assinatura, quem aparece aqui? Eu quero prova de estrutura, time e pos-venda.'] },
  { id: '8', name: 'O Gestor de Galpao', type: 'Escala e Manutencao', img: 'https://img.usecurling.com/ppl/large?gender=male&seed=77', stats: [{ label: 'Paciencia', val: 50 }, { label: 'Conhec. Tecnico', val: 60 }, { label: 'Foco no Orcamento', val: 85 }], objectives: ['Plano de O&M', 'Sobrecarga', 'Durabilidade'], openingLines: ['Tenho 10 mil m2 de telhado. Isso nao vai gerar goteira, peso excessivo ou custo absurdo de limpeza?', 'Meu medo e instalar e depois carregar a operacao com manutencao, limpeza e risco estrutural. Como voces tratam isso?', 'Se eu liberar o telhado, preciso de garantia sobre carga, estanqueidade e um plano de O&M que faca sentido.'] },
  { id: '9', name: 'A Diretora de Hospital', type: 'Seguranca e Baixo Risco', img: 'https://img.usecurling.com/ppl/large?gender=female&seed=22', stats: [{ label: 'Paciencia', val: 65 }, { label: 'Conhec. Tecnico', val: 40 }, { label: 'Foco no Orcamento', val: 55 }], objectives: ['Compatibilidade c/ gerador', 'Certificacoes', 'Confiabilidade'], openingLines: ['Nao posso arriscar oscilacao nas UTIs. Como o sistema convive com nossos geradores e com a exigencia de confiabilidade?', 'Meu foco e risco zero para area critica. Onde a energia solar entra sem comprometer seguranca, continuidade e compliance?', 'Antes de falar em economia, me mostre como voces preservam confiabilidade hospitalar e integracao com a infraestrutura existente.'] },
  { id: '10', name: 'O Comerciante Pechincheiro', type: 'Relacional, Busca Desconto', img: 'https://img.usecurling.com/ppl/large?gender=male&seed=8', stats: [{ label: 'Paciencia', val: 90 }, { label: 'Conhec. Tecnico', val: 10 }, { label: 'Foco no Orcamento', val: 100 }], objectives: ['Valor vs preco', 'Rapport', 'Defender margem'], openingLines: ['Gostei de voce, mas a concorrencia fez 10 mil a menos. Se voce cobrir, a gente fecha agora.', 'Eu fecho rapido, mas voce vai ter que melhorar esse preco. O que da para fazer hoje sem enrolacao?', 'A proposta esta boa, mas se nao tiver um gesto comercial forte eu vou fechar com o outro fornecedor.'] },
]

const emptyEvaluation: RoleplayEvaluation = { feedback: 'Inicie a conversa para receber uma avaliacao em tempo real.', score: 0, scores: { persuasao: 0, clareza: 0, empatia: 0, aderencia: 0 }, nextAction: '' }

const formatDuration = (startedAt: string | null, tick: number) => {
  if (!startedAt) return '00:00'
  const totalSeconds = Math.max(0, Math.floor((tick - new Date(startedAt).getTime()) / 1000))
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

const pickPersonaOpening = (persona: (typeof personas)[number], sessionId: string) => {
  const lines = persona.openingLines?.length ? persona.openingLines : ['Vamos comecar.']
  const hash = [...sessionId].reduce((total, char) => total + char.charCodeAt(0), 0)
  return lines[hash % lines.length]
}

export default function Simulator() {
  const { profile } = useUserStore()
  const [activePersonaId, setActivePersonaId] = useState('1')
  const [currentSessionId, setCurrentSessionId] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historySessions, setHistorySessions] = useState<RoleplaySessionSummary[]>([])
  const [startedAt, setStartedAt] = useState<string | null>(null)
  const [clockTick, setClockTick] = useState(Date.now())
  const [isTensionMode, setIsTensionMode] = useState(false)
  const [currentEvaluation, setCurrentEvaluation] = useState<RoleplayEvaluation>(emptyEvaluation)
  const [mentorFeedback, setMentorFeedback] = useState(emptyEvaluation.feedback)
  const pendingSessionIdRef = useRef<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const activePersona = personas.find((item) => item.id === activePersonaId) || personas[0]
  const visibleMessages = useMemo(() => getVisibleChatMessages(messages), [messages])
  const evaluations = useMemo(() => getRoleplayEvaluationsFromMessages(messages), [messages])
  const activePersonaHistory = historySessions.filter((session) => session.personaId === activePersonaId)
  const tokensEstimate = useMemo(() => Math.round(visibleMessages.reduce((sum, item) => sum + item.content.length, 0) / 4), [visibleMessages])

  const refreshHistory = async () => {
    if (!profile) return
    setHistoryLoading(true)
    try {
      setHistorySessions(await loadSimulatorSessions(profile.id))
    } finally {
      setHistoryLoading(false)
    }
  }

  const applySession = (sessionId: string, history: Message[], tension = false) => {
    const nextVisible = getVisibleChatMessages(history)
    const nextEvaluations = getRoleplayEvaluationsFromMessages(history)
    const lastEvaluation = nextEvaluations[nextEvaluations.length - 1] || emptyEvaluation
    setCurrentSessionId(sessionId)
    setMessages(history)
    setStartedAt(nextVisible[0]?.created_at || history[0]?.created_at || new Date().toISOString())
    setCurrentEvaluation(lastEvaluation)
    setMentorFeedback(lastEvaluation.feedback)
    setIsTensionMode(tension)
  }

  const createFreshSession = async (forceTension = true) => {
    if (!profile) return
    const sessionId = buildSimulatorSessionId(activePersona.id)
    const initialMessage = await saveChatMessage(profile.id, sessionId, {
      role: 'assistant',
      content: pickPersonaOpening(activePersona, sessionId),
    })
    applySession(sessionId, [initialMessage], forceTension)
    await refreshHistory()
  }

  const hydrateSession = async (sessionId: string, tension = false) => {
    if (!profile) return
    applySession(sessionId, await loadChatHistory(profile.id, sessionId), tension)
  }

  useEffect(() => {
    const timer = window.setInterval(() => setClockTick(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [visibleMessages, isTyping])

  useEffect(() => {
    if (!profile) return
    let active = true
    const boot = async () => {
      const override = pendingSessionIdRef.current
      if (override) {
        pendingSessionIdRef.current = null
        const history = await loadChatHistory(profile.id, override)
        if (active) {
          applySession(override, history)
          await refreshHistory()
        }
        return
      }
      const latest = await loadLatestSimulatorSessionId(profile.id, activePersonaId)
      if (!active) return
      if (latest) applySession(latest, await loadChatHistory(profile.id, latest))
      else await createFreshSession(false)
      if (active) await refreshHistory()
    }
    boot()
    return () => { active = false }
  }, [profile, activePersonaId])

  const handleOpenHistoricSession = async (session: RoleplaySessionSummary) => {
    setHistoryOpen(false)
    if (!session.personaId || session.personaId === activePersonaId) {
      await hydrateSession(session.sessionId)
      return
    }
    pendingSessionIdRef.current = session.sessionId
    setActivePersonaId(session.personaId)
  }

  const handleSendMessage = async () => {
    if (!profile || !currentSessionId || !input.trim() || isTyping) return
    const userMessage: Message = { role: 'user', content: input.trim() }
    const nextConversation = [...getVisibleChatMessages(messages), userMessage]
    setInput('')
    setMessages((current) => [...current, userMessage])
    setIsTyping(true)
    setMentorFeedback('Analisando a rodada e calculando sua nota...')

    try {
      await saveChatMessage(profile.id, currentSessionId, userMessage)
      const [reply, feedback] = await Promise.all([
        simulateRoleplay(nextConversation, activePersona),
        getMentorFeedback(nextConversation, activePersona),
      ])
      const assistantMessage = await saveChatMessage(profile.id, currentSessionId, { role: 'assistant', content: reply })
      const feedbackMessage = await saveRoleplayEvaluationMessage(profile.id, currentSessionId, feedback.evaluation)
      await saveRoleplayActivity(profile.id, currentSessionId, activePersona.id, feedback.evaluation)
      setMessages((current) => [...current, assistantMessage, feedbackMessage])
      setCurrentEvaluation(feedback.evaluation)
      setMentorFeedback(feedback.reply)
      setIsTensionMode(true)
      await refreshHistory()
    } catch {
      setMessages((current) => [...current, { role: 'assistant', content: 'Desculpe, a conexao caiu no meio da frase. Pode repetir?' }])
      setMentorFeedback('Falha ao gerar o feedback desta rodada. Tente novamente.')
    } finally {
      setIsTyping(false)
    }
  }

  const metrics = [
    { label: 'Persuasao', value: currentEvaluation.scores.persuasao, tone: '[&>div]:bg-[#f59e0b]' },
    { label: 'Clareza', value: currentEvaluation.scores.clareza, tone: '[&>div]:bg-[#38bdf8]' },
    { label: 'Empatia', value: currentEvaluation.scores.empatia, tone: '[&>div]:bg-[#fb923c]' },
    { label: 'Aderencia', value: currentEvaluation.scores.aderencia, tone: '[&>div]:bg-[#eab308]' },
  ]

  return (
    <>
      <div className={cn('mx-auto min-h-[calc(100vh-7rem)] max-w-[1500px] rounded-[2rem] p-3 transition-all duration-500 md:p-4', isTensionMode ? 'bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(239,68,68,0.18),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,247,237,0.98))]' : 'bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(234,179,8,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.98))]')}>
        <div className="flex h-full flex-col gap-4">
          <div className={cn('flex shrink-0 flex-col items-start justify-between gap-4 overflow-hidden transition-all duration-500 md:flex-row md:items-center', isExpanded ? 'max-h-0 opacity-0' : 'max-h-[220px] opacity-100')}>
            <div>
              <p className={cn('mb-1 text-[10px] font-bold uppercase tracking-[0.32em]', isTensionMode ? 'text-[#c2410c]' : 'text-[#eab308]')}>Laboratorio neural em operacao</p>
              <h1 className="text-3xl font-black tracking-tight text-[#061B3B]">Laboratorio de Roleplay</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Nova simulacao agora abre uma sessao propria, muda o clima visual da tela e salva conversa mais nota no historico.</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button variant="outline" onClick={async () => { setHistoryOpen(true); await refreshHistory() }} className="h-10 rounded-xl border-slate-200 bg-white/80 px-4 text-sm font-semibold text-[#061B3B] shadow-sm"><History className="mr-2 h-4 w-4 text-slate-400" />Ver historico</Button>
              <Button onClick={() => createFreshSession(true)} className={cn('h-10 rounded-xl px-4 text-sm font-semibold text-white shadow-sm', isTensionMode ? 'bg-[#9a3412] hover:bg-[#7c2d12]' : 'bg-[#061B3B] hover:bg-[#0a2955]')}><Play className="mr-2 h-4 w-4 text-[#fbbf24]" fill="currentColor" />Nova simulacao</Button>
            </div>
          </div>

          <div className={cn('flex flex-1 flex-col gap-4 pb-2 transition-all duration-500 lg:flex-row', isExpanded ? 'gap-0' : 'gap-4')}>
            <div className={cn('flex shrink-0 flex-col overflow-hidden transition-all duration-500', isExpanded ? 'm-0 max-h-0 p-0 opacity-0 lg:max-h-none lg:max-w-0' : 'max-h-[1200px] w-full opacity-100 lg:max-h-none lg:max-w-[290px] lg:w-[290px]')}>
              <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1">
                <Select value={activePersonaId} onValueChange={setActivePersonaId}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white shadow-sm font-bold text-[#061B3B]"><SelectValue placeholder="Selecione um perfil..." /></SelectTrigger>
                  <SelectContent>{personas.map((persona) => <SelectItem key={persona.id} value={persona.id} className="text-xs font-medium">{persona.name}</SelectItem>)}</SelectContent>
                </Select>

                <Card className="overflow-hidden rounded-2xl border-none bg-white shadow-sm">
                  <div className="relative h-48 overflow-hidden">
                    <img src={activePersona.img} alt={activePersona.name} className={cn('h-full w-full object-cover transition-all duration-500', isTensionMode ? 'scale-[1.03] saturate-75 contrast-110' : 'grayscale opacity-90')} />
                    <div className={cn('absolute inset-0', isTensionMode ? 'bg-gradient-to-t from-[#431407]/85 via-[#7c2d12]/30 to-transparent' : 'bg-gradient-to-t from-black/70 via-black/20 to-transparent')} />
                    <div className="absolute bottom-3 left-4 right-4"><Badge className="border-none bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">{activePersona.type.split(',')[0]}</Badge></div>
                  </div>
                  <CardContent className="p-5">
                    <h2 className="text-xl font-bold leading-tight text-[#061B3B]">{activePersona.name}</h2>
                    <p className="mb-5 text-[11px] text-slate-500">{activePersona.type}</p>
                    <div className="space-y-3.5">{activePersona.stats.map((stat) => <div key={stat.label} className="space-y-1.5"><div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#061B3B]"><span>{stat.label}</span><span className="text-slate-400">{stat.val}%</span></div><Progress value={stat.val} className="h-1 bg-slate-100 [&>div]:bg-[#061B3B]" /></div>)}</div>
                  </CardContent>
                </Card>

                <Card className={cn('rounded-2xl border-none text-white shadow-sm transition-all duration-500', isTensionMode ? 'bg-[#431407]' : 'bg-[#061B3B]')}>
                  <CardContent className="p-5">
                    <h3 className="mb-4 border-b border-white/10 pb-3 text-xs font-bold uppercase tracking-widest">Objetivos taticos</h3>
                    <ul className="space-y-3">{activePersona.objectives.map((objective) => <li key={objective} className="flex items-start gap-2.5"><Circle className="mt-0.5 h-4 w-4 shrink-0 text-[#fbbf24]" /><span className="text-xs leading-snug text-slate-200">{objective}</span></li>)}</ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <Card className={cn('flex h-full flex-col overflow-hidden rounded-2xl border-none shadow-sm transition-all duration-500', isTensionMode ? 'bg-[#fff7ed]' : 'bg-white')}>
                <div className={cn('flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-6', isTensionMode ? 'border-[#fdba74]/50 bg-[#ffedd5]/80' : 'border-slate-100 bg-slate-50/60')}>
                  <div className={cn('flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest', isTensionMode ? 'text-[#9a3412]' : 'text-[#061B3B]')}><span className={cn('h-1.5 w-1.5 rounded-full animate-pulse', isTensionMode ? 'bg-[#ef4444]' : 'bg-red-500')} />Simulacao ao vivo {isExpanded && ' (expandido)'}</div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="hidden gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:flex">
                      <span>Decorrido: <span className={cn(isTensionMode ? 'text-[#9a3412]' : 'text-[#061B3B]')}>{formatDuration(startedAt, clockTick)}</span></span>
                      <span>Tokens: <span className={cn(isTensionMode ? 'text-[#9a3412]' : 'text-[#061B3B]')}>{tokensEstimate.toLocaleString('pt-BR')}</span></span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsExpanded((current) => !current)} className="h-7 w-7 text-slate-400 hover:bg-slate-200/50 hover:text-[#061B3B]" title={isExpanded ? 'Reduzir' : 'Expandir'}>{isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6" ref={scrollRef}>
                  <div className="space-y-6 pb-2">
                    {visibleMessages.map((message, index) => <div key={`${message.role}-${index}-${message.created_at || index}`} className={cn('flex max-w-[96%] gap-3 sm:max-w-[86%]', message.role === 'user' ? 'ml-auto flex-row-reverse' : '')}><div className={cn('mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full', message.role === 'user' ? 'bg-[#061B3B] shadow-sm' : 'border border-slate-200 bg-slate-100')}>{message.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-slate-500" />}</div><div className="min-w-0"><div className={cn('rounded-2xl p-4 text-sm leading-7 shadow-sm whitespace-pre-wrap break-words', message.role === 'user' ? 'rounded-tr-none bg-[#061B3B] text-white' : isTensionMode ? 'rounded-tl-none border border-[#fdba74]/50 bg-[#fffaf5] text-[#7c2d12]' : 'rounded-tl-none border border-slate-100 bg-slate-50 text-slate-700')}>{message.content}</div><span className={cn('mt-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400', message.role === 'user' ? 'mr-2 text-right' : 'ml-2')}>{message.role === 'user' ? 'Voce' : activePersona.name}</span></div></div>)}
                    {isTyping && <div className="flex max-w-[96%] gap-3 sm:max-w-[86%]"><div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100"><Bot className="h-4 w-4 text-slate-500" /></div><div className="rounded-2xl rounded-tl-none border border-slate-100 bg-slate-50 p-4 shadow-sm"><div className="flex h-6 items-center gap-1"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.4s]" /></div></div></div>}
                  </div>
                </div>

                <div className="shrink-0 border-t border-slate-100 bg-white/90 p-4">
                  <div className="relative flex items-center">
                    <div className={cn('absolute bottom-0 left-0 top-0 z-10 w-1 rounded-l-lg', isTensionMode ? 'bg-[#f97316]' : 'bg-[#eab308]')} />
                    <Input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && handleSendMessage()} disabled={isTyping} placeholder="Sua resposta..." className="h-12 w-full rounded-lg border-slate-200 bg-slate-50 pl-5 pr-20 text-sm shadow-inner focus-visible:border-[#061B3B] focus-visible:ring-[#061B3B]" />
                    <div className="absolute right-1.5 flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-[#061B3B]" disabled={isTyping}><Mic className="h-4 w-4" /></Button>
                      <Button size="icon" onClick={handleSendMessage} disabled={!input.trim() || isTyping} className={cn('h-9 w-9 rounded-md text-white shadow-sm', isTensionMode ? 'bg-[#9a3412] hover:bg-[#7c2d12]' : 'bg-[#061B3B] hover:bg-[#0a2955]')}><Send className="ml-0.5 h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className={cn('flex shrink-0 flex-col overflow-hidden transition-all duration-500', isExpanded ? 'm-0 max-h-0 p-0 opacity-0 lg:max-h-none lg:max-w-0' : 'max-h-[1200px] w-full opacity-100 lg:max-h-none lg:max-w-[300px] lg:w-[300px]')}>
              <div className="flex h-full flex-col gap-4 overflow-y-auto pl-1">
                <Card className="rounded-2xl border-none bg-white shadow-sm">
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-center justify-between"><h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Feedback em tempo real</h3><Badge className="border-0 bg-[#061B3B] text-white">Nota {currentEvaluation.score}</Badge></div>
                    <div className="space-y-4">{metrics.map((metric) => <div key={metric.label} className="space-y-1.5"><div className="flex justify-between text-[11px] font-bold text-[#061B3B]"><span>{metric.label}</span><span>{metric.value}%</span></div><Progress value={metric.value} className={`h-1.5 bg-slate-100 ${metric.tone}`} /></div>)}</div>
                  </CardContent>
                </Card>

                <Card className={cn('relative overflow-hidden rounded-2xl border-none shadow-sm transition-all duration-500', isTensionMode ? 'bg-[#431407] text-white' : 'bg-white text-[#061B3B]')}>
                  <div className={cn('absolute bottom-0 left-0 top-0 w-1', isTensionMode ? 'bg-[#fb923c]' : 'bg-[#061B3B]')} />
                  <CardContent className="p-5 pl-6">
                    <h3 className={cn('mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest', isTensionMode ? 'text-orange-100' : 'text-slate-400')}><Sparkles className={cn('h-3 w-3', isTensionMode ? 'text-[#fb923c]' : 'text-[#061B3B]')} />Insights do feedback</h3>
                    <p className="whitespace-pre-wrap break-words text-sm font-medium leading-6">{mentorFeedback}</p>
                    {currentEvaluation.nextAction && <p className={cn('mt-4 rounded-xl p-3 text-xs leading-5', isTensionMode ? 'bg-white/10 text-orange-50' : 'bg-slate-50 text-slate-600')}>Proxima acao: {currentEvaluation.nextAction}</p>}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <Card className="rounded-xl border-none bg-white py-4 text-center shadow-sm"><p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">Rodadas</p><p className="text-2xl font-black leading-none text-[#061B3B]">{evaluations.length}</p></Card>
                  <Card className="rounded-xl border-none bg-white py-4 text-center shadow-sm"><p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">Media</p><p className="text-2xl font-black leading-none text-[#061B3B]">{evaluations.length ? Math.round(evaluations.reduce((sum, item) => sum + item.score, 0) / evaluations.length) : 0}</p></Card>
                </div>

                <Card className="rounded-2xl border-none bg-white shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#061B3B]" /><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sessao atual</p></div>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>Tempo</span><strong className="text-[#061B3B]">{formatDuration(startedAt, clockTick)}</strong></div>
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>Historico da persona</span><strong className="text-[#061B3B]">{activePersonaHistory.length}</strong></div>
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span>Tokens estimados</span><strong className="text-[#061B3B]">{tokensEstimate}</strong></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-4xl border-white/10 bg-[#07111d] text-white">
          <DialogHeader>
            <DialogTitle>Historico do laboratorio</DialogTitle>
            <DialogDescription className="text-slate-400">Reabra uma simulacao antiga para ver conversa e desempenho da sessao.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
            {historyLoading && <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-400">Carregando historico...</Card>}
            {!historyLoading && historySessions.length === 0 && <Card className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-slate-400">Nenhuma simulacao registrada ainda.</Card>}
            {!historyLoading && historySessions.map((session) => {
              const persona = personas.find((item) => item.id === session.personaId)
              const current = session.sessionId === currentSessionId
              return <button key={session.sessionId} type="button" onClick={() => handleOpenHistoricSession(session)} className={cn('w-full rounded-[1.4rem] border p-4 text-left transition-all', current ? 'border-[#f59e0b]/40 bg-[#f59e0b]/10' : 'border-white/10 bg-white/5 hover:bg-white/10')}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-white/10 bg-white/5 text-slate-200">{persona?.name || 'Sessao legada'}</Badge>
                      <Badge className="border-white/10 bg-white/5 text-slate-200">{session.lastMessageAt ? new Date(session.lastMessageAt).toLocaleString('pt-BR') : 'Sem data'}</Badge>
                      {current && <Badge className="border-0 bg-[#f59e0b] text-[#08111f]">Sessao aberta</Badge>}
                    </div>
                    <p className="max-w-2xl text-sm leading-6 text-slate-300">{session.preview ? `${session.preview.slice(0, 220)}${session.preview.length > 220 ? '...' : ''}` : 'Sem previa textual disponivel.'}</p>
                  </div>
                  <div className="grid min-w-[240px] gap-2 sm:grid-cols-3 lg:grid-cols-1">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-400"><div className="flex items-center gap-2"><Medal className="h-4 w-4 text-[#fbbf24]" />Media da sessao</div><p className="mt-2 text-2xl font-black text-white">{session.averageScore}</p></div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-400"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-cyan-200" />Ultima nota</div><p className="mt-2 text-2xl font-black text-white">{session.lastScore ?? 0}</p></div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-400"><div className="flex items-center gap-2"><History className="h-4 w-4 text-orange-200" />Interacoes</div><p className="mt-2 text-2xl font-black text-white">{session.feedbackCount}</p></div>
                  </div>
                </div>
              </button>
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

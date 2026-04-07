import { lazy, Suspense, useState, useRef, useEffect, useMemo } from 'react'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, BrainCircuit, Bot, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAdminStore from '@/stores/useAdminStore'
import useSystemStore from '@/stores/useSystemStore'
import useUserStore from '@/stores/useUserStore'
import {
  sendMessageToMentor,
  loadChatHistory,
  saveChatMessage,
  Message,
} from '@/services/ai-mentor'
import { getLevelNameByXp } from '@/lib/constants'

const LivreView = lazy(() => import('@/components/dashboard/LivreView'))
const StreakView = lazy(() => import('@/components/dashboard/StreakView'))

export default function Index() {
  const { isStreakModeGlobal, weeklyFocus } = useSystemStore()
  const { profile } = useUserStore()
  const { sellers, progress } = useAdminStore()
  const [localStreakMode, setLocalStreakMode] = useState(false)

  const isStreakMode = isStreakModeGlobal && localStreakMode

  const [messages, setMessages] = useState<Message[]>([])
  const [inputMsg, setInputMsg] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasLoadedHistoryFor = useRef<string | null>(null)

  useEffect(() => {
    if (!profile) return
    if (hasLoadedHistoryFor.current === profile.id) return
    hasLoadedHistoryFor.current = profile.id
    
    const fetchHistory = async () => {
      try {
        const history = await loadChatHistory(profile.id, 'mentor-main')
        if (history.length > 0) {
          setMessages(history)
        } else {
          const firstName = profile.full_name?.split(' ')[0] || 'Vendedor'
          const initialMsg: Message = {
            role: 'assistant',
            content: isStreakModeGlobal
              ? `${firstName}, voce esta a poucos passos de garantir sua ofensiva de hoje! Recomende iniciar pelo Simulador de Objecoes para aquecer.`
              : `Ola ${firstName}, bem-vindo a Rio Sol Academy! Estou aqui para ajudar na sua jornada como vendedor de energia solar. Pode me perguntar sobre tecnicas de vendas, objecoes de clientes ou qualquer duvida sobre os modulos.`,
          }
          await saveChatMessage(profile.id, 'mentor-main', initialMsg)
          setMessages([initialMsg])
        }
      } catch (err) {
        console.error('Failed to load chat history', err)
        hasLoadedHistoryFor.current = null
      }
    }
    fetchHistory()
  }, [profile, isStreakModeGlobal])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSendMessage = async () => {
    if (!profile || !inputMsg.trim() || isTyping) return
    const userMsgContent = inputMsg.trim()
    setInputMsg('')

    const tempUserMsg: Message = { role: 'user', content: userMsgContent }
    setMessages((prev) => [...prev, tempUserMsg])
    setIsTyping(true)

    try {
      await saveChatMessage(profile.id, 'mentor-main', tempUserMsg)

      const newMessages = [...messages, tempUserMsg]
      const reply = await sendMessageToMentor(
        newMessages.map((m) => ({ role: m.role, content: m.content })),
      )

      const assistantMsg: Message = { role: 'assistant', content: reply }
      await saveChatMessage(profile.id, 'mentor-main', assistantMsg)

      setMessages((prev) => [...prev, assistantMsg])
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Desculpe, encontrei um erro ao processar sua solicitação. Tente novamente mais tarde.',
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const currentLevelName = profile ? getLevelNameByXp(profile.xp_total) : 'Carregando...'
  const progressPercent = profile ? Math.min(100, Math.floor(((profile.xp_total % 1000) / 1000) * 100)) : 0

  const miniRanking = useMemo(() => {
    const progressById = new Map(progress.map((p) => [p.sellerId, p]))
    const ranked = sellers
      .map((s) => ({ ...s, xp: progressById.get(s.id)?.totalXp || 0 }))
      .sort((a, b) => b.xp - a.xp)

    const top2 = ranked.slice(0, 2).map((s, i) => ({
      rank: String(i + 1).padStart(2, '0'),
      name: s.name,
      role: getLevelNameByXp(s.xp) as string,
      xp: `${(s.xp / 1000).toFixed(1)}k XP`,
      active: profile?.id === s.id,
    }))

    const myIdx = profile ? ranked.findIndex((s) => s.id === profile.id) : -1
    const alreadyInTop = myIdx >= 0 && myIdx < 2

    if (!alreadyInTop && profile) {
      top2.push({
        rank: myIdx >= 0 ? String(myIdx + 1).padStart(2, '0') : '--',
        name: 'Voce',
        role: currentLevelName,
        xp: `${((profile.xp_total || 0) / 1000).toFixed(1)}k XP`,
        active: true,
      })
    }

    return top2
  }, [sellers, progress, profile, currentLevelName])

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in-up space-y-6">
      {!profile ? (
        <div className="h-24 w-full bg-slate-100 animate-pulse rounded-2xl" />
      ) : weeklyFocus && (
        <div className="bg-[#061B3B] p-5 rounded-2xl shadow-lg border border-[#EAB308]/30 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#EAB308]/10 blur-3xl rounded-full pointer-events-none" />
          <div className="p-3.5 bg-[#EAB308] rounded-xl text-[#061B3B] shrink-0 relative z-10 shadow-lg shadow-[#EAB308]/20">
            <Target className="w-6 h-6" />
          </div>
          <div className="relative z-10 flex-1">
            <h3 className="text-xs font-black text-[#EAB308] uppercase tracking-widest mb-1.5 flex items-center gap-2">
              Foco da Semana
              <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full animate-pulse">
                SISTEMA CENTRAL
              </span>
            </h3>
            <p className="text-white text-sm md:text-base font-medium leading-relaxed">
              {weeklyFocus}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#061B3B] font-display uppercase tracking-tight">
            Painel de Comando Executivo
          </h1>
          <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mt-1">
            Modo de Treinamento
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {isStreakModeGlobal && (
            <div className="flex items-center gap-3 bg-white py-1.5 px-3 rounded-xl shadow-sm border border-slate-200">
              <span
                className={cn(
                  'text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors',
                  isStreakMode ? 'text-[#d97706]' : 'text-slate-400',
                )}
              >
                Ofensiva
              </span>
              <Switch
                checked={!localStreakMode}
                onCheckedChange={(c) => setLocalStreakMode(!c)}
                className="data-[state=checked]:bg-[#061B3B] data-[state=unchecked]:bg-[#EAB308]"
              />
              <span
                className={cn(
                  'text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors',
                  !isStreakMode ? 'text-[#061B3B]' : 'text-slate-400',
                )}
              >
                Livre
              </span>
            </div>
          )}

          <div className="hidden md:flex items-center gap-6 bg-white py-2 px-4 rounded-xl shadow-sm border border-slate-100">
            {!profile ? (
              <div className="w-48 h-10 bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <>
                <div className="w-32 space-y-1.5">
                  <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>Progresso Zenith</span>
                    <span className="text-[#EAB308]">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-1 bg-slate-100 [&>div]:bg-[#EAB308]" />
                </div>
                <div className="w-px h-6 bg-slate-100"></div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#061B3B]">
                    {((profile?.xp_total || 0) / 1000).toFixed(1)}k XP
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {currentLevelName}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6 min-w-0">
          <Suspense
            fallback={
              <Card className="border-none shadow-sm rounded-3xl bg-white">
                <CardContent className="p-8 text-sm text-slate-400">Carregando painel...</CardContent>
              </Card>
            }
          >
            {isStreakMode ? <StreakView /> : <LivreView />}
          </Suspense>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl bg-[#061B3B] overflow-hidden relative flex flex-col h-[400px]">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <BrainCircuit className="w-32 h-32 text-white" />
            </div>
            <CardContent className="p-5 relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4 shrink-0">
                <div className="p-2 bg-[#EAB308] rounded-lg text-[#061B3B]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm tracking-wide">Mentor Zenith</h4>
                  <p className="text-[9px] text-[#EAB308] font-bold tracking-widest uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308] animate-pulse"></span>{' '}
                    Online
                  </p>
                </div>
              </div>

              <div ref={scrollRef} className="space-y-3 mb-4 flex-1 overflow-y-auto pr-1">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'text-xs p-3 rounded-xl leading-relaxed backdrop-blur-sm whitespace-pre-wrap break-words',
                      msg.role === 'assistant'
                        ? 'bg-white/10 text-slate-200 rounded-tl-sm border border-white/5 mr-6'
                        : 'bg-[#EAB308]/10 text-white rounded-tr-sm border border-[#EAB308]/20 ml-6 text-right',
                    )}
                  >
                    {msg.content}
                  </div>
                ))}
                {isTyping && (
                  <div className="bg-white/10 text-slate-200 text-xs p-3 rounded-xl rounded-tl-sm border border-white/5 w-fit mr-6 animate-pulse">
                    Digitando...
                  </div>
                )}
              </div>

              <div className="relative mt-auto shrink-0">
                <Input
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isTyping}
                  placeholder="Pergunte ao Mentor..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-lg h-10 pl-3 pr-10 text-sm focus-visible:ring-[#EAB308]"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMsg.trim() || isTyping}
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8 bg-[#EAB308] hover:bg-[#d97706] text-[#061B3B] rounded-md disabled:opacity-50"
                >
                  <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-[#061B3B] font-display">Ranking Global</h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Semana Atual
                </span>
              </div>
              <div className="space-y-2">
                {miniRanking.map((user, idx) => (
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
                        'w-8 h-8 rounded-md shrink-0 bg-cover bg-center',
                        user.active ? 'border-2 border-[#EAB308]' : 'bg-slate-200',
                      )}
                      style={{
                        backgroundImage: `url('https://img.usecurling.com/p/100/100?q=portrait&seed=${idx}')`,
                      }}
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

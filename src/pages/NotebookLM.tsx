import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  notebooklmApi,
  type NotebookLMAskResponse,
  type NotebookLMNotebookDetail,
  type NotebookLMPodcastJob,
  type NotebookLMStatus,
} from '@/lib/notebooklm-api'
import { NOTEBOOKLM_ENABLED } from '@/lib/api-base'
import useSystemStore from '@/stores/useSystemStore'
import useUserStore from '@/stores/useUserStore'
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  LibraryBig,
  MessageSquareText,
  Mic2,
  RadioTower,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

type ChatTurn = {
  id: string
  question: string
  answer: string
  references: NotebookLMAskResponse['references']
  turnNumber: number
}

export default function NotebookLM() {
  useEffect(() => {
    if (!NOTEBOOKLM_ENABLED) {
      window.location.href = '/'
    }
  }, [])

  if (!NOTEBOOKLM_ENABLED) {
    return null
  }

  const { notebookLM } = useSystemStore()
  const { profile, logActivity } = useUserStore()
  const { toast } = useToast()
  const [status, setStatus] = useState<NotebookLMStatus | null>(null)
  const [backendError, setBackendError] = useState('')
  const [selectedSiloId, setSelectedSiloId] = useState('')
  const [detail, setDetail] = useState<NotebookLMNotebookDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [podcastTitle, setPodcastTitle] = useState('')
  const [podcastBrief, setPodcastBrief] = useState('')
  const [podcastJob, setPodcastJob] = useState<NotebookLMPodcastJob | null>(null)
  const [podcastLoading, setPodcastLoading] = useState(false)
  const [chatQuestion, setChatQuestion] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatTurns, setChatTurns] = useState<ChatTurn[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)

  const visibleSilos = useMemo(
    () => notebookLM.silos.filter((silo) => silo.isVisible),
    [notebookLM.silos],
  )

  const linkedVisibleSilos = useMemo(
    () => visibleSilos.filter((silo) => silo.notebookId),
    [visibleSilos],
  )

  const selectedSilo =
    visibleSilos.find((silo) => silo.id === selectedSiloId) ||
    linkedVisibleSilos[0] ||
    visibleSilos[0] ||
    null

  const refreshBackendStatus = async () => {
    try {
      const nextStatus = await notebooklmApi.getStatus()
      setStatus(nextStatus)
      setBackendError('')
    } catch (error) {
      setStatus(null)
      setBackendError(error instanceof Error ? error.message : 'Falha ao consultar o backend.')
    }
  }

  const fetchNotebookDetail = async (notebookId: string) => {
    setDetailLoading(true)
    try {
      const [nextStatus, nextDetail] = await Promise.all([
        notebooklmApi.getStatus(),
        notebooklmApi.getNotebook(notebookId),
      ])
      setStatus(nextStatus)
      setDetail(nextDetail)
      setDetailError('')
      setBackendError('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao consultar o NotebookLM.'
      setStatus(null)
      setBackendError(message)
      setDetailError(message)
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedSiloId && linkedVisibleSilos[0]) {
      setSelectedSiloId(linkedVisibleSilos[0].id)
    }
  }, [linkedVisibleSilos, selectedSiloId])

  useEffect(() => {
    if (selectedSilo?.notebookId) {
      fetchNotebookDetail(selectedSilo.notebookId)
    }
  }, [selectedSilo?.notebookId])

  useEffect(() => {
    setConversationId(null)
    setChatTurns([])
    setChatQuestion('')
    setPodcastJob(null)
  }, [selectedSilo?.notebookId])

  useEffect(() => {
    if (!podcastJob || !['queued', 'in_progress'].includes(podcastJob.status)) return

    const timer = window.setTimeout(async () => {
      try {
        const nextJob = await notebooklmApi.getJob(podcastJob.id)
        setPodcastJob(nextJob)
      } catch (error) {
        setPodcastJob((current) =>
          current
            ? {
                ...current,
                status: 'failed',
                error: {
                  message:
                    error instanceof Error
                      ? error.message
                      : 'Falha ao consultar o progresso do podcast.',
                },
              }
            : current,
        )
      }
    }, 5000)

    return () => window.clearTimeout(timer)
  }, [podcastJob])

  useEffect(() => {
    if (podcastJob?.status === 'completed' && selectedSilo?.notebookId) {
      fetchNotebookDetail(selectedSilo.notebookId)
    }
  }, [podcastJob?.status, selectedSilo?.notebookId])

  const handleAskNotebook = async () => {
    if (!selectedSilo?.notebookId || !chatQuestion.trim()) return

    const question = chatQuestion.trim()
    setChatLoading(true)

    try {
      const result = await notebooklmApi.askNotebook({
        notebookId: selectedSilo.notebookId,
        question,
        conversationId: conversationId || undefined,
      })

      setConversationId(result.conversationId)
      setChatTurns((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          question,
          answer: result.answer,
          references: result.references,
          turnNumber: result.turnNumber,
        },
      ])
      setChatQuestion('')
      await logActivity('notebooklm_question_asked', 60)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Falha ao consultar o notebook',
        description: error instanceof Error ? error.message : 'Erro desconhecido.',
      })
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="max-w-[1380px] mx-auto space-y-8 animate-fade-in-up pb-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#061B3B]/10 bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.22),transparent_25%),linear-gradient(135deg,#f7f4ea_0%,#ffffff_48%,#eef4fb_100%)] p-6 shadow-[0_24px_60px_rgba(6,27,59,0.12)] md:p-8">
        <div className="absolute right-6 top-6 hidden rounded-full border border-[#061B3B]/10 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.32em] text-[#061B3B] md:block">
          Live Notebook Bridge
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <Badge className="w-fit border-0 bg-[#061B3B] px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-white">
              NotebookLM ao vivo
            </Badge>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-black uppercase tracking-tight text-[#061B3B] md:text-4xl">
                Acesso real aos notebooks publicados pelo admin
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                Aqui voce consulta notebooks reais importados do NotebookLM e, quando liberado,
                dispara a geracao de podcast direto pelo backend conectado.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-[#061B3B]">
                  <LibraryBig className="h-4 w-4 text-[#EAB308]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
                    Silos publicados
                  </span>
                </div>
                <p className="text-3xl font-black text-[#061B3B]">{visibleSilos.length}</p>
              </div>
              <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-[#061B3B]">
                  <RadioTower className="h-4 w-4 text-[#EAB308]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
                    Conectados ao backend
                  </span>
                </div>
                <p className="text-3xl font-black text-[#061B3B]">{linkedVisibleSilos.length}</p>
              </div>
              <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-[#061B3B]">
                  <Mic2 className="h-4 w-4 text-[#EAB308]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Podcast</span>
                </div>
                <p className="text-base font-black uppercase tracking-[0.15em] text-[#061B3B]">
                  {notebookLM.userCanCreatePodcast ? 'Liberado' : 'Bloqueado'}
                </p>
              </div>
            </div>
          </div>

          <Card className="rounded-[1.8rem] border border-[#061B3B]/10 bg-[#061B3B] p-6 text-white shadow-[0_24px_50px_rgba(6,27,59,0.28)]">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-[#EAB308] p-3 text-[#061B3B]">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">Sinal do backend</h2>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#EAB308]">
                  Autenticacao e conteudo reais
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm leading-relaxed text-slate-200">
                {profile?.full_name?.split(' ')[0] || 'Equipe'}, os notebooks abaixo refletem o que
                o admin publicou do NotebookLM real. O backend le os dados direto da sessao
                autenticada.
              </div>
              <div className="rounded-2xl border border-[#EAB308]/20 bg-[#EAB308]/10 p-4 text-sm leading-relaxed text-[#fff3bf]">
                {backendError
                  ? backendError
                  : status
                    ? `Bridge autenticado com ${status.notebookCount} notebooks disponiveis.`
                    : 'Abrindo conexao com o backend do NotebookLM...'}
              </div>
              {(backendError || !status?.authenticated) && (
                <div className="rounded-2xl border border-red-300/20 bg-red-500/10 p-4 text-sm leading-relaxed text-red-50">
                  <div className="mb-3 flex items-center gap-2 font-bold uppercase tracking-[0.18em] text-red-100">
                    <AlertTriangle className="h-4 w-4" />
                    Diagnostico de acesso
                  </div>
                  <p>1. Verifique se o backend local esta ativo com `npm run backend`.</p>
                  <p>2. Se a sessao expirar, rode `notebooklm login`.</p>
                  <p>3. Depois volte aqui e atualize o sinal.</p>
                  <Button
                    variant="outline"
                    onClick={refreshBackendStatus}
                    className="mt-4 rounded-2xl border-white/10 bg-white/10 text-white hover:bg-white/20"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar sinal
                  </Button>
                </div>
              )}
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-xs uppercase tracking-[0.18em] text-slate-300">
                Rotas protegidas pelo admin: o usuario so acessa o que foi publicado no painel.
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="mb-6 space-y-2">
            <Badge className="w-fit border border-[#061B3B]/10 bg-[#061B3B]/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-[#061B3B]">
              Publicados
            </Badge>
            <h2 className="text-2xl font-black tracking-tight text-[#061B3B]">
              Notebooks visiveis para o usuario
            </h2>
            <p className="text-sm leading-relaxed text-slate-500">
              Somente itens publicados pelo admin aparecem aqui. Os conectados ao backend podem ser
              abertos e consultados em tempo real.
            </p>
          </div>

          <div className="space-y-4">
            {visibleSilos.length === 0 && (
              <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                Nenhum notebook foi publicado para os usuarios ainda.
              </div>
            )}

            {visibleSilos.map((silo) => (
              <div
                key={silo.id}
                className="rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_100%)] p-5 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-black text-[#061B3B]">{silo.title}</h3>
                  <Badge className="border-0 bg-[#EAB308] text-[10px] font-black uppercase tracking-[0.2em] text-[#061B3B]">
                    {silo.lane}
                  </Badge>
                  {!silo.notebookId && (
                    <Badge className="border border-slate-200 bg-slate-50 text-slate-500">
                      sem backend
                    </Badge>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-slate-600">{silo.description}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    {silo.sourceCount} fontes conectadas
                  </div>
                  <Button
                    disabled={!silo.notebookId || detailLoading}
                    onClick={async () => {
                      if (!silo.notebookId) {
                        toast({
                          variant: 'destructive',
                          title: 'Silo sem backend',
                          description: 'Esse item ainda nao foi ligado a um notebook real.',
                        })
                        return
                      }

                      setSelectedSiloId(silo.id)
                      await fetchNotebookDetail(silo.notebookId)
                      await logActivity('notebooklm_silo_access', 40)
                    }}
                    className="rounded-2xl bg-[#061B3B] px-5 text-white hover:bg-[#0a2955]"
                  >
                    Abrir no backend <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border border-[#061B3B]/10 bg-[linear-gradient(180deg,#061B3B_0%,#0a234b_100%)] p-6 text-white shadow-[0_20px_50px_rgba(6,27,59,0.22)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge className="w-fit border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-white">
                  Notebook selecionado
                </Badge>
                <h2 className="text-2xl font-black tracking-tight">
                  {detail?.notebook.title || 'Abra um notebook publicado'}
                </h2>
              </div>
              {selectedSilo?.notebookId && (
                <Button
                  variant="outline"
                  onClick={() => fetchNotebookDetail(selectedSilo.notebookId!)}
                  disabled={detailLoading}
                  className="rounded-2xl border-white/10 bg-white/10 text-white hover:bg-white/20"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${detailLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              )}
            </div>

            {detailLoading && (
              <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-6 text-sm text-slate-300">
                Carregando dados reais do notebook...
              </div>
            )}

            {!detailLoading && detailError && (
              <div className="rounded-[1.4rem] border border-red-400/20 bg-red-500/10 p-6 text-sm text-red-100">
                {detailError}
              </div>
            )}

            {!detailLoading && !detailError && !detail && (
              <div className="rounded-[1.4rem] border border-dashed border-white/15 bg-white/5 p-6 text-sm text-slate-300">
                Selecione um notebook com backend conectado para ver resumo e fontes reais.
              </div>
            )}

            {!detailLoading && detail && (
              <div className="space-y-4">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#EAB308]">
                    Resumo do NotebookLM
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">
                    {detail.summary || 'O notebook ainda nao retornou um resumo estruturado.'}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#EAB308]">
                    Fontes reais
                  </p>
                  <div className="mt-3 space-y-3">
                    {detail.sources.slice(0, 5).map((source) => (
                      <div
                        key={source.id}
                        className="rounded-xl border border-white/10 bg-black/10 p-3"
                      >
                        <p className="font-semibold text-white">
                          {source.title || 'Fonte sem titulo'}
                        </p>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                          {source.kind} • {source.isReady ? 'ready' : `status ${source.status}`}
                        </p>
                      </div>
                    ))}
                    {detail.sources.length === 0 && (
                      <p className="text-sm text-slate-400">
                        Esse notebook nao retornou fontes listadas.
                      </p>
                    )}
                  </div>
                </div>
                {detail.suggestedTopics.length > 0 && (
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#EAB308]">
                      Perguntas sugeridas
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {detail.suggestedTopics.slice(0, 3).map((topic) => (
                        <button
                          key={topic.question}
                          type="button"
                          onClick={() => setChatQuestion(topic.question)}
                          className="rounded-full border border-white/10 bg-black/10 px-4 py-2 text-left text-xs font-semibold text-white transition hover:bg-white/10"
                        >
                          {topic.question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card className="rounded-[2rem] border border-[#061B3B]/10 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge className="w-fit border border-[#061B3B]/10 bg-[#061B3B]/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-[#061B3B]">
                  Perguntas ao vivo
                </Badge>
                <h2 className="text-2xl font-black tracking-tight text-[#061B3B]">
                  Chat real com o notebook
                </h2>
                <p className="text-sm leading-relaxed text-slate-500">
                  Use esta area para fazer perguntas e manter follow-ups dentro do mesmo notebook.
                </p>
              </div>
              {chatTurns.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setConversationId(null)
                    setChatTurns([])
                  }}
                  className="rounded-2xl border-slate-200 bg-white text-[#061B3B] hover:bg-slate-50"
                >
                  Nova conversa
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <Textarea
                value={chatQuestion}
                onChange={(event) => setChatQuestion(event.target.value)}
                placeholder="Pergunte algo sobre o notebook publicado."
                className="min-h-[130px] rounded-[1.5rem] border-slate-200"
              />
              <Button
                disabled={!selectedSilo?.notebookId || !chatQuestion.trim() || chatLoading}
                onClick={handleAskNotebook}
                className="h-12 w-full rounded-2xl bg-[#061B3B] font-black uppercase tracking-[0.18em] text-white hover:bg-[#0a2955]"
              >
                <MessageSquareText className="mr-2 h-4 w-4" />
                {chatLoading ? 'Consultando NotebookLM...' : 'Perguntar ao notebook'}
              </Button>

              {chatTurns.length === 0 && (
                <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-relaxed text-slate-500">
                  Quando voce fizer a primeira pergunta, a resposta real do NotebookLM aparecera
                  aqui com as referencias citadas.
                </div>
              )}

              {chatTurns.map((turn) => (
                <div
                  key={turn.id}
                  className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="rounded-2xl border border-[#061B3B]/10 bg-[#061B3B]/5 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#061B3B]">
                      Pergunta #{turn.turnNumber}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-[#061B3B]">
                      {turn.question}
                    </p>
                  </div>
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-800">
                      Resposta do NotebookLM
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                      {turn.answer || 'O NotebookLM nao retornou texto nesta resposta.'}
                    </p>
                  </div>
                  {turn.references.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        Referencias usadas
                      </p>
                      {turn.references.slice(0, 4).map((reference, index) => (
                        <div
                          key={`${turn.id}-${reference.sourceId}-${index}`}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <p className="text-sm font-semibold text-[#061B3B]">
                            {reference.sourceTitle ||
                              `Fonte ${reference.citationNumber || index + 1}`}
                          </p>
                          {reference.citedText && (
                            <p className="mt-1 text-sm leading-relaxed text-slate-600">
                              {reference.citedText}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[2rem] border border-[#061B3B]/10 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <div className="mb-6 space-y-2">
              <Badge className="w-fit border border-[#061B3B]/10 bg-[#061B3B]/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-[#061B3B]">
                Podcast Studio
              </Badge>
              <h2 className="text-2xl font-black tracking-tight text-[#061B3B]">
                Gerar podcast real
              </h2>
              <p className="text-sm leading-relaxed text-slate-500">
                O pedido abaixo cria um job local, acompanha o progresso e dispara um Audio Overview
                real no NotebookLM.
              </p>
            </div>

            {notebookLM.userCanCreatePodcast ? (
              <div className="space-y-4">
                <Input
                  value={podcastTitle}
                  onChange={(event) => setPodcastTitle(event.target.value)}
                  placeholder="Titulo do episodio"
                  className="h-12 rounded-2xl border-slate-200"
                />
                <Textarea
                  value={podcastBrief}
                  onChange={(event) => setPodcastBrief(event.target.value)}
                  placeholder="Descreva o briefing do podcast usando esse notebook como base."
                  className="min-h-[150px] rounded-[1.5rem] border-slate-200"
                />
                <Button
                  disabled={
                    !selectedSilo?.notebookId ||
                    !podcastTitle.trim() ||
                    !podcastBrief.trim() ||
                    podcastLoading
                  }
                  onClick={async () => {
                    if (!selectedSilo?.notebookId) return
                    setPodcastLoading(true)
                    try {
                      const job = await notebooklmApi.createPodcastJob({
                        notebookId: selectedSilo.notebookId,
                        title: podcastTitle,
                        brief: podcastBrief,
                        language: 'pt',
                      })
                      setPodcastJob(job)
                      await logActivity('notebooklm_podcast_request', 80)
                      toast({
                        title: 'Podcast enviado ao NotebookLM',
                        description: `Job ${job.id} criado. O progresso sera acompanhado automaticamente.`,
                      })
                    } catch (error) {
                      toast({
                        variant: 'destructive',
                        title: 'Falha ao gerar podcast',
                        description: error instanceof Error ? error.message : 'Erro desconhecido.',
                      })
                    } finally {
                      setPodcastLoading(false)
                    }
                  }}
                  className="h-12 w-full rounded-2xl bg-[#061B3B] font-black uppercase tracking-[0.18em] text-white hover:bg-[#0a2955]"
                >
                  <Mic2 className="mr-2 h-4 w-4" />
                  {podcastLoading ? 'Criando job do podcast...' : 'Gerar podcast real'}
                </Button>

                {podcastJob && (
                  <div
                    className={`rounded-[1.4rem] border p-4 text-sm ${
                      podcastJob.status === 'failed'
                        ? 'border-red-300 bg-red-50 text-red-900'
                        : podcastJob.status === 'completed'
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                          : 'border-amber-300 bg-amber-50 text-amber-900'
                    }`}
                  >
                    <p className="font-bold">Status do job de podcast</p>
                    <p className="mt-1">
                      Job `{podcastJob.id}` em `{podcastJob.status}`.
                    </p>
                    {podcastJob.error?.message && (
                      <p className="mt-2 text-sm leading-relaxed">{podcastJob.error.message}</p>
                    )}
                    {podcastJob.result && (
                      <p className="mt-2">
                        Task final `{podcastJob.result.taskId}` com status `
                        {podcastJob.result.status}`.
                      </p>
                    )}
                    {podcastJob.result?.artifact?.url && (
                      <a
                        href={podcastJob.result.artifact.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center text-sm font-semibold text-[#061B3B] underline"
                      >
                        Abrir artefato gerado
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <Sparkles className="mx-auto mb-3 h-8 w-8 text-[#EAB308]" />
                <p className="text-sm leading-relaxed text-slate-500">
                  O admin ainda nao liberou a geracao de podcast para os usuarios.
                </p>
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  )
}

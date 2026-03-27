import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import {
  notebooklmApi,
  type NotebookLMLiveNotebook,
  type NotebookLMStatus,
} from '@/lib/notebooklm-api'
import { NOTEBOOKLM_ENABLED } from '@/lib/api-base'
import useSystemStore from '@/stores/useSystemStore'
import {
  AlertTriangle,
  Bot,
  Eye,
  EyeOff,
  Layers3,
  Link2,
  Mic2,
  RadioTower,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react'

export default function AdminNotebookLM() {
  useEffect(() => {
    if (!NOTEBOOKLM_ENABLED) {
      window.location.href = '/'
    }
  }, [])

  if (!NOTEBOOKLM_ENABLED) {
    return null
  }

  const {
    notebookLM,
    setNotebookLMEnabled,
    setNotebookLMPodcastEnabled,
    setNotebookLMSiloVisibility,
    upsertNotebookLMSilo,
    deleteNotebookLMSilo,
    deleteNotebookLMSiloByNotebookId,
  } = useSystemStore()
  const { toast } = useToast()
  const [status, setStatus] = useState<NotebookLMStatus | null>(null)
  const [availableNotebooks, setAvailableNotebooks] = useState<NotebookLMLiveNotebook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [backendError, setBackendError] = useState('')
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null)

  const publishedCount = useMemo(
    () => notebookLM.silos.filter((silo) => silo.isVisible).length,
    [notebookLM.silos],
  )

  const totalSources = useMemo(
    () => notebookLM.silos.reduce((total, silo) => total + silo.sourceCount, 0),
    [notebookLM.silos],
  )

  const loadBackendState = async (refresh = false) => {
    if (refresh) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      const [nextStatus, nextNotebooks] = await Promise.all([
        notebooklmApi.getStatus(),
        notebooklmApi.listNotebooks(),
      ])
      setStatus(nextStatus)
      setAvailableNotebooks(nextNotebooks)
      setBackendError('')
      setLastSyncAt(new Date().toLocaleString('pt-BR'))
    } catch (error) {
      setStatus(null)
      setAvailableNotebooks([])
      setBackendError(error instanceof Error ? error.message : 'Falha ao conectar ao backend.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadBackendState()
  }, [])

  const getPublishedSilo = (notebookId: string) =>
    notebookLM.silos.find((silo) => silo.notebookId === notebookId)

  return (
    <div className="max-w-[1500px] mx-auto space-y-6 animate-fade-in-up">
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Card className="relative overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_38%),linear-gradient(135deg,#07111f_0%,#081a33_52%,#030712_100%)] p-7 shadow-[0_24px_80px_rgba(1,6,18,0.48)]">
          <div className="absolute right-6 top-6 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-cyan-100">
            Live Bridge
          </div>
          <div className="max-w-2xl space-y-5">
            <Badge className="w-fit border-0 bg-[#EAB308] px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#061B3B]">
              Console NotebookLM
            </Badge>
            <div className="space-y-3">
              <h1 className="max-w-xl text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
                Painel conectado ao NotebookLM real
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
                O admin agora importa notebooks reais do NotebookLM, publica o que deve aparecer no
                app e decide se o time pode ou nao pedir podcasts a partir dessas bases.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-cyan-100">
                  <Layers3 className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.28em]">
                    Notebooks reais
                  </span>
                </div>
                <p className="text-3xl font-black text-white">{status?.notebookCount || 0}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-emerald-200">
                  <Eye className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.28em]">
                    Publicados no app
                  </span>
                </div>
                <p className="text-3xl font-black text-white">{publishedCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-amber-200">
                  <RadioTower className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.28em]">
                    Fontes publicadas
                  </span>
                </div>
                <p className="text-3xl font-black text-white">{totalSources}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-[1.75rem] border border-white/10 bg-[#07111f]/80 p-5 text-white shadow-xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-cyan-100">
                  <Bot className="h-4 w-4" />
                  <h2 className="text-sm font-black uppercase tracking-[0.25em]">Acesso geral</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  Liga ou remove a rota `/notebooklm` para os usuarios do produto.
                </p>
              </div>
              <Switch
                checked={notebookLM.enabled}
                onCheckedChange={async (value) => {
                  await setNotebookLMEnabled(value)
                  toast({
                    title: 'Acesso atualizado',
                    description: `O modulo NotebookLM foi ${value ? 'liberado' : 'desativado'} no app.`,
                  })
                }}
                className="data-[state=checked]:bg-[#EAB308] data-[state=unchecked]:bg-slate-700"
              />
            </div>
          </Card>

          <Card className="rounded-[1.75rem] border border-white/10 bg-[#07111f]/80 p-5 text-white shadow-xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-100">
                  <Mic2 className="h-4 w-4" />
                  <h2 className="text-sm font-black uppercase tracking-[0.25em]">
                    Podcast para usuarios
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  Quando ligado, o frontend envia pedidos reais de Audio Overview ao NotebookLM.
                </p>
              </div>
              <Switch
                checked={notebookLM.userCanCreatePodcast}
                onCheckedChange={async (value) => {
                  await setNotebookLMPodcastEnabled(value)
                  toast({
                    title: 'Permissao atualizada',
                    description: `O pedido de podcast foi ${value ? 'ativado' : 'bloqueado'} para o time.`,
                  })
                }}
                className="data-[state=checked]:bg-[#EAB308] data-[state=unchecked]:bg-slate-700"
              />
            </div>
          </Card>

          <Card className="rounded-[1.75rem] border border-emerald-400/15 bg-emerald-400/5 p-5 text-white shadow-xl">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
              <div className="space-y-2">
                <h2 className="text-sm font-black uppercase tracking-[0.25em] text-emerald-100">
                  Estado do backend
                </h2>
                {backendError ? (
                  <p className="text-sm leading-relaxed text-red-200">
                    {backendError} Execute o backend e, se preciso, renove o login com `notebooklm
                    login`.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm leading-relaxed text-slate-200">
                      {status?.authenticated
                        ? `Bridge autenticado. Storage em ${status.storagePath}.`
                        : 'Aguardando autenticacao do NotebookLM.'}
                    </p>
                    {lastSyncAt && (
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Ultima leitura: {lastSyncAt}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="rounded-[1.75rem] border border-amber-400/15 bg-amber-400/5 p-5 text-white shadow-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-300" />
              <div className="space-y-3">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.25em] text-amber-100">
                    Diagnostico rapido
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-200">
                    Este bloco ajuda a recuperar a conexao quando o NotebookLM real sair do ar.
                  </p>
                </div>
                <div className="space-y-2 text-sm leading-relaxed text-slate-300">
                  <p>1. Execute `npm run backend` se a API local nao estiver respondendo.</p>
                  <p>2. Rode `notebooklm login` se a sessao expirar.</p>
                  <p>3. Clique em recarregar para validar se os notebooks voltaram.</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => loadBackendState(true)}
                  disabled={isRefreshing}
                  className="rounded-2xl border-amber-300/20 bg-amber-300/10 text-amber-50 hover:bg-amber-300/20"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Atualizar diagnostico
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[2rem] border border-white/10 bg-[#050c18] p-6 text-white shadow-2xl">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <Badge className="w-fit border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-200">
                Backend
              </Badge>
              <h2 className="text-2xl font-black tracking-tight">
                Notebooks disponiveis no NotebookLM
              </h2>
              <p className="text-sm leading-relaxed text-slate-400">
                Esta lista vem do backend real. Publique daqui para exibir no app.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => loadBackendState(true)}
              disabled={isRefreshing}
              className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Recarregar
            </Button>
          </div>

          <div className="space-y-4">
            {isLoading && (
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-300">
                Sincronizando notebooks reais do NotebookLM...
              </div>
            )}

            {!isLoading && availableNotebooks.length === 0 && (
              <div className="rounded-[1.6rem] border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
                Nenhum notebook real encontrado no NotebookLM autenticado.
              </div>
            )}

            {availableNotebooks.map((notebook) => {
              const publishedSilo = getPublishedSilo(notebook.id)
              return (
                <div
                  key={notebook.id}
                  className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black text-white">{notebook.title}</h3>
                        <Badge
                          className={
                            publishedSilo?.isVisible
                              ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
                              : 'border-white/10 bg-white/5 text-slate-300'
                          }
                        >
                          {publishedSilo?.isVisible ? 'Publicado no app' : 'Apenas no NotebookLM'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                          {notebook.sourceCount} fontes
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                          {notebook.isOwner ? 'Owner' : 'Compartilhado'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 break-all">{notebook.id}</p>
                    </div>

                    <div className="flex min-w-[240px] flex-col gap-3 rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                      {publishedSilo ? (
                        <>
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                                Visibilidade
                              </p>
                              <p className="text-sm font-semibold text-white">
                                {publishedSilo.isVisible ? 'Visivel aos usuarios' : 'Oculto'}
                              </p>
                            </div>
                            <Switch
                              checked={publishedSilo.isVisible}
                              onCheckedChange={async (value) => {
                                await setNotebookLMSiloVisibility(publishedSilo.id, value)
                                toast({
                                  title: 'Visibilidade ajustada',
                                  description: `O notebook ${value ? 'aparecera' : 'deixou de aparecer'} na rota do usuario.`,
                                })
                              }}
                              className="data-[state=checked]:bg-[#EAB308] data-[state=unchecked]:bg-slate-700"
                            />
                          </div>
                          <Button
                            variant="outline"
                            onClick={async () => {
                              await deleteNotebookLMSiloByNotebookId(notebook.id)
                              toast({
                                title: 'Notebook removido do app',
                                description:
                                  'Ele continua no NotebookLM, mas saiu da experiencia do usuario.',
                              })
                            }}
                            className="rounded-2xl border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/20 hover:text-red-100"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover do app
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={async () => {
                            await upsertNotebookLMSilo({
                              notebookId: notebook.id,
                              title: notebook.title,
                              description: 'Notebook real importado do backend do NotebookLM.',
                              sourceCount: notebook.sourceCount,
                              lane: 'NotebookLM',
                              isVisible: true,
                            })
                            toast({
                              title: 'Notebook publicado',
                              description: 'Esse notebook real agora aparece na area do usuario.',
                            })
                          }}
                          className="rounded-2xl bg-[#EAB308] text-[#061B3B] hover:bg-[#d97706] font-black uppercase tracking-[0.16em]"
                        >
                          <Link2 className="mr-2 h-4 w-4" />
                          Publicar no app
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="rounded-[2rem] border border-white/10 bg-[#050c18] p-6 text-white shadow-2xl">
          <div className="mb-6 space-y-2">
            <Badge className="w-fit border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-200">
              Publicados
            </Badge>
            <h2 className="text-2xl font-black tracking-tight">Silos expostos no produto</h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Aqui ficam os silos efetivamente publicados no app, incluindo legados sem
              `notebookId`.
            </p>
          </div>

          <div className="space-y-4">
            {notebookLM.silos.length === 0 && (
              <div className="rounded-[1.6rem] border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
                Nenhum silo foi publicado ainda.
              </div>
            )}

            {notebookLM.silos.map((silo) => (
              <div key={silo.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-white">{silo.title}</h3>
                      <Badge
                        className={
                          silo.isVisible
                            ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
                            : 'border-white/10 bg-white/5 text-slate-300'
                        }
                      >
                        {silo.isVisible ? 'Visivel' : 'Oculto'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400">{silo.description}</p>
                    <p className="text-xs text-slate-500 break-all">
                      {silo.notebookId ? `Notebook real: ${silo.notebookId}` : 'Silo local/manual'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      await deleteNotebookLMSilo(silo.id)
                      toast({
                        title: 'Silo removido',
                        description: 'A publicacao foi removida do frontend.',
                      })
                    }}
                    className="text-red-300 hover:text-red-100 hover:bg-red-500/10"
                  >
                    {silo.isVisible ? (
                      <Eye className="mr-2 h-4 w-4" />
                    ) : (
                      <EyeOff className="mr-2 h-4 w-4" />
                    )}
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}

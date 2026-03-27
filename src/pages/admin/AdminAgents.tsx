import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  agentsAdminApi,
  type AgentInteractionRecord,
  type AgentKind,
  type AgentMemoryGuidance,
  type AgentPromptConfig,
  type AgentPromptTarget,
} from '@/lib/agents-admin-api'
import {
  Bot,
  BrainCircuit,
  Eye,
  FileText,
  MessageSquareText,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Upload,
  UserRound,
} from 'lucide-react'

const defaultPrompts: AgentPromptConfig = {
  shared: '',
  mentor: '',
  roleplay: '',
  mentorFeedback: '',
}

const promptOptions: Array<{ id: AgentPromptTarget; label: string; hint: string }> = [
  {
    id: 'shared',
    label: 'Contexto compartilhado',
    hint: 'Instrucoes comuns que entram em todos os agentes.',
  },
  {
    id: 'mentor',
    label: 'Mentor Zenith',
    hint: 'Prompt de coaching comercial e orientacao principal.',
  },
  {
    id: 'roleplay',
    label: 'Cliente Roleplay',
    hint: 'Prompt do personagem que enfrenta o vendedor no laboratorio.',
  },
  {
    id: 'mentorFeedback',
    label: 'Feedback de vendas',
    hint: 'Prompt do avaliador que nota e corrige cada rodada.',
  },
]

const interactionAgentLabels: Record<string, string> = {
  mentor: 'Mentor Zenith',
  roleplay: 'Cliente Roleplay',
  mentor_feedback: 'Feedback de vendas',
}

const uploadPresets = [
  {
    id: 'shared',
    label: 'Base comum',
    description: 'Energia solar, funcionamento da aplicacao, FAQ e contexto que todos os agentes precisam compartilhar.',
    agentKinds: ['mentor', 'roleplay', 'mentor_feedback'] as AgentKind[],
    accent: 'border-cyan-400/30 bg-cyan-500/10',
  },
  {
    id: 'mentor',
    label: 'Mentor Zenith',
    description: 'Playbooks comerciais, scripts, objecoes, ROI, fechamento e argumentacao.',
    agentKinds: ['mentor'] as AgentKind[],
    accent: 'border-[#f3c63f]/40 bg-[#f3c63f]/10',
  },
  {
    id: 'roleplay',
    label: 'Cliente Roleplay',
    description: 'Personas, repertorio de cliente, objecoes, segmentos e comportamentos de simulacao.',
    agentKinds: ['roleplay'] as AgentKind[],
    accent: 'border-fuchsia-400/30 bg-fuchsia-500/10',
  },
  {
    id: 'mentor_feedback',
    label: 'Feedback de vendas',
    description: 'Rubricas, criterios de nota, boas praticas de avaliacao e exemplos de feedback comercial.',
    agentKinds: ['mentor_feedback'] as AgentKind[],
    accent: 'border-emerald-400/30 bg-emerald-500/10',
  },
] as const

type UploadPresetId = (typeof uploadPresets)[number]['id']

export default function AdminAgents() {
  const { toast } = useToast()
  const [prompts, setPrompts] = useState<AgentPromptConfig>(defaultPrompts)
  const [guidance, setGuidance] = useState<AgentMemoryGuidance | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPromptTarget, setSelectedPromptTarget] = useState<AgentPromptTarget>('mentor')
  const [savingPrompt, setSavingPrompt] = useState(false)
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file')
  const [uploadPresetId, setUploadPresetId] = useState<UploadPresetId>('shared')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadText, setUploadText] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadVisibility, setUploadVisibility] = useState<'global' | 'private'>('global')
  const [uploading, setUploading] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [interactionsOpen, setInteractionsOpen] = useState(false)
  const [interactions, setInteractions] = useState<AgentInteractionRecord[]>([])
  const [interactionsSearch, setInteractionsSearch] = useState('')
  const [interactionsAgentFilter, setInteractionsAgentFilter] = useState('')
  const [loadingInteractions, setLoadingInteractions] = useState(false)
  const [lastImportSummary, setLastImportSummary] = useState<{
    documentId: string
    storedChunks: number
    chunkCount: number
    agentKinds: AgentKind[]
    warnings: string[]
    stats: { charCount: number; pageCount: number | null; sizeMb: number | null; chunkCount: number }
  } | null>(null)

  const currentPromptOption =
    promptOptions.find((option) => option.id === selectedPromptTarget) || promptOptions[0]
  const activeUploadPreset =
    uploadPresets.find((preset) => preset.id === uploadPresetId) || uploadPresets[0]

  const interactionStats = useMemo(() => {
    const uniqueUsers = new Set(interactions.map((item) => item.user_id)).size
    return {
      total: interactions.length,
      users: uniqueUsers,
      mentor: interactions.filter((item) => item.agent_kind === 'mentor').length,
      roleplay: interactions.filter((item) => item.agent_kind === 'roleplay').length,
      feedback: interactions.filter((item) => item.agent_kind === 'mentor_feedback').length,
    }
  }, [interactions])

  const loadConfig = async () => {
    const data = await agentsAdminApi.getConfig()
    setPrompts(data.prompts)
    setGuidance(data.guidance)
  }

  const loadInteractions = async () => {
    setLoadingInteractions(true)
    try {
      const data = await agentsAdminApi.listInteractions({
        search: interactionsSearch,
        agentKind: interactionsAgentFilter || undefined,
        limit: 60,
      })
      setInteractions(data.interactions)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Falha ao carregar interacoes',
        description: error instanceof Error ? error.message : 'Erro desconhecido.',
      })
    } finally {
      setLoadingInteractions(false)
    }
  }

  useEffect(() => {
    const boot = async () => {
      try {
        await loadConfig()
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Falha ao abrir painel dos agentes',
          description: error instanceof Error ? error.message : 'Erro desconhecido.',
        })
      } finally {
        setLoading(false)
      }
    }

    boot()
  }, [])

  const openInteractions = async () => {
    setInteractionsOpen(true)
    if (interactions.length === 0 && !loadingInteractions) {
      await loadInteractions()
    }
  }

  const handleSaveSelectedPrompt = async () => {
    setSavingPrompt(true)
    try {
      const result = await agentsAdminApi.savePromptField(
        selectedPromptTarget,
        prompts[selectedPromptTarget],
      )
      setPrompts(result.prompts)
      toast({
        title: 'Prompt atualizado',
        description: `${currentPromptOption.label} agora salva direto no banco do sistema.`,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Falha ao salvar prompt',
        description: error instanceof Error ? error.message : 'Erro desconhecido.',
      })
    } finally {
      setSavingPrompt(false)
    }
  }

  const handleUpload = async () => {
    setUploading(true)
    try {
      const result =
        uploadMode === 'text'
          ? await agentsAdminApi.importTextMemory({
              title: uploadTitle || `Base ${activeUploadPreset.label}`,
              content: uploadText,
              visibility: uploadVisibility,
              agentKinds: activeUploadPreset.agentKinds,
            })
          : await agentsAdminApi.importFileMemory({
              file: uploadFile as File,
              title: uploadTitle || uploadFile?.name,
              visibility: uploadVisibility,
              agentKinds: activeUploadPreset.agentKinds,
            })

      setLastImportSummary(result)
      setUploadTitle('')
      setUploadText('')
      setUploadFile(null)
      setFileInputKey((current) => current + 1)
      toast({
        title: 'Material enviado com sucesso',
        description: `${result.storedChunks} blocos enviados para ${activeUploadPreset.label}.`,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Falha no upload do material',
        description: error instanceof Error ? error.message : 'Erro desconhecido.',
      })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-sm text-slate-400">Carregando central dos agentes...</div>
  }

  return (
    <>
      <div className="mx-auto max-w-[1420px] space-y-4 animate-fade-in-up">
        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_28%),linear-gradient(135deg,#07111d_0%,#0d2038_55%,#050914_100%)] p-5 text-white shadow-[0_22px_70px_rgba(4,10,24,0.42)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <Badge className="w-fit border-0 bg-[#f3c63f] px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#08111f]">
                  Secao de agentes
                </Badge>
                <div className="space-y-2">
                  <h1 className="text-2xl font-black uppercase tracking-[0.04em] text-white md:text-3xl">
                    Central operacional dos agentes
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-slate-300">
                    A tela agora fica focada em duas acoes: editar um prompt por vez e enviar
                    material para um agente por vez. As interacoes com usuarios ficam fora da grade
                    principal e abrem sob demanda.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={openInteractions}
                  className="h-10 rounded-2xl bg-white/10 px-4 text-xs font-bold uppercase tracking-[0.18em] text-white hover:bg-white/15"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver interacoes
                </Button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300">
                  Agentes editaveis
                </p>
                <p className="mt-2 text-2xl font-black text-white">3</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300">
                  Formatos aceitos
                </p>
                <p className="mt-2 text-xl font-black text-white">
                  {guidance?.supportedExtensions.join(' / ') || '.pdf / .txt / .md / .docx'}
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300">
                  Limite por arquivo
                </p>
                <p className="mt-2 text-2xl font-black text-white">{guidance?.maxFileSizeMb || 10} MB</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-[1.8rem] border border-[#f3c63f]/15 bg-[#09101b] p-5 text-white shadow-xl">
            <div className="flex items-center gap-2 text-[#f3c63f]">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.28em]">
                Regras de operacao
              </span>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                Ate <strong>{guidance?.maxFilesPerBatch || 5}</strong> arquivos por lote.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                PDF recomendado ate <strong>{guidance?.recommendedPdfPages || 150}</strong> paginas.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                Texto recomendado ate{' '}
                <strong>{guidance?.recommendedCharactersPerText || 120000}</strong> caracteres.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                Use `.docx` no lugar de `.doc` para evitar falhas de leitura.
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <Card className="rounded-[1.8rem] border border-white/10 bg-[#07111d] p-5 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge className="w-fit border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-200">
                  Prompt system
                </Badge>
                <h2 className="text-xl font-black tracking-tight">Editar um agente por vez</h2>
                <p className="text-sm leading-6 text-slate-400">
                  Escolha o alvo, revise o texto e salve. A rota escreve direto na tabela
                  `system_settings`.
                </p>
              </div>
              <Button
                onClick={handleSaveSelectedPrompt}
                disabled={savingPrompt}
                className="h-10 rounded-2xl bg-[#f3c63f] px-4 text-xs font-black uppercase tracking-[0.18em] text-[#08111f] hover:bg-[#ddb132]"
              >
                <Settings2 className="mr-2 h-4 w-4" />
                {savingPrompt ? 'Salvando' : 'Salvar'}
              </Button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Selecionar prompt
                </p>
                <select
                  value={selectedPromptTarget}
                  onChange={(event) => setSelectedPromptTarget(event.target.value as AgentPromptTarget)}
                  className="h-11 rounded-2xl border border-white/10 bg-[#0b1727] px-4 text-sm text-white outline-none"
                >
                  {promptOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs leading-5 text-slate-500">{currentPromptOption.hint}</p>
              </div>

              <Textarea
                value={prompts[selectedPromptTarget]}
                onChange={(event) =>
                  setPrompts((current) => ({
                    ...current,
                    [selectedPromptTarget]: event.target.value,
                  }))
                }
                className="min-h-[320px] rounded-[1.4rem] border-white/10 bg-white/5 text-sm leading-6 text-white placeholder:text-slate-500"
                placeholder="Escreva o prompt do agente selecionado."
              />
            </div>
          </Card>

          <Card className="rounded-[1.8rem] border border-white/10 bg-[#07111d] p-5 text-white shadow-2xl">
            <div className="space-y-2">
              <Badge className="w-fit border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-200">
                Upload de materiais
              </Badge>
              <h2 className="text-xl font-black tracking-tight">Base comum e base por especialista</h2>
              <p className="text-sm leading-6 text-slate-400">
                Escolha uma caixa de destino. A base comum envia para todos os agentes; as demais
                caixas alimentam apenas o especialista selecionado.
              </p>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {uploadPresets.map((preset) => {
                const active = uploadPresetId === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setUploadPresetId(preset.id)}
                    className={`rounded-[1.3rem] border p-4 text-left transition-all ${
                      active
                        ? `${preset.accent} shadow-[0_12px_30px_rgba(243,198,63,0.08)]`
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-white">{preset.label}</p>
                      <Badge className="border-white/10 bg-white/5 text-slate-200">
                        {preset.agentKinds.length === 3 ? '3 agentes' : '1 agente'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{preset.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {preset.agentKinds.map((agentKind) => (
                        <Badge key={agentKind} className="border-white/10 bg-black/20 text-slate-300">
                          {interactionAgentLabels[agentKind]}
                        </Badge>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                type="button"
                variant={uploadMode === 'file' ? 'default' : 'outline'}
                onClick={() => setUploadMode('file')}
                className={
                  uploadMode === 'file'
                    ? 'h-10 rounded-2xl bg-[#f3c63f] px-4 text-xs font-black uppercase tracking-[0.16em] text-[#08111f] hover:bg-[#ddb132]'
                    : 'h-10 rounded-2xl border-white/10 bg-white/5 px-4 text-xs font-black uppercase tracking-[0.16em] text-white hover:bg-white/10'
                }
              >
                <Upload className="mr-2 h-4 w-4" />
                Arquivo
              </Button>
              <Button
                type="button"
                variant={uploadMode === 'text' ? 'default' : 'outline'}
                onClick={() => setUploadMode('text')}
                className={
                  uploadMode === 'text'
                    ? 'h-10 rounded-2xl bg-[#f3c63f] px-4 text-xs font-black uppercase tracking-[0.16em] text-[#08111f] hover:bg-[#ddb132]'
                    : 'h-10 rounded-2xl border-white/10 bg-white/5 px-4 text-xs font-black uppercase tracking-[0.16em] text-white hover:bg-white/10'
                }
              >
                <FileText className="mr-2 h-4 w-4" />
                Texto
              </Button>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
              <div className="space-y-4">
                <Input
                  value={uploadTitle}
                  onChange={(event) => setUploadTitle(event.target.value)}
                  placeholder="Titulo do material"
                  className="h-11 rounded-2xl border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-500"
                />

                {uploadMode === 'file' ? (
                  <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-white/5 p-4">
                    <input
                      key={fileInputKey}
                      type="file"
                      accept=".pdf,.txt,.md,.docx"
                      onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
                      className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-[#f3c63f] file:px-4 file:py-2 file:font-bold file:text-[#08111f]"
                    />
                    <p className="mt-3 text-xs text-slate-400">
                      {uploadFile ? `Arquivo selecionado: ${uploadFile.name}` : 'Selecione um arquivo suportado.'}
                    </p>
                  </div>
                ) : (
                  <Textarea
                    value={uploadText}
                    onChange={(event) => setUploadText(event.target.value)}
                    placeholder="Cole aqui o conteudo que deve entrar na memoria do agente."
                    className="min-h-[230px] rounded-[1.4rem] border-white/10 bg-white/5 text-sm leading-6 text-white placeholder:text-slate-500"
                  />
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    Visibilidade
                  </p>
                  <select
                    value={uploadVisibility}
                    onChange={(event) =>
                      setUploadVisibility(event.target.value as 'global' | 'private')
                    }
                    className="mt-3 h-11 w-full rounded-2xl border border-white/10 bg-[#0b1727] px-3 text-sm text-white outline-none"
                  >
                    <option value="global">Global</option>
                    <option value="private">Privada</option>
                  </select>
                </div>

                <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-xs leading-5 text-slate-400">
                  <p className="font-bold uppercase tracking-[0.18em] text-slate-300">Destino atual</p>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-black text-white">{activeUploadPreset.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {activeUploadPreset.agentKinds.map((agentKind) => (
                        <Badge key={agentKind} className="border-white/10 bg-black/20 text-slate-300">
                          {interactionAgentLabels[agentKind]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={uploading || (uploadMode === 'file' ? !uploadFile : !uploadText.trim())}
                  className="h-11 w-full rounded-2xl bg-[#102544] text-xs font-black uppercase tracking-[0.18em] text-white hover:bg-[#153154]"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? 'Enviando' : 'Enviar material'}
                </Button>
              </div>
            </div>

            {lastImportSummary && (
              <div className="mt-4 rounded-[1.4rem] border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <p className="font-bold uppercase tracking-[0.16em]">Ultimo envio concluido</p>
                <p className="mt-2">
                  Documento {lastImportSummary.documentId} com {lastImportSummary.storedChunks}{' '}
                  blocos gravados.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {lastImportSummary.agentKinds.map((agentKind) => (
                    <Badge key={agentKind} className="border-emerald-300/20 bg-black/20 text-emerald-100">
                      {interactionAgentLabels[agentKind]}
                    </Badge>
                  ))}
                </div>
                {lastImportSummary.warnings.length > 0 && (
                  <div className="mt-3 space-y-1 text-amber-100">
                    {lastImportSummary.warnings.map((warning) => (
                      <p key={warning}>{warning}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </section>
      </div>

      <Sheet open={interactionsOpen} onOpenChange={setInteractionsOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-white/10 bg-[#07111d] text-white sm:max-w-[760px]"
        >
          <SheetHeader>
            <SheetTitle className="text-left text-white">Interacoes dos agentes</SheetTitle>
            <SheetDescription className="text-left text-slate-400">
              Visao administrativa das conversas gravadas entre agentes e usuarios.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <Card className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Registros
                </p>
                <p className="mt-2 text-2xl font-black">{interactionStats.total}</p>
              </Card>
              <Card className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Usuarios
                </p>
                <p className="mt-2 text-2xl font-black">{interactionStats.users}</p>
              </Card>
              <Card className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Roleplay
                </p>
                <p className="mt-2 text-2xl font-black">{interactionStats.roleplay}</p>
              </Card>
              <Card className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Feedback
                </p>
                <p className="mt-2 text-2xl font-black">{interactionStats.feedback}</p>
              </Card>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_180px_140px]">
              <Input
                value={interactionsSearch}
                onChange={(event) => setInteractionsSearch(event.target.value)}
                placeholder="Buscar por usuario, pergunta ou resposta"
                className="h-11 rounded-2xl border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-500"
              />
              <select
                value={interactionsAgentFilter}
                onChange={(event) => setInteractionsAgentFilter(event.target.value)}
                className="h-11 rounded-2xl border border-white/10 bg-[#0b1727] px-3 text-sm text-white outline-none"
              >
                <option value="">Todos</option>
                <option value="mentor">Mentor</option>
                <option value="roleplay">Roleplay</option>
                <option value="mentor_feedback">Feedback</option>
              </select>
              <Button
                onClick={loadInteractions}
                disabled={loadingInteractions}
                className="h-11 rounded-2xl bg-[#f3c63f] text-xs font-black uppercase tracking-[0.18em] text-[#08111f] hover:bg-[#ddb132]"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loadingInteractions ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>

            <div className="space-y-3">
              {interactions.length === 0 && !loadingInteractions && (
                <Card className="rounded-[1.4rem] border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
                  Nenhuma interacao encontrada para o filtro atual.
                </Card>
              )}

              {interactions.map((interaction) => (
                <Card
                  key={interaction.id}
                  className="rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 text-white"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="border-white/10 bg-white/5 text-slate-200">
                          {interactionAgentLabels[interaction.agent_kind]}
                        </Badge>
                        <Badge className="border-white/10 bg-white/5 text-slate-200">
                          {new Date(interaction.created_at).toLocaleString('pt-BR')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-200">
                          <UserRound className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-white">
                            {interaction.profile?.full_name || 'Usuario sem nome'}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {interaction.profile?.email || interaction.user_id}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-xs leading-6 text-slate-200 whitespace-pre-wrap break-words">
                          {interaction.content}
                        </p>
                      </div>
                    </div>

                    <div className="grid min-w-[210px] gap-2 rounded-[1.2rem] border border-white/10 bg-black/20 p-4 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <MessageSquareText className="h-4 w-4 text-[#f3c63f]" />
                        <span>{interaction.title || 'Sem titulo'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-cyan-200" />
                        <span>{interaction.document_id}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

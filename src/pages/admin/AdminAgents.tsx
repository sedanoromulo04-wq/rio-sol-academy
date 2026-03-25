import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  agentsAdminApi,
  type AgentMemoryGuidance,
  type AgentMemoryRecord,
  type AgentPromptConfig,
} from '@/lib/agents-admin-api'
import {
  Bot,
  BrainCircuit,
  Database,
  FileText,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  WandSparkles,
} from 'lucide-react'

const defaultPrompts: AgentPromptConfig = {
  shared: '',
  mentor: '',
  roleplay: '',
  mentorFeedback: '',
}

const agentKindLabels: Record<string, string> = {
  mentor: 'Mentor',
  roleplay: 'Roleplay',
  mentor_feedback: 'Mentor Feedback',
}

export default function AdminAgents() {
  const { toast } = useToast()
  const [prompts, setPrompts] = useState<AgentPromptConfig>(defaultPrompts)
  const [guidance, setGuidance] = useState<AgentMemoryGuidance | null>(null)
  const [memories, setMemories] = useState<AgentMemoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [savingPrompts, setSavingPrompts] = useState(false)
  const [refreshingMemories, setRefreshingMemories] = useState(false)
  const [search, setSearch] = useState('')
  const [agentKindFilter, setAgentKindFilter] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('')
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadText, setUploadText] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadVisibility, setUploadVisibility] = useState<'global' | 'private'>('global')
  const [selectedAgentKinds, setSelectedAgentKinds] = useState<Array<'mentor' | 'roleplay' | 'mentor_feedback'>>([
    'mentor',
  ])
  const [uploading, setUploading] = useState(false)
  const [lastImportSummary, setLastImportSummary] = useState<{
    documentId: string
    storedChunks: number
    chunkCount: number
    warnings: string[]
    stats: { charCount: number; pageCount: number | null; sizeMb: number | null; chunkCount: number }
  } | null>(null)

  const memoryStats = useMemo(
    () => ({
      total: memories.length,
      global: memories.filter((memory) => memory.visibility === 'global').length,
      uploads: memories.filter((memory) => memory.source_type === 'admin_upload').length,
    }),
    [memories],
  )

  const loadConfig = async () => {
    const data = await agentsAdminApi.getConfig()
    setPrompts(data.prompts)
    setGuidance(data.guidance)
  }

  const loadMemories = async (refresh = false) => {
    if (refresh) setRefreshingMemories(true)
    const data = await agentsAdminApi.listMemories({
      search,
      agentKind: agentKindFilter,
      visibility: visibilityFilter,
      limit: 80,
    })
    setMemories(data.memories)
    setGuidance((current) => current || data.guidance)
    setRefreshingMemories(false)
  }

  useEffect(() => {
    const boot = async () => {
      try {
        await Promise.all([loadConfig(), loadMemories()])
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

  const toggleAgentKind = (kind: 'mentor' | 'roleplay' | 'mentor_feedback') => {
    setSelectedAgentKinds((current) =>
      current.includes(kind) ? current.filter((item) => item !== kind) : [...current, kind],
    )
  }

  const handleSavePrompts = async () => {
    setSavingPrompts(true)
    try {
      const result = await agentsAdminApi.saveConfig(prompts)
      setPrompts(result.prompts)
      toast({
        title: 'System prompts atualizados',
        description: 'Os agentes ja passam a usar esse conjunto nas proximas respostas.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Falha ao salvar prompts',
        description: error instanceof Error ? error.message : 'Erro desconhecido.',
      })
    } finally {
      setSavingPrompts(false)
    }
  }

  const handleUpload = async () => {
    if (selectedAgentKinds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Selecione ao menos um agente',
        description: 'A memoria importada precisa saber para quais agentes deve ficar disponivel.',
      })
      return
    }

    setUploading(true)
    try {
      const result =
        uploadMode === 'text'
          ? await agentsAdminApi.importTextMemory({
              title: uploadTitle || 'Memoria administrativa',
              content: uploadText,
              visibility: uploadVisibility,
              agentKinds: selectedAgentKinds,
            })
          : await agentsAdminApi.importFileMemory({
              file: uploadFile as File,
              title: uploadTitle || undefined,
              visibility: uploadVisibility,
              agentKinds: selectedAgentKinds,
            })

      setLastImportSummary(result)
      setUploadTitle('')
      setUploadText('')
      setUploadFile(null)
      await loadMemories(true)
      toast({
        title: 'Memoria indexada',
        description: `${result.storedChunks} chunks enviados para a RAG dos agentes.`,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Falha ao importar memoria',
        description: error instanceof Error ? error.message : 'Erro desconhecido.',
      })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-slate-300">Carregando painel dos agentes...</div>
  }

  return (
    <div className="max-w-[1500px] mx-auto space-y-6 animate-fade-in-up">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.14),transparent_30%),linear-gradient(135deg,#08111f_0%,#102544_52%,#050914_100%)] p-7 text-white shadow-[0_24px_80px_rgba(1,6,18,0.48)]">
          <div className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-slate-100">
            Agents Core
          </div>
          <div className="space-y-5">
            <Badge className="w-fit border-0 bg-[#EAB308] px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#061B3B]">
              Controle dos agentes
            </Badge>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
                System prompts e memoria RAG dos agentes
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
                Aqui o admin controla o comportamento dos agentes e a base vetorial do Supabase. O
                NotebookLM continua separado como biblioteca externa.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-amber-100">
                  <Database className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.28em]">Memorias</span>
                </div>
                <p className="text-3xl font-black text-white">{memoryStats.total}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-emerald-100">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.28em]">Globais</span>
                </div>
                <p className="text-3xl font-black text-white">{memoryStats.global}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-cyan-100">
                  <Upload className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.28em]">Uploads</span>
                </div>
                <p className="text-3xl font-black text-white">{memoryStats.uploads}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-[1.75rem] border border-emerald-400/15 bg-emerald-400/5 p-5 text-white shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-100">
              <BrainCircuit className="h-4 w-4" />
              <h2 className="text-sm font-black uppercase tracking-[0.25em]">Orientacao de upload</h2>
            </div>
            <div className="space-y-2 text-sm leading-relaxed text-slate-200">
              <p>
                Ate <strong>{guidance?.maxFilesPerBatch || 5}</strong> arquivos por lote.
              </p>
              <p>
                Ate <strong>{guidance?.maxFileSizeMb || 10} MB</strong> por arquivo.
              </p>
              <p>
                PDF recomendado: ate <strong>{guidance?.recommendedPdfPages || 150}</strong> paginas.
              </p>
              <p>
                Limite operacional de PDF no painel: <strong>{guidance?.hardPdfPages || 250}</strong>{' '}
                paginas.
              </p>
              <p>
                Texto recomendado: ate <strong>{guidance?.recommendedCharactersPerText || 120000}</strong>{' '}
                caracteres por item.
              </p>
              <p>
                Formatos aceitos: <strong>{guidance?.supportedExtensions.join(', ') || '.pdf, .txt, .md, .docx'}</strong>.
              </p>
              <p>
                Arquivos `.doc` legados devem ser convertidos para `.docx` ou PDF antes do envio.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-[2rem] border border-white/10 bg-[#050c18] p-6 text-white shadow-2xl">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Badge className="w-fit border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-200">
                System Prompt
              </Badge>
              <h2 className="text-2xl font-black tracking-tight">Prompt global dos agentes</h2>
              <p className="text-sm leading-relaxed text-slate-400">
                O campo compartilhado entra em todos os agentes. Os campos específicos refinam cada papel.
              </p>
            </div>
            <Button
              onClick={handleSavePrompts}
              disabled={savingPrompts}
              className="rounded-2xl bg-[#EAB308] font-black text-[#061B3B] hover:bg-[#d97706]"
            >
              <WandSparkles className="mr-2 h-4 w-4" />
              {savingPrompts ? 'Salvando...' : 'Salvar prompts'}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Shared</p>
              <Textarea
                value={prompts.shared}
                onChange={(event) => setPrompts((current) => ({ ...current, shared: event.target.value }))}
                className="min-h-[120px] rounded-[1.4rem] border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                placeholder="Instrucoes comuns a todos os agentes."
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Mentor</p>
                <Textarea
                  value={prompts.mentor}
                  onChange={(event) => setPrompts((current) => ({ ...current, mentor: event.target.value }))}
                  className="min-h-[180px] rounded-[1.4rem] border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Roleplay</p>
                <Textarea
                  value={prompts.roleplay}
                  onChange={(event) => setPrompts((current) => ({ ...current, roleplay: event.target.value }))}
                  className="min-h-[180px] rounded-[1.4rem] border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Mentor Feedback
                </p>
                <Textarea
                  value={prompts.mentorFeedback}
                  onChange={(event) =>
                    setPrompts((current) => ({ ...current, mentorFeedback: event.target.value }))
                  }
                  className="min-h-[180px] rounded-[1.4rem] border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-[2rem] border border-white/10 bg-[#050c18] p-6 text-white shadow-2xl">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Badge className="w-fit border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-200">
                Upload para RAG
              </Badge>
              <h2 className="text-2xl font-black tracking-tight">Importar memoria administrativa</h2>
              <p className="text-sm leading-relaxed text-slate-400">
                Texto, PDF, MD, TXT e DOCX entram direto na memoria vetorial do Supabase.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={uploadMode === 'file' ? 'default' : 'outline'}
                onClick={() => setUploadMode('file')}
                className={
                  uploadMode === 'file'
                    ? 'rounded-2xl bg-[#EAB308] text-[#061B3B] hover:bg-[#d97706]'
                    : 'rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10'
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
                    ? 'rounded-2xl bg-[#EAB308] text-[#061B3B] hover:bg-[#d97706]'
                    : 'rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10'
                }
              >
                <FileText className="mr-2 h-4 w-4" />
                Texto
              </Button>
            </div>

            <Input
              value={uploadTitle}
              onChange={(event) => setUploadTitle(event.target.value)}
              placeholder="Titulo da memoria ou nome logico do documento"
              className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
            />

            {uploadMode === 'file' ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/5 p-5">
                <input
                  type="file"
                  accept=".pdf,.txt,.md,.docx"
                  onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-[#EAB308] file:px-4 file:py-2 file:font-bold file:text-[#061B3B]"
                />
                <p className="mt-3 text-sm text-slate-400">
                  {uploadFile ? `Arquivo selecionado: ${uploadFile.name}` : 'Selecione um arquivo suportado.'}
                </p>
              </div>
            ) : (
              <Textarea
                value={uploadText}
                onChange={(event) => setUploadText(event.target.value)}
                placeholder="Cole aqui o texto que deve entrar na RAG dos agentes."
                className="min-h-[220px] rounded-[1.5rem] border-white/10 bg-white/5 text-white placeholder:text-slate-500"
              />
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Visibilidade</p>
                <select
                  value={uploadVisibility}
                  onChange={(event) => setUploadVisibility(event.target.value as 'global' | 'private')}
                  className="mt-3 h-12 w-full rounded-2xl border border-white/10 bg-[#07111f] px-4 text-sm text-white outline-none"
                >
                  <option value="global">Global para todos os usuarios</option>
                  <option value="private">Privada ao admin atual</option>
                </select>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Agentes de destino
                </p>
                <div className="mt-3 space-y-2 text-sm text-slate-200">
                  {(['mentor', 'roleplay', 'mentor_feedback'] as const).map((kind) => (
                    <label key={kind} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAgentKinds.includes(kind)}
                        onChange={() => toggleAgentKind(kind)}
                        className="h-4 w-4 rounded border-white/20 bg-transparent"
                      />
                      <span>{agentKindLabels[kind]}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleUpload}
              disabled={
                uploading ||
                selectedAgentKinds.length === 0 ||
                (uploadMode === 'file' ? !uploadFile : !uploadText.trim())
              }
              className="h-12 w-full rounded-2xl bg-[#061B3B] font-black uppercase tracking-[0.18em] text-white hover:bg-[#0a2955]"
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'Indexando memoria...' : 'Enviar para a RAG'}
            </Button>

            {lastImportSummary && (
              <div className="rounded-[1.4rem] border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <p className="font-bold uppercase tracking-[0.16em]">Importacao concluida</p>
                <p className="mt-2">Documento `{lastImportSummary.documentId}` indexado.</p>
                <p className="mt-1">{lastImportSummary.storedChunks} chunks gravados no Supabase.</p>
                {lastImportSummary.stats.pageCount !== null && (
                  <p className="mt-1">Paginas detectadas: {lastImportSummary.stats.pageCount}.</p>
                )}
                {lastImportSummary.warnings.length > 0 && (
                  <div className="mt-3 space-y-1 text-amber-100">
                    {lastImportSummary.warnings.map((warning) => (
                      <p key={warning}>{warning}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </section>

      <section className="space-y-6">
        <Card className="rounded-[2rem] border border-white/10 bg-[#050c18] p-6 text-white shadow-2xl">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <Badge className="w-fit border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-200">
                Memorias
              </Badge>
              <h2 className="text-2xl font-black tracking-tight">Inspecao, limpeza e reindexacao</h2>
              <p className="text-sm leading-relaxed text-slate-400">
                Use os filtros para localizar memorias, revisar conteudo e executar manutencao do indice.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => loadMemories(true)}
                disabled={refreshingMemories}
                className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshingMemories ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const result = await agentsAdminApi.clearMemories({
                      agentKind: agentKindFilter || undefined,
                      visibility: visibilityFilter || undefined,
                      sourceType: 'admin_upload',
                    })
                    await loadMemories(true)
                    toast({
                      title: 'Memorias limpas',
                      description: `${result.deleted} registros removidos do filtro atual.`,
                    })
                  } catch (error) {
                    toast({
                      variant: 'destructive',
                      title: 'Falha ao limpar memorias',
                      description: error instanceof Error ? error.message : 'Erro desconhecido.',
                    })
                  }
                }}
                className="rounded-2xl border-red-400/20 bg-red-500/10 text-red-100 hover:bg-red-500/20"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar uploads filtrados
              </Button>
            </div>
          </div>

          <div className="mb-5 grid gap-4 lg:grid-cols-[1.3fr_0.35fr_0.35fr]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por titulo ou conteudo"
              className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
            />
            <select
              value={agentKindFilter}
              onChange={(event) => setAgentKindFilter(event.target.value)}
              className="h-12 rounded-2xl border border-white/10 bg-[#07111f] px-4 text-sm text-white outline-none"
            >
              <option value="">Todos os agentes</option>
              <option value="mentor">Mentor</option>
              <option value="roleplay">Roleplay</option>
              <option value="mentor_feedback">Mentor Feedback</option>
            </select>
            <select
              value={visibilityFilter}
              onChange={(event) => setVisibilityFilter(event.target.value)}
              className="h-12 rounded-2xl border border-white/10 bg-[#07111f] px-4 text-sm text-white outline-none"
            >
              <option value="">Todas as visibilidades</option>
              <option value="global">Global</option>
              <option value="private">Privada</option>
            </select>
          </div>

          <div className="mb-6">
            <Button
              onClick={() => loadMemories(true)}
              className="rounded-2xl bg-[#EAB308] font-black text-[#061B3B] hover:bg-[#d97706]"
            >
              <Bot className="mr-2 h-4 w-4" />
              Aplicar filtros
            </Button>
          </div>

          <div className="space-y-4">
            {memories.length === 0 && (
              <div className="rounded-[1.6rem] border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
                Nenhuma memoria encontrada com os filtros atuais.
              </div>
            )}

            {memories.map((memory) => (
              <div
                key={memory.id}
                className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-white">
                        {memory.title || memory.source_name || 'Memoria sem titulo'}
                      </h3>
                      <Badge className="border-white/10 bg-white/5 text-slate-200">
                        {agentKindLabels[memory.agent_kind]}
                      </Badge>
                      <Badge className="border-white/10 bg-white/5 text-slate-200">
                        {memory.visibility}
                      </Badge>
                      <Badge className="border-white/10 bg-white/5 text-slate-200">
                        {memory.source_type}
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">
                      {memory.content.slice(0, 420)}
                      {memory.content.length > 420 ? '...' : ''}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      <span>doc {memory.document_id}</span>
                      <span>chunk {memory.chunk_index}</span>
                      <span>{new Date(memory.created_at).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  <div className="flex min-w-[240px] flex-col gap-3 rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          const result = await agentsAdminApi.reindexMemories({ ids: [memory.id] })
                          toast({
                            title: 'Memoria reindexada',
                            description: `${result.reindexed} registro atualizado.`,
                          })
                        } catch (error) {
                          toast({
                            variant: 'destructive',
                            title: 'Falha ao reindexar memoria',
                            description: error instanceof Error ? error.message : 'Erro desconhecido.',
                          })
                        }
                      }}
                      className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reindexar registro
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          const result = await agentsAdminApi.reindexMemories({ documentId: memory.document_id })
                          toast({
                            title: 'Documento reindexado',
                            description: `${result.reindexed} chunks atualizados.`,
                          })
                        } catch (error) {
                          toast({
                            variant: 'destructive',
                            title: 'Falha ao reindexar documento',
                            description: error instanceof Error ? error.message : 'Erro desconhecido.',
                          })
                        }
                      }}
                      className="rounded-2xl border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reindexar documento
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          await agentsAdminApi.deleteMemory(memory.id)
                          await loadMemories(true)
                          toast({
                            title: 'Memoria removida',
                            description: 'O registro foi excluido da memoria RAG.',
                          })
                        } catch (error) {
                          toast({
                            variant: 'destructive',
                            title: 'Falha ao excluir memoria',
                            description: error instanceof Error ? error.message : 'Erro desconhecido.',
                          })
                        }
                      }}
                      className="rounded-2xl border-red-400/20 bg-red-500/10 text-red-100 hover:bg-red-500/20"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir registro
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}

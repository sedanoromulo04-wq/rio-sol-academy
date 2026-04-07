import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    label: 'Contexto Compartilhado',
    hint: 'Instruções comuns que entram em todos os agentes.',
  },
  {
    id: 'mentor',
    label: 'Mentor Zenith',
    hint: 'Prompt de coaching comercial e orientação principal.',
  },
  {
    id: 'roleplay',
    label: 'Cliente Roleplay',
    hint: 'Prompt do personagem que enfrenta o vendedor no laboratório.',
  },
  {
    id: 'mentorFeedback',
    label: 'Feedback de Vendas',
    hint: 'Prompt do avaliador que nota e corrige cada rodada.',
  },
]

const interactionAgentLabels: Record<string, string> = {
  mentor: 'Mentor Zenith',
  roleplay: 'Cliente Roleplay',
  mentor_feedback: 'Feedback de Vendas',
}

const uploadPresets = [
  {
    id: 'shared',
    label: 'Base Comum',
    description: 'Energia solar, funcionamento da aplicação, FAQ e contexto global.',
    agentKinds: ['mentor', 'roleplay', 'mentor_feedback'] as AgentKind[],
    accent: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  },
  {
    id: 'mentor',
    label: 'Mentor Zenith',
    description: 'Playbooks comerciais, scripts, objeções, argumentação.',
    agentKinds: ['mentor'] as AgentKind[],
    accent: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  },
  {
    id: 'roleplay',
    label: 'Cliente Roleplay',
    description: 'Personas, repertório de cliente, segmentos e comportamento.',
    agentKinds: ['roleplay'] as AgentKind[],
    accent: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  },
  {
    id: 'mentor_feedback',
    label: 'Feedback de Vendas',
    description: 'Rubricas, critérios de nota, boas práticas de avaliação.',
    agentKinds: ['mentor_feedback'] as AgentKind[],
    accent: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
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
        title: 'Falha ao carregar interações',
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
          title: 'Falha ao abrir painel',
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
        prompts[selectedPromptTarget]
      )
      setPrompts(result.prompts)
      toast({
        title: 'Prompt atualizado',
        description: `${currentPromptOption.label} salvo com sucesso no banco do sistema.`,
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
        title: 'Material enviado',
        description: `${result.storedChunks} blocos enviados para ${activeUploadPreset.label}.`,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Falha no upload',
        description: error instanceof Error ? error.message : 'Erro desconhecido.',
      })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="flex h-40 items-center justify-center text-sm text-slate-500">Carregando painel dos agentes...</div>
  }

  return (
    <>
      <div className="mx-auto max-w-[1600px] flex flex-col gap-6 animate-fade-in-up pb-10">
        
        {/* --- HEADER --- */}
        <section className="grid items-center gap-6 xl:grid-cols-[1fr_380px]">
          <div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
                <BrainCircuit className="h-8 w-8 text-sky-400" />
                Central dos Agentes
              </h1>
              <p className="max-w-2xl text-slate-400 text-sm leading-relaxed mt-2">
                Configure comportamentos (Prompts) e gerencie a base de conhecimento (Memória) que alimenta 
                as IAs no sistema. Edite um contexto e acompanhe logs das interações reais.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button onClick={openInteractions} variant="outline" className="h-9 px-4 text-sm bg-slate-800/50 border-white/10 text-white hover:bg-white/10 hover:text-white rounded-xl">
                <Eye className="mr-2 h-4 w-4" />
                Logs de Interações
              </Button>
            </div>
          </div>

          <Card className="rounded-2xl border-white/10 bg-slate-900/50 p-5 p-0">
             <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                <ShieldCheck className="h-4 w-4 text-sky-400 ml-4" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Limites do Sistema</span>
             </div>
             <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 px-4 pb-4">
               <div>
                  <p className="text-xs text-slate-500 font-medium">Tamanho Max</p>
                  <p className="text-lg font-bold text-slate-200 mt-1">{guidance?.maxFileSizeMb || 10} MB</p>
               </div>
               <div>
                  <p className="text-xs text-slate-500 font-medium">Arquivos p/ Lote</p>
                  <p className="text-lg font-bold text-slate-200 mt-1">Até {guidance?.maxFilesPerBatch || 5}</p>
               </div>
               <div className="col-span-2">
                  <p className="text-xs text-slate-500 font-medium mb-1">Formatos Suportados</p>
                  <div className="flex gap-2">
                     <Badge variant="secondary" className="bg-slate-800 text-slate-300 pointer-events-none hover:bg-slate-800">.pdf</Badge>
                     <Badge variant="secondary" className="bg-slate-800 text-slate-300 pointer-events-none hover:bg-slate-800">.docx</Badge>
                     <Badge variant="secondary" className="bg-slate-800 text-slate-300 pointer-events-none hover:bg-slate-800">.md</Badge>
                     <Badge variant="secondary" className="bg-slate-800 text-slate-300 pointer-events-none hover:bg-slate-800">.txt</Badge>
                  </div>
               </div>
             </div>
          </Card>
        </section>

        {/* --- MAIN COLUMNS --- */}
        <section className="grid gap-6 lg:grid-cols-2 items-start mt-2">
          
          {/* COLUMN 1: P R O M P T S */}
          <Card className="rounded-3xl border-white/10 bg-slate-900 shadow-xl overflow-hidden flex flex-col h-full ring-1 ring-white/5">
            <div className="p-6 border-b border-white/5 bg-slate-900/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-400">Comportamento</p>
                <h2 className="text-xl font-semibold text-slate-100 mt-1">Prompt System</h2>
              </div>
              <Button
                onClick={handleSaveSelectedPrompt}
                disabled={savingPrompt}
                className="h-9 px-5 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-600 border border-sky-400/20"
              >
                <Settings2 className="mr-2 h-4 w-4" />
                {savingPrompt ? 'Salvando...' : 'Salvar Prompt'}
              </Button>
            </div>

            <div className="p-6 space-y-5 flex-1 flex flex-col">
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300">Selecionar Agente / Configuração</label>
                <select
                  value={selectedPromptTarget}
                  onChange={(event) => setSelectedPromptTarget(event.target.value as AgentPromptTarget)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-sky-500/50"
                >
                  {promptOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">{currentPromptOption.hint}</p>
              </div>

              <div className="flex-1 min-h-[300px]">
                <Textarea
                  value={prompts[selectedPromptTarget]}
                  onChange={(event) =>
                    setPrompts((current) => ({
                      ...current,
                      [selectedPromptTarget]: event.target.value,
                    }))
                  }
                  className="h-full rounded-xl border-white/10 bg-slate-950 text-sm leading-relaxed text-slate-200 placeholder:text-slate-600 resize-y p-5 font-mono"
                  placeholder="Escreva as diretrizes e instruções de atuação..."
                />
              </div>
            </div>
          </Card>

          {/* COLUMN 2: M E M O R I E S */}
          <Card className="rounded-3xl border-white/10 bg-slate-900 shadow-xl overflow-hidden flex flex-col h-full ring-1 ring-white/5">
             <div className="p-6 border-b border-white/5 bg-slate-900/80">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Base de Conhecimento</p>
                <h2 className="text-xl font-semibold text-slate-100 mt-1">Alimentar Memórias</h2>
            </div>
            
            <div className="p-6 space-y-6 flex-1">
              {/* Presets */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300">Destino (Especialista)</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {uploadPresets.map((preset) => {
                    const active = uploadPresetId === preset.id
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setUploadPresetId(preset.id)}
                        className={`text-left rounded-xl border p-4 transition-all ${
                          active
                            ? `bg-slate-800 border-slate-600 ring-1 ring-slate-400/30`
                            : 'border-white/5 bg-slate-950 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                           <div>
                             <p className={`text-sm font-semibold text-slate-200`}>{preset.label}</p>
                             <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{preset.description}</p>
                           </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Upload Form */}
              <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 space-y-5">
                 
                 <div className="flex items-center gap-4">
                   <div className="flex-1 space-y-1">
                      <label className="text-sm font-medium text-slate-300">Título do Material</label>
                      <Input
                        value={uploadTitle}
                        onChange={(event) => setUploadTitle(event.target.value)}
                        placeholder="Ex: Novo Manual de Vendas v2"
                        className="h-10 rounded-xl border-white/10 bg-slate-900 text-sm text-slate-200 placeholder:text-slate-600"
                      />
                   </div>
                   <div className="w-1/3 min-w-[120px] space-y-1">
                      <label className="text-sm font-medium text-slate-300">Visão</label>
                      <select
                        value={uploadVisibility}
                        onChange={(event) => setUploadVisibility(event.target.value as 'global' | 'private')}
                        className="h-10 w-full rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-slate-200 outline-none"
                      >
                        <option value="global">Global</option>
                        <option value="private">Privada</option>
                      </select>
                   </div>
                 </div>

                 <Tabs defaultValue="file" value={uploadMode} onValueChange={(v) => setUploadMode(v as 'file'|'text')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-900 border border-white/5 h-10 p-1">
                    <TabsTrigger value="file" className="rounded-lg text-xs font-semibold data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400">
                      <Upload className="h-3 w-3 mr-2" /> Upload Arquivo
                    </TabsTrigger>
                    <TabsTrigger value="text" className="rounded-lg text-xs font-semibold data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400">
                      <FileText className="h-3 w-3 mr-2" /> Inserção de Texto
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="file" className="mt-4">
                    <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 flex flex-col items-center justify-center bg-slate-900/50 text-center space-y-3">
                       <Upload className="h-6 w-6 text-slate-500 mb-1" />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors">Procurar arquivo</span>
                          <input
                            id="file-upload"
                            key={fileInputKey}
                            type="file"
                            accept=".pdf,.txt,.md,.docx"
                            onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-slate-500">Ou arraste um PDF, texto, markdown ou word aqui.</p>
                        
                        {uploadFile && (
                          <div className="mt-4 max-w-full px-4 py-2 bg-slate-800 rounded-lg text-xs text-slate-300 flex items-center gap-2 border border-slate-700 truncate">
                             <FileText className="h-3 w-3 text-sky-400 shrink-0" />
                             <span className="truncate">{uploadFile.name}</span>
                          </div>
                        )}
                    </div>
                  </TabsContent>
                  <TabsContent value="text" className="mt-4">
                     <Textarea
                      value={uploadText}
                      onChange={(event) => setUploadText(event.target.value)}
                      placeholder="Cole textos brutos, FAQs, etc..."
                      className="min-h-[160px] rounded-xl border-white/10 bg-slate-900 text-sm p-4 text-slate-200 placeholder:text-slate-600 resize-y"
                    />
                  </TabsContent>
                </Tabs>

                 <Button
                    onClick={handleUpload}
                    disabled={uploading || (uploadMode === 'file' ? !uploadFile : !uploadText.trim())}
                    className="h-10 w-full rounded-xl bg-slate-100 text-slate-900 text-sm font-semibold hover:bg-slate-200 disabled:opacity-50 mt-4"
                  >
                    {uploading ? 'Processando envio...' : 'Processar e Alimentar Memória'}
                 </Button>

                 {lastImportSummary && (
                  <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-200/90">
                    <p className="font-semibold mb-1">Upload Realizado com Sucesso!</p>
                    <p className="text-xs text-emerald-300/70">
                      Material arquivado com {lastImportSummary.storedChunks} blocos estruturados e vinculados para:
                    </p>
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {lastImportSummary.agentKinds.map((ag) => (
                        <span key={ag} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md">
                          {interactionAgentLabels[ag]}
                        </span>
                      ))}
                    </div>
                  </div>
                 )}
              </div>
            </div>
          </Card>
        </section>
      </div>

      {/* --- LOGS SIDEBAR (SHEET) --- */}
      <Sheet open={interactionsOpen} onOpenChange={setInteractionsOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto border-l-white/10 bg-slate-950 p-6 flex flex-col gap-6"
        >
          <SheetHeader className="text-left border-b border-white/5 pb-4">
            <SheetTitle className="text-xl font-bold text-slate-100">Registros de Agente</SheetTitle>
            <SheetDescription className="text-slate-400">
              Audit logs, simulações e feedbacks executados.
            </SheetDescription>
          </SheetHeader>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
             <div className="bg-slate-900 border border-white/5 p-3 rounded-xl">
                <p className="text-xs font-semibold text-slate-500">Hits</p>
                <p className="text-lg font-bold text-slate-200 mt-1">{interactionStats.total}</p>
             </div>
             <div className="bg-slate-900 border border-white/5 p-3 rounded-xl">
                <p className="text-xs font-semibold text-slate-500">Usuários</p>
                <p className="text-lg font-bold text-slate-200 mt-1">{interactionStats.users}</p>
             </div>
             <div className="bg-slate-900 border border-white/5 p-3 rounded-xl">
                <p className="text-xs font-semibold text-slate-500">Roleplay</p>
                <p className="text-lg font-bold text-slate-200 mt-1">{interactionStats.roleplay}</p>
             </div>
             <div className="bg-slate-900 border border-white/5 p-3 rounded-xl">
                <p className="text-xs font-semibold text-slate-500">Feedback</p>
                <p className="text-lg font-bold text-slate-200 mt-1">{interactionStats.feedback}</p>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <Input 
                value={interactionsSearch}
                onChange={e => setInteractionsSearch(e.target.value)}
                placeholder="Buscar palavra-chave..."
                className="h-10 rounded-xl bg-slate-900 border-white/10 text-sm flex-1 text-slate-200"
             />
             <select
                value={interactionsAgentFilter}
                onChange={e => setInteractionsAgentFilter(e.target.value)}
                className="h-10 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-slate-200 outline-none w-36 shrink-0"
              >
                <option value="">Filtro: Todos</option>
                <option value="mentor">Mentor</option>
                <option value="roleplay">Roleplay</option>
                <option value="mentor_feedback">Feedback</option>
              </select>
             <Button
                onClick={loadInteractions}
                disabled={loadingInteractions}
                variant="outline"
                className="h-10 rounded-xl px-4 bg-slate-800 border-white/10 text-white hover:bg-slate-700 w-32 shrink-0"
             >
                <RefreshCw className={`mr-2 h-4 w-4 ${loadingInteractions ? 'animate-spin' : ''}`} />
                Atualizar
             </Button>
          </div>

          <div className="flex-1 space-y-4">
             {interactions.length === 0 && !loadingInteractions && (
                <div className="py-12 text-center bg-slate-900/50 rounded-2xl border border-white/5 text-sm text-slate-500">
                   Nenhum log encontrado.
                </div>
             )}

             {interactions.map((interaction) => (
               <div key={interaction.id} className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-white/5">
                     <UserRound className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start gap-4">
                        <div>
                           <p className="text-sm font-semibold text-slate-200">{interaction.profile?.full_name || 'Desconhecido'}</p>
                           <p className="text-xs text-slate-500">{interaction.profile?.email || interaction.user_id}</p>
                        </div>
                        <div className="text-right">
                           <Badge variant="secondary" className="bg-slate-800 text-slate-300 font-medium text-[10px] whitespace-nowrap mb-1">{interactionAgentLabels[interaction.agent_kind]}</Badge>
                           <p className="text-[10px] text-slate-600 block">{new Date(interaction.created_at).toLocaleString('pt-BR')}</p>
                        </div>
                     </div>
                     
                     <div className="mt-3 bg-slate-950 p-3 rounded-xl border border-white/5">
                        <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{interaction.content}</p>
                     </div>
                     
                     <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                        {interaction.title && (
                          <div className="flex items-center gap-1.5 line-clamp-1"><MessageSquareText className="h-3.5 w-3.5 text-sky-400" />{interaction.title}</div>
                        )}
                        {interaction.document_id && (
                          <div className="flex items-center gap-1.5"><Bot className="h-3.5 w-3.5 text-amber-400 shrink-0" /><span className="truncate">{interaction.document_id.slice(0,8)}...</span></div>
                        )}
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

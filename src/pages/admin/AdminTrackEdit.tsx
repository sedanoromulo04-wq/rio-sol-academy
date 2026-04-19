import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { formatDeadline, formatMinutes, getDeadlineDays, getEstimatedMinutes } from '@/lib/learning'
import { buildYouTubeThumbnailUrl, extractYouTubeVideoId } from '@/lib/youtube'
import useAdminStore from '@/stores/useAdminStore'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Eye, EyeOff, Image as ImageIcon, Loader2, RefreshCw, Save, Video } from 'lucide-react'

const pipelineStatusLabel: Record<string, string> = {
  not_configured: 'Nao configurado',
  idle: 'Pronto para fila',
  queued: 'Na fila',
  processing: 'Processando',
  ready: 'Pronto',
  error: 'Erro',
}

const assetStatusLabel: Record<string, string> = {
  idle: 'Pendente',
  queued: 'Na fila',
  processing: 'Processando',
  ready: 'Pronto',
  error: 'Erro',
}

const initialFormData = {
  title: '',
  description: '',
  video_url: '',
  source_platform: 'youtube' as 'youtube' | 'external',
  youtube_video_id: null as string | null,
  thumbnail_url: '',
  category: 'Tecnico',
  position: 1,
  video_count: 1,
  material_count: 1,
  assessment_question_count: 5,
  passing_score: 70,
  estimated_minutes_override: 0,
  audience_scope: 'all' as 'all' | 'specialty',
  target_specialties_text: '',
  automation_status: 'not_configured' as 'not_configured' | 'idle' | 'queued' | 'processing' | 'ready' | 'error',
  transcript_status: 'idle' as 'idle' | 'queued' | 'processing' | 'ready' | 'error',
  transcript_text: '',
  summary_status: 'idle' as 'idle' | 'queued' | 'processing' | 'ready' | 'error',
  summary_text: '',
  mind_map_status: 'idle' as 'idle' | 'queued' | 'processing' | 'ready' | 'error',
  mind_map_markdown: '',
  assessment_suggestions: [] as string[],
  automation_requested_at: null as string | null,
  automation_processed_at: null as string | null,
  automation_error: null as string | null,
}

export default function AdminTrackEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { content, saveContent, requestContentAutomation, refreshContentItem } = useAdminStore()
  const { toast } = useToast()

  const isNew = !id || id === 'new'
  const item = isNew ? null : content.find((contentItem) => contentItem.id === id)
  const { togglePublished } = useAdminStore()
  const [formData, setFormData] = useState(initialFormData)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (item) {
      setFormData({
        ...initialFormData,
        ...item,
        estimated_minutes_override: item.estimated_minutes_override || 0,
        target_specialties_text: (item.target_specialties || []).join(', '),
      })
      return
    }

    setFormData(initialFormData)
  }, [item])

  // Polling: refresh from Supabase while automation is active
  const isAutomationActive =
    formData.automation_status === 'queued' || formData.automation_status === 'processing'

  useEffect(() => {
    if (!id || isNew || !isAutomationActive) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
      return
    }

    const poll = async () => {
      const refreshed = await refreshContentItem(id)
      if (refreshed) {
        setFormData((prev) => ({
          ...prev,
          ...refreshed,
          estimated_minutes_override: refreshed.estimated_minutes_override || 0,
          target_specialties_text: (refreshed.target_specialties || []).join(', '),
          source_platform: refreshed.source_platform as typeof prev.source_platform,
          audience_scope: refreshed.audience_scope as typeof prev.audience_scope,
          automation_status: refreshed.automation_status as typeof prev.automation_status,
          transcript_status: refreshed.transcript_status as typeof prev.transcript_status,
          summary_status: refreshed.summary_status as typeof prev.summary_status,
          mind_map_status: refreshed.mind_map_status as typeof prev.mind_map_status,
        }))

        // Stop polling when completed or errored
        if (refreshed.automation_status !== 'queued' && refreshed.automation_status !== 'processing') {
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
          }

          if (refreshed.automation_status === 'ready') {
            toast({ title: '✅ Pipeline completo', description: 'Transcrição, resumo, mapa mental e sugestões de prova gerados com sucesso!' })
          }
        }
      }
    }

    pollingRef.current = setInterval(poll, 5000)
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [id, isNew, isAutomationActive, refreshContentItem, toast])

  const moduleLoadPreview = useMemo(() => {
    const previewBase = {
      ...formData,
      estimated_minutes_override:
        formData.estimated_minutes_override > 0 ? formData.estimated_minutes_override : null,
    }

    return {
      estimatedMinutes: getEstimatedMinutes(previewBase),
      deadlineDays: getDeadlineDays(previewBase),
    }
  }, [formData])

  const youtubeVideoIdPreview = useMemo(
    () => extractYouTubeVideoId(formData.video_url),
    [formData.video_url],
  )

  const handleSave = () => {
    if (!formData.title.trim()) {
      return toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Titulo e obrigatorio.',
      })
    }

    const targetSpecialties = formData.target_specialties_text
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    if (formData.audience_scope === 'specialty' && targetSpecialties.length === 0) {
      return toast({
        variant: 'destructive',
        title: 'Especialidade obrigatoria',
        description: 'Informe ao menos uma especialidade para modulos segmentados.',
      })
    }

    const nextVideoId = extractYouTubeVideoId(formData.video_url)
    const videoChanged = !!item && item.video_url !== formData.video_url

    const pipelineDefaults = nextVideoId
      ? {
          source_platform: 'youtube' as const,
          youtube_video_id: nextVideoId,
          automation_status:
            !item || videoChanged ? ('idle' as const) : formData.automation_status,
          transcript_status:
            !item || videoChanged ? ('idle' as const) : formData.transcript_status,
          transcript_text: !item || videoChanged ? '' : formData.transcript_text,
          summary_status: !item || videoChanged ? ('idle' as const) : formData.summary_status,
          summary_text: !item || videoChanged ? '' : formData.summary_text,
          mind_map_status: !item || videoChanged ? ('idle' as const) : formData.mind_map_status,
          mind_map_markdown: !item || videoChanged ? '' : formData.mind_map_markdown,
          assessment_suggestions:
            !item || videoChanged ? ([] as string[]) : formData.assessment_suggestions,
          automation_requested_at: !item || videoChanged ? null : formData.automation_requested_at,
          automation_processed_at: !item || videoChanged ? null : formData.automation_processed_at,
          automation_error: !item || videoChanged ? null : formData.automation_error,
        }
      : {
          source_platform: 'external' as const,
          youtube_video_id: null,
          automation_status: 'not_configured' as const,
          transcript_status: 'idle' as const,
          transcript_text: '',
          summary_status: 'idle' as const,
          summary_text: '',
          mind_map_status: 'idle' as const,
          mind_map_markdown: '',
          assessment_suggestions: [] as string[],
          automation_requested_at: null,
          automation_processed_at: null,
          automation_error: null,
        }

    saveContent({
      id: item?.id || crypto.randomUUID(),
      title: formData.title,
      description: formData.description,
      video_url: formData.video_url,
      thumbnail_url: formData.thumbnail_url,
      category: formData.category,
      position: formData.position,
      video_count: formData.video_count,
      material_count: formData.material_count,
      assessment_question_count: formData.assessment_question_count,
      passing_score: formData.passing_score,
      estimated_minutes_override:
        formData.estimated_minutes_override > 0 ? formData.estimated_minutes_override : null,
      audience_scope: formData.audience_scope,
      target_specialties: targetSpecialties,
      source_platform: pipelineDefaults.source_platform,
      youtube_video_id: pipelineDefaults.youtube_video_id,
      automation_status: pipelineDefaults.automation_status,
      transcript_status: pipelineDefaults.transcript_status,
      transcript_text: pipelineDefaults.transcript_text,
      summary_status: pipelineDefaults.summary_status,
      summary_text: pipelineDefaults.summary_text,
      mind_map_status: pipelineDefaults.mind_map_status,
      mind_map_markdown: pipelineDefaults.mind_map_markdown,
      assessment_suggestions: pipelineDefaults.assessment_suggestions,
      automation_requested_at: pipelineDefaults.automation_requested_at,
      automation_processed_at: pipelineDefaults.automation_processed_at,
      automation_error: pipelineDefaults.automation_error,
    })

    toast({ title: 'Sucesso', description: 'Conteudo salvo com sucesso.' })
    navigate('/admin/tracks')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up pb-20">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="text-slate-400 hover:text-white rounded-full"
        >
          <Link to="/admin/tracks">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-black text-white font-display">
          {isNew ? 'Criar novo conteudo' : `Editando: ${formData.title}`}
        </h1>
      </div>

      <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Titulo</Label>
            <Input
              value={formData.title}
              onChange={(event) => setFormData({ ...formData, title: event.target.value })}
              placeholder="Ex: Introducao a Energia Solar"
              className="bg-[#1F2937] border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Descricao</Label>
            <Textarea
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              className="bg-[#1F2937] border-white/10 text-white min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Video className="w-4 h-4" /> URL do video
              </Label>
              <Input
                value={formData.video_url}
                onChange={(event) => setFormData({ ...formData, video_url: event.target.value })}
                placeholder="https://youtube.com/..."
                className="bg-[#1F2937] border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> URL da capa
              </Label>
              <Input
                value={formData.thumbnail_url}
                onChange={(event) =>
                  setFormData({ ...formData, thumbnail_url: event.target.value })
                }
                placeholder="https://..."
                className="bg-[#1F2937] border-white/10 text-white"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
                  Estrutura de automacao
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  O sistema detecta o video do YouTube e prepara a fila tecnica de transcricao,
                  resumo, mapa mental e sugestoes de prova.
                </p>
              </div>
              {item?.id && formData.youtube_video_id && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isAutomationActive || formData.automation_status === 'ready'}
                  onClick={() => requestContentAutomation(item.id)}
                  className="border-cyan-300/30 bg-transparent text-cyan-100 hover:bg-cyan-400/10 disabled:opacity-50"
                >
                  {isAutomationActive ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {formData.automation_status === 'ready' ? 'Pipeline concluido' :
                   isAutomationActive ? 'Processando...' : 'Enviar para fila tecnica'}
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="border-none bg-slate-900/70 text-slate-100">
                Origem: {youtubeVideoIdPreview ? 'YouTube reconhecido' : 'Link externo ou invalido'}
              </Badge>
              <Badge className={`border-none flex items-center gap-1.5 ${
                formData.automation_status === 'ready' ? 'bg-emerald-500/20 text-emerald-200' :
                formData.automation_status === 'processing' ? 'bg-amber-500/20 text-amber-200 animate-pulse' :
                formData.automation_status === 'queued' ? 'bg-blue-500/20 text-blue-200' :
                formData.automation_status === 'error' ? 'bg-rose-500/20 text-rose-200' :
                'bg-slate-900/70 text-slate-100'
              }`}>
                {(formData.automation_status === 'processing' || formData.automation_status === 'queued') && (
                  <Loader2 className="w-3 h-3 animate-spin" />
                )}
                Pipeline: {pipelineStatusLabel[formData.automation_status]}
              </Badge>
              {(['transcript_status', 'summary_status', 'mind_map_status'] as const).map((key) => {
                const label = key === 'transcript_status' ? 'Transcricao' : key === 'summary_status' ? 'Resumo' : 'Mapa mental'
                const status = formData[key]
                return (
                  <Badge key={key} className={`border-none flex items-center gap-1.5 ${
                    status === 'ready' ? 'bg-emerald-500/20 text-emerald-200' :
                    status === 'processing' ? 'bg-amber-500/20 text-amber-200 animate-pulse' :
                    status === 'queued' ? 'bg-blue-500/20 text-blue-200' :
                    status === 'error' ? 'bg-rose-500/20 text-rose-200' :
                    'bg-slate-900/70 text-slate-100'
                  }`}>
                    {status === 'processing' && <Loader2 className="w-3 h-3 animate-spin" />}
                    {label}: {assetStatusLabel[status]}
                  </Badge>
                )
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl bg-black/20 p-4">
                <p className="text-slate-400">Video ID detectado</p>
                <p className="mt-2 text-white font-bold break-all">
                  {youtubeVideoIdPreview || 'Nenhum ID valido encontrado no link'}
                </p>
              </div>
              <div className="rounded-xl bg-black/20 p-4">
                <p className="text-slate-400">Ultima solicitacao</p>
                <p className="mt-2 text-white font-bold">
                  {formData.automation_requested_at
                    ? new Date(formData.automation_requested_at).toLocaleString('pt-BR')
                    : 'Ainda nao enviada para a fila'}
                </p>
              </div>
            </div>

            {youtubeVideoIdPreview && !formData.thumbnail_url && (
              <div className="rounded-xl bg-black/20 p-4 text-sm text-slate-300 break-all">
                Capa sugerida: {buildYouTubeThumbnailUrl(youtubeVideoIdPreview)}
              </div>
            )}

            {formData.automation_error && (
              <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                Ultimo erro tecnico: {formData.automation_error}
              </div>
            )}
          </div>

          <div className="space-y-2 md:w-1/2">
            <Label className="text-slate-300">Trilha</Label>
            <select
              value={formData.category}
              onChange={(event) => setFormData({ ...formData, category: event.target.value })}
              className="w-full h-10 bg-[#1F2937] border border-white/10 rounded-md text-sm px-3 text-white outline-none"
            >
              <option value="Cultura">Cultura</option>
              <option value="Tecnico">Tecnico</option>
              <option value="Psicologia">Psicologia</option>
              <option value="Pratica">Pratica</option>
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Alcance do conteudo</Label>
              <select
                value={formData.audience_scope}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    audience_scope: event.target.value === 'specialty' ? 'specialty' : 'all',
                  })
                }
                className="w-full h-10 bg-[#1F2937] border border-white/10 rounded-md text-sm px-3 text-white outline-none"
              >
                <option value="all">Conteudo geral para toda a empresa</option>
                <option value="specialty">Conteudo especifico por especialidade</option>
              </select>
            </div>

            {formData.audience_scope === 'specialty' && (
              <div className="space-y-2">
                <Label className="text-slate-300">Especialidades alvo</Label>
                <Textarea
                  value={formData.target_specialties_text}
                  onChange={(event) =>
                    setFormData({ ...formData, target_specialties_text: event.target.value })
                  }
                  placeholder="Ex: logistica, aplicacao tecnica, vendas"
                  className="bg-[#1F2937] border-white/10 text-white min-h-[90px]"
                />
                <p className="text-[11px] text-slate-500">
                  Separe varias especialidades por virgula.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Ordem do modulo</Label>
              <Input
                type="number"
                min={1}
                value={formData.position}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    position: Math.max(1, Number(event.target.value) || 1),
                  })
                }
                className="bg-[#1F2937] border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Quantidade de videos</Label>
              <Input
                type="number"
                min={1}
                value={formData.video_count}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    video_count: Math.max(1, Number(event.target.value) || 1),
                  })
                }
                className="bg-[#1F2937] border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Quantidade de materiais</Label>
              <Input
                type="number"
                min={0}
                value={formData.material_count}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    material_count: Math.max(0, Number(event.target.value) || 0),
                  })
                }
                className="bg-[#1F2937] border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Questoes da prova</Label>
              <Input
                type="number"
                min={1}
                value={formData.assessment_question_count}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    assessment_question_count: Math.max(1, Number(event.target.value) || 1),
                  })
                }
                className="bg-[#1F2937] border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Nota minima (%)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={formData.passing_score}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    passing_score: Math.min(100, Math.max(1, Number(event.target.value) || 1)),
                  })
                }
                className="bg-[#1F2937] border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Tempo manual em minutos</Label>
              <Input
                type="number"
                min={0}
                value={formData.estimated_minutes_override || 0}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    estimated_minutes_override: Math.max(0, Number(event.target.value) || 0),
                  })
                }
                className="bg-[#1F2937] border-white/10 text-white"
              />
              <p className="text-[11px] text-slate-500">Use 0 para manter o calculo automatico.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#EAB308]/20 bg-[#EAB308]/10 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#EAB308]">
              Inteligencia de prazo
            </p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Carga estimada</p>
                <p className="text-white font-bold">
                  {formatMinutes(moduleLoadPreview.estimatedMinutes)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Prazo automatico</p>
                <p className="text-white font-bold">
                  {formatDeadline(moduleLoadPreview.deadlineDays)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Aprovacao</p>
                <p className="text-white font-bold">
                  {formData.passing_score}% ou mais na prova final
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Transcricao gerada</Label>
              <Textarea
                value={formData.transcript_text}
                readOnly
                className="bg-[#111827] border-white/10 text-slate-300 min-h-[220px]"
                placeholder="A transcricao automatica aparecera aqui quando a fila processar o video."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Resumo gerado</Label>
              <Textarea
                value={formData.summary_text}
                readOnly
                className="bg-[#111827] border-white/10 text-slate-300 min-h-[220px]"
                placeholder="O resumo executivo aparecera aqui apos a geracao automatica."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Mapa mental gerado</Label>
              <Textarea
                value={formData.mind_map_markdown}
                readOnly
                className="bg-[#111827] border-white/10 text-slate-300 min-h-[220px]"
                placeholder="O mapa mental em topicos aparecera aqui apos a geracao automatica."
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4 space-y-3">
            <Label className="text-slate-300">Sugestoes de prova geradas</Label>
            {formData.assessment_suggestions.length === 0 ? (
              <p className="text-sm text-slate-500">
                As sugestoes automaticas de questoes ainda nao foram geradas.
              </p>
            ) : (
              <div className="space-y-2">
                {formData.assessment_suggestions.map((suggestion, index) => (
                  <div
                    key={`${index}-${suggestion}`}
                    className="rounded-xl bg-black/20 p-3 text-sm text-slate-200"
                  >
                    {index + 1}. {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visibility control — only for saved items */}
        {!isNew && item && (
          <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {item.is_published
                ? <Eye className="w-5 h-5 text-emerald-400" />
                : <EyeOff className="w-5 h-5 text-slate-500" />}
              <div>
                <p className="text-sm font-bold text-white">
                  {item.is_published ? 'Conteudo visivel para alunos' : 'Conteudo oculto (rascunho)'}
                </p>
                <p className="text-xs text-slate-500">
                  {item.is_published
                    ? 'Alunos com acesso podem ver e assistir este modulo.'
                    : 'Nenhum aluno ve este conteudo. Publique quando estiver pronto.'}
                </p>
              </div>
            </div>
            <Switch
              checked={item.is_published}
              onCheckedChange={() => togglePublished(item.id)}
              className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-700 shrink-0"
            />
          </div>
        )}

        <div className="pt-6 border-t border-white/10 flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-[#EAB308] hover:bg-[#d97706] text-[#061b3b] font-bold px-8"
          >
            <Save className="w-4 h-4 mr-2" /> Salvar conteudo
          </Button>
        </div>
      </div>
    </div>
  )
}

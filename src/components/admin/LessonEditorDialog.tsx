import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Lesson, Resource } from '@/stores/useAdminStore'
import { Plus, Trash2, FileText, Video, Link as LinkIcon } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  lesson?: Lesson | null
  onSave: (lesson: Lesson) => void
}

export function LessonEditorDialog({ open, onOpenChange, lesson, onSave }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [category, setCategory] = useState('Técnico')
  const [difficulty, setDifficulty] = useState('Iniciante')
  const [coverImage, setCoverImage] = useState('')
  const [resources, setResources] = useState<Resource[]>([])

  const [newResName, setNewResName] = useState('')
  const [newResType, setNewResType] = useState<'pdf' | 'video' | 'link'>('pdf')
  const [newResUrl, setNewResUrl] = useState('')

  useEffect(() => {
    if (open) {
      setTitle(lesson?.title || '')
      setDescription(lesson?.description || '')
      setVideoUrl(lesson?.videoUrl || '')
      setCategory(lesson?.category || 'Técnico')
      setDifficulty(lesson?.difficulty || 'Iniciante')
      setCoverImage(lesson?.coverImage || '')
      setResources(lesson?.resources || [])
    }
  }, [open, lesson])

  const handleSave = () => {
    onSave({
      id: lesson?.id || `l-${Date.now()}`,
      title,
      description,
      videoUrl,
      category,
      difficulty,
      coverImage,
      resources,
    })
    onOpenChange(false)
  }

  const handleAddResource = () => {
    if (newResName && newResUrl) {
      setResources([
        ...resources,
        { id: `r-${Date.now()}`, name: newResName, type: newResType, url: newResUrl },
      ])
      setNewResName('')
      setNewResUrl('')
    }
  }

  const getIcon = (type: string) => {
    if (type === 'pdf') return <FileText className="w-4 h-4 text-red-400" />
    if (type === 'video') return <Video className="w-4 h-4 text-blue-400" />
    return <LinkIcon className="w-4 h-4 text-green-400" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111827] border-white/10 text-white sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">
            {lesson ? 'Editar Aula' : 'Nova Aula'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-300">Título da Aula</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-[#1F2937] border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Conteúdo/Descrição</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-[#1F2937] border-white/10 text-white min-h-[120px]"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Categoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-[#1F2937] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F2937] border-white/10 text-white">
                      <SelectItem value="Cultura">Cultura</SelectItem>
                      <SelectItem value="Técnico">Técnico</SelectItem>
                      <SelectItem value="Psicologia">Psicologia</SelectItem>
                      <SelectItem value="Prática">Prática</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Dificuldade</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="bg-[#1F2937] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F2937] border-white/10 text-white">
                      <SelectItem value="Iniciante">Iniciante</SelectItem>
                      <SelectItem value="Intermediário">Intermediário</SelectItem>
                      <SelectItem value="Avançado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Capa do Conteúdo (URL)</Label>
                <Input
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="bg-[#1F2937] border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Video className="w-4 h-4 text-slate-400" /> URL do Vídeo (Principal)
                </Label>
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="bg-[#1F2937] border-white/10 text-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1F2937]/50 p-5 rounded-xl border border-white/5 space-y-4">
            <h4 className="font-semibold text-sm text-slate-200">Materiais de Apoio / Anexos</h4>

            <div className="flex flex-wrap md:flex-nowrap gap-3 items-end">
              <div className="flex-1 min-w-[150px] space-y-1.5">
                <Label className="text-xs text-slate-400">Nome do Arquivo/Link</Label>
                <Input
                  value={newResName}
                  onChange={(e) => setNewResName(e.target.value)}
                  className="h-9 bg-[#111827] border-white/10 text-xs"
                />
              </div>
              <div className="w-32 space-y-1.5">
                <Label className="text-xs text-slate-400">Tipo</Label>
                <select
                  value={newResType}
                  onChange={(e) => setNewResType(e.target.value as any)}
                  className="w-full h-9 bg-[#111827] border border-white/10 rounded-md text-xs px-2 text-white outline-none"
                >
                  <option value="pdf">PDF</option>
                  <option value="video">Vídeo</option>
                  <option value="link">Link Externo</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px] space-y-1.5">
                <Label className="text-xs text-slate-400">URL</Label>
                <Input
                  value={newResUrl}
                  onChange={(e) => setNewResUrl(e.target.value)}
                  className="h-9 bg-[#111827] border-white/10 text-xs"
                />
              </div>
              <Button
                onClick={handleAddResource}
                size="sm"
                className="h-9 bg-white/10 hover:bg-white/20 text-white px-4"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Adicionar
              </Button>
            </div>

            <div className="space-y-2 mt-4">
              {resources.length === 0 && (
                <p className="text-xs text-slate-500 italic">Nenhum recurso anexado.</p>
              )}
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between bg-[#111827] p-2.5 rounded-lg border border-white/5"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {getIcon(res.type)}
                    <span className="text-sm font-medium text-slate-300 truncate">{res.name}</span>
                    <span className="text-[10px] text-slate-500 max-w-[200px] truncate hidden sm:inline-block">
                      {res.url}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400 hover:bg-red-500/20 rounded-md"
                    onClick={() => setResources(resources.filter((r) => r.id !== res.id))}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="border-t border-white/5 pt-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-300 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#EAB308] hover:bg-[#d97706] text-[#061b3b] font-bold px-6"
          >
            Salvar Conteúdo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
  const [resources, setResources] = useState<Resource[]>([])

  const [newResName, setNewResName] = useState('')
  const [newResType, setNewResType] = useState<'pdf' | 'video' | 'link'>('pdf')
  const [newResUrl, setNewResUrl] = useState('')

  useEffect(() => {
    if (open) {
      setTitle(lesson?.title || '')
      setDescription(lesson?.description || '')
      setVideoUrl(lesson?.videoUrl || '')
      setResources(lesson?.resources || [])
    }
  }, [open, lesson])

  const handleSave = () => {
    onSave({
      id: lesson?.id || `l-${Date.now()}`,
      title,
      description,
      videoUrl,
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
      <DialogContent className="bg-[#111827] border-white/10 text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">
            {lesson ? 'Editar Aula' : 'Nova Aula'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Título da Aula</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#1F2937] border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">URL do Vídeo (Principal)</Label>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
              className="bg-[#1F2937] border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Conteúdo/Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#1F2937] border-white/10 text-white min-h-[100px]"
            />
          </div>

          <div className="bg-[#1F2937]/50 p-4 rounded-xl border border-white/5 space-y-4">
            <h4 className="font-semibold text-sm text-slate-200">Materiais de Apoio</h4>

            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-slate-400">Nome</Label>
                <Input
                  value={newResName}
                  onChange={(e) => setNewResName(e.target.value)}
                  className="h-8 bg-[#111827] border-white/10 text-xs"
                />
              </div>
              <div className="w-24 space-y-1">
                <Label className="text-xs text-slate-400">Tipo</Label>
                <select
                  value={newResType}
                  onChange={(e) => setNewResType(e.target.value as any)}
                  className="w-full h-8 bg-[#111827] border border-white/10 rounded-md text-xs px-2 text-white outline-none"
                >
                  <option value="pdf">PDF</option>
                  <option value="video">Vídeo</option>
                  <option value="link">Link</option>
                </select>
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-slate-400">URL/Arquivo</Label>
                <Input
                  value={newResUrl}
                  onChange={(e) => setNewResUrl(e.target.value)}
                  className="h-8 bg-[#111827] border-white/10 text-xs"
                />
              </div>
              <Button
                onClick={handleAddResource}
                size="sm"
                className="h-8 bg-white/10 hover:bg-white/20 text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 mt-3">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between bg-[#111827] p-2 rounded-lg border border-white/5"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {getIcon(res.type)}
                    <span className="text-xs font-medium text-slate-300 truncate">{res.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-400 hover:bg-red-500/20"
                    onClick={() => setResources(resources.filter((r) => r.id !== res.id))}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-300 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#EAB308] hover:bg-[#d97706] text-[#422006] font-bold"
          >
            Salvar Aula
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

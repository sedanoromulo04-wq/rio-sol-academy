import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import useAdminStore from '@/stores/useAdminStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save, Video, Image as ImageIcon } from 'lucide-react'

export default function AdminTrackEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { content, saveContent } = useAdminStore()
  const { toast } = useToast()

  const isNew = !id || id === 'new'
  const item = isNew ? null : content.find((c) => c.id === id)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    category: 'Técnico',
  })

  useEffect(() => {
    if (item) setFormData({ ...item })
  }, [item])

  const handleSave = () => {
    if (!formData.title.trim())
      return toast({ variant: 'destructive', title: 'Erro', description: 'Título é obrigatório.' })
    saveContent({ id: item?.id || crypto.randomUUID(), ...formData })
    toast({ title: 'Sucesso', description: 'Conteúdo salvo com sucesso!' })
    navigate('/admin/tracks')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up pb-20">
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
          {isNew ? 'Criar Novo Conteúdo' : `Editando: ${formData.title}`}
        </h1>
      </div>

      <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Título</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Introdução à Energia Solar"
              className="bg-[#1F2937] border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-[#1F2937] border-white/10 text-white min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Video className="w-4 h-4" /> URL do Vídeo
              </Label>
              <Input
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://youtube.com/..."
                className="bg-[#1F2937] border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> URL da Capa (Thumbnail)
              </Label>
              <Input
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                placeholder="https://..."
                className="bg-[#1F2937] border-white/10 text-white"
              />
            </div>
          </div>

          <div className="space-y-2 md:w-1/2">
            <Label className="text-slate-300">Categoria</Label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full h-10 bg-[#1F2937] border border-white/10 rounded-md text-sm px-3 text-white outline-none"
            >
              <option value="Cultura">Cultura</option>
              <option value="Técnico">Técnico</option>
              <option value="Psicologia">Psicologia</option>
              <option value="Prática">Prática</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-[#EAB308] hover:bg-[#d97706] text-[#061b3b] font-bold px-8"
          >
            <Save className="w-4 h-4 mr-2" /> Salvar Conteúdo
          </Button>
        </div>
      </div>
    </div>
  )
}

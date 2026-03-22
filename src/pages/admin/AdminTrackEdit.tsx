import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import useAdminStore from '@/stores/useAdminStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save } from 'lucide-react'
import { TrackDetailsForm } from '@/components/admin/TrackDetailsForm'
import { TrackContentManager } from '@/components/admin/TrackContentManager'

export default function AdminTrackEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tracks, addTrack, updateTrack, addModule, updateModule, deleteModule } = useAdminStore()
  const { toast } = useToast()

  const isNew = !id || id === 'new'
  const track = isNew ? null : tracks.find((t) => t.id === id)

  // Redirect if not found
  useEffect(() => {
    if (!isNew && !track) navigate('/admin/tracks')
  }, [isNew, track, navigate])

  const handleSaveDetails = (data: any) => {
    if (isNew) {
      const newId = `t-${Date.now()}`
      addTrack({ id: newId, ...data, modules: [] })
      toast({ title: 'Sucesso', description: 'Trilha criada com sucesso!' })
      navigate(`/admin/tracks/${newId}`)
    } else if (track) {
      updateTrack(track.id, data)
      toast({ title: 'Sucesso', description: 'Detalhes atualizados com sucesso!' })
    }
  }

  if (!isNew && !track) return null

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
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-display">
            {isNew ? 'Criar Nova Trilha' : `Editando: ${track.title}`}
          </h1>
        </div>
      </div>

      <div className="bg-[#111827] border border-white/10 rounded-2xl p-2 shadow-xl">
        <Tabs defaultValue="details" className="w-full">
          <div className="px-4 pt-4 border-b border-white/10">
            <TabsList className="bg-transparent space-x-6">
              <TabsTrigger
                value="details"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#EAB308] data-[state=active]:text-[#EAB308] text-slate-400 rounded-none pb-3 px-1"
              >
                Detalhes da Trilha
              </TabsTrigger>
              <TabsTrigger
                value="content"
                disabled={isNew}
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#EAB308] data-[state=active]:text-[#EAB308] text-slate-400 rounded-none pb-3 px-1 disabled:opacity-30"
              >
                Conteúdo & Módulos
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details" className="p-6">
            <TrackDetailsForm initialData={track || undefined} onSubmit={handleSaveDetails} />
          </TabsContent>

          <TabsContent value="content" className="p-6">
            {track && (
              <TrackContentManager
                track={track}
                onAddModule={(m) => addModule(track.id, m)}
                onUpdateModule={(mId, data) => updateModule(track.id, mId, data)}
                onDeleteModule={(mId) => deleteModule(track.id, mId)}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

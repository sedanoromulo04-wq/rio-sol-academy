import { useState } from 'react'
import { Track, Module, Lesson } from '@/stores/useAdminStore'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, GripVertical, Edit2, Trash2, PlayCircle } from 'lucide-react'
import { LessonEditorDialog } from './LessonEditorDialog'

interface Props {
  track: Track
  onAddModule: (module: Module) => void
  onUpdateModule: (moduleId: string, data: Partial<Module>) => void
  onDeleteModule: (moduleId: string) => void
}

export function TrackContentManager({ track, onAddModule, onUpdateModule, onDeleteModule }: Props) {
  const [newModTitle, setNewModTitle] = useState('')
  const [editingLesson, setEditingLesson] = useState<{
    moduleId: string
    lesson: Lesson | null
  } | null>(null)

  const handleAddModule = () => {
    if (newModTitle.trim()) {
      onAddModule({ id: `m-${Date.now()}`, title: newModTitle, lessons: [] })
      setNewModTitle('')
    }
  }

  const handleSaveLesson = (savedLesson: Lesson) => {
    if (!editingLesson) return
    const module = track.modules.find((m) => m.id === editingLesson.moduleId)
    if (!module) return

    let updatedLessons = [...module.lessons]
    if (editingLesson.lesson) {
      updatedLessons = updatedLessons.map((l) => (l.id === savedLesson.id ? savedLesson : l))
    } else {
      updatedLessons.push(savedLesson)
    }
    onUpdateModule(module.id, { lessons: updatedLessons })
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3 items-center bg-[#1F2937]/50 p-4 rounded-xl border border-white/5">
        <Input
          placeholder="Nome do novo módulo..."
          value={newModTitle}
          onChange={(e) => setNewModTitle(e.target.value)}
          className="bg-[#111827] border-white/10 text-white max-w-sm"
        />
        <Button
          onClick={handleAddModule}
          variant="secondary"
          className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
        >
          <Plus className="w-4 h-4 mr-2" /> Adicionar Módulo
        </Button>
      </div>

      <Accordion type="multiple" className="space-y-3">
        {track.modules.map((mod) => (
          <AccordionItem
            key={mod.id}
            value={mod.id}
            className="bg-[#1F2937] border border-white/10 rounded-xl px-2 overflow-hidden"
          >
            <div className="flex items-center">
              <GripVertical className="w-4 h-4 text-slate-500 cursor-move ml-2" />
              <AccordionTrigger className="hover:no-underline flex-1 px-3 py-4 text-slate-200 font-semibold data-[state=open]:text-[#EAB308]">
                {mod.title}
                <span className="ml-3 text-xs font-normal text-slate-500 bg-black/20 px-2 py-0.5 rounded-full">
                  {mod.lessons.length} Aulas
                </span>
              </AccordionTrigger>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteModule(mod.id)}
                className="mr-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-8 w-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <AccordionContent className="px-5 pb-5 pt-1 border-t border-white/5">
              <div className="space-y-2 mb-4">
                {mod.lessons.length === 0 && (
                  <p className="text-xs text-slate-500 italic py-2">Nenhuma aula neste módulo.</p>
                )}
                {mod.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between bg-[#111827] p-3 rounded-lg border border-white/5 group hover:border-[#EAB308]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <PlayCircle className="w-4 h-4 text-[#EAB308]" />
                      <span className="text-sm font-medium text-slate-300 group-hover:text-white">
                        {lesson.title}
                      </span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingLesson({ moduleId: mod.id, lesson })}
                        className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          onUpdateModule(mod.id, {
                            lessons: mod.lessons.filter((l) => l.id !== lesson.id),
                          })
                        }
                        className="h-7 w-7 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setEditingLesson({ moduleId: mod.id, lesson: null })}
                size="sm"
                variant="outline"
                className="bg-transparent border-dashed border-white/20 text-slate-300 hover:text-white hover:border-white/40 w-full"
              >
                <Plus className="w-4 h-4 mr-2" /> Adicionar Aula
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <LessonEditorDialog
        open={!!editingLesson}
        onOpenChange={(o) => !o && setEditingLesson(null)}
        lesson={editingLesson?.lesson}
        onSave={handleSaveLesson}
      />
    </div>
  )
}

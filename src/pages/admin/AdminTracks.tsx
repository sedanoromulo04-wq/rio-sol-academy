import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { formatMinutes, getEstimatedMinutes } from '@/lib/learning'
import useAdminStore from '@/stores/useAdminStore'
import { Edit, Eye, EyeOff, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'

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
  queued: 'Fila',
  processing: 'Processando',
  ready: 'Pronto',
  error: 'Erro',
}

export default function AdminTracks() {
  const { content, deleteContent, requestContentAutomation, togglePublished } = useAdminStore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredContent = useMemo(
    () =>
      content
        .filter((item) => {
          const haystack = `${item.title} ${item.category} ${item.youtube_video_id || ''}`.toLowerCase()
          return haystack.includes(search.toLowerCase())
        })
        .sort((a, b) => {
          if (a.category !== b.category) return a.category.localeCompare(b.category)
          if (a.position !== b.position) return a.position - b.position
          return a.title.localeCompare(b.title)
        }),
    [content, search],
  )

  const handleDelete = () => {
    if (!deleteId) return
    deleteContent(deleteId)
    toast({ title: 'Sucesso', description: 'Conteudo excluido com sucesso.' })
    setDeleteId(null)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-display">Gestao de Conteudo</h1>
          <p className="text-slate-400 mt-1">
            Administre trilhas, prova e a nova esteira tecnica de YouTube, transcricao e mapa mental.
          </p>
        </div>
        <Button asChild className="bg-[#EAB308] hover:bg-[#d97706] text-[#422006] font-bold">
          <Link to="/admin/tracks/new">
            <Plus className="mr-2 h-4 w-4" /> Novo Conteudo
          </Link>
        </Button>
      </div>

      <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3 mb-6 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Buscar titulo, trilha ou video ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#1F2937] border-white/5 text-white placeholder:text-slate-500 rounded-xl"
            />
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-white/5">
          <Table>
            <TableHeader className="bg-[#1F2937]">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-slate-400 font-bold h-12">Modulo</TableHead>
                <TableHead className="text-slate-400 font-bold">Visivel</TableHead>
                <TableHead className="text-slate-400 font-bold">Publico</TableHead>
                <TableHead className="text-slate-400 font-bold">Prova</TableHead>
                <TableHead className="text-slate-400 font-bold">Carga</TableHead>
                <TableHead className="text-slate-400 font-bold">Automacao</TableHead>
                <TableHead className="text-slate-400 font-bold text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    Nenhum conteudo encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredContent.map((item) => (
                  <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="font-medium text-white py-4">
                      <div className="flex items-center gap-3">
                        <img src={item.thumbnail_url} className="w-10 h-10 rounded-md object-cover" alt={item.title} />
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {item.category} • modulo {item.position} • {item.youtube_video_id || 'sem video ID'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => togglePublished(item.id)}
                        className="flex items-center gap-1.5 text-xs font-bold transition-colors"
                        title={item.is_published ? 'Clique para ocultar' : 'Clique para publicar'}
                      >
                        {item.is_published
                          ? <><Eye className="h-4 w-4 text-emerald-400" /><span className="text-emerald-400">Publicado</span></>
                          : <><EyeOff className="h-4 w-4 text-slate-500" /><span className="text-slate-500">Rascunho</span></>}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="text-slate-300 text-sm">
                        <div>{item.audience_scope === 'all' ? 'Geral' : 'Especifico'}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {item.audience_scope === 'all' ? 'Todos' : item.target_specialties.join(', ')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-slate-300 text-sm">
                        <div>{item.assessment_question_count} questoes</div>
                        <div className="text-xs text-slate-500 mt-1">Minimo {item.passing_score}%</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {formatMinutes(getEstimatedMinutes(item))}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Badge className="border-none bg-slate-800 text-slate-200">
                          {pipelineStatusLabel[item.automation_status]}
                        </Badge>
                        <div className="flex flex-wrap gap-1 text-[11px]">
                          <Badge variant="outline" className="border-white/10 text-slate-400">
                            T: {assetStatusLabel[item.transcript_status]}
                          </Badge>
                          <Badge variant="outline" className="border-white/10 text-slate-400">
                            R: {assetStatusLabel[item.summary_status]}
                          </Badge>
                          <Badge variant="outline" className="border-white/10 text-slate-400">
                            M: {assetStatusLabel[item.mind_map_status]}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            requestContentAutomation(item.id)
                            toast({
                              title: 'Fila acionada',
                              description: 'O conteudo foi marcado para processamento automatico.',
                            })
                          }}
                          disabled={!item.youtube_video_id}
                          className="h-8 w-8 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-400/10 disabled:text-slate-600"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                        >
                          <Link to={`/admin/tracks/${item.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(item.id)}
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#111827] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conteudo?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta acao nao pode ser desfeita. O material sera removido da biblioteca.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/20 text-slate-300 hover:bg-white/5 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

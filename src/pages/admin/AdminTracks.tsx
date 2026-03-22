import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAdminStore from '@/stores/useAdminStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Search, Plus, Edit, Trash2 } from 'lucide-react'

export default function AdminTracks() {
  const { tracks, deleteTrack } = useAdminStore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredTracks = tracks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))

  const handleDelete = () => {
    if (deleteId) {
      deleteTrack(deleteId)
      toast({ title: 'Sucesso', description: 'Trilha excluída com sucesso.' })
      setDeleteId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-display">Gestão de Trilhas</h1>
          <p className="text-slate-400 mt-1">Crie e edite os caminhos de conhecimento da equipe.</p>
        </div>
        <Button asChild className="bg-[#EAB308] hover:bg-[#d97706] text-[#422006] font-bold">
          <Link to="/admin/tracks/new">
            <Plus className="mr-2 h-4 w-4" /> Nova Trilha
          </Link>
        </Button>
      </div>

      <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3 mb-6 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Buscar trilha..."
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
                <TableHead className="text-slate-400 font-bold h-12">Nome da Trilha</TableHead>
                <TableHead className="text-slate-400 font-bold">Módulos</TableHead>
                <TableHead className="text-slate-400 font-bold">Status</TableHead>
                <TableHead className="text-slate-400 font-bold text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTracks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    Nenhuma trilha encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTracks.map((track) => (
                  <TableRow
                    key={track.id}
                    className="border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <TableCell className="font-medium text-white py-4">{track.title}</TableCell>
                    <TableCell className="text-slate-400">{track.modules.length}</TableCell>
                    <TableCell>
                      <Badge
                        variant={track.status === 'active' ? 'default' : 'secondary'}
                        className={
                          track.status === 'active'
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/20'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-700'
                        }
                      >
                        {track.status === 'active' ? 'Ativo' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                        >
                          <Link to={`/admin/tracks/${track.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(track.id)}
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

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#111827] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Trilha?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta ação não pode ser desfeita. Todos os módulos e aulas associados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/20 text-slate-300 hover:bg-white/5 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir Trilha
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

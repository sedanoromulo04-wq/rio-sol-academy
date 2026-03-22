import { useState, useMemo } from 'react'
import useAdminStore from '@/stores/useAdminStore'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Search,
  Users,
  Activity,
  Target,
  ArrowUpDown,
  ChevronRight,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminDashboard() {
  const { sellers, progress, tracks } = useAdminStore()
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<'name' | 'progress' | 'date'>('progress')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null)

  // Derived KPI calculations
  const kpis = useMemo(() => {
    const totalSellers = sellers.length
    const avgCompletion =
      totalSellers > 0
        ? Math.round(progress.reduce((acc, p) => acc + p.overallProgress, 0) / totalSellers)
        : 0

    // Find top performing track
    const trackPerformances: Record<string, { totalProgress: number; count: number }> = {}
    progress.forEach((p) => {
      p.tracks.forEach((tp) => {
        if (!trackPerformances[tp.trackId])
          trackPerformances[tp.trackId] = { totalProgress: 0, count: 0 }
        trackPerformances[tp.trackId].totalProgress += tp.progress
        trackPerformances[tp.trackId].count += 1
      })
    })

    let topTrackId = ''
    let maxAvg = -1
    Object.entries(trackPerformances).forEach(([tId, stats]) => {
      const avg = stats.totalProgress / stats.count
      if (avg > maxAvg) {
        maxAvg = avg
        topTrackId = tId
      }
    })
    const topTrack = tracks.find((t) => t.id === topTrackId)?.title || 'N/A'

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    let recentLessonsCount = 0
    progress.forEach((p) => {
      p.tracks.forEach((tp) => {
        if (new Date(tp.lastAccessed) > sevenDaysAgo && tp.completedModules.length > 0) {
          recentLessonsCount += tp.completedModules.length // Proxy for activity
        }
      })
    })

    return { totalSellers, avgCompletion, topTrack, recentLessonsCount }
  }, [sellers, progress, tracks])

  // Table Data Mapping & Sorting
  const mappedSellers = useMemo(() => {
    let result = sellers.map((s) => {
      const pData = progress.find((p) => p.sellerId === s.id)
      return {
        ...s,
        overallProgress: pData?.overallProgress || 0,
        lastActivity: pData?.lastActivity || null,
        tracks: pData?.tracks || [],
      }
    })

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
      )
    }

    result.sort((a, b) => {
      let comparison = 0
      if (sortField === 'name') comparison = a.name.localeCompare(b.name)
      if (sortField === 'progress') comparison = a.overallProgress - b.overallProgress
      if (sortField === 'date') {
        const dateA = a.lastActivity ? new Date(a.lastActivity).getTime() : 0
        const dateB = b.lastActivity ? new Date(b.lastActivity).getTime() : 0
        comparison = dateA - dateB
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [sellers, progress, search, sortField, sortDirection])

  const handleSort = (field: 'name' | 'progress' | 'date') => {
    if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const selectedSeller = mappedSellers.find((s) => s.id === selectedSellerId)

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-10">
      <div>
        <p className="text-[10px] font-bold text-[#EAB308] tracking-widest uppercase mb-1.5">
          Visão do CEO
        </p>
        <h1 className="text-3xl font-black text-white font-display">Performance Dashboard</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Monitore o engajamento e a evolução da sua equipe de vendas em tempo real.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total de Vendedores',
            value: kpis.totalSellers,
            icon: Users,
            color: 'text-blue-400',
          },
          {
            label: 'Taxa Média de Conclusão',
            value: `${kpis.avgCompletion}%`,
            icon: Target,
            color: 'text-[#EAB308]',
          },
          {
            label: 'Trilha Destaque',
            value: kpis.topTrack,
            icon: Activity,
            color: 'text-green-400',
          },
          {
            label: 'Módulos Concluídos (7 dias)',
            value: kpis.recentLessonsCount,
            icon: Clock,
            color: 'text-purple-400',
          },
        ].map((kpi, idx) => (
          <Card key={idx} className="bg-[#111827] border-white/10 shadow-lg">
            <CardContent className="p-5 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {kpi.label}
                </span>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <h3 className="text-2xl font-black text-white truncate" title={kpi.value.toString()}>
                {kpi.value}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sellers Table */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1F2937]/50">
          <h2 className="text-lg font-bold text-white font-display">Diretório de Vendedores</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#111827] border-white/10 text-white placeholder:text-slate-500 rounded-lg h-9 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#1F2937]">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-slate-400 font-bold h-12 w-[35%]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('name')}
                    className="hover:text-white px-0 hover:bg-transparent h-auto"
                  >
                    Arquiteto <ArrowUpDown className="ml-2 w-3.5 h-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="text-slate-400 font-bold w-[25%]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('progress')}
                    className="hover:text-white px-0 hover:bg-transparent h-auto"
                  >
                    Progresso Global <ArrowUpDown className="ml-2 w-3.5 h-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="text-slate-400 font-bold w-[25%]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('date')}
                    className="hover:text-white px-0 hover:bg-transparent h-auto"
                  >
                    Última Atividade <ArrowUpDown className="ml-2 w-3.5 h-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="text-slate-400 font-bold text-right w-[15%]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappedSellers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    Nenhum vendedor encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                mappedSellers.map((seller) => (
                  <TableRow
                    key={seller.id}
                    className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => setSelectedSellerId(seller.id)}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-white/10">
                          <AvatarImage src={seller.avatar} />
                          <AvatarFallback className="bg-slate-800 text-slate-300">
                            {seller.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-white text-sm">{seller.name}</p>
                          <p className="text-[11px] text-slate-500">{seller.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 max-w-[150px]">
                        <Progress
                          value={seller.overallProgress}
                          className="h-1.5 bg-slate-800 [&>div]:bg-[#EAB308] flex-1"
                        />
                        <span className="text-xs font-bold text-slate-300 w-8">
                          {seller.overallProgress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-400 font-medium">
                        {seller.lastActivity
                          ? new Date(seller.lastActivity).toLocaleDateString('pt-BR')
                          : 'Nunca acessou'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#EAB308] hover:text-[#d97706] hover:bg-[#EAB308]/10 text-xs font-bold"
                      >
                        Analisar <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Seller Detail Dialog */}
      <Dialog open={!!selectedSellerId} onOpenChange={(o) => !o && setSelectedSellerId(null)}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-2xl sm:max-w-3xl p-0 overflow-hidden flex flex-col max-h-[85vh]">
          {selectedSeller && (
            <>
              <DialogHeader className="p-6 pb-4 border-b border-white/10 bg-[#111827]">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-2 border-white/10 shadow-lg">
                    <AvatarImage src={selectedSeller.avatar} />
                    <AvatarFallback className="bg-slate-800 text-slate-300 text-xl">
                      {selectedSeller.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl font-black font-display tracking-tight text-white mb-1">
                      {selectedSeller.name}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-xs font-medium flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <span>{selectedSeller.email}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>
                        Progresso Global:{' '}
                        <span className="text-[#EAB308] font-bold">
                          {selectedSeller.overallProgress}%
                        </span>
                      </span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-6 overflow-y-auto space-y-6">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-white/5 pb-2">
                  Jornada de Treinamento
                </h3>

                {selectedSeller.tracks.length === 0 ? (
                  <div className="text-center py-10 bg-[#111827] rounded-xl border border-white/5">
                    <p className="text-slate-500 text-sm">
                      Este vendedor ainda não iniciou nenhuma trilha.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedSeller.tracks.map((tp) => {
                      const trackDef = tracks.find((t) => t.id === tp.trackId)
                      if (!trackDef) return null

                      return (
                        <div
                          key={tp.trackId}
                          className="bg-[#111827] border border-white/10 rounded-xl p-5 shadow-sm"
                        >
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                            <div>
                              <h4 className="text-base font-bold text-white mb-1">
                                {trackDef.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 font-medium">
                                Último acesso:{' '}
                                {new Date(tp.lastAccessed).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto">
                              <div className="flex flex-col items-end min-w-[120px]">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                  Progresso da Trilha
                                </span>
                                <div className="flex items-center gap-2 w-full">
                                  <Progress
                                    value={tp.progress}
                                    className="h-1.5 bg-slate-800 [&>div]:bg-[#EAB308] flex-1"
                                  />
                                  <span className="text-xs font-bold text-[#EAB308]">
                                    {tp.progress}%
                                  </span>
                                </div>
                              </div>
                              <div className="w-px h-8 bg-white/10 hidden md:block"></div>
                              <div className="text-center min-w-[60px]">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                                  Score IA
                                </span>
                                <Badge
                                  variant="outline"
                                  className={
                                    tp.assessmentScore && tp.assessmentScore >= 80
                                      ? 'border-green-500/30 text-green-400 bg-green-500/10'
                                      : tp.assessmentScore
                                        ? 'border-[#EAB308]/30 text-[#EAB308] bg-[#EAB308]/10'
                                        : 'border-slate-700 text-slate-500'
                                  }
                                >
                                  {tp.assessmentScore ? `${tp.assessmentScore}/100` : 'N/A'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/5">
                            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                              Status dos Módulos
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {trackDef.modules.map((m) => {
                                const isCompleted = tp.completedModules.includes(m.id)
                                return (
                                  <div key={m.id} className="flex items-start gap-2">
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                    ) : (
                                      <Clock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                                    )}
                                    <span
                                      className={`text-xs font-medium leading-snug ${isCompleted ? 'text-slate-300' : 'text-slate-600'}`}
                                    >
                                      {m.title}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

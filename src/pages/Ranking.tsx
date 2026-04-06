import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Award, Zap, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAdminStore from '@/stores/useAdminStore'
import useUserStore from '@/stores/useUserStore'

function BadgeItem({
  title,
  desc,
  icon: Icon,
  active = true,
}: {
  title: string
  desc: string
  icon: any
  active?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center p-5 rounded-2xl border border-slate-100 transition-all',
        active ? 'bg-white shadow-sm hover:shadow-md' : 'bg-slate-50 opacity-60',
      )}
    >
      <div
        className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-inner',
          active ? 'bg-[#EAB308] text-[#061B3B]' : 'bg-slate-200 text-slate-400',
        )}
      >
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="font-bold text-[11px] text-[#061B3B] text-center uppercase tracking-wider mb-1.5 leading-tight">
        {title}
      </h4>
      <p className="text-[10px] text-slate-400 text-center leading-tight">{desc}</p>
    </div>
  )
}

const levelNames = [
  'Iniciante',
  'Consultor Junior',
  'Consultor Pleno',
  'Consultor Senior',
  'Arquiteto Solar',
]

function getLevelName(xp: number) {
  const level = Math.floor(xp / 1000) + 1
  return levelNames[Math.min(level - 1, levelNames.length - 1)]
}

function getLevelNumber(xp: number) {
  return Math.floor(xp / 1000) + 1
}

function getProgressPercent(xp: number) {
  return Math.min(100, Math.floor(((xp % 1000) / 1000) * 100))
}

type RankedSeller = {
  id: string
  name: string
  avatar: string
  levelName: string
  level: number
  xp: number
  progressPercent: number
  overallProgress: number
}

export default function Ranking() {
  const { sellers, progress } = useAdminStore()
  const { profile } = useUserStore()

  const ranked = useMemo(() => {
    const progressById = new Map(progress.map((p) => [p.sellerId, p]))

    const list: RankedSeller[] = sellers.map((seller) => {
      const p = progressById.get(seller.id)
      const xp = p?.totalXp || 0
      return {
        id: seller.id,
        name: seller.name,
        avatar: seller.avatar,
        levelName: getLevelName(xp),
        level: getLevelNumber(xp),
        xp,
        progressPercent: getProgressPercent(xp),
        overallProgress: p?.overallProgress || 0,
      }
    })

    list.sort((a, b) => b.xp - a.xp)
    return list
  }, [sellers, progress])

  const myRank = useMemo(() => {
    if (!profile) return null
    const idx = ranked.findIndex((r) => r.id === profile.id)
    return idx >= 0 ? idx + 1 : null
  }, [ranked, profile])

  const podium = ranked.slice(0, 3)
  const tableRows = ranked.slice(3)

  return (
    <div className="max-w-[1100px] mx-auto space-y-12 animate-fade-in-up pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-lg">
          <p className="text-[10px] font-bold text-[#EAB308] tracking-widest uppercase mb-1.5">
            Ranking de Vendedores
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-[#061B3B] font-display tracking-tight mb-3">
            Ranking Global
          </h1>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            Acompanhe a evolucao de todos os vendedores da Rio Sol Academy. A classificacao e
            baseada no XP acumulado em trilhas, simulacoes e atividades.
          </p>
        </div>
      </div>

      {/* Podium */}
      {podium.length >= 3 ? (
        <div className="flex justify-center items-end gap-4 pt-8">
          {/* 2nd Place */}
          <div className="w-[220px] bg-slate-50 rounded-3xl p-6 pb-8 flex flex-col items-center border border-slate-200 relative mb-4">
            <span className="absolute top-4 right-6 text-4xl font-black text-slate-200 opacity-50">
              02
            </span>
            <Avatar className="w-20 h-20 border-[3px] border-white shadow-md mb-4 relative">
              <AvatarImage src={podium[1].avatar} />
              <AvatarFallback>{podium[1].name.substring(0, 2).toUpperCase()}</AvatarFallback>
              <div className="absolute -bottom-1.5 -right-1.5 bg-slate-300 text-white rounded-full p-1 border-[1.5px] border-white">
                <Award className="w-3.5 h-3.5" />
              </div>
            </Avatar>
            <h3 className="text-base font-bold text-[#061B3B] mb-1">{podium[1].name}</h3>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-5">
              {podium[1].levelName}
            </p>
            <div className="w-full flex justify-between text-[10px] font-bold text-[#061B3B] mb-2 px-1">
              <span>Nivel {podium[1].level}</span>
              <span>{podium[1].xp.toLocaleString('pt-BR')} XP</span>
            </div>
            <Progress value={podium[1].progressPercent} className="h-1 w-full bg-slate-200 [&>div]:bg-[#061B3B]" />
          </div>

          {/* 1st Place */}
          <div className="w-[260px] bg-[#061B3B] rounded-[2rem] p-8 pb-10 flex flex-col items-center border-2 border-[#EAB308] shadow-xl relative z-10">
            <span className="absolute top-6 right-8 text-5xl font-black text-white/5">01</span>
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-[#EAB308] blur-xl opacity-30 rounded-full"></div>
              <Avatar className="w-28 h-28 border-[3px] border-[#EAB308] shadow-lg relative z-10">
                <AvatarImage src={podium[0].avatar} />
                <AvatarFallback className="bg-[#EAB308] text-[#061B3B] text-2xl font-black">
                  {podium[0].name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-[#EAB308] text-[#061B3B] rounded-full p-1.5 border-[3px] border-[#061B3B] z-20">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-1.5 font-display">{podium[0].name}</h3>
            <p className="text-[10px] font-bold text-[#EAB308] uppercase tracking-widest mb-6 text-center leading-tight">
              {podium[0].levelName}
            </p>
            <div className="w-full flex justify-between text-[11px] font-bold text-white mb-2.5 px-1">
              <span>Nivel {podium[0].level}</span>
              <span className="text-[#EAB308]">{podium[0].xp.toLocaleString('pt-BR')} XP</span>
            </div>
            <Progress value={podium[0].progressPercent} className="h-1.5 w-full bg-white/10 [&>div]:bg-[#EAB308]" />
          </div>

          {/* 3rd Place */}
          <div className="w-[220px] bg-slate-50 rounded-3xl p-6 pb-8 flex flex-col items-center border border-slate-200 relative mb-4">
            <span className="absolute top-4 right-6 text-4xl font-black text-slate-200 opacity-50">
              03
            </span>
            <Avatar className="w-20 h-20 border-[3px] border-white shadow-md mb-4 relative">
              <AvatarImage src={podium[2].avatar} />
              <AvatarFallback>{podium[2].name.substring(0, 2).toUpperCase()}</AvatarFallback>
              <div className="absolute -bottom-1.5 -right-1.5 bg-[#d97706] text-white rounded-full p-1 border-[1.5px] border-white">
                <Award className="w-3.5 h-3.5" />
              </div>
            </Avatar>
            <h3 className="text-base font-bold text-[#061B3B] mb-1">{podium[2].name}</h3>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-5">
              {podium[2].levelName}
            </p>
            <div className="w-full flex justify-between text-[10px] font-bold text-[#061B3B] mb-2 px-1">
              <span>Nivel {podium[2].level}</span>
              <span>{podium[2].xp.toLocaleString('pt-BR')} XP</span>
            </div>
            <Progress value={podium[2].progressPercent} className="h-1 w-full bg-slate-200 [&>div]:bg-[#061B3B]" />
          </div>
        </div>
      ) : ranked.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          Nenhum vendedor cadastrado ainda.
        </div>
      ) : null}

      {/* Main Board */}
      {ranked.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-[#061B3B] font-display">Quadro Principal</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="text-[9px] font-bold text-slate-400 uppercase tracking-widest w-20 pl-6 h-10">
                    Posicao
                  </TableHead>
                  <TableHead className="text-[9px] font-bold text-slate-400 uppercase tracking-widest h-10">
                    Vendedor
                  </TableHead>
                  <TableHead className="text-[9px] font-bold text-slate-400 uppercase tracking-widest h-10">
                    Nivel
                  </TableHead>
                  <TableHead className="text-[9px] font-bold text-slate-400 uppercase tracking-widest h-10">
                    Energia XP
                  </TableHead>
                  <TableHead className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right pr-6 h-10">
                    Progresso
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranked.map((seller, idx) => {
                  const rank = idx + 1
                  const isMe = profile?.id === seller.id
                  return (
                    <TableRow
                      key={seller.id}
                      className={cn(
                        'border-b transition-colors',
                        isMe
                          ? 'bg-[#EAB308]/5 hover:bg-[#EAB308]/10 border-[#EAB308]/20'
                          : 'border-slate-100 hover:bg-slate-50',
                      )}
                    >
                      <TableCell className="pl-6 py-3">
                        <span className="text-sm font-black text-[#061B3B]">
                          {String(rank).padStart(2, '0')}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 rounded-lg shadow-sm border border-white">
                            <AvatarImage src={seller.avatar} />
                            <AvatarFallback className="text-[10px]">
                              {seller.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-[#061B3B] text-sm">
                              {seller.name}
                              {isMe && (
                                <span className="text-[#EAB308] ml-1">(Voce)</span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-500">{seller.levelName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          className={cn(
                            'font-bold uppercase tracking-widest text-[9px] px-2 py-0.5',
                            isMe
                              ? 'bg-[#EAB308] hover:bg-[#EAB308] text-[#422006] border-none shadow-sm'
                              : 'bg-transparent text-slate-500 border-slate-200',
                          )}
                        >
                          Nv {seller.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="font-bold text-sm text-[#061B3B]">
                          {seller.xp.toLocaleString('pt-BR')}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 py-3 text-right w-40">
                        <div className="flex justify-end mb-1.5">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            {seller.progressPercent}% p/ Nv {seller.level + 1}
                          </span>
                        </div>
                        <Progress
                          value={seller.progressPercent}
                          className={cn(
                            'h-1',
                            isMe
                              ? 'bg-slate-200 [&>div]:bg-[#EAB308]'
                              : 'bg-slate-100 [&>div]:bg-[#061B3B]',
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Badge Gallery */}
      <div>
        <div className="flex justify-between items-end mb-5">
          <div>
            <h2 className="text-2xl font-bold text-[#061B3B] font-display mb-1">
              Galeria de Medalhas
            </h2>
            <p className="text-slate-500 text-sm">
              Conquistas desbloqueadas conforme voce avanca na academia.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <BadgeItem
            title="Primeira Venda"
            desc="Fechou o primeiro contrato"
            icon={Zap}
            active={!!profile && (profile.xp_total || 0) > 0}
          />
          <BadgeItem
            title="Consultor Junior"
            desc="Atingiu nivel 2"
            icon={Award}
            active={!!profile && (profile.xp_total || 0) >= 1000}
          />
          <BadgeItem
            title="Consultor Pleno"
            desc="Atingiu nivel 3"
            icon={Zap}
            active={!!profile && (profile.xp_total || 0) >= 2000}
          />
          <BadgeItem
            title="Consultor Senior"
            desc="Atingiu nivel 4"
            icon={Award}
            active={!!profile && (profile.xp_total || 0) >= 3000}
          />
          <BadgeItem title="Arquiteto Solar" desc="Atingiu nivel 5" icon={Lock} active={!!profile && (profile.xp_total || 0) >= 4000} />
          <BadgeItem title="Lenda Solar" desc="Atingiu nivel 10" icon={Lock} active={!!profile && (profile.xp_total || 0) >= 9000} />
        </div>
      </div>
    </div>
  )
}

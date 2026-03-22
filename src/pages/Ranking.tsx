import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import { Search, Filter, Award, Zap, ChevronRight, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export default function Ranking() {
  return (
    <div className="max-w-[1100px] mx-auto space-y-12 animate-fade-in-up pb-16">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-lg">
          <p className="text-[10px] font-bold text-[#EAB308] tracking-widest uppercase mb-1.5">
            Excelência em Engenharia
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-[#061B3B] font-display tracking-tight mb-3">
            Ranking Global
          </h1>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            Medindo a energia cinética de nossos arquitetos em 14 setores globais. Eficiência é a
            única métrica que importa.
          </p>
        </div>
        <Tabs defaultValue="global" className="w-[280px]">
          <TabsList className="w-full bg-[#061B3B] p-1 rounded-xl h-10">
            <TabsTrigger
              value="global"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#061B3B] text-slate-300 font-bold text-xs"
            >
              Global
            </TabsTrigger>
            <TabsTrigger
              value="regional"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#061B3B] text-slate-300 font-bold text-xs"
            >
              Regional
            </TabsTrigger>
            <TabsTrigger
              value="squad"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#061B3B] text-slate-300 font-bold text-xs"
            >
              Esquadrão
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Podium */}
      <div className="flex justify-center items-end gap-4 pt-8">
        {/* 2nd Place */}
        <div className="w-[220px] bg-slate-50 rounded-3xl p-6 pb-8 flex flex-col items-center border border-slate-200 relative mb-4">
          <span className="absolute top-4 right-6 text-4xl font-black text-slate-200 opacity-50">
            02
          </span>
          <Avatar className="w-20 h-20 border-[3px] border-white shadow-md mb-4 relative">
            <AvatarImage src="https://img.usecurling.com/ppl/large?gender=female&seed=22" />
            <div className="absolute -bottom-1.5 -right-1.5 bg-slate-300 text-white rounded-full p-1 border-[1.5px] border-white">
              <Award className="w-3.5 h-3.5" />
            </div>
          </Avatar>
          <h3 className="text-base font-bold text-[#061B3B] mb-1">Elena Vance</h3>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-5">
            Especialista de Grid
          </p>
          <div className="w-full flex justify-between text-[10px] font-bold text-[#061B3B] mb-2 px-1">
            <span>Nível 42</span>
            <span>24.850 XP</span>
          </div>
          <Progress value={75} className="h-1 w-full bg-slate-200 [&>div]:bg-[#061B3B]" />
        </div>

        {/* 1st Place */}
        <div className="w-[260px] bg-[#061B3B] rounded-[2rem] p-8 pb-10 flex flex-col items-center border-2 border-[#EAB308] shadow-xl relative z-10">
          <span className="absolute top-6 right-8 text-5xl font-black text-white/5">01</span>
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-[#EAB308] blur-xl opacity-30 rounded-full"></div>
            <Avatar className="w-28 h-28 border-[3px] border-[#EAB308] shadow-lg relative z-10">
              <AvatarImage src="https://img.usecurling.com/p/200/200?q=gold%20medal&color=yellow" />
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-[#EAB308] text-[#061B3B] rounded-full p-1.5 border-[3px] border-[#061B3B] z-20">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-1.5 font-display">Marcus Thorne</h3>
          <p className="text-[10px] font-bold text-[#EAB308] uppercase tracking-widest mb-6 text-center leading-tight">
            Arquiteto
            <br />
            Principal
          </p>
          <div className="w-full flex justify-between text-[11px] font-bold text-white mb-2.5 px-1">
            <span>Nível 58</span>
            <span className="text-[#EAB308]">31.200 XP</span>
          </div>
          <Progress value={90} className="h-1.5 w-full bg-white/10 [&>div]:bg-[#EAB308]" />
        </div>

        {/* 3rd Place */}
        <div className="w-[220px] bg-slate-50 rounded-3xl p-6 pb-8 flex flex-col items-center border border-slate-200 relative mb-4">
          <span className="absolute top-4 right-6 text-4xl font-black text-slate-200 opacity-50">
            03
          </span>
          <Avatar className="w-20 h-20 border-[3px] border-white shadow-md mb-4 relative">
            <AvatarImage src="https://img.usecurling.com/ppl/large?gender=male&seed=33" />
            <div className="absolute -bottom-1.5 -right-1.5 bg-[#d97706] text-white rounded-full p-1 border-[1.5px] border-white">
              <Award className="w-3.5 h-3.5" />
            </div>
          </Avatar>
          <h3 className="text-base font-bold text-[#061B3B] mb-1">Sasha Chen</h3>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-5">
            Analista de Sistemas
          </p>
          <div className="w-full flex justify-between text-[10px] font-bold text-[#061B3B] mb-2 px-1">
            <span>Nível 39</span>
            <span>21.140 XP</span>
          </div>
          <Progress value={45} className="h-1 w-full bg-slate-200 [&>div]:bg-[#061B3B]" />
        </div>
      </div>

      {/* Main Board */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-[#061B3B] font-display">Quadro Principal</h2>
          <div className="flex gap-3">
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Buscar arquiteto..."
                className="pl-9 bg-white border-slate-200 rounded-lg h-9 text-xs shadow-sm"
              />
            </div>
            <Button
              variant="outline"
              className="h-9 px-4 rounded-lg border-slate-200 text-[#061B3B] font-semibold bg-white shadow-sm text-xs"
            >
              <Filter className="w-3.5 h-3.5 mr-1.5" /> Filtrar
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="text-[9px] font-bold text-slate-400 uppercase tracking-widest w-20 pl-6 h-10">
                  Posição
                </TableHead>
                <TableHead className="text-[9px] font-bold text-slate-400 uppercase tracking-widest h-10">
                  Arquiteto
                </TableHead>
                <TableHead className="text-[9px] font-bold text-slate-400 uppercase tracking-widest h-10">
                  Status
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
              {/* Highlighted Row (User) */}
              <TableRow className="bg-[#EAB308]/5 hover:bg-[#EAB308]/10 border-b border-[#EAB308]/20 transition-colors">
                <TableCell className="pl-6 py-3">
                  <span className="text-sm font-black text-[#061B3B]">14</span>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 rounded-lg shadow-sm border border-white">
                      <AvatarImage src="https://img.usecurling.com/p/100/100?q=landscape&color=blue" />
                    </Avatar>
                    <div>
                      <p className="font-bold text-[#061B3B] text-sm">Zenith (Você)</p>
                      <p className="text-[10px] text-slate-500">Divisão Global</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <Badge className="bg-[#EAB308] hover:bg-[#EAB308] text-[#422006] font-bold uppercase tracking-widest text-[9px] border-none px-2 py-0.5 shadow-sm">
                    <span className="w-1 h-1 rounded-full bg-[#422006] mr-1 animate-pulse"></span>{' '}
                    Subindo
                  </Badge>
                </TableCell>
                <TableCell className="py-3">
                  <span className="font-bold text-sm text-[#061B3B]">12.400</span>
                </TableCell>
                <TableCell className="pr-6 py-3 text-right w-40">
                  <div className="flex justify-end mb-1.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      82% p/ Nv 41
                    </span>
                  </div>
                  <Progress value={82} className="h-1 bg-slate-200 [&>div]:bg-[#EAB308]" />
                </TableCell>
              </TableRow>

              {/* Normal Rows */}
              {[
                {
                  rank: '04',
                  name: 'Julian Vesper',
                  div: 'Divisão Nórdica',
                  xp: '19.800',
                  prog: 45,
                  lvl: 40,
                  img: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=44',
                },
                {
                  rank: '05',
                  name: 'Lara Kross',
                  div: 'Divisão Pacífica',
                  xp: '18.250',
                  prog: 12,
                  lvl: 39,
                  img: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=55',
                },
              ].map((row, idx) => (
                <TableRow
                  key={idx}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <TableCell className="pl-6 py-3">
                    <span className="text-sm font-black text-[#061B3B]">{row.rank}</span>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 rounded-lg border border-slate-100">
                        <AvatarImage src={row.img} />
                      </Avatar>
                      <div>
                        <p className="font-bold text-[#061B3B] text-sm">{row.name}</p>
                        <p className="text-[10px] text-slate-500">{row.div}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="outline"
                      className="text-slate-500 border-slate-200 font-bold uppercase tracking-widest text-[9px] px-2 py-0.5"
                    >
                      Estável
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="font-bold text-sm text-[#061B3B]">{row.xp}</span>
                  </TableCell>
                  <TableCell className="pr-6 py-3 text-right w-40">
                    <div className="flex justify-end mb-1.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        {row.prog}% p/ Nv {row.lvl}
                      </span>
                    </div>
                    <Progress value={row.prog} className="h-1 bg-slate-100 [&>div]:bg-[#061B3B]" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-center">
            <Button
              variant="ghost"
              className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-[#061B3B] hover:bg-slate-200/50 h-8"
            >
              Carregar Mais Registros
            </Button>
          </div>
        </div>
      </div>

      {/* Badge Gallery */}
      <div>
        <div className="flex justify-between items-end mb-5">
          <div>
            <h2 className="text-2xl font-bold text-[#061B3B] font-display mb-1">
              Galeria de Medalhas
            </h2>
            <p className="text-slate-500 text-sm">
              Artefatos de distinção em engenharia e maestria teórica.
            </p>
          </div>
          <Button variant="link" className="text-[#061B3B] font-bold hidden md:flex text-xs">
            Ver Todas <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <BadgeItem title="Mestre de Grid" desc="Eficiência Perda Zero" icon={Zap} />
          <BadgeItem title="Estruturalista" desc="100 Auditorias de Fundação" icon={Award} />
          <BadgeItem title="Implantação Rápida" desc="Síntese Sub-10m" icon={Zap} />
          <BadgeItem title="Zenith Solar" desc="Atingiu Nível 50" icon={Award} />
          <BadgeItem title="Pioneiro da Fusão" desc="Confidencial" icon={Lock} active={false} />
          <BadgeItem title="Forja Estelar" desc="Confidencial" icon={Lock} active={false} />
        </div>
      </div>
    </div>
  )
}

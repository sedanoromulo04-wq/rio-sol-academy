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
        'flex flex-col items-center p-6 rounded-3xl border border-slate-100 transition-all',
        active ? 'bg-white shadow-sm hover:shadow-md' : 'bg-slate-50 opacity-60',
      )}
    >
      <div
        className={cn(
          'w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-inner',
          active ? 'bg-[#EAB308] text-[#061B3B]' : 'bg-slate-200 text-slate-400',
        )}
      >
        <Icon className="w-10 h-10" />
      </div>
      <h4 className="font-bold text-sm text-[#061B3B] text-center uppercase tracking-wider mb-2">
        {title}
      </h4>
      <p className="text-xs text-slate-400 text-center">{desc}</p>
    </div>
  )
}

export default function Ranking() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-16 animate-fade-in-up pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-xl">
          <p className="text-[10px] font-bold text-[#EAB308] tracking-widest uppercase mb-2">
            Excelência em Engenharia
          </p>
          <h1 className="text-5xl font-black text-[#061B3B] font-display tracking-tight mb-4">
            Ranking Global
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Medindo a energia cinética de nossos arquitetos em 14 setores globais. Eficiência é a
            única métrica que importa.
          </p>
        </div>
        <Tabs defaultValue="global" className="w-[300px]">
          <TabsList className="w-full bg-[#061B3B] p-1 rounded-2xl h-12">
            <TabsTrigger
              value="global"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#061B3B] text-slate-300 font-bold"
            >
              Global
            </TabsTrigger>
            <TabsTrigger
              value="regional"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#061B3B] text-slate-300 font-bold"
            >
              Regional
            </TabsTrigger>
            <TabsTrigger
              value="squad"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#061B3B] text-slate-300 font-bold"
            >
              Esquadrão
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Podium */}
      <div className="flex justify-center items-end gap-6 pt-10">
        {/* 2nd Place */}
        <div className="w-[300px] bg-slate-50 rounded-[2.5rem] p-8 pb-10 flex flex-col items-center border border-slate-200 relative mb-6">
          <span className="absolute top-6 right-8 text-5xl font-black text-slate-200 opacity-50">
            02
          </span>
          <Avatar className="w-28 h-28 border-4 border-white shadow-lg mb-6 relative">
            <AvatarImage src="https://img.usecurling.com/ppl/large?gender=female&seed=22" />
            <div className="absolute -bottom-2 -right-2 bg-slate-300 text-white rounded-full p-1.5 border-2 border-white">
              <Award className="w-4 h-4" />
            </div>
          </Avatar>
          <h3 className="text-xl font-bold text-[#061B3B] mb-1">Elena Vance</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">
            Especialista de Grid
          </p>
          <div className="w-full flex justify-between text-xs font-bold text-[#061B3B] mb-2 px-2">
            <span>Nível 42</span>
            <span>24.850 XP</span>
          </div>
          <Progress value={75} className="h-1.5 w-full bg-slate-200 [&>div]:bg-[#061B3B]" />
        </div>

        {/* 1st Place */}
        <div className="w-[340px] bg-[#061B3B] rounded-[3rem] p-10 pb-12 flex flex-col items-center border-2 border-[#EAB308] shadow-2xl relative z-10">
          <span className="absolute top-8 right-10 text-7xl font-black text-white/5">01</span>
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#EAB308] blur-xl opacity-30 rounded-full"></div>
            <Avatar className="w-36 h-36 border-[4px] border-[#EAB308] shadow-xl relative z-10">
              <AvatarImage src="https://img.usecurling.com/p/200/200?q=gold%20medal&color=yellow" />
            </Avatar>
            <div className="absolute -bottom-3 -right-3 bg-[#EAB308] text-[#061B3B] rounded-full p-2 border-4 border-[#061B3B] z-20">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2 font-display">Marcus Thorne</h3>
          <p className="text-xs font-bold text-[#EAB308] uppercase tracking-widest mb-10 text-center leading-relaxed">
            Arquiteto
            <br />
            Principal
          </p>
          <div className="w-full flex justify-between text-sm font-bold text-white mb-3 px-2">
            <span>Nível 58</span>
            <span className="text-[#EAB308]">31.200 XP</span>
          </div>
          <Progress value={90} className="h-2 w-full bg-white/10 [&>div]:bg-[#EAB308]" />
        </div>

        {/* 3rd Place */}
        <div className="w-[300px] bg-slate-50 rounded-[2.5rem] p-8 pb-10 flex flex-col items-center border border-slate-200 relative mb-6">
          <span className="absolute top-6 right-8 text-5xl font-black text-slate-200 opacity-50">
            03
          </span>
          <Avatar className="w-28 h-28 border-4 border-white shadow-lg mb-6 relative">
            <AvatarImage src="https://img.usecurling.com/ppl/large?gender=male&seed=33" />
            <div className="absolute -bottom-2 -right-2 bg-[#d97706] text-white rounded-full p-1.5 border-2 border-white">
              <Award className="w-4 h-4" />
            </div>
          </Avatar>
          <h3 className="text-xl font-bold text-[#061B3B] mb-1">Sasha Chen</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">
            Analista de Sistemas
          </p>
          <div className="w-full flex justify-between text-xs font-bold text-[#061B3B] mb-2 px-2">
            <span>Nível 39</span>
            <span>21.140 XP</span>
          </div>
          <Progress value={45} className="h-1.5 w-full bg-slate-200 [&>div]:bg-[#061B3B]" />
        </div>
      </div>

      {/* Main Board */}
      <div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#061B3B] font-display">Quadro Principal</h2>
          <div className="flex gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar arquiteto..."
                className="pl-10 bg-slate-50 border-none rounded-xl h-12 text-sm"
              />
            </div>
            <Button
              variant="outline"
              className="h-12 px-6 rounded-xl border-slate-200 text-[#061B3B] font-semibold bg-white shadow-sm"
            >
              <Filter className="w-4 h-4 mr-2" /> Filtrar
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-24 pl-8 h-14">
                  Posição
                </TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest h-14">
                  Arquiteto
                </TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest h-14">
                  Status
                </TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest h-14">
                  Energia XP
                </TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-8 h-14">
                  Progresso
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Highlighted Row (User) */}
              <TableRow className="bg-[#EAB308]/5 hover:bg-[#EAB308]/10 border-b border-[#EAB308]/20 transition-colors">
                <TableCell className="pl-8 py-5">
                  <span className="text-lg font-black text-[#061B3B]">14</span>
                </TableCell>
                <TableCell className="py-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 rounded-xl shadow-sm border border-white">
                      <AvatarImage src="https://img.usecurling.com/p/100/100?q=landscape&color=blue" />
                    </Avatar>
                    <div>
                      <p className="font-bold text-[#061B3B] text-base">Zenith (Você)</p>
                      <p className="text-xs text-slate-500">Divisão Global</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-5">
                  <Badge className="bg-[#EAB308] hover:bg-[#EAB308] text-[#422006] font-bold uppercase tracking-widest text-[10px] border-none px-3 py-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#422006] mr-1.5 animate-pulse"></span>{' '}
                    Subindo
                  </Badge>
                </TableCell>
                <TableCell className="py-5">
                  <span className="font-bold text-lg text-[#061B3B]">12.400</span>
                </TableCell>
                <TableCell className="pr-8 py-5 text-right w-48">
                  <div className="flex justify-end mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      82% para Nível 41
                    </span>
                  </div>
                  <Progress value={82} className="h-1.5 bg-slate-200 [&>div]:bg-[#EAB308]" />
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
                  <TableCell className="pl-8 py-5">
                    <span className="text-lg font-black text-[#061B3B]">{row.rank}</span>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 rounded-xl border border-slate-100">
                        <AvatarImage src={row.img} />
                      </Avatar>
                      <div>
                        <p className="font-bold text-[#061B3B] text-base">{row.name}</p>
                        <p className="text-xs text-slate-500">{row.div}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <Badge
                      variant="outline"
                      className="text-slate-500 border-slate-200 font-bold uppercase tracking-widest text-[10px] px-3 py-1"
                    >
                      Estável
                    </Badge>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="font-bold text-lg text-[#061B3B]">{row.xp}</span>
                  </TableCell>
                  <TableCell className="pr-8 py-5 text-right w-48">
                    <div className="flex justify-end mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {row.prog}% para Nível {row.lvl}
                      </span>
                    </div>
                    <Progress
                      value={row.prog}
                      className="h-1.5 bg-slate-100 [&>div]:bg-[#061B3B]"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-center">
            <Button
              variant="ghost"
              className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-[#061B3B] hover:bg-slate-200/50"
            >
              Carregar Mais Registros
            </Button>
          </div>
        </div>
      </div>

      {/* Badge Gallery */}
      <div>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#061B3B] font-display mb-1">
              Galeria de Medalhas
            </h2>
            <p className="text-slate-500">
              Artefatos de distinção em engenharia e maestria teórica.
            </p>
          </div>
          <Button variant="link" className="text-[#061B3B] font-bold hidden md:flex">
            Ver Todas as Conquistas <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
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

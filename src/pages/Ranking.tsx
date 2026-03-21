import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Crown } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const topRank = [
  {
    id: 1,
    name: 'Maria Costa',
    level: 'Mestre Solar',
    xp: 12450,
    img: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1',
  },
  {
    id: 2,
    name: 'João Silva',
    level: 'Consultor Pleno',
    xp: 10200,
    img: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
  },
  {
    id: 3,
    name: 'Carlos Mendes',
    level: 'Especialista',
    xp: 9800,
    img: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=3',
  },
]

const others = [
  {
    id: 4,
    name: 'Ana Oliveira',
    level: 'Consultor Pleno',
    xp: 8500,
    img: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=4',
  },
  {
    id: 5,
    name: 'Roberto Santos',
    level: 'Consultor Júnior',
    xp: 7200,
    img: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=5',
  },
  {
    id: 6,
    name: 'Luciana Lima',
    level: 'Consultor Júnior',
    xp: 6100,
    img: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=6',
  },
]

export default function Ranking() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in-up pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3">
            <Trophy className="w-8 h-8 text-primary" /> Ranking Global
          </h1>
          <p className="text-muted-foreground">Os melhores consultores da RIO SOL Academy.</p>
        </div>
        <Tabs defaultValue="month" className="w-[300px]">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900 border border-white/5">
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mês</TabsTrigger>
            <TabsTrigger value="all">Sempre</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Podium */}
      <div className="flex justify-center items-end h-[300px] gap-2 sm:gap-6 mt-12 mb-8 px-4">
        {/* 2nd Place */}
        <div
          className="flex flex-col items-center w-1/3 max-w-[140px] animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.2)] mb-4 relative z-10">
            <AvatarImage src={topRank[1].img} />
            <AvatarFallback>JS</AvatarFallback>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-800 text-xs font-bold px-2 py-0.5 rounded-full border-2 border-slate-900">
              2º
            </div>
          </Avatar>
          <div className="bg-gradient-to-t from-slate-800/80 to-slate-800/40 w-full h-[120px] rounded-t-xl border border-white/5 border-b-0 flex flex-col items-center pt-6 px-2 text-center">
            <span className="font-bold text-white truncate w-full text-sm sm:text-base">
              {topRank[1].name}
            </span>
            <span className="text-xs text-primary font-medium mt-1">{topRank[1].xp} XP</span>
          </div>
        </div>

        {/* 1st Place */}
        <div className="flex flex-col items-center w-1/3 max-w-[160px] animate-slide-up">
          <Avatar className="w-20 h-20 sm:w-28 sm:h-28 border-4 border-primary shadow-[0_0_30px_rgba(251,191,36,0.3)] mb-4 relative z-10">
            <AvatarImage src={topRank[0].img} />
            <AvatarFallback>MC</AvatarFallback>
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-primary drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              <Crown className="w-10 h-10" fill="currentColor" />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full border-2 border-slate-900">
              1º
            </div>
          </Avatar>
          <div className="bg-gradient-to-t from-primary/20 to-primary/5 w-full h-[160px] rounded-t-xl border border-primary/20 border-b-0 flex flex-col items-center pt-8 px-2 text-center">
            <span className="font-bold text-white truncate w-full text-sm sm:text-lg">
              {topRank[0].name}
            </span>
            <span className="text-xs text-primary font-bold mt-1">{topRank[0].xp} XP</span>
          </div>
        </div>

        {/* 3rd Place */}
        <div
          className="flex flex-col items-center w-1/3 max-w-[140px] animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-amber-600 shadow-[0_0_20px_rgba(217,119,6,0.2)] mb-4 relative z-10">
            <AvatarImage src={topRank[2].img} />
            <AvatarFallback>CM</AvatarFallback>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-slate-900">
              3º
            </div>
          </Avatar>
          <div className="bg-gradient-to-t from-slate-800/80 to-slate-800/40 w-full h-[90px] rounded-t-xl border border-white/5 border-b-0 flex flex-col items-center pt-4 px-2 text-center">
            <span className="font-bold text-white truncate w-full text-sm sm:text-base">
              {topRank[2].name}
            </span>
            <span className="text-xs text-primary font-medium mt-1">{topRank[2].xp} XP</span>
          </div>
        </div>
      </div>

      {/* List for 4th onwards */}
      <Card className="glass-panel border-white/5 overflow-hidden">
        <CardContent className="p-0 divide-y divide-white/5">
          {others.map((user, idx) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 sm:p-6 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="font-display font-bold text-slate-500 w-6 text-center">
                  {user.id}
                </span>
                <Avatar className="w-10 h-10 border border-white/10">
                  <AvatarImage src={user.img} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-white">{user.name}</h4>
                  <p className="text-xs text-muted-foreground">{user.level}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                  {user.xp} XP
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

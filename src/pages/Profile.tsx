import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Medal, Star, Shield, Zap, Target, Flame } from 'lucide-react'

const achievements = [
  {
    id: 1,
    name: 'Primeira Venda',
    desc: 'Fechou o primeiro contrato solar.',
    icon: Star,
    unlocked: true,
  },
  {
    id: 2,
    name: 'Fechador Nato',
    desc: 'Taxa de conversão > 20% no mês.',
    icon: Flame,
    unlocked: true,
  },
  {
    id: 3,
    name: 'Mestre do ROI',
    desc: 'Gabaritou o simulador financeiro.',
    icon: Target,
    unlocked: true,
  },
  {
    id: 4,
    name: 'Defensor da Marca',
    desc: 'Completou a trilha de cultura RIO SOL.',
    icon: Shield,
    unlocked: false,
  },
  {
    id: 5,
    name: 'Energia Rápida',
    desc: 'Respondeu 10 leads em < 5min.',
    icon: Zap,
    unlocked: false,
  },
  {
    id: 6,
    name: 'Veterano',
    desc: 'Alcançou o nível Consultor Sênior.',
    icon: Medal,
    unlocked: false,
  },
]

export default function Profile() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up pb-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* User Stats Card */}
        <Card className="glass-panel border-white/5 md:w-1/3 h-fit relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />
          <CardContent className="pt-10 flex flex-col items-center text-center">
            <Avatar className="w-28 h-28 border-4 border-slate-900 shadow-xl mb-4 relative">
              <AvatarImage src="https://img.usecurling.com/ppl/medium?gender=male&seed=1" />
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-white font-display">João Silva</h2>
            <p className="text-muted-foreground mb-4 text-sm">Na RIO SOL há 8 meses</p>

            <Badge className="bg-primary text-primary-foreground hover:bg-primary px-4 py-1 text-sm mb-6">
              Consultor Pleno
            </Badge>

            <div className="w-full space-y-2 text-left mb-6 bg-slate-900/50 p-4 rounded-xl border border-white/5">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-300">Progresso de Nível</span>
                <span className="text-primary">4.500 / 5.000 XP</span>
              </div>
              <Progress value={90} className="h-2 bg-slate-800" />
              <p className="text-xs text-muted-foreground text-center pt-2">
                Faltam 500 XP para Consultor Sênior
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
                <div className="text-2xl font-bold text-white">24</div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Aulas Feitas</div>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
                <div className="text-2xl font-bold text-primary">8.2</div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Média IA</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements Gallery */}
        <div className="flex-1 space-y-6">
          <Card className="glass-panel border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Trophy className="w-5 h-5 text-primary" /> Galeria de Conquistas
              </CardTitle>
              <CardDescription>
                Ganhe medalhas completando trilhas, atingindo metas e superando desafios no
                simulador.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`p-4 rounded-xl border transition-all ${ach.unlocked ? 'bg-primary/5 border-primary/20 hover:border-primary/50' : 'bg-slate-900/30 border-white/5 grayscale opacity-50'}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${ach.unlocked ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-500'}`}
                    >
                      <ach.icon className="w-6 h-6" />
                    </div>
                    <h4
                      className={`font-semibold text-sm ${ach.unlocked ? 'text-white' : 'text-slate-400'}`}
                    >
                      {ach.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{ach.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/5">
            <CardHeader>
              <CardTitle className="text-lg">Hierarquia de Níveis RIO SOL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Iniciante', xp: '0 XP', desc: 'Acesso às trilhas básicas.' },
                {
                  name: 'Consultor Júnior',
                  xp: '1.000 XP',
                  desc: 'Acesso ao simulador de roleplay.',
                },
                {
                  name: 'Consultor Pleno',
                  xp: '3.000 XP',
                  desc: 'Desbloqueia materiais avançados.',
                  current: true,
                },
                { name: 'Consultor Sênior', xp: '5.000 XP', desc: 'Acesso a leads qualificados.' },
                {
                  name: 'Arquiteto Solar',
                  xp: '10.000 XP',
                  desc: 'Leads VIP e bônus de performance.',
                },
              ].map((lvl, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${lvl.current ? 'bg-primary/10 border-primary/30' : 'bg-transparent border-white/5'}`}
                >
                  <div className="w-16 text-right text-xs font-medium text-slate-400">{lvl.xp}</div>
                  <div className="flex-1">
                    <h5
                      className={`font-semibold ${lvl.current ? 'text-primary' : 'text-slate-300'}`}
                    >
                      {lvl.name}
                    </h5>
                    <p className="text-xs text-slate-500">{lvl.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

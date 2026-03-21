import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, TrendingUp, Award, Flame, Zap } from 'lucide-react'

const recentBadges = [
  { id: 1, name: 'Fechador Nato', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  {
    id: 2,
    name: 'Mestre do ROI',
    icon: TrendingUp,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  { id: 3, name: 'Energia Rápida', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
]

export default function Index() {
  const navigate = useNavigate()

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      {/* Hero Welcome */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 p-8 sm:p-10">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
          <Award className="w-64 h-64 text-primary" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <Badge
            className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 border-none cursor-pointer"
            onClick={() => navigate('/perfil')}
          >
            Nível 12 • Consultor Pleno
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-white mb-4">
            Olá, João! Pronto para <span className="text-primary">elevar sua energia?</span>
          </h1>
          <p className="text-slate-300 text-lg mb-8">
            Faltam apenas 500 XP para você alcançar o nível "Arquiteto Solar" e desbloquear leads
            premium no CRM.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-primary">4.500 XP</span>
              <span className="text-slate-400">5.000 XP</span>
            </div>
            <Progress value={90} className="h-3 bg-slate-800" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <Card className="md:col-span-2 glass-panel border-white/5 hover:border-primary/30 transition-colors group">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" /> Continue de onde parou
            </CardTitle>
            <CardDescription>Trilha: Técnico Solar Avançado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <Link
                to="/trilhas/tecnico/lesson/3"
                className="relative w-full sm:w-48 aspect-video rounded-lg overflow-hidden group-hover:shadow-lg transition-all block shrink-0"
              >
                <img
                  src="https://img.usecurling.com/p/400/225?q=solar%20panels&color=blue"
                  alt="Thumbnail"
                  className="object-cover w-full h-full opacity-80"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                  <Play className="w-10 h-10 text-white opacity-90" fill="currentColor" />
                </div>
              </Link>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Módulo 3: Objeções de Preço</h3>
                  <p className="text-sm text-muted-foreground">
                    Aprenda a contornar as principais objeções usando cálculo de ROI a longo prazo.
                  </p>
                </div>
                <Button asChild className="w-full sm:w-auto font-medium">
                  <Link to="/trilhas/tecnico/lesson/3">Continuar Aula</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Goal Tracker */}
        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Meta da Semana</CardTitle>
            <CardDescription>Aulas concluídas vs Meta</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="relative w-32 h-32 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="text-secondary animate-pulse-slow"
                  strokeDasharray="75, 100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              </svg>
              <div className="absolute text-3xl font-bold text-white">3/4</div>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Você está quase lá! Faltam apenas 1 aula para atingir sua meta.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Badges Highlight */}
      <div>
        <h2 className="text-xl font-display font-semibold mb-4">Últimas Conquistas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recentBadges.map((badge) => (
            <Card
              key={badge.id}
              onClick={() => navigate('/perfil')}
              className="glass-panel border-white/5 hover:scale-[1.02] transition-transform cursor-pointer"
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-4 rounded-full ${badge.bg}`}>
                  <badge.icon className={`w-8 h-8 ${badge.color}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">Ganha há 2 dias</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

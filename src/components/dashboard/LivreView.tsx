import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAdminStore from '@/stores/useAdminStore'
import useUserStore from '@/stores/useUserStore'
import { getUnlockedAchievements } from '@/lib/gamification'
import { FALLBACK_TRAILS } from '@/lib/constants'

const CircularProgress = ({ value, label }: { value: number; label: string }) => {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="transform -rotate-90 w-12 h-12">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-slate-100"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-[#061B3B] transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-xs font-bold text-[#061B3B]">{value}%</span>
    </div>
  )
}

export default function LivreView() {
  const { content } = useAdminStore()
  const { profile, learningProgress } = useUserStore()

  const evaluatedAchievements = getUnlockedAchievements(profile, learningProgress || [])
  const unlockedCount = evaluatedAchievements.filter(a => a.unlocked).length
  const totalAchievements = evaluatedAchievements.length

  const groupedTrails =
    content.length > 0
      ? Array.from(
          content.reduce((map, item) => {
            const key = item.category || 'Geral'
            const current = map.get(key) || {
              title: key,
              desc: item.description || 'Explore os materiais desta trilha.',
              modules: 0,
              progress: 18,
              tag: '',
            }

            current.modules += 1
            if (!current.desc && item.description) current.desc = item.description
            map.set(key, current)
            return map
          }, new Map<string, { title: string; desc: string; modules: number; progress: number; tag: string }>()),
        )
          .map(([, trail], index) => ({
            ...trail,
            modules: `${trail.modules} módulo${trail.modules > 1 ? 's' : ''}`,
            progress: Math.min(96, 22 + index * 18),
          }))
          .slice(0, 4)
      : FALLBACK_TRAILS

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden h-[300px] shadow-sm border border-slate-200 group">
        <img
          src="https://img.usecurling.com/p/1200/600?q=modern%20solar%20building&color=gray"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061B3B]/95 via-[#061B3B]/80 to-transparent" />
        <div className="relative z-10 p-8 flex flex-col h-full justify-between">
          <Badge className="w-fit bg-[#EAB308] text-[#422006] hover:bg-[#EAB308] font-bold text-[9px] tracking-widest uppercase border-none px-2.5 py-1">
            Missão Atual: Tier 4
          </Badge>
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 font-display leading-tight">
              Fase de Maestria
              <br />
              em Integração de Grid
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
              Execute os protocolos avançados de sincronização para o Hub PV Atacama. Esta simulação
              exige 99,8% de estabilidade.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button
              className="bg-[#EAB308] hover:bg-[#d97706] text-[#422006] font-bold h-10 px-5 rounded-lg border-none shadow-sm text-sm"
              asChild
            >
              <Link to="/simulador">Iniciar Simulação</Link>
            </Button>
            <Button
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white font-medium h-10 px-5 rounded-lg backdrop-blur-sm text-sm"
              asChild
            >
              <Link to="/trilhas">Resumo da Missão</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Knowledge Trails */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#061B3B] font-display">Painel de Conteúdos</h3>
            <p className="text-sm text-slate-500">
              Explore o acervo completo no seu próprio ritmo.
            </p>
          </div>
          <Link
            to="/trilhas"
            className="text-sm font-semibold text-[#061B3B] hover:text-[#EAB308] transition-colors"
          >
            Ver Todas
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groupedTrails.map((trail, idx) => (
            <Link
              key={`${trail.title}-${idx}`}
              to={`/trilhas?category=${encodeURIComponent(trail.title)}`}
              className="block"
            >
              <Card className="border-none shadow-sm rounded-2xl bg-white hover:shadow-md hover:-translate-y-0.5 transition-all">
                <CardContent className="p-5 flex items-center gap-5">
                  <CircularProgress value={trail.progress} label={trail.title} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base text-[#061B3B]">{trail.title}</h4>
                    <p className="text-xs text-slate-500 mb-2 truncate">{trail.desc}</p>
                    <span
                      className={cn(
                        'text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-500 inline-block',
                        trail.tag,
                      )}
                    >
                      {trail.modules}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Achievement Vault */}
      <Card className="border-none shadow-sm rounded-2xl bg-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#061B3B] font-display flex items-center gap-2">
              <Target className="w-4 h-4 text-[#EAB308]" /> Cofre de Conquistas
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {unlockedCount}/{totalAchievements} Desbloqueadas
            </span>
          </div>
          <div className="flex flex-wrap gap-5">
            {evaluatedAchievements.map((ach, idx) => (
              <div key={idx} className={cn("flex flex-col items-center gap-2 w-20 transition-all", !ach.unlocked && "opacity-40 grayscale")}>
                <div
                  className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner',
                    ach.bg,
                    ach.color,
                  )}
                >
                  <ach.icon className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center leading-tight">
                  {ach.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

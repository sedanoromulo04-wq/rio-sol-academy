import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Flame, AlertTriangle, Snowflake, Check, PlaySquare, BookOpen, Swords } from 'lucide-react'
import { cn } from '@/lib/utils'
import useUserStore from '@/stores/useUserStore'

export default function StreakView() {
  const { profile, logActivity } = useUserStore()

  const [missions, setMissions] = useState([
    {
      id: 1,
      type: 'Aulas',
      title: 'Pílula de Conhecimento: Retorno de Investimento',
      duration: '5 min',
      icon: PlaySquare,
      completed: true,
      xp: 50,
      activityType: 'lesson',
    },
    {
      id: 2,
      type: 'Leitura',
      title: 'Estudo de Caso: Fazenda Solar Atacama',
      duration: '10 min',
      icon: BookOpen,
      completed: false,
      xp: 50,
      activityType: 'reading',
    },
    {
      id: 3,
      type: 'Exercícios',
      title: 'Simulador de Objeções: Descapitalização',
      duration: '15 min',
      icon: Swords,
      completed: false,
      xp: 100,
      activityType: 'roleplay',
    },
  ])

  const toggleMission = (id: number) => {
    const mission = missions.find((m) => m.id === id)
    if (!mission || mission.completed) return

    setMissions(missions.map((m) => (m.id === id ? { ...m, completed: true } : m)))
    logActivity(mission.activityType, mission.xp)
  }

  const completedCount = missions.filter((m) => m.completed).length
  const progressPercent = Math.round((completedCount / missions.length) * 100)

  if (!profile) return null

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200 group bg-[#061B3B]">
        <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/1200/600?q=solar%20flare&color=orange')] opacity-20 object-cover mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061B3B] via-[#061B3B]/90 to-transparent" />

        <div className="relative z-10 p-6 md:p-8 flex flex-col justify-between h-full min-h-[300px]">
          <div className="flex flex-wrap justify-between items-start gap-3">
            <Badge className="bg-red-500/20 text-red-400 border-none font-bold text-[10px] tracking-widest uppercase flex items-center gap-1.5 px-3 py-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Risco de perder ofensiva em 04h 23m
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-none font-bold text-[10px] tracking-widest uppercase flex items-center gap-1.5 px-3 py-1">
              <Snowflake className="w-3.5 h-3.5" />
              Congelamento Ativo
            </Badge>
          </div>

          <div className="mt-8 flex items-center gap-5 md:gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#EAB308] to-orange-600 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)] shrink-0">
              <Flame className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white font-display tracking-tight leading-none">
                {profile.current_streak || 0} Dias
              </h2>
              <p className="text-[#EAB308] font-bold text-xs md:text-sm uppercase tracking-widest mt-2">
                Ofensiva RIO SOL
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-2.5 max-w-xl">
            <div className="flex justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
              <span>Progresso da Missão Diária</span>
              <span className="text-[#EAB308]">{completedCount}/3 Missões Completadas</span>
            </div>
            <Progress
              value={progressPercent}
              className="h-2.5 bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-[#EAB308] [&>div]:to-orange-500"
            />
            {progressPercent === 100 && (
              <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mt-2 animate-fade-in-up">
                Você ganhou XP e manteve sua ofensiva!
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#061B3B] font-display">Protocolo Diário</h3>
            <p className="text-sm text-slate-500">
              Sua curadoria de treino focada em objeções e rentabilidade.
            </p>
          </div>
        </div>

        {missions.map((mission) => (
          <Card
            key={mission.id}
            className={cn(
              'border-slate-200 shadow-sm rounded-2xl transition-all',
              mission.completed ? 'bg-slate-50/70' : 'bg-white hover:shadow-md',
            )}
          >
            <CardContent className="p-4 md:p-5 flex items-center gap-4">
              <button
                onClick={() => toggleMission(mission.id)}
                className={cn(
                  'w-7 h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                  mission.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-slate-300 text-transparent hover:border-[#EAB308]',
                )}
              >
                <Check className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <div
                className={cn(
                  'w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                  mission.completed
                    ? 'bg-slate-200 text-slate-500'
                    : 'bg-[#EAB308]/10 text-[#d97706]',
                )}
              >
                <mission.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      'text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded',
                      mission.completed
                        ? 'bg-slate-200 text-slate-500'
                        : 'bg-[#061B3B] text-[#EAB308]',
                    )}
                  >
                    {mission.type}
                  </span>
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {mission.duration}
                  </span>
                </div>
                <h4
                  className={cn(
                    'font-bold text-sm leading-tight truncate md:whitespace-normal',
                    mission.completed ? 'text-slate-500 line-through' : 'text-[#061B3B]',
                  )}
                >
                  {mission.title}
                </h4>
              </div>
              <div className="shrink-0 text-right hidden sm:block">
                <div
                  className={cn(
                    'text-sm font-bold',
                    mission.completed ? 'text-slate-400' : 'text-[#061B3B]',
                  )}
                >
                  +{mission.xp}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  XP
                </div>
              </div>
              <Button
                size="sm"
                variant={mission.completed ? 'outline' : 'default'}
                className={cn(
                  'ml-0 md:ml-2 shrink-0 h-8 text-xs',
                  !mission.completed && 'bg-[#061B3B] hover:bg-[#0a2955] text-white',
                )}
                asChild
              >
                <Link to={mission.type === 'Exercícios' ? '/simulador' : '/trilhas'}>
                  {mission.completed ? 'Revisar' : 'Iniciar'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

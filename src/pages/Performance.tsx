import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Flame, Zap, PlaySquare, BookOpen, MessageSquare, Swords, Target } from 'lucide-react'
import useUserStore from '@/stores/useUserStore'

export default function Performance() {
  const [activeTab, setActiveTab] = useState('overview')
  const { profile, activities } = useUserStore()

  if (!profile) return null

  const getIconForType = (type: string) => {
    if (type === 'roleplay') return <Swords className="w-5 h-5" />
    if (type === 'reading') return <BookOpen className="w-5 h-5" />
    return <PlaySquare className="w-5 h-5" />
  }

  const roleplays = activities.filter((a) => a.activity_type === 'roleplay')
  const lessons = activities.filter((a) => a.activity_type !== 'roleplay')

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-fade-in-up pb-12">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-[#061B3B] tracking-tight font-display mb-2">
          Meu Desempenho
        </h1>
        <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-2xl">
          Analise sua curva de aprendizado, acompanhe sua ofensiva de conhecimento e revise o
          feedback neural das suas últimas simulações.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-3xl bg-[#061B3B] text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#EAB308] opacity-20 blur-3xl rounded-full" />
          <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full min-h-[160px]">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-[#EAB308]/20 rounded-xl text-[#EAB308]">
                <Flame className="w-6 h-6" />
              </div>
              <Badge className="bg-white/10 text-white border-none font-bold text-[10px] uppercase tracking-widest backdrop-blur-sm">
                Foco Ativo
              </Badge>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Dias Seguidos
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-4xl font-black font-display leading-none">
                  {profile.current_streak}
                </h3>
                <span className="text-sm text-[#EAB308] font-bold pb-0.5 uppercase tracking-wider">
                  Ofensiva
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white flex flex-col justify-between h-full min-h-[160px]">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Zap className="w-6 h-6" />
              </div>
              <Badge
                variant="outline"
                className="text-slate-500 border-slate-200 font-bold text-[10px] uppercase"
              >
                Nível Elite
              </Badge>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Energia Total
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-4xl font-black text-[#061B3B] font-display leading-none">
                  {profile.xp_total}
                </h3>
                <span className="text-sm text-slate-500 font-bold pb-0.5 uppercase tracking-wider">
                  XP
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white flex flex-col justify-between h-full min-h-[160px]">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Target className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Última Atividade
              </p>
              <h3 className="text-xl font-bold text-[#061B3B] font-display">
                {new Date(profile.last_activity_date).toLocaleDateString()}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/60 border border-slate-100 p-1.5 h-auto rounded-xl flex w-fit mb-6 shadow-sm">
          <TabsTrigger value="overview" className="rounded-lg px-6 py-2.5 font-bold text-xs">
            Trilhas e Lições
          </TabsTrigger>
          <TabsTrigger value="lab" className="rounded-lg px-6 py-2.5 font-bold text-xs">
            Laboratório IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-fade-in">
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-display text-[#061B3B]">
                Histórico de Aprendizado
              </CardTitle>
              <CardDescription>Aulas e leituras concluídas recentemente.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {lessons.length === 0 && (
                <p className="text-slate-500 text-sm">Nenhuma lição concluída ainda.</p>
              )}
              {lessons.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    {getIconForType(act.activity_type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#061B3B] capitalize">
                      Missão: {act.activity_type}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(act.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="font-bold text-blue-600">+{act.score} XP</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lab" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roleplays.length === 0 && (
              <p className="text-slate-500 col-span-full">Nenhuma simulação concluída.</p>
            )}
            {roleplays.map((act) => (
              <Card key={act.id} className="border border-slate-100 shadow-sm rounded-2xl">
                <CardHeader className="pb-4 bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-[#061B3B] text-[#EAB308] rounded-xl">
                      <Swords className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase">
                      {new Date(act.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                  <CardTitle className="text-[#061B3B] font-bold text-base mt-4">
                    Treino de Persuasão
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Score IA
                      </p>
                      <p className="text-3xl font-black text-[#061B3B] font-display">
                        {act.score}
                        <span className="text-sm text-slate-400">/100</span>
                      </p>
                    </div>
                    <MessageSquare className="w-6 h-6 text-slate-300" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

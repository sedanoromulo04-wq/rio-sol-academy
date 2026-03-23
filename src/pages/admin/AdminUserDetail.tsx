import { useParams, Link } from 'react-router-dom'
import useAdminStore from '@/stores/useAdminStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Flame, Award, Activity, CheckCircle2 } from 'lucide-react'

export default function AdminUserDetail() {
  const { id } = useParams()
  const { sellers, progress } = useAdminStore()

  const user = sellers.find((s) => s.id === id)
  const userData = progress.find((p) => p.sellerId === id)

  if (!user || !userData) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center text-slate-400 animate-fade-in">
        Usuário não encontrado ou sem dados de progresso.
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up pb-10">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="text-slate-400 hover:text-white rounded-full shrink-0"
        >
          <Link to="/admin">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-[#EAB308] shadow-lg">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-slate-800 text-lg">U</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white font-display tracking-tight">
              {user.name}
            </h1>
            <p className="text-slate-400 text-sm">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-[#111827] border-white/10 text-white shadow-xl">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="p-3.5 bg-orange-500/20 rounded-2xl text-orange-500 shrink-0">
              <Flame className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Ofensiva Atual
              </p>
              <p className="text-3xl font-black font-display leading-none">
                {userData.streakCount} <span className="text-lg text-slate-300">Dias</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-white/10 text-white shadow-xl">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="p-3.5 bg-blue-500/20 rounded-2xl text-blue-400 shrink-0">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Nível {userData.level}
              </p>
              <p className="text-3xl font-black font-display leading-none text-[#EAB308]">
                {(userData.totalXp / 1000).toFixed(1)}k{' '}
                <span className="text-lg text-slate-300">XP</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-white/10 text-white shadow-xl">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="p-3.5 bg-emerald-500/20 rounded-2xl text-emerald-400 shrink-0">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Conclusão de Trilhas
              </p>
              <p className="text-3xl font-black font-display leading-none">
                {userData.overallProgress}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#111827] border-white/10 text-white shadow-xl">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#EAB308]" /> Histórico de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {userData.activities.length === 0 ? (
            <p className="text-slate-400 text-sm py-4 text-center">
              Nenhuma atividade recente registrada para este usuário.
            </p>
          ) : (
            <div className="space-y-4">
              {userData.activities.map((act) => (
                <div
                  key={act.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors rounded-xl border border-white/5 gap-4"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="mt-1 sm:mt-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200">{act.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        <span className="text-[#EAB308]">{act.type}</span> • {act.date}
                      </p>
                    </div>
                  </div>
                  <div className="sm:text-right pl-9 sm:pl-0">
                    <div className="text-xl font-black font-display text-white">
                      {act.score}
                      <span className="text-sm text-slate-400 ml-0.5">%</span>
                    </div>
                    <p className="text-[9px] text-emerald-400 uppercase tracking-widest mt-0.5 font-bold">
                      Performance IA
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

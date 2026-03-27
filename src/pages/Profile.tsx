import { type ChangeEvent, useMemo, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import useUserStore from '@/stores/useUserStore'
import { Camera, Medal, Target, Trophy, Upload, Zap } from 'lucide-react'

const achievements = [
  {
    id: 1,
    name: 'Primeira Venda',
    desc: 'Fechou o primeiro contrato solar.',
    icon: Trophy,
    unlocked: true,
  },
  {
    id: 2,
    name: 'Fechador Nato',
    desc: 'Taxa de conversao acima de 20% no mes.',
    icon: Zap,
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
    name: 'Veterano',
    desc: 'Alcancou consistencia nas rotinas da academia.',
    icon: Medal,
    unlocked: false,
  },
]

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Falha ao converter imagem.'))
        return
      }
      resolve(reader.result)
    }
    reader.onerror = () => reject(reader.error || new Error('Falha ao ler arquivo.'))
    reader.readAsDataURL(file)
  })

export default function Profile() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { profile, activities } = useUserStore()
  const [isSavingAvatar, setIsSavingAvatar] = useState(false)
  const avatarUrl =
    `${user?.user_metadata?.avatar_url || ''}` ||
    profile?.avatar_url ||
    `https://img.usecurling.com/ppl/medium?seed=${profile?.id || '1'}`

  const xpTotal = profile?.xp_total || 0
  const currentLevel = Math.floor(xpTotal / 1000) + 1
  const levelNames = ['Iniciante', 'Consultor Junior', 'Consultor Pleno', 'Consultor Senior', 'Arquiteto Solar']
  const currentLevelName = levelNames[Math.min(currentLevel - 1, levelNames.length - 1)]
  const nextLevelXp = currentLevel * 1000
  const progressPercent = Math.min(100, Math.floor(((xpTotal % 1000) / 1000) * 100))

  const evaluationActivities = useMemo(
    () => activities.filter((activity) => activity.activity_type === 'roleplay_feedback' || activity.activity_type === 'roleplay'),
    [activities],
  )

  const averageScore = useMemo(() => {
    if (!evaluationActivities.length) return 0
    return Math.round(
      evaluationActivities.reduce((sum, activity) => sum + (activity.score || 0), 0) / evaluationActivities.length,
    )
  }, [evaluationActivities])

  const recentActivities = useMemo(
    () => activities.slice(0, 6),
    [activities],
  )

  if (!profile) return null

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) return
    if (file.size > 2 * 1024 * 1024) return

    setIsSavingAvatar(true)
    try {
      const avatarUrl = await fileToDataUrl(file)
      const { error } = await supabase.auth.updateUser({
        data: {
          avatar_url: avatarUrl,
        },
      })
      if (error) throw error
    } finally {
      setIsSavingAvatar(false)
      event.target.value = ''
    }
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-in-up space-y-6 pb-12">
      <div className="rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(6,27,59,0.08),transparent_26%),radial-gradient(circle_at_top_right,rgba(234,179,8,0.16),transparent_20%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#d97706]">Configuracoes e desempenho</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#061B3B]">Perfil do vendedor</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Acompanhe sua evolucao, ajuste sua foto e revise os sinais mais importantes do seu desempenho dentro da RIO SOL Academy.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="border-0 bg-[#061B3B] px-3 py-1 text-white">{currentLevelName}</Badge>
            <Badge className="border border-[#eab308]/50 bg-[#fff7cc] px-3 py-1 text-[#8a5a00]">{profile.current_streak || 0} dias de ofensiva</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <Card className="overflow-hidden rounded-[2rem] border-slate-200 bg-white shadow-sm">
          <div className="h-24 bg-[linear-gradient(135deg,#061B3B_0%,#0d2b57_55%,#eab308_160%)]" />
          <CardContent className="relative -mt-10 space-y-5 p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                <AvatarImage
                  src={avatarUrl}
                />
                <AvatarFallback>{profile.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-2xl font-black text-[#061B3B]">{profile.full_name}</h2>
              <p className="mt-1 text-sm text-slate-500">{profile.email}</p>
            </div>

            <div className="grid gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSavingAvatar}
                className="h-11 rounded-xl bg-[#061B3B] text-white hover:bg-[#0a2955]"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isSavingAvatar ? 'Salvando foto...' : 'Trocar foto do perfil'}
              </Button>
              <p className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <Camera className="h-3.5 w-3.5" />
                JPG, PNG ou WEBP com ate 2 MB
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                <span>Progresso</span>
                <span className="text-[#061B3B]">{xpTotal} / {nextLevelXp} XP</span>
              </div>
              <Progress value={progressPercent} className="h-2 bg-slate-200 [&>div]:bg-[#061B3B]" />
              <p className="mt-2 text-center text-[11px] text-slate-500">
                Faltam {Math.max(nextLevelXp - xpTotal, 0)} XP para o proximo nivel
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <div className="text-3xl font-black text-[#061B3B]">{activities.length}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Atividades</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <div className="text-3xl font-black text-[#d97706]">{averageScore}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Media IA</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-[#061B3B]">Painel de desempenho</CardTitle>
              <CardDescription>
                Indicadores centrais para acompanhar sua consistencia em trilhas, simulador e rotina.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nivel atual</p>
                <p className="mt-3 text-2xl font-black text-[#061B3B]">{currentLevelName}</p>
                <p className="mt-1 text-sm text-slate-500">Baseado no seu XP acumulado.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ofensiva</p>
                <p className="mt-3 text-2xl font-black text-[#061B3B]">{profile.current_streak || 0} dias</p>
                <p className="mt-1 text-sm text-slate-500">Sequencia de atividade registrada.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ultima atividade</p>
                <p className="mt-3 text-lg font-black text-[#061B3B]">
                  {profile.last_activity_date ? new Date(profile.last_activity_date).toLocaleDateString('pt-BR') : 'Sem registro'}
                </p>
                <p className="mt-1 text-sm text-slate-500">Referencia mais recente da sua jornada.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl text-[#061B3B]">
                <Trophy className="h-5 w-5 text-[#d97706]" />
                Galeria de conquistas
              </CardTitle>
              <CardDescription>
                Medalhas e marcos da sua evolucao em vendas, trilhas e laboratorio.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`rounded-2xl border p-4 transition-all ${achievement.unlocked ? 'border-[#eab308]/30 bg-[#fff9e6]' : 'border-slate-200 bg-slate-50 opacity-70'}`}
                >
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${achievement.unlocked ? 'bg-[#061B3B] text-[#fbbf24]' : 'bg-slate-200 text-slate-400'}`}>
                    <achievement.icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-black text-[#061B3B]">{achievement.name}</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{achievement.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-[#061B3B]">Atividades recentes</CardTitle>
              <CardDescription>
                Historico rapido do que voce executou por ultimo dentro da plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  Nenhuma atividade registrada ainda.
                </div>
              )}
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-black capitalize text-[#061B3B]">
                      {activity.activity_type.replace(/_/g, ' ')}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {activity.created_at ? new Date(activity.created_at).toLocaleString('pt-BR') : 'Sem data'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="border-0 bg-white text-slate-500">
                      Score {activity.score || 0}
                    </Badge>
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

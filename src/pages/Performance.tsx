import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Flame,
  Zap,
  PlaySquare,
  BookOpen,
  MessageSquare,
  Target,
  CheckCircle2,
  ChevronRight,
  Award,
  Swords,
  BrainCircuit,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { cn } from '@/lib/utils'

const xpData = [
  { date: 'Seg', xp: 120 },
  { date: 'Ter', xp: 250 },
  { date: 'Qua', xp: 180 },
  { date: 'Qui', xp: 400 },
  { date: 'Sex', xp: 320 },
  { date: 'Sáb', xp: 550 },
  { date: 'Dom', xp: 380 },
]

const radarData = [
  { skill: 'Fechamento', score: 85 },
  { skill: 'Objeções', score: 72 },
  { skill: 'Rapport', score: 90 },
  { skill: 'Técnico', score: 65 },
  { skill: 'Resiliência', score: 80 },
]

const recentLessons = [
  { id: 1, title: 'O que é CAPEX e OPEX?', type: 'video', date: 'Hoje', progress: 100 },
  { id: 2, title: 'Estudo de Caso: Atacama', type: 'read', date: 'Ontem', progress: 100 },
  { id: 3, title: 'Ficha Técnica: Inversores', type: 'read', date: 'Há 3 dias', progress: 50 },
  { id: 4, title: 'Psicologia do Consumidor', type: 'video', date: 'Há 4 dias', progress: 100 },
]

const labSessions = [
  {
    id: 1,
    topic: 'Objeção de Preço',
    date: 'Hoje',
    score: 92,
    feedback:
      'Excelente uso do conceito de Payback e retorno de investimento. Você foi empático e assertivo. Oportunidade: explorar mais a inflação energética para gerar urgência na decisão.',
  },
  {
    id: 2,
    topic: 'Apresentação de Projeto',
    date: 'Há 2 dias',
    score: 78,
    feedback:
      'Boa explicação técnica sobre a eficiência dos painéis, mas o tom pareceu muito professoral e pouco comercial. Tente focar mais nas dores do cliente.',
  },
  {
    id: 3,
    topic: 'Fechamento de Contrato',
    date: 'Há 5 dias',
    score: 85,
    feedback:
      'A transição para a assinatura do contrato foi suave e natural. No entanto, lembre-se de reforçar as garantias de equipamento antes do push final.',
  },
]

const getGradeLetter = (score: number) => {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  return 'D'
}

export default function Performance() {
  const [activeTab, setActiveTab] = useState('overview')

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

      {/* Top Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-3xl bg-[#061B3B] text-white relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#EAB308] opacity-20 blur-3xl rounded-full" />
          <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full min-h-[160px]">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-[#EAB308]/20 rounded-xl text-[#EAB308]">
                <Flame className="w-6 h-6" />
              </div>
              <Badge className="bg-white/10 hover:bg-white/20 text-white border-none font-bold text-[10px] uppercase tracking-widest backdrop-blur-sm">
                Foco Ativo
              </Badge>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Dias Seguidos
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-4xl font-black font-display leading-none">12</h3>
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
                className="text-slate-500 border-slate-200 bg-slate-50 font-bold text-[10px] uppercase tracking-widest"
              >
                Nível 41
              </Badge>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Energia Total
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-4xl font-black text-[#061B3B] font-display leading-none">
                  12.4k
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
              <Badge
                variant="outline"
                className="text-emerald-600 border-emerald-200 bg-emerald-50 font-bold text-[10px] uppercase tracking-widest"
              >
                Em Dia
              </Badge>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2.5">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Módulos Concluídos
                  </p>
                  <h3 className="text-4xl font-black text-[#061B3B] font-display leading-none">
                    68<span className="text-2xl text-slate-400">%</span>
                  </h3>
                </div>
              </div>
              <Progress value={68} className="h-1.5 bg-slate-100 [&>div]:bg-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/60 backdrop-blur-sm border border-slate-100 p-1.5 h-auto rounded-xl flex flex-col sm:flex-row w-full sm:w-fit mb-6 shadow-sm">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-[#061B3B] data-[state=active]:text-white text-slate-500 font-bold text-xs rounded-lg px-6 py-2.5 w-full sm:w-auto transition-colors"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="lessons"
            className="data-[state=active]:bg-[#061B3B] data-[state=active]:text-white text-slate-500 font-bold text-xs rounded-lg px-6 py-2.5 w-full sm:w-auto transition-colors"
          >
            Aulas e Trilhas
          </TabsTrigger>
          <TabsTrigger
            value="lab"
            className="data-[state=active]:bg-[#061B3B] data-[state=active]:text-white text-slate-500 font-bold text-xs rounded-lg px-6 py-2.5 w-full sm:w-auto transition-colors"
          >
            Laboratório de IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm rounded-2xl bg-white col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-display text-[#061B3B]">
                  Evolução de XP (Últimos 7 Dias)
                </CardTitle>
                <CardDescription>
                  Consistência de ganho de energia através de atividades e simulações.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ xp: { label: 'XP Ganho', color: '#EAB308' } }}
                  className="h-[280px] w-full"
                >
                  <AreaChart data={xpData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillXp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-xp)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--color-xp)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748B' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748B' }}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="xp"
                      stroke="var(--color-xp)"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#fillXp)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl bg-white col-span-1">
              <CardHeader>
                <CardTitle className="text-lg font-display text-[#061B3B]">
                  Matriz de Competências
                </CardTitle>
                <CardDescription>Mapeamento de habilidades em vendas.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-2">
                <ChartContainer
                  config={{ score: { label: 'Pontuação', color: '#061B3B' } }}
                  className="h-[250px] w-full max-w-[300px] aspect-square"
                >
                  <RadarChart
                    data={radarData}
                    margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
                  >
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis
                      dataKey="skill"
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Pontuação"
                      dataKey="score"
                      stroke="var(--color-score)"
                      strokeWidth={2}
                      fill="var(--color-score)"
                      fillOpacity={0.15}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  </RadarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lessons" className="animate-fade-in space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm rounded-2xl bg-white p-5 flex items-center gap-5">
              <div className="p-4 rounded-xl bg-blue-50 text-blue-600">
                <PlaySquare className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Vídeos Assistidos
                </p>
                <p className="text-2xl font-black text-[#061B3B] font-display leading-none mt-1">
                  42 <span className="text-xs text-slate-500 font-medium">módulos</span>
                </p>
              </div>
            </Card>
            <Card className="border-none shadow-sm rounded-2xl bg-white p-5 flex items-center gap-5">
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Leituras Concluídas
                </p>
                <p className="text-2xl font-black text-[#061B3B] font-display leading-none mt-1">
                  18 <span className="text-xs text-slate-500 font-medium">artigos</span>
                </p>
              </div>
            </Card>
            <Card className="border-none shadow-sm rounded-2xl bg-white p-5 flex items-center gap-5">
              <div className="p-4 rounded-xl bg-orange-50 text-orange-600">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Certificados Emitidos
                </p>
                <p className="text-2xl font-black text-[#061B3B] font-display leading-none mt-1">
                  3 <span className="text-xs text-slate-500 font-medium">conquistas</span>
                </p>
              </div>
            </Card>
          </div>

          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-display text-[#061B3B]">
                Histórico de Aprendizado
              </CardTitle>
              <CardDescription>
                Suas últimas lições e materiais acessados na Academia.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {recentLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                        lesson.type === 'video'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-emerald-50 text-emerald-600',
                      )}
                    >
                      {lesson.type === 'video' ? (
                        <PlaySquare className="w-6 h-6" />
                      ) : (
                        <BookOpen className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#061B3B] text-sm md:text-base leading-tight">
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span className="capitalize font-medium">
                          {lesson.type === 'video' ? 'Vídeo Aula' : 'Pílula de Leitura'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>{lesson.date}</span>
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-48 shrink-0">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      <span>Progresso</span>
                      <span
                        className={lesson.progress === 100 ? 'text-emerald-500' : 'text-[#EAB308]'}
                      >
                        {lesson.progress}%
                      </span>
                    </div>
                    <Progress
                      value={lesson.progress}
                      className={cn(
                        'h-1.5 bg-slate-100',
                        lesson.progress === 100 ? '[&>div]:bg-emerald-500' : '[&>div]:bg-[#EAB308]',
                      )}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lab" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labSessions.map((session) => (
              <Card
                key={session.id}
                className="border border-slate-100 shadow-sm rounded-2xl bg-white flex flex-col hover:shadow-md transition-all duration-300"
              >
                <CardHeader className="pb-4 border-b border-slate-50 mb-4 bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-[#061B3B] text-[#EAB308] rounded-xl shadow-sm">
                      <Swords className="w-5 h-5" />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-slate-500 font-bold bg-white text-[9px] uppercase tracking-widest px-2 py-0.5 shadow-sm"
                    >
                      {session.date}
                    </Badge>
                  </div>
                  <CardTitle className="text-[#061B3B] font-bold text-base mt-4 leading-snug">
                    {session.topic}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-end mb-6">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Score de Simulação
                      </p>
                      <p className="text-3xl font-black text-[#061B3B] font-display leading-none">
                        {session.score}
                        <span className="text-sm text-slate-400 font-medium ml-1">/100</span>
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full border-4 border-[#061B3B] flex items-center justify-center text-sm font-black text-[#061B3B]">
                      {getGradeLetter(session.score)}
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full text-[#061B3B] border-slate-200 hover:bg-slate-50 hover:text-[#061B3B] font-bold h-11 text-xs"
                      >
                        Ver Feedback da IA <ChevronRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] bg-white border-none shadow-2xl p-0 overflow-hidden rounded-3xl">
                      <div className="bg-[#061B3B] p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                          <BrainCircuit className="w-32 h-32 text-white" />
                        </div>
                        <DialogHeader className="relative z-10">
                          <DialogTitle className="text-2xl font-black text-white font-display flex items-center gap-2 mb-1">
                            <MessageSquare className="w-6 h-6 text-[#EAB308]" /> Análise da IA
                          </DialogTitle>
                          <DialogDescription className="text-slate-300 font-medium">
                            Simulação: <strong className="text-white">{session.topic}</strong>
                          </DialogDescription>
                        </DialogHeader>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-5">
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            Performance Final
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-2xl font-black text-[#061B3B] leading-none">
                              {session.score}%
                            </div>
                            <Progress
                              value={session.score}
                              className="h-2 w-24 bg-slate-100 [&>div]:bg-[#EAB308]"
                            />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-[#061B3B] uppercase tracking-widest mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Síntese do Mentor
                          </h4>
                          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
                            {session.feedback}
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

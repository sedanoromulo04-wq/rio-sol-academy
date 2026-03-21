import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Wrench, Brain, Mic2 } from 'lucide-react'

const paths = [
  {
    id: 1,
    title: 'Cultura RIO SOL',
    description: 'Nossa história, missão e valores. O DNA do nosso vendedor.',
    icon: BookOpen,
    progress: 100,
    color: 'from-blue-600 to-blue-900',
    tags: ['Básico', 'Obrigatório'],
  },
  {
    id: 2,
    title: 'Técnico Solar',
    description: 'Domine inversores, painéis, regulamentação e dimensionamento.',
    icon: Wrench,
    progress: 45,
    color: 'from-orange-500 to-orange-800',
    tags: ['Intermediário', 'Certificação'],
  },
  {
    id: 3,
    title: 'Psicologia de Vendas',
    description: 'Gatilhos mentais, PNL e leitura de perfil de cliente.',
    icon: Brain,
    progress: 10,
    color: 'from-purple-500 to-purple-800',
    tags: ['Avançado', 'Estratégia'],
  },
  {
    id: 4,
    title: 'Prática & Roleplay',
    description: 'Simulações de vendas com IA e análise de ligações reais.',
    icon: Mic2,
    progress: 0,
    color: 'from-emerald-500 to-emerald-800',
    tags: ['Prático', 'Simulador'],
  },
]

export default function Paths() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Trilhas de Conhecimento
          </h1>
          <p className="text-muted-foreground">
            Escolha um caminho e expanda seu arsenal de vendas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paths.map((path, idx) => (
          <Link to={`/trilhas/${path.id}/lesson/1`} key={path.id}>
            <Card className="glass-panel border-white/5 hover:border-primary/50 transition-all hover:scale-[1.01] overflow-hidden group h-full flex flex-col cursor-pointer">
              <div className={`h-2 w-full bg-gradient-to-r ${path.color}`} />
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div
                    className={`p-3 rounded-xl bg-slate-800 group-hover:bg-slate-700 transition-colors`}
                  >
                    <path.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex gap-2">
                    {path.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-slate-800 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {path.title}
                </CardTitle>
                <CardDescription className="text-sm mt-2">{path.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">Progresso</span>
                    <span className={path.progress === 100 ? 'text-green-400' : 'text-primary'}>
                      {path.progress}%
                    </span>
                  </div>
                  <Progress
                    value={path.progress}
                    className={`h-2 ${path.progress === 100 ? '[&>div]:bg-green-500' : ''}`}
                  />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

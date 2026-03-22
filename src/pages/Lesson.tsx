import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Play, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function Lesson() {
  const [reflectionState, setReflectionState] = useState<'idle' | 'simulating' | 'feedback'>('idle')
  const [reflectionText, setReflectionText] = useState('')

  const handleSimulate = () => {
    if (!reflectionText.trim()) return
    setReflectionState('simulating')
    setTimeout(() => {
      setReflectionState('feedback')
    }, 2500)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up pb-16">
      <Link
        to="/trilhas"
        className="inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Voltar para Trilhas
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <Badge className="mb-2 bg-orange-500/20 text-orange-500 border-none text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
            Módulo 3 • Aula 2
          </Badge>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-white leading-tight">
            Lidando com objeções de preço e ROI
          </h1>
        </div>
      </div>

      <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-white/10 shadow-lg group flex items-center justify-center">
        <img
          src="https://img.usecurling.com/p/1280/720?q=solar%20panel%20presentation&color=blue"
          alt="Video cover"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />
        <Button
          size="icon"
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground hover:scale-110 transition-transform relative z-10 shadow-lg"
        >
          <Play className="w-6 h-6 ml-1" fill="currentColor" />
        </Button>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="w-full justify-start bg-transparent border-b border-white/10 rounded-none h-auto p-0 space-x-6">
          <TabsTrigger
            value="content"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 text-sm font-medium"
          >
            Conteúdo da Aula
          </TabsTrigger>
          <TabsTrigger
            value="reflection"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 text-sm font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
            Reflexão IA
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="content"
          className="py-6 space-y-4 text-slate-300 text-sm leading-relaxed"
        >
          <p>
            Nesta aula, exploramos a diferença entre "Preço" e "Valor". Quando um cliente diz que a
            energia solar é muito cara, ele geralmente está olhando apenas para o custo inicial
            (CAPEX) e não para a economia a longo prazo (OPEX).
          </p>
          <h3 className="text-lg font-semibold text-white mt-6 mb-2">Principais Tópicos:</h3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Como apresentar o Payback (Tempo de retorno do investimento).</li>
            <li>O impacto da inflação energética nos próximos 10 anos.</li>
            <li>
              Gatilhos mentais de segurança: "Você prefere alugar sua energia para sempre ou ser
              dono dela?"
            </li>
          </ul>
        </TabsContent>

        <TabsContent value="reflection" className="py-6">
          <Card className="glass-panel border-primary/20 bg-primary/5 rounded-2xl">
            <CardContent className="p-5 sm:p-6">
              {reflectionState === 'idle' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2.5 bg-primary/20 rounded-full text-primary mt-1">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Cenário Dinâmico</h3>
                      <p className="text-slate-300 mt-1 text-sm leading-relaxed">
                        O cliente diz: "Olha, eu entendi os benefícios, mas R$ 35.000,00 é muito
                        dinheiro agora. Acho que vou deixar para o ano que vem."
                        <br />
                        <br />
                        <strong>
                          Como você responderia a essa objeção usando os conceitos aprendidos?
                        </strong>
                      </p>
                    </div>
                  </div>

                  <Textarea
                    placeholder="Digite sua resposta aqui..."
                    className="min-h-[120px] bg-background border-white/10 focus-visible:ring-primary text-sm p-4 rounded-xl resize-none"
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleSimulate} disabled={!reflectionText.trim()} size="sm">
                      Enviar para Análise IA
                    </Button>
                  </div>
                </div>
              )}

              {reflectionState === 'simulating' && (
                <div className="space-y-5 py-4 animate-fade-in">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span className="text-sm font-medium animate-pulse">
                      A IA está analisando sua resposta...
                    </span>
                  </div>
                  <Skeleton className="h-3 w-full bg-slate-800 rounded" />
                  <Skeleton className="h-3 w-[90%] bg-slate-800 rounded" />
                  <Skeleton className="h-3 w-[95%] bg-slate-800 rounded" />
                  <Skeleton className="h-3 w-[60%] bg-slate-800 rounded" />
                </div>
              )}

              {reflectionState === 'feedback' && (
                <div className="space-y-5 animate-fade-in-up">
                  <div className="flex justify-between items-start border-b border-white/10 pb-5">
                    <div>
                      <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" /> Feedback Concluído
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Você ganhou <span className="text-primary font-bold">+50 XP</span> por esta
                        reflexão.
                      </p>
                    </div>
                    <div className="text-center bg-slate-800 p-2.5 rounded-lg border border-white/5">
                      <div className="text-xl font-bold text-primary leading-none">8.5</div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">
                        Nota IA
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-green-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pontos Fortes
                      </h4>
                      <p className="text-xs text-slate-300 bg-green-500/10 p-3 rounded-lg border border-green-500/20 leading-relaxed">
                        Você identificou corretamente o medo da descapitalização e usou o conceito
                        de Payback muito bem. A transição para mostrar que o dinheiro investido
                        volta para ele foi clara e empática.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-orange-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Oportunidade de Melhoria
                      </h4>
                      <p className="text-xs text-slate-300 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20 leading-relaxed">
                        Você poderia ter adicionado o fator "Inflação Energética". Quando ele diz
                        "deixar para o ano que vem", lembre-o que a conta de luz continuará subindo
                        nesse período, custando dinheiro que não tem retorno.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setReflectionState('idle')
                        setReflectionText('')
                      }}
                    >
                      Tentar Novamente
                    </Button>
                    <Button size="sm" className="text-xs" asChild>
                      <Link to="/trilhas">Próxima Aula</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
